/*
  Background.js
  - Entidade responsável por desenhar e deslocar o fundo (tile vertical) e o campo estelar.
  - Para a variante "starfield" gera estrelas procedurais que piscam aleatoriamente,
    variando tamanho e intensidade, e se deslocam verticalmente com o mesmo `velocidade`.
*/
import Entity from "./Entity.js";
import { assets } from "../engine/Assets.js";

export default class Background extends Entity {
  constructor(variante, context, width, height) {
    super();
    this.context = context;
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.y = 0;
    this.stars = null;
    this.tick = 0;

    if (variante === "background") {
      this.velocidade = 1;
      this.image = assets.images.background;
    } else if (variante === "starfield") {
      this.velocidade = 2;
      this.image = null; // não usamos imagem para starfield
      this._initStars();
    }
    this.init(0, 0, width, height);
  }

  // Gera um conjunto de estrelas com propriedades aleatórias: posição, tamanho, brilho e velocidade de "twinkle"
  _initStars() {
    const area = this.canvasWidth * this.canvasHeight;
    const count = Math.max(40, Math.min(1000, Math.round(area / 6000)));
    this.stars = new Array(count);
    for (let i = 0; i < count; i++) {
      this.stars[i] = {
        x: Math.random() * this.canvasWidth,
        y: Math.random() * this.canvasHeight,
        size: Math.random() * 1.8 + 0.3,
        baseAlpha: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.08 + 0.01,
        twinkleAmp: Math.random() * 0.6 + 0.1,
        phase: Math.random() * Math.PI * 2,
      };
    }
  }

  // Optional: permitir regenerar ao redimensionar canvas
  resize(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    if (this.stars) this._initStars();
  }

  // Desenha: se existe uma imagem usa tile vertical; caso contrário desenha estrelas procedurais
  // Aceita um array opcional de `maskRects` ({x,y,width,height}) para evitar desenhar halos
  // sobre tiros ou a nave (útil quando as camadas de canvas podem sobrepor-se).
  // Starfield procedural: atualiza posição e brilho (twinkle) de cada estrela
  draw(maskRects = []) {
    if (this.image) {
      this.y += this.velocidade;
      this.context.drawImage(
        this.image,
        0,
        this.y,
        this.canvasWidth,
        this.canvasHeight,
      );
      this.context.drawImage(
        this.image,
        0,
        this.y - this.canvasHeight,
        this.canvasWidth,
        this.canvasHeight,
      );
      if (this.y >= this.canvasHeight) this.y = 0;
      return;
    }

    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    if (!this.stars) return;
    this.tick++;
    const ctx = this.context;

    // Helper: testa interseção círculo-retângulo (usado para máscara de tiros/nave)
    const rectCircleIntersect = (rx, ry, rw, rh, cx, cy, r) => {
      const closestX = Math.max(rx, Math.min(cx, rx + rw));
      const closestY = Math.max(ry, Math.min(cy, ry + rh));
      const dx = cx - closestX;
      const dy = cy - closestY;
      return dx * dx + dy * dy <= r * r;
    };

    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      s.y += this.velocidade;
      if (s.y >= this.canvasHeight) s.y -= this.canvasHeight;

      const alpha = Math.max(
        0,
        Math.min(
          1,
          s.baseAlpha +
            Math.sin(this.tick * s.twinkleSpeed + s.phase) * s.twinkleAmp,
        ),
      );

      // Calcula raio de influência do halo (usado para decidir se afeta um tiro)
      const haloRadius = Math.max(1, s.size * 5 * alpha);

      // Verifica se a estrela (incluindo halo) intersecta alguma máscara (tiro/nave)
      let intersectsMask = false;
      for (let m = 0; m < maskRects.length; m++) {
        const r = maskRects[m];
        if (
          rectCircleIntersect(r.x, r.y, r.width, r.height, s.x, s.y, haloRadius)
        ) {
          intersectsMask = true;
          break;
        }
      }

      ctx.fillStyle = "#ffffff";

      if (intersectsMask) {
        // Quando intersecta um tiro/nave: desenha a estrela sem halo e com alpha reduzido
        ctx.globalAlpha = Math.min(alpha, 0.35);
        ctx.shadowBlur = 0;
        if (s.size <= 1.2) {
          ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
        } else {
          ctx.beginPath();
          ctx.arc(s.x, s.y, Math.max(0.6, s.size * 0.6), 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Desenho normal com halo
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = s.size * 5 * alpha;
        ctx.shadowColor = "#ffffff";
        if (s.size <= 1.2) {
          ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
        } else {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }
    }
    ctx.globalAlpha = 1;
  }
}

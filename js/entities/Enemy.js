// js/entities/Enemy.js
import Entity from "./Entity.js";
import { assets } from "../engine/Assets.js";

export default class Enemy extends Entity {
  constructor(game) {
    super();
    this.game = game;
    this.context = game.mainContext;
    this.canvasWidth = game.mainCanvas.width;
    this.canvasHeight = game.mainCanvas.height;
    this.grupoColisao = "bullet";
    this.tipo = "enemy";
    this.init(0, 0, 32, 32);
  }

  spawn(x, y, velocidade, infoTipo) {
    this.baseX = infoTipo[0];
    this.baseY = infoTipo[1];
    this.tipoInimigo = infoTipo[2] || 1;
    this.hp = infoTipo[3] || 1;

    if (this.tipoInimigo === 1) {
      this.img = assets.images.enemy;
      this.width = 32;
      this.height = 32;
    } else if (this.tipoInimigo === 2) {
      this.img = assets.images.enemyFast;
      this.width = 24;
      this.height = 24;
    } else if (this.tipoInimigo === 3) {
      this.img = assets.images.enemyTough;
      this.width = 48;
      this.height = 48;
    }

    this.x = this.game.formacaoX + this.baseX;
    this.y = this.game.formacaoY + this.baseY;
    this.vivo = true;
    this.estado = "idle";
    this.swoopT = 0;
  }

  draw() {
    this.context.clearRect(
      this.x - 2,
      this.y - 2,
      this.width + 4,
      this.height + 4,
    );

    if (!this.colidindo) {
      // 1. TRAVA ABSOLUTA DE APRESENTAÇÃO: Enquanto o título estiver na tela, eles SÓ ficam parados.
      if (this.game.timerApresentacaoFase > 0) {
        this.x = this.game.formacaoX + this.baseX;
        this.y = this.game.formacaoY + this.baseY;
        if (this.img)
          this.context.drawImage(
            this.img,
            this.x,
            this.y,
            this.width,
            this.height,
          );
        return false;
      }

      // 2. LÓGICA NORMAL (Só executa quando o nome da fase some)
      if (this.estado === "idle") {
        this.x = this.game.formacaoX + this.baseX;
        this.y = this.game.formacaoY + this.baseY;

        const chanceRasante = this.tipoInimigo === 2 ? 0.001 : 0.0002;
        if (
          Math.random() < chanceRasante &&
          this.y > 0 &&
          this.game.nave.vivo
        ) {
          this.estado = "swoop";
          this.swoopT = 0;
          this.pontosBezier = [
            { x: this.x, y: this.y },
            { x: this.x + (Math.random() > 0.5 ? 250 : -250), y: this.y + 150 },
            { x: this.game.nave.x, y: this.game.naveStartY - 100 },
            { x: this.game.nave.x, y: this.game.naveStartY - 20 },
          ];
        }
      } else if (this.estado === "swoop") {
        this.swoopT += this.tipoInimigo === 2 ? 0.015 : 0.01;
        const t = this.swoopT;

        if (t >= 1) {
          this.estado = "return";
        } else {
          const u = 1 - t,
            tt = t * t,
            uu = u * u,
            uuu = uu * u,
            ttt = tt * t,
            p = this.pontosBezier;
          this.x =
            uuu * p[0].x +
            3 * uu * t * p[1].x +
            3 * u * tt * p[2].x +
            ttt * p[3].x;
          this.y =
            uuu * p[0].y +
            3 * uu * t * p[1].y +
            3 * u * tt * p[2].y +
            ttt * p[3].y;
        }
      } else if (this.estado === "return") {
        const alvoX = this.game.formacaoX + this.baseX;
        const alvoY = this.game.formacaoY + this.baseY;
        const dx = alvoX - this.x,
          dy = alvoY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) this.estado = "idle";
        else {
          this.x += (dx / dist) * 4;
          this.y += (dy / dist) * 4;
        }
      }

      if (this.img)
        this.context.drawImage(
          this.img,
          this.x,
          this.y,
          this.width,
          this.height,
        );

      const mod = this.game.timerLentidao > 0 ? 0.5 : 1;
      if (Math.random() < this.game.configNivelAtual.fireRate * mod)
        this.atirar();

      return false;
    } else {
      // 3. MORTE DO INIMIGO
      this.hp--;
      if (this.hp <= 0) {
        this.game.criarExplosao(this.x, this.y);
        const pts = this.tipoInimigo * 10 + Math.floor(this.y / 15);
        if (!this.game.isMenuDemo) this.game.pontuacaoJogador += pts;

        if (Math.random() < 0.1 && !this.game.isMenuDemo) {
          const tipos = ["multi", "slow", "bomb"];
          if (this.game.vidasJogador < 3) {
            tipos.push("life", "life");
          }
          const drop = tipos[Math.floor(Math.random() * tipos.length)];
          this.game.poolItens.get(
            this.x + this.width / 2 - 12,
            this.y,
            [0, -2],
            drop,
          );
        }
        if (!this.game.isMenuDemo) this.game.explosionSound.get();
        return true;
      }
      this.colidindo = false;
      return false;
    }
  }

  atirar() {
    this.game.poolTirosInimigos.get(
      this.x + this.width / 2 - 4,
      this.y + this.height,
      [0, -2.9],
    );
  }

  clear() {
    this.vivo = false;
    this.colidindo = false;
    this.estado = "idle";
  }
}

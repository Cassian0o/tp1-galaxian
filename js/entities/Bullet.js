/*
  Bullet.js
  - Representa projéteis (do jogador ou inimigos).
  - `variante` define o comportamento/colisão (ex: 'bullet' colide com 'enemy').
*/
import Entity from "./Entity.js";
import { assets } from "../engine/Assets.js";

export default class Bullet extends Entity {
  constructor({ variante, context, width, height }) {
    super();
    this.context = context;
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.variante = variante;
    this.vivo = false;
    this.tipo = variante;
    this.grupoColisao = variante === "bullet" ? "enemy" : "ship";

    const img = assets.images[variante];
    this.init(0, 0, img ? img.width : 5, img ? img.height : 10);
  }

  spawn(x, y, velocidade) {
    this.x = x;
    this.y = y;
    this.velocidadeX = velocidade[0];
    this.velocidadeY = velocidade[1];
    this.vivo = true;
  }

  draw() {
    this.context.clearRect(
      this.x - 1,
      this.y - 1,
      this.width + 2,
      this.height + 2,
    );
    this.y -= this.velocidadeY;
    this.x -= -this.velocidadeX;

    if (this.colidindo) return true;
    if (this.variante === "bullet" && this.y <= -this.height) return true;
    if (this.variante === "enemyBullet" && this.y >= this.canvasHeight)
      return true;

    const img = assets.images[this.variante];
    if (img) this.context.drawImage(img, this.x, this.y);
    return false;
  }

  clear() {
    this.x = 0;
    this.y = 0;
    this.vivo = false;
    this.colidindo = false;
  }
}

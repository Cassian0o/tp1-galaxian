/*
  Item.js
  - Representa power-ups/drop de itens que a nave pode coletar.
  - Ao colidir, aplica o efeito correspondente (tiro múltiplo, lentidão, bomba, vidas).
*/
import Entity from "./Entity.js";
import { assets } from "../engine/Assets.js";

export default class Item extends Entity {
  constructor(game) {
    super();
    this.game = game;
    this.context = game.mainContext;
    this.canvasWidth = game.mainCanvas.width;
    this.canvasHeight = game.mainCanvas.height;
    this.grupoColisao = "ship";
    this.tipo = "item";
    this.init(0, 0, 24, 24);
  }

  spawn(x, y, velocidade, tipoItem) {
    this.x = x;
    this.y = y;
    this.velocidadeY = velocidade[1];
    this.tipoItem = tipoItem;
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

    if (this.colidindo) {
      if (this.tipoItem === "multi") this.game.nave.timerTiroMultiplo = 600;
      if (this.tipoItem === "slow") this.game.timerLentidao = 300;
      if (this.tipoItem === "bomb") this.game.acionarBomba();
      if (this.tipoItem === "life" && this.game.vidasJogador < 3) {
        this.game.vidasJogador++;
        this.game.atualizarHUDVidas();
      }
      this.game.pontuacaoJogador += 50;
      return true;
    } else if (this.y >= this.canvasHeight) {
      return true;
    } else {
      const imap = {
        multi: "itemMulti",
        slow: "itemSlow",
        bomb: "itemBomb",
        life: "itemLife",
      };
      const img = assets.images[imap[this.tipoItem]];
      if (img)
        this.context.drawImage(img, this.x, this.y, this.width, this.height);
      return false;
    }
  }

  clear() {
    this.vivo = false;
    this.colidindo = false;
  }
}

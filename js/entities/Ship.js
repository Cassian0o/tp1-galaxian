// js/entities/Ship.js
import Entity from "./Entity.js";
import { input } from "../engine/Input.js";
import { assets } from "../engine/Assets.js";
import { ObjectPool } from "../engine/Pool.js";
import Bullet from "./Bullet.js";

export default class Ship extends Entity {
  constructor(game) {
    super();
    this.game = game;
    this.context = game.shipContext;
    this.canvasWidth = game.shipCanvas.width;
    this.canvasHeight = game.shipCanvas.height;
    this.velocidade = 4;

    this.poolDeTiros = new ObjectPool(60, Bullet, {
      variante: "bullet",
      context: game.mainContext,
      width: game.mainCanvas.width,
      height: game.mainCanvas.height,
    });

    this.taxaDeTiro = 15;
    this.contador = 0;
    this.grupoColisao = "enemyBullet";
    this.tipo = "ship";
    this.timerTiroMultiplo = 0;

    const img = assets.images.spaceship;
    this.init(
      this.canvasWidth / 2 - img.width / 2,
      this.canvasHeight - img.height - 20,
      img.width,
      img.height,
    );
    this.vivo = true;
  }

  draw() {
    this.context.drawImage(assets.images.spaceship, this.x, this.y);
  }

  move() {
    this.contador++;
    if (this.timerTiroMultiplo > 0) this.timerTiroMultiplo--;

    if (this.game.isMenuDemo) {
      this.context.clearRect(this.x, this.y, this.width, this.height);
      this.x =
        this.canvasWidth / 2 -
        this.width / 2 +
        Math.sin(Date.now() / 400) * (this.canvasWidth / 3);
      if (this.contador >= this.taxaDeTiro / 2) {
        this.atirar();
        this.contador = 0;
      }
    } else {
      if (input.keys.left || input.keys.right) {
        this.context.clearRect(this.x, this.y, this.width, this.height);
        if (input.keys.left) this.x = Math.max(0, this.x - this.velocidade);
        else if (input.keys.right)
          this.x = Math.min(
            this.canvasWidth - this.width,
            this.x + this.velocidade,
          );
      }

      // SÓ DEIXA ATIRAR SE A FASE JÁ TIVER COMEÇADO DE VERDADE
      if (
        input.keys.space &&
        this.contador >= this.taxaDeTiro &&
        !this.colidindo
      ) {
        if (this.game.timerApresentacaoFase <= 0) {
          this.atirar();
          this.contador = 0;
        }
      }
    }

    if (!this.colidindo || this.game.isMenuDemo) {
      this.colidindo = false;
      this.draw();
    } else {
      this.hit();
    }
  }

  atirar() {
    if (this.timerTiroMultiplo > 0 || this.game.isMenuDemo) {
      this.poolDeTiros.get(this.x + this.width / 2 - 3, this.y, [0, 6]);
      this.poolDeTiros.get(this.x, this.y + 10, [1, 5]);
      this.poolDeTiros.get(this.x + this.width - 6, this.y + 10, [-1, 5]);
    } else {
      this.poolDeTiros.get(this.x + this.width / 2 - 3, this.y, [0, 6]);
    }
    if (!this.game.isMenuDemo) this.game.laserSound.get();
  }

  hit() {
    this.game.criarExplosao(this.x, this.y);
    if (!this.game.isMenuDemo) this.game.explosionSound.get();
    this.game.vidasJogador -= 1;
    this.game.atualizarHUDVidas();

    if (this.game.vidasJogador <= 0) {
      this.vivo = false;
      this.context.clearRect(this.x, this.y, this.width, this.height);
      this.game.gameOver("Destruído por forças inimigas!");
    } else {
      this.colidindo = false;
      this.timerTiroMultiplo = 0;
      this.context.clearRect(this.x, this.y, this.width, this.height);
      this.x = this.game.naveStartX;
      this.y = this.game.naveStartY;
      this.game.mainContext.clearRect(
        0,
        0,
        this.game.mainCanvas.width,
        this.game.mainCanvas.height,
      );
    }
  }
}

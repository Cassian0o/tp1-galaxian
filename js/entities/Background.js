// js/entities/Background.js
import Entity from "./Entity.js";
import { assets } from "../engine/Assets.js";

export default class Background extends Entity {
  constructor(variante, context, width, height) {
    super();
    this.context = context;
    this.canvasWidth = width;
    this.canvasHeight = height;

    if (variante === "background") {
      this.velocidade = 1;
      this.image = assets.images.background;
    } else if (variante === "starfield") {
      this.velocidade = 2;
      this.image = assets.images.stars;
    }
    this.init(0, 0, width, height);
  }

  draw() {
    this.y += this.velocidade;
    if (this.image) {
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
    }
    if (this.y >= this.canvasHeight) this.y = 0;
  }
}

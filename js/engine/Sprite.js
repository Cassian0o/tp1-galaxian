// js/engine/Sprite.js
import { assets } from "./Assets.js";

export default class Sprite {
  constructor(imgKey, pos, size, speed, quadros, dir, once) {
    this.pos = pos;
    this.size = size;
    this.speed = typeof speed === "number" ? speed : 0;
    this.quadros = quadros;
    this._index = 0;
    this.imgKey = imgKey;
    this.dir = dir || "horizontal";
    this.once = once;
    this.contador = 0;
    this.done = false;
  }

  update(dt) {
    this.contador++;
    if (this.contador >= 3) {
      this._index++;
      this.contador = 0;
    }
  }

  render(canvasx, canvasy, ctx) {
    let quadro = 0;
    if (this.speed > 0) {
      const max = this.quadros.length;
      const idx = Math.floor(this._index);
      quadro = this.quadros[idx % max];
      if (this.once && idx >= max) {
        this.done = true;
        return;
      }
    }

    let x = this.pos[0];
    let y = this.pos[1];
    if (this.dir === "vertical") y += quadro * this.size[1];
    else x += quadro * this.size[0];

    const img = assets.images[this.imgKey];
    if (img) {
      ctx.drawImage(
        img,
        x,
        y,
        this.size[0],
        this.size[1],
        canvasx,
        canvasy,
        this.size[0],
        this.size[1],
      );
    }
  }
}

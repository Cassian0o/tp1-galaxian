// sprite.js
function Sprite(url, pos, size, speed, quadros, dir, once) {
  this.pos = pos;
  this.size = size;
  this.speed = typeof speed === "number" ? speed : 0;
  this.quadros = quadros;
  this._index = 0;
  this.url = url;
  this.dir = dir || "horizontal";
  this.once = once;
  this.contador = 0;
}

Sprite.prototype.update = function (dt) {
  this.contador++;
  if (this.contador >= 3) {
    this._index++;
    this.contador = 0;
  }
};

Sprite.prototype.render = function (canvasx, canvasy, ctx) {
  var quadro;

  if (this.speed > 0) {
    var max = this.quadros.length;
    var idx = Math.floor(this._index);
    quadro = this.quadros[idx % max];

    if (this.once && idx >= max) {
      this.done = true;
      return;
    }
  } else {
    quadro = 0;
  }

  var x = this.pos[0];
  var y = this.pos[1];

  if (this.dir == "vertical") {
    y += quadro * this.size[1];
  } else {
    x += quadro * this.size[0];
  }

  ctx.drawImage(
    repositorioImagens.explosion,
    x,
    y,
    this.size[0],
    this.size[1],
    canvasx,
    canvasy,
    this.size[0],
    this.size[1],
  );
};

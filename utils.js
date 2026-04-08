// utils.js
window.requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback, element) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

var repositorioImagens = new (function () {
  this.background = new Image();
  this.stars = new Image();
  this.spaceship = new Image();
  this.bullet = new Image();
  this.enemy = new Image();
  this.enemyFast = new Image();
  this.enemyTough = new Image();
  this.enemyBullet = new Image();
  this.explosion = new Image();

  this.itemMulti = new Image();
  this.itemSlow = new Image();
  this.itemBomb = new Image();
  this.itemLife = new Image();

  var numImagens = 12;
  var numCarregadas = 0;

  function imagemCarregada() {
    numCarregadas++;
    if (numCarregadas === numImagens) {
      window.init();
    }
  }

  this.background.onload = imagemCarregada;
  this.stars.onload = imagemCarregada;
  this.spaceship.onload = imagemCarregada;
  this.bullet.onload = imagemCarregada;
  this.enemy.onload = imagemCarregada;
  this.enemyFast.onload = imagemCarregada;
  this.enemyTough.onload = imagemCarregada;
  this.enemyBullet.onload = imagemCarregada;
  this.explosion.onload = imagemCarregada;
  this.itemMulti.onload = imagemCarregada;
  this.itemSlow.onload = imagemCarregada;
  this.itemBomb.onload = imagemCarregada;
  this.itemLife.onload = imagemCarregada;

  var lidarFallback = function (e) {
    imagemCarregada();
  };
  this.enemyFast.onerror = lidarFallback;
  this.enemyTough.onerror = lidarFallback;
  this.itemMulti.onerror = lidarFallback;
  this.itemSlow.onerror = lidarFallback;
  this.itemBomb.onerror = lidarFallback;
  this.itemLife.onerror = lidarFallback;

  this.background.src = "images/bg.png";
  this.stars.src = "images/starfield.png";
  this.spaceship.src = "images/ship2.png";
  this.bullet.src = "images/bullet.png";
  this.enemy.src = "images/enemy.png";
  this.enemyFast.src = "images/enemy_fast.png";
  this.enemyTough.src = "images/enemy_tough.png";
  this.enemyBullet.src = "images/bullet_enemy.png";
  this.explosion.src = "images/explosion.png";
  this.itemMulti.src = "images/item_multi.png";
  this.itemSlow.src = "images/item_slow.png";
  this.itemBomb.src = "images/item_bomb.png";
  this.itemLife.src = "images/item_life.png";
})();

function QuadTree(boundBox, lvl) {
  var maxObjetos = 10;
  this.limites = boundBox || { x: 0, y: 0, width: 0, height: 0 };
  var objetos = [];
  this.nodes = [];
  var nivel = lvl || 0;
  var maxNiveis = 5;

  this.clear = function () {
    objetos = [];
    for (var i = 0; i < this.nodes.length; i++) this.nodes[i].clear();
    this.nodes = [];
  };

  this.getAllObjects = function (objetosRetornados) {
    for (var i = 0; i < this.nodes.length; i++)
      this.nodes[i].getAllObjects(objetosRetornados);
    for (var i = 0, len = objetos.length; i < len; i++)
      objetosRetornados.push(objetos[i]);
    return objetosRetornados;
  };

  this.findObjects = function (objetosRetornados, obj) {
    if (typeof obj === "undefined") return;
    var indice = this.getIndex(obj);
    if (indice != -1 && this.nodes.length)
      this.nodes[indice].findObjects(objetosRetornados, obj);
    for (var i = 0, len = objetos.length; i < len; i++)
      objetosRetornados.push(objetos[i]);
    return objetosRetornados;
  };

  this.insert = function (obj) {
    if (typeof obj === "undefined") return;
    if (obj instanceof Array) {
      for (var i = 0, len = obj.length; i < len; i++) this.insert(obj[i]);
      return;
    }
    if (this.nodes.length) {
      var indice = this.getIndex(obj);
      if (indice != -1) {
        this.nodes[indice].insert(obj);
        return;
      }
    }
    objetos.push(obj);
    if (objetos.length > maxObjetos && nivel < maxNiveis) {
      if (this.nodes[0] == null) this.split();
      var i = 0;
      while (i < objetos.length) {
        var indice = this.getIndex(objetos[i]);
        if (indice != -1) this.nodes[indice].insert(objetos.splice(i, 1)[0]);
        else i++;
      }
    }
  };

  this.getIndex = function (obj) {
    var indice = -1;
    var pontoMedioVertical = this.limites.x + this.limites.width / 2;
    var pontoMedioHorizontal = this.limites.y + this.limites.height / 2;
    var quadranteSuperior =
      obj.y < pontoMedioHorizontal && obj.y + obj.height < pontoMedioHorizontal;
    var quadranteInferior = obj.y > pontoMedioHorizontal;
    if (obj.x < pontoMedioVertical && obj.x + obj.width < pontoMedioVertical) {
      if (quadranteSuperior) indice = 1;
      else if (quadranteInferior) indice = 2;
    } else if (obj.x > pontoMedioVertical) {
      if (quadranteSuperior) indice = 0;
      else if (quadranteInferior) indice = 3;
    }
    return indice;
  };

  this.split = function () {
    var subLargura = (this.limites.width / 2) | 0;
    var subAltura = (this.limites.height / 2) | 0;
    this.nodes[0] = new QuadTree(
      {
        x: this.limites.x + subLargura,
        y: this.limites.y,
        width: subLargura,
        height: subAltura,
      },
      nivel + 1,
    );
    this.nodes[1] = new QuadTree(
      {
        x: this.limites.x,
        y: this.limites.y,
        width: subLargura,
        height: subAltura,
      },
      nivel + 1,
    );
    this.nodes[2] = new QuadTree(
      {
        x: this.limites.x,
        y: this.limites.y + subAltura,
        width: subLargura,
        height: subAltura,
      },
      nivel + 1,
    );
    this.nodes[3] = new QuadTree(
      {
        x: this.limites.x + subLargura,
        y: this.limites.y + subAltura,
        width: subLargura,
        height: subAltura,
      },
      nivel + 1,
    );
  };
}

function PoolDeObjetos(tamanhoMax) {
  var tamanho = tamanhoMax;
  var pool = [];

  this.getPool = function () {
    var obj = [];
    for (var i = 0; i < tamanho; i++) {
      if (pool[i].vivo) obj.push(pool[i]);
    }
    return obj;
  };

  this.init = function (objeto) {
    if (objeto == "bullet") {
      for (var i = 0; i < tamanho; i++) {
        var tiro = new Tiro("bullet");
        tiro.init(
          0,
          0,
          repositorioImagens.bullet.width,
          repositorioImagens.bullet.height,
        );
        tiro.grupoColisao = "enemy";
        tiro.tipo = "bullet";
        pool[i] = tiro;
      }
    } else if (objeto == "enemy") {
      for (var i = 0; i < tamanho; i++) {
        var inimigo = new Inimigo();
        inimigo.init(0, 0, 32, 32);
        pool[i] = inimigo;
      }
    } else if (objeto == "enemyBullet") {
      for (var i = 0; i < tamanho; i++) {
        var tiroInimigo = new Tiro("enemyBullet");
        tiroInimigo.init(
          0,
          0,
          repositorioImagens.enemyBullet.width,
          repositorioImagens.enemyBullet.height,
        );
        tiroInimigo.grupoColisao = "ship";
        tiroInimigo.tipo = "enemyBullet";
        pool[i] = tiroInimigo;
      }
    } else if (objeto == "item") {
      for (var i = 0; i < tamanho; i++) {
        var item = new Item();
        item.init(0, 0, 24, 24);
        pool[i] = item;
      }
    }
  };

  this.get = function (x, y, velocidade, infoTipo) {
    if (!pool[tamanho - 1].vivo) {
      pool[tamanho - 1].spawn(x, y, velocidade, infoTipo);
      pool.unshift(pool.pop());
    }
  };

  this.animate = function () {
    for (var i = 0; i < tamanho; i++) {
      if (pool[i].vivo) {
        if (pool[i].draw()) {
          pool[i].clear();
          pool.push(pool.splice(i, 1)[0]);
        }
      } else {
        break;
      }
    }
  };
}

function PoolDeSons(tamanhoMax) {
  var tamanho = tamanhoMax;
  var pool = [];
  this.pool = pool;
  var somAtual = 0;
  this.init = function (objeto) {
    if (objeto == "laser") {
      for (var i = 0; i < tamanho; i++) {
        var laser = new Audio("sounds/laser.wav");
        laser.volume = 0.12;
        laser.load();
        pool[i] = laser;
      }
    } else if (objeto == "explosion") {
      for (var i = 0; i < tamanho; i++) {
        var explosao = new Audio("sounds/explosion.wav");
        explosao.volume = 0.1;
        explosao.load();
        pool[i] = explosao;
      }
    }
  };
  this.get = function () {
    if (pool[somAtual].currentTime == 0 || pool[somAtual].ended) {
      pool[somAtual].play();
    }
    somAtual = (somAtual + 1) % tamanho;
  };
}

function mutar() {
  if (jogo.audioFundo.volume !== 0) jogo.audioFundo.volume = 0;
  else jogo.audioFundo.volume = 0.7;
  if (jogo.audioGameOver.volume !== 0) jogo.audioGameOver.volume = 0;
  else jogo.audioGameOver.volume = 0.7;
}

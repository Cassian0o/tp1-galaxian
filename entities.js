// entities.js
function EntidadeBase() {
  this.init = function (x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  };
  this.velocidade = 0;
  this.canvasWidth = 0;
  this.canvasHeight = 0;
  this.grupoColisao = "";
  this.colidindo = false;
  this.tipo = "";
  this.draw = function () {};
  this.move = function () {};
  this.colideCom = function (outro) {
    return this.grupoColisao === outro.tipo;
  };
}

function Fundo(variante) {
  var chaveVariante = variante;

  if (chaveVariante === "background") {
    this.velocidade = 1;
    this.image = repositorioImagens.background;
  } else if (chaveVariante === "starfield") {
    this.velocidade = 2;
    this.image = repositorioImagens.stars;
  }

  this.draw = function () {
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

    if (this.y >= this.canvasHeight) {
      this.y = 0;
    }
  };
}
Fundo.prototype = new EntidadeBase();

function Tiro(variante) {
  this.vivo = false;
  var chaveVariante = variante;

  this.spawn = function (x, y, velocidade) {
    this.x = x;
    this.y = y;
    this.velocidadeX = velocidade[0];
    this.velocidadeY = velocidade[1];
    this.vivo = true;
  };

  this.draw = function () {
    this.context.clearRect(
      this.x - 1,
      this.y - 1,
      this.width + 2,
      this.height + 2,
    );
    this.y -= this.velocidadeY;
    this.x -= -this.velocidadeX;

    if (this.colidindo) {
      return true;
    } else if (chaveVariante === "bullet" && this.y <= 0 - this.height) {
      return true;
    } else if (chaveVariante === "enemyBullet" && this.y >= this.canvasHeight) {
      return true;
    } else {
      if (chaveVariante === "bullet") {
        this.context.drawImage(repositorioImagens.bullet, this.x, this.y);
      } else if (chaveVariante === "enemyBullet") {
        this.context.drawImage(repositorioImagens.enemyBullet, this.x, this.y);
      }
      return false;
    }
  };

  this.clear = function () {
    this.x = 0;
    this.y = 0;
    this.velocidadeX = 0;
    this.velocidadeY = 0;
    this.vivo = false;
    this.colidindo = false;
  };
}
Tiro.prototype = new EntidadeBase();

function Nave() {
  this.velocidade = 4;
  this.poolDeTiros = new PoolDeObjetos(60);
  var taxaDeTiro = 15;
  var contador = 0;
  this.grupoColisao = "enemyBullet";
  this.tipo = "ship";

  this.timerTiroMultiplo = 0;

  this.init = function (x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.vivo = true;
    this.colidindo = false;
    this.poolDeTiros.init("bullet");
  };

  this.draw = function () {
    this.context.drawImage(repositorioImagens.spaceship, this.x, this.y);
  };

  this.move = function () {
    contador++;
    if (this.timerTiroMultiplo > 0) this.timerTiroMultiplo--;

    if (jogo.isMenuDemo) {
      // MODO DEMO: IA Controla a Nave em Zigue-Zague
      this.context.clearRect(this.x, this.y, this.width, this.height);
      this.x =
        this.canvasWidth / 2 -
        this.width / 2 +
        Math.sin(Date.now() / 400) * (this.canvasWidth / 3);

      if (contador >= taxaDeTiro / 2) {
        // Atira mais rápido no demo
        this.atirar();
        contador = 0;
      }
    } else {
      // MODO JOGADOR: Teclado/Mouse
      if (STATUS_TECLAS.left || STATUS_TECLAS.right) {
        this.context.clearRect(this.x, this.y, this.width, this.height);
        if (STATUS_TECLAS.left) {
          this.x -= this.velocidade;
          if (this.x <= 0) this.x = 0;
        } else if (STATUS_TECLAS.right) {
          this.x += this.velocidade;
          if (this.x >= this.canvasWidth - this.width)
            this.x = this.canvasWidth - this.width;
        }
      }

      if (STATUS_TECLAS.space && contador >= taxaDeTiro && !this.colidindo) {
        this.atirar();
        contador = 0;
      }
    }

    if (!this.colidindo || jogo.isMenuDemo) {
      this.colidindo = false; // Demo mode: Ignora dano físico (imortal)
      this.draw();
    } else {
      this.hit();
    }
  };

  this.atirar = function () {
    if (this.timerTiroMultiplo > 0 || jogo.isMenuDemo) {
      // Demo sempre atira múltiplo
      this.poolDeTiros.get(this.x + this.width / 2 - 3, this.y, [0, 6]);
      this.poolDeTiros.get(this.x, this.y + 10, [1, 5]);
      this.poolDeTiros.get(this.x + this.width - 6, this.y + 10, [-1, 5]);
    } else {
      this.poolDeTiros.get(this.x + this.width / 2 - 3, this.y, [0, 6]);
    }
    // Não toca o barulho de tiro durante o menu pra não estourar ouvidos
    if (!jogo.isMenuDemo) jogo.laser.get();
  };

  this.hit = function () {
    jogo.explosoes.push({
      pos: [this.x, this.y],
      sprite: new Sprite(
        repositorioImagens.explosion.src,
        [0, 0],
        [49, 49],
        1,
        [0, 1, 2, 3, 4, 5, 6, 7],
        null,
        true,
      ),
    });
    if (!jogo.isMenuDemo) jogo.explosao.get();

    jogo.vidasJogador -= 1;
    jogo.atualizarHUDVidas();

    if (jogo.vidasJogador <= 0) {
      this.vivo = false;
      this.context.clearRect(this.x, this.y, this.width, this.height);
      jogo.gameOver("Destruído por forças inimigas!");
    } else {
      this.colidindo = false;
      this.timerTiroMultiplo = 0;
      this.context.clearRect(this.x, this.y, this.width, this.height);
      this.x = jogo.naveStartX;
      this.y = jogo.naveStartY;
      jogo.mainContext.clearRect(
        0,
        0,
        jogo.mainCanvas.width,
        jogo.mainCanvas.height,
      );
      jogo.poolTirosInimigos.init("enemyBullet");
      this.poolDeTiros.init("bullet");
    }
  };
}
Nave.prototype = new EntidadeBase();

function Inimigo() {
  var chance = 0;
  this.vivo = false;
  this.grupoColisao = "bullet";
  this.tipo = "enemy";

  this.tipoInimigo = 1;
  this.hp = 1;
  this.baseX = 0;
  this.baseY = 0;
  this.estado = "idle";
  this.swoopT = 0;
  this.pontosBezier = [];

  this.spawn = function (x, y, velocidade, infoTipo) {
    this.baseX = infoTipo[0];
    this.baseY = infoTipo[1];
    this.tipoInimigo = infoTipo[2] || 1;
    this.hp = infoTipo[3] || 1;

    if (this.tipoInimigo === 1) {
      this.img = repositorioImagens.enemy;
      this.width = 32;
      this.height = 32;
    } else if (this.tipoInimigo === 2) {
      this.img = repositorioImagens.enemyFast;
      this.width = 24;
      this.height = 24;
    } else if (this.tipoInimigo === 3) {
      this.img = repositorioImagens.enemyTough;
      this.width = 48;
      this.height = 48;
    }

    this.x = jogo.formacaoX + this.baseX;
    this.y = jogo.formacaoY + this.baseY;
    this.vivo = true;
    this.estado = "idle";
  };

  this.draw = function () {
    this.context.clearRect(
      this.x - 2,
      this.y - 2,
      this.width + 4,
      this.height + 4,
    );

    if (!this.colidindo) {
      if (this.estado === "idle") {
        this.x = jogo.formacaoX + this.baseX;
        this.y = jogo.formacaoY + this.baseY;

        var chanceRasante = this.tipoInimigo === 2 ? 0.001 : 0.0002;
        if (Math.random() < chanceRasante && this.y > 0 && jogo.nave.vivo) {
          this.estado = "swoop";
          this.swoopT = 0;
          this.pontosBezier = [
            { x: this.x, y: this.y },
            { x: this.x + (Math.random() > 0.5 ? 250 : -250), y: this.y + 150 },
            { x: jogo.nave.x, y: jogo.naveStartY - 100 },
            { x: jogo.nave.x, y: jogo.naveStartY - 20 },
          ];
        }
      } else if (this.estado === "swoop") {
        this.swoopT += this.tipoInimigo === 2 ? 0.015 : 0.01;
        var t = this.swoopT;

        if (t >= 1) {
          this.estado = "return";
        } else {
          var u = 1 - t;
          var tt = t * t;
          var uu = u * u;
          var uuu = uu * u;
          var ttt = tt * t;
          var p = this.pontosBezier;

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
        var alvoX = jogo.formacaoX + this.baseX;
        var alvoY = jogo.formacaoY + this.baseY;
        var dx = alvoX - this.x;
        var dy = alvoY - this.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
          this.estado = "idle";
        } else {
          this.x += (dx / dist) * 4;
          this.y += (dy / dist) * 4;
        }
      }

      if (this.img && this.img.width > 0) {
        this.context.drawImage(
          this.img,
          this.x,
          this.y,
          this.width,
          this.height,
        );
      }

      var modificadorTaxa = jogo.timerLentidao > 0 ? 0.5 : 1;
      var taxaDeTiro = jogo.configNivelAtual.fireRate * modificadorTaxa;
      if (Math.random() < taxaDeTiro) {
        this.atirar();
      }
      return false;
    } else {
      this.hp--;
      if (this.hp <= 0) {
        jogo.explosoes.push({
          pos: [this.x, this.y],
          sprite: new Sprite(
            repositorioImagens.explosion.src,
            [0, 0],
            [49, 49],
            1,
            [0, 1, 2, 3, 4, 5, 6, 7],
            null,
            true,
          ),
        });

        var pontosBase = this.tipoInimigo * 10;
        var bonusAltura = Math.floor(this.y / 15);
        if (!jogo.isMenuDemo) jogo.pontuacaoJogador += pontosBase + bonusAltura;

        if (Math.random() < 0.1 && !jogo.isMenuDemo) {
          // Não dropa itens no menu para não poluir
          var tiposItens = ["multi", "slow", "bomb"];

          if (jogo.vidasJogador < 3) {
            tiposItens.push("life");
            tiposItens.push("life");
          }

          var drop = tiposItens[Math.floor(Math.random() * tiposItens.length)];
          jogo.poolItens.get(
            this.x + this.width / 2 - 12,
            this.y,
            [0, -2],
            drop,
          );
        }

        if (!jogo.isMenuDemo) jogo.explosao.get();
        return true;
      }
      this.colidindo = false;
      return false;
    }
  };

  this.atirar = function () {
    var larguraTiro = repositorioImagens.enemyBullet.width || 0;
    jogo.poolTirosInimigos.get(
      this.x + this.width / 2 - larguraTiro / 2,
      this.y + this.height,
      [0, -1.5],
    );
  };

  this.clear = function () {
    this.vivo = false;
    this.colidindo = false;
    this.estado = "idle";
  };
}
Inimigo.prototype = new EntidadeBase();

function Item() {
  this.vivo = false;
  this.tipo = "";
  this.tipoItem = "";
  this.grupoColisao = "ship";

  this.spawn = function (x, y, velocidade, tipoItem) {
    this.x = x;
    this.y = y;
    this.velocidadeY = velocidade[1];
    this.tipoItem = tipoItem;
    this.vivo = true;
    this.tipo = "item";
  };

  this.draw = function () {
    this.context.clearRect(
      this.x - 1,
      this.y - 1,
      this.width + 2,
      this.height + 2,
    );
    this.y -= this.velocidadeY;

    if (this.colidindo) {
      if (this.tipoItem === "multi") jogo.nave.timerTiroMultiplo = 600;
      if (this.tipoItem === "slow") jogo.timerLentidao = 300;
      if (this.tipoItem === "bomb") jogo.acionarBomba();
      if (this.tipoItem === "life") {
        if (jogo.vidasJogador < 3) {
          jogo.vidasJogador++;
          jogo.atualizarHUDVidas();
        }
      }
      jogo.pontuacaoJogador += 50;
      return true;
    } else if (this.y >= this.canvasHeight) {
      return true;
    } else {
      var img = null;
      if (this.tipoItem === "multi") img = repositorioImagens.itemMulti;
      if (this.tipoItem === "slow") img = repositorioImagens.itemSlow;
      if (this.tipoItem === "bomb") img = repositorioImagens.itemBomb;
      if (this.tipoItem === "life") img = repositorioImagens.itemLife;

      if (img && img.width > 0) {
        this.context.drawImage(img, this.x, this.y, this.width, this.height);
      } else {
        var cores = {
          bomb: "#ff8800",
          slow: "#00ffff",
          multi: "#ffff00",
          life: "#ff00ff",
        };
        this.context.fillStyle = cores[this.tipoItem] || "#ffffff";
        this.context.fillRect(this.x, this.y, this.width, this.height);
      }
      return false;
    }
  };

  this.clear = function () {
    this.x = 0;
    this.y = 0;
    this.vivo = false;
    this.colidindo = false;
  };
}
Item.prototype = new EntidadeBase();

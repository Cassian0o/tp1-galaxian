// game.js
var jogo = new Jogo();

function init() {
  jogo.init();
}

function Jogo() {
  this.init = function () {
    this.vidasJogador = 3;
    this.pausado = false;
    this.venceu = false;
    this.esperandoConfirmacao = false;
    this.estaAnimando = false;
    this.estaJogando = false;

    this.timerTituloNivel = null;
    this.tempoRestanteTituloNivel = 0;
    this.inicioTituloNivel = 0;
    this.tituloNivelVisivel = false;

    this.nivelAtual = 1;
    this.configsNiveis = [
      {
        rows: 3,
        cols: 8,
        types: [1],
        speed: 1.0,
        fireRate: 0.002,
        bgSpeed: 1,
        name: "SETOR ALFA",
      },
      {
        rows: 4,
        cols: 8,
        types: [1, 1, 2],
        speed: 1.5,
        fireRate: 0.003,
        bgSpeed: 1.5,
        name: "CINTURÃO DE ÓRION",
      },
      {
        rows: 4,
        cols: 9,
        types: [1, 2, 3],
        speed: 1.8,
        fireRate: 0.004,
        bgSpeed: 2,
        name: "ZONA VERMELHA",
      },
      {
        rows: 5,
        cols: 10,
        types: [1, 2, 2, 3],
        speed: 2.2,
        fireRate: 0.005,
        bgSpeed: 2.5,
        name: "FROTA ESTELAR NEGRA",
      },
    ];
    this.configNivelAtual = this.configsNiveis[0];

    this.formacaoX = 0;
    this.formacaoY = 0;
    this.velocidadeInimigoX = 1.0;
    this.direcaoFormacao = 1;
    this.deslocarInimigosAbaixo = false;
    this.timerLentidao = 0;

    this.bgCanvas = document.getElementById("background");
    this.starCanvas = document.getElementById("starfield");
    this.shipCanvas = document.getElementById("ship");
    this.mainCanvas = document.getElementById("main");
    this.explosionCanvas = document.getElementById("explosions");

    var larguraTela = window.innerWidth;
    var alturaTela = window.innerHeight;

    this.bgCanvas.width = larguraTela;
    this.bgCanvas.height = alturaTela;
    this.starCanvas.width = larguraTela;
    this.starCanvas.height = alturaTela;
    this.shipCanvas.width = larguraTela;
    this.shipCanvas.height = alturaTela;
    this.mainCanvas.width = larguraTela;
    this.mainCanvas.height = alturaTela;
    this.explosionCanvas.width = larguraTela;
    this.explosionCanvas.height = alturaTela;

    if (this.bgCanvas.getContext) {
      this.bgContext = this.bgCanvas.getContext("2d");
      this.starContext = this.starCanvas.getContext("2d");
      this.shipContext = this.shipCanvas.getContext("2d");
      this.mainContext = this.mainCanvas.getContext("2d");
      this.explosionContext = this.explosionCanvas.getContext("2d");

      Fundo.prototype.context = this.bgContext;
      Fundo.prototype.canvasWidth = this.bgCanvas.width;
      Fundo.prototype.canvasHeight = this.bgCanvas.height;

      Nave.prototype.context = this.shipContext;
      Nave.prototype.canvasWidth = this.shipCanvas.width;
      Nave.prototype.canvasHeight = this.shipCanvas.height;

      Tiro.prototype.context = this.mainContext;
      Tiro.prototype.canvasWidth = this.mainCanvas.width;
      Tiro.prototype.canvasHeight = this.mainCanvas.height;

      Inimigo.prototype.context = this.mainContext;
      Inimigo.prototype.canvasWidth = this.mainCanvas.width;
      Inimigo.prototype.canvasHeight = this.mainCanvas.height;

      Item.prototype.context = this.mainContext;
      Item.prototype.canvasWidth = this.mainCanvas.width;
      Item.prototype.canvasHeight = this.mainCanvas.height;

      this.fundo = new Fundo("background");
      this.fundo.init(0, 0);

      this.campoEstrelar = new Fundo("starfield");
      this.campoEstrelar.init(0, 0);

      this.nave = new Nave();
      this.naveStartX =
        this.shipCanvas.width / 2 - repositorioImagens.spaceship.width / 2;
      this.naveStartY =
        this.shipCanvas.height - repositorioImagens.spaceship.height - 20;
      this.nave.init(
        this.naveStartX,
        this.naveStartY,
        repositorioImagens.spaceship.width,
        repositorioImagens.spaceship.height,
      );

      this.poolInimigos = new PoolDeObjetos(100);
      this.poolInimigos.init("enemy");

      this.poolItens = new PoolDeObjetos(10);
      this.poolItens.init("item");

      this.poolTirosInimigos = new PoolDeObjetos(50);
      this.poolTirosInimigos.init("enemyBullet");

      this.explosoes = [];
      this.quadTree = new QuadTree({
        x: 0,
        y: 0,
        width: this.mainCanvas.width,
        height: this.mainCanvas.height,
      });
      this.pontuacaoJogador = 0;

      this.laser = new PoolDeSons(10);
      this.laser.init("laser");

      this.explosao = new PoolDeSons(20);
      this.explosao.init("explosion");

      this.audioFundo = new Audio("sounds/Gravity_Well_Ascent.mp3");
      this.audioFundo.loop = false;
      this.audioFundo.volume = 0.25;
      this.audioFundo.load();
      this.audioFundo.addEventListener("ended", function () {
        this.currentTime = 0;
        this.play();
      });

      this.audioGameOver = new Audio("sounds/game_over.mp3");
      this.audioGameOver.loop = false;
      this.audioGameOver.volume = 0.25;
      this.audioGameOver.load();

      this.atualizarHUDVidas();
      this.atualizarHUDNivel();

      document.addEventListener("mousemove", function (e) {
        if (jogo.estaJogando && !jogo.pausado && !jogo.esperandoConfirmacao) {
          var rect = jogo.shipCanvas.getBoundingClientRect();
          var mouseX = e.clientX - rect.left;
          var novoX = mouseX - jogo.nave.width / 2;
          if (novoX < 0) novoX = 0;
          if (novoX > jogo.shipCanvas.width - jogo.nave.width)
            novoX = jogo.shipCanvas.width - jogo.nave.width;
          jogo.shipContext.clearRect(
            jogo.nave.x,
            jogo.nave.y,
            jogo.nave.width,
            jogo.nave.height,
          );
          jogo.nave.x = novoX;
        }
      });

      this.checarAudio = window.setInterval(function () {
        checarEstadoPronto();
      }, 1000);
    }
  };

  this.mostrarTela = function (id) {
    document.getElementById("start-screen").style.display = "none";
    document.getElementById(id).style.display = "block";
  };
  this.esconderTela = function (id) {
    document.getElementById(id).style.display = "none";
    document.getElementById("start-screen").style.display = "block";
  };

  this.estaMutado = false;
  this.alternarSom = function () {
    this.estaMutado = !this.estaMutado;
    var btn = document.getElementById("sound-status");
    if (this.estaMutado) {
      this.audioFundo.volume = 0;
      this.audioGameOver.volume = 0;
      btn.innerText = "DESLIGADO";
      btn.style.color = "#888";
    } else {
      this.audioFundo.volume = 0.25;
      this.audioGameOver.volume = 0.25;
      btn.innerText = "LIGADO";
      btn.style.color = "#ffd700";
    }
  };

  this.obterRecordes = function () {
    var pontuacoes = localStorage.getItem("spaceShooterHighscores");
    return pontuacoes ? JSON.parse(pontuacoes) : [];
  };
  this.salvarRecorde = function (nome, pontuacao) {
    if (pontuacao <= 0) return;
    var pontuacoes = this.obterRecordes();
    pontuacoes.push({ name: nome || "Anônimo", score: pontuacao });
    pontuacoes.sort(function (a, b) {
      return b.score - a.score;
    });
    pontuacoes = pontuacoes.slice(0, 5);
    localStorage.setItem("spaceShooterHighscores", JSON.stringify(pontuacoes));
  };
  this.mostrarRecordes = function () {
    document.getElementById("start-screen").style.display = "none";
    var lista = document.getElementById("highscore-list");
    lista.innerHTML = "";
    var pontuacoes = this.obterRecordes();
    if (pontuacoes.length === 0)
      lista.innerHTML =
        '<li style="list-style:none;">Nenhum recorde ainda.</li>';
    else
      for (var i = 0; i < pontuacoes.length; i++)
        lista.innerHTML +=
          "<li>" + pontuacoes[i].name + " - " + pontuacoes[i].score + "</li>";
    document.getElementById("highscore-screen").style.display = "block";
  };
  this.esconderRecordes = function () {
    document.getElementById("highscore-screen").style.display = "none";
    document.getElementById("start-screen").style.display = "block";
  };

  this.salvarPontuacaoEReiniciar = function (tipo) {
    var idInput = tipo === "win" ? "player-name-win" : "player-name-lose";
    var nome = document.getElementById(idInput).value;
    this.salvarRecorde(nome, this.pontuacaoJogador);
    document.getElementById(idInput).value = "";
    this.nivelAtual = 1;
    this.reiniciar("menu");
  };

  this.voltarAoMenu = function () {
    this.nivelAtual = 1;
    this.reiniciar("menu");
  };

  this.atualizarHUDNivel = function () {
    var elPontuacao = document.getElementById("score");
    if (elPontuacao) {
      elPontuacao.innerHTML =
        this.pontuacaoJogador + " | NÍVEL " + this.nivelAtual;
    }
  };

  this.gerarOnda = function (mostrarTitulo) {
    if (this.nivelAtual <= this.configsNiveis.length) {
      this.configNivelAtual = this.configsNiveis[this.nivelAtual - 1];
    } else {
      var infMultiplicador = this.nivelAtual - this.configsNiveis.length;
      this.configNivelAtual = {
        rows: Math.min(8, 5 + Math.floor(infMultiplicador / 2)),
        cols: Math.min(12, 10 + Math.floor(infMultiplicador / 3)),
        types: [1, 2, 3],
        speed: 2.5 + infMultiplicador * 0.2,
        fireRate: 0.005 + infMultiplicador * 0.001,
        bgSpeed: 3,
        name: "SETOR DESCONHECIDO " + infMultiplicador,
      };
    }

    var config = this.configNivelAtual;
    this.velocidadeInimigoX = config.speed;
    this.fundo.velocidade = config.bgSpeed;
    this.campoEstrelar.velocidade = config.bgSpeed * 2;

    var larguraCelula = 55;
    var alturaCelula = 55;
    var larguraTotal = config.cols * larguraCelula;

    this.formacaoX = (this.mainCanvas.width - larguraTotal) / 2;
    this.formacaoY = 50;
    this.formacaoAlvoY = 50;
    this.direcaoFormacao = 1;

    for (var r = 0; r < config.rows; r++) {
      for (var c = 0; c < config.cols; c++) {
        var tipoE =
          config.types[Math.floor(Math.random() * config.types.length)];
        var hpE = tipoE === 3 ? 3 : 1;
        var infoTipo = [c * larguraCelula, r * alturaCelula, tipoE, hpE];
        this.poolInimigos.get(0, 0, 2, infoTipo);
      }
    }

    var textoNivel = document.getElementById("level-up-text");
    var telaNivel = document.getElementById("level-up-screen");

    if (textoNivel) {
      textoNivel.innerText = config.name;
    }

    if (telaNivel) {
      if (this.timerTituloNivel) clearTimeout(this.timerTituloNivel);

      if (mostrarTitulo) {
        telaNivel.style.display = "block";
        this.tituloNivelVisivel = true;
        this.tempoRestanteTituloNivel = 2000;
        this.inicioTituloNivel = Date.now();

        this.timerTituloNivel = setTimeout(function () {
          telaNivel.style.display = "none";
          jogo.tituloNivelVisivel = false;
        }, this.tempoRestanteTituloNivel);
      } else {
        telaNivel.style.display = "none";
        this.tituloNivelVisivel = false;
      }
    }
  };

  this.acionarBomba = function () {
    var inimigos = this.poolInimigos.getPool();
    var abates = 0;
    for (var i = 0; i < inimigos.length; i++) {
      if (inimigos[i].estado === "idle" && Math.random() > 0.5) {
        inimigos[i].hp = 0;
        inimigos[i].colidindo = true;
        abates++;
      }
    }
    this.pontuacaoJogador += abates * 10;

    this.bgContext.fillStyle = "rgba(255, 255, 255, 0.5)";
    this.bgContext.fillRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
  };

  this.iniciar = function () {
    this.estaJogando = true;
    this.nave.draw();
    this.audioFundo.play();
    if (!this.estaAnimando) animar();
  };

  this.alternarPausa = function () {
    if (
      this.nave.vivo &&
      !this.venceu &&
      !this.esperandoConfirmacao &&
      this.estaJogando
    ) {
      this.pausado = !this.pausado;
      document.getElementById("pause-screen").style.display = this.pausado
        ? "block"
        : "none";

      var telaNivel = document.getElementById("level-up-screen");

      if (this.pausado) {
        this.audioFundo.pause();

        if (this.tituloNivelVisivel) {
          clearTimeout(this.timerTituloNivel);
          var tempoDecorrido = Date.now() - this.inicioTituloNivel;
          this.tempoRestanteTituloNivel -= tempoDecorrido;
          if (telaNivel) telaNivel.style.display = "none";
        }
      } else {
        this.audioFundo.play();

        if (this.tituloNivelVisivel && this.tempoRestanteTituloNivel > 0) {
          if (telaNivel) telaNivel.style.display = "block";
          this.inicioTituloNivel = Date.now();
          this.timerTituloNivel = setTimeout(function () {
            if (telaNivel) telaNivel.style.display = "none";
            jogo.tituloNivelVisivel = false;
          }, this.tempoRestanteTituloNivel);
        }
      }
    }
  };

  this.confirmarReiniciar = function () {
    if (!this.esperandoConfirmacao && !this.venceu && this.estaJogando) {
      this.esperandoConfirmacao = true;
      this.pausado = true;
      document.getElementById("confirm-restart").style.display = "block";

      var telaNivel = document.getElementById("level-up-screen");
      this.audioFundo.pause();

      if (this.tituloNivelVisivel) {
        clearTimeout(this.timerTituloNivel);
        var tempoDecorrido = Date.now() - this.inicioTituloNivel;
        this.tempoRestanteTituloNivel -= tempoDecorrido;
        if (telaNivel) telaNivel.style.display = "none";
      }
    }
  };

  this.cancelarReiniciar = function () {
    this.esperandoConfirmacao = false;
    this.pausado = false;
    document.getElementById("confirm-restart").style.display = "none";

    var telaNivel = document.getElementById("level-up-screen");
    this.audioFundo.play();

    if (this.tituloNivelVisivel && this.tempoRestanteTituloNivel > 0) {
      if (telaNivel) telaNivel.style.display = "block";
      this.inicioTituloNivel = Date.now();
      this.timerTituloNivel = setTimeout(function () {
        if (telaNivel) telaNivel.style.display = "none";
        jogo.tituloNivelVisivel = false;
      }, this.tempoRestanteTituloNivel);
    }
  };

  this.reiniciar = function (condicao) {
    condicao = condicao || "";
    this.estaJogando = false;

    if (this.timerTituloNivel) clearTimeout(this.timerTituloNivel);
    this.tituloNivelVisivel = false;

    this.audioGameOver.pause();
    this.audioGameOver.currentTime = 0;

    this.bgContext.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
    this.starContext.clearRect(
      0,
      0,
      this.starCanvas.width,
      this.starCanvas.height,
    );
    this.shipContext.clearRect(
      0,
      0,
      this.shipCanvas.width,
      this.shipCanvas.height,
    );
    this.mainContext.clearRect(
      0,
      0,
      this.mainCanvas.width,
      this.mainCanvas.height,
    );

    this.quadTree.clear();
    this.fundo.init(0, 0);
    this.campoEstrelar.init(0, 0);

    this.nave.init(
      this.naveStartX,
      this.naveStartY,
      repositorioImagens.spaceship.width,
      repositorioImagens.spaceship.height,
    );
    this.nave.timerTiroMultiplo = 0;
    this.timerLentidao = 0;

    if (condicao !== "continue" && condicao !== "nextLevel") {
      this.pontuacaoJogador = 0;
      this.vidasJogador = 3;
      this.nivelAtual = 1;
    }

    this.poolInimigos.init("enemy");

    var mostrarTituloNivel = condicao !== "menu";
    this.gerarOnda(mostrarTituloNivel);

    this.poolTirosInimigos.init("enemyBullet");
    this.poolItens.init("item");
    this.explosoes = [];

    this.pausado = false;
    this.venceu = false;
    this.esperandoConfirmacao = false;

    var telasParaEsconder = [
      "pause-screen",
      "confirm-restart",
      "game-win",
      "game-over",
    ];
    for (var i = 0; i < telasParaEsconder.length; i++) {
      var el = document.getElementById(telasParaEsconder[i]);
      if (el) el.style.display = "none";
    }

    this.atualizarHUDVidas();
    this.atualizarHUDNivel();

    if (condicao === "menu") {
      this.audioFundo.pause();

      var telaInicial = document.getElementById("start-screen");
      if (telaInicial) telaInicial.style.display = "block";
    } else if (condicao !== "continue") {
      if (this.audioFundo.paused) this.audioFundo.play();
      this.iniciar();
    } else {
      this.estaJogando = true;
    }
  };

  this.atualizarHUDVidas = function () {
    var htmlVidas = "";
    for (var i = 1; i <= Math.max(0, this.vidasJogador); i++)
      htmlVidas += '<img src="images/lives.png" />';
    document.getElementById("lives").innerHTML = htmlVidas;
  };

  this.proximoNivel = function () {
    this.nivelAtual++;
    this.pontuacaoJogador += 500;
    this.reiniciar("nextLevel");
  };

  this.ganhar = function () {
    this.venceu = true;
    this.estaJogando = false;
    this.audioFundo.pause();
    document.getElementById("game-win").style.display = "block";
    setTimeout(function () {
      document.getElementById("player-name-win").focus();
    }, 100);
  };

  this.gameOver = function (motivo) {
    this.estaJogando = false;
    this.audioFundo.pause();
    this.audioGameOver.currentTime = 0;
    this.audioGameOver.play();
    document.getElementById("game-over-reason").innerText = motivo || "";
    document.getElementById("game-over").style.display = "block";
    setTimeout(function () {
      document.getElementById("player-name-lose").focus();
    }, 100);
  };
}

function checarEstadoPronto() {
  if (jogo.audioGameOver.readyState === 4 && jogo.audioFundo.readyState === 4) {
    window.clearInterval(jogo.checarAudio);
    document.getElementById("splash-screen").style.display = "flex";
    setTimeout(function () {
      document.getElementById("splash-screen").style.display = "none";
      document.getElementById("start-screen").style.display = "block";
    }, 2500);
  }
}

function iniciarJogo() {
  document.getElementById("start-screen").style.display = "none";
  jogo.nivelAtual = 1;
  jogo.reiniciar();
}

function animar() {
  jogo.estaAnimando = true;

  if (!jogo.estaJogando && !jogo.pausado && !jogo.esperandoConfirmacao) {
    jogo.estaAnimando = false;
    return;
  }

  if (jogo.pausado || jogo.esperandoConfirmacao || jogo.venceu) {
    requestAnimFrame(animar);
    return;
  }

  if (jogo.timerLentidao > 0) jogo.timerLentidao--;
  jogo.atualizarHUDNivel();

  jogo.quadTree.clear();
  jogo.quadTree.insert(jogo.nave);
  jogo.quadTree.insert(jogo.nave.poolDeTiros.getPool());
  jogo.quadTree.insert(jogo.poolInimigos.getPool());
  jogo.quadTree.insert(jogo.poolTirosInimigos.getPool());
  jogo.quadTree.insert(jogo.poolItens.getPool());

  detectarColisao();

  var inimigos = jogo.poolInimigos.getPool();

  if (inimigos.length === 0) {
    jogo.proximoNivel();
    requestAnimFrame(animar);
    return;
  }

  var modVelocidade = jogo.timerLentidao > 0 ? 0.3 : 1;
  jogo.formacaoX +=
    jogo.velocidadeInimigoX * jogo.direcaoFormacao * modVelocidade;

  var bateuNaBorda = false;
  var bateuNoFundo = false;

  for (var i = 0; i < inimigos.length; i++) {
    if (inimigos[i].estado === "idle") {
      if (inimigos[i].x <= 0 && jogo.direcaoFormacao === -1) {
        bateuNaBorda = true;
      }
      if (
        inimigos[i].x + inimigos[i].width >= jogo.mainCanvas.width &&
        jogo.direcaoFormacao === 1
      ) {
        bateuNaBorda = true;
      }
      if (inimigos[i].y + inimigos[i].height >= jogo.naveStartY) {
        bateuNoFundo = true;
      }
    }
  }

  if (bateuNoFundo) {
    jogo.nave.vivo = false;
    jogo.gameOver("A invasão atingiu o solo!");
    jogo.estaAnimando = false;
    return;
  }

  if (bateuNaBorda) {
    jogo.direcaoFormacao *= -1;
    jogo.velocidadeInimigoX += 0.05;
    jogo.formacaoAlvoY += 20;
  }

  if (jogo.formacaoY < jogo.formacaoAlvoY) {
    jogo.formacaoY += 0.5;

    if (jogo.formacaoY > jogo.formacaoAlvoY) {
      jogo.formacaoY = jogo.formacaoAlvoY;
    }
  }

  if (jogo.nave.vivo) {
    requestAnimFrame(animar);

    jogo.fundo.draw();
    jogo.campoEstrelar.draw();
    jogo.nave.move();
    jogo.nave.poolDeTiros.animate();
    jogo.poolInimigos.animate();
    jogo.poolTirosInimigos.animate();
    jogo.poolItens.animate();

    jogo.explosionContext.clearRect(
      0,
      0,
      jogo.explosionCanvas.width,
      jogo.explosionCanvas.height,
    );
    for (var i = 0; i < jogo.explosoes.length; i++) {
      var explosao = jogo.explosoes[i];
      explosao.sprite.update(1);

      if (explosao.sprite.done) {
        jogo.explosoes.splice(i, 1);
        i--;
      } else {
        explosao.sprite.render(
          explosao.pos[0],
          explosao.pos[1],
          jogo.explosionContext,
        );
      }
    }
  } else {
    jogo.estaAnimando = false;
  }
}

function detectarColisao() {
  var objetos = [];
  jogo.quadTree.getAllObjects(objetos);

  for (var x = 0, len = objetos.length; x < len; x++) {
    jogo.quadTree.findObjects((obj = []), objetos[x]);

    for (var y = 0, length = obj.length; y < length; y++) {
      if (
        objetos[x].grupoColisao === obj[y].tipo &&
        objetos[x].x < obj[y].x + obj[y].width &&
        objetos[x].x + objetos[x].width > obj[y].x &&
        objetos[x].y < obj[y].y + obj[y].height &&
        objetos[x].y + objetos[x].height > obj[y].y
      ) {
        if (objetos[x].tipo === "item") {
          objetos[x].colidindo = true;
        } else if (obj[y].tipo === "item") {
          obj[y].colidindo = true;
        } else {
          objetos[x].colidindo = true;
          obj[y].colidindo = true;
        }
      }
    }
  }
}

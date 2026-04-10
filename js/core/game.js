import QuadTree from "../engine/QuadTree.js";
import { ObjectPool, SoundPool } from "../engine/Pool.js";
import { assets } from "../engine/Assets.js";
import { requestAnimFrame } from "../engine/Utils.js";
import Background from "../entities/Background.js";
import Ship from "../entities/Ship.js";
import Enemy from "../entities/Enemy.js";
import Bullet from "../entities/Bullet.js";
import Item from "../entities/Item.js";
import Sprite from "../engine/Sprite.js";

/*
  Game
  - Controla o estado global do jogo: setup, loop, atualizações, desenho e colisões.
  - Mantém pools de objetos, quadTree para colisões e timers de efeitos (lentidão, apresentação).
  - Fluxo típico: criar instância -> setup() -> gerarOnda() -> iniciar() -> loop()
*/

export default class Game {
  // Inicializa estado e configuração dos níveis
  constructor() {
    this.vidasJogador = 3;
    this.pausado = false;
    this.isMenuDemo = true;
    this.pontuacaoJogador = 0;
    this.nivelAtual = 1;
    this.explosoes = [];
    this.estaAnimando = false;
    this.estaMutado = false;
    // timers usados pelo loop para efeitos e exibição de título de fase
    this.timerLentidao = 0;
    this.timerApresentacaoFase = 0;

    this.configsNiveis = [
      {
        rows: 4,
        cols: 10,
        types: [1],
        speed: 1.8,
        fireRate: 0.005,
        bgSpeed: 1.5,
        name: "SETOR ALFA",
      },
      {
        rows: 5,
        cols: 10,
        types: [1, 1, 2],
        speed: 2.5,
        fireRate: 0.01,
        bgSpeed: 2,
        name: "SETOR BETA",
      },
      {
        rows: 5,
        cols: 11,
        types: [1, 2, 3],
        speed: 3.2,
        fireRate: 0.015,
        bgSpeed: 2.5,
        name: "ZONA VERMELHA",
      },
      {
        rows: 6,
        cols: 12,
        types: [1, 2, 2, 3],
        speed: 4.0,
        fireRate: 0.025,
        bgSpeed: 3,
        name: "LA BESTIA NEGRA",
      },
    ];
    this.configNivelAtual = this.configsNiveis[0];
  }

  // Configura canvases, contexto 2D, entidades principais e pools
  setup() {
    this.bgCanvas = document.getElementById("background");
    this.starCanvas = document.getElementById("starfield");
    this.shipCanvas = document.getElementById("ship");
    this.mainCanvas = document.getElementById("main");
    this.explosionCanvas = document.getElementById("explosions");

    const w = window.innerWidth;
    const h = window.innerHeight;
    [
      this.bgCanvas,
      this.starCanvas,
      this.shipCanvas,
      this.mainCanvas,
      this.explosionCanvas,
    ].forEach((c) => {
      c.width = w;
      c.height = h;
    });

    this.bgContext = this.bgCanvas.getContext("2d");
    this.starContext = this.starCanvas.getContext("2d");
    this.shipContext = this.shipCanvas.getContext("2d");
    this.mainContext = this.mainCanvas.getContext("2d");
    this.explosionContext = this.explosionCanvas.getContext("2d");

    this.fundo = new Background("background", this.bgContext, w, h);
    this.campoEstrelar = new Background("starfield", this.starContext, w, h);

    this.nave = new Ship(this);
    this.naveStartX = this.nave.x;
    this.naveStartY = this.nave.y;

    this.poolInimigos = new ObjectPool(150, Enemy, this);
    this.poolItens = new ObjectPool(10, Item, this);
    this.poolTirosInimigos = new ObjectPool(150, Bullet, {
      variante: "enemyBullet",
      context: this.mainContext,
      width: w,
      height: h,
    });

    this.quadTree = new QuadTree({ x: 0, y: 0, width: w, height: h });

    this.laserSound = new SoundPool(10, "sounds/laser.wav", 0.12);
    this.explosionSound = new SoundPool(20, "sounds/explosion.wav", 0.1);
  }

  // Restaura pools e estado da nave para iniciar um novo mundo/fase
  resetarMundo() {
    this.poolInimigos.init(Enemy, this);
    this.poolItens.init(Item, this);
    this.poolTirosInimigos.init(Bullet, {
      variante: "enemyBullet",
      context: this.mainContext,
      width: this.mainCanvas.width,
      height: this.mainCanvas.height,
    });
    this.nave.poolDeTiros.init(Bullet, {
      variante: "bullet",
      context: this.mainContext,
      width: this.mainCanvas.width,
      height: this.mainCanvas.height,
    });
    this.nave.x = this.naveStartX;
    this.nave.y = this.naveStartY;
    this.nave.vivo = true;
    this.nave.colidindo = false;
    this.nave.timerInvulnerabilidade = 0;
    this.explosoes = [];
    this.timerLentidao = 0;
    this.timerApresentacaoFase = 0;
    this.quadTree.clear();
  }

  // Volta para o modo demo/menu e reinicia o mundo
  voltarAoMenu() {
    this.isMenuDemo = true;
    this.pausado = false;
    this.nivelAtual = 1;
    this.vidasJogador = 3;
    this.pontuacaoJogador = 0;

    document.getElementById("lives-container").style.display = "none";
    document.querySelector(".score").style.display = "none";
    document.querySelector(".controls-hint").style.display = "none";
    document.getElementById("level-up-screen").style.display = "none";

    this.resetarMundo();
    this.gerarOnda();
    this.iniciar();
  }

  // Inicia reprodução de música apropriada e começa o loop se ainda não estiver
  iniciar() {
    this.estaJogando = true;
    if (this.isMenuDemo) {
      assets.sounds["bgm"].pause();
      if (!this.estaMutado) assets.sounds["menu"].play().catch(() => {});
    } else {
      assets.sounds["menu"].pause();
      assets.sounds["menu"].currentTime = 0;
      if (!this.estaMutado) assets.sounds["bgm"].play().catch(() => {});
    }
    if (!this.estaAnimando) this.loop();
  }

  // Loop principal: atualiza estados, detecta colisões e desenha entidades
  loop() {
    this.estaAnimando = true;
    if (!this.estaJogando && !this.pausado) {
      this.estaAnimando = false;
      return;
    }
    if (this.pausado) {
      requestAnimFrame(() => this.loop());
      return;
    }

    this.starContext.clearRect(
      0,
      0,
      this.mainCanvas.width,
      this.mainCanvas.height,
    );
    this.mainContext.clearRect(
      0,
      0,
      this.mainCanvas.width,
      this.mainCanvas.height,
    );
    this.shipContext.clearRect(
      0,
      0,
      this.mainCanvas.width,
      this.mainCanvas.height,
    );

    if (this.timerLentidao > 0) this.timerLentidao--;
    if (!this.isMenuDemo) this.atualizarHUDNivel();

    // Enquanto timerApresentacaoFase > 0: mostra o texto de nível e mantém inimigos congelados
    if (this.timerApresentacaoFase > 0) {
      this.timerApresentacaoFase--;
      if (this.timerApresentacaoFase === 0) {
        document.getElementById("level-up-screen").style.display = "none";
      }
    }

    // Atualiza quadTree com todos os objetos relevantes antes de checar colisões
    this.quadTree.clear();
    this.quadTree.insert(this.nave);
    this.quadTree.insert(this.nave.poolDeTiros.getPool());
    this.quadTree.insert(this.poolInimigos.getPool());
    this.quadTree.insert(this.poolTirosInimigos.getPool());
    this.quadTree.insert(this.poolItens.getPool());
    this.detectarColisao();

    this.atualizarInimigos();

    if (this.nave.vivo) {
      this.fundo.draw();
      this.campoEstrelar.draw();
      this.nave.move();
      this.nave.poolDeTiros.animate();
      this.poolInimigos.animate();
      this.poolTirosInimigos.animate();
      this.poolItens.animate();
      this.animarExplosoes();
      requestAnimFrame(() => this.loop());
    } else {
      this.estaAnimando = false;
    }
  }

  /*
    Detecta colisões usando a quadTree: para cada objeto obtém
    possíveis colisores e testa colisão por bounding-box.
    Ignora colisões quando a nave estiver temporariamente invulnerável.
  */
  detectarColisao() {
    let objetos = [];
    this.quadTree.getAllObjects(objetos);
    for (let x = 0; x < objetos.length; x++) {
      let obj = [];
      this.quadTree.findObjects(obj, objetos[x]);
      for (let y = 0; y < obj.length; y++) {
        if (
          objetos[x].grupoColisao === obj[y].tipo &&
          objetos[x].x < obj[y].x + obj[y].width &&
          objetos[x].x + objetos[x].width > obj[y].x &&
          objetos[x].y < obj[y].y + obj[y].height &&
          objetos[x].y + objetos[x].height > obj[y].y
        ) {
          const naveXInmune =
            objetos[x].tipo === "ship" && objetos[x].timerInvulnerabilidade > 0;
          const naveYInmune =
            obj[y].tipo === "ship" && obj[y].timerInvulnerabilidade > 0;

          if (naveXInmune || naveYInmune) {
            continue;
          }

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

  /*
    Atualiza posição da formação de inimigos e trata colisão com bordas/fundo.
    Enquanto timerApresentacaoFase > 0 a atualização da formação fica suspensa.
  */
  atualizarInimigos() {
    const inimigos = this.poolInimigos.getPool();
    if (inimigos.length === 0) {
      if (this.isMenuDemo) this.gerarOnda();
      else if (this.timerApresentacaoFase <= 0) this.proximoNivel();
      return;
    }

    if (this.timerApresentacaoFase > 0) return;

    const mod = this.timerLentidao > 0 ? 0.3 : 1;
    this.formacaoX += this.velocidadeInimigoX * this.direcaoFormacao * mod;

    let bateuNaBorda = false,
      bateuNoFundo = false;
    for (let i = 0; i < inimigos.length; i++) {
      if (inimigos[i].estado === "idle") {
        if (inimigos[i].x <= 0 && this.direcaoFormacao === -1)
          bateuNaBorda = true;
        if (
          inimigos[i].x + inimigos[i].width >= this.mainCanvas.width &&
          this.direcaoFormacao === 1
        )
          bateuNaBorda = true;
        if (inimigos[i].y + inimigos[i].height >= this.naveStartY)
          bateuNoFundo = true;
      }
    }

    if (bateuNoFundo) {
      if (this.isMenuDemo) {
        this.formacaoY = 50;
        this.formacaoAlvoY = 50;
      } else {
        this.nave.vivo = false;
        this.gameOver("A invasão atingiu o solo!");
      }
    }
    if (bateuNaBorda) {
      this.direcaoFormacao *= -1;
      this.velocidadeInimigoX += 0.05;
      this.formacaoAlvoY += 60;
    }
    if (this.formacaoY < this.formacaoAlvoY)
      this.formacaoY = Math.min(this.formacaoAlvoY, this.formacaoY + 0.5);
  }

  /*
    Gera inimigos para a formação de acordo com a configuração de nível.
    Quando não é demo, exibe o texto de "level up" por um número de frames.
  */
  gerarOnda() {
    if (this.isMenuDemo) {
      this.configNivelAtual = {
        rows: 6,
        cols: 12,
        types: [1, 2, 3],
        speed: 3.5,
        fireRate: 0.08,
        bgSpeed: 4,
        name: "",
      };
      this.timerApresentacaoFase = 0;
    } else {
      if (this.nivelAtual <= this.configsNiveis.length) {
        this.configNivelAtual = this.configsNiveis[this.nivelAtual - 1];
      } else {
        const inf = this.nivelAtual - this.configsNiveis.length;
        this.configNivelAtual = {
          rows: 6,
          cols: 12,
          types: [1, 2, 3],
          speed: 4 + inf * 0.2,
          fireRate: 0.03 + inf * 0.005,
          bgSpeed: 3,
          name: "SETOR X",
        };
      }
      this.timerApresentacaoFase = 150; // frames que mostram o nome do nível
      document.getElementById("level-up-text").innerText =
        this.configNivelAtual.name;
      document.getElementById("level-up-screen").style.display = "block";
    }

    const cfg = this.configNivelAtual;
    this.velocidadeInimigoX = cfg.speed;
    this.fundo.velocidade = cfg.bgSpeed;
    this.campoEstrelar.velocidade = cfg.bgSpeed * 2;
    this.formacaoX = (this.mainCanvas.width - cfg.cols * 55) / 2;
    this.formacaoY = 50;
    this.formacaoAlvoY = 50;
    this.direcaoFormacao = 1;

    for (let r = 0; r < cfg.rows; r++) {
      for (let c = 0; c < cfg.cols; c++) {
        const tipo = cfg.types[Math.floor(Math.random() * cfg.types.length)];
        this.poolInimigos.get(0, 0, 2, [
          c * 55,
          r * 55,
          tipo,
          tipo === 3 ? 3 : 1,
        ]);
      }
    }
  }

  proximoNivel() {
    this.nivelAtual++;
    this.pontuacaoJogador += 500;
    this.resetarMundo();
    this.gerarOnda();
  }

  criarExplosao(x, y) {
    this.explosoes.push({
      pos: [x, y],
      sprite: new Sprite(
        "explosion",
        [0, 0],
        [49, 49],
        1,
        [0, 1, 2, 3, 4, 5, 6, 7],
        null,
        true,
      ),
    });
  }

  animarExplosoes() {
    this.explosionContext.clearRect(
      0,
      0,
      this.explosionCanvas.width,
      this.explosionCanvas.height,
    );
    for (let i = 0; i < this.explosoes.length; i++) {
      let exp = this.explosoes[i];
      exp.sprite.update(1);
      if (exp.sprite.done) {
        this.explosoes.splice(i, 1);
        i--;
      } else {
        exp.sprite.render(exp.pos[0], exp.pos[1], this.explosionContext);
      }
    }
  }

  gameOver(motivo) {
    this.estaJogando = false;
    assets.sounds["bgm"].pause();
    if (!this.estaMutado) assets.sounds["gameover"].play();
    document.getElementById("game-over-reason").innerText = motivo || "";
    document.getElementById("game-over").style.display = "block";
  }

  atualizarHUDVidas() {
    document.getElementById("lives").innerHTML =
      '<img src="images/lives.png" />'.repeat(Math.max(0, this.vidasJogador));
  }

  atualizarHUDNivel() {
    document.getElementById("score").innerText =
      `${this.pontuacaoJogador} | NÍVEL ${this.nivelAtual}`;
  }

  /*
    Bomba: marca alguns inimigos da formação para morrer e aplica um flash de tela.
  */
  acionarBomba() {
    const inimigos = this.poolInimigos.getPool();

    for (let i = 0; i < inimigos.length; i++) {
      if (inimigos[i].estado === "idle" && Math.random() > 0.5) {
        inimigos[i].colidindo = true;
        inimigos[i].hp = 1;
      }
    }

    this.mainContext.fillStyle = "rgba(255, 255, 255, 0.9)";
    this.mainContext.fillRect(
      0,
      0,
      this.mainCanvas.width,
      this.mainCanvas.height,
    );
  }
}

/*
  main.js
  - Inicializa o jogo, gerencia a interface (menus, telas sobrepostas) e high scores.
  - Carrega recursos via AssetManager, configura listeners de input e controla transições de tela.
*/
import { AssetManager, assets } from "./engine/Assets.js";
import { input } from "./engine/Input.js";
import Game from "./core/Game.js";

const game = new Game();

document.addEventListener("DOMContentLoaded", async () => {
  const splashScreen = document.getElementById("splash-screen");
  const splashStatus = document.getElementById("splash-status");
  splashScreen.style.display = "flex";
  splashStatus.innerText = "A carregar recursos...";

  const hideAllScreens = () =>
    document
      .querySelectorAll(".overlay-screen")
      .forEach((el) => (el.style.display = "none"));

  // Carrega e exibe a lista de recordes (high scores) armazenada em localStorage
  const carregarRecordes = () => {
    const recordes = JSON.parse(
      localStorage.getItem("galaxian_recordes") || "[]",
    );
    const lista = document.getElementById("highscore-list");
    lista.innerHTML = "";
    if (recordes.length === 0) {
      lista.innerHTML =
        '<li style="color: #aaa; font-size: 16px;">Nenhum recorde ainda!</li>';
    } else {
      recordes.forEach((r) => {
        lista.innerHTML += `<li>${r.nome} - <span style="color: #ffd700">${r.pontos}</span></li>`;
      });
    }
  };

  // Salva um novo recorde, mantém apenas o Top 10 e atualiza a UI
  const salvarRecorde = (inputId) => {
    const inputEl = document.getElementById(inputId);
    const nome = inputEl.value.trim().toUpperCase() || "ANÓNIMO";
    const pontos = game.pontuacaoJogador;

    let recordes = JSON.parse(
      localStorage.getItem("galaxian_recordes") || "[]",
    );
    recordes.push({ nome, pontos });
    recordes.sort((a, b) => b.pontos - a.pontos);
    recordes = recordes.slice(0, 10);
    localStorage.setItem("galaxian_recordes", JSON.stringify(recordes));

    inputEl.value = "";
    carregarRecordes();

    hideAllScreens();
    document.getElementById("start-screen").style.display = "block";
    document.getElementById("game-container").classList.add("demo-mode");
    game.voltarAoMenu();
  };

  carregarRecordes();

  try {
    input.initListeners();
    await AssetManager.carregarTudo();

    splashStatus.innerText = "PRONTO! CLIQUE PARA INICIAR";
    splashStatus.style.color = "#ffd700";

    splashScreen.addEventListener("click", () => {
      hideAllScreens();
      game.setup();
      game.gerarOnda();
      document.getElementById("start-screen").style.display = "block";
      document.getElementById("game-container").classList.add("demo-mode");
      game.iniciar();
    });

    document.getElementById("btn-iniciar").addEventListener("click", () => {
      hideAllScreens();
      document.getElementById("game-container").classList.remove("demo-mode");
      document.getElementById("lives-container").style.display = "block";
      document.querySelector(".score").style.display = "block";
      document.querySelector(".controls-hint").style.display = "block";

      game.isMenuDemo = false;
      game.nivelAtual = 1;
      game.vidasJogador = 3;
      game.pontuacaoJogador = 0;
      game.atualizarHUDVidas();
      game.resetarMundo();
      game.gerarOnda();
      game.iniciar();
    });

    document.querySelectorAll(".btn-voltar-menu").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.target.getAttribute("data-target");
        if (target) document.getElementById(target).style.display = "none";
        document.getElementById("start-screen").style.display = "block";
      });
    });

    document.querySelectorAll(".btn-voltar-ao-menu").forEach((btn) => {
      btn.addEventListener("click", () => {
        hideAllScreens();
        document.getElementById("start-screen").style.display = "block";
        document.getElementById("game-container").classList.add("demo-mode");
        game.voltarAoMenu();
      });
    });

    document
      .getElementById("btn-salvar-lose")
      .addEventListener("click", () => salvarRecorde("player-name-lose"));
    document
      .getElementById("btn-salvar-win")
      .addEventListener("click", () => salvarRecorde("player-name-win"));

    document
      .getElementById("btn-reiniciar-sem-salvar")
      .addEventListener("click", () => {
        hideAllScreens();
        game.pausado = false;
        game.nivelAtual = 1;
        game.vidasJogador = 3;
        game.pontuacaoJogador = 0;
        game.atualizarHUDVidas();
        game.resetarMundo();
        game.gerarOnda();
        game.iniciar();
      });

    document.getElementById("btn-continuar").addEventListener("click", () => {
      game.pausado = false;
      document.getElementById("pause-screen").style.display = "none";
      if (game.timerApresentacaoFase > 0)
        document.getElementById("level-up-screen").style.display = "block";
    });

    document
      .getElementById("btn-cancelar-reiniciar")
      .addEventListener("click", () => {
        game.pausado = false;
        document.getElementById("confirm-restart").style.display = "none";
        if (game.timerApresentacaoFase > 0)
          document.getElementById("level-up-screen").style.display = "block";
      });

    document
      .getElementById("btn-confirmar-reiniciar")
      .addEventListener("click", () => {
        document.getElementById("btn-reiniciar-sem-salvar").click();
      });

    document.getElementById("btn-instrucoes").addEventListener("click", () => {
      hideAllScreens();
      document.getElementById("instructions-screen").style.display = "block";
    });
    document.getElementById("btn-opcoes").addEventListener("click", () => {
      hideAllScreens();
      document.getElementById("options-screen").style.display = "block";
    });
    document.getElementById("btn-creditos").addEventListener("click", () => {
      hideAllScreens();
      document.getElementById("credits-screen").style.display = "block";
    });
    document.getElementById("btn-recordes").addEventListener("click", () => {
      hideAllScreens();
      document.getElementById("highscore-screen").style.display = "block";
    });
    document
      .getElementById("btn-esconder-recordes")
      .addEventListener("click", () => {
        hideAllScreens();
        document.getElementById("start-screen").style.display = "block";
      });
    document.getElementById("sound-status").addEventListener("click", () => {
      if (input.events["mute"]) input.events["mute"]();
    });

    // Eventos de teclado / ações do input manager
    input.on("escape", () => {
      if (!game.isMenuDemo && game.nave && game.nave.vivo && !game.venceu) {
        game.pausado = !game.pausado;
        document.getElementById("confirm-restart").style.display = "none";
        document.getElementById("pause-screen").style.display = game.pausado
          ? "block"
          : "none";
        if (game.timerApresentacaoFase > 0)
          document.getElementById("level-up-screen").style.display =
            game.pausado ? "none" : "block";
      }
    });

    input.on("restart", () => {
      if (game.isMenuDemo) return;
      if (!game.nave.vivo || game.venceu)
        document.getElementById("btn-reiniciar-sem-salvar").click();
      else {
        game.pausado = true;
        document.getElementById("pause-screen").style.display = "none";
        document.getElementById("confirm-restart").style.display = "block";
        if (game.timerApresentacaoFase > 0)
          document.getElementById("level-up-screen").style.display = "none";
      }
    });

    input.on("mute", () => {
      game.estaMutado = !game.estaMutado;
      document.getElementById("sound-status").innerText = game.estaMutado
        ? "DESLIGADO"
        : "LIGADO";
      document.getElementById("sound-status").style.color = game.estaMutado
        ? "#888"
        : "#ffd700";

      if (game.estaMutado) {
        assets.sounds["bgm"].pause();
        assets.sounds["menu"].pause();
      } else {
        if (game.isMenuDemo) assets.sounds["menu"].play().catch(() => {});
        else if (game.estaJogando && !game.pausado)
          assets.sounds["bgm"].play().catch(() => {});
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (
        game.estaJogando &&
        !game.pausado &&
        !game.isMenuDemo &&
        game.nave &&
        game.nave.vivo
      ) {
        const rect = game.shipCanvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        let novoX = mouseX - game.nave.width / 2;
        if (novoX < 0) novoX = 0;
        if (novoX > game.shipCanvas.width - game.nave.width)
          novoX = game.shipCanvas.width - game.nave.width;
        game.nave.x = novoX;
      }
    });
  } catch (error) {
    console.error("Erro no carregamento:", error);
    splashStatus.innerText = "Erro ao carregar ficheiros do jogo.";
    splashStatus.style.color = "red";
  }
});

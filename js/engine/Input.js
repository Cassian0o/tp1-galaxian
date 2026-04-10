/*
  Input.js
  - Mapeia códigos de tecla para ações do jogo e expõe um gerenciador de eventos simples.
  - `input.keys` mantém o estado atual das teclas (pressionadas/não pressionadas).
  - Eventos registrados via `on(event, callback)` são acionados quando as teclas correspondentes
    são pressionadas (keydown).
*/
export const CODIGOS_TECLAS = {
  27: "escape",
  32: "space",
  37: "left",
  39: "right",
  82: "r",
  114: "r",
  77: "m",
  109: "m",
};

class InputManager {
  constructor() {
    this.keys = { escape: false, space: false, left: false, right: false };
    this.events = {};
  }

  on(event, callback) {
    this.events[event] = callback;
  }

  // Inicializa listeners do DOM para keydown/keyup e dispara callbacks registrados
  initListeners() {
    document.addEventListener("keydown", (e) => {
      if (e.target.tagName.toLowerCase() === "input") return;
      const key = CODIGOS_TECLAS[e.keyCode || e.which];
      if (key && this.keys.hasOwnProperty(key)) {
        e.preventDefault();
        this.keys[key] = true;
      }

      if (key === "escape" && this.events["escape"]) this.events["escape"]();
      if (key === "m" && this.events["mute"]) this.events["mute"]();
      if (key === "r" && this.events["restart"]) this.events["restart"]();
    });

    document.addEventListener("keyup", (e) => {
      if (e.target.tagName.toLowerCase() === "input") return;
      const key = CODIGOS_TECLAS[e.keyCode || e.which];
      if (key && this.keys.hasOwnProperty(key)) {
        e.preventDefault();
        this.keys[key] = false;
      }
    });
  }
}

export const input = new InputManager();

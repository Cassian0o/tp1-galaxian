// js/engine/Input.js
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

  initListeners() {
    document.addEventListener("keydown", (e) => {
      if (e.target.tagName.toLowerCase() === "input") return;

      const key = CODIGOS_TECLAS[e.keyCode || e.which];
      if (key && this.keys.hasOwnProperty(key)) {
        e.preventDefault();
        this.keys[key] = true;
      }

      // Dispara eventos de interface (M, R, ESC) na hora que a tecla desce
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

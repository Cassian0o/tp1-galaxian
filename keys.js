// keys.js
CODIGOS_TECLAS = {
  27: "escape",
  32: "space",
  37: "left",
  39: "right",
};

STATUS_TECLAS = {};
for (codigo in CODIGOS_TECLAS) {
  STATUS_TECLAS[CODIGOS_TECLAS[codigo]] = false;
}

document.onkeydown = function (e) {
  if (e.target.tagName.toLowerCase() === "input") return;

  var codigoTecla = e.keyCode ? e.keyCode : e.charCode;
  if (CODIGOS_TECLAS[codigoTecla]) {
    e.preventDefault();
    STATUS_TECLAS[CODIGOS_TECLAS[codigoTecla]] = true;

    if (CODIGOS_TECLAS[codigoTecla] === "escape") {
      jogo.alternarPausa();
    }
  }
};

document.onkeyup = function (e) {
  if (e.target.tagName.toLowerCase() === "input") return;

  var codigoTecla = e.keyCode ? e.keyCode : e.charCode;
  if (CODIGOS_TECLAS[codigoTecla]) {
    e.preventDefault();
    STATUS_TECLAS[CODIGOS_TECLAS[codigoTecla]] = false;
  }
};

document.onkeypress = function (e) {
  if (e.target.tagName.toLowerCase() === "input") return;

  if (e.which === 114 || e.which === 82 || e.key === "r" || e.key === "R") {
    if (!jogo.nave.vivo || jogo.venceu) {
      jogo.reiniciar();
    } else {
      jogo.confirmarReiniciar();
    }
  } else if (e.which === 109) {
    mutar();
  }
};

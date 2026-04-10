/*
  Utils.js
  - Utilitários pequenos usados pelo jogo. Atualmente contém um polyfill para requestAnimationFrame
    que garante um fallback para setTimeout quando necessário.
*/
export function requestAnimFrame(callback) {
  if (window.requestAnimationFrame) {
    return window.requestAnimationFrame(callback);
  } else if (window.webkitRequestAnimationFrame) {
    return window.webkitRequestAnimationFrame(callback);
  } else {
    return window.setTimeout(callback, 1000 / 60);
  }
}

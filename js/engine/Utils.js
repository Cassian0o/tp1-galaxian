// js/engine/Utils.js
export function requestAnimFrame(callback) {
  if (window.requestAnimationFrame) {
    return window.requestAnimationFrame(callback);
  } else if (window.webkitRequestAnimationFrame) {
    return window.webkitRequestAnimationFrame(callback);
  } else {
    return window.setTimeout(callback, 1000 / 60);
  }
}

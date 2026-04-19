/*
  Utils.js
  - Utilitários pequenos usados pelo jogo. Atualmente contém um polyfill para requestAnimationFrame
    que garante um fallback para setTimeout quando necessário.
*/
// Limita a taxa de chamadas para ~60 FPS independentemente da taxa do monitor.
let _lastAnimTs = 0;
const _TARGET_FPS = 60;
const _FRAME_INTERVAL = 1000 / _TARGET_FPS;

export function requestAnimFrame(callback) {
  const raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
  if (raf) {
    let rafId = null;
    const wrapper = (ts) => {
      if (!_lastAnimTs) _lastAnimTs = ts;
      const elapsed = ts - _lastAnimTs;
      if (elapsed >= _FRAME_INTERVAL) {
        // mantém alinhamento aproximado com o intervalo alvo
        _lastAnimTs = ts - (elapsed % _FRAME_INTERVAL);
        callback();
      } else {
        rafId = raf(wrapper);
      }
    };
    rafId = raf(wrapper);
    return rafId;
  }

  // Fallback simples para ambientes sem requestAnimationFrame
  return window.setTimeout(callback, _FRAME_INTERVAL);
}

// js/engine/Pool.js
export class ObjectPool {
  constructor(tamanhoMax, FactoryClass, contextArgs) {
    this.tamanho = tamanhoMax;
    this.pool = [];
    this.init(FactoryClass, contextArgs);
  }

  init(FactoryClass, contextArgs) {
    this.pool = []; // <- ISSO AQUI garante que os inimigos mortos sejam removidos da memória
    for (let i = 0; i < this.tamanho; i++) {
      const obj = new FactoryClass(contextArgs);
      this.pool[i] = obj;
    }
  }

  getPool() {
    const obj = [];
    for (let i = 0; i < this.tamanho; i++) {
      if (this.pool[i].vivo) obj.push(this.pool[i]);
    }
    return obj;
  }

  get(x, y, velocidade, infoTipo) {
    if (!this.pool[this.tamanho - 1].vivo) {
      this.pool[this.tamanho - 1].spawn(x, y, velocidade, infoTipo);
      this.pool.unshift(this.pool.pop());
    }
  }

  animate() {
    for (let i = 0; i < this.tamanho; i++) {
      if (this.pool[i].vivo) {
        if (this.pool[i].draw()) {
          this.pool[i].clear();
          this.pool.push(this.pool.splice(i, 1)[0]);
        }
      } else {
        break;
      }
    }
  }
}

export class SoundPool {
  constructor(tamanhoMax, src, volume = 1.0) {
    this.tamanho = tamanhoMax;
    this.pool = [];
    this.somAtual = 0;
    for (let i = 0; i < this.tamanho; i++) {
      const s = new Audio(src);
      s.volume = volume;
      s.load();
      this.pool[i] = s;
    }
  }

  get() {
    if (
      this.pool[this.somAtual].currentTime === 0 ||
      this.pool[this.somAtual].ended
    ) {
      this.pool[this.somAtual].play().catch(() => {});
    }
    this.somAtual = (this.somAtual + 1) % this.tamanho;
  }
}

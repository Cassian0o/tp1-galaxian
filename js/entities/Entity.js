/*
  Entity.js
  - Classe base simples para todas as entidades do jogo (posição, dimensão, estado de vida).
  - Fornece métodos utilitários básicos usados por entidades concretas.
*/
export default class Entity {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.velocidade = 0;
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.grupoColisao = "";
    this.colidindo = false;
    this.tipo = "";
    this.vivo = false;
  }

  init(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  colideCom(outro) {
    return this.grupoColisao === outro.tipo;
  }
}

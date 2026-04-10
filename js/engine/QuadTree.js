/*
  QuadTree.js
  - Estrutura espacial para acelerar buscas de colisão.
  - Divide o espaço em até `maxNiveis` níveis e mantém objetos em nós apropriados.
  - Métodos principais: insert, findObjects, getAllObjects, clear.
*/
export default class QuadTree {
  constructor(boundBox, lvl = 0) {
    this.maxObjetos = 10;
    this.maxNiveis = 5;
    this.limites = boundBox || { x: 0, y: 0, width: 0, height: 0 };
    this.objetos = [];
    this.nodes = [];
    this.nivel = lvl;
  }

  clear() {
    this.objetos = [];
    for (let i = 0; i < this.nodes.length; i++) this.nodes[i].clear();
    this.nodes = [];
  }

  getAllObjects(objetosRetornados) {
    for (let i = 0; i < this.nodes.length; i++)
      this.nodes[i].getAllObjects(objetosRetornados);
    for (let i = 0, len = this.objetos.length; i < len; i++)
      objetosRetornados.push(this.objetos[i]);
    return objetosRetornados;
  }

  findObjects(objetosRetornados, obj) {
    if (typeof obj === "undefined") return;
    const indice = this.getIndex(obj);
    if (indice !== -1 && this.nodes.length)
      this.nodes[indice].findObjects(objetosRetornados, obj);
    for (let i = 0, len = this.objetos.length; i < len; i++)
      objetosRetornados.push(this.objetos[i]);
    return objetosRetornados;
  }

  insert(obj) {
    if (typeof obj === "undefined") return;
    if (obj instanceof Array) {
      for (let i = 0, len = obj.length; i < len; i++) this.insert(obj[i]);
      return;
    }
    if (this.nodes.length) {
      const indice = this.getIndex(obj);
      if (indice !== -1) {
        this.nodes[indice].insert(obj);
        return;
      }
    }
    this.objetos.push(obj);
    if (this.objetos.length > this.maxObjetos && this.nivel < this.maxNiveis) {
      if (this.nodes[0] == null) this.split();
      let i = 0;
      while (i < this.objetos.length) {
        const indice = this.getIndex(this.objetos[i]);
        if (indice !== -1)
          this.nodes[indice].insert(this.objetos.splice(i, 1)[0]);
        else i++;
      }
    }
  }

  getIndex(obj) {
    let indice = -1;
    const pMidV = this.limites.x + this.limites.width / 2;
    const pMidH = this.limites.y + this.limites.height / 2;
    const qSup = obj.y < pMidH && obj.y + obj.height < pMidH;
    const qInf = obj.y > pMidH;

    if (obj.x < pMidV && obj.x + obj.width < pMidV) {
      if (qSup) indice = 1;
      else if (qInf) indice = 2;
    } else if (obj.x > pMidV) {
      if (qSup) indice = 0;
      else if (qInf) indice = 3;
    }
    return indice;
  }

  split() {
    const subL = (this.limites.width / 2) | 0;
    const subA = (this.limites.height / 2) | 0;
    this.nodes[0] = new QuadTree(
      {
        x: this.limites.x + subL,
        y: this.limites.y,
        width: subL,
        height: subA,
      },
      this.nivel + 1,
    );
    this.nodes[1] = new QuadTree(
      { x: this.limites.x, y: this.limites.y, width: subL, height: subA },
      this.nivel + 1,
    );
    this.nodes[2] = new QuadTree(
      {
        x: this.limites.x,
        y: this.limites.y + subA,
        width: subL,
        height: subA,
      },
      this.nivel + 1,
    );
    this.nodes[3] = new QuadTree(
      {
        x: this.limites.x + subL,
        y: this.limites.y + subA,
        width: subL,
        height: subA,
      },
      this.nivel + 1,
    );
  }
}

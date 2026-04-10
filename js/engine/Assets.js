// js/engine/Assets.js
export const assets = {
  images: {},
  sounds: {},
};

export class AssetManager {
  static async carregarImagem(key, src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        assets.images[key] = img;
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`Falha ao carregar imagem: ${src}`);
        resolve(img); // Resolve mesmo com erro para não travar o jogo
      };
      img.src = src;
    });
  }

  static async carregarAudio(key, src, isLoop = false, volume = 1.0) {
    return new Promise((resolve) => {
      const audio = new Audio(src);
      audio.loop = isLoop;
      audio.volume = volume;

      let resolvido = false;
      const finalizar = () => {
        if (resolvido) return;
        resolvido = true;
        assets.sounds[key] = audio;
        resolve(audio);
      };

      // Tenta resolver se carregou perfeitamente ou se deu erro
      audio.addEventListener("canplaythrough", finalizar, { once: true });
      audio.addEventListener("error", finalizar, { once: true });

      // Trava de segurança: Se o navegador demorar mais de 1.5s, força a inicialização
      setTimeout(finalizar, 1500);

      audio.load();
    });
  }

  static async carregarTudo() {
    const promises = [
      this.carregarImagem("background", "images/bg.png"),
      this.carregarImagem("stars", "images/starfield.png"),
      this.carregarImagem("spaceship", "images/ship2.png"),
      this.carregarImagem("bullet", "images/bullet.png"),
      this.carregarImagem("enemy", "images/enemy.png"),
      this.carregarImagem("enemyFast", "images/enemy_fast.png"),
      this.carregarImagem("enemyTough", "images/enemy_tough.png"),
      this.carregarImagem("enemyBullet", "images/bullet_enemy.png"),
      this.carregarImagem("explosion", "images/explosion.png"),
      this.carregarImagem("itemMulti", "images/item_multi.png"),
      this.carregarImagem("itemSlow", "images/item_slow.png"),
      this.carregarImagem("itemBomb", "images/item_bomb.png"),
      this.carregarImagem("itemLife", "images/item_life.png"),
      this.carregarAudio("bgm", "sounds/Gravity_Well_Ascent.mp3", false, 0.25),
      this.carregarAudio("menu", "sounds/menu_theme.mp3", true, 0.75),
      this.carregarAudio("gameover", "sounds/game_over.mp3", false, 0.25),
    ];
    await Promise.all(promises);
  }
}

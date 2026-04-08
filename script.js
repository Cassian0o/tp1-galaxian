
/**
 * Define um objeto para armazenar todas as nossas imagens do jogo para que as imagens sejam criadas apenas uma vez. Este é um Singleton
 */

var imageRepository = function (){
    // definir imagens
    this.background = new Image();

    // Definir caminho das imagens
    this.background.src = 'imgs/bg.png';
};

/**
 * Crie o objeto Drawable que será a classe base para todos os objetos desenhável.
 * Configure variáveis padrão que todos os objetos filhos herdam, bem como funções padrão
 */

function Drawable(){
    this.init = function (x, y){
        this.x = x;
        this.y = y;
    };

    this.speed = 0;
    this.canvasWidth = 0;
    this.canvasHeight = 0;

    this.draw = function()
};
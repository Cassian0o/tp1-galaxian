# Galo: A invasão Celeste

## 📝 Descrição
**Galo: A invasão Celeste** é um jogo de tiro espacial (shoot 'em up) inspirado no clássico *Galaxian*. O jogador controla uma nave heroica na parte inferior da tela, defendendo o solo de uma invasão alienígena organizada em esquadras que se movimentam lateralmente e descem ao atingir as bordas. O objetivo é destruir todos os invasores antes que eles atinjam o solo ou destruam a sua nave.

## 👥 Autores
* **Marcelo Cassiano**
* **Thainá Martins**

## 🚀 Itens Adicionais Implementados
Além das funcionalidades básicas obrigatórias, o projeto inclui os seguintes diferenciais:

### Gráficos e Texturas
* **Texturas Animadas:** Uso de *spritesheets* para animações de explosões.
* **Fundo Animado e Estrelas:** Implementação de um *starfield* procedural com estrelas que piscam (efeito *twinkle*) e se deslocam em diferentes velocidades para criar profundidade.

### Jogabilidade (Gameplay)
* **Ataque Rasante:** Inimigos saem da formação para realizar ataques agressivos utilizando **Curvas de Bézier** para definir a trajetória de mergulho.
* **Inimigos Diferentes:** Implementação de três tipos de naves inimigas (Comum, Veloz e Resistente), cada uma com atributos de vida, tamanho e frequência de tiro distintos.
* **Sistema de Fases:** O jogo possui fases "curadas" com nomes específicos (Setor Alfa, Beta, Zona Vermelha e La Bestia Negra) que aumentam progressivamente a velocidade e agressividade dos inimigos.
* **Itens (Power-ups):** Inimigos podem deixar cair itens ao morrer, incluindo **Tiro Múltiplo**, **Lentidão** (afeta inimigos), **Bomba** (limpa parte da tela) e **Vida Extra**.

### HUD e Persistência
* **Pontuação e Highscore:** Sistema de pontos baseado no tipo de inimigo e altura do abate, com os 10 melhores recordes salvos localmente via `localStorage`.
* **Vidas:** O jogador possui um sistema de 3 vidas, com exibição visual na HUD e período de invulnerabilidade temporária após o dano.

### Interface e Som
* **Sons e Música:** Efeitos sonoros para lasers e explosões, além de trilhas sonoras distintas para o menu e para a partida.
* **Controle via Mouse:** Além do teclado, é possível controlar o movimento lateral da nave utilizando o cursor do mouse.
* **Telas do Jogo:** Conjunto completo de telas, incluindo *Splash Screen*, Menu Inicial, Instruções, Opções, Créditos e Game Over.

## 🎮 Controles
* **Movimentação:** Setas (← →) ou Mouse.
* **Atirar:** Barra de ESPAÇO.
* **Pausar/Continuar:** Tecla ESC.
* **Reiniciar:** Tecla R (com tela de confirmação in-game).
* **Mute:** Tecla M.

---

## 🔗 Links
* **Repositório/Live Demo:** [https://cassian0o.github.io/tp1-galaxian/]
* **Vídeo do Trailer:**

## 📸 Screenshots
1. *Menu Inicial com modo Demo ao fundo.*
2. *Gameplay com inimigos em formação e ataque rasante ativo.*
3. *Tela de Game Over*
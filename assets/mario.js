const mario = document.querySelector(".mario");
const cano = document.querySelector(".cano");
const comandos = document.querySelector(".comandos");
let contagem = 0;

// Músicas do jogo
const musicaFundo = new Audio("./assets/audio/musica_mario.mp3"); musicaFundo.volume = 0.5; musicaFundo.loop = false;
const puloMario = new Audio('./assets/audio/mario_pulando.mp3'); puloMario.volume = 0.2;
const marioMorrendo = new Audio('./assets/audio/mario_morrendo.mp3'); marioMorrendo.volume = 0.5;

//No inicio do documento, ativa:
$(document).ready(function () {
    $(".cano").css("display", "none"); $(".nuvem-animação").css("animation", "none"); $("#yoshi").css("animation", "none"); $("#yoshi-reverse").css("animation", "none");
});

// Função para iniciar/reiniciar o jogo
const iniciaJogo = () => {
    contagem = 0; $("#contador").text(`Pontos: ${contagem}`);

    musicaFundo.play();
    // Muda a imagem do Mario de acordo com a sua escolha de personagem
    var imagemMario = mario.getAttribute('src'); mario.src = (imagemMario == './assets/img/mario.gif') ? './assets/img/mario.gif' : './assets/img/mario-yoshi.gif';

    // Mostra:
    $(".mario").css("display", "flex"); $(".cano").css("display", "flex"); $(".game-board").css("borderBottom", "15px solid rgb(35, 160, 35");

    // Oculta
    $(".comandos").removeClass("active"); $(".botoes").css("display", "none"); $(".comandos").css("display", "none"); $(".game-over").css("visibility", "hidden"); $(".iniciar").css("visibility", "hidden");

    // Ativa as animações
    setTimeout(() => {
        $(".mario").css("animation", ""); $(".nuvem-animação").css("animation", ""); $("#yoshi").css("animation", ""); $("#yoshi-reverse").css("animation", "");
    }, 5);

    // Loop que verifica se você perdeu
    const loop = setInterval(() => {
        const margemEsquerdaCano = cano.offsetLeft; const alturaPuloMario = +window.getComputedStyle(mario).bottom.replace("px", "");

        if (margemEsquerdaCano <= 120 && margemEsquerdaCano > 0 && alturaPuloMario < 80) {
            musicaFundo.pause(); musicaFundo.currentTime = 0;
            $(".botoes").css("display", "flex");
            $(".game-over").css("visibility", "visible");

            $(".cano").css("display", "none");
            $(".nuvem-animação").css("animation", "none");
            $("#yoshi").css("animation", "none"); $("#yoshi-reverse").css("animation", "none")
            $(".mario").css("display", "none");
            $(".game-board").css("border", "5px solid #363636");
            clearInterval(loop);
            marioMorrendo.play(); marioMorrendo.loop = false;
        };
    }, 10);
};

// Função do pulo e pontuação
const pulo = () => {
    // Música
    puloMario.play(); puloMario.loop = 0;
    // Pulo
    $(".mario").addClass("jump"); setTimeout(() => { $(".mario").removeClass("jump"); }, 500);
    // Pontuação
    const margemEsquerdaCano = cano.offsetLeft;
    if (margemEsquerdaCano > 110 && margemEsquerdaCano < 240) {
        contagem++; $("#contador").text(`Pontos: ${contagem}`);
    };
};

// Botões de inicio e reinicio
$("#iniciar").click(() => { iniciaJogo(); });
$("#reiniciar").click(() => { iniciaJogo(); });

const gameOver = document.querySelector(".game-over")
const gameStart = document.querySelector(".iniciar");

// Funções de pressionamento de teclas do teclado
$(document).keydown(function (e) {

    // Barra de espaço e seta para cima ativam a função de pulo
    if (e.which === 32 && gameOver.style.visibility === 'hidden') { pulo(); };
    if (e.which === 38 && gameOver.style.visibility === 'hidden') { pulo(); };
    // Teclas enter e espaço iniciam o jogo
    if (e.which === 13) { if (gameStart.style.visibility !== 'hidden' && comandos.style.display !== 'block') { iniciaJogo(); } };
    if (e.which === 32) { if (gameOver.style.visibility === 'visible' && comandos.style.display !== 'block') { iniciaJogo() }; };
    // Tecla C mostra a lista de comandos do jogo
    if (e.which === 67) {
        if (gameStart.style.visibility !== "hidden" || gameOver.style.visibility !== "hidden") {
            $(".comandos").toggleClass("active");
        };
    };
    // Tecla 1 muda de personagem
    if (e.which === 49) {
        if (gameStart.style.visibility !== "hidden" || gameOver.style.visibility !== "hidden") {
            $(".mario").prop("src", "./img/mario.gif"); $("#img1").addClass('active'); $("#msg-personagem").css("opacity", "1"); $("#personagem01").addClass("selecionado");
            setTimeout(() => { $("#msg-personagem").css("opacity", "0"); $("#img1").removeClass('active'); $("#personagem01").removeClass("selecionado") }, 1000)
        };
    };
    // Tecla 2 muda de personagem
    if (e.which === 50) {
        if (gameStart.style.visibility !== "hidden" || gameOver.style.visibility !== "hidden") {
            $(".mario").prop("src", "./img/mario-yoshi.gif"); $("#img2").addClass('active'); $("#msg-personagem").css("opacity", "1"); $("#personagem02").addClass("selecionado");
            setTimeout(() => { $("#msg-personagem").css("opacity", "0"); $("#img2").removeClass('active'); $("#personagem02").removeClass("selecionado") }, 1000)
        };
    };
});

// Funções para mudar de personagem
const mudarPersonagem01 = () => {
    $(".mario").prop("src", "./img/mario.gif"); $("#msg-personagem").css("opacity", "1"); $("#personagem01").addClass("selecionado");
    setTimeout(() => { $("#msg-personagem").css("opacity", "0"); $("#personagem01").removeClass("selecionado"); }, 1000)
};
const mudarPersonagem02 = () => {
    $(".mario").prop("src", "./img/mario-yoshi.gif"); $("#msg-personagem").css("opacity", "1"); $("#personagem02").addClass("selecionado");
    setTimeout(() => { $("#msg-personagem").css("opacity", "0"); $("#personagem02").removeClass("selecionado"); }, 1000)
};

// Botão que exibe a lista de comandos
$("#exibir-comandos").click(function () { $(".comandos").toggleClass("active"); });

// Div que aparece apenas em telas de largura menor que 1092px
$(".area-mobile").on("touchstart", () => { if (gameOver.style.visibility === 'hidden') { pulo(); }; });

// Otimização de alguns botões em mobile 
$("#personagem01").on("touchstart click", (e) => {
    if (e.type == "touchstart") { mudarPersonagem01(); e.preventDefault(); }; if (e.type == "click") { mudarPersonagem01(); };
});
$("#personagem02").on("touchstart click", (e) => {
    if (e.type == "touchstart") { mudarPersonagem02(); e.preventDefault(); }; if (e.type == "click") { mudarPersonagem02(); };
});
$("#iniciar-mobile").on("touchstart", () => { iniciaJogo(); });
$("#reiniciar-mobile").on("touchstart", () => { iniciaJogo(); });

// Mostra/oculta o botão de inicio e reinicio do jogo no mobile
setInterval(() => {
    if ((gameStart.style.visibility !== 'hidden')) {
        $("#iniciar-mobile").css("display", "flex");
    } else {
        $("#iniciar-mobile").css("display", "none");
    };
    if ((gameOver.style.visibility === 'visible') && (gameStart.style.visibility === 'hidden')) {
        $("#reiniciar-mobile").css("display", "flex");
    } else {
        $("#reiniciar-mobile").css("display", "none");
    };
}, 1);
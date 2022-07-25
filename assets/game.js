const jogador = document.querySelector(".jogador");
const obstaculo = document.querySelector(".obstaculo");
// Músicas do jogo
const somPulo = new Audio('./assets/audio/jump.wav'); somPulo.volume = 0.8;
const somGameOver = new Audio('./assets/audio/hit.wav'); somGameOver.volume = 0.5;
const musicaFundo = new Audio('./assets/audio/background.mp3'); musicaFundo.volume = 0.1;
let dadosLocalStorage = JSON.parse(localStorage.getItem('pontuacao')) || [];

function playPause() {
    if ($("#player").hasClass("fa-play")) {
        musicaFundo.play();
        $("#player").removeClass("fa-play");
        $("#player").addClass("fa-pause");
    } else {
        musicaFundo.pause();
        $("#player").removeClass("fa-pause");
        $("#player").addClass("fa-play");
    }
};
function abaixaVolume() {
    if (musicaFundo.volume > 0) musicaFundo.volume -= 0.1;
    $("#mostraVolume").text((musicaFundo.volume).toFixed(1));

    setTimeout(() => $("#mostraVolume").text(""), 4000);
}
function aumentaVolume() {
    if (musicaFundo.volume < 1) musicaFundo.volume += 0.1;
    $("#mostraVolume").text((musicaFundo.volume).toFixed(1));

    setTimeout(() => $("#mostraVolume").text(""), 4000);
}

// Funções que manipulam os dados do local storage
// Adiciona
const salvarStorage = () => localStorage.setItem('pontuacao', JSON.stringify(dadosLocalStorage));
// Atualiza
const atualizarStorage = () => {
    for (dado of dadosLocalStorage) {
        let texto = document.createTextNode(dado);
        let el = document.createElement("li");
        $(el).append(texto);
        $(".lista").append($(el));
    };
};
// Exclui
const deletarStorage = () => {
    if (confirm("Confirmar a remoção de todos os dados do histórico?")) {
        dadosLocalStorage.splice(0, dadosLocalStorage.length);
        atualizarStorage();
        salvarStorage();
        window.location.reload();
    };
};

$(window).on("load", () => {
    // Botões do menu de inicio e game-over
    $("#iniciar").click(iniciaJogo);
    $("#reiniciar").click(iniciaJogo);

    // Botão que mostra o histórico de tempo do jogador
    $(".toggler").on("touchstart click", e => {
        if (e.type == "touchstart") {
            $(".pontuacao").toggleClass("clicked");
            e.preventDefault();
            return;
        };
        $(".pontuacao").toggleClass("clicked");
    });

    // Botão que exclui o histórico de tempo
    $(".lixeira").on("touchstart click", e => {
        if (e.type == "touchstart") {
            e.preventDefault();
            deletarStorage();
            return;
        };
        deletarStorage();
    });

    $(obstaculo).css("display", "none");
    atualizarStorage();
});


// Função do pulo e pontuação
const pulo = () => {
    // Música
    somPulo.play();
    somPulo.loop = false;
    // Pulo
    $(jogador).addClass("jump");
    setTimeout(() => $(jogador).removeClass("jump"), 500);
};

let arr = [];
// Loop que verifica se você perdeu
const verifyGame = () => {
    let contagem = 0;
    this.contadorTempo = setInterval(() => $("#contador").text(`Tempo: ${contagem++}`), 1000);

    const loop = setInterval(() => {
        let margemEsquerdaObstaculo = obstaculo.offsetLeft;
        let alturaPulo = +window.getComputedStyle(jogador).bottom.replace("px", "");

        if (margemEsquerdaObstaculo <= 120 && margemEsquerdaObstaculo > 0 && alturaPulo <= 50) {
            jogador.src = './assets/img/animationCaido.png';

            $(obstaculo).css("left", margemEsquerdaObstaculo);
            $(obstaculo).css("animation", "none");
            $(jogador).css("bottom", "-10px");

            somGameOver.play();
            somGameOver.loop = false;

            $(".botoes").css("display", "flex");
            $(".game-over").css("visibility", "visible");

            clearInterval(loop);
            clearInterval(contadorTempo);

            let el = document.createElement("li");
            $(el).html(`Tempo: ${contagem - 1} segundos`)
            $(".lista").append($(el));

            // ---- Verificar o maior número na lista do histórico de tempos 
            $('.lista').children().each(function () {
                arr.push($(this).html());
            });

            const numero = arr.map(e => {
                var notmp = e.replace("Tempo: ", "");
                var nosec = notmp.replace(" segundos", "");
                return +nosec;
            });

            const tempoMaximo = Math.max.apply(null, numero);

            if ($("#contador").text().includes(tempoMaximo))
                $("#mostrarTempo").text(`Parábens! ${contagem - 1} segundos é seu novo record!`)
            else
                $("#mostrarTempo").text(`Seu tempo: ${contagem - 1} segundos`)

            dadosLocalStorage.push($(el).html());
            salvarStorage();

            $("#contador").text("");
            // ---- 
        };
    }, 10);
}
// Função para iniciar/reiniciar o jogo
const iniciaJogo = () => {
    $("#contador").text("Tempo: 0");

    // Muda a imagem do jogador de acordo com a sua escolha de personagem
    let personagemSelecionado = jogador.getAttribute('src');
    jogador.src = (personagemSelecionado == './assets/img/animationCaido.png' || personagemSelecionado == './assets/img/animation.gif') ?
        './assets/img/animation.gif' : './assets/img/mario-yoshi.gif';

    // Mostra:
    $(obstaculo).css("display", "flex");
    $(jogador).css("display", "flex");
    $(obstaculo).css("left", "");
    $(jogador).css("bottom", "0");

    // Oculta
    $(".botoes").css("display", "none");
    $(".game-over").css("visibility", "hidden");
    $(".iniciar").css("visibility", "hidden");

    // Ativa as animações
    setTimeout(() => {
        $(jogador).css("animation", "");
        $(obstaculo).css("animation", "");
    }, 10);

    // Função que contém o loop que verifica quando o jogador perde
    verifyGame();
};

const gameOver = document.querySelector(".game-over");
const gameStart = document.querySelector(".iniciar");

// Funções de pressionamento de teclas do teclado
$(document).keydown(function (e) {
    // Barra de espaço e seta para cima ativam a função de pulo
    if (e.which === 32 && gameOver.style.visibility === 'hidden') pulo();
    if (e.which === 38 && gameOver.style.visibility === 'hidden') pulo();

    // Teclas enter e espaço iniciam o jogo
    if (e.which === 13 && gameStart.style.visibility !== 'hidden') iniciaJogo();
    if (e.which === 32 && gameOver.style.visibility === 'visible') iniciaJogo();

    // Tecla 1 muda de personagem
    if (e.which === 49 && (gameStart.style.visibility !== "hidden" || gameOver.style.visibility !== "hidden"))
        mudarPersonagem01();

    // Tecla 2 muda de personagem
    if (e.which === 50 && (gameStart.style.visibility !== "hidden" || gameOver.style.visibility !== "hidden"))
        mudarPersonagem02();
});

// Funções para mudar de personagem
const mudarPersonagem01 = () => {
    $(jogador).prop("src", "./assets/img/animation.gif");
    $("#msg-personagem").css("opacity", "1");
    $("#personagem01").addClass("selecionado");
    setTimeout(() => {
        $("#msg-personagem").css("opacity", "0");
        $("#personagem01").removeClass("selecionado");
    }, 1000);
};
const mudarPersonagem02 = () => {
    $(jogador).prop("src", "./assets/img/mario-yoshi.gif");
    $("#msg-personagem").css("opacity", "1");
    $("#personagem02").addClass("selecionado");
    setTimeout(() => {
        $("#msg-personagem").css("opacity", "0");
        $("#personagem02").removeClass("selecionado");
    }, 1000);
};

// Otimização de alguns botões em mobile 
$(".area-mobile").on("touchstart", () => { if (gameOver.style.visibility === 'hidden') pulo() });

$("#personagem01").on("touchstart click", e => {
    if (e.type == "touchstart") {
        e.preventDefault();
        mudarPersonagem01();
        return;
    };
    mudarPersonagem01();
});

$("#personagem02").on("touchstart click", (e) => {
    if (e.type == "touchstart") {
        e.preventDefault();
        mudarPersonagem02();
        return;
    };
    mudarPersonagem02();
});

$("#iniciar-mobile").on("touchstart", iniciaJogo);
$("#reiniciar-mobile").on("touchstart", iniciaJogo);

// Mostra/oculta o botão de inicio e reinicio do jogo no mobile
$(document).ready(function () {
    if ($(window).width() <= 991.98) {
        setInterval(() => {
            if (gameStart.style.visibility !== 'hidden') $("#iniciar-mobile").css("display", "flex")
            else $("#iniciar-mobile").css("display", "none");

            if (gameOver.style.visibility === 'visible') $("#reiniciar-mobile").css("display", "flex")
            else $("#reiniciar-mobile").css("display", "none");
        }, 100);
    }
})
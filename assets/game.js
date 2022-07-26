const jogador = document.querySelector(".jogador");
const obstaculo = document.querySelector(".obstaculo");
// Músicas do jogo
const somPulo = new Audio('./assets/audio/jump.wav'); somPulo.volume = 1;
const somGameOver = new Audio('./assets/audio/hit.wav'); somGameOver.volume = 0.8;
const musicaFundo = new Audio('./assets/audio/background.mp3');
let dadosLocalStorage = JSON.parse(localStorage.getItem('pontuacao')) || [];

// Funções dos botões que controlam a música de background
function mute() {
    if ($("#mute-btn").hasClass("fa-volume-xmark")) {
        musicaFundo.muted = true;
        $("#mute-btn").attr("title", "desmutar");
        $("#mute-btn").removeClass("fa-volume-xmark");
        $("#mute-btn").addClass("fa-volume-high");
    } else {
        musicaFundo.muted = false;
        $("#mute-btn").attr("title", "mutar");
        $("#mute-btn").removeClass("fa-volume-high");
        $("#mute-btn").addClass("fa-volume-xmark");
    }
};
function playPause() {
    if ($("#player").hasClass("fa-play") || musicaFundo.pause()) {
        musicaFundo.play();
        $("#player").attr("title", "pausar");
        $("#player").removeClass("fa-play");
        $("#player").addClass("fa-pause");
    } else {
        musicaFundo.pause();
        $("#player").attr("title", "iniciar");
        $("#player").removeClass("fa-pause");
        $("#player").addClass("fa-play");
    }
};
function abaixaVolume() {
    if (musicaFundo.volume > 0) musicaFundo.volume -= 0.1;
    $("#mostraVolume").text("Volume: " + (musicaFundo.volume).toFixed(1));
}
function aumentaVolume() {
    if (musicaFundo.volume < 1) musicaFundo.volume += 0.1;
    $("#mostraVolume").text("Volume: " + (musicaFundo.volume).toFixed(1));
}

// Botões que ativam as funções
$("#mute-btn").on("click keydown touchstart", e => {
    if (e.type == 'touchstart') {
        e.preventDefault()
        mute();
    }
    if (e.type == 'click' || (e.type == 'keydown' && e.which == 13)) mute()
})
$("#player").on("click keydown touchstart", e => {
    if (e.type == 'touchstart') {
        e.preventDefault()
        playPause();
    }
    if (e.type == 'click' || (e.type == 'keydown' && e.which == 13)) playPause()
})
$("#aumenta-btn").on("click keydown touchstart", e => {
    if (e.type == 'touchstart') {
        e.preventDefault()
        aumentaVolume();
    }
    if (e.type == 'click' || (e.type == 'keydown' && e.which == 13)) aumentaVolume()
})

$("#abaixa-btn").on("click keydown touchstart", e => {
    if (e.type == 'touchstart') {
        e.preventDefault()
        abaixaVolume();
    }
    if (e.type == 'click' || (e.type == 'keydown' & e.which == 13)) abaixaVolume()
})

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

// Função para não deixar o código repetitivo
const scoreToggler = () => {
    $(".pontuacao").toggleClass("clicked");

    if ($(".pontuacao").hasClass("clicked"))
        $(".lixeira").attr("tabindex", "0");
    else
        $(".lixeira").attr("tabindex", "-1");
};
const playerToggler = () => {
    $(".player-control").toggleClass("clicked");

    if ($(".player-control").hasClass("clicked"))
        $("#player-toggler").attr("tabindex", "0");
    else
        $("#player-toggler").attr("tabindex", "-1");
};

$(window).on("load", () => {
    // Botões do menu de inicio e game-over
    $("#iniciar").click(iniciaJogo);
    $("#reiniciar").click(iniciaJogo);

    // Botão que mostra o histórico de tempo do jogador
    $(".toggler").on("touchstart click keydown", e => {
        if (e.type == "touchstart") {
            e.preventDefault();
            scoreToggler();
        }
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13))
            scoreToggler();
    });

    // Botão que mostra os controles da música de fundo
    $("#player-toggler").on("touchstart click keydown", e => {
        if (e.type == "touchstart") {
            e.preventDefault();
            playerToggler();
        };
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13))
            playerToggler();
    });

    // Botão que exclui o histórico de tempo
    $(".lixeira").on("touchstart click keydown", e => {
        if (e.type == "touchstart") {
            e.preventDefault();
            deletarStorage();
        };
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13))
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
            $("#personagem01").attr("tabindex", "0");

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
    $("#personagem01").attr("tabindex", "-1");

    $("#contador").text("Tempo: 0");
    if ($(".player-control").hasClass("clicked"))
        $(".player-control").removeClass("clicked");

    if ($(".pontuacao").hasClass("clicked"))
        $(".pontuacao").removeClass("clicked");

    playPause()

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

    // Tecla espaço inicia o jogo
    if (e.which === 32 && gameStart.style.visibility !== 'hidden' && !$(".player-control").hasClass("clicked") && !$(".pontuacao").hasClass("clicked")) iniciaJogo();
    if (e.which === 32 && gameOver.style.visibility === 'visible' && !$(".player-control").hasClass("clicked") && !$(".pontuacao").hasClass("clicked")) iniciaJogo();

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

$("#personagem01").on("touchstart click keydown", e => {
    if (e.type == "touchstart") {
        e.preventDefault();
        mudarPersonagem01();
    };
    if (e.type == 'click' || (e.type == 'keydown' && e.which == 13))
        mudarPersonagem01();
});

$("#personagem02").on("touchstart click keydown", (e) => {
    if (e.type == "touchstart") {
        e.preventDefault();
        mudarPersonagem02();
    };
    if (e.type == 'click' || (e.type == 'keydown' && e.which == 13))
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
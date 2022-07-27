const jogador = document.querySelector(".jogador");
const obstaculo = document.querySelector(".obstaculo");

const gameOver = document.querySelector(".game-over");
const gameStart = document.querySelector(".iniciar");

const somPulo = new Audio('./assets/audio/jump.wav');
const somGameOverP1 = new Audio('./assets/audio/boyShout.wav');
const somGameOverP2 = new Audio('./assets/audio/girlShout.wav');
const musicaFundo = new Audio('./assets/audio/background.mp3');
musicaFundo.loop = true;
somGameOverP1.volume = 0.5;
somGameOverP2.volume = 0.5;
somPulo.volume = 0.8;

// Variáveis que armazenam as velocidades que o obstáculo pode ter
const velocidadeFacil = '1.5s';
const velocidadeMedia = '1.2s';
const velocidadeDificil = '0.8s';

// Botões de dificuldade
const btnModoFacil = document.querySelectorAll(".facil");
const btnModoMedio = document.querySelectorAll(".medio");
const btnModoDificil = document.querySelectorAll(".dificil");

// Variáveis para os personagens do jogo - armazenam a pasta em que as imagens estão
const p1gameOver = "./assets/img/falledBoy.png";
const p2gameOver = "./assets/img/falledGirl.png";
const p1 = "./assets/img/boy.gif";
const p2 = "./assets/img/girl.gif";

// Dados do local storage em um array
let dadosLocalStorage = JSON.parse(localStorage.getItem('pontuacao')) || [];
// Array que armazena o conteúdo dos itens da lista do histórico de tempo (na função verificaJogo)
let arr = [];


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
};

function aumentaVolume() {
    if (musicaFundo.volume < 1) musicaFundo.volume += 0.1;
    $("#mostraVolume").text("Volume: " + (musicaFundo.volume).toFixed(1));
};


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


const dificuldadeJogo = () => {
    if ($(btnModoFacil).hasClass("selected"))
        $(obstaculo).css("animation", `obstaculo ${velocidadeFacil} infinite linear .6s`)

    else if ($(btnModoMedio).hasClass("selected"))
        $(obstaculo).css("animation", `obstaculo ${velocidadeMedia} infinite linear .6s`)

    else if ($(btnModoDificil).hasClass("selected"))
        $(obstaculo).css("animation", `obstaculo ${velocidadeDificil} infinite linear .6s`)

    else
        $(obstaculo).css("animation", `obstaculo ${velocidadeFacil} infinite linear .6s`)
};


// Funções para não deixar os códigos repetitivos
const scoreToggler = () => {
    $(".pontuacao").toggleClass("clicked");

    if ($(".pontuacao").hasClass("clicked")) $("#lixeira").attr("tabindex", "0");
    else $("#lixeira").attr("tabindex", "-1");

    if ($(".player-control").hasClass("clicked")) $(".player-control").removeClass("clicked");
    if ($(".comandos").hasClass("clicked")) $(".comandos").removeClass("clicked");
};

const commandsToggler = () => {
    $(".comandos").toggleClass("clicked");

    if ($(".player-control").hasClass("clicked")) $(".player-control").removeClass("clicked");
    if ($(".pontuacao").hasClass("clicked")) $(".pontuacao").removeClass("clicked");
};

const playerToggler = () => {
    $(".player-control").toggleClass("clicked");

    if ($(".pontuacao").hasClass("clicked")) $(".pontuacao").removeClass("clicked");
    if ($(".comandos").hasClass("clicked")) $(".comandos").removeClass("clicked");
};


// Função do pulo do personagem
const pulo = () => {
    $(jogador).addClass("jump");

    if ($(jogador).hasClass("jump")) {
        somPulo.play();
        somPulo.loop = false;
    };

    setTimeout(() => {
        $(jogador).removeClass("jump")
    }, 500);
};


// Loop que verifica se você perdeu
const verificaJogo = () => {
    let contagem = 1;
    this.contadorTempo = setInterval(() => $("#contador").text(`Tempo: ${contagem++} `), 1000);

    this.loop = setInterval(() => {
        const margemEsquerdaObstaculo = obstaculo.offsetLeft;
        const alturaPulo = +window.getComputedStyle(jogador).bottom.replace("px", "");

        if (margemEsquerdaObstaculo <= 120 && margemEsquerdaObstaculo > 0 && alturaPulo <= 50) {
            $(document).attr("title", "Game Over...");

            let personagemSelecionado = jogador.getAttribute('src');
            jogador.src = (personagemSelecionado == p1) ? p1gameOver : p2gameOver;
            if ((personagemSelecionado == p1)) {
                somGameOverP1.play(); somGameOverP1.loop = false;
            } else {
                somGameOverP2.play(); somGameOverP2.loop = false;
            };

            $(jogador).css("bottom", "-10px");
            $(obstaculo).css("left", margemEsquerdaObstaculo);

            $(".botoes").css("display", "flex");
            $(gameOver).css("visibility", "visible");

            clearInterval(loop);
            clearInterval(contadorTempo);

            let el = document.createElement("li");

            dificuldadeJogo();
            var obstacleAnimation = window.getComputedStyle(obstaculo).animation;

            if (obstacleAnimation.includes(velocidadeFacil))
                $(el).html(`Tempo: ${contagem - 1} segundos - dificuldade: fácil`);
            else if (obstacleAnimation.includes(velocidadeMedia))
                $(el).html(`Tempo: ${contagem - 1} segundos - dificuldade: média`);
            else if (obstacleAnimation.includes(velocidadeDificil))
                $(el).html(`Tempo: ${contagem - 1} segundos - dificuldade: difícil`);
            else
                $(el).html(`Tempo: ${contagem - 1} segundos - dificuldade: fácil`);

            $(".lista").append($(el));

            // ---- Verificar o maior número na lista do histórico de tempos 
            $('.lista').children().each(function () {
                arr.push($(this).html());
            });

            const numero = arr.map(e => {
                var noChar = e.replace("Tempo: ", "");
                noChar = noChar.replace(" segundos", "");
                noChar = noChar.replace(" - dificuldade: fácil", "");
                noChar = noChar.replace(" - dificuldade: média", "");
                noChar = noChar.replace(" - dificuldade: difícil", "");
                return +noChar;
            });

            const tempoMaximo = Math.max.apply(null, numero);

            if ($("#contador").text().includes(tempoMaximo))
                $("#mostrarTempo").text(`Parábens! ${contagem - 1} segundos é seu novo record!`)
            else
                $("#mostrarTempo").text(`Seu tempo: ${contagem - 1} segundos`)

            dadosLocalStorage.push($(el).html());
            salvarStorage();

            $("#contador").text("");
            $(obstaculo).css("animation", "none");
        };
    }, 10);
};


// Função para iniciar/reiniciar o jogo
const iniciaJogo = () => {
    // Muda a imagem do jogador de acordo com a sua escolha de personagem
    let personagemSelecionado = jogador.getAttribute('src');
    jogador.src = (personagemSelecionado == p1 || personagemSelecionado == p1gameOver) ? p1 : p2;

    $(document).attr("title", "Jogando...");

    // Função que contém o loop que verifica quando o jogador perde
    verificaJogo();
    // Função que determina a velocidade do obstáculo de acordo com a escolha do jogador 
    dificuldadeJogo();

    $("#contador").text("Tempo: 0");

    if ($(".player-control").hasClass("clicked")) $(".player-control").removeClass("clicked");
    if ($(".pontuacao").hasClass("clicked")) $(".pontuacao").removeClass("clicked");

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
        dificuldadeJogo();
    }, 10);
};


// Funções para mudar de personagem
const mudarPersonagem01 = () => {
    if ($(obstaculo).css("display", "flex")) $(obstaculo).css("display", "none");

    $(jogador).prop("src", p1);
    $("#msg-personagem").css("opacity", "1");
    $("#personagem01").addClass("selecionado");
    setTimeout(() => {
        $("#msg-personagem").css("opacity", "0");
        $("#personagem01").removeClass("selecionado");
    }, 1000);
};

const mudarPersonagem02 = () => {
    if ($(obstaculo).css("display", "flex")) $(obstaculo).css("display", "none");

    $(jogador).prop("src", p2);
    $("#msg-personagem").css("opacity", "1");
    $("#personagem02").addClass("selecionado");
    setTimeout(() => {
        $("#msg-personagem").css("opacity", "0");
        $("#personagem02").removeClass("selecionado");
    }, 1000);
};


// Exibir mensagem quando clica em algum botão de dificuldade
const mensagemDificuldade = () => {
    $("#msg-dificuldade").css("opacity", "1");
    setTimeout(() => {
        $("#msg-dificuldade").css("opacity", "0");
    }, 1000);
};


// Funções para exibir a mensagem de dificuldade
function modoFacil() {
    $("#msg-dificuldade").html("Dificuldade fácil selecionada!");

    mensagemDificuldade();
    $(btnModoFacil).addClass("selected");

    if ($(btnModoMedio).hasClass("selected"))
        $(btnModoMedio).removeClass("selected");
    if ($(btnModoDificil).hasClass("selected"))
        $(btnModoDificil).removeClass("selected");
};

function modoMedio() {
    $("#msg-dificuldade").html("Dificuldade média selecionada!");

    mensagemDificuldade();
    $(btnModoMedio).addClass("selected");

    if ($(btnModoFacil).hasClass("selected"))
        $(btnModoFacil).removeClass("selected");
    if ($(btnModoDificil).hasClass("selected"))
        $(btnModoDificil).removeClass("selected");
};

function modoDificil() {
    $("#msg-dificuldade").html("Dificuldade difícil selecionada!");
    mensagemDificuldade();

    $(btnModoDificil).addClass("selected");

    if ($(btnModoFacil).hasClass("selected"))
        $(btnModoFacil).removeClass("selected");
    if ($(btnModoMedio).hasClass("selected"))
        $(btnModoMedio).removeClass("selected");
};

// Ativa os eventos de clique, keydown e touchstart quando a janela estiver pronta
$(document).ready(() => {
    // Mostra/oculta o botão de inicio e reinicio do jogo no mobile
    if ($(window).width() <= 991.98) {
        $(".noMobile").css("display", "none");

        setInterval(() => {
            if (gameStart.style.visibility !== 'hidden')
                $("#iniciar-mobile").css("display", "flex")
            else
                $("#iniciar-mobile").css("display", "none");

            if (gameOver.style.visibility === 'visible')
                $("#reiniciar-mobile").css("display", "flex");
            else
                $("#reiniciar-mobile").css("display", "none");

            if (gameStart.style.visibility !== 'hidden' || gameOver.style.visibility === 'visible')
                $(".dificuldade-container-mobile").css("display", "flex");
            else
                $(".dificuldade-container-mobile").css("display", "none");

        }, 100);
    };

    // Botões de dificuldade
    $(btnModoFacil).on("click keydown touchstart", e => {
        if (e.type == 'touchstart') {
            e.preventDefault();
            modoFacil();
        }
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13)) modoFacil()
    });

    $(btnModoMedio).on("click keydown touchstart", e => {
        if (e.type == 'touchstart') {
            e.preventDefault();
            modoMedio();
        }
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13)) modoMedio()
    });

    $(btnModoDificil).on("click keydown touchstart", e => {
        if (e.type == 'touchstart') {
            e.preventDefault();
            modoDificil();
        }
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13)) modoDificil()
    });

    // Botões que ativam as funções dos controles de áudio
    $("#mute-btn").on("click keydown touchstart", e => {
        if (e.type == 'touchstart') {
            e.preventDefault();
            mute();
        }
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13)) mute()
    });

    $("#player").on("click keydown touchstart", e => {
        if (e.type == 'touchstart') {
            e.preventDefault();
            playPause();
        }
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13)) playPause()
    });

    $("#aumenta-btn").on("click keydown touchstart", e => {
        if (e.type == 'touchstart') {
            e.preventDefault();
            aumentaVolume();
        }
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13)) aumentaVolume()
    });

    $("#abaixa-btn").on("click keydown touchstart", e => {
        if (e.type == 'touchstart') {
            e.preventDefault();
            abaixaVolume();
        }
        if (e.type == 'click' || (e.type == 'keydown' & e.which == 13)) abaixaVolume()
    });

    // Botões do menu de inicio e game-over
    $("#iniciar").on("click focusin", e => {
        if (e.type == 'focusin') {
            if ($(".player-control").hasClass("clicked")) $(".player-control").removeClass("clicked");
            if ($(".pontuacao").hasClass("clicked")) $(".pontuacao").removeClass("clicked");
            if ($(".comandos").hasClass("clicked")) $(".comandos").removeClass("clicked");
        }
        if (e.type = 'click') iniciaJogo();
    });

    $("#reiniciar").on("click focusin", e => {
        if (e.type == 'focusin') {
            if ($(".player-control").hasClass("clicked")) $(".player-control").removeClass("clicked");
            if ($(".pontuacao").hasClass("clicked")) $(".pontuacao").removeClass("clicked");
            if ($(".comandos").hasClass("clicked")) $(".comandos").removeClass("clicked");
        }
        if (e.type == 'click') iniciaJogo();
    });

    // Botão que mostra o histórico de tempo do jogador
    $("#toggler").on("touchstart click keydown", e => {
        if (e.type == "touchstart") {
            e.preventDefault();
            scoreToggler();
        }
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13))
            scoreToggler();
    });

    // Botão que mostra os comandos do jogo
    $("#command-toggler").on("touchstart click keydown", e => {
        if (e.type == "touchstart") {
            e.preventDefault();
            commandsToggler();
        }
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13))
            commandsToggler();
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

    // Botão que exclui os itens do histórico de tempo
    $("#lixeira").on("touchstart click keydown", e => {
        if (e.type == "touchstart") {
            e.preventDefault();
            deletarStorage();
        };
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13))
            deletarStorage();
    });

    // Pulo do personagem em mobiles
    $(".area-mobile").on("touchstart", () => { if (gameOver.style.visibility === 'hidden') pulo() });

    // Botões de inicio e reinicio mobile
    $("#iniciar-mobile").on("touchstart", iniciaJogo);
    $("#reiniciar-mobile").on("touchstart", iniciaJogo);

    // Botões de mudança de personagem
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

    $(obstaculo).css("display", "none");
    atualizarStorage();
});


// Eventos de pressionamento de teclas do teclado
$(document).keydown(e => {
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

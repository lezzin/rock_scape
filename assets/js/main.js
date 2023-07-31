// Sons
const somPulo = new Audio('./assets/audio/jump.wav');
const somGameOverP1 = new Audio('./assets/audio/boyShout.wav');
const somGameOverP2 = new Audio('./assets/audio/girlShout.wav');

const musicaFundo = new Audio('./assets/audio/background.mp3');
const btnPlayPause = document.querySelector("#player");
const btnMuta = document.querySelector("#mute-btn");
const btnAumenta = document.querySelector("#aumenta-btn");
const btnDiminui = document.querySelector("#abaixa-btn");

const jogador = document.querySelector(".jogador");
const obstaculo = document.querySelector(".obstaculo");

// Telas
const gameBoard = document.querySelector(".game-board");
const gameStart = document.querySelector(".home-container");
const gameOver = document.querySelector(".game-over");
const sideMenu = document.querySelector(".sidemenu");
const scoreContainer = document.querySelector(".pontuacao");
const commandsContainer = document.querySelector(".comandos");
const playerContainer = document.querySelector(".player-control");
const configContainer = document.querySelector(".container-config");
const darkScreen = document.querySelector(".dark-screen");
const spanAlert = document.querySelector(".span-container");

//Lista que armazena os tempos no histórico
const listaDeTempos = document.querySelector(".lista");

// Mobile
const btnInicioMobile = document.querySelector("#iniciar-mobile");
const btnReinicioMobile = document.querySelector("#reiniciar-mobile");
const divPuloMobile = document.querySelector(".area-mobile");
const dificultyContainerMobile = document.querySelector(".dificulty-container-mobile");

// Variáveis que armazenam as velocidades que o obstáculo pode ter
const velocidadeFacil = '1.4';
const velocidadeMedia = '1.2';
const velocidadeDificil = '0.8';

const btnSelectP1 = document.querySelectorAll("#personagem01");
const btnSelectP2 = document.querySelectorAll("#personagem02");

// Botões de dificuldade
const btnModoFacil = document.querySelectorAll(".facil");
const btnModoMedio = document.querySelectorAll(".medio");
const btnModoDificil = document.querySelectorAll(".dificil");

// Botões dos menus
const btnInicio = document.querySelector("#iniciar");
const btnReinicio = document.querySelector("#reiniciar");
const btnVoltarMenu = document.querySelectorAll("#btnVolta");

// Botões togglers
const btnScoreToggler = document.querySelector("#score-toggler");
const btnCmdToggler = document.querySelector("#command-toggler");
const btnPlayerToggler = document.querySelector("#player-toggler");
const btnConfigToggler = document.querySelectorAll(".toggleConfig");
const btnResize = document.querySelector("#alterarTela i");

const btnLixeira = document.querySelector("#lixeira");

// Spans que mostram informações ao jogador na tela
const contador = document.querySelector("#contador");
const msgPersonagemSelecionado = document.querySelector("#msg-personagem");
const msgDificuldadeSelecionada = document.querySelector("#msg-dificuldade");
const mostrarTempoGameOver = document.querySelector("#mostrarTempo");
const mostraVolume = document.querySelector("#mostraVolume");

// Variáveis para os personagens do jogo - armazenam o local em que as imagens estão
const p1gameOver = "./assets/img/falledBoy.png";
const p2gameOver = "./assets/img/falledGirl.png";
const p1 = "./assets/img/boy.gif";
const p2 = "./assets/img/girl.gif";

// Variáveis que armazenam os ícones de tamanho da tela
const iconeAumentaTela = "fa-up-right-and-down-left-from-center";
const iconeDiminuiTela = "fa-down-left-and-up-right-to-center";

let dadosLocalStorage = JSON.parse(localStorage.getItem('pontuacao')) || [];
let imgArray = ['./assets/img/obstaculo1.png', './assets/img/obstaculo2.png', './assets/img/obstaculo3.png'];
let widthArray = ['6em', '8em', '10em', '12em'];

let conteudoLi = [];
let personagemSelecionado;
let obstacleAnimation;

musicaFundo.loop = true;
somGameOverP1.volume = 0.5;
somGameOverP2.volume = 0.5;
somPulo.volume = 0.8;

const mute = () => {
    musicaFundo.muted = !musicaFundo.muted;
    if ($(btnMuta).hasClass("fa-volume-xmark")) {
        $(btnMuta).attr("title", "desmutar").removeClass("fa-volume-xmark").addClass("fa-volume-high");
        return;
    }

    $(btnMuta).attr("title", "mutar").removeClass("fa-volume-high").addClass("fa-volume-xmark");
};

const playPause = () => {
    if ($(btnPlayPause).hasClass("fa-play")) {
        musicaFundo.play();
        $(btnPlayPause).attr("title", "pausar").removeClass("fa-play").addClass("fa-pause");
        return;
    }

    musicaFundo.pause();
    $(btnPlayPause).attr("title", "iniciar").removeClass("fa-pause").addClass("fa-play");
};

const abaixaVolume = () => {
    if (musicaFundo.volume > 0) musicaFundo.volume -= 0.1;
    $(mostraVolume).text("Volume: " + (musicaFundo.volume).toFixed(1));
};

const aumentaVolume = () => {
    if (musicaFundo.volume < 1) musicaFundo.volume += 0.1;
    $(mostraVolume).text("Volume: " + (musicaFundo.volume).toFixed(1));
};

const atualizarStorage = () => {
    $(listaDeTempos).empty();

    $.each(dadosLocalStorage, (index, dado) => {
        $(listaDeTempos).append(`<li><em>${index + 1}.</em><span>${dado}</span></li>`);
    });
};

const salvarStorage = () => {
    localStorage.setItem('pontuacao', JSON.stringify(dadosLocalStorage));
};

const deletarStorage = () => {
    if (confirm('Confirmar a remoção de todos os dados do histórico?')) {
        dadosLocalStorage = [];
        salvarStorage();
        atualizarRecorde();
    }
};
const atualizarRecorde = () => {
    atualizarStorage(); // Update the displayed data

    let numero, tempoMaximo;

    if ($(listaDeTempos).children().length > 0) {
        numero = $(listaDeTempos)
            .children()
            .map((index, element) => Number($(element).find('span').text().replace(/\D/g, '')))
            .toArray();
        tempoMaximo = Math.max(...numero);

        $(listaDeTempos).children().each((index, element) => {
            if (Number($(element).find('span').text().replace(/\D/g, '')) === tempoMaximo) {
                $(element).addClass('recorde');
            } else {
                $(element).removeClass('recorde');
            }
        });
    }
};


const alteraTelaCheia = () => {
    $(obstaculo).toggleClass("resized");
    $(jogador).toggleClass("resized");

    if (!document.fullscreenElement) {
        $(btnResize).removeClass(iconeAumentaTela).addClass(iconeDiminuiTela);
        gameBoard.requestFullscreen();

        return;
    }

    $(btnResize).removeClass(iconeDiminuiTela).addClass(iconeAumentaTela);
    document.exitFullscreen();
};


// Funções para não deixar os códigos repetitivos
const scoreToggler = () => {
    $(scoreContainer).toggleClass("clicked");

    if ($(gameBoard).hasClass("resized"))
        $(sideMenu).fadeIn(200);

    if ($(scoreContainer).hasClass("clicked"))
        $(btnLixeira).attr("tabindex", "0");
    else
        $(btnLixeira).attr("tabindex", "-1");

    if ($(playerContainer).hasClass("clicked"))
        $(playerContainer).removeClass("clicked");
    if ($(commandsContainer).hasClass("clicked"))
        $(commandsContainer).removeClass("clicked");
};

const commandsToggler = () => {
    $(commandsContainer).toggleClass("clicked");

    if ($(gameBoard).hasClass("resized"))
        $(sideMenu).fadeIn(200);

    if ($(playerContainer).hasClass("clicked"))
        $(playerContainer).removeClass("clicked");
    if ($(scoreContainer).hasClass("clicked"))
        $(scoreContainer).removeClass("clicked");
};

const playerToggler = () => {
    $(playerContainer).toggleClass("clicked");

    if ($(gameBoard).hasClass("resized"))
        $(sideMenu).fadeIn(200);

    if ($(playerContainer).hasClass("clicked"))
        $(".controls").children().each((e, element) => $(element).attr("tabindex", "0"));
    else
        $(".controls").children().each((e, element) => $(element).attr("tabindex", "-1"))

    if ($(scoreContainer).hasClass("clicked"))
        $(scoreContainer).removeClass("clicked");
    if ($(commandsContainer).hasClass("clicked"))
        $(commandsContainer).removeClass("clicked");
};

const configToggler = () => {
    $(configContainer).toggleClass("clicked");

    if ($(configContainer).hasClass("clicked")) {
        $(btnInicio).hide();
        $(btnConfigToggler).hide();
    } else {
        $(btnInicio).show();
        $(btnConfigToggler).show();
    }
};

const esconderContainers = () => {
    if ($(playerContainer).hasClass("clicked"))
        $(playerContainer).removeClass("clicked");

    if ($(scoreContainer).hasClass("clicked"))
        $(scoreContainer).removeClass("clicked");

    if ($(commandsContainer).hasClass("clicked"))
        $(commandsContainer).removeClass("clicked");

    if ($(configContainer).hasClass("clicked"))
        $(configContainer).removeClass("clicked");
};

let i1;
let i2;

const darkScreenAnimation = (vel, time) => {
    $(darkScreen).css({ "z-index": "4", "display": "flex", "animation": "none" });
    i1 = setInterval(() => {
        $(darkScreen).css("animation", `${vel}s blink2`);
        $(darkScreen).on("animationend", () => $(darkScreen).css("animation", "none"));
    }, time);
    i2 = setInterval(() => {
        if (gameOver.style.display == 'flex')
            $(darkScreen).css({ "z-index": "0", "animation": "none" });
    }, 100);
};


const mudarPersonagem01 = () => {
    $(btnSelectP1).addClass("active");
    $(msgDificuldadeSelecionada).html("");

    if ($(btnSelectP2).hasClass("active")) $(btnSelectP2).removeClass("active");

    $(msgPersonagemSelecionado).text("Personagem selecionado!");
    $(spanAlert).fadeIn(0);
    $(btnSelectP1).addClass("selecionado");
    setTimeout(() => { $(spanAlert).fadeOut(0); $(btnSelectP1).removeClass("selecionado") }, 1000);
};

const mudarPersonagem02 = () => {
    $(btnSelectP2).addClass("active");
    $(msgDificuldadeSelecionada).html("");

    if ($(btnSelectP1).hasClass("active")) $(btnSelectP1).removeClass("active");

    $(msgPersonagemSelecionado).text("Personagem selecionado!");
    $(spanAlert).fadeIn(0);
    $(btnSelectP2).addClass("selecionado");
    setTimeout(() => { $(spanAlert).fadeOut(0); $(btnSelectP2).removeClass("selecionado"); }, 1000);
};


const mensagemDificuldade = () => {
    $(msgPersonagemSelecionado).text("");
    $(spanAlert).fadeIn(0);
    setTimeout(() => $(spanAlert).fadeOut(0), 1000);
};


const checarClasseBtn = (btn1, btn2, btn3) => {
    $(btn1).addClass("selected");

    if ($(btn2).hasClass("selected")) $(btn2).removeClass("selected");
    if ($(btn3).hasClass("selected")) $(btn3).removeClass("selected");
};


const modoFacil = () => {
    $(msgDificuldadeSelecionada).html("Dificuldade fácil selecionada!");
    mensagemDificuldade();
    checarClasseBtn(btnModoFacil, btnModoMedio, btnModoDificil);
};

const modoMedio = () => {
    $(msgDificuldadeSelecionada).html("Dificuldade média selecionada!");
    mensagemDificuldade();
    checarClasseBtn(btnModoMedio, btnModoFacil, btnModoDificil);
};

const modoDificil = () => {
    $(msgDificuldadeSelecionada).html("Dificuldade difícil selecionada!");
    mensagemDificuldade();
    checarClasseBtn(btnModoDificil, btnModoFacil, btnModoMedio);
};


// Função que altera a dificuldade do jogo (velocidade do obstáculo)
const dificuldadeJogo = () => {
    if ($(btnModoFacil).hasClass("selected")) {
        $(obstaculo).css("animation", `obstaculo ${velocidadeFacil}s infinite linear .6s`);
        $(darkScreen).css({ "display": "none", "z-index": "0" });
    }
    else if ($(btnModoMedio).hasClass("selected")) {
        $(obstaculo).css("animation", `obstaculo ${velocidadeMedia}s infinite linear .6s`);
        darkScreenAnimation(6, 22000);
    }
    else if ($(btnModoDificil).hasClass("selected")) {
        $(obstaculo).css("animation", `obstaculo ${velocidadeDificil}s infinite linear .6s`);
        darkScreenAnimation(5, 15000);
    }
    else {
        $(obstaculo).css("animation", `obstaculo ${velocidadeFacil}s infinite linear .6s`);
        $(darkScreen).css({ "display": "none", "z-index": "0" });
    };
};

// Função do pulo do personagem
const pulo = () => {
    $(jogador).addClass("jump");
    setTimeout(() => $(jogador).removeClass("jump"), 400);

    if ($(jogador).hasClass("jump")) {
        somPulo.play(); somPulo.loop = false;
    };
};


const verificaJogo = () => {
    personagemSelecionado = jogador.getAttribute('src');
    let contagem = 1;
    this.contadorTempo = setInterval(() => $(contador).text(`Tempo: ${contagem++}`), 1000);

    this.imgWidthInterval = setInterval(() => {
        let margemDireitaObstaculo = +window.getComputedStyle(obstaculo).right.replace("px", "");

        if (margemDireitaObstaculo < -90) {
            $(obstaculo).prop("src", `${imgArray[Math.floor(Math.random() * imgArray.length)]}`);
            $(obstaculo).css("width", `${widthArray[Math.floor(Math.random() * widthArray.length)]}`);
        };
    }, 10);

    // Loop que verifica se você perdeu
    this.loopVerifica = setInterval(() => {
        let margemEsquerdaObstaculo = obstaculo.offsetLeft, alturaPulo = +window.getComputedStyle(jogador).bottom.replace("px", "");

        if (!$(gameBoard).hasClass("resized") && margemEsquerdaObstaculo <= 90 && margemEsquerdaObstaculo > 0 && alturaPulo <= 70
            || $(gameBoard).hasClass("resized") && margemEsquerdaObstaculo <= 120 && margemEsquerdaObstaculo > 0 && alturaPulo <= 70) {

            $(document).attr("title", "Game Over...");

            $(btnReinicio).attr("disabled", "");
            setTimeout(() => $(btnReinicio).removeAttr("disabled"), 1000);

            jogador.src = personagemSelecionado == p1 ? p1gameOver : p2gameOver;

            if ((personagemSelecionado == p1)) {
                somGameOverP1.play(); somGameOverP1.loop = false;
            } else {
                somGameOverP2.play(); somGameOverP2.loop = false;
            };

            $(jogador).addClass("jump");
            setTimeout(() => $(jogador).removeClass("jump").css("bottom", "-8px"), 500);
            $(obstaculo).css("left", margemEsquerdaObstaculo);
            $(gameOver).css("display", "flex");

            clearInterval(loopVerifica);
            clearInterval(contadorTempo);
            clearInterval(imgWidthInterval);
            clearInterval(i1);
            clearInterval(i2);

            let el = document.createElement("li");

            dificuldadeJogo();

            if (obstacleAnimation.includes(velocidadeFacil))
                $(el).html(`Tempo: ${contagem - 1} segundos - dificuldade: fácil`);
            else if (obstacleAnimation.includes(velocidadeMedia))
                $(el).html(`Tempo: ${contagem - 1} segundos - dificuldade: média`);
            else if (obstacleAnimation.includes(velocidadeDificil))
                $(el).html(`Tempo: ${contagem - 1} segundos - dificuldade: difícil`);
            else
                $(el).html(`Tempo: ${contagem - 1} segundos - dificuldade: fácil`);

            $(listaDeTempos).
                append($(el)).
                children().each((e, element) => conteudoLi.push($(element).removeClass("recorde").html()));

            let numero, tempoMaximo;
            numero = conteudoLi.map(e => { return +e.replace(/[^0-9]/g, ''); });// retorna uma nova array com os números da array conteudoLi
            tempoMaximo = Math.max.apply(null, numero); // pega o maior número dessa array

            $(listaDeTempos).children().each((e, element) => { if ($(element).text().includes(tempoMaximo)) ($(element).addClass("recorde")) });
            if ($(contador).text().includes(tempoMaximo)) $(mostrarTempoGameOver).text(`Parábens! ${contagem - 1} segundo(s) é seu novo record!`)
            else $(mostrarTempoGameOver).text(`Seu tempo: ${contagem - 1} segundo(s)`)

            dadosLocalStorage.push($(el).html());
            salvarStorage();

            conteudoLi.splice(0, conteudoLi.length);

            $(contador).text("");
            $(obstaculo).css("animation", "none");
        };
    }, 10);
};

// Função para iniciar/reiniciar o jogo
const iniciaJogo = () => {
    obstacleAnimation = window.getComputedStyle(obstaculo).animation;
    $(document).attr("title", "Jogando...");

    // Muda a imagem do jogador de acordo com a sua escolha de personagem
    if ($(btnSelectP1).hasClass("active"))
        $(jogador).prop("src", p1);
    else if ($(btnSelectP2).hasClass("active"))
        $(jogador).prop("src", p2);
    else
        $(jogador).prop("src", p1);

    $(obstaculo).prop("src", `${imgArray[Math.floor(Math.random() * imgArray.length)]}`);
    $(obstaculo).css("width", `${widthArray[Math.floor(Math.random() * widthArray.length)]}`);

    verificaJogo();
    dificuldadeJogo();

    $(contador).text("Tempo: 0");

    // Mostra:
    $(obstaculo).css("display", "flex").css("left", "");
    $(jogador).css("display", "flex").css("bottom", "10px");

    // Oculta
    $(gameOver).css("display", "none");
    $(gameStart).css("display", "none");
    // Oculta os itens do menu, caso estejam aparentes
    esconderContainers();

    // Ativa as animações
    setTimeout(() => {
        $(jogador).css("animation", "");
        dificuldadeJogo(); // Animação do obstáculo
    }, 10);
};


$(window).on('load', () => {
    $('#preloader .inner').fadeOut();
    $('#preloader').delay(350).fadeOut('slow');
    $('body').delay(350).css("overflow", "visible");

    atualizarRecorde();
    $(obstaculo).css("display", "none");
    $(spanAlert).css("display", "none");

    // Mostra/oculta o botão de inicio e reinicio do jogo no mobile
    if ($(window).width() <= 991.98) {
        $(".noMobile").css("display", "none");

        setInterval(() => {
            if (gameStart.style.display !== 'none')
                $(btnInicioMobile).css("display", "flex");
            else
                $(btnInicioMobile).css("display", "none");

            if (gameOver.style.display === 'flex')
                $(btnReinicioMobile).css("display", "flex");
            else
                $(btnReinicioMobile).css("display", "none");

            if (gameStart.style.display !== 'none' || gameOver.style.display === 'flex') {
                $(divPuloMobile).css("display", "none");
                $(dificultyContainerMobile).css("display", "flex");
            } else {
                $(divPuloMobile).css("display", "flex");
                $(dificultyContainerMobile).css("display", "none");
            };
        }, 100);
    };

    // Mostrar o sidemenu com o mouse
    $(window).mousemove(e => {
        if (e.pageX <= 65 && $(gameBoard).hasClass("resized") ||
            $(scoreContainer).hasClass("clicked") ||
            $(commandsContainer).hasClass("clicked") ||
            $(playerContainer).hasClass("clicked"))
            $(sideMenu).fadeIn(200);
        else if (e.pageX > 65 && $(gameBoard).hasClass("resized"))
            $(sideMenu).fadeOut(200);
    });

    // Botões de dificuldade
    $(btnModoFacil).on("click keydown touchstart", e => {
        if (e.type == 'touchstart') {
            e.preventDefault();
            modoFacil();
        };
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13)) modoFacil();
    });

    $(btnModoMedio).on("click keydown touchstart", e => {
        if (e.type == 'touchstart') {
            e.preventDefault();
            modoMedio();
        };
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13)) modoMedio();
    });

    $(btnModoDificil).on("click keydown touchstart", e => {
        if (e.type == 'touchstart') {
            e.preventDefault();
            modoDificil();
        };
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13)) modoDificil();
    });

    // Botões que ativam as funções dos controles de áudio
    $(btnMuta).on("click keydown touchstart", e => {
        if (e.type == 'touchstart') {
            e.preventDefault();
            mute();
        };
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13)) mute();
    });

    $(btnPlayPause).on("click keydown touchstart", e => {
        if (e.type == 'touchstart') {
            e.preventDefault();
            playPause();
        };
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13)) playPause();
    });

    $(btnAumenta).on("click keydown touchstart", e => {
        if (e.type == 'touchstart') {
            e.preventDefault();
            aumentaVolume();
        };
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13)) aumentaVolume();
    });

    $(btnDiminui).on("click keydown touchstart", e => {
        if (e.type == 'touchstart') {
            e.preventDefault();
            abaixaVolume();
        }
        if (e.type == 'click' || (e.type == 'keydown' & e.which == 13)) abaixaVolume();
    });

    // Botões do menu de inicio e game-over
    $(btnInicio).on("click focusin", e => {
        if (e.type == 'focusin') esconderContainers();
        if (e.type == 'click') iniciaJogo();
    });

    $(btnReinicio).on("click focusin", e => {
        if (e.type == 'focusin') esconderContainers();
        if (e.type == 'click') iniciaJogo();
    });

    // Botão que mostra o histórico de tempo do jogador
    $(btnScoreToggler).on("touchstart click keydown", e => {
        if (e.type == "touchstart") {
            e.preventDefault();
            scoreToggler();
        };
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13)) scoreToggler();
    });

    // Botão que mostra os comandos do jogo
    $(btnCmdToggler).on("touchstart click keydown", e => {
        if (e.type == "touchstart") {
            e.preventDefault();
            commandsToggler();
        };
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13)) commandsToggler();
    });

    // Botão que mostra os controles da música de fundo
    $(btnPlayerToggler).on("touchstart click keydown", e => {
        if (e.type == "touchstart") {
            e.preventDefault();
            playerToggler();
        };
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13)) playerToggler();
    });

    $(btnConfigToggler).on("click keydown touchstart", e => {
        e.preventDefault();
        if (e.type == 'touchstart') {
            configToggler();
        };
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13)) configToggler();
    });

    $(btnVoltarMenu).on("click keydown touchstart", e => {
        e.preventDefault();
        if (e.type == 'touchstart') {
            configToggler();
        };
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13)) configToggler();
    });

    // Botão que exclui os itens do histórico de tempo
    $(btnLixeira).on("touchstart click keydown", e => {
        if (e.type == "touchstart") {
            e.preventDefault();
            deletarStorage();
        };
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13)) deletarStorage();
    });

    // Botão que altera o tamanho da tela do jogo
    $(btnResize).on("touchstart click keydown", e => {
        if (e.type == "touchstart") {
            e.preventDefault();
            alteraTelaCheia();
        };
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13)) alteraTelaCheia();
    });

    // Pulo do personagem em mobiles
    $(divPuloMobile).on("touchstart", () => { if (gameOver.style.display === 'none') pulo() });

    // Botões de inicio e reinicio mobile
    $(btnInicioMobile).on("touchstart", iniciaJogo);
    $(btnReinicioMobile).on("touchstart", iniciaJogo);

    // Botões de mudança de personagem
    $(btnSelectP1).on("touchstart click keydown", e => {
        if (e.type == "touchstart") {
            e.preventDefault();
            mudarPersonagem01();
        };
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13)) mudarPersonagem01();
    });

    $(btnSelectP2).on("touchstart click keydown", (e) => {
        if (e.type == "touchstart") {
            e.preventDefault();
            mudarPersonagem02();
        };
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13)) mudarPersonagem02();
    });

    // Eventos de pressionamento de teclas do teclado
    $(document).keydown(e => {
        if (e.which === 32 && gameOver.style.display === 'none') pulo();
        if (e.which === 38 && gameOver.style.display === 'none') pulo();

        if (e.which === 32 && gameStart.style.display !== 'none') btnInicio.click();
        if (e.which === 32 && gameOver.style.display === 'flex') btnReinicio.click();

        if (e.which === 49 && (gameStart.style.display !== "none" || gameOver.style.display !== "none")) mudarPersonagem01();

        if (e.which === 50 && (gameStart.style.display !== "none" || gameOver.style.display !== "none")) mudarPersonagem02();

        if (e.which === 84) alteraTelaCheia();

        if (e.which === 46) btnLixeira.click();
        if (e.which === 67) btnCmdToggler.click();
        if (e.which === 80) btnScoreToggler.click();
    });
});

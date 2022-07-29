const
    // Sons
    somPulo = new Audio('./assets/audio/jump.wav'),
    somGameOverP1 = new Audio('./assets/audio/boyShout.wav'),
    somGameOverP2 = new Audio('./assets/audio/girlShout.wav'),
    musicaFundo = new Audio('./assets/audio/background.mp3'),

    jogador = document.querySelector(".jogador"),
    obstaculo = document.querySelector(".obstaculo"),

    // Telas
    gameBoard = document.querySelector(".game-board"),
    gameStart = document.querySelector(".home-container"),
    gameOver = document.querySelector(".game-over"),
    sideMenu = document.querySelector(".sidemenu"),
    scoreContainer = document.querySelector(".pontuacao"),
    commandsContainer = document.querySelector(".comandos"),
    playerContainer = document.querySelector(".player-control"),
    configContainer = document.querySelector(".container-config"),
    darkScreen = document.querySelector(".dark-screen"),
    spanAlert = document.querySelector(".span-container"),

    //Lista que armazena os tempos no histórico
    listaDeTempos = document.querySelector(".lista"),

    // Mobile
    btnInicioMobile = document.querySelector("#iniciar-mobile"),
    btnReinicioMobile = document.querySelector("#reiniciar-mobile"),
    divPuloMobile = document.querySelector(".area-mobile"),
    dificultyContainerMobile = document.querySelector(".dificulty-container-mobile"),

    // Variáveis que armazenam as velocidades que o obstáculo pode ter
    velocidadeFacil = '1.4',
    velocidadeMedia = '1.2',
    velocidadeDificil = '0.8',

    btnSelectP1 = document.querySelectorAll("#personagem01"),
    btnSelectP2 = document.querySelectorAll("#personagem02"),

    // Botões de dificuldade
    btnModoFacil = document.querySelectorAll(".facil"),
    btnModoMedio = document.querySelectorAll(".medio"),
    btnModoDificil = document.querySelectorAll(".dificil"),

    // Botões do player de música
    btnPlayPause = document.querySelector("#player"),
    btnMuta = document.querySelector("#mute-btn"),
    btnAumenta = document.querySelector("#aumenta-btn"),
    btnDiminui = document.querySelector("#abaixa-btn"),

    // Botões dos menus
    btnInicio = document.querySelector("#iniciar"),
    btnReinicio = document.querySelector("#reiniciar"),
    btnVoltarMenu = document.querySelectorAll("#btnVolta"),

    // Botões togglers
    btnScoreToggler = document.querySelector("#score-toggler"),
    btnCmdToggler = document.querySelector("#command-toggler"),
    btnPlayerToggler = document.querySelector("#player-toggler"),
    btnConfigToggler = document.querySelectorAll(".toggleConfig"),
    btnResize = document.querySelector("#alterarTela i"),

    btnLixeira = document.querySelector("#lixeira"),

    // Spans que mostram informações ao jogador na tela
    contador = document.querySelector("#contador"),
    msgPersonagemSelecionado = document.querySelector("#msg-personagem"),
    msgDificuldadeSelecionada = document.querySelector("#msg-dificuldade"),
    mostrarTempoGameOver = document.querySelector("#mostrarTempo"),
    mostraVolume = document.querySelector("#mostraVolume"),

    // Variáveis para os personagens do jogo - armazenam o local em que as imagens estão
    p1gameOver = "./assets/img/falledBoy.png",
    p2gameOver = "./assets/img/falledGirl.png",
    p1 = "./assets/img/boy.gif",
    p2 = "./assets/img/girl.gif",

    // Variáveis que armazenam os ícones de tamanho da tela
    iconeAumentaTela = "fa-up-right-and-down-left-from-center",
    iconeDiminuiTela = "fa-down-left-and-up-right-to-center";

let dadosLocalStorage = JSON.parse(localStorage.getItem('pontuacao')) || [],
    arr = [],
    imgArray = ['./assets/img/obstaculo1.png', './assets/img/obstaculo2.png', './assets/img/obstaculo3.png'],
    widthArray = ['6em', '8em', '10em', '12em'];

musicaFundo.loop = true;
somGameOverP1.volume = 0.5;
somGameOverP2.volume = 0.5;
somPulo.volume = 0.8;


// Funções dos botões que controlam a música de background
const mute = () => {
    if ($(btnMuta).hasClass("fa-volume-xmark")) {
        musicaFundo.muted = true;
        $(btnMuta).
            attr("title", "desmutar").
            removeClass("fa-volume-xmark").
            addClass("fa-volume-high");
    } else {
        musicaFundo.muted = false;
        $(btnMuta).
            attr("title", "mutar").
            removeClass("fa-volume-high").
            addClass("fa-volume-xmark");
    };
};

const playPause = () => {
    if ($(btnPlayPause).hasClass("fa-play") || musicaFundo.pause()) {
        musicaFundo.play();
        $(btnPlayPause).
            attr("title", "pausar").
            removeClass("fa-play").
            addClass("fa-pause");
    } else {
        musicaFundo.pause();
        $(btnPlayPause).
            attr("title", "iniciar").
            removeClass("fa-pause").
            addClass("fa-play");
    };
};

const abaixaVolume = () => {
    if (musicaFundo.volume > 0) musicaFundo.volume -= 0.1;
    $(mostraVolume).text("Volume: " + (musicaFundo.volume).toFixed(1));
};

const aumentaVolume = () => {
    if (musicaFundo.volume < 1) musicaFundo.volume += 0.1;
    $(mostraVolume).text("Volume: " + (musicaFundo.volume).toFixed(1));
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
        $(listaDeTempos).append($(el));
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

// Exibe em destaque o maior tempo da lista 
const loadRecord = () => {
    atualizarStorage();

    if ($(listaDeTempos).children().length > 0) {
        $(listaDeTempos).children().each((e, element) => arr.push($(element).html()));

        const numero = arr.map(e => { return +e.replace(/[^0-9]/g, ''); });
        const tempoMaximo = Math.max.apply(null, numero);

        $(listaDeTempos).children().each((e, element) => {
            if ($(element).text().includes(tempoMaximo)) $(element).addClass("record");
        });

        arr.splice(0, arr.length);
    };
};


//Função que altera o tamanho da tela do jogo
const alteraTela = () => {
    $(gameBoard).toggleClass("resized");
    $(obstaculo).toggleClass("resized");
    $(jogador).toggleClass("resized");

    if ($(btnResize).hasClass(iconeAumentaTela))
        $(btnResize).
            removeClass(iconeAumentaTela).
            addClass(iconeDiminuiTela);
    else
        $(btnResize).
            removeClass(iconeDiminuiTela).
            addClass(iconeAumentaTela);

    if (!$(gameBoard).hasClass("resized")) $(sideMenu).fadeIn(200);
    else $(sideMenu).fadeOut(200);
};


// Funções para não deixar os códigos repetitivos
const scoreToggler = () => {
    $(scoreContainer).toggleClass("clicked");

    if ($(gameBoard).hasClass("resized")) $(sideMenu).fadeIn(200);

    if ($(scoreContainer).hasClass("clicked")) $(btnLixeira).attr("tabindex", "0");
    else $(btnLixeira).attr("tabindex", "-1");

    if ($(playerContainer).hasClass("clicked")) $(playerContainer).removeClass("clicked");
    if ($(commandsContainer).hasClass("clicked")) $(commandsContainer).removeClass("clicked");
};

const commandsToggler = () => {
    $(commandsContainer).toggleClass("clicked");

    if ($(gameBoard).hasClass("resized")) $(sideMenu).fadeIn(200);

    if ($(playerContainer).hasClass("clicked")) $(playerContainer).removeClass("clicked");
    if ($(scoreContainer).hasClass("clicked")) $(scoreContainer).removeClass("clicked");
};

const playerToggler = () => {
    $(playerContainer).toggleClass("clicked");

    if ($(gameBoard).hasClass("resized")) $(sideMenu).fadeIn(200);

    if ($(playerContainer).hasClass("clicked"))
        $(".controls").children().each((e, element) => $(element).attr("tabindex", "0"));
    else
        $(".controls").children().each((e, element) => $(element).attr("tabindex", "-1"))

    if ($(scoreContainer).hasClass("clicked")) $(scoreContainer).removeClass("clicked");
    if ($(commandsContainer).hasClass("clicked")) $(commandsContainer).removeClass("clicked");
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

const esconderItensSideMenu = () => {
    if ($(playerContainer).hasClass("clicked")) $(playerContainer).removeClass("clicked");
    if ($(scoreContainer).hasClass("clicked")) $(scoreContainer).removeClass("clicked");
    if ($(commandsContainer).hasClass("clicked")) $(commandsContainer).removeClass("clicked");
};

const darkScreenAnimation = (vel, time1, time2) => {
    setInterval(() => {
        $(darkScreen).css("animation", `${vel}s ease-in-out blink2`);
        setTimeout(() => $(darkScreen).css("animation", "none"), time1);
    }, time2);
};


// Funções para mudar de personagem
const mudarPersonagem01 = () => {
    $(btnSelectP1).addClass("active");
    $(msgDificuldadeSelecionada).html("");

    if ($(btnSelectP2).hasClass("active")) $(btnSelectP2).removeClass("active");

    $(msgPersonagemSelecionado).text("Personagem selecionado!");
    $(spanAlert).fadeIn();
    $(btnSelectP1).addClass("selecionado");
    setTimeout(() => { $(spanAlert).fadeOut(); $(btnSelectP1).removeClass("selecionado") }, 1000);
};

const mudarPersonagem02 = () => {
    $(btnSelectP2).addClass("active");
    $(msgDificuldadeSelecionada).html("");

    if ($(btnSelectP1).hasClass("active")) $(btnSelectP1).removeClass("active");

    $(msgPersonagemSelecionado).text("Personagem selecionado!");
    $(spanAlert).fadeIn();
    $(btnSelectP2).addClass("selecionado");
    setTimeout(() => { $(spanAlert).fadeOut(); $(btnSelectP2).removeClass("selecionado"); }, 1000);
};


// Exibir mensagem quando clica em algum botão de dificuldade
const mensagemDificuldade = () => {
    $(msgPersonagemSelecionado).text("");
    $(spanAlert).fadeIn();
    setTimeout(() => $(spanAlert).fadeOut(), 1000);
};


// Funções para exibir a mensagem de dificuldade
// Função auxiliar
const btnClass = (btn1, btn2, btn3) => {
    $(btn1).addClass("selected");

    if ($(btn2).hasClass("selected")) $(btn2).removeClass("selected");
    if ($(btn3).hasClass("selected")) $(btn3).removeClass("selected");
};

const modoFacil = () => {
    $(msgDificuldadeSelecionada).html("Dificuldade fácil selecionada!");
    mensagemDificuldade();
    btnClass(btnModoFacil, btnModoMedio, btnModoDificil);
};

const modoMedio = () => {
    $(msgDificuldadeSelecionada).html("Dificuldade média selecionada!");
    mensagemDificuldade();
    btnClass(btnModoMedio, btnModoFacil, btnModoDificil);
};

const modoDificil = () => {
    $(msgDificuldadeSelecionada).html("Dificuldade difícil selecionada!");
    mensagemDificuldade();
    btnClass(btnModoDificil, btnModoFacil, btnModoMedio);
};


// Função que altera a dificuldade do jogo (velocidade do obstáculo)
const dificuldadeJogo = () => {
    if ($(btnModoFacil).hasClass("selected")) {
        $(obstaculo).css("animation", `obstaculo ${velocidadeFacil}s infinite linear .6s`);
        $(darkScreen).css("display", "none").css("animation", "none");
    }
    else if ($(btnModoMedio).hasClass("selected")) {
        $(obstaculo).css("animation", `obstaculo ${velocidadeMedia}s infinite linear .6s`);
        $(darkScreen).css("display", "flex").css("animation", "8s ease 15s blink2");
    }
    else if ($(btnModoDificil).hasClass("selected")) {
        $(obstaculo).css("animation", `obstaculo ${velocidadeDificil}s infinite linear .6s`);
        $(darkScreen).css("display", "flex").css("animation", "10s ease 10s blink2");
    }
    else {
        $(obstaculo).css("animation", `obstaculo ${velocidadeFacil}s infinite linear .6s`);
        $(darkScreen).css("display", "none").css("animation", "none");
    };
};


// Função do pulo do personagem
const pulo = () => {
    $(jogador).addClass("jump");
    $(jogador).css("width", `${+$(jogador).css("width").replace("px", "") + 20}px`);
    setTimeout(() => $(jogador).css("width", ""), 200);

    if ($(jogador).hasClass("jump")) {
        somPulo.play();
        somPulo.loop = false;
    };

    setTimeout(() => {
        $(jogador).removeClass("jump");
        $(".bg").css("animation", "shake 0.1s");
        setTimeout(() => $(".bg").css("animation", "none"), 300);
    }, 500);
};


const verificaJogo = () => {
    let contagem = 1;
    this.contadorTempo = setInterval(() => $(contador).text(`Tempo: ${contagem++}`), 1000);

    // Loop que altera a imagem e o tamanho do obstáculo
    this.srcTamanhoAleatorio = setInterval(() => {
        let margemDireitaObstaculo = +window.getComputedStyle(obstaculo).right.replace("px", "");

        if (margemDireitaObstaculo < -90) {
            obstaculo.src = imgArray[Math.floor(Math.random() * imgArray.length)];
            obstaculo.style.width = widthArray[Math.floor(Math.random() * widthArray.length)];
        };
    }, 10);

    // Tela preta no jogo só aparecerá na dificuldade média e difícil
    if ($(btnModoFacil).hasClass("selected")) {
        $(darkScreen).css("display", "none").css("animation", "none");
    } else if ($(btnModoMedio).hasClass("selected")) {
        $(darkScreen).css("z-index", "4").css("display", "flex");
        this.interval1 = darkScreenAnimation(4, 20000, 22000);
    }
    else if ($(btnModoDificil).hasClass("selected")) {
        $(darkScreen).css("z-index", "4").css("display", "flex");
        this.interval2 = darkScreenAnimation(6, 12000, 15000);
    }
    else {
        $(darkScreen).css("display", "none").css("animation", "none");
    };

    // Loop que verifica se você perdeu
    this.loop = setInterval(() => {
        let margemEsquerdaObstaculo = obstaculo.offsetLeft, alturaPulo = +window.getComputedStyle(jogador).bottom.replace("px", "");

        if (!$(gameBoard).hasClass("resized") && margemEsquerdaObstaculo <= 90 && margemEsquerdaObstaculo > 0 && alturaPulo <= 70
            || $(gameBoard).hasClass("resized") && margemEsquerdaObstaculo <= 120 && margemEsquerdaObstaculo > 0 && alturaPulo <= 70) {

            $(document).attr("title", "Game Over...");

            let personagemSelecionado = jogador.getAttribute('src');
            jogador.src = (personagemSelecionado == p1) ? p1gameOver : p2gameOver;

            if ((personagemSelecionado == p1)) {
                somGameOverP1.play(); somGameOverP1.loop = false;
            } else {
                somGameOverP2.play(); somGameOverP2.loop = false;
            };

            $(jogador).addClass("jump");
            setTimeout(() => $(jogador).removeClass("jump").css("bottom", "-8px"), 500);
            $(obstaculo).css("left", margemEsquerdaObstaculo);
            $(gameOver).css("display", "flex");

            clearInterval(loop);
            clearInterval(contadorTempo);
            clearInterval(srcTamanhoAleatorio);
            if ($(btnModoMedio).hasClass("selected")) {
                clearInterval(interval1);
                $(darkScreen).css("z-index", "0").css("animation", "none");
            } else if ($(btnModoDificil).hasClass("selected")) {
                clearInterval(interval2);
                $(darkScreen).css("z-index", "0").css("animation", "none");
            };

            let el = document.createElement("li"), obstacleAnimation = window.getComputedStyle(obstaculo).animation;

            dificuldadeJogo();

            if (obstacleAnimation.includes(velocidadeFacil))
                $(el).html(`Tempo: ${contagem - 1} segundos - dificuldade: fácil`);
            else if (obstacleAnimation.includes(velocidadeMedia))
                $(el).html(`Tempo: ${contagem - 1} segundos - dificuldade: média`);
            else if (obstacleAnimation.includes(velocidadeDificil))
                $(el).html(`Tempo: ${contagem - 1} segundos - dificuldade: difícil`);
            else
                $(el).html(`Tempo: ${contagem - 1} segundos - dificuldade: fácil`);

            $(listaDeTempos).append($(el));
            $(listaDeTempos).children().each((e, element) => arr.push($(element).removeClass("record").html()));

            const numero = arr.map(e => { return +e.replace(/[^0-9]/g, ''); });// retorna somente os números da array
            const tempoMaximo = Math.max.apply(null, numero); // pega o maior número dessa array

            if ($(contador).text().includes(tempoMaximo)) $(mostrarTempoGameOver).text(`Parábens! ${contagem - 1} segundo(s) é seu novo record!`)
            else $(mostrarTempoGameOver).text(`Seu tempo: ${contagem - 1} segundo(s)`)

            dadosLocalStorage.push($(el).html());
            salvarStorage();

            arr.splice(0, arr.length); // no fim da execução, a array é limpada

            $(contador).text("");
            $(obstaculo).css("animation", "none");
        };
    }, 10);
};


// Função para iniciar/reiniciar o jogo
const iniciaJogo = () => {
    $(document).attr("title", "Jogando...");

    // Muda a imagem do jogador de acordo com a sua escolha de personagem
    if ($(btnSelectP1).hasClass("active")) $(jogador).prop("src", p1);
    else if ($(btnSelectP2).hasClass("active")) $(jogador).prop("src", p2);
    else $(jogador).prop("src", p1);

    obstaculo.src = imgArray[Math.floor(Math.random() * imgArray.length)];
    obstaculo.style.width = widthArray[Math.floor(Math.random() * widthArray.length)];

    $(configContainer).fadeOut();

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
    esconderItensSideMenu();

    // Ativa as animações
    setTimeout(() => {
        $(jogador).css("animation", "");
        dificuldadeJogo(); // Animação do obstáculo
    }, 10);
};


$(window).on('load', () => {
    // Esconde preloader
    $('#preloader .inner').fadeOut();
    $('#preloader').delay(350).fadeOut('slow');
    $('body').delay(350).css({
        'overflow': 'visible'
    });

    loadRecord();
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
        if (e.type == 'focusin') esconderItensSideMenu();
        if (e.type == 'click') iniciaJogo();
    });

    $(btnReinicio).on("click focusin", e => {
        if (e.type == 'focusin') esconderItensSideMenu();
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
            alteraTela();
        };
        if (e.type == 'click' || (e.type == 'keydown' && e.which == 13)) alteraTela();
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

        if (e.which === 32 && gameStart.style.display !== 'none' && !$(playerContainer).hasClass("clicked") && !$(scoreContainer).hasClass("clicked")) iniciaJogo();
        if (e.which === 32 && gameOver.style.display === 'flex' && !$(playerContainer).hasClass("clicked") && !$(scoreContainer).hasClass("clicked")) iniciaJogo();

        if (e.which === 49 && (gameStart.style.display !== "none" || gameOver.style.display !== "none")) mudarPersonagem01();

        if (e.which === 50 && (gameStart.style.display !== "none" || gameOver.style.display !== "none")) mudarPersonagem02();

        if (e.which === 84) alteraTela();

        if (e.which === 46) btnLixeira.click();
        if (e.which === 67) btnCmdToggler.click();
        if (e.which === 80) btnScoreToggler.click();
    });
});

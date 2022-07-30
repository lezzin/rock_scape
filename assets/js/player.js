window.player = {
    musicaFundo: new Audio('./assets/audio/background.mp3'),
    btnPlayPause: document.querySelector("#player"),
    btnMuta: document.querySelector("#mute-btn"),
    btnAumenta: document.querySelector("#aumenta-btn"),
    btnDiminui: document.querySelector("#abaixa-btn"),
    mute() {
        musicaFundo.muted = !musicaFundo.muted;
        if ($(btnMuta).hasClass("fa-volume-xmark")) {
            $(btnMuta).
                attr("title", "desmutar").
                removeClass("fa-volume-xmark").
                addClass("fa-volume-high");
        } else {
            $(btnMuta).
                attr("title", "mutar").
                removeClass("fa-volume-high").
                addClass("fa-volume-xmark");
        };
    },
    playPause() {
        if ($(btnPlayPause).hasClass("fa-play")) {
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
    },
    abaixaVolume() {
        if (musicaFundo.volume > 0) musicaFundo.volume -= 0.1;
        $(mostraVolume).text("Volume: " + (musicaFundo.volume).toFixed(1));
    },
    aumentaVolume() {
        if (musicaFundo.volume < 1) musicaFundo.volume += 0.1;
        $(mostraVolume).text("Volume: " + (musicaFundo.volume).toFixed(1));
    }
};
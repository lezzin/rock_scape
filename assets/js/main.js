const EASY_SPEED = '1.4';
const MEDIUM_SPEED = '1.2';
const HARD_SPEED = '0.8';
const OBSTACLE_IMAGES = ['./assets/img/obstacle1.png', './assets/img/obstacle2.png', './assets/img/obstacle3.png'];
const OBSTACLE_WIDTHS = ['6em', '8em', '10em', '12em'];
const STORAGE_PONTUATION_KEY = "pontuacao";
const STORAGE_RECORD_KEY = "recordTime";

const jumpSound = new Audio('./assets/audio/jump.wav');
const gameOverSoundP1 = new Audio('./assets/audio/boyShout.wav');
const gameOverSoundP2 = new Audio('./assets/audio/girlShout.wav');

const backgroundMusic = new Audio('./assets/audio/background.mp3');
const playPauseSoundButton = document.querySelector("#player");
const muteSoundButton = document.querySelector("#mute-btn");
const increaseSoundButton = document.querySelector("#increase-btn");
const decreaseSoundButton = document.querySelector("#decrease-btn");

const character = document.querySelector("#character");
const obstacle = document.querySelector("#obstacle");

// Telas
const gameBoard = document.querySelector(".game-board");
const gameStartScreen = document.querySelector(".start-game-screen");
const gameOverScreen = document.querySelector(".game-over-screen");

const sideMenuScreen = document.querySelector(".sidemenu-wrapper");
const scorePanel = document.querySelector(".pontuation-wrapper");
const commandsPanel = document.querySelector(".commands-wrapper");
const musicControlScreen = document.querySelector(".volume-control-wrapper");

const generalConfigScreen = document.querySelector(".game-config-screen");
const gameAlert = document.querySelector("#game-config-message");

const mobileJumpArea = document.querySelector("#jump-area-mobile");

const selectCharBtnP1 = document.querySelectorAll(".character-1-btn");
const selectCharBtnP2 = document.querySelectorAll(".character-2-btn");

// Botões de dificuldade
const easyModeBtn = document.querySelectorAll(".easy-mode-btn");
const mediumModeBtn = document.querySelectorAll(".medium-mode-btn");
const hardModeBtn = document.querySelectorAll(".hard-mode-btn");

// Botões dos menus
const startBtn = document.querySelector("#start-game-btn");
const restartBtn = document.querySelector("#restart-game-btn");
const backButton = document.querySelectorAll(".btn-back-screen");

// Botões togglers
const scoreToggleBtn = document.querySelector("#score-toggler-btn");
const cmdToggleBtn = document.querySelector("#command-toggler-btn");
const musicControlToggleBtn = document.querySelector("#music-controls-toggler-btn");
const configToggleBtn = document.querySelectorAll(".config-toggler-btn");
const resizeBtn = document.querySelector("#resize-screen-btn i");

const trashBtn = document.querySelector("#list-trash-btn");

const gameCounter = document.querySelector("#time-counter");
const gameOverTimeDisplay = document.querySelector("#game-over-time-display");
const musicVolumeDisplay = document.querySelector("#volume-display");

const gameOverP1 = "./assets/img/falledBoy.png";
const gameOverP2 = "./assets/img/falledGirl.png";
const char1Image = "./assets/img/boy.gif";
const char2Image = "./assets/img/girl.gif";

const enlargeIcon = "fa-up-right-and-down-left-from-center";
const shrinkIcon = "fa-down-left-and-up-right-to-center";

const userPontuationList = document.querySelector("#pontuations-list");

let localStoragePontuation = JSON.parse(localStorage.getItem(STORAGE_PONTUATION_KEY)) || [];
let selectedCharacter = "p1";
let selectedDifficulty = "easy";
let configMessageTimeout;
let jumpTimeout;

backgroundMusic.loop = true;
gameOverSoundP1.volume = 0.5;
gameOverSoundP2.volume = 0.5;
jumpSound.volume = 0.8;

const toggleMute = () => {
    backgroundMusic.muted = !backgroundMusic.muted;
    updateMuteButton();
};

const updateMuteButton = () => {
    const isMuted = backgroundMusic.muted;
    const iconClass = isMuted ? "fa-volume-xmark" : "fa-volume-high";
    const title = isMuted ? "Desmutar" : "Mutar";

    $(muteSoundButton).attr("title", title).removeClass("fa-volume-xmark fa-volume-high").addClass(iconClass);
};

const togglePlayPause = () => {
    if (backgroundMusic.paused) {
        backgroundMusic.play();
    } else {
        backgroundMusic.pause();
    }
    updatePlayPauseButton();
};

const updatePlayPauseButton = () => {
    const isPaused = backgroundMusic.paused;
    const iconClass = isPaused ? "fa-play" : "fa-pause";
    const title = isPaused ? "Iniciar" : "Pausar";

    $(playPauseSoundButton).attr("title", title).removeClass("fa-play fa-pause").addClass(iconClass);
};

const adjustVolume = (increment) => {
    backgroundMusic.volume = Math.max(0, Math.min(1, backgroundMusic.volume + increment));
    updateVolumeDisplay();
};

const updateVolumeDisplay = () => {
    $(musicVolumeDisplay).text("Volume: " + (backgroundMusic.volume).toFixed(1));
};

const updateUserPontuationList = () => {
    $(userPontuationList).empty();

    $.each(localStoragePontuation, (index, dado) => {
        $(userPontuationList).append(`<li>${dado}</li>`);
    });
};

const saveStorage = () => {
    localStorage.setItem(STORAGE_PONTUATION_KEY, JSON.stringify(localStoragePontuation));
};

const clearStorage = () => {
    if (confirm('Confirmar a remoção de todos os dados do histórico?')) {
        localStorage.removeItem(STORAGE_PONTUATION_KEY);
        localStorage.removeItem(STORAGE_RECORD_KEY);
        localStoragePontuation = [];
        updateRecord();
    }
};

const updateRecord = () => {
    updateUserPontuationList();

    let number, maxTime;

    if ($(userPontuationList).children().length > 0) {
        number = $(userPontuationList)
            .children()
            .map((_index, element) => Number($(element).find('span').text().replace(/\D/g, '')))
            .toArray();
        maxTime = Math.max(...number);

        $(userPontuationList).children().each((_index, element) => {
            if (Number($(element).find('span').text().replace(/\D/g, '')) === maxTime) {
                $(element).addClass('recorde');
            } else {
                $(element).removeClass('recorde');
            }
        });
    }
};

const toggleFullScreen = () => {
    $(obstacle).toggleClass("resized");
    $(character).toggleClass("resized");

    if (!document.fullscreenElement) {
        $(resizeBtn).removeClass(enlargeIcon).addClass(shrinkIcon);
        gameBoard.requestFullscreen();

        return;
    }

    $(resizeBtn).removeClass(shrinkIcon).addClass(enlargeIcon);
    document.exitFullscreen();
};

const toggleScore = () => {
    $(scorePanel).toggleClass("selected-screen");

    if ($(gameBoard).hasClass("resized")) {
        $(sideMenuScreen).fadeIn(200)
    };

    $(trashBtn).attr("tabindex", $(scorePanel).hasClass("selected-screen") ? 0 : -1);
    $(musicControlScreen).removeClass("selected-screen");
    $(commandsPanel).removeClass("selected-screen");
};

const toggleCommands = () => {
    $(commandsPanel).toggleClass("selected-screen");

    if ($(gameBoard).hasClass("resized"))
        $(sideMenuScreen).fadeIn(200);

    if ($(musicControlScreen).hasClass("selected-screen"))
        $(musicControlScreen).removeClass("selected-screen");
    if ($(scorePanel).hasClass("selected-screen"))
        $(scorePanel).removeClass("selected-screen");
};

const toggleSoundControls = () => {
    $(musicControlScreen).toggleClass("selected-screen");

    if ($(gameBoard).hasClass("resized"))
        $(sideMenuScreen).fadeIn(200);

    if ($(musicControlScreen).hasClass("selected-screen"))
        $(".controls").children().each((e, element) => $(element).attr("tabindex", "0"));
    else
        $(".controls").children().each((e, element) => $(element).attr("tabindex", "-1"))

    if ($(scorePanel).hasClass("selected-screen"))
        $(scorePanel).removeClass("selected-screen");
    if ($(commandsPanel).hasClass("selected-screen"))
        $(commandsPanel).removeClass("selected-screen");
};

const toggleGameConfig = () => {
    $(generalConfigScreen).toggleClass("selected-screen");
};

const hideScreens = () => {
    if ($(musicControlScreen).hasClass("selected-screen"))
        $(musicControlScreen).removeClass("selected-screen");

    if ($(scorePanel).hasClass("selected-screen"))
        $(scorePanel).removeClass("selected-screen");

    if ($(commandsPanel).hasClass("selected-screen"))
        $(commandsPanel).removeClass("selected-screen");

    if ($(generalConfigScreen).hasClass("selected-screen"))
        $(generalConfigScreen).removeClass("selected-screen");
};

const toggleCharacter = (character) => {
    selectedCharacter = character;
    showConfigMessage(`<p>Personagem ${character} selecionado!</p>`);
}

const showConfigMessage = message => {
    clearTimeout(configMessageTimeout);

    $(gameAlert).html(`<p>${message}</p>`);
    $(gameAlert).fadeIn();

    configMessageTimeout = setTimeout(() => $(gameAlert).fadeOut(), 1000)
}

const toggleEasyMode = () => {
    showConfigMessage("Dificuldade fácil selecionada!");
    selectedDifficulty = "easy";
};

const toggleMediumMode = () => {
    showConfigMessage("Dificuldade média selecionada!");
    selectedDifficulty = "medium";
};

const toggleHardMode = () => {
    showConfigMessage("Dificuldade difícil selecionada!");
    selectedDifficulty = "hard";
};

const initGameDifficulty = () => {
    const animations = {
        "easy": `obstacle-running ${EASY_SPEED}s infinite linear .6s`,
        "medium": `obstacle-running ${MEDIUM_SPEED}s infinite linear .6s`,
        "hard": `obstacle-running ${HARD_SPEED}s infinite linear .6s`,
    }

    $(obstacle).css("animation", animations[selectedDifficulty]);
};

const jump = () => {
    clearTimeout(jumpTimeout);

    $(character).addClass("jump");
    jumpSound.play();
    jumpSound.loop = false;

    jumpTimeout = setTimeout(() => $(character).removeClass("jump"), 400);
};

const generateRandomObstacle = () => {
    $(obstacle).prop("src", `${OBSTACLE_IMAGES[Math.floor(Math.random() * OBSTACLE_IMAGES.length)]}`);
    $(obstacle).css("width", `${OBSTACLE_WIDTHS[Math.floor(Math.random() * OBSTACLE_WIDTHS.length)]}`);
};

const verifyGame = () => {
    let counter = 1;
    const counterInterval = setInterval(() => $(gameCounter).text(`Tempo: ${counter++}`), 1000);
    const randomObstacleInterval = setInterval(() => {
        const obstacleOffsetRight = +window.getComputedStyle(obstacle).right.replace("px", "");
        if (obstacleOffsetRight < -90) generateRandomObstacle();
    }, 10);

    const verifierLoop = setInterval(() => {
        const obstacleOffSetLeft = obstacle.offsetLeft;
        const jumpHeight = +window.getComputedStyle(character).bottom.replace("px", "");
        const isResized = $(gameBoard).hasClass("resized");

        const lost = (
            (!isResized && obstacleOffSetLeft <= 90 && obstacleOffSetLeft > 0 && jumpHeight <= 70) ||
            (isResized && obstacleOffSetLeft <= 120 && obstacleOffSetLeft > 0 && jumpHeight <= 70)
        );

        if (lost) {
            clearInterval(counterInterval);
            clearInterval(randomObstacleInterval);
            clearInterval(verifierLoop);

            const selectedCharacterIsP1 = selectedCharacter === "p1";
            character.src = selectedCharacterIsP1 ? gameOverP1 : gameOverP2;

            const gameOverSound = selectedCharacterIsP1 ? gameOverSoundP1 : gameOverSoundP2;
            gameOverSound.play();
            gameOverSound.loop = false;

            $(restartBtn).attr("disabled", false);

            $(obstacle).css("left", obstacleOffSetLeft);
            $(gameOverScreen).show();
            if (innerWidth <= 768) {
                $(mobileJumpArea).hide();
            }

            const translatedDifficulties = {
                "easy": "fácil",
                "medium": "média",
                "hard": "difícil"
            };

            const timeSeconds = counter - 1;
            const difficulty = translatedDifficulties[selectedDifficulty];
            const recordTime = localStorage.getItem(STORAGE_RECORD_KEY) || 0;

            if (timeSeconds > recordTime) {
                localStorage.setItem(STORAGE_RECORD_KEY, timeSeconds);
                $(gameOverTimeDisplay).text(`Parabéns! ${timeSeconds} segundo(s) é seu novo recorde!`);
            } else {
                $(gameOverTimeDisplay).text(`Seu tempo: ${timeSeconds} segundo(s)`);
            }

            if (timeSeconds != recordTime) {
                const liElement = document.createElement("li");
                const html = `Tempo: ${timeSeconds} segundo(s) - dificuldade: ${difficulty}`
                $(liElement).html(html);
                localStoragePontuation.push(html);
                $(userPontuationList).append($(liElement));
            }

            const userPontuations = $(userPontuationList).children().map((_index, element) => {
                return parseInt($(element).text().match(/\d+/)[0]);
            }).get();

            const maxTime = Math.max(...userPontuations);
            $(userPontuationList).children().removeClass("recorde").filter((_index, element) => {
                return $(element).text().includes(maxTime);
            }).addClass("recorde");

            saveStorage();
            $(counter).text("");
            $(obstacle).css("animation", "none");
        }
    }, 10);
};

const startGame = () => {
    const playerImage = selectedCharacter === "p1" ? char1Image : char2Image;
    $(character).prop("src", playerImage);

    $(gameCounter).text("Tempo: 0");

    $(obstacle).css({ "display": "flex", "left": "" });
    $(character).css({ "display": "flex" });

    $(gameOverScreen).hide();
    $(gameStartScreen).hide();

    if (innerWidth <= 768) {
        $(mobileJumpArea).show();
    }

    hideScreens();
    generateRandomObstacle();
    initGameDifficulty();
    verifyGame();
};

const hidePreloader = () => {
    $('#preloader .inner').fadeOut();
    $('#preloader').delay(350).fadeOut('slow');
    $('body').delay(350).css("overflow", "visible");
}

const handleButtonClicked = (event, callback) => {
    if (event.type == 'touchstart') {
        event.preventDefault();
    };

    callback();
}

$(window).on('load', () => {
    hidePreloader();
    updateRecord();
    $(obstacle).hide();
    $(gameAlert).hide();

    // Botões de dificuldade
    $(easyModeBtn).on("click touchstart", event => handleButtonClicked(event, toggleEasyMode));
    $(mediumModeBtn).on("click touchstart", event => handleButtonClicked(event, toggleMediumMode));
    $(hardModeBtn).on("click touchstart", event => handleButtonClicked(event, toggleHardMode));

    $(muteSoundButton).on("click touchstart", event => handleButtonClicked(event, toggleMute));
    $(playPauseSoundButton).on("click touchstart", event => handleButtonClicked(event, togglePlayPause));
    $(increaseSoundButton).on("click touchstart", event => handleButtonClicked(event, adjustVolume(0.1)));
    $(decreaseSoundButton).on("click touchstart", event => handleButtonClicked(event, adjustVolume(-0.1)));

    // Botões do menu de inicio e game-over
    $(startBtn).on("click touchstart", event => handleButtonClicked(event, startGame));
    $(restartBtn).on("click touchstart", event => handleButtonClicked(event, startGame));

    $(scoreToggleBtn).on("click touchstart", event => handleButtonClicked(event, toggleScore));
    $(cmdToggleBtn).on("click touchstart", event => handleButtonClicked(event, toggleCommands));
    $(musicControlToggleBtn).on("click touchstart", event => handleButtonClicked(event, toggleSoundControls));
    $(configToggleBtn).on("click touchstart", event => handleButtonClicked(event, toggleGameConfig));
    $(backButton).on("click touchstart", event => handleButtonClicked(event, toggleGameConfig));

    $(trashBtn).on("click touchstart", event => handleButtonClicked(event, clearStorage));

    $(resizeBtn).on("click touchstart", event => handleButtonClicked(event, toggleFullScreen));

    $(selectCharBtnP1).on("click touchstart", event => handleButtonClicked(event, toggleCharacter("p1")));
    $(selectCharBtnP2).on("click touchstart", event => handleButtonClicked(event, toggleCharacter("p2")));

    $(mobileJumpArea).on("touchstart", () => { if (gameOverScreen.style.display === 'none') jump() });

    // Eventos de pressionamento de teclas do teclado
    $(document).keydown(e => {
        if (e.which === 32 && gameOverScreen.style.display === 'none') jump();
        if (e.which === 38 && gameOverScreen.style.display === 'none') jump();

        if (e.which === 32 && gameStartScreen.style.display !== 'none') startGame();
        if (e.which === 32 && gameOverScreen.style.display === 'flex') startGame();

        if (e.which === 84) toggleFullScreen();

        if (e.which === 46) trashBtn.click();
        if (e.which === 67) cmdToggleBtn.click();
        if (e.which === 80) scoreToggleBtn.click();
    });
});

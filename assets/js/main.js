const EASY_SPEED = '1.4';
const MEDIUM_SPEED = '1.2';
const HARD_SPEED = '0.8';
const OBSTACLE_IMAGES = ['./assets/img/obstacle1.png', './assets/img/obstacle2.png', './assets/img/obstacle3.png'];
const OBSTACLE_WIDTHS = ['6rem', '8rem', '10rem', '12rem'];
const STORAGE_PONTUATION_KEY = "pontuacao";
const STORAGE_RECORD_KEY = "recordTime";

const jumpSound = new Audio('./assets/audio/jump.wav');
const gameOverSoundP1 = new Audio('./assets/audio/boyShout.wav');
const gameOverSoundP2 = new Audio('./assets/audio/girlShout.wav');

const character = document.querySelector("#character");
const obstacle = document.querySelector("#obstacle");

// Telas
const gameBoard = document.querySelector(".game-board");
const gameStartScreen = document.querySelector(".start-game-screen");
const gameOverScreen = document.querySelector(".game-over-screen");

const sideMenuScreen = document.querySelector(".sidemenu-wrapper");
const scorePanel = document.querySelector(".pontuation-wrapper");
const commandsPanel = document.querySelector(".commands-wrapper");

const gameScreen = document.querySelector(".game");
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
const muteToggleBtn = document.querySelector("#music-controls-toggler-btn");
const configToggleBtn = document.querySelectorAll(".config-toggler-btn");
const resizeBtn = document.querySelector("#resize-screen-btn");

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

const pontuationTable = document.querySelector("#pontuations-table tbody");

let userInteractedWithScreen = false;
let localStoragePontuation = JSON.parse(localStorage.getItem(STORAGE_PONTUATION_KEY)) || [];
let selectedCharacter = "p1";
let selectedDifficulty = "easy";
let configMessageTimeout;
let jumpTimeout;

gameOverSoundP1.volume = 0.5;
gameOverSoundP2.volume = 0.5;
jumpSound.volume = 0.8;

const saveStorage = (timeSeconds, difficulty) => {
    localStoragePontuation.push(`Tempo: ${timeSeconds} segundo(s) - dificuldade: ${difficulty}`);
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

const populatePontuationTable = () => {
    $(pontuationTable).empty();

    if (localStoragePontuation.length === 0) {
        $(pontuationTable).append(`<tr><td>Nenhuma pontuação cadastrada</td></tr>`);
        return;
    }

    localStoragePontuation.forEach((item, index) => {
        $(pontuationTable).append(`<tr><td>${index + 1}) <span>${item}</span></td></tr>`);
    });
};

const updateRecord = () => {
    populatePontuationTable();

    let maxTime = 0;
    let maxIndex = -1;

    localStoragePontuation.forEach((item, index) => {
        const timeSeconds = parseInt(item.match(/\d+/)[0]);
        if (timeSeconds > maxTime) {
            maxTime = timeSeconds;
            maxIndex = index;
        }
    });

    if (maxIndex !== -1) {
        $(pontuationTable).children().removeClass("recorde").eq(maxIndex).addClass("recorde");
    }
};

const toggleFullscreen = () => {
    $(obstacle).toggleClass("resized");
    $(character).toggleClass("resized");

    if (!document.fullscreenElement) {
        $(resizeBtn).children("i").removeClass(enlargeIcon).addClass(shrinkIcon);
        gameBoard.requestFullscreen();

        return;
    }

    $(resizeBtn).children("i").removeClass(shrinkIcon).addClass(enlargeIcon);
    document.exitFullscreen();
};

const toggleScoreScreen = () => {
    $(scorePanel).toggleClass("selected-screen");

    if ($(gameBoard).hasClass("resized")) {
        $(sideMenuScreen).fadeIn(200)
    };

    $(trashBtn).attr("tabindex", $(scorePanel).hasClass("selected-screen") ? 0 : -1);
    $(commandsPanel).removeClass("selected-screen");
};

const toggleCommandsScreen = () => {
    $(commandsPanel).toggleClass("selected-screen");

    if ($(gameBoard).hasClass("resized")) {
        $(sideMenuScreen).fadeIn(200);
    }

    if ($(scorePanel).hasClass("selected-screen")) {
        $(scorePanel).removeClass("selected-screen");
    }
};

const toggleGameConfigScreen = () => {
    $(generalConfigScreen).toggleClass("selected-screen");
};

const hideAllScreens = () => {
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

    $(gameAlert).html(`<p><i class="fa-solid fa-exclamation-circle"></i> ${message}</p>`).addClass("active");
    configMessageTimeout = setTimeout(() => $(gameAlert).removeClass("active"), 1000)
}

const chooseEasyGameMode = () => {
    showConfigMessage("Dificuldade fácil selecionada!");
    selectedDifficulty = "easy";
};

const chooseMediumGameMode = () => {
    showConfigMessage("Dificuldade média selecionada!");
    selectedDifficulty = "medium";
};

const chooseHardGameMode = () => {
    showConfigMessage("Dificuldade difícil selecionada!");
    selectedDifficulty = "hard";
};

const startGameModeConfig = () => {
    const animations = {
        "easy": `obstacle-running ${EASY_SPEED}s infinite linear .6s`,
        "medium": `obstacle-running ${MEDIUM_SPEED}s infinite linear .6s`,
        "hard": `obstacle-running ${HARD_SPEED}s infinite linear .6s`,
    }

    $(obstacle).css("animation", animations[selectedDifficulty]);
};

const generateRandomObstacle = () => {
    $(obstacle).prop("src", `${OBSTACLE_IMAGES[Math.floor(Math.random() * OBSTACLE_IMAGES.length)]}`);
    $(obstacle).css("width", `${OBSTACLE_WIDTHS[Math.floor(Math.random() * OBSTACLE_WIDTHS.length)]}`);
};

const jumpCharacter = () => {
    if (gameOverScreen.style.display === 'none') {
        clearTimeout(jumpTimeout);

        $(character).addClass("jump");
        jumpSound.play();
        jumpSound.loop = false;

        jumpTimeout = setTimeout(() => $(character).removeClass("jump"), 400);
    }
};

const verifyGame = () => {
    const gameWidth = $(gameScreen).width();
    let obstacleGenerated = false;
    let counter = 1;

    const counterInterval = setInterval(() => $(gameCounter).text(`Tempo: ${counter++}`), 1000);
    const randomObstacleInterval = setInterval(() => {
        const obstacleRight = obstacle.offsetLeft + obstacle.offsetWidth;
        if (obstacleRight < 0 || obstacle.offsetLeft > gameWidth) {
            generateRandomObstacle();
        }
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
            $(gameScreen).removeClass("running");
            $(gameOverScreen).show();
            if (innerWidth <= 768) {
                $(mobileJumpArea).addClass("hidden");
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
                $(pontuationTable).append(`<tr><td>${$(pontuationTable).children().length}) <span>Tempo: ${timeSeconds} segundo(s) - dificuldade: ${difficulty}</span></td></tr>`);
                $(gameOverTimeDisplay).text(`Parabéns! ${timeSeconds} segundo(s) é seu novo recorde!`);
            } else {
                $(gameOverTimeDisplay).text(`Seu tempo: ${timeSeconds} segundo(s)`);
            }

            saveStorage(timeSeconds, difficulty);

            const userPontuations = $(pontuationTable).children().map((_index, element) => {
                return parseInt($(element).text().match(/\d+/));
            }).get();

            const maxTime = Math.max(...userPontuations);
            $(pontuationTable).children().removeClass("recorde").filter((_index, element) => {
                return $(element).text().includes(maxTime);
            }).addClass("recorde");

            $(obstacle).css("animation", "none");
        } else if (!obstacleGenerated && obstacleOffSetLeft <= gameWidth) {
            generateRandomObstacle();
            obstacleGenerated = true;
        }
    }, 10);
};

const startGame = () => {
    const playerImage = selectedCharacter === "p1" ? char1Image : char2Image;
    $(character).prop("src", playerImage);

    $(gameCounter).empty();
    $(gameScreen).addClass("running");

    $(obstacle).css({ "display": "flex", "left": "" });
    $(character).css({ "display": "flex" });

    $(gameOverScreen).hide();
    $(gameStartScreen).hide();

    if (innerWidth <= 768) {
        $(mobileJumpArea).removeClass("hidden");
    }

    hideAllScreens();
    startGameModeConfig();
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

    // Botões de dificuldade
    $(easyModeBtn).on("click touchstart", event => handleButtonClicked(event, chooseEasyGameMode));
    $(mediumModeBtn).on("click touchstart", event => handleButtonClicked(event, chooseMediumGameMode));
    $(hardModeBtn).on("click touchstart", event => handleButtonClicked(event, chooseHardGameMode));

    // Botões do menu de inicio e game-over
    $(startBtn).on("click touchstart", event => handleButtonClicked(event, startGame));
    $(restartBtn).on("click touchstart", event => handleButtonClicked(event, startGame));

    $(scoreToggleBtn).on("click touchstart", event => handleButtonClicked(event, toggleScoreScreen));

    $(cmdToggleBtn).on("click touchstart", event => handleButtonClicked(event, toggleCommandsScreen));
    $(configToggleBtn).on("click touchstart", event => handleButtonClicked(event, toggleGameConfigScreen));
    $(backButton).on("click touchstart", event => handleButtonClicked(event, toggleGameConfigScreen));

    $(trashBtn).on("click touchstart", event => handleButtonClicked(event, clearStorage));

    $(resizeBtn).on("click touchstart", event => handleButtonClicked(event, toggleFullscreen));

    $(selectCharBtnP1).on("click touchstart", event => handleButtonClicked(event, toggleCharacter("p1")));
    $(selectCharBtnP2).on("click touchstart", event => handleButtonClicked(event, toggleCharacter("p2")));

    $(mobileJumpArea).on("touchstart", jumpCharacter);

    // Eventos de pressionamento de teclas do teclado
    $(document).keydown(event => {
        const pressedKey = event.which;

        if (pressedKey === 32 || pressedKey === 38) jumpCharacter();

        if (pressedKey === 32 && (gameStartScreen.style.display === 'block' || gameOverScreen.style.display === 'block')) startGame();

        if (pressedKey === 84) toggleFullscreen();

        if (pressedKey === 46) clearStorage();
        if (pressedKey === 67) toggleCommandsScreen();
        if (pressedKey === 80) toggleScoreScreen();
    });

    $(document).click(event => {
        const clickedElement = event.target;

        if (cmdToggleBtn.contains(clickedElement) || scoreToggleBtn.contains(clickedElement)) return;

        if (!scorePanel.contains(clickedElement) && $(scorePanel).hasClass('selected-screen')) {
            $(scorePanel).removeClass('selected-screen');
        }

        if (!commandsPanel.contains(clickedElement) && $(commandsPanel).hasClass('selected-screen')) {
            $(commandsPanel).removeClass('selected-screen');
        }
    });

});

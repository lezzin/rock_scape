import {
    EASY_SPEED,
    MEDIUM_SPEED,
    HARD_SPEED,
    OBSTACLE_IMAGES,
    OBSTACLE_WIDTHS,
    STORAGE_PONTUATION_KEY,
    STORAGE_RECORD_KEY,
    GAME_OVER_IMAGE_P1,
    GAME_OVER_IMAGE_P2,
    IMAGE_P1,
    IMAGE_P2,
    JUMP_SOUND,
    DAMAGE_SOUND_P1,
    DAMAGE_SOUND_P2,
    GAME_DIFICULTIES,
    GAME_PLAYERS,
    GAME_MESSAGES
} from "./variables.js";

const character = $("#character");
const obstacle = $("#obstacle");

const gameScreen = $(".game");
const gameCounter = $("#time-counter");
const mobileJumpArea = $("#jump-area-mobile");
const gameStartScreen = $(".start-game-screen");
const gameOverScreen = $(".game-over-screen");
const gameOverTimeDisplay = $("#game-over-time-display");
const gameConfigScreen = $(".game-config-screen");
const gameConfigAlert = $("#game-config-message");

const scorePanel = $(".score-wrapper");
const scoreTable = $("#score-table tbody");
const commandsPanel = $(".commands-wrapper");

const gameWidth = gameScreen.width();
const gameOffset = gameScreen.offset();

const selectP1Btn = $(".character-1-btn");
const selectP2Btn = $(".character-2-btn");

const easyModeBtn = $(".easy-mode-btn");
const mediumModeBtn = $(".medium-mode-btn");
const hardModeBtn = $(".hard-mode-btn");

const startBtn = $("#start-game-btn");
const restartBtn = $("#restart-game-btn");
const backButton = $(".btn-back-screen");

const scoreToggleBtn = $("#score-toggler-btn");
const cmdToggleBtn = $("#command-toggler-btn");
const configToggleBtn = $(".config-toggler-btn");

const trashBtn = $("#list-trash-btn");

let userScores = JSON.parse(localStorage.getItem(STORAGE_PONTUATION_KEY)) || [];

let configMessageTimeout;
let jumpTimeout;

let selectedPlayer = GAME_PLAYERS.boy;
let selectedDifficulty = GAME_DIFICULTIES.easy;

DAMAGE_SOUND_P1.volume = 0.5;
DAMAGE_SOUND_P2.volume = 0.5;
JUMP_SOUND.volume = 0.8;

const saveScoreStorage = (time, difficulty) => {
    const pontuationEntry = GAME_MESSAGES.scoreLocalStorage(time, difficulty);
    userScores.push(pontuationEntry);
    localStorage.setItem(STORAGE_PONTUATION_KEY, JSON.stringify(userScores));
};

const clearStorage = () => {
    if (confirm('Confirmar a remoção de todos os dados do histórico?')) {
        localStorage.removeItem(STORAGE_PONTUATION_KEY);
        localStorage.removeItem(STORAGE_RECORD_KEY);
        userScores = [];
        updateRecord();
    }
};

const populatePontuationTable = () => {
    scoreTable.empty();

    if (userScores.length === 0) {
        scoreTable.append(GAME_MESSAGES.emptyScore);
        return;
    }

    userScores.forEach((scoreHTML, index) => {
        const pontuationIndex = index + 1;
        scoreTable.append(GAME_MESSAGES.scoreTable(pontuationIndex, scoreHTML));
    });
};

const updateRecord = () => {
    populatePontuationTable();

    let maxTime = 0;
    let indexOfMaxTime = -1;

    userScores.forEach((item, index) => {
        const timeSeconds = parseInt(item.match(/\d+/)[0]);
        if (timeSeconds > maxTime) {
            maxTime = timeSeconds;
            indexOfMaxTime = index;
        }
    });

    if (indexOfMaxTime !== -1) {
        scoreTable.children().removeClass("recorde").eq(indexOfMaxTime).addClass("recorde");
    }
};

const toggleScreen = (screenToToggle) => {
    screenToToggle.toggleClass("selected-screen");
};

const toggleScoreScreen = () => {
    toggleScreen(scorePanel);
    commandsPanel.removeClass("selected-screen");
};

const toggleCommandsScreen = () => {
    toggleScreen(commandsPanel);
    scorePanel.removeClass("selected-screen");
};

const toggleGameConfigScreen = () => {
    gameConfigScreen.fadeToggle();
};

const hideAllScreens = () => {
    const screens = [scorePanel, commandsPanel, gameConfigScreen];
    screens.forEach(screen => {
        if (screen.hasClass("selected-screen")) {
            toggleScreen(screen);
        }
    });
};

const toggleCharacter = (character) => {
    selectedPlayer = character;
    const characterText = character === GAME_PLAYERS.boy ? "masculino" : "feminino";
    showConfigMessage(GAME_MESSAGES.selectedCharacter(characterText));
}

const showConfigMessage = (message) => {
    clearTimeout(configMessageTimeout);

    gameConfigAlert.html(GAME_MESSAGES.config(message)).addClass("active");
    configMessageTimeout = setTimeout(() => gameConfigAlert.removeClass("active"), 1000);
};

const setGameDifficulty = (difficulty, message) => {
    showConfigMessage(message);
    selectedDifficulty = difficulty;
};

const chooseEasyGameMode = () => {
    setGameDifficulty("easy", "Dificuldade fácil selecionada!");
};

const chooseMediumGameMode = () => {
    setGameDifficulty("medium", "Dificuldade média selecionada!");
};

const chooseHardGameMode = () => {
    setGameDifficulty("hard", "Dificuldade difícil selecionada!");
};

const startGameModeConfig = () => {
    const animations = {
        "easy": `obstacle-running ${EASY_SPEED}s infinite linear .6s`,
        "medium": `obstacle-running ${MEDIUM_SPEED}s infinite linear .6s`,
        "hard": `obstacle-running ${HARD_SPEED}s infinite linear .6s`,
    };

    obstacle.css("animation", animations[selectedDifficulty]);
};

const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

const generateRandomObstacle = () => {
    const randomImage = getRandomElement(OBSTACLE_IMAGES);
    const randomWidth = getRandomElement(OBSTACLE_WIDTHS);

    obstacle.prop("src", randomImage);
    obstacle.css("width", randomWidth);
};

const jumpCharacter = () => {
    const isGameScreenVisible = gameScreen.css("display") === 'block';

    if (!isGameScreenVisible) return;

    clearTimeout(jumpTimeout);

    character.addClass("jump");
    JUMP_SOUND.play();
    JUMP_SOUND.loop = false;

    jumpTimeout = setTimeout(() => character.removeClass("jump"), 600);
};

const verifyGame = () => {
    let counter = 1;

    const counterLoop = setInterval(() => gameCounter.text(GAME_MESSAGES.timeCounter(counter++)), 1000);

    const checkCollisionAndGenerateObstacle = () => {
        const characterBox = {
            left: character.offset().left - gameOffset.left,
            right: character.offset().left + character.outerWidth() - gameOffset.left,
            top: character.offset().top - gameOffset.top,
            bottom: character.offset().top + character.outerHeight() - gameOffset.top
        };

        const obstacleBox = {
            left: obstacle.offset().left - gameOffset.left,
            right: obstacle.offset().left + obstacle.outerWidth() - gameOffset.left,
            top: obstacle.offset().top - gameOffset.top,
            bottom: obstacle.offset().top + obstacle.outerHeight() - gameOffset.top
        };

        const lost = (
            characterBox.right >= obstacleBox.left &&
            characterBox.left <= obstacleBox.right &&
            characterBox.bottom >= obstacleBox.top &&
            characterBox.top <= obstacleBox.bottom
        );

        if (lost) {
            clearInterval(counterLoop);
            clearInterval(verifierLoop);
            handleGameOver();
        } else if (obstacleBox.right - 50 > gameWidth) {
            generateRandomObstacle();
        }
    };

    const verifierLoop = setInterval(checkCollisionAndGenerateObstacle, 10);

    const handleGameOver = () => {
        const selectedCharacterIsP1 = selectedPlayer === GAME_PLAYERS.boy;
        const gameOverSound = selectedCharacterIsP1 ? DAMAGE_SOUND_P1 : DAMAGE_SOUND_P2;
        character.prop("src", selectedCharacterIsP1 ? GAME_OVER_IMAGE_P1 : GAME_OVER_IMAGE_P2);
        obstacle.css("animation", "none");

        gameOverSound.play();
        gameOverSound.loop = false;

        gameScreen.removeClass("running");
        gameOverScreen.fadeIn();
        gameCounter.hide();

        if (innerWidth <= 768) {
            mobileJumpArea.addClass("hidden");
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
            gameOverTimeDisplay.text(GAME_MESSAGES.newRecord(timeSeconds));
            localStorage.setItem(STORAGE_RECORD_KEY, timeSeconds);
        } else {
            gameOverTimeDisplay.text(GAME_MESSAGES.runFeedback(timeSeconds));
        }
        
        saveScoreStorage(timeSeconds, difficulty);
        updateRecord();
    };
};

const startGame = () => {
    const playerImage = selectedPlayer === GAME_PLAYERS.boy ? IMAGE_P1 : IMAGE_P2;
    character.prop("src", playerImage);

    gameCounter.text(GAME_MESSAGES.timeCounterInitial).show();
    gameScreen.addClass("running");

    obstacle.show();
    character.show();

    gameOverScreen.fadeOut();
    gameStartScreen.fadeOut();

    if (innerWidth <= 768) {
        $(mobileJumpArea).removeClass("hidden");
    }

    hideAllScreens();
    startGameModeConfig();
    verifyGame();
};

const hidePreloader = () => {
    $('#preloader').fadeOut('slow');
};

const handleButtonClick = (event, callback) => {
    if (event.type === 'touchstart') {
        event.preventDefault();
    }

    callback();
};

const handleKeyPress = ({ which }) => {
    const SPACE_KEY = 32;
    const DELETE_KEY = 46;
    const ARROW_TOP_KEY = 38;
    const T_KEY = 84;
    const C_KEY = 67;
    const P_KEY = 80;

    switch (which) {
        case SPACE_KEY:
            if (gameStartScreen.css("display") === 'block' || gameOverScreen.css("display") === 'block') startGame();
        case ARROW_TOP_KEY:
            jumpCharacter();
            break;
        case T_KEY:
            toggleFullscreen();
            break;
        case DELETE_KEY:
            clearStorage();
            break;
        case C_KEY:
            toggleCommandsScreen();
            break;
        case P_KEY:
            toggleScoreScreen();
            break;
        default:
            break;
    }
};

// Botões de dificuldade
easyModeBtn.on("click touchstart", event => handleButtonClick(event, chooseEasyGameMode));
mediumModeBtn.on("click touchstart", event => handleButtonClick(event, chooseMediumGameMode));
hardModeBtn.on("click touchstart", event => handleButtonClick(event, chooseHardGameMode));

// Botões do menu de inicio e game-over
startBtn.on("click touchstart", event => handleButtonClick(event, startGame));
restartBtn.on("click touchstart", event => handleButtonClick(event, startGame));

scoreToggleBtn.on("click touchstart", event => handleButtonClick(event, toggleScoreScreen));

cmdToggleBtn.on("click touchstart", event => handleButtonClick(event, toggleCommandsScreen));
configToggleBtn.on("click touchstart", event => handleButtonClick(event, toggleGameConfigScreen));
backButton.on("click touchstart", event => handleButtonClick(event, toggleGameConfigScreen));

trashBtn.on("click touchstart", event => handleButtonClick(event, clearStorage));

selectP1Btn.on("click touchstart", event => handleButtonClick(event, toggleCharacter(GAME_PLAYERS.boy)));
selectP2Btn.on("click touchstart", event => handleButtonClick(event, toggleCharacter(GAME_PLAYERS.girl)));

mobileJumpArea.on("touchstart", jumpCharacter);

$(document).keydown(handleKeyPress);

hidePreloader();
updateRecord();
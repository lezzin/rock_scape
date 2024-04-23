const EASY_SPEED = '1.4';
const MEDIUM_SPEED = '1.2';
const HARD_SPEED = '0.8';
const OBSTACLE_IMAGES = ['./assets/img/obstacle1.png', './assets/img/obstacle2.png', './assets/img/obstacle3.png'];
const OBSTACLE_WIDTHS = ['3rem', '3.5rem', '4rem', '4.5rem'];
const STORAGE_PONTUATION_KEY = "pontuacao";
const STORAGE_RECORD_KEY = "recordTime";

const GAME_OVER_IMAGE_P1 = "./assets/img/falledBoy.png";
const GAME_OVER_IMAGE_P2 = "./assets/img/falledGirl.png";
const IMAGE_P1 = "./assets/img/boy.gif";
const IMAGE_P2 = "./assets/img/girl.gif";

const JUMP_SOUND = new Audio('./assets/audio/jump.wav');
const DAMAGE_SOUND_P1 = new Audio('./assets/audio/boyShout.wav');
const DAMAGE_SOUND_P2 = new Audio('./assets/audio/girlShout.wav');

const character = $("#character");
const obstacle = $("#obstacle");

const gameBoard = $(".game-board");
const gameScreen = $(".game");
const gameCounter = $("#time-counter");
const mobileJumpArea = $("#jump-area-mobile");
const gameStartScreen = $(".start-game-screen");
const gameOverScreen = $(".game-over-screen");
const gameOverTimeDisplay = $("#game-over-time-display");
const gameConfigScreen = $(".game-config-screen");
const gameConfigAlert = $("#game-config-message");

const sideMenuPanel = $(".sidemenu-wrapper");
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
const muteToggleBtn = $("#music-controls-toggler-btn");
const configToggleBtn = $(".config-toggler-btn");

const trashBtn = $("#list-trash-btn");

const musicVolumeDisplay = $("#volume-display");

const enlargeIcon = "fa-up-right-and-down-left-from-center";
const shrinkIcon = "fa-down-left-and-up-right-to-center";


let userScore = JSON.parse(localStorage.getItem(STORAGE_PONTUATION_KEY)) || [];
let selectedPlayer = "p1";
let selectedDifficulty = "easy";
let configMessageTimeout;
let jumpTimeout;

DAMAGE_SOUND_P1.volume = 0.5;
DAMAGE_SOUND_P2.volume = 0.5;
JUMP_SOUND.volume = 0.8;

const saveScoreStorage = (time, difficulty) => {
    const pontuationEntry = `Tempo correndo na dificuldade ${difficulty}: ${time} segundo(s)`;
    userScore.push(pontuationEntry);
    localStorage.setItem(STORAGE_PONTUATION_KEY, JSON.stringify(userScore));
};

const clearStorage = () => {
    if (confirm('Confirmar a remoção de todos os dados do histórico?')) {
        localStorage.removeItem(STORAGE_PONTUATION_KEY);
        localStorage.removeItem(STORAGE_RECORD_KEY);
        userScore = [];
        updateRecord();
    }
};

const populatePontuationTable = () => {
    scoreTable.empty();

    if (userScore.length === 0) {
        scoreTable.append(`<tr><td>Nenhuma pontuação cadastrada</td></tr>`);
        return;
    }

    userScore.forEach((scoreHTML, index) => {
        const pontuationIndex = index + 1;
        scoreTable.append(`<tr><td>${pontuationIndex}) <span>${scoreHTML}</span></td></tr>`);
    });
};

const updateRecord = () => {
    populatePontuationTable();

    let maxTime = 0;
    let indexOfMaxTime = -1;

    userScore.forEach((item, index) => {
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
    const characterText = character === "p1" ? "masculino" : "feminino";
    showConfigMessage(`<p>Personagem ${characterText} selecionado!</p>`);
}

const showConfigMessage = (message) => {
    clearTimeout(configMessageTimeout);

    gameConfigAlert.html(`<p><i class="fa-solid fa-exclamation-circle"></i> ${message}</p>`).addClass("active");
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
    const isGameScreenVisible = gameScreen.css("display") !== 'none';

    if (!isGameScreenVisible) return;

    clearTimeout(jumpTimeout);

    character.addClass("jump");
    JUMP_SOUND.play();
    JUMP_SOUND.loop = false;

    jumpTimeout = setTimeout(() => character.removeClass("jump"), 600);
};

const verifyGame = () => {
    let counter = 1;

    const counterLoop = setInterval(() => gameCounter.text(`Tempo: ${counter++}`), 1000);

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
        const selectedCharacterIsP1 = selectedPlayer === "p1";
        const gameOverSound = selectedCharacterIsP1 ? DAMAGE_SOUND_P1 : DAMAGE_SOUND_P2;
        character.prop("src", selectedCharacterIsP1 ? GAME_OVER_IMAGE_P1 : GAME_OVER_IMAGE_P2);
        obstacle.css("animation", "none");

        gameOverSound.play();
        gameOverSound.loop = false;

        gameScreen.removeClass("running");
        gameOverScreen.fadeIn();
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
        
        saveScoreStorage(timeSeconds, difficulty);

        if (timeSeconds > recordTime) {
            gameOverTimeDisplay.text(`Uau! ${timeSeconds} segundo(s) é seu novo recorde de corrida!`);
            localStorage.setItem(STORAGE_RECORD_KEY, timeSeconds);
            populatePontuationTable();
        } else {
            gameOverTimeDisplay.text(`Você correu por ${timeSeconds} segundo(s)`);
        }

        const userPontuations = scoreTable.children().map((_index, element) => {
            return parseInt($(element).text().match(/\d+/));
        }).get();

        const maxTime = Math.max(...userPontuations);
        scoreTable.children().removeClass("recorde").filter((_index, element) => {
            return $(element).text().includes(maxTime);
        }).addClass("recorde");
    };
};

const startGame = () => {
    const playerImage = selectedPlayer === "p1" ? IMAGE_P1 : IMAGE_P2;
    character.prop("src", playerImage);

    gameCounter.text("Tempo: 0");
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

selectP1Btn.on("click touchstart", event => handleButtonClick(event, toggleCharacter("p1")));
selectP2Btn.on("click touchstart", event => handleButtonClick(event, toggleCharacter("p2")));

mobileJumpArea.on("touchstart", jumpCharacter);

$(document).keydown(handleKeyPress);

hidePreloader();
updateRecord();
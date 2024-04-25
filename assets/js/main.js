import { auth, db, provider } from "./firebase.js";
import {
    EASY_SPEED,
    MEDIUM_SPEED,
    HARD_SPEED,
    OBSTACLE_IMAGES,
    OBSTACLE_WIDTHS,
    MESSAGE_TIMER,
    GAME_OVER_IMAGE_P1,
    GAME_OVER_IMAGE_P2,
    IMAGE_P1,
    IMAGE_P2,
    JUMP_SOUND,
    STEP_SOUND,
    DAMAGE_SOUND_P1,
    DAMAGE_SOUND_P2,
    RECORD_SOUND,
    GAME_DIFICULTIES,
    GAME_CHARACTERS,
    GAME_MESSAGES
} from "./variables.js";

const scoreboardRef = db.collection('scoreboard').doc('scoreboard_users');

const $loginGoogleBtn = $("[data-google-login]");
const $logoutGoogleBtn = $("[data-google-logout]");
let loggedUser = null;

const $character = $("[data-character]");
const $obstacle = $("[data-obstacle]");

const $gameScreen = $("[data-game]");
const $gameScreenCounter = $("[data-time-counter]");
const $mobileJumpArea = $("[data-mobile-jump-area]");
const $gameStartScreen = $("[data-start-game-screen]");
const $gameOverScreen = $("[data-game-over-screen]");
const $gameOverCounterDisplay = $("[data-game-over-time]");
const $gameConfigScreen = $("[data-game-config-screen]");
const $gameConfigScreenAlert = $("[data-game-config-message]");

const $scorePanel = $("[data-score-wrapper]");
const $scorePanelTable = $("[data-score-table]");
const $scoreSelect = $("[data-select-scores]");

const $commandsPanel = $("[data-commands-wrapper]");

const $configSelectP1Btn = $("[data-select-char1-btn]");
const $configSelectP2Btn = $("[data-select-char2-btn]");
const $configEasyModeBtn = $("[data-easy-mode-btn]");
const $configMediumModeBtn = $("[data-medium-mode-btn]");
const $configHardModeBtn = $("[data-hard-mode-btn]");

const $startGameBtn = $("[data-start-game-btn]");
const backToStartBtn = $("[data-back-start-btn]");
const $scoreToggleBtn = $("[data-score-toggler-btn]");
const $commandsToggleBtn = $("[data-command-toggler-btn]");
const $configToggleBtn = $("[data-config-toggler-btn]");

const $gameWidth = $gameScreen.width();
const $gameOffset = $gameScreen.offset();

let scoreboard = [];

let selectedScoreDifficulty = $scoreSelect.val();
let selectedCharacter = GAME_CHARACTERS.boy;
let selectedDifficulty = GAME_DIFICULTIES.easy;
let canJump = true;

let activeIntervals = [];
let configMessageTimeout;
let characterJumpTimeout;


JUMP_SOUND.volume = 0.5;
STEP_SOUND.volume = 0.3;
RECORD_SOUND.volume = 0.5;
DAMAGE_SOUND_P1.volume = 0.4;
DAMAGE_SOUND_P2.volume = 0.4;

const toggleScoreDifficulty = ({ target: { value } }) => {
    selectedScoreDifficulty = value;
    updateRecord();
}

/**
 * Populates pontuation table.
 */
const populatePontuationTable = (data) => {
    $scorePanelTable.empty();

    if (data.length === 0) {
        $scorePanelTable.append(GAME_MESSAGES.emptyScore);
        return;
    }

    data.forEach((user, index) => {
        const { username, score, difficulty } = user;

        const translatedDifficulties = {
            easy: "fácil",
            medium: "média",
            hard: "difícil",
        }

        const scoreHTML = `${username} - ${score}s na dificuldade ${translatedDifficulties[difficulty]}`
        const pontuationIndex = index + 1;
        $scorePanelTable.append(GAME_MESSAGES.scoreTable(pontuationIndex, scoreHTML));
    });
};

/**
 * Updates record.
 */
const updateRecord = () => {
    scoreboardRef.get().then((doc) => {
        const scoreboardData = doc.data()?.scores;
        scoreboard = scoreboardData ? scoreboardData.filter((score, index) => score.difficulty === selectedScoreDifficulty && index < 10) : [];

        populatePontuationTable(scoreboard);

        let maxTime = 0;
        let indexOfMaxTime = -1;

        scoreboard.forEach((item, index) => {
            const timeSeconds = +(item.score);
            if (timeSeconds > maxTime) {
                maxTime = timeSeconds;
                indexOfMaxTime = index;
            }
        });

        if (indexOfMaxTime !== -1) {
            $scorePanelTable.children().removeClass("recorde").eq(indexOfMaxTime).addClass("recorde");
        }
    });
};

/**
 * Toggles screen.
 * @param {JQuery<HTMLElement>} screenToToggle - Screen to toggle.
 */
const toggleScreen = (screenToToggle) => {
    screenToToggle.toggleClass("selected-screen");
};

/**
 * Toggles score screen.
 */
const toggleScoreScreen = () => {
    if (!loggedUser) return;
    toggleScreen($scorePanel);
    $commandsPanel.removeClass("selected-screen");
};

/**
 * Toggles commands screen.
 */
const toggleCommandsScreen = () => {
    toggleScreen($commandsPanel);
    $scorePanel.removeClass("selected-screen");
};

/**
 * Toggles game config screen.
 */
const toggleGameConfigScreen = () => {
    $gameConfigScreen.fadeToggle();
};

/**
 * Hides all screens.
 */
const hideAllScreens = () => {
    const screens = [$scorePanel, $commandsPanel, $gameConfigScreen];
    screens.forEach(screen => {
        if (screen.hasClass("selected-screen")) {
            toggleScreen(screen);
        }
    });
};

/**
 * Toggles character.
 * @param {string} character - Character to toggle.
 * @param {HTMLElement} clickedButton - Clicked button.
 */
const toggleCharacter = (character, clickedButton) => {
    activateButton(clickedButton);

    if (selectedCharacter === character) {
        showConfigMessage(GAME_MESSAGES.characterIsSelected);
        return;
    };

    selectedCharacter = character;
    const characterText = character === GAME_CHARACTERS.boy ? "masculino" : "feminino";
    showConfigMessage(GAME_MESSAGES.selectedCharacter(characterText));
}

/**
 * Shows configuration message.
 * @param {string} message - Message to display.
 */
const showConfigMessage = (message) => {
    clearTimeout(configMessageTimeout);

    $gameConfigScreenAlert.html(GAME_MESSAGES.config(message)).addClass("active");
    configMessageTimeout = setTimeout(() => $gameConfigScreenAlert.removeClass("active"), MESSAGE_TIMER);
};

/**
 * Activates button.
 * @param {HTMLElement} target - Target button.
 */
const activateButton = (target) => {
    $(target).addClass("button-active");
    $(target).siblings().removeClass("button-active");
}

/**
 * Sets game difficulty.
 * @param {string} difficulty - Game difficulty.
 * @param {string} message - Message to display.
 * @param {HTMLElement} clickedButton - Clicked button.
 */
const setGameDifficulty = (difficulty, message, clickedButton) => {
    activateButton(clickedButton);

    if (selectedDifficulty === difficulty) {
        showConfigMessage(GAME_MESSAGES.difficultyIsSelected);
        return;
    }

    selectedDifficulty = difficulty;
    showConfigMessage(message);
};

/**
 * Chooses easy game mode.
 * @param {HTMLElement} clickedButton - Clicked button.
 */
const chooseEasyGameMode = (clickedButton) => {
    setGameDifficulty("easy", "Dificuldade fácil selecionada!", clickedButton);
};

/**
 * Chooses medium game mode.
 * @param {HTMLElement} clickedButton - Clicked button.
 */
const chooseMediumGameMode = (clickedButton) => {
    setGameDifficulty("medium", "Dificuldade média selecionada!", clickedButton);
};

/**
 * Chooses hard game mode.
 * @param {HTMLElement} clickedButton - Clicked button.
 */
const chooseHardGameMode = (clickedButton) => {
    setGameDifficulty("hard", "Dificuldade difícil selecionada!", clickedButton);
};

/**
 * Starts game mode configuration.
 */
const startGameModeConfig = () => {
    const animations = {
        "easy": `obstacle-running ${EASY_SPEED}s infinite linear .6s`,
        "medium": `obstacle-running ${MEDIUM_SPEED}s infinite linear .6s`,
        "hard": `obstacle-running ${HARD_SPEED}s infinite linear .6s`,
    };

    $obstacle.css("animation", animations[selectedDifficulty]);
};

const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

/**
 * Generates random obstacle.
 */
const generateRandomObstacle = () => {
    const randomImage = getRandomElement(OBSTACLE_IMAGES);
    const randomWidth = getRandomElement(OBSTACLE_WIDTHS);

    $obstacle.prop("src", randomImage);
    $obstacle.css("width", randomWidth);
};

/**
 * Makes the character jump.
 */
const jumpCharacter = () => {
    const isGameScreenVisible = $gameStartScreen.css("display") === 'none' && $gameOverScreen.css("display") === 'none';
    if (!isGameScreenVisible || !canJump) return;

    clearTimeout(characterJumpTimeout);

    $character.addClass("jump");
    JUMP_SOUND.play();

    canJump = false;

    characterJumpTimeout = setTimeout(() => {
        $character.removeClass("jump");
        canJump = true;
    }, 600);
};

/**
 * Clears active intervals.
 */
const clearActiveIntervals = () => {
    activeIntervals.forEach(intervalId => clearInterval(intervalId));
    activeIntervals = [];
};

/**
 * Verifies the game state.
 */
const verifyGame = () => {
    let counter = 1;

    const counterLoop = setInterval(() => $gameScreenCounter.text(GAME_MESSAGES.timeCounter(counter++)), 1000);
    activeIntervals.push(counterLoop);

    const checkCollisionAndGenerateObstacle = () => {
        const characterBox = {
            left: $character.offset().left - $gameOffset.left,
            right: $character.offset().left + $character.outerWidth() - $gameOffset.left,
            top: $character.offset().top - $gameOffset.top,
            bottom: $character.offset().top + $character.outerHeight() - $gameOffset.top
        };

        const obstacleBox = {
            left: $obstacle.offset().left - $gameOffset.left,
            right: $obstacle.offset().left + $obstacle.outerWidth() - $gameOffset.left,
            top: $obstacle.offset().top - $gameOffset.top,
            bottom: $obstacle.offset().top + $obstacle.outerHeight() - $gameOffset.top
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
        } else if (obstacleBox.right - 50 > $gameWidth) {
            generateRandomObstacle();
        }
    };

    const verifierLoop = setInterval(checkCollisionAndGenerateObstacle, 10);
    activeIntervals.push(verifierLoop);

    const handleGameOver = () => {
        const selectedCharacterIsP1 = selectedCharacter === GAME_CHARACTERS.boy;
        const gameOverSound = selectedCharacterIsP1 ? DAMAGE_SOUND_P1 : DAMAGE_SOUND_P2;
        $character.prop("src", selectedCharacterIsP1 ? GAME_OVER_IMAGE_P1 : GAME_OVER_IMAGE_P2);
        $obstacle.css("animation", "none");

        STEP_SOUND.pause();
        gameOverSound.play();
        gameOverSound.loop = false;

        $gameScreen.removeClass("running");
        $gameOverScreen.fadeIn();
        $gameScreenCounter.hide();

        if (innerWidth <= 768) {
            $mobileJumpArea.hide();
        }

        const currentScore = counter - 1;

        if (loggedUser) {
            const newScore = {
                user_id: loggedUser.uid,
                username: loggedUser.displayName,
                score: currentScore,
                difficulty: selectedDifficulty
            };

            scoreboardRef.get().then((doc) => {
                const currentScoreboard = doc.data() || {};
                const scoresFilteredByDifficulty = (currentScoreboard.scores || []).filter(score => score.difficulty === selectedDifficulty);
                const recordScoreInCurrentDifficulty = scoresFilteredByDifficulty.reduce((max, score) => Math.max(max, score.score), 0);
                const isNewRecord = currentScore > recordScoreInCurrentDifficulty;

                if (isNewRecord) {
                    setTimeout(() => {
                        RECORD_SOUND.play();
                        $gameOverCounterDisplay.text(GAME_MESSAGES.newRecord(currentScore));
                    }, 500);
                } else {
                    $gameOverCounterDisplay.text(GAME_MESSAGES.runFeedback(currentScore));
                }

                const existingUserScoreIndex = (currentScoreboard.scores || []).findIndex(score => score.user_id === loggedUser.uid && score.difficulty === selectedDifficulty);

                if (existingUserScoreIndex !== -1) {
                    const existingUserScore = currentScoreboard.scores[existingUserScoreIndex];

                    if (currentScore > existingUserScore.score) {
                        existingUserScore.score = currentScore;
                        scoreboardRef.update({ scores: currentScoreboard.scores });
                    }
                } else {
                    const updatedScoreboard = isNewRecord
                        ? currentScoreboard.scores.concat({ user_id: loggedUser.uid, username: loggedUser.displayName, score: currentScore, difficulty: selectedDifficulty })
                        : currentScoreboard.scores || [{ user_id: loggedUser.uid, username: loggedUser.displayName, score: currentScore, difficulty: selectedDifficulty }];
                    scoreboardRef.set({ scores: updatedScoreboard });
                }
            }).catch((error) => {
                console.error("Error updating document: ", error);
            });

            return
        }

        $gameOverCounterDisplay.text(GAME_MESSAGES.runFeedback(currentScore));
    };
};

/**
 * Starts the game.
 */
const startGame = () => {
    if ($gameStartScreen.css("display") === 'none' && $gameOverScreen.css("display") === 'none') return;

    canJump = false;

    const playerImage = selectedCharacter === GAME_CHARACTERS.boy ? IMAGE_P1 : IMAGE_P2;
    $character.prop("src", playerImage);

    $gameScreenCounter.text(GAME_MESSAGES.timeCounterInitial).show();
    $gameOverCounterDisplay.text("---");

    $gameScreen.addClass("running");

    $obstacle.show();
    $character.show();
    STEP_SOUND.play();
    STEP_SOUND.loop = true;
    STEP_SOUND.playbackRate = 1.3;

    $gameOverScreen.fadeOut();
    $gameStartScreen.fadeOut();

    if (innerWidth <= 768) {
        $mobileJumpArea.show();
    }

    setTimeout(() => {
        canJump = true;
    }, 500);

    hideAllScreens();
    clearActiveIntervals();
    startGameModeConfig();
    verifyGame();
};

/**
 * Hide the loading screen.
 */
const hidePreloader = () => {
    $('[data-preloader]').fadeOut('slow');
};

/**
 * Login the user with Google
 */
const handleLogin = () => {
    auth
        .signInWithPopup(provider)
        .then(({ user }) => {
            $logoutGoogleBtn.show();
            $loginGoogleBtn.hide();

            loggedUser = user;
        }).catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
        });
}

/**
 * Logout the user from Google
 */
const handleLogout = () => {
    auth.signOut()
        .then(() => {
            $loginGoogleBtn.show();
            $logoutGoogleBtn.hide();
            loggedUser = null;
        })
        .catch((error) => console.error(error));
}

/**
 * Handles button click events.
 * @param {Event} event - Button click event.
 * @param {Function} callback - Callback function.
 */
const handleButtonClick = (event, callback) => {
    if (event.type === 'touchstart') {
        event.preventDefault();
    }

    callback && callback();
};

/**
 * Handles key press events.
 * @param {Object} param0 - Key press event object.
 */
const handleKeyPress = ({ which }) => {
    const SPACE_KEY = 32;
    const DELETE_KEY = 46;
    const ARROW_TOP_KEY = 38;
    const C_KEY = 67;
    const P_KEY = 80;

    switch (which) {
        case SPACE_KEY:
            startGame();
            jumpCharacter();
            break;
        case ARROW_TOP_KEY:
            jumpCharacter();
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

/**
 * Handles document click events.
 * @param {Object} param0 - Document click event object.
 */
const handleDocumentClick = ({ target }) => {
    const $currentTarget = $(target);
    if (
        !$currentTarget.closest($scorePanel).length &&
        !$currentTarget.closest($commandsPanel).length &&
        !$currentTarget.closest($scoreToggleBtn).length &&
        !$currentTarget.closest($commandsToggleBtn).length
    ) {
        $scorePanel.removeClass('selected-screen');
        $commandsPanel.removeClass('selected-screen');
    }
};

/**
 * Initializes event listeners.
 */
const initializeEventListeners = () => {
    $loginGoogleBtn.on("click touchstart", event => handleButtonClick(event, handleLogin));
    $logoutGoogleBtn.on("click touchstart", event => handleButtonClick(event, handleLogout));
    $scoreSelect.on("change", event => toggleScoreDifficulty(event));

    $configEasyModeBtn.on("click touchstart", event => handleButtonClick(event, chooseEasyGameMode(event.target)));
    $configMediumModeBtn.on("click touchstart", event => handleButtonClick(event, chooseMediumGameMode(event.target)));
    $configHardModeBtn.on("click touchstart", event => handleButtonClick(event, chooseHardGameMode(event.target)));
    $startGameBtn.on("click touchstart", event => handleButtonClick(event, startGame));
    $scoreToggleBtn.on("click touchstart", event => handleButtonClick(event, toggleScoreScreen));
    $commandsToggleBtn.on("click touchstart", event => handleButtonClick(event, toggleCommandsScreen));
    $configToggleBtn.on("click touchstart", event => handleButtonClick(event, toggleGameConfigScreen));
    backToStartBtn.on("click touchstart", event => handleButtonClick(event, toggleGameConfigScreen));
    $configSelectP1Btn.on("click touchstart", event => handleButtonClick(event, toggleCharacter(GAME_CHARACTERS.boy, event.target)));
    $configSelectP2Btn.on("click touchstart", event => handleButtonClick(event, toggleCharacter(GAME_CHARACTERS.girl, event.target)));
    $mobileJumpArea.on("touchstart", jumpCharacter);
    $(document).keydown(handleKeyPress);
    $(document).click(handleDocumentClick);
}

$(window).on("load", function () {
    $scoreToggleBtn.hide();
    $logoutGoogleBtn.hide();

    auth.onAuthStateChanged(user => {
        if (!user) {
            $scoreToggleBtn.hide();
            $logoutGoogleBtn.hide();
            return;
        }

        $loginGoogleBtn.hide();
        $logoutGoogleBtn.show();
        $scoreToggleBtn.show();

        scoreboardRef.onSnapshot((snapshot) => {
            if (snapshot.exists) {
                updateRecord();
            }
        });

        loggedUser = user;
        updateRecord();
    })

    initializeEventListeners();
    hidePreloader();
})
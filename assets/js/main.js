import { auth, db, provider } from "./firebase.js";
import * as variables from "./variables.js";

const {
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
} = variables;

const scoreboardRef = db.collection('scoreboard').doc('scoreboard_users');

const $deleteAccountBtn = $("[data-google-delete]");
const $loginGoogleBtn = $("[data-google-login]");
const $logoutGoogleBtn = $("[data-google-logout]");
const $userDataDisplay = $("[data-user-info]");
const $dropdownToggler = $("[data-dropdown-toggler]");
const $dropdowns = $(".dropdown");
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
const $scoreboardScreen = $("[data-scoreboard-wrapper]");
const $scoreboardTable = $("[data-scoreboard-table]");
const $scoreboardSelectButtons = $("[data-scoreboard-select-difficulty]");
const $scoreboardMessage = $("[data-scoreboard-message]");
const $configSelectP1Btn = $("[data-select-char1-btn]");
const $configSelectP2Btn = $("[data-select-char2-btn]");
const $configEasyModeBtn = $("[data-easy-mode-btn]");
const $configMediumModeBtn = $("[data-medium-mode-btn]");
const $configHardModeBtn = $("[data-hard-mode-btn]");
const $startGameBtn = $("[data-start-game-btn]");
const backToStartBtn = $("[data-back-start-btn]");
const $scoreToggleBtn = $("[data-scoreboard-toggler-btn]");
const $configToggleBtn = $("[data-config-toggler-btn]");
const $gameWidth = $gameScreen.width();
const $gameOffset = $gameScreen.offset();
const $toast = $("[data-toast]");

let loggedUser = null;
let activeIntervals = [];
let configMessageTimeout;
let characterJumpTimeout;
let selectedScoreboardDifficulty = "easy";
let selectedCharacter = GAME_CHARACTERS.boy;
let selectedDifficulty = GAME_DIFICULTIES.easy;
let canCharacterJump = true;

JUMP_SOUND.volume = 0.5;
STEP_SOUND.volume = 0.3;
RECORD_SOUND.volume = 0.5;
DAMAGE_SOUND_P1.volume = 0.4;
DAMAGE_SOUND_P2.volume = 0.4;

/**
 * Return the current datetime.
 */
function currentTime() {
    return new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

/**
 * Shows a toast in the screen.
 * @param {String} type - The toast type.
 * @param {String} message - The toast message.
 */
const showToast = (type, message) => {
    const $toastContent = $toast.find(".toast");
    const toastClass = type === "error" ? "error-toast" : "success-toast";
    const toastTitle = type === "error" ? "Erro" : "Sucesso";
    const toastIcon = type === "error" ? '<i class="fas fa-xmark"></i>' : '<i class="fas fa-check"></i>';

    $toastContent.removeClass("error-toast", "success-toast").addClass(toastClass);
    $toastContent.find(".toast-title").text(toastTitle);
    $toastContent.find(".toast-icon").html(toastIcon);
    $toastContent.find(".toast-text").text(message);
    $toast.fadeIn();

    setTimeout(() => {
        $toast.fadeOut();
    }, MESSAGE_TIMER);
}

/**
 * Filter the scoreboard by difficulty.
 * @param {String} clickedButton - The selected difficulty button.
 */
const filterScoreboardByDifficulty = (clickedButton) => {
    const difficulty = $(clickedButton).data("difficulty");
    selectedScoreboardDifficulty = difficulty;

    activateButton(clickedButton);
    updateScoreboardTable();
}

/**
 * Populates the scoreboard table.
 * @param {Array} data - The array of scores
 */
const populateScoreboardTable = (data) => {
    $scoreboardTable.empty();

    if (data.length === 0) {
        $scoreboardTable.append(GAME_MESSAGES.emptyScore);
        return;
    }

    const currentUserID = loggedUser ? loggedUser.uid : null;

    data.forEach((user, index) => {
        const { user_id, username, score } = user;

        const pontuationIndex = index + 1;
        const data = {
            left: pontuationIndex,
            center: username,
            right: score
        };

        const $scoreItem = $(GAME_MESSAGES.scoreTable(data));

        if (user_id === currentUserID) {
            $scoreItem.addClass("user-score");
        }

        $scoreboardTable.append($scoreItem);
    });
};

/**
 * Updates the scoreboard table.
*/
const updateScoreboardTable = async () => {
    try {
        const doc = await scoreboardRef.get();
        const scoreboardData = doc.data()?.scores || [];
        const MAX_SCORES = 10;

        const filteredScoreboardByDifficulty = scoreboardData
            .filter(score => score.difficulty === selectedScoreboardDifficulty)
            .sort((a, b) => b.score - a.score)
            .slice(0, MAX_SCORES);

        populateScoreboardTable(filteredScoreboardByDifficulty);
    } catch (error) {
        showToast("error", "Erro ao atualizar placar:", error);
    }
};

/**
 * Toggles score screen.
 */
const toggleScoreboardScreen = () => {
    hideScreens($gameConfigScreen);
    $scoreboardScreen.fadeToggle();
};

/**
 * Toggles game config screen.
 */
const toggleGameConfigScreen = () => {
    hideScreens($scoreboardScreen);
    $gameConfigScreen.fadeToggle();
};

/**
 * Hides some screens.
 * @param {Array} screensToHide - The screens to hide
 */
const hideScreens = (...screensToHide) => {
    screensToHide.forEach(screen => screen.fadeOut());
};

/**
 * Hides all screens.
 */
const hideAllScreens = () => {
    const screens = [$scoreboardScreen, $gameConfigScreen];
    screens.forEach(screen => {
        screen.fadeOut();
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
    const isGameRunning = $gameStartScreen.css("display") === 'none' && $gameOverScreen.css("display") === 'none';
    if (!isGameRunning || !canCharacterJump) return;

    clearTimeout(characterJumpTimeout);

    $character.addClass("jump");
    JUMP_SOUND.play();

    canCharacterJump = false;

    characterJumpTimeout = setTimeout(() => {
        $character.removeClass("jump");
        canCharacterJump = true;
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

        $gameOverScreen.fadeIn();
        $gameScreenCounter.hide();

        if (innerWidth <= 768) {
            $mobileJumpArea.hide();
        }

        const currentScore = counter - 1;

        if (loggedUser) {
            updateScoreboard(currentScore);
            return;
        }

        $gameOverCounterDisplay.text(GAME_MESSAGES.runFeedback(currentScore));
    };

    const updateScoreboard = async (currentScore) => {
        const newScore = {
            user_id: loggedUser.uid,
            username: loggedUser.displayName,
            score: currentScore,
            difficulty: selectedDifficulty,
            created_at: currentTime()
        };

        try {
            const doc = await scoreboardRef.get();
            const currentScoreboard = doc.data() || {};
            const { scores = [] } = currentScoreboard;
            const scoresFilteredByDifficulty = scores.filter(score => score.difficulty === selectedDifficulty);
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

            const existingUserScoreIndex = scores.findIndex(score => score.user_id === loggedUser.uid && score.difficulty === selectedDifficulty);

            if (existingUserScoreIndex !== -1) {
                const existingUserScore = scores[existingUserScoreIndex];

                if (currentScore > existingUserScore.score) {
                    existingUserScore.score = currentScore;
                    await scoreboardRef.update({ scores });
                }
            } else {
                const updatedScoreboard = isNewRecord ? scores.concat(newScore) : scores;
                await scoreboardRef.set({ scores: updatedScoreboard });
            }
        } catch (error) {
            showToast("error", "Erro ao atualizar placar:", error);
        }
    };
};

/**
 * Starts the game.
 */
const startGame = () => {
    if (
        $gameStartScreen.css("display") === 'none' &&
        $gameOverScreen.css("display") === 'none' &&
        $scoreboardScreen.css("display") === 'none'
    ) return;
    canCharacterJump = false;

    const playerImage = selectedCharacter === GAME_CHARACTERS.boy ? IMAGE_P1 : IMAGE_P2;
    $character.prop("src", playerImage);

    $gameScreenCounter.text(GAME_MESSAGES.timeCounterInitial).show();
    $gameOverCounterDisplay.text("Carregando...");

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
        canCharacterJump = true;
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
 * Updates the user data display
 */
const updateUserDataDisplay = () => {
    const { displayName, photoURL, email } = loggedUser;

    $userDataDisplay.find("img").prop("src", photoURL ?? "https://via.placeholder.com/32x32.webp/e2e2e2/000000");
    $userDataDisplay.find("p").text(displayName ?? "Usuário");
    $userDataDisplay.find("small").text(email);
}

/**
 * Resets the elements to their default states
 */
const resetElements = () => {
    $loginGoogleBtn.show();
    $logoutGoogleBtn.hide();
    $dropdowns.hide();
    loggedUser = null;

    updateScoreboardTable();
}

/**
 * Login the user with Google
 */
const loginUserAccount = async () => {
    try {
        const { user } = await auth.signInWithPopup(provider);
        $logoutGoogleBtn.show();
        $loginGoogleBtn.hide();
        loggedUser = user;

        updateScoreboardTable();
        showToast("success", "Logado com sucesso");
    } catch (error) {
        showToast("error", "Erro ao fazer login:", error);
    }
};

/**
 * Logout the user from Google
 */
const logoutUserAccount = async () => {
    try {
        await auth.signOut();
        resetElements();
        showToast("success", "Deslogado com sucesso");
    } catch (error) {
        showToast("error", "Erro ao sair:", error);
    }
};

/**
 * Excluir a the user's account and scores.
 */
const deleteUserAccount = async () => {
    if (!confirm("Realmente deseja excluir a conta? Essa ação é irreversível")) return;

    const user = auth.currentUser;

    try {
        await scoreboardRef.get().then(snapshot => {
            if (snapshot.exists) {
                const scoreboardData = snapshot.data()?.scores || [];
                const updatedScores = scoreboardData.filter(score => score.user_id !== user.uid);
                scoreboardRef.set({ scores: updatedScores });
            }
        });

        await user.delete();

        resetElements();
        showToast("success", "Conta removida com sucesso");
    } catch (error) {
        showToast("error", "Erro ao excluir conta:", error);
    }
}

/**
 * Toggles dropdowns.
 * @param {HTMLElement} clickedElement - Target dropdown toggler.
 */
const toggleDropdown = (clickedElement) => {
    const $dropdown = $(clickedElement).closest("[data-dropdown-toggler]").siblings(".dropdown");
    $dropdowns.not($dropdown).hide();
    $dropdown.toggle();
};

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
    const functions = {
        32: () => {
            startGame();
            jumpCharacter();
        },
        38: jumpCharacter,
    }

    functions[which] && functions[which]();
};

/**
 * Handles document click events.
 * @param {Object} param0 - Document click event object.
 */
const handleDocumentClick = ({ target }) => {
    const $currentTarget = $(target);

    if (!$currentTarget.closest($dropdownToggler).length && !$currentTarget.closest($dropdowns).length) {
        $dropdowns.hide();
    }
};

/**
 * Initializes event listeners.
 */
const initializeEventListeners = () => {
    $scoreboardSelectButtons.on("click touchstart", event => handleButtonClick(event, filterScoreboardByDifficulty(event.target)));
    $loginGoogleBtn.on("click touchstart", event => handleButtonClick(event, loginUserAccount));
    $logoutGoogleBtn.on("click touchstart", event => handleButtonClick(event, logoutUserAccount));
    $deleteAccountBtn.on("click touchstart", event => handleButtonClick(event, deleteUserAccount));
    $dropdownToggler.on("click touchstart", event => handleButtonClick(event, toggleDropdown(event.target)));
    $configEasyModeBtn.on("click touchstart", event => handleButtonClick(event, chooseEasyGameMode(event.target)));
    $configMediumModeBtn.on("click touchstart", event => handleButtonClick(event, chooseMediumGameMode(event.target)));
    $configHardModeBtn.on("click touchstart", event => handleButtonClick(event, chooseHardGameMode(event.target)));
    $startGameBtn.on("click touchstart", event => handleButtonClick(event, startGame));
    $scoreToggleBtn.on("click touchstart", event => handleButtonClick(event, toggleScoreboardScreen));
    $configToggleBtn.on("click touchstart", event => handleButtonClick(event, toggleGameConfigScreen));
    backToStartBtn.on("click touchstart", event => handleButtonClick(event, hideAllScreens));
    $configSelectP1Btn.on("click touchstart", event => handleButtonClick(event, toggleCharacter(GAME_CHARACTERS.boy, event.target)));
    $configSelectP2Btn.on("click touchstart", event => handleButtonClick(event, toggleCharacter(GAME_CHARACTERS.girl, event.target)));
    $mobileJumpArea.on("touchstart", jumpCharacter);
    $(document).keydown(handleKeyPress);
    $(document).click(handleDocumentClick);
}

$(window).on("load", function () {
    auth.onAuthStateChanged(user => {
        if (!user) {
            $logoutGoogleBtn.hide();
            $deleteAccountBtn.hide();
            $userDataDisplay.hide();
            $scoreboardMessage.show();
            return;
        }

        $scoreboardMessage.hide();
        $loginGoogleBtn.hide();
        $logoutGoogleBtn.show();
        $deleteAccountBtn.show();
        $userDataDisplay.show();

        loggedUser = user;
        updateUserDataDisplay();
    })

    scoreboardRef.onSnapshot((snapshot) => {
        if (snapshot.exists) {
            updateScoreboardTable();
        }
    });

    initializeEventListeners();
    updateScoreboardTable();
    hidePreloader();
})
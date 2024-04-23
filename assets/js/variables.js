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

const GAME_DIFICULTIES = {
    easy: "easy",
    medium: "medium",
    hard: "hard",
}

const GAME_PLAYERS = {
    boy: "p1",
    girl: "p2",
}

const GAME_MESSAGES = {
    emptyScore: "<tr><td>Nenhuma pontuação cadastrada</td></tr>",
    scoreLocalStorage: (time, difficulty) => `Tempo correndo na dificuldade ${difficulty}: ${time} segundo(s)`,
    scoreTable: (index, html) => `<tr><td>${index}) <span>${html}</span></td></tr>`,
    selectedCharacter: (character) => `<p>Personagem ${character} selecionado!</p>`,
    config: (message) => `<p><i class="fa-solid fa-exclamation-circle"></i> ${message}</p>`,
    timeCounterInitial: "Tempo: 0",
    timeCounter: (time) => `Tempo: ${time}`,
    newRecord: (record) => `Uau! ${record} segundo(s) é seu novo recorde de corrida!`,
    runFeedback: (seconds) => `Você correu por ${seconds} segundo(s)`,
};

export {
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
}
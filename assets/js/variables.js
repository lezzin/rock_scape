const EASY_SPEED = '1.4';
const MEDIUM_SPEED = '1.2';
const HARD_SPEED = '0.8';
const OBSTACLE_IMAGES = ['./assets/img/obstacle1.png', './assets/img/obstacle2.png', './assets/img/obstacle3.png'];
const OBSTACLE_WIDTHS = ['3rem', '3.5rem', '4rem', '4.5rem'];
const STORAGE_PONTUATION_KEY = "pontuacao";
const STORAGE_RECORD_KEY = "recordTime";
const MESSAGE_TIMER = 2000;

const GAME_OVER_IMAGE_P1 = "./assets/img/falledBoy.png";
const GAME_OVER_IMAGE_P2 = "./assets/img/falledGirl.png";
const IMAGE_P1 = "./assets/img/boy.gif";
const IMAGE_P2 = "./assets/img/girl.gif";

const JUMP_SOUND = new Audio('./assets/audio/jump.wav');
const DAMAGE_SOUND_P1 = new Audio('./assets/audio/boy-shout.wav');
const DAMAGE_SOUND_P2 = new Audio('./assets/audio/girl-shout.wav');
const RECORD_SOUND = new Audio('./assets/audio/new-record.wav');

const GAME_DIFICULTIES = {
    easy: "easy",
    medium: "medium",
    hard: "hard",
};

const GAME_CHARACTERS = {
    boy: "p1",
    girl: "p2",
};

const GAME_MESSAGES = {
    emptyScore: "<tr><td>Nenhuma pontuação existente</td></tr>",
    scoreLocalStorage: (time, difficulty) => `Tempo correndo na dificuldade ${difficulty}: ${time + (time === 1 ? ' segundo' : ' segundos')}`,
    scoreTable: (index, html) => `<tr><td>${index}) <span>${html}</span></td></tr>`,
    selectedCharacter: (character) => `<p>Personagem ${character} selecionado!</p>`,
    config: (message) => `<p><i class="fa-solid fa-exclamation-circle"></i> ${message}</p>`,
    timeCounterInitial: "Tempo: 0s",
    timeCounter: (time) => `Tempo: ${time}s`,
    newRecord: (record) => `Uau! Você desbloqueou um novo recorde: ${record + (record === 1 ? ' segundo' : ' segundos')}!`,
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
    MESSAGE_TIMER,

    GAME_OVER_IMAGE_P1,
    GAME_OVER_IMAGE_P2,

    IMAGE_P1,
    IMAGE_P2,

    JUMP_SOUND,
    DAMAGE_SOUND_P1,
    DAMAGE_SOUND_P2,
    RECORD_SOUND,

    GAME_DIFICULTIES,
    GAME_CHARACTERS,
    GAME_MESSAGES
}
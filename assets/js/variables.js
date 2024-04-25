export const EASY_SPEED = '1.4';
export const MEDIUM_SPEED = '1.2';
export const HARD_SPEED = '0.8';
export const OBSTACLE_IMAGES = ['./assets/img/obstacle1.png', './assets/img/obstacle2.png', './assets/img/obstacle3.png'];
export const OBSTACLE_WIDTHS = ['3rem', '3.5rem', '4rem', '4.5rem'];
export const STORAGE_PONTUATION_KEY = "pontuacao";
export const STORAGE_RECORD_KEY = "recordTime";
export const MESSAGE_TIMER = 2000;

export const GAME_OVER_IMAGE_P1 = "./assets/img/falledBoy.png";
export const GAME_OVER_IMAGE_P2 = "./assets/img/falledGirl.png";
export const IMAGE_P1 = "./assets/img/boy.gif";
export const IMAGE_P2 = "./assets/img/girl.gif";

export const JUMP_SOUND = new Audio('./assets/audio/jump.wav');
export const STEP_SOUND = new Audio('./assets/audio/step.wav');
export const DAMAGE_SOUND_P1 = new Audio('./assets/audio/boy-shout.wav');
export const DAMAGE_SOUND_P2 = new Audio('./assets/audio/girl-shout.wav');
export const RECORD_SOUND = new Audio('./assets/audio/new-record.wav');

export const GAME_DIFICULTIES = {
    easy: "easy",
    medium: "medium",
    hard: "hard",
};

export const GAME_CHARACTERS = {
    boy: "p1",
    girl: "p2",
};

export const exclamationIcon = '<i class="fa-solid fa-exclamation-circle"></i>';

export const GAME_MESSAGES = {
    emptyScore: "<tr><td>Nenhuma pontuação existente</td></tr>",
    scoreLocalStorage: (time, difficulty) => `Tempo correndo na dificuldade ${difficulty}: ${time + (time === 1 ? ' segundo' : ' segundos')}`,
    scoreTable: (index, html) => `<tr><td>${index}) <span>${html}</span></td></tr>`,
    characterIsSelected: `<p>${exclamationIcon} Personagem já selecionado<p>`,
    difficultyIsSelected: `<p>${exclamationIcon} Dificuldade já selecionada<p>`,
    selectedCharacter: (character) => `<p>${exclamationIcon} Personagem ${character} selecionado!</p>`,
    config: (message) => `<p> ${message}</p>`,
    timeCounterInitial: "Tempo: 0s",
    timeCounter: (time) => `Tempo: ${time}s`,
    newRecord: (record) => `Uau! Você desbloqueou um novo recorde: ${record + (record === 1 ? ' segundo' : ' segundos')}!`,
    runFeedback: (seconds) => `Você correu por ${seconds} segundo(s)`,
};

export let userScores = JSON.parse(localStorage.getItem(STORAGE_PONTUATION_KEY)) || [];

export let selectedCharacter = GAME_CHARACTERS.boy;
export let selectedDifficulty = GAME_DIFICULTIES.easy;
export let canJump = true;

export let activeIntervals = [];
export let configMessageTimeout;
export let characterJumpTimeout;
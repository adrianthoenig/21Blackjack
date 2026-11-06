'use strict';


/** ========================
 * Módulos helpers
 * ======================== */

// Capitalizar una string
import { capitalize, launchFireworks } from "./utils.js";

/** ========================
 * Variables del juego
 * ======================== */

let playingState = 'reparto';
/**
 * playingState = 'banca'
 * playingState = 'player'
 * playingState = 'reparto'
 */

let isGameOngoing = true;

// Registro de cartas
let cardHistory = [];

/** ========================
 * Configuración de jugadores
 * ======================== */


const banca = {
    points: 0
}

const player = {
    points: 0,
    username: 'Player'
}

/** ========================
 * Constantes del juego
 * ======================== */

const MIN_POINTS_BANCA = 17; // mínimo de cartas que pide la banca automaticamente
const MAX_WIN_POINTS = 21; // puntos maximos para ganar
const MAX_LOSING_POINTS = 22; // puntos maximos (o más) para perder

const MIN_SUIT_NUMBER = 2;
const MAX_SUIT_NUMBER = 10;

const CARD_REVEAL_TIME = 500;

// Status messages
const MSG_PLAYS_BANCA = 'Juega la banca';
const MSG_PLAYS_PLAYER = 'Juegas tu';
const MSG_INITIAL_DEAL = 'Reparto inicial';
const MSG_DEALING = 'Reparto en curso...';
const MSG_WINS_BANCA = 'Ha ganado la Banca!';


/** ========================
 * Elementos del DOM
 * ======================== */

// Estado y nombre del jugador
const gameStatusEl = document.getElementById('game-status');
const bancaNameLabel = document.getElementById('banca-name');
const playerNameLabel = document.getElementById('player-name');

// Banca y jugador
const bancaMainContainer = document.getElementById('banca-main-container');
const playerMainContainer = document.getElementById('player-main-container');

// Contenedores de cartas
const bancaCardContainer = document.getElementById('banca-card-container');
const playerCardContainer = document.getElementById('player-card-container');

// Puntos de jugador y de banca
const bancaPointsEl = document.getElementById('banca-points');
const playerPointsEl = document.getElementById('player-points');

// Botones
const hitBtn = document.getElementById('btn-hit');
const standBtn = document.getElementById('btn-stand');
const restartBtn = document.getElementById('btn-restart');
const playAgainBtn = document.getElementById('btn-again');


/** ========================
 * Card (class)
 * ======================== */
class Card {
    constructor(code, points) {
        this.code = code;
        this.points = points;
    }

    createCardElement() {
        const img = document.createElement('img');
        img.src = `./img/cards/face/${this.code}.png`;
        img.alt = `Carta ${this.code} de ${this.points} puntos`;
        img.classList.add('card');
        return img;
    }
}

// Tipos de cartas
const cardCategories = ['H', 'D', 'C', 'S'];

const courtCategories = [
    { code: 'J', points: 11 },
    { code: 'Q', points: 12 },
    { code: 'K', points: 13 }
];

function generateRandomCard() {

    const randomCard = {};

    // Choose suit or court cards
    /**
     * 1 - 5 = suit
     * 6 = court
     * 7 = ace
     */
    const cardType = Math.trunc(Math.random() * 7) + 1;

    // Choose category of card
    /**
     * 0 => (H) Hearts
     * 1 => (D) Diamonds
     * 2 => (C) Clubs
     * 3 => (S) Spades
     */
    const cardCategory = cardCategories[Math.trunc(Math.random() * 4)];

    switch (cardType) {
        // 1 - 5 (or default) => Generate suit card
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
            // Generar número entre el 2 - 10
            const randomSuitNum = Math.floor(Math.random() * (MAX_SUIT_NUMBER - MIN_SUIT_NUMBER + 1) + MIN_SUIT_NUMBER);
            randomCard.points = randomSuitNum;
            randomCard.code = `${randomCard.points}${cardCategory}`;
            break;
        // 6 => Generate court card
        case 6:
            const randomCourtCard = courtCategories[Math.trunc(Math.random() * courtCategories.length)];
            randomCard.points = randomCourtCard.points;
            randomCard.code = `${randomCourtCard.code}${cardCategory}`;
            break;
        // 7 => Generate ace card
        case 7:
            randomCard.points = 1;
            randomCard.code = `A${cardCategory}`;
            break;
    }

    return randomCard;
}

function checkRepeated(code) {
    return cardHistory.some(c => c === code);
}

function getCard() {
    let randomCard = generateRandomCard();

    // Volver a generar hasta que salga una nueva
    while (checkRepeated(randomCard.code)) {
        if (cardHistory.length > 50) {
            alert('Ha ocurrido un error inesperado!');
            break;
        }

        randomCard = generateRandomCard();
    }

    cardHistory.push(randomCard.code);
    const card = new Card(randomCard.code, randomCard.points);
    return (card);
}


/** ========================
 * Configuración inicial
 * ======================== */

// Actualizar el nombre del jugador
function getPlayerName() {
    let pName = capitalize(prompt("Introduce tu nombre para comenzar el juego"));

    if (!pName || pName === '') pName = 'Player';
    player.username = pName;

    // Actualizar label con el nombre
    playerNameLabel.textContent = `${player.username} (Tu)`;
}

// Desabilitar botones
function disableButtons() {
    hitBtn.disabled = true;
    hitBtn.classList.add('disabled');

    standBtn.disabled = true;
    standBtn.classList.add('disabled');
}

// Habilitar botones
function enableButtons() {
    hitBtn.disabled = false;
    hitBtn.classList.remove('disabled');

    standBtn.disabled = false;
    standBtn.classList.remove('disabled');
}

// Cambiar turno
function switchTurn(p) {
    // CASE: Player
    if (p === 'player') {
        playingState = 'player';
        toggleActiveBorder();
        enableButtons();
        setStatusMessage(MSG_PLAYS_PLAYER);
        return;
    }

    // CASE: Banca
    if (p === 'banca') {
        playingState = 'banca';
        toggleActiveBorder();
        disableButtons();
        setStatusMessage(MSG_PLAYS_BANCA);
        return;
    }

    // CASE: Reparto
    playingState = 'reparto';
    disableButtons();
    setStatusMessage(MSG_DEALING);
}

// Cambiar estado de activo
function toggleActiveBorder() {

    // Eliminar estado de activo de todos
    bancaMainContainer.classList.remove('active');
    playerMainContainer.classList.remove('active');

    if (playingState === 'reparto') return;

    if (playingState === 'banca') {
        bancaMainContainer.classList.add('active');
        return;
    }

    playerMainContainer.classList.add('active');
}

function setStatusMessage(status) {
    gameStatusEl.textContent = status.trim();
}

function updatePoints() {
    bancaPointsEl.textContent = banca.points;
    playerPointsEl.textContent = player.points;
}

function hidePoints() {
    bancaPointsEl.textContent = `${banca.points} + ???`;
}

// Comprobar si se ha terminado el juego
function checkGameOver() {
    if (banca.points >= MAX_WIN_POINTS || player.points >= MAX_WIN_POINTS) {
        isGameOngoing = false;
        gameOver();
        return;
    }
}

function getWinner() {
    if (banca.points === 21) return 'banca';
    if (banca.points > 21) return 'player';
    if (player.points === 21) return 'player';
    if (player.points > 21) return 'banca';
    if (banca.points > player.points) return 'banca';
    if (player.points > banca.points) return 'player';

    return 'banca';
}

/** ========================
 * Dealing de cartas
 * ======================== */

function createBackCard() {
    const img = document.createElement('img');
    img.src = `./img/cards/back/back.png`;
    img.alt = `Cargando carta...`;
    img.classList.add('card');
    return img;
}

function insertCard(card, parent, { dealAnimation = true } = {}) {
    const cardEl = card.createCardElement();

    // Insertar carta temporal
    const backCard = createBackCard();
    parent.appendChild(backCard);

    // Animación de rotar carta
    backCard.classList.add('startRotation');

    if (dealAnimation) {
        backCard.classList.add('deal');
    }

    // 1s => Mostrar carta
    setTimeout(() => {
        // Eliminar carta
        backCard.remove();

        // Insertar carta
        parent.appendChild(cardEl);
        cardEl.classList.add('finishRotation');
    }, CARD_REVEAL_TIME);
}


// Dealear una carta
function dealBank({ dealAnimation = true } = {}) {
    // Generar carta aleatoria
    const card = getCard();


    // Guardar los puntos
    banca.points += card.points;
    updatePoints();


    // Insertar carta en el DOM
    insertCard(card, bancaCardContainer, { dealAnimation });
    return;
}


function dealPlayer() {

    // Obteneer carta
    const card = getCard();

    // Guardar los puntos
    player.points += card.points;
    updatePoints();

    // Insertar carta en el DOM
    insertCard(card, playerCardContainer);
}

/** ========================
 * Acciones del jugador
 * ======================== */
async function actionHit() {
    if (playingState !== 'player') return;

    // Parar juego temporalmente
    switchTurn('reparto');

    // Darle una carta al jugador
    await delayDealPlayer();

    // Comprobar que nadie ha ganado
    checkGameOver();
    switchTurn('player');
}

function actionStand() {
    if (playingState !== 'player') return;

    // Darle el turno a la banca
    switchTurn('banca');

    // Invocar a la función para que la banca pida cartas
    rushBanca();

    if (!isGameOngoing) return;
}

async function rushBanca() {
    // Rotar carta oculta
    const ultimaCarta = bancaCardContainer.querySelector('.card.deal');
    ultimaCarta.remove();
    await delayDealBank({ dealAnimation: false });
    checkGameOver();

    // Pedir cartas
    while (banca.points <= 17 || checkGameOver()) {
        await delayDealBank();
    }

    gameOver();

}

/** ========================
 * Inicio de la partida
 * ======================== */

function dealEmptyCard(parent) {
    // Deal player two cards
    const backCardOne = createBackCard();
    parent.appendChild(backCardOne);
    backCardOne.classList.add('deal');
}

const delayDealBank = ({ dealAnimation = true } = {}) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            dealBank({ dealAnimation });
            resolve(true);
        }, CARD_REVEAL_TIME);
    })
}

const delayDealEmpty = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            dealEmptyCard(bancaCardContainer);
            resolve(true);
        }, CARD_REVEAL_TIME);
    })
}

const delayDealPlayer = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            dealPlayer();
            resolve(true);
        }, CARD_REVEAL_TIME);
    })
}

async function startGame() {
    // Esconder boton de jugar de nuevo
    playAgainBtn.classList.add('hidden');

    // Estado inicial
    playingState = 'reparto';

    // Deshabilitar botones
    disableButtons();

    // Cambiar el borde de 'active'
    toggleActiveBorder();

    // Mensjae inicial
    setStatusMessage(MSG_INITIAL_DEAL);

    // Darle dos cartas a la banca
    await delayDealBank();
    await delayDealEmpty();

    // Darle dos cartas al jugador
    await delayDealPlayer();
    await delayDealPlayer();
    hidePoints();

    // Cambiar turno al jugador
    switchTurn('player');

    // Poner a la banca activa
    toggleActiveBorder();
}

// Fin del juego
function gameOver() {
    // Comprobar el ganador
    const winner = getWinner();

    // Reemplazar botones
    hitBtn.style.display = 'none';
    standBtn.style.display = 'none';

    // Eliminar el borde
    bancaMainContainer.classList.remove('active');
    playerMainContainer.classList.remove('active');

    // Poner corona de ganador
    if (winner === 'banca') {
        bancaNameLabel.textContent = '👑 Banca';
        setStatusMessage(MSG_WINS_BANCA);
    }

    if (winner === 'player') {
        playerNameLabel.textContent = `👑 ${player.username}`;
        setStatusMessage(`Has ganado ${player.username}!`);
        launchFireworks();
    }

    // Mostrar boton de jugar de nuevo
    playAgainBtn.classList.remove('hidden');
}

// Reiniciar partida
function restartGame() {
    // Resetear los valores
    banca.points = 0;
    player.points = 0;
    updatePoints();
    cardHistory = [];

    // Limpiar los contenedores de cartas
    bancaCardContainer.innerHTML = '';
    playerCardContainer.innerHTML = '';

    // Poner nombres default
    bancaNameLabel.textContent = 'Banca';
    playerNameLabel.textContent = player.username;

    // Mostrar los botones
    hitBtn.style.display = 'block';
    standBtn.style.display = 'block';

    // Empezar juego de nuevo
    startGame();
}

/** ========================
 * Inicialización de la aplicación
 * ======================== */

function initApp() {
    // Pedir el nombre al jugador
    getPlayerName();

    // Empezar el juego
    startGame();
}

// ##### NO TOCAR #####
initApp();

/** ========================
 * Event Listeners
 * ======================== */

hitBtn.addEventListener('click', actionHit);
standBtn.addEventListener('click', actionStand);
restartBtn.addEventListener('click', restartGame);
playAgainBtn.addEventListener('click', restartGame);
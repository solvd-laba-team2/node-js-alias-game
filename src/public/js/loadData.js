const socket = io();
// Listen for form submission (sending a chat message)
const chatWindow = document.querySelector(".chat-window");
const messages = document.querySelector(".chat-messages");
const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");

const playersList1 = document.getElementById("player-list1");
const playersList2 = document.getElementById("player-list2");

const swapTeamButton = document.getElementById("swap-team-button");
const wordGenButton = document.querySelector(".word-field .button");
const startButton = document.querySelector("#start-game");

const timerElement = document.getElementById("timer");
const roundsElement = document.getElementById("rounds");
const wordField = document.querySelector(".word-field h1");

const team1ScoreElement = document.querySelector(".player-list-left h2");
const team2ScoreElement = document.querySelector(".player-list-right h2");

// Use data attributes to pass dynamic data
const gameId = form.dataset.gameId;
const gameStatus = form.dataset.gameStatus;
const currentUser = form.dataset.currentUser;

const totalRounds = parseInt(form.dataset.totalRounds);
// const roundTime = parseInt(form.dataset.roundTime);
const roundTime = 5;

const team1 = { players: [] };
const team2 = { players: [] };

const usersTeam = "";

const data = { gameId, user: currentUser, usersTeam, team1, team2 };

let describer;
let guessers;
let currentTeam;

let targetWord;

let team1Score = 0;
let team2Score = 0;

const currentUrl = window.location.href;


socket.emit("joinRoom", data);

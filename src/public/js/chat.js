const socket = io();
// Listen for form submission (sending a chat message)
const chatWindow = document.querySelector(".chat-window");
const messages = document.querySelector(".chat-messages");
const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const swapTeamButton = document.getElementById("swap-team-button");
const roundsElement = document.getElementById("rounds");

const playersList1 = document.getElementById("player-list1");
const playersList2 = document.getElementById("player-list2");
// Use data attributes to pass dynamic data
const gameId = form.dataset.gameId;
const currentUser = form.dataset.currentUser;

const totalRounds = parseInt(form.dataset.totalRounds);

const gameStatus = form.dataset.gameStatus;

// const roundTime = parseInt(form.dataset.roundTime);
const roundTime = 5;

const usersTeam = "";
const team1 = { players: [] };
const team2 = { players: [] };

const data = { gameId, user: currentUser, usersTeam, team1, team2 };

let describer;
let guessers;
let currentTeam;

let targetWord;

socket.emit("join room", data);

form.addEventListener("submit", (e) => {
  e.preventDefault(); // Prevent the page from refreshing
  let role;
  if (!describer) {
    role = "unknown"; // game has not started
  } else {
    role = currentUser === describer ? "describer" : "guesser";
  }
  const message = input.value;
  if (message !== "") {
    socket.emit("chatMessage", {
      message,
      ...data,
      role,
      targetWord: targetWord || null,
    });
  }
  input.value = "";
});

swapTeamButton.addEventListener("click", () => {
  // Emit an event to the server, indicating the user wants to swap teams
  socket.emit("swapTeam", data);
});

// Listen for chat messages from the server
socket.on("chatMessage", (data) => {
  messages.innerHTML += `<p><strong>${data.user}:</strong> ${data.message}</p>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;
});

socket.on("userJoined", (data) => {
  console.log("gameStatus", gameStatus);
  messages.innerHTML += `<p><strong>${data.user}:</strong> joined the game!</p>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;

  playersList1.innerHTML = "";
  playersList2.innerHTML = "";

  // Populate team1 players
  data.team1.players.forEach((player) => {
    const li = document.createElement("li");
    li.textContent = player;
    playersList1.appendChild(li);
  });

  // Populate team2 players
  data.team2.players.forEach((player) => {
    const li = document.createElement("li");
    li.textContent = player;
    playersList2.appendChild(li);
  });
  loadCurrentTurn();
});

socket.on("systemMessage", (message) => {
  messages.innerHTML += `<p><strong>${message}</strong></p>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;
});

const hideWordField = () => {
  document.querySelector(".word-field").style.display = "none";
};

const showWordField = () => {
  document.querySelector(".word-field").style.display = "flex";
};

const hideUpdate = () => {
  document.querySelector("#update-word").style.display = "none";
};

const showUpdate = () => {
  document.querySelector("#update-word").style.display = "inline-block";
};

// Listen for new turn event to reset timer and update roles
socket.on("newTurn", (currentRound) => {
  console.log("newTurn event");
  roundsElement.innerHTML = `${currentRound} / ${totalRounds}`;
  loadCurrentTurn();
});

socket.on("startGame", () => {
  console.log("startGame event");
  blockControlButtons();
  loadCurrentTurn();
  // startTimer(roundTime);
});

socket.on("endGame", () => {
  console.log("Trigger end game");
  window.location.reload();
});

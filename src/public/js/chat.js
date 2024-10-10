const socket = io();
// Listen for form submission (sending a chat message)
const chatWindow = document.querySelector(".chat-window");
const messages = document.querySelector(".chat-messages");
const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const swapTeamButton = document.getElementById("swap-team-button");

const playersList1 = document.getElementById("player-list1");
const playersList2 = document.getElementById("player-list2");
// Use data attributes to pass dynamic data
const gameId = form.dataset.gameId;
const currentUser = form.dataset.currentUser;
const usersTeam = "";
const team1 = { players: [] };
const team2 = { players: [] };

const data = { gameId, user: currentUser, usersTeam, team1, team2 };

let describer;
let guessers;
let currentTeam;

socket.emit("join room", data);

form.addEventListener("submit", (e) => {
  e.preventDefault(); // Prevent the page from refreshing
  const message = input.value;
  if (message !== "") {
    socket.emit("chatMessage", { message, ...data });
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




const disableChat = () => {
  document.querySelector("#message-input").disabled = true;
};

const loadCurrentTurn = () => {
  const request = fetch(window.location.href + "/getTurn");
  request.then((response) => {
    if (response.ok === true) {
      response.json().then((data) => {
        describer = data.describer;
        guessers = data.guessers;
        if (guessers.includes(currentUser)) {
          hideWordField();
        } else if (
          currentUser !== describer &&
          !guessers.includes(currentUser)
        ) {
          disableChat();
        }
        currentTeamTurn = data.currentTeam;
        document.getElementById("describer").textContent = describer;
        document.getElementById("guessers").textContent = guessers.join(", ");
      });
    } else {
      showElement(startButton);
      showElement(swapTeamButton);
    }
  });
};

const switchTurn = () => {
  const request = fetch(window.location.href + "/switchTurn");
  request.then((response) => {
    if (response.ok === true) {
      response.json().then((data) => {
        describer = data.describer;
        guessers = data.guessers;
        if (guessers.includes(currentUser)) {
          hideWordField();
        } else if (
          currentUser !== describer &&
          !guessers.includes(currentUser)
        ) {
          disableChat();
        }
        currentTeamTurn = data.currentTeam;
        document.getElementById("describer").textContent = describer;
        document.getElementById("guessers").textContent = guessers.join(", ");
      });
    }
  });
};

const hideWordField = () => {
  document.querySelector(".word-field").style.display = "none";
};

// Listen for new turn event to reset timer and update roles
socket.on("newTurn", () => {
  switchTurn();
  timeLeft = 60; // Reset timer for the new turn
  startTimer(); // Start the timer for the new turn
});

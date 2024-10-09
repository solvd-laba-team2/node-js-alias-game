const socket = io();
// Listen for form submission (sending a chat message)
const chatWindow = document.querySelector(".chat-window");
const messages = document.querySelector(".chat-messages");
const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");

const playersList1 = document.getElementById("player-list1");
const playersList2 = document.getElementById("player-list2");
// Use data attributes to pass dynamic data
const gameId = form.dataset.gameId;
const currentUser = form.dataset.currentUser;
const usersTeam = "";
const team1 = { players: [] };
const team2 = { players: [] };

const data = { gameId, user: currentUser, usersTeam, team1, team2 };

socket.emit("join room", data);

form.addEventListener("submit", (e) => {
  e.preventDefault(); // Prevent the page from refreshing
  const message = input.value;
  socket.emit("chatMessage", { message, ...data });
  input.value = "";
});

// Listen for chat messages from the server
socket.on("userJoined", (data) => {
  messages.innerHTML += `<p><strong>${data.user}:</strong> joined the game!</p>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;

  playersList1.innerHTML = '';
  playersList2.innerHTML = '';

  // Populate team1 players
  data.team1.players.forEach(player => {
    const li = document.createElement('li');
    li.textContent = player;
    playersList1.appendChild(li);
  });

  // Populate team2 players
  data.team2.players.forEach(player => {
    const li = document.createElement('li');
    li.textContent = player;
    playersList2.appendChild(li);
  });

});

socket.on("systemMessage", (message) => {
  messages.innerHTML += `<p><strong>${message}</strong></p>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;
});

// Listen for new turn and role assignments
socket.on("newTurn", (data) => {
  const { describer, guessers } = data;
  console.log(`New describer: ${describer}, guessers: ${guessers}`);
});

let timeLeft = 60; // Default to 60 seconds, but this will be updated dynamically
const timerElement = document.getElementById("timer");
let timerInterval;

// Function to start the timer
const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval); // Clear any existing interval to prevent multiple intervals

  timerInterval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timerInterval); // Stop the timer
      socket.emit("timeUp", gameId); // Emit event to the server that the timer is up
    } else {
      timeLeft--;
      timerElement.textContent = timeLeft; // Update the displayed time
    }
  }, 1000); // Update every second
};


// Listen for new turn event to reset timer and update roles
socket.on("newTurn", (data) => {
  const { describer, guessers, roundTime } = data.team1;
  
  document.getElementById("describer").textContent = describer;
  document.getElementById("guessers").textContent = guessers.join(", ");
  timeLeft = roundTime || 60; // Reset timer for the new turn
  startTimer(); // Start the timer for the new turn
});


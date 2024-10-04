const socket = io();
// Listen for form submission (sending a chat message)
const chatWindow = document.querySelector(".chat-window");
const messages = document.querySelector(".chat-messages");
const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
// Use data attributes to pass dynamic data
const gameId = form.dataset.gameId;
const currentUser = form.dataset.currentUser;
const data = { gameId, user: currentUser };

socket.emit("join room", data);

form.addEventListener("submit", (e) => {
  e.preventDefault(); // Prevent the page from refreshing
  const message = input.value;
  socket.emit("chatMessage", { message, ...data });
  input.value = "";
});

// Listen for chat messages from the server
socket.on("chatMessage", (data) => {
  messages.innerHTML += `<p><strong>${data.user}:</strong> ${data.message}</p>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;
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

let timeLeft = 60; // Start timer at 60 seconds
const timerElement = document.getElementById("timer");

const startTimer = () => {
  const interval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(interval);
      // Emit to the server that the time is up
      socket.emit("timeUp", gameId);
    } else {
      timeLeft--;
      timerElement.textContent = timeLeft;
    }
  }, 1000);
};

// Listen for new turn event to reset timer and update roles
socket.on("newTurn", (data) => {
  const { describer, guessers } = data;
  document.getElementById("describer").textContent = describer;
  document.getElementById("guessers").textContent = guessers.join(", ");
  timeLeft = 60; // Reset timer for the new turn
  startTimer(); // Start the timer for the new turn
});

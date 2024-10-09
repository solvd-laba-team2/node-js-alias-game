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
  const { describer, guessers, roundTime } = data;
  document.getElementById("describer").textContent = describer;
  document.getElementById("guessers").textContent = guessers.join(", ");
  console.log(`New describer: ${describer}, guessers: ${guessers}`);
  startTimer(+roundTime)
});
const startTurnButton = document.getElementById("start-turn-button");

// Add event listener to the button
startTurnButton.addEventListener("click", () => {
  const gameId = form.dataset.gameId; // Assuming you're getting the gameId dynamically
  socket.emit("timeUp", gameId ); // Send the startTurn event with the gameId
});
//let timeLeft = 60; // Default to 60 seconds, but this will be updated dynamically
const timerElement = document.getElementById("timer");
let timerInterval;

// Function to start the timer
const startTimer = (timeLeft) => {
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



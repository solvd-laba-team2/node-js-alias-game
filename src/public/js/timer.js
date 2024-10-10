// Listen for new turn and role assignments

let timeLeft = 60; // Start timer at 60 seconds
const timerElement = document.getElementById("timer");

const startTimer = (seconds = 30) => {
  socket.emit("startTimer", gameId, seconds);
};

socket.on("timerTick", (seconds) => {
  timerElement.innerHTML = seconds;
});

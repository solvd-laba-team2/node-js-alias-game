const timerElement = document.getElementById("timer");

const startTimer = (seconds = 30) => {
  socket.emit("startTimer", gameId, seconds);
};

socket.on("timerTick", (seconds) => {
  timerElement.innerHTML = seconds;
});

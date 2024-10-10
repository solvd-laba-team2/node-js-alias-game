const startButton = document.querySelector("#start-game");

const startGame = (e) => {
  e.preventDefault();
  createNewWord();
  socket.emit("newTurn", gameId);
  startTimer(60);
};

startButton.addEventListener("click", startGame);

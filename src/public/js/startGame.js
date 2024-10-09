const startButton = document.querySelector("#start-game");

const startGame = (e) => {
  e.preventDefault();
  createNewWord();
  socket.emit("newTurn", gameId);
};

startButton.addEventListener("click", startGame);

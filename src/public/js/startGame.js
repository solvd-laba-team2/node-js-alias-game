const startButton = document.querySelector("#start-game");

const startGame = (e) => {
  e.preventDefault();
  createNewWord();
  console.log("startGame triggered");
  socket.emit("newTurn", gameId);
};

startButton.addEventListener("click", startGame);

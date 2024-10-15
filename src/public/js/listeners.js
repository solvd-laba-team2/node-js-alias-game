// Event listeners
form.addEventListener("submit", chatMessagePerformer);

swapTeamButton.addEventListener("click", swapButtonPerformer);

startButton.addEventListener("click", startGamePerformer);

wordGenButton.addEventListener("click", generateWordPerformer);

// Socket event listeners from the server
socket.on("chatMessage", chatMessageHandler);

socket.on("userJoined", userJoinedHandler);

socket.on("systemMessage", systemMessageHandler);

socket.on("newTurn", newTurnHandler);

socket.on("startGame", startGameHandler);

socket.on("scoreUpdated", scoreUpdatedHandler);

socket.on("endGame", endGameHandler);

socket.on("new-word", newWordHandler);

socket.on("wordGuessed", wordGuessedHandler);

socket.on("timerTick", timerTickHandler);
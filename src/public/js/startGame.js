const startButton = document.querySelector("#start-game");

const startGame = (e) => {
  e.preventDefault();
  createNewWord();
  console.log("startGame triggered");
  socket.emit("newTurn", gameId);
};

startButton.addEventListener("click", startGame);


const disableChat = () => {
  document.querySelector("#message-input").disabled = true;
};

const enableChat = () => {
  document.querySelector("#message-input").disabled = false;
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
          enableChat();
        } else if (currentUser === describer) {
          showWordField();
          enableChat();
        } else {
          showWordField();
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
          enableChat();
        } else if (currentUser === describer) {
          showWordField();
          enableChat();
        } else {
          showWordField();
          disableChat();
        }
        currentTeamTurn = data.currentTeam;
        document.getElementById("describer").textContent = describer;
        document.getElementById("guessers").textContent = guessers.join(", ");
      });
    }
  });
};
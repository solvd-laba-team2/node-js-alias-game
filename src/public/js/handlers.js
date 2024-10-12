// Functions

const createNewWord = () => {
  const request = fetch(currentUrl + "/generateWord");
  request.then((response) => {
    if (response.ok === true) {
      response.json().then(({ word }) => {
        wordField.innerText = word;
        socket.emit("new-word", gameId);
      });
    }
  });
};

const getGameResult = () => {
  let winner;
  if (team1Score > team2Score) {
    winner = "Team A won";
  } else if (team2Score > team1Score) {
    winner = "Team B won";
  } else if (team1Score > 0 && team1Score === team2Score) {
    winner = "Draw"; // If scores are equal, declare a tie
  } else {
    winner = "Unknown";
  }
  return winner;
};

const showFinishedGame = () => {
  disableChat();
  hideWordField();
  blockControlButtons();
  const gameResult = getGameResult();
  document.querySelector(
    ".game-name",
  ).innerHTML = `Game is finished \nGame result: ${gameResult}`;
};

const updateScoresOnScreen = () => {
  const request = fetch(currentUrl + "/scores");
  request.then((response) => {
    if (response.ok === true) {
      response.json().then(({ scores }) => {
        if (scores) {
          team1ScoreElement.innerText = "Points: " + scores.team1;
          team1Score = scores.team1;
          team2ScoreElement.innerText = "Points: " + scores.team2;
          team2Score = scores.team2;
        }
      });
    }
  });
};

const loadCurrentTurn = () => {
  const request = fetch(window.location.href + "/getTurn");
  request.then((response) => {
    if (response.ok === true) {
      response.json().then((data) => {
        describer = data.describer;
        guessers = data.guessers;
        if (guessers.includes(currentUser)) {
          hideUpdate();
          hideWordField();
          enableChat();
        } else if (currentUser === describer) {
          showUpdate();
          showWordField();
          enableChat();
        } else {
          hideUpdate();
          showWordField();
          disableChat();
        }
        currentTeamTurn = data.currentTeam;
        document.getElementById("describer").innerHTML = describer;
        document.getElementById("guessers").innerHTML = guessers.join(", ");
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
          hideUpdate();
          hideWordField();
          enableChat();
        } else if (currentUser === describer) {
          showUpdate();
          showWordField();
          enableChat();
        } else {
          hideUpdate();
          showWordField();
          disableChat();
        }
        currentTeamTurn = data.currentTeam;
        document.getElementById("describer").innerHTML = describer;
        document.getElementById("guessers").innerHTML = guessers.join(", ");
      });
    }
  });
};

//Listeners performers


const generateWordPerformer = (e) => {
  e.preventDefault();
  createNewWord();
};

const startGamePerformer = (e) => {
  e.preventDefault();
  createNewWord();
  console.log("startGame triggered");
  socket.emit("startGame", gameId, roundTime, totalRounds);
};

const chatMessagePerformer = (e) => {
  e.preventDefault(); // Prevent the page from refreshing
  let role;
  if (!describer) {
    role = "unknown"; // game has not started
  } else {
    role = currentUser === describer ? "describer" : "guesser";
  }
  const message = input.value;
  if (message !== "") {
    socket.emit("chatMessage", {
      message,
      ...data,
      role,
      targetWord: targetWord || null,
    });
  }
  input.value = "";
};

const swapButtonPerformer = () => {
  // Emit an event to the server, indicating the user wants to swap teams
  socket.emit("swapTeam", data);
};

// Handlers
const timerTickHandler = (seconds) => {
  timerElement.innerHTML = seconds;
};

const wordGuessedHandler = () =>{
    createNewWord();
}

const scoreUpdatedHandler = (data) => {
  console.log(`Score updated`);
  updateScoresOnScreen();
};

const newWordHandler = () => {
  const request = fetch(currentUrl + "/currentWord");
  request.then((response) => {
    if (response.ok === true) {
      response.json().then(({ word }) => {
        if (word) {
          wordField.innerText = word;
          targetWord = word;
        }
      });
    }
  });
};

const chatMessageHandler = (data) => {
  messages.innerHTML += `<p><strong>${data.user}:</strong> ${data.message}</p>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;
};

const userJoinedHandler = (data) => {
  if (gameStatus === "finished") {
    showFinishedGame();
    return;
  }
  console.log("gameStatus", gameStatus);
  messages.innerHTML += `<p><strong>${data.user}:</strong> joined the game!</p>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;

  playersList1.innerHTML = "";
  playersList2.innerHTML = "";

  // Populate team1 players
  data.team1.players.forEach((player) => {
    const li = document.createElement("li");
    li.textContent = player;
    playersList1.appendChild(li);
  });

  // Populate team2 players
  data.team2.players.forEach((player) => {
    const li = document.createElement("li");
    li.textContent = player;
    playersList2.appendChild(li);
  });
  loadCurrentTurn();
};

const systemMessageHandler = (message) => {
  messages.innerHTML += `<p><strong>${message}</strong></p>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;
};

const newTurnHandler = (currentRound) => {
  console.log("newTurn event");
  roundsElement.innerHTML = `${currentRound} / ${totalRounds}`;
  loadCurrentTurn();
};

const startGameHandler = () => {
  console.log("startGame event");
  blockControlButtons();
  loadCurrentTurn();
};

const endGameHandler = () => {
  showFinishedGame();
};

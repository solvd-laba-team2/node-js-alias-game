const team1ScoreElement = document.querySelector(".player-list-left h2");
const team2ScoreElement = document.querySelector(".player-list-right h2");
let team1Score = 0;
let team2Score = 0;

socket.on("scoreUpdated", (data) => {
  console.log(`Score updated`);
  updateScoresOnScreen();
});

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

const getWinner = () => team1Score > team2Score ? "Team 1" : "Team 2";


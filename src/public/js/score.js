const team1Score = document.querySelector(".player-list-left h2");
const team2Score = document.querySelector(".player-list-right h2");

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
          team1Score.innerText = "Points: " + scores.team1;
          team2Score.innerText = "Points: " + scores.team2;
        }
      });
    }
  });
};

const team1Score = document.querySelector("#score-team1");
const team2Score = document.querySelector("#score-team2");



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
          team1Score.innerText = scores.team1;
          team2Score.innerText = scores.team2;
        }
      });
    }
  });
};

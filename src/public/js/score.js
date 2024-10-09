const team1 = document.querySelector("#score-team1");
const team2 = document.querySelector("#score-team2");



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
          team1.innerText = scores.team1;
          team2.innerText = scores.team2;
        }
      });
    }
  });
};

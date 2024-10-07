const wordField = document.querySelector(".word-field h1");
const button = document.querySelector(".word-field .button");
const currentUrl = window.location.href;

socket.on("new-word", () => {
  const request = fetch(currentUrl + "/currentWord");
  request.then((response) => {
    if (response.ok === true) {
      response.json().then(({ word }) => {
        if (word) {
          wordField.innerText = word;
        }
      });
    }
  });
});

button.addEventListener("click", (e) => {
  e.preventDefault();
  const request = fetch(currentUrl + "/generateWord");
  request.then((response) => {
    if (response.ok === true) {
      response.json().then(({ word }) => {
        wordField.innerText = word;
        socket.emit("new-word", gameId);
      });
    }
  });
});

const wordField = document.querySelector(".word-field h1");

if (wordField.innerText === "Not generated yet") {
  const request = fetch(window.location.href + "/generateWord");
  request.then((response) => {
    if (response.ok === true) {
      response.json().then(({ word }) => {
        wordField.innerText = word;
      });
    }
  });
}

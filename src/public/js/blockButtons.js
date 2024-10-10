const hideElement = (el) => {
  el.style.display = "none";
};

const showElement = (el) => {
  el.style.display = "inline-block";
};

socket.on("blockButtons", () => {
  hideElement(startButton);
  hideElement(swapTeamButton);
});

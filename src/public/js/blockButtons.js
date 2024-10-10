const hideElement = (el) => {
  el.style.display = "none";
};

const showElement = (el) => {
  el.style.display = "inline-block";
};

const blockControlButtons = () =>{
  hideElement(startButton);
  hideElement(swapTeamButton);
}

// socket.on("blockButtons", () => {
//   hideElement(startButton);
//   hideElement(swapTeamButton);
// });

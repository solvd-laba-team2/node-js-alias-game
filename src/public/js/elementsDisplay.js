const hideElement = (el) => {
  el.style.display = "none";
};

const showElement = (el) => {
  el.style.display = "inline-block";
};

const blockControlButtons = () => {
  hideElement(startButton);
  hideElement(swapTeamButton);
};

const hideWordField = () => {
  document.querySelector(".word-field").style.display = "none";
};

const showWordField = () => {
  document.querySelector(".word-field").style.display = "flex";
};

const hideUpdate = () => {
  document.querySelector("#update-word").style.display = "none";
};

const showUpdate = () => {
  document.querySelector("#update-word").style.display = "inline-block";
};

const disableChat = () => {
  document.querySelector("#message-input").disabled = true;
};

const enableChat = () => {
  document.querySelector("#message-input").disabled = false;
};

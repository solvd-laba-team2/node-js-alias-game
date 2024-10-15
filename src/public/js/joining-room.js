const socket = io();

socket.on("gameUpdated", (data) => {
    if (data.action === "created") {
        updateGameList(data.game);
    }
});

function updateGameList(game) {
    const gameListElement = document.querySelector(".game-list ul");

    const li = document.createElement("li");
    li.innerHTML = `Game - ${game.gameName} <a class="button" href="/game/${game.gameCode}">Join</a>`;

    gameListElement.appendChild(li);
}
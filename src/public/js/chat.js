const socket = io();
// Listen for form submission (sending a chat message)
const chatWindow = document.querySelector(".chat-window");
const messages = document.querySelector('.chat-messages');
const form = document.getElementById('chat-form');
const input = document.getElementById('message-input');
// Use data attributes to pass dynamic data
const gameId = form.dataset.gameId;
const currentUser = form.dataset.currentUser;
socket.emit('join room', gameId);

form.addEventListener('submit', (e) => {
    e.preventDefault();  // Prevent the page from refreshing
    const message = input.value;
    socket.emit('chat message', { message, gameId, user: currentUser });
    input.value = '';
});

// Listen for chat messages from the server
socket.on('chatMessage', (data) => {
    messages.innerHTML += `<p><strong>${data.user}:</strong> ${data.message}</p>`;
    chatWindow.scrollTop = chatWindow.scrollHeight;
});

// Listen for new turn and role assignments
socket.on('newTurn', (data) => {
    const { describer, guessers } = data;
    console.log(`New describer: ${describer}, guessers: ${guessers}`);
});

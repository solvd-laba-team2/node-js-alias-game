import fs from "fs";
import path from "path";

// Path to the JSON file containing chat history
const chatHistoryFilePath = path.join(__dirname, "../chatHistory.json");
// Function to load the JSON file
function loadChatHistory() {
  const data = fs.readFileSync(chatHistoryFilePath, "utf8");
  return JSON.parse(data);
}
// Function to save changes to the JSON file
function saveChatHistory(chatData) {
  fs.writeFileSync(chatHistoryFilePath, JSON.stringify(chatData, null, 2));
}
// Retrieving the chat history for a specific game
function getChatHistoryForGame(gameId) {
  const chatData = loadChatHistory();
  return chatData.games[gameId] ? chatData.games[gameId].chatHistory : [];
}
// Creating a new game if it doesn't exist
function createGame(gameId) {
  const chatData = loadChatHistory();

  if (!chatData.games[gameId]) {
    chatData.games[gameId] = { chatHistory: [] };
    saveChatHistory(chatData);
  }
}
// Adding a message to the game's chat
function addMessageToGame(gameId, username, message) {
  const chatData = loadChatHistory();

  if (chatData.games[gameId]) {
    chatData.games[gameId].chatHistory.push({ username, message });
    saveChatHistory(chatData);
  }
}
export default {
  createGame,
  addMessageToGame,
  getChatHistoryForGame,
};

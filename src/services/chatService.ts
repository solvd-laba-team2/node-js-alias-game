import Chat, { IChat, IMessage } from "../models/chatModel";
import GameService from "./gameService";
import SocketService from "./socketService";
import { JoinData, MessageData } from "../types/chatSocket.types";
import { Server, Socket } from "socket.io";
import GameLogicService from "./gameLogicService";

// Create or retrieve chat by gameId
async function getOrCreateChat(gameId: string): Promise<IChat | null> {
  let chat = await Chat.findById(gameId).lean(); // Using lean() to return a plain object
  if (!chat) {
    chat = new Chat({ _id: gameId });
    await chat.save();
  }
  return chat;
}

// Add a message to the chat
async function addMessageToChat(
  gameId: string,
  sender: string,
  message: string,
  type: "description" | "message",
) {
  const chat = await getOrCreateChat(gameId);

  // Create a partial IMessage object, without the timestamp field
  const newMessage: Partial<IMessage> = { sender, content: message, type };

  // Add the message to the chat, TypeScript accepts partial IMessage
  chat.messages.push(newMessage as IMessage); // Cast to IMessage
  await chat.save();
}

// Retrieve chat history for the game
async function getChatHistory(gameId: string): Promise<IMessage[]> {
  const chat = await Chat.findById(gameId).lean(); // lean() returns a plain object
  return chat ? chat.messages : [];
}

export function checkGuesserMessage(gameId: string, message: string) {
  const currentWord = GameService.getInstance().getCurrentWord(gameId);
  const socketService = SocketService.getInstance();
  if (currentWord === message) {
    socketService.emitToGameRoom(gameId, "word-guessed", {});
    socketService.emitToGameRoom(gameId, "systemMessage", "Correct!");
  }
  return false;
}

export const handleJoinRoom = async (io: Server, socket: Socket, data: JoinData) => {
  socket.join(data.gameId);
  console.log(`User ${data.user} joined room: ${data.gameId}`);

  const game = await GameService.getInstance().getGame(data.gameId);

  if (!(game.team1.players.includes(data.user) || game.team2.players.includes(data.user))) {
    const team = GameLogicService.getRandomTeam();
    data.usersTeam = team;
    await GameService.getInstance().addUser(data.gameId, team, data.user);
  } else {
    data.usersTeam = game.team1.players.includes(data.user) ? "team1" : "team2";
  }

  const updatedGame = await GameService.getInstance().getGame(data.gameId);
  data.team1.players = updatedGame.team1.players;
  data.team2.players = updatedGame.team2.players;

  console.log(data);
  io.to(data.gameId).emit("userJoined", data);
};

export const handleChatMessage = (messageData: MessageData) => {
  const { message, gameId, user } = messageData;
  console.log("Message received:", messageData);

  // Need to add check if user is describer, if so,
  // check if message is valid

  SocketService.getInstance().emitToGameRoom(gameId, "chatMessage", {
    user,
    message,
    gameId,
  });

  // If user is not describer, so he is guesser
  checkGuesserMessage(gameId, message);
};

export default {
  checkGuesserMessage,
  addMessageToChat,
  getChatHistory,
  handleChatMessage,
  handleJoinRoom
};

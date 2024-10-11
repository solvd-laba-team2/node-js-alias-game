import Chat, { IChat, IMessage } from "../models/chatModel";
import GameService from "./gameService";
import SocketService from "./socketService";

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

export function checkGuesserMessage(
  gameId: string,
  message: string,
  user: string,
) {
  const currentWord = GameService.getInstance().getCurrentWord(gameId);
  const socketService = SocketService.getInstance();
  if (currentWord === message.toLowerCase()) {
    handleWordGuessed(gameId, user, 1);
    socketService.emitToGameRoom(gameId, "wordGuessed", {});
    socketService.emitToGameRoom(gameId, "systemMessage", "Correct!");
    socketService.emitToGameRoom(gameId, "scoreUpdated", {});
  }
  return false;
}

export const handleWordGuessed = async (
  gameId: string,
  userId: string,
  points: number,
) => {
  try {
    await GameService.getInstance().updateUserScoreInMemory(
      userId,
      gameId,
      points,
    );
  } catch (error) {
    console.error("Error handling wordGuessed event:", error);
  }
};



export default {
  checkGuesserMessage,
  addMessageToChat,
  getChatHistory
};

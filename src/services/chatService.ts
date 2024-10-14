import { Types } from "mongoose";
import Chat, { IChat, IMessage } from "../models/chatModel";
import GameService from "./gameService";
import SocketService from "./socketService";

class ChatService {
  async getOrCreateChat(gameId: string): Promise<IChat | null> {
    let objectId: Types.ObjectId;

    // Validate and cast gameId to ObjectId
    if (Types.ObjectId.isValid(gameId) && gameId.length === 24) {
      objectId = new Types.ObjectId(gameId);
    } else {
      throw new Error("Invalid gameId format. Must be a 24-character hex string.");
    }

    // Use the ObjectId to find or create the chat
    let chat = await Chat.findById(objectId).lean(); // Using lean() to return a plain object
    if (!chat) {
      chat = new Chat({ _id: objectId });
      await chat.save();
    }
    return chat;
  }

  // Add a message to the chat
  async addMessageToChat(
    gameId: string,
    sender: string,
    message: string,
    type: "description" | "message",
  ) {
    const chat = await this.getOrCreateChat(gameId);

    // Create a partial IMessage object, without the timestamp field
    const newMessage: Partial<IMessage> = { sender, content: message, type };

    // Add the message to the chat, TypeScript accepts partial IMessage
    chat.messages.push(newMessage as IMessage); // Cast to IMessage
    await chat.save();
  }

  // Retrieve chat history for the game
  async getChatHistory(gameId: string): Promise<IMessage[]> {
    const chat = await Chat.findById(gameId).lean(); // lean() returns a plain object
    return chat ? chat.messages : [];
  }

  checkGuesserMessage(gameId: string, message: string, user: string) {
    const currentWord = GameService.getInstance().getCurrentWord(gameId);
    const socketService = SocketService.getInstance();
    if (currentWord === message.toLowerCase()) {
      this.handleWordGuessed(gameId, user, 1);
      socketService.emitToGameRoom(gameId, "wordGuessed", {});
      socketService.emitToGameRoom(gameId, "systemMessage", "Correct!");
      socketService.emitToGameRoom(gameId, "scoreUpdated", {});
    }
    return false;
  }

  handleWordGuessed = async (
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
}

export default new ChatService();

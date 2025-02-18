import { getOriginalId } from "../utils/hash";
import Chat, { IChat, IMessage } from "../models/chatModel";
import GameService from "./gameService";
import SocketService from "./socketService";
import { isMessageValid, checkForProfanity } from "../utils/wordCheck";


class ChatService {
  chatHistory: Record<string, Partial<IMessage>[]> = {};

  async getOrCreateChat(gameCode: string): Promise<IChat | null> {
    const gameId = getOriginalId(gameCode);
    let chat = await Chat.findById(gameId).lean(); // Using lean() to return a plain object
    if (!chat) {
      chat = new Chat({ _id: gameId });
      await chat.save();
    }
    return chat;
  }

  // Add a message to the chat
  async addMessageToChat(
    gameCode: string,
    sender: string,
    message: string,
    role: string,
    targetWord: string,
    socketId: string
  ) {
    if (!this.chatHistory[gameCode]) {
      this.chatHistory[gameCode] = [];
    }
    if (role === "describer") {
      const { validation, cheatWord } = isMessageValid(message, targetWord);
      if (!validation) {
        SocketService.getInstance().emitToSocket(socketId, "chatMessage", {
          message: `You can't use "${cheatWord}" this time`,
        });
        return;
      }
    }
      const { isProfane } = checkForProfanity(message);
      if (isProfane) {
        SocketService.getInstance().emitToSocket(socketId, "chatMessage", {
          message: `Please, do not use inappropriate language`,
        });
        return;
    }
    const newMessage: Partial<IMessage> = { sender, content: message };

    this.chatHistory[gameCode].push(newMessage);

    SocketService.getInstance().emitToGameRoom(gameCode, "chatMessage", {
      user: sender,
      message,
    });

    if (role === "guesser") {
      // If user is not describer, then he is a guesser
      this.checkGuesserMessage(gameCode, message, sender);
    }
  }

  async saveChatHistory(gameCode: string) {
    const chat = await this.getOrCreateChat(gameCode);
    const gameChatHistory = this.chatHistory[gameCode] || [];
    gameChatHistory.forEach((message) => {
      chat.messages.push({ sender: message.sender, content: message.content });
    });
    await chat.save();
  }

  // Retrieve chat history for the game
  async getChatHistory(gameCode: string): Promise<Partial<IMessage>[]> {
    const game = await GameService.getInstance().getGame(gameCode);
    if (game.status === "finished") {
      const chat = await this.getOrCreateChat(gameCode);
      return chat.messages;
    }
    return this.chatHistory[gameCode] || [];
    // const chat = await Chat.findById(gameId).lean(); // lean() returns a plain object
    // return chat ? chat.messages : [];
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

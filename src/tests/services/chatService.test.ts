import ChatService from "../../services/chatService";
import Chat from "../../models/chatModel";
import SocketService from "../../services/socketService";
import GameService from "../../services/gameService";
import { isMessageValid, checkForProfanity } from "../../utils/wordCheck";


jest.mock("../../models/chatModel");
jest.mock("../../services/socketService");
jest.mock("../../services/gameService");
jest.mock("../../utils/wordCheck");

describe("ChatService", () => {
  let socketInstanceMock: any;
  let gameServiceInstanceMock: any;

  beforeEach(() => {
    jest.clearAllMocks();
    ChatService.chatHistory = {};
    socketInstanceMock = {
      emitToSocket: jest.fn(),
      emitToGameRoom: jest.fn(),
    };

    gameServiceInstanceMock = {
      getGame: jest.fn(), 
      getCurrentWord: jest.fn(),
      updateUserScoreInMemory: jest.fn(),
    };


    SocketService.getInstance = jest.fn(() => socketInstanceMock);
    GameService.getInstance = jest.fn(() => gameServiceInstanceMock);
  });

  describe("addMessageToChat", () => {
    it("should emit an invalid word message if the describer uses a banned word", async () => {
      const gameCode = "game123";
      const sender = "user1";
      const message = "invalidWord";
      const role = "describer";
      const targetWord = "targetWord";
      const socketId = "socket123";

      // Mock isMessageValid to return invalid word
      (isMessageValid as jest.Mock).mockReturnValue({
        validation: false,
        cheatWord: "invalidWord",
      });

      await ChatService.addMessageToChat(
        gameCode,
        sender,
        message,
        role,
        targetWord,
        socketId
      );

      expect(isMessageValid).toHaveBeenCalledWith(message, targetWord);
      expect(socketInstanceMock.emitToSocket).toHaveBeenCalledWith(
        socketId,
        "chatMessage",
        { message: `You can't use "invalidWord" this time` }
      );
    });

    it("should add a message to chat history and emit the message to the game room", async () => {
      const gameCode = "game123";
      const sender = "user1";
      const message = "hello";
      const role = "guesser";
      const targetWord = "targetWord";
      const socketId = "socket123";

      // Mock message validation to return valid
      (isMessageValid as jest.Mock).mockReturnValue({
        validation: true,
        cheatWord: null,
      });
      // Mock profanity check to return no profanity
      (checkForProfanity as jest.Mock).mockReturnValue({ isProfane: false });

      await ChatService.addMessageToChat(
        gameCode,
        sender,
        message,
        role,
        targetWord,
        socketId
      );

      expect(ChatService.chatHistory[gameCode]).toEqual([
        { sender, content: message },
      ]);

      expect(socketInstanceMock.emitToGameRoom).toHaveBeenCalledWith(
        gameCode,
        "chatMessage",
        { user: sender, message }
      );
    });
  });
  describe("saveChatHistory", () => {
    it("should save chat history correctly", async () => {
      const gameCode = "game123";
      const mockChat = {
        messages: [],
        save: jest.fn(),
      };

      ChatService.chatHistory[gameCode] = [
        { sender: "user1", content: "message1" },
        { sender: "user2", content: "message2" },
      ];

      // Mock getOrCreateChat to return a chat object
      jest.spyOn(ChatService, "getOrCreateChat").mockResolvedValue(mockChat as any);

      await ChatService.saveChatHistory(gameCode);

      expect(ChatService.getOrCreateChat).toHaveBeenCalledWith(gameCode);
      expect(mockChat.messages).toEqual([
        { sender: "user1", content: "message1" },
        { sender: "user2", content: "message2" },
      ]);
      expect(mockChat.save).toHaveBeenCalled();
    });
  });

  describe("getChatHistory", () => {
    it("should return chat history if game status is finished", async () => {
      const gameCode = "game123";
      const mockChat = { messages: [{ sender: "user1", content: "message1" }] };

      // Mock GameService to return a finished game
      gameServiceInstanceMock.getGame.mockResolvedValue({ status: "finished" });
      // Mock getOrCreateChat to return chat with messages
      jest.spyOn(ChatService, "getOrCreateChat").mockResolvedValue(mockChat as any);

      const chatHistory = await ChatService.getChatHistory(gameCode);

      expect(gameServiceInstanceMock.getGame).toHaveBeenCalledWith(gameCode);
      expect(ChatService.getOrCreateChat).toHaveBeenCalledWith(gameCode);
      expect(chatHistory).toEqual(mockChat.messages);
    });

    it("should return chat history from memory if game is not finished", async () => {
      const gameCode = "game123";
      ChatService.chatHistory[gameCode] = [{ sender: "user1", content: "message1" }];

      // Mock GameService to return an ongoing game
      gameServiceInstanceMock.getGame.mockResolvedValue({ status: "ongoing" });

      const chatHistory = await ChatService.getChatHistory(gameCode);

      expect(gameServiceInstanceMock.getGame).toHaveBeenCalledWith(gameCode);
      expect(chatHistory).toEqual(ChatService.chatHistory[gameCode]);
    });

    it("should return an empty array if no chat history exists", async () => {
      const gameCode = "game123";

      // Mock GameService to return an ongoing game
      gameServiceInstanceMock.getGame.mockResolvedValue({ status: "ongoing" });

      const chatHistory = await ChatService.getChatHistory(gameCode);

      expect(gameServiceInstanceMock.getGame).toHaveBeenCalledWith(gameCode);
      expect(chatHistory).toEqual([]);
    });
  });

  describe("checkGuesserMessage", () => {
    it("should emit correct events if the guess is right", () => {
      const gameId = "game123";
      const message = "targetWord";
      const user = "user1";

      // Mock current word to be the correct guess
      gameServiceInstanceMock.getCurrentWord.mockReturnValue("targetword");

      jest.spyOn(ChatService, "handleWordGuessed").mockResolvedValue();

      ChatService.checkGuesserMessage(gameId, message, user);

      expect(gameServiceInstanceMock.getCurrentWord).toHaveBeenCalledWith(gameId);
      expect(ChatService.handleWordGuessed).toHaveBeenCalledWith(gameId, user, 1);
      expect(socketInstanceMock.emitToGameRoom).toHaveBeenCalledWith(
        gameId,
        "wordGuessed",
        {}
      );
      expect(socketInstanceMock.emitToGameRoom).toHaveBeenCalledWith(
        gameId,
        "systemMessage",
        "Correct!"
      );
      expect(socketInstanceMock.emitToGameRoom).toHaveBeenCalledWith(
        gameId,
        "scoreUpdated",
        {}
      );
    });

    it("should not emit events if the guess is wrong", () => {
      const gameId = "game123";
      const message = "wrongWord";
      const user = "user1";

      // Mock current word to be something else
      gameServiceInstanceMock.getCurrentWord.mockReturnValue("targetword");

      jest.spyOn(ChatService, "handleWordGuessed");

      const result = ChatService.checkGuesserMessage(gameId, message, user);

      expect(gameServiceInstanceMock.getCurrentWord).toHaveBeenCalledWith(gameId);
      expect(ChatService.handleWordGuessed).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});

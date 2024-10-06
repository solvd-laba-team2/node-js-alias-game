import gameModel, { IGame } from "../models/gameModel";
import chatService from "./chatService";
import SocketService from "../services/socketService";

class GameService {
  private socketService: SocketService;
  private static _instance: GameService | null = null;
  private constructor() {
    this.socketService = SocketService.getInstance();
  }

  public static getInstance(): GameService {
    if (!GameService._instance) {
      GameService._instance = new GameService();
    }
    return GameService._instance;
  }

  // Create a new game
  async createGame(
    gameName: string,
    difficulty: "easy" | "medium" | "hard",
    roundTime: number,
    totalRounds: number
  ): Promise<IGame> {
    const newGame = new gameModel({
      gameName, // Setting the game name
      difficulty, // Setting the difficulty level
      roundTime,  // Setting the time for each round
      totalRounds,  // setting the total rounds
      status: "creating", // Setting the game status
      team1: { players: [], chatID: "", score: [] }, // Initializing team 1
      team2: { players: [], chatID: "", score: [] }, // Initializing team 2
      currentTurn: 0, // Setting the current turn
      createdAt: new Date(), // Setting the creation date
    });

    await newGame.save(); // Save the new game to the database
    this.socketService.emit("gameUpdated", { // Emit new game creation
      action: "created",
      game: newGame,
    });

    return newGame; // Return the new game
  }

  // Get a game by gameId
  async getGame(gameId: string): Promise<IGame | null> {
    const game = await gameModel.findById(gameId); // Find the game in the database by ID
    return game; // Return the game (can be null if not found)
  }
  // Get all games
  async getGames(): Promise<IGame[] | null> {
    const games = await gameModel.find().lean();
    //console.log(games);

    return games;
  }
  // Get only games with status "creating"
  async getOnlyNotStartedGames(): Promise<IGame[] | null> {
    const games = await gameModel.find({ status: "creating" }).lean();
    return games;
  }

  // Add a user to the game
  async addUser(gameId: string, teamId: "team1" | "team2", username: string) {
    const game = await gameModel.findById(gameId);
    if (!game) throw new Error("Game not found");
    game[teamId].players.push(username);
    await game.save();

    // Emit an update to all players in the game room
    this.socketService.emitToGameRoom(gameId, "userJoined", {
      username,
      team: teamId,
    });
  }

  // Update a user's score
  async updateScore(gameId: string, username: string, points: number) {
    const game = await gameModel.findById(gameId);
    if (!game) throw new Error("Game not found");

    const user = game.team1.players.includes(username)
      ? game.team1.players.find((player) => player === username)
      : game.team2.players.find((player) => player === username);

    if (!user) throw new Error("User not found in the game");

    // Updating the score (if we have a "score" field in the model)
    await game.save();

    // Emit the updated score
    this.socketService.emitToGameRoom(gameId, "scoreUpdated", {
      username,
      points,
    });
  }

  // Start a new turn
  async startTurn(gameId: string): Promise<IGame | null> {
    const game = await gameModel.findById(gameId);
    if (!game) throw new Error("Game not found");

    const describer =
      game.team1.players[game.currentTurn % game.team1.players.length];
    const guessers = game.team2.players;
    game.currentTurn += 1;
    await game.save();

    return game;
  }

  // Add a message to the game's chat
  async addMessage(
    gameId: string,
    sender: string,
    message: string,
    type: "description" | "message",
  ) {
    await chatService.addMessageToChat(gameId, sender, message, type);

    // Emit chat message to all players in the game room
    this.socketService.emitToGameRoom(gameId, "chatMessage", {
      sender,
      message,
    });
  }

  // Get chat history for the game
  async getChatHistory(gameId: string) {
    return await chatService.getChatHistory(gameId); // Retrieve chat history from chatService
  }
}

export default GameService;

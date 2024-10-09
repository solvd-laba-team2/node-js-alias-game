import gameModel, { IGame } from "../models/gameModel";
import userModel from "../models/userModel";
import chatService from "./chatService";
import SocketService from "../services/socketService";
import GameLogicService from "./gameLogicService";
import { getOriginalId } from "../utils/hash";

class GameService {
  private socketService: SocketService;
  private static _instance: GameService | null = null;
  // active games and users collection
  private activeGames: Map<string, IGame> = new Map();
  private userScores: Map<string, number> = new Map();

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
      gameName,
      difficulty,
      roundTime,
      totalRounds,
      status: "creating",
      team1: { players: [], chatID: "", score: [] },
      team2: { players: [], chatID: "", score: [] },
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
    const game = await gameModel.findById(getOriginalId(gameId)); // Find the game in the database by ID
    return game; // Return the game (can be null if not found)
  }
  // Get all games
  async getGames(): Promise<IGame[] | null> {
    const games = await gameModel.find().lean();
    //console.log(games);

    return games;
  }


  // Add a user to the game
  async addUser(gameId: string, teamId: "team1" | "team2", username: string) {
    const game = await gameModel.findById(getOriginalId(gameId));
    if (!game) throw new Error("Game not found");
    game[teamId].players.push(username);
    await game.save();
  }


  async rmUser(gameId: string, username: string) {
    const game = await gameModel.findById(getOriginalId(gameId));
    if (!game) throw new Error("Game not found");
    if (game.team1.players.includes(username)) {
      game.team1.players = game.team1.players.filter(e => e !== username);
    } else if (game.team2.players.includes(username)) {
      game.team2.players = game.team2.players.filter(e => e !== username);
    } else {
      throw new Error("User not found in either team");
    }
    await game.save();
  }


  async updateUserScoreInMemory(userId: string, gameId: string, points: number) {
    const currentScore = this.userScores.get(userId) || 0;

    const updatedScore = currentScore + points;
    this.userScores.set(userId, updatedScore);

    this.socketService.emitToGameRoom(gameId, "scoreUpdated", {
      userId,
      score: updatedScore,
    });
  }


  async saveUserScoresToDatabase(gameId: string): Promise<void> {
    const game = this.getActiveGame(gameId);
    if (!game) throw new Error("Game not found");

    // Iterate over both teams and save user scores to the database
    for (const team of [game.team1, game.team2]) {
      for (const player of team.players) {
        const user = await userModel.findOne({ username: player });
        if (user) {
          const score = this.userScores.get(player) || 0;
          user.stats.wordsGuessed += score;
          user.stats.gamesPlayed += 1;

          if (game.status === "finished") {
            user.stats.gamesWon += 1;
          }

          await user.save();

          this.userScores.delete(player);
        }
      }
    }
  }




  async startTurn(gameId: string): Promise<IGame> {
    let game = this.getActiveGame(gameId);

    if (!game) {
      game = await gameModel.findById(gameId);
      if (!game) throw new Error("Game not found");
    }

    const { describer, team } = GameLogicService.startTurn(game);

    if (!describer) {
      await this.endGame(gameId);
      return;
    }

    this.socketService.emitToGameRoom(gameId, "turnStarted", {
      describer,
      team
    });

    this.updateGameState(game);

    return game;
  }


  async endGame(gameId: string): Promise<void> {
    const game = this.getActiveGame(gameId);

    if (!game) throw new Error("Game not found");

    game.status = "finished";

    await this.saveUserScoresToDatabase(gameId);
    this.activeGames.delete(gameId);

    this.socketService.emitToGameRoom(gameId, "gameEnded", {
      message: "The game has ended!",
    });
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

  // Method to fetch an active game from memory
  private getActiveGame(gameId: string): IGame | null {
    return this.activeGames.get(gameId) || null;
  }

  // Method to update the current state of the game in memory
  private updateGameState(game: IGame): void {
    this.activeGames.set(game._id.toString(), game);
  }
  // Get only games with status "creating"
  async getOnlyNotStartedGames(): Promise<IGame[] | null> {
    const games = await gameModel.find({ status: "creating" }).lean();
    return games;
  }

}

export default GameService;

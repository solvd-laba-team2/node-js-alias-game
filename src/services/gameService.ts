import gameModel, { IGame } from "../models/gameModel";
import userModel from "../models/userModel";
import chatService from "./chatService";
import SocketService from "../services/socketService";
import { getOriginalId } from "../utils/hash";
import { generateWord, difficultyWordOptions } from "../utils/randomWords";
import GameLogicService from "./gameLogicService";

class GameService {
  private socketService: SocketService;
  private static _instance: GameService | null = null;
  // active games and users collection
  private activeGames: Map<string, IGame> = new Map();

  private userScores: Record<string, Record<string, number>> = {};

  private currentWords: Record<string, string> = {};

  private gamesTurns = {};

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
    totalRounds: number,
  ): Promise<IGame> {
    const newGame = new gameModel({
      gameName,
      difficulty,
      roundTime,
      totalRounds,
      status: "creating",
      team1: { players: [], chatID: "", score: 0 },
      team2: { players: [], chatID: "", score: 0 },
      currentTurn: 0, // Setting the current turn
      createdAt: new Date(), // Setting the creation date
    });

    await newGame.save(); // Save the new game to the database
    this.socketService.emit("gameUpdated", {
      // Emit new game creation
      action: "created",
      game: newGame,
    });

    return newGame; // Return the new game
  }

  // Get a game by gameCode
  async getGame(gameId: string): Promise<IGame | null> {
    const originalId = getOriginalId(gameId);
    const game = await gameModel.findById(originalId); // Find the game in the database by ID
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

  async rmUser(gameId: string, teamId: "team1" | "team2", username: string) {
    const game = await gameModel.findById(getOriginalId(gameId));
    if (!game) throw new Error("Game not found");
    if (teamId === "team1") {
      game.team1.players = game.team1.players.filter((e) => e !== username);
    } else if (teamId === "team2") {
      game.team2.players = game.team2.players.filter((e) => e !== username);
    } else {
      throw new Error("User not found in either team");
    }
    await game.save();
  }

  async updateUserScoreInMemory(
    userId: string,
    gameCode: string,
    points: number,
  ) {
    const currentGame = this.userScores[gameCode];

    if (!currentGame) {
      this.userScores[gameCode] = {};
    }

    const currentScore = this.userScores[gameCode][userId] || 0;
    const updatedScore = currentScore + points;

    this.userScores[gameCode][userId] = updatedScore;

    this.socketService.emitToGameRoom(gameCode, "scoreUpdated", {
      userId,
      score: updatedScore,
    });
  }

  getUserScore(gameCode: string, userId: string): number {
    const currentGame = this.userScores[gameCode] || {};
    const userScore = currentGame[userId] || 0;
    return userScore;
  }

  async getCurrentScores(gameCode) {
    const game = await this.getGame(gameCode);
    if (game.status === "finished") {
      const { team1, team2 } = game;
      return { team1: team1.score, team2: team2.score };
    }
    const team1Score = game.team1.players.reduce((score, player) => {
      return score + this.getUserScore(gameCode, player);
    }, 0);

    const team2Score = game.team2.players.reduce((score, player) => {
      return score + this.getUserScore(gameCode, player);
    }, 0);
    return { team1: team1Score, team2: team2Score };
  }

  async saveUserScoresToDatabase(gameCode: string): Promise<void> {
    const game = await this.getGame(gameCode);
    if (!game) throw new Error("Game not found");

    const currentGameScores = this.userScores[gameCode] || {};
    const teamScores = await this.getCurrentScores(gameCode);
    const team1players = game.team1.players;
    const team2players = game.team2.players;
    const winnerTeam =
      teamScores.team1 > teamScores.team2 ? team1players : team2players;

    // Iterate over both teams and save user scores to the database
    for (const player of [...team1players, ...team2players]) {
      const user = await userModel.findOne({ username: player });
      if (user) {
        user.stats.wordsGuessed += currentGameScores[player] || 0;
        if (game.status === "finished") {
          user.stats.gamesPlayed += 1;
          if (winnerTeam.includes(player)) {
            user.stats.gamesWon += 1;
          }
        }
        await user.save();
      }
    }

    if (this.userScores[gameCode]) {
      delete this.userScores[gameCode];
    }
  }

  async startTurn(gameId: string): Promise<IGame> {
    let game = this.getActiveGame(gameId);

    if (!game) {
      game = await gameModel.findById(getOriginalId(gameId));
      if (!game) throw new Error("Game not found");
    }

    const { describer, guessers, team } = GameLogicService.startTurn(game);

    if (!describer) {
      await this.endGame(gameId);
      return;
    }

    this.socketService.emitToGameRoom(gameId, "newTurn", {
      describer,
      guessers,
      team,
    });

    this.updateGameState(game);

    return game;
  }

  async endGame(gameCode: string): Promise<void> {
    const game = await this.getGame(gameCode);

    if (!game) throw new Error("Game not found");

    game.status = "finished";
    await game.save();

    await this.saveUserScoresToDatabase(gameCode);
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

  getCurrentWord(gameCode: string): string | null {
    const currentWord = this.currentWords[gameCode];
    if (!currentWord) {
      return null;
    }
    return currentWord;
  }

  async generateWord(gameCode: string): Promise<string> {
    const game = await this.getGame(gameCode);
    const gameDifficulty = game.difficulty;
    const word = generateWord(difficultyWordOptions[gameDifficulty]);
    this.currentWords[gameCode] = word;
    return word;
  }

  async switchTurn(gameCode: string) {
    const game = await this.getGame(gameCode);
    if (!game) throw new Error("Game not found");

    const currentTeam = game.currentTurn % 2 === 0 ? "team1" : "team2";
    const currentPlayers = game[currentTeam].players;
    const currentDescriber = this.getRandomUser(currentPlayers);
    const guessers = currentPlayers.filter(
      (player) => player !== currentDescriber,
    );

    const updatedGame = await gameModel.findByIdAndUpdate(
      game._id,
      { $inc: { currentTurn: 1 } }, // Increment currentTurn by 1
      { new: true, runValidators: true },
    );

    const turnData = { currentTeam, describer: currentDescriber, guessers };
    this.gamesTurns[gameCode] = turnData;
    return turnData;
  }

  getCurrentTurn(gameCode: string) {
    return this.gamesTurns[gameCode] || null;
  }

  getRandomUser(users: string[]) {
    const user = users[Math.floor(Math.random() * users.length)];
    return user || null;
  }
}

export default GameService;

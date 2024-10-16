import SocketService from "../../services/socketService";
import { shortenId, getOriginalId } from "../../utils/hash";
import GameService from "../../services/gameService";
import gameModel from "../../models/gameModel"; // Import the mocked Game model
import userModel from "../../models/userModel";
import chatService from "../../services/chatService";

// Mocking Game model and socket service
jest.mock("../../models/gameModel");

jest.mock("../../models/userModel");

jest.mock("../../services/chatService");

jest.mock("../../services/socketService", () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn().mockReturnValue({
      emitToGameRoom: jest.fn(),
      emit: jest.fn(),
      on: jest.fn(),
    }),
  },
}));

describe("GameService", () => {
  let gameService: GameService;

  beforeEach(() => {
    // Ensure we get a fresh instance before each test
    gameService = GameService.getInstance();
  });

  afterEach(() => {
    (GameService as any)._instance = null;
    jest.clearAllMocks(); // Reset mocks between tests
  });

  test("should return the same instance (singleton pattern)", () => {
    const instance1 = GameService.getInstance();
    const instance2 = GameService.getInstance();
    expect(instance1).toBe(instance2);
  });

  test("should initialize user scores correctly", () => {
    expect(gameService["userScores"]).toEqual({});
  });

  test("should update user scores correctly", () => {
    const userId = "user1";
    const gameId = "game1";
    const score = 10;

    // Simulate updating the user score
    gameService["userScores"][userId] = { [gameId]: score };

    expect(gameService["userScores"][userId][gameId]).toBe(10);
  });

  test("should initialize current words correctly", () => {
    expect(gameService["currentWords"]).toEqual({});
  });

  test("should update current words correctly", () => {
    const gameId = "game1";
    const word = "example";

    gameService["currentWords"][gameId] = word;

    expect(gameService["currentWords"][gameId]).toBe("example");
  });

  describe("endGame", () => {
    it("should end the game, save scores, and chat history", async () => {
      const mockGame = { status: "playing", save: jest.fn() };
      jest.spyOn(gameService, "getGame").mockResolvedValue(mockGame as any);
      jest.spyOn(gameService, "saveUserScoresToDatabase").mockResolvedValue();

      await gameService.endGame("game123");

      expect(gameService.saveUserScoresToDatabase).toHaveBeenCalledWith(
        "game123",
      );
      expect(mockGame.status).toBe("finished");
      expect(chatService.saveChatHistory).toHaveBeenCalledWith("game123");
      expect(mockGame.save).toHaveBeenCalled();
    });

    it("should throw an error if the game is not found", async () => {
      jest.spyOn(gameService, "getGame").mockResolvedValue(null);

      await expect(gameService.endGame("invalidGame")).rejects.toThrow(
        "Game not found",
      );
    });
  });

  describe("getCurrentWord", () => {
    it("should return the current word if present", () => {
      gameService["currentWords"] = { game123: "apple" };
      expect(gameService.getCurrentWord("game123")).toBe("apple");
    });

    it("should return null if no current word exists", () => {
      gameService["currentWords"] = {};
      expect(gameService.getCurrentWord("game123")).toBeNull();
    });
  });

  describe("switchTurn", () => {
    it("should switch turn and return the new turn data", async () => {
      const mockGame = {
        _id: "game123",
        currentTurn: 0,
        team1: { players: ["user1", "user2"] },
        team2: { players: ["user3", "user4"] },
      };
      jest.spyOn(gameService, "getGame").mockResolvedValue(mockGame as any);
      jest.spyOn(gameService, "getRandomUser").mockReturnValue("user1");
      jest
        .spyOn(gameModel, "findByIdAndUpdate")
        .mockResolvedValue({ currentTurn: 1 });

      const result = await gameService.switchTurn("game123");

      expect(result).toEqual({
        currentTeam: "team1",
        describer: "user1",
        guessers: ["user2"],
      });
      expect(gameModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockGame._id,
        { $inc: { currentTurn: 1 } },
        { new: true, runValidators: true },
      );
    });

    it("should throw an error if the game is not found", async () => {
      jest.spyOn(gameService, "getGame").mockResolvedValue(null);

      await expect(gameService.switchTurn("invalidGame")).rejects.toThrow(
        "Game not found",
      );
    });
  });

  describe("getCurrentTurn", () => {
    it("should return the current turn data if available", () => {
      gameService["gamesTurns"] = {
        game123: {
          currentTeam: "team1",
          describer: "user1",
          guessers: ["user2"],
        },
      };

      expect(gameService.getCurrentTurn("game123")).toEqual({
        currentTeam: "team1",
        describer: "user1",
        guessers: ["user2"],
      });
    });

    it("should return null if no current turn data is found", () => {
      gameService["gamesTurns"] = {};
      expect(gameService.getCurrentTurn("game123")).toBeNull();
    });
  });
});

describe("GameService - createGame", () => {
  let gameService: GameService;
  let socketService: SocketService;

  beforeAll(() => {
    socketService = SocketService.getInstance(); // Get the singleton instance of SocketService
    (socketService.emit as jest.Mock) = jest.fn(); // Mock the emit method

    gameService = GameService.getInstance(); // Get GameService singleton instance
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks after each test
  });

  it("should create a new game with correct properties and save it to the database", async () => {
    const mockGameData = {
      _id: "507f1f77bcf86cd799439011",
      gameName: "Test Game",
      difficulty: "easy",
      roundTime: 60,
      totalRounds: 5,
      status: "creating",
      team1: { players: [], chatID: "", score: 0 },
      team2: { players: [], chatID: "", score: 0 },
      currentTurn: 0,
      createdAt: new Date(),
      save: jest.fn().mockResolvedValue({}), // Mock save method
      toObject: jest.fn().mockReturnValue({
        _id: "507f1f77bcf86cd799439011",
        gameName: "Test Game",
      }),
    };

    (gameModel as unknown as jest.Mock).mockImplementation(() => mockGameData); // Mock Game model

    const result = await gameService.createGame("Test Game", "easy", 60, 5);

    expect(result).toEqual(mockGameData); // Ensure the result matches the mock data
    expect(mockGameData.save).toHaveBeenCalled(); // Check that save was called
  });

  it("should emit a gameUpdated event with correct payload on game creation", async () => {
    const mockGameData = {
      _id: "507f1f77bcf86cd799439011",
      gameName: "Test Game",
      difficulty: "medium",
      roundTime: 90,
      totalRounds: 3,
      status: "creating",
      team1: { players: [], chatID: "", score: 0 },
      team2: { players: [], chatID: "", score: 0 },
      currentTurn: 0,
      createdAt: new Date(),
      save: jest.fn().mockResolvedValue({}),
      toObject: jest.fn().mockReturnValue({
        _id: "507f1f77bcf86cd799439011",
        gameName: "Test Game",
        difficulty: "medium",
      }),
    };

    (gameModel as unknown as jest.Mock).mockImplementation(() => mockGameData);

    await gameService.createGame("Test Game", "medium", 90, 3);

    expect(socketService.emit).toHaveBeenCalledWith("gameUpdated", {
      action: "created",
      game: {
        ...mockGameData.toObject(),
        gameCode: shortenId(mockGameData._id.toString()), // Ensure gameCode is included
      },
    });
  });

  it("should handle game creation with different difficulty levels", async () => {
    const mockGameData = {
      _id: "507f1f77bcf86cd799439012",
      gameName: "Hard Game",
      difficulty: "hard",
      roundTime: 120,
      totalRounds: 10,
      status: "creating",
      team1: { players: [], chatID: "", score: 0 },
      team2: { players: [], chatID: "", score: 0 },
      currentTurn: 0,
      createdAt: new Date(),
      save: jest.fn().mockResolvedValue({}),
      toObject: jest.fn().mockReturnValue({
        _id: "507f1f77bcf86cd799439012",
        gameName: "Hard Game",
        difficulty: "hard",
      }),
    };

    (gameModel as unknown as jest.Mock).mockImplementation(() => mockGameData);

    const result = await gameService.createGame("Hard Game", "hard", 120, 10);

    expect(result).toEqual(mockGameData);
    expect(mockGameData.save).toHaveBeenCalled();
  });
});

describe("GameService - getGame and getGames", () => {
  let gameService: GameService;

  beforeAll(() => {
    gameService = GameService.getInstance(); // Get the singleton instance of GameService
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  describe("getGame", () => {
    it("should return a game if found by ID", async () => {
      const mockGame = {
        _id: "507f1f77bcf86cd799439011",
        gameName: "Test Game",
        difficulty: "easy",
        roundTime: 60,
        totalRounds: 5,
        status: "creating",
        team1: { players: [], chatID: "", score: 0 },
        team2: { players: [], chatID: "", score: 0 },
        currentTurn: 0,
        createdAt: new Date(),
      };

      // Mock getOriginalId and Game.findById
      (getOriginalId as jest.Mock) = jest.fn().mockReturnValue(mockGame._id);
      (gameModel.findById as jest.Mock).mockResolvedValue(mockGame);

      const result = await gameService.getGame("shortGameId");

      expect(getOriginalId).toHaveBeenCalledWith("shortGameId"); // Verify the ID conversion
      expect(gameModel.findById).toHaveBeenCalledWith(mockGame._id); // Verify the DB query
      expect(result).toEqual(mockGame); // Ensure the result matches the mock data
    });

    it("should return null if the game is not found", async () => {
      (getOriginalId as jest.Mock).mockReturnValue("507f1f77bcf86cd799439011");
      (gameModel.findById as jest.Mock).mockResolvedValue(null); // Mock no result

      const result = await gameService.getGame("nonExistentId");

      expect(result).toBeNull(); // Ensure the result is null
    });
  });

  describe("getGames", () => {
    it("should return an array of games", async () => {
      const mockGames = [
        {
          _id: "507f1f77bcf86cd799439011",
          gameName: "Test Game 1",
          difficulty: "easy",
          roundTime: 60,
          totalRounds: 5,
          status: "creating",
          team1: { players: [], chatID: "", score: 0 },
          team2: { players: [], chatID: "", score: 0 },
          currentTurn: 0,
          createdAt: new Date(),
        },
        {
          _id: "507f1f77bcf86cd799439012",
          gameName: "Test Game 2",
          difficulty: "medium",
          roundTime: 90,
          totalRounds: 3,
          status: "creating",
          team1: { players: [], chatID: "", score: 0 },
          team2: { players: [], chatID: "", score: 0 },
          currentTurn: 0,
          createdAt: new Date(),
        },
      ];

      (gameModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockGames),
      });

      const result = await gameService.getGames();

      expect(gameModel.find).toHaveBeenCalled(); // Ensure Game.find was called
      expect(result).toEqual(mockGames); // Verify the result matches the mock data
    });

    it("should return an empty array if no games are found", async () => {
      (gameModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      });

      const result = await gameService.getGames();

      expect(result).toEqual([]); // Ensure the result is an empty array
    });
  });
});

describe("GameService - addUser and rmUser", () => {
  let gameService: GameService;

  beforeAll(() => {
    gameService = GameService.getInstance(); // Initialize the service
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  describe("addUser", () => {
    it("should add a user to the specified team", async () => {
      const mockGame = {
        _id: "507f1f77bcf86cd799439011",
        team1: { players: [], chatID: "", score: 0 },
        team2: { players: [], chatID: "", score: 0 },
        save: jest.fn().mockResolvedValue(undefined),
      };

      (getOriginalId as jest.Mock).mockReturnValue(mockGame._id);
      (gameModel.findById as jest.Mock).mockResolvedValue(mockGame);

      await gameService.addUser("shortGameId", "team1", "newPlayer");

      expect(getOriginalId).toHaveBeenCalledWith("shortGameId"); // Verify ID conversion
      expect(gameModel.findById).toHaveBeenCalledWith(mockGame._id); // Verify DB query
      expect(mockGame.team1.players).toContain("newPlayer"); // Verify user added to the team
      expect(mockGame.save).toHaveBeenCalled(); // Ensure game is saved
    });

    it("should throw an error if the game is not found", async () => {
      (getOriginalId as jest.Mock).mockReturnValue("507f1f77bcf86cd799439011");
      (gameModel.findById as jest.Mock).mockResolvedValue(null); // Mock no result

      await expect(
        gameService.addUser("invalidId", "team1", "newPlayer"),
      ).rejects.toThrow("Game not found");
    });
  });

  describe("rmUser", () => {
    it("should remove a user from the specified team", async () => {
      const mockGame = {
        _id: "507f1f77bcf86cd799439011",
        team1: { players: ["player1", "player2"], chatID: "", score: 0 },
        team2: { players: ["player3"], chatID: "", score: 0 },
        save: jest.fn().mockResolvedValue(undefined),
      };

      (getOriginalId as jest.Mock).mockReturnValue(mockGame._id);
      (gameModel.findById as jest.Mock).mockResolvedValue(mockGame);

      await gameService.rmUser("shortGameId", "team1", "player1");

      expect(mockGame.team1.players).not.toContain("player1"); // Verify user is removed
      expect(mockGame.save).toHaveBeenCalled(); // Ensure game is saved
    });

    it("should throw an error if the game is not found", async () => {
      (getOriginalId as jest.Mock).mockReturnValue("507f1f77bcf86cd799439011");
      (gameModel.findById as jest.Mock).mockResolvedValue(null); // Mock no result

      await expect(
        gameService.rmUser("invalidId", "team1", "player1"),
      ).rejects.toThrow("Game not found");
    });

    it("should not remove the user if they are not in the specified team", async () => {
      const mockGame = {
        _id: "507f1f77bcf86cd799439011",
        team1: { players: ["player1"], chatID: "", score: 0 },
        team2: { players: ["player3"], chatID: "", score: 0 },
        save: jest.fn().mockResolvedValue(undefined),
      };

      (getOriginalId as jest.Mock).mockReturnValue(mockGame._id);
      (gameModel.findById as jest.Mock).mockResolvedValue(mockGame);

      await gameService.rmUser("shortGameId", "team2", "nonExistentPlayer");

      expect(mockGame.team2.players).toEqual(["player3"]); // Verify no changes
      expect(mockGame.save).toHaveBeenCalled(); // Ensure game is saved
    });
  });
});

describe("GameService - User Score Methods", () => {
  let gameService: GameService;
  let mockSocketService: any;

  beforeAll(() => {
    mockSocketService = { emitToGameRoom: jest.fn() }; // Mock socket service
    gameService = GameService.getInstance(); // Initialize the service
    gameService["socketService"] = mockSocketService; // Inject mock socket service
  });

  beforeEach(() => {
    gameService["userScores"] = {}; // Reset in-memory scores before each test
  });

  describe("updateUserScoreInMemory", () => {
    it("should initialize game scores and update user score", () => {
      gameService.updateUserScoreInMemory("user1", "game123", 10);

      const score = gameService.getUserScore("game123", "user1");
      expect(score).toBe(10); // Verify score updated

      expect(mockSocketService.emitToGameRoom).toHaveBeenCalledWith(
        "game123",
        "scoreUpdated",
        {
          userId: "user1",
          score: 10,
        },
      ); // Verify socket emission
    });

    it("should accumulate the user’s score over multiple updates", () => {
      gameService.updateUserScoreInMemory("user1", "game123", 10);
      gameService.updateUserScoreInMemory("user1", "game123", 15);

      const score = gameService.getUserScore("game123", "user1");
      expect(score).toBe(25); // Verify cumulative score
    });

    it("should update scores for multiple users", () => {
      gameService.updateUserScoreInMemory("user1", "game123", 10);
      gameService.updateUserScoreInMemory("user2", "game123", 5);

      expect(gameService.getUserScore("game123", "user1")).toBe(10);
      expect(gameService.getUserScore("game123", "user2")).toBe(5);
    });
  });

  describe("getUserScore", () => {
    it("should return 0 if the user or game does not exist", () => {
      const score = gameService.getUserScore(
        "nonExistentGame",
        "nonExistentUser",
      );
      expect(score).toBe(0); // Default to 0 if no score found
    });

    it("should return the correct score for an existing user", () => {
      gameService.updateUserScoreInMemory("user1", "game123", 20);

      const score = gameService.getUserScore("game123", "user1");
      expect(score).toBe(20); // Verify correct score retrieval
    });
  });

  describe("getCurrentScores", () => {
    it("should calculate team scores based on individual player scores", async () => {
      const mockGame = {
        status: "playing",
        team1: { players: ["user1", "user2"], score: 0 },
        team2: { players: ["user3"], score: 0 },
      };
      jest.spyOn(gameService, "getGame").mockResolvedValue(mockGame as any);

      gameService.updateUserScoreInMemory("user1", "game123", 10);
      gameService.updateUserScoreInMemory("user2", "game123", 5);
      gameService.updateUserScoreInMemory("user3", "game123", 20);

      const scores = await gameService.getCurrentScores("game123");
      expect(scores).toEqual({ team1: 15, team2: 20 }); // Verify team scores
    });

    it("should return final team scores if the game is finished", async () => {
      const mockGame = {
        status: "finished",
        team1: { score: 30, players: [] },
        team2: { score: 25, players: [] },
      };
      jest.spyOn(gameService, "getGame").mockResolvedValue(mockGame as any);

      const scores = await gameService.getCurrentScores("game123");
      expect(scores).toEqual({ team1: 30, team2: 25 }); // Verify final scores
    });

    it("should handle cases where teams have no players", async () => {
      const mockGame = {
        status: "playing",
        team1: { players: [], score: 0 },
        team2: { players: [], score: 0 },
      };
      jest.spyOn(gameService, "getGame").mockResolvedValue(mockGame as any);

      const scores = await gameService.getCurrentScores("game123");
      expect(scores).toEqual({ team1: 0, team2: 0 }); // Verify zero scores
    });
  });
});

describe("GameService - saveUserScoresToDatabase", () => {
  let gameService: GameService;
  let mockGame: any;
  let mockUsers: any[];

  beforeAll(() => {
    gameService = GameService.getInstance();
    gameService["userScores"] = {}; // Initialize user scores in memory
  });

  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks before each test

    // Mock game object
    mockGame = {
      team1: { players: ["user1", "user2"], score: 0 },
      team2: { players: ["user3"], score: 0 },
      status: "playing",
      save: jest.fn(),
    };

    // Mock user objects
    mockUsers = [
      {
        username: "user1",
        stats: { wordsGuessed: 0, gamesPlayed: 0, gamesWon: 0 },
        save: jest.fn(),
      },
      {
        username: "user2",
        stats: { wordsGuessed: 0, gamesPlayed: 0, gamesWon: 0 },
        save: jest.fn(),
      },
      {
        username: "user3",
        stats: { wordsGuessed: 0, gamesPlayed: 0, gamesWon: 0 },
        save: jest.fn(),
      },
    ];

    // Spy on gameModel.findById and return mock game
    jest.spyOn(gameModel, "findById").mockResolvedValue(mockGame);

    // Spy on userModel.findOne and return appropriate mock user
    jest
      .spyOn(userModel, "findOne")
      .mockResolvedValue(mockUsers.find((user) => user.username === "user3"));
  });

  it("should save user scores and update game correctly", async () => {
    // Set user scores in memory

    jest.spyOn(gameService, "getGame").mockResolvedValue(mockGame as any);
    gameService.updateUserScoreInMemory("user1", "game123", 10);
    gameService.updateUserScoreInMemory("user2", "game123", 5);
    gameService.updateUserScoreInMemory("user3", "game123", 20);

    // Mock getCurrentScores to return calculated scores
    jest
      .spyOn(gameService, "getCurrentScores")
      .mockResolvedValue({ team1: 15, team2: 20 });

    // Call the method
    await gameService.saveUserScoresToDatabase("game123");

    // Verify game scores are updated
    expect(mockGame.team1.score).toBe(15);
    expect(mockGame.team2.score).toBe(20);
    expect(mockGame.save).toHaveBeenCalled();
  });

  it("should delete user scores from memory after saving", async () => {
    // Set user scores in memory
    gameService.updateUserScoreInMemory("user1", "game123", 10);

    // Mock getCurrentScores to return calculated scores
    jest
      .spyOn(gameService, "getCurrentScores")
      .mockResolvedValue({ team1: 15, team2: 20 });

    jest.spyOn(gameService, "getGame").mockResolvedValue(mockGame as any);

    // Call the method
    await gameService.saveUserScoresToDatabase("game123");

    // Verify user scores are deleted from memory
    expect(gameService["userScores"]["game123"]).toBeUndefined();
  });
});

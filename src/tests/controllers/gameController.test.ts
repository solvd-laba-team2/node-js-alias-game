import { Request, Response } from "express";
import GameService from "../../services/gameService";
import {
    createGame
    , renderRoomPage
    , getGenerateWord
    , getCurrentWord
    , addUser
    , updateScore
    , getChatHistory
    , addMessageToChat
    ,renderJoinGamePage
    ,startTurn

} from "../../controllers/gameController";
import { getOriginalId } from "../../utils/hash";
import { shortenId } from "../../utils/hash";
// import { Types } from "mongoose";

jest.mock("../../services/gameService", () => ({
    getInstance: jest.fn().mockReturnValue({
        createGame: jest.fn(),
        getGame: jest.fn(),
        getChatHistory: jest.fn(),
        generateWord: jest.fn(),
        getCurrentWord: jest.fn(),
        addUser: jest.fn(),
        updateUserScoreInMemory: jest.fn(),
        addMessage: jest.fn(),
        getOnlyNotStartedGames: jest.fn(),
        startTurn: jest.fn()

    }),
}));

jest.mock("../../utils/hash", () => ({
    shortenId: jest.fn(),
    getOriginalId: jest.fn(),
}));

describe("GameController - createGame", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;
    let redirectMock: jest.Mock;

    beforeEach(() => {
        req = {
            body: {
                gameName: "testGame",
                difficulty: "easy",
                roundTime: 60,
                totalRounds: 10,
            },
        };

        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        redirectMock = jest.fn();
        res = {
            status: statusMock,
            json: jsonMock,
            redirect: redirectMock,
        };
    });

    it("should create a new game and redirect with shortened ID", async () => {
        const mockGame = { _id: "507f1f77bcf86cd799439011" };
        (GameService.getInstance().createGame as jest.Mock).mockResolvedValue(mockGame);
        (shortenId as jest.Mock).mockReturnValue("abc123");

        await createGame(req as Request, res as Response);

        expect(GameService.getInstance().createGame).toHaveBeenCalledWith(
            "testGame",
            "easy",
            60,
            10
        );
        expect(shortenId).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
        expect(res.redirect).toHaveBeenCalledWith("/game/abc123");
    });

    it("should handle errors and return status 500", async () => {
        const error = new Error("Server error");
        (GameService.getInstance().createGame as jest.Mock).mockRejectedValue(error);

        await createGame(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
});

// describe("renderRoomPage", () => {
//     let req: Partial<Request>;
//     let res: Partial<Response>;
//     let renderMock: jest.Mock;
//
//     beforeEach(() => {
//         req = { params: { gameId: "mockedGameId" } };
//         renderMock = jest.fn();
//         res = {
//             render: renderMock,
//             locals: { username: "testuser" }
//         };
//
//         // Mockowanie funkcji hash (getOriginalId)
//         (getOriginalId as jest.Mock).mockReturnValue("mockedObjectId");
//     });
//
//     it("should render room with error if gameId is invalid", async () => {
//         (getOriginalId as jest.Mock).mockReturnValueOnce("invalidId");
//
//         await renderRoomPage(req as Request, res as Response);
//
//         expect(renderMock).toHaveBeenCalledWith("room", expect.objectContaining({
//             gameName: "Game not found",
//             currentUser: "testuser",
//             messages: [],
//             team1: [],
//             team2: [],
//             currentTurn: 0,
//             roundTime: null,
//             totalRounds: null
//         }));
//     });
//
//     it("should render room with game data if game exists", async () => {
//         const mockGame = {
//             team1: { players: ["player1"] },
//             team2: { players: ["player2"] },
//             currentTurn: 1,
//             roundTime: 60,
//             totalRounds: 5
//         };
//         const mockChatHistory = ["message1", "message2"];
//
//         (GameService.getInstance().getGame as jest.Mock).mockResolvedValueOnce(mockGame);
//         (GameService.getInstance().getChatHistory as jest.Mock).mockResolvedValueOnce(mockChatHistory);
//
//         await renderRoomPage(req as Request, res as Response);
//
//         expect(renderMock).toHaveBeenCalledWith("room", {
//             gameName: "mockedGameId",
//             currentUser: "testuser",
//             messages: mockChatHistory,
//             team1: mockGame.team1.players,
//             team2: mockGame.team2.players,
//             currentTurn: mockGame.currentTurn,
//             roundTime: mockGame.roundTime,
//             totalRounds: mockGame.totalRounds
//         });
//     });
// });
describe("getGenerateWord", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        req = {
            params: { gameCode: "testGameCode" },
        };

        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        res = {
            status: statusMock,
            json: jsonMock,
        };
    });

    it("should generate a word and return it with status 200", async () => {
        // Mocking the return value of generateWord
        const mockWord = "generatedWord";
        (GameService.getInstance().generateWord as jest.Mock).mockResolvedValue(mockWord);

        await getGenerateWord(req as Request, res as Response);

        expect(GameService.getInstance().generateWord).toHaveBeenCalledWith("testGameCode");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ word: mockWord });
    });

    it("should handle errors and return status 500", async () => {
        // Mocking an error case
        const error = new Error("Server error");
        (GameService.getInstance().generateWord as jest.Mock).mockRejectedValue(error);

        await getGenerateWord(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
});
describe("GameController - getCurrentWord", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        req = { params: { gameCode: "mockedGameCode" } };
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        res = {
            status: statusMock,
            json: jsonMock,
        };
    });

    it("should return the current word with status 200", () => {
        (GameService.getInstance().getCurrentWord as jest.Mock).mockReturnValue("mockedWord");

        getCurrentWord(req as Request, res as Response);

        expect(GameService.getInstance().getCurrentWord).toHaveBeenCalledWith("mockedGameCode");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ word: "mockedWord" });
    });

    it("should return 404 if an error occurs", () => {
        (GameService.getInstance().getCurrentWord as jest.Mock).mockImplementation(() => {
            throw new Error("Current word not found");
        });

        getCurrentWord(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Current word not found" });
    });
});

describe("GameController - addUser", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        req = {
            body: { gameId: "mockedGameId", username: "testuser", teamId: "team1" },
        };
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        res = {
            status: statusMock,
            json: jsonMock,
        };
    });

    it("should add the user to the game and return status 200", async () => {
        await addUser(req as Request, res as Response);

        expect(GameService.getInstance().addUser).toHaveBeenCalledWith(
            "mockedGameId",
            "team1",
            "testuser"
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "testuser added to the game" });
    });

    it("should handle errors and return status 500", async () => {
        const error = new Error("Server error");
        (GameService.getInstance().addUser as jest.Mock).mockRejectedValue(error);

        await addUser(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
});
describe("GameController - updateScore", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        req = {
            params: {
                gameId: "mockedGameId",
                username: "testuser",
                points: "10", // Points are passed as a string in params
            },
        };
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        res = {
            status: statusMock,
            json: jsonMock,
        };
    });

    it("should update the user's score and return status 200", async () => {
        await updateScore(req as Request, res as Response);

        expect(GameService.getInstance().updateUserScoreInMemory).toHaveBeenCalledWith(
            "mockedGameId",
            "testuser",
            10 // Points should be parsed to an integer
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "testuser's score updated by 10 points",
        });
    });

    it("should handle errors and return status 500", async () => {
        const error = new Error("Server error");
        (GameService.getInstance().updateUserScoreInMemory as jest.Mock).mockRejectedValue(error);

        await updateScore(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
});
describe("GameController - getChatHistory", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        req = {
            params: {
                gameId: "mockedGameId",
            },
        };
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        res = {
            status: statusMock,
            json: jsonMock,
        };
    });

    it("should return chat history with status 200", async () => {
        const mockChatHistory = ["message1", "message2"];
        (GameService.getInstance().getChatHistory as jest.Mock).mockResolvedValue(mockChatHistory);

        await getChatHistory(req as Request, res as Response);

        expect(GameService.getInstance().getChatHistory).toHaveBeenCalledWith("mockedGameId");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockChatHistory);
    });

    it("should handle errors and return status 500", async () => {
        const error = new Error("Server error");
        (GameService.getInstance().getChatHistory as jest.Mock).mockRejectedValue(error);

        await getChatHistory(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
});
describe("GameController - addMessageToChat", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        req = {
            params: {
                gameId: "mockedGameId",
            },
            body: {
                sender: "player1",
                message: "Hello",
                type: "chat",
            },
        };

        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        res = {
            status: statusMock,
            json: jsonMock,
        };
    });

    it("should add message to chat and return status 200", async () => {
        await addMessageToChat(req as Request, res as Response);

        expect(GameService.getInstance().addMessage).toHaveBeenCalledWith(
            "mockedGameId",
            "player1",
            "Hello",
            "chat"
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Message added to chat" });
    });

    it("should handle errors and return status 500", async () => {
        const error = new Error("Server error");
        (GameService.getInstance().addMessage as jest.Mock).mockRejectedValue(error);

        await addMessageToChat(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
});
describe("GameController - renderJoinGamePage", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let renderMock: jest.Mock;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        req = {};
        renderMock = jest.fn();
        res = {
            render: renderMock,
        };
        consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it("should render join-game page with the list of not started games", async () => {
        const mockGames = [
            { gameName: "Game 1", _id: "abc123" },
            { gameName: "Game 2", _id: "def456" },
        ];
        (GameService.getInstance().getOnlyNotStartedGames as jest.Mock).mockResolvedValue(mockGames);

        await renderJoinGamePage(req as Request, res as Response);

        expect(GameService.getInstance().getOnlyNotStartedGames).toHaveBeenCalled();
        expect(res.render).toHaveBeenCalledWith("join-game", { games: mockGames });
    });

    it("should handle errors and render an empty list if there's an issue", async () => {
        const error = new Error("Server error");
        (GameService.getInstance().getOnlyNotStartedGames as jest.Mock).mockRejectedValue(error);

        await renderJoinGamePage(req as Request, res as Response);

        expect(GameService.getInstance().getOnlyNotStartedGames).toHaveBeenCalled();
        expect(res.render).toHaveBeenCalledWith("join-game", { games: [] });
    });
});


describe("GameController - startTurn", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;
    let consoleSpy: jest.SpyInstance; // Dodajemy consoleSpy

    beforeEach(() => {
        req = { params: { gameId: "mockedGameId" } };

        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        res = {
            status: statusMock,
            json: jsonMock,
        };


        consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {

        consoleSpy.mockRestore();
    });

    it("should start a turn and return success message", async () => {
        await startTurn(req as Request, res as Response);

        expect(GameService.getInstance().startTurn).toHaveBeenCalledWith("mockedGameId");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Turn started" });
    });

    it("should handle errors and return status 500", async () => {
        const error = new Error("Server error");
        (GameService.getInstance().startTurn as jest.Mock).mockRejectedValue(error);

        await startTurn(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
});

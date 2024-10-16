import { Request, Response } from "express";
import GameService from "../../services/gameService";
import {
    createGame
    , getGenerateWord
    , getCurrentWord
    , updateScore
    , getChatHistory
    , addMessageToChat
    , renderJoinGamePage

} from "../../controllers/gameController";
import { shortenId } from "../../utils/hash";
import chatService from "../../services/chatService";
// import { Types } from "mongoose";

jest.mock("../../services/gameService", () => ({
    getInstance: jest.fn().mockReturnValue({
        createGame: jest.fn(),
        getGame: jest.fn(),
        getChatHistory: jest.fn(),
        generateWord: jest.fn(),
        getCurrentWord: jest.fn(),
        updateUserScoreInMemory: jest.fn(),
        getOnlyNotStartedGames: jest.fn(),
    }),
}));

jest.mock("../../utils/hash", () => ({
    shortenId: jest.fn(),
    getOriginalId: jest.fn(),
}));

jest.mock("../../services/socketService", () => ({
    getInstance: jest.fn().mockReturnValue({
        emitToGameRoom: jest.fn(),
        emitToSocket: jest.fn(),
        emit: jest.fn(),
    }),
}));

jest.mock("../../services/chatService", () => ({
    getChatHistory: jest.fn(),
    addMessageToChat: jest.fn(),
}));

describe("GameController - createGame", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let redirectMock: jest.Mock;
    let jsonMock: jest.Mock;
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
        redirectMock = jest.fn();
        jsonMock = jest.fn();
        res = {
            status: statusMock,
            redirect: redirectMock,
            json: jsonMock,
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
        (GameService.getInstance().createGame as jest.Mock).mockRejectedValue(new Error("Server error"));

        await createGame(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });
});

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
        (GameService.getInstance().generateWord as jest.Mock).mockRejectedValue(new Error("Server error"));

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
                points: "10",
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
            "testuser",
            "mockedGameId",
            10,
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "testuser's score updated by 10 points",
        });
    });

    it("should handle errors and return status 500", async () => {
        (GameService.getInstance().updateUserScoreInMemory as jest.Mock).mockRejectedValue(new Error("Server error"));

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
                gameCode: "mockedGameCode",
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
        (chatService.getChatHistory as jest.Mock).mockResolvedValue(mockChatHistory);

        await getChatHistory(req as Request, res as Response);

        expect(chatService.getChatHistory).toHaveBeenCalledWith("mockedGameCode");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ chat: mockChatHistory });
    });

    it("should handle errors and return status 500", async () => {
        (chatService.getChatHistory as jest.Mock).mockRejectedValue(new Error("Server error"));

        await getChatHistory(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
    });

    it("should return empty chat history with status 200", async () => {
        const mockChatHistory = [];
        (chatService.getChatHistory as jest.Mock).mockResolvedValue(mockChatHistory);

        await getChatHistory(req as Request, res as Response);

        expect(chatService.getChatHistory).toHaveBeenCalledWith("mockedGameCode");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ chat: mockChatHistory });
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
                gameCode: "mockedGameCode",
            },
            body: {
                sender: "player1",
                message: "Hello",
                role: "describer",
                targetWord: "mockedTargetWord",
                socketId: "mockedSocketId",
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

        expect(chatService.addMessageToChat).toHaveBeenCalledWith(
            "mockedGameCode",
            "player1",
            "Hello",
            "describer",
            "mockedTargetWord",
            "mockedSocketId",
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Message added to chat" });
    });

    it("should handle errors and return status 500", async () => {
        (chatService.addMessageToChat as jest.Mock).mockRejectedValue(new Error("Server error"));

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
        consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
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
        (GameService.getInstance().getOnlyNotStartedGames as jest.Mock).mockRejectedValue(new Error("Server error"));

        await renderJoinGamePage(req as Request, res as Response);

        expect(GameService.getInstance().getOnlyNotStartedGames).toHaveBeenCalled();
        expect(res.render).toHaveBeenCalledWith("join-game", { games: [] });
    });
});
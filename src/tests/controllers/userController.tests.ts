import { Request, Response } from "express";
import User from "../../models/userModel";
import { createUser, getUser, getUserPage, putNewPassword } from "../../controllers/userController";
import bcrypt from "bcrypt";


jest.mock("../../models/userModel", () => ({
    create: jest.fn(),
}));
jest.mock("bcrypt");

describe("UserController - createUser", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        req = { body: { username: "testuser", password: "password123" } };
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        res = { status: statusMock, json: jsonMock };
    });

    it("should create a new user and return 201 status", async () => {
        const mockUser = { username: "testuser", stats: { gamesPlayed: 0, gamesWon: 0, wordsGuessed: 0 } };
        (User.create as jest.Mock).mockResolvedValue(mockUser);

        await createUser(req as Request, res as Response);

        expect(User.create).toHaveBeenCalledWith(req.body);
        expect(statusMock).toHaveBeenCalledWith(201);
        expect(jsonMock).toHaveBeenCalledWith({ username: mockUser.username, stats: mockUser.stats });
    });

    it("should handle errors and return 500 status", async () => {
        const error = new Error("Server error");
        (User.create as jest.Mock).mockRejectedValue(error);

        await createUser(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({ error: error.message });
    });

    it("should handle non-Error errors", async () => {
        const error = "Server error";
        (User.create as jest.Mock).mockRejectedValue(error);

        await createUser(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({ error: "An unknown error occurred" });
    });
});
describe("UserController - getUser", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;
    let consoleLogSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        req = { body: { username: "testuser" } };
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        res = {
            status: statusMock,
            json: jsonMock,
        };
        consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
    });
    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    it("should return the user if found", async () => {
        const mockUser = { username: "testuser", password: "hashedpassword" };
        (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser);

        const user = await getUser(req as Request, res as Response);

        expect(User.findOne).toHaveBeenCalledWith({ username: "testuser" });
        expect(user).toEqual(mockUser);
    });

    it("should return null if user is not found", async () => {
        (User.findOne as jest.Mock).mockResolvedValueOnce(null);

        const user = await getUser(req as Request, res as Response);

        expect(User.findOne).toHaveBeenCalledWith({ username: "testuser" });
        expect(user).toBeNull();
    });

    it("should handle errors and log the error message", async () => {
        const error = new Error("Server error");
        (User.findOne as jest.Mock).mockRejectedValueOnce(error);

        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });

        await getUser(req as Request, res as Response);

        expect(consoleSpy).toHaveBeenCalledWith(error.message);
        consoleSpy.mockRestore();
    });
});

describe("UserController - getUserPage", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let consoleLogSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        req = { cookies: { username: "testuser" } };
        res = {
            clearCookie: jest.fn(),
            render: jest.fn(),
        };

        consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {

        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    it("should render the user page with user data", async () => {
        const mockUser = {
            username: "testuser",
            stats: { gamesPlayed: 10, gamesWon: 5, wordsGuessed: 50 },
        };
        (User.findOne as jest.Mock).mockResolvedValue(mockUser);

        await getUserPage(req as Request, res as Response);

        expect(User.findOne).toHaveBeenCalledWith({ username: "testuser" });
        expect(res.render).toHaveBeenCalledWith("user", {
            title: "Profile",
            page: "user",
            username: "testuser",
            gamesPlayed: 10,
            gamesWon: 5,
            wordsGuessed: 50,
        });
    });

    it("should log out and render login if user not found", async () => {
        (User.findOne as jest.Mock).mockResolvedValue(null);

        await getUserPage(req as Request, res as Response);

        expect(User.findOne).toHaveBeenCalledWith({ username: "testuser" });
        expect(res.clearCookie).toHaveBeenCalledWith("username");
        expect(res.clearCookie).toHaveBeenCalledWith("token");
        expect(res.render).toHaveBeenCalledWith("login", {
            title: "Login",
            page: "login",
            errorMessage: null,
        });
    });

    it("should handle errors and log the error message", async () => {
        const error = new Error("Server error");
        (User.findOne as jest.Mock).mockRejectedValue(error);

        await getUserPage(req as Request, res as Response);

        expect(console.error).toHaveBeenCalledWith(error.message);
    });
});

describe("UserController - putNewPassword", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let renderMock: jest.Mock;
    let clearCookieMock: jest.Mock;
    let consoleLogSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        req = {
            cookies: { username: "testuser" },
            body: { password: "newPassword123" },
        };
        renderMock = jest.fn();
        clearCookieMock = jest.fn();
        res = {
            render: renderMock,
            clearCookie: clearCookieMock,
        };


        consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    it("should update the password and render success message", async () => {
        const mockUser = {
            username: "testuser",
            updateOne: jest.fn().mockResolvedValue({}),
            stats: { gamesPlayed: 10, gamesWon: 5, wordsGuessed: 50 },
        };
        (User.findOne as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.hash as jest.Mock).mockResolvedValue("hashedNewPassword");

        await putNewPassword(req as Request, res as Response);

        expect(User.findOne).toHaveBeenCalledWith({ username: "testuser" });
        expect(bcrypt.hash).toHaveBeenCalledWith("newPassword123", 13);
        expect(mockUser.updateOne).toHaveBeenCalledWith({ password: "hashedNewPassword" });
        expect(res.render).toHaveBeenCalledWith("user", {
            title: "Profile",
            page: "user",
            successMessage: "Password updated successfully!",
            username: "testuser",
            gamesPlayed: 10,
            gamesWon: 5,
            wordsGuessed: 50,
        });
    });

    it("should clear cookies and render login if user not found", async () => {
        (User.findOne as jest.Mock).mockResolvedValue(null);

        await putNewPassword(req as Request, res as Response);

        expect(User.findOne).toHaveBeenCalledWith({ username: "testuser" });
        expect(res.clearCookie).toHaveBeenCalledWith("username");
        expect(res.clearCookie).toHaveBeenCalledWith("token");
        expect(res.render).toHaveBeenCalledWith("login", {
            title: "Login",
            page: "login",
            errorMessage: null,
        });
    });

    it("should handle errors and render error message", async () => {
        const error = new Error("Server error");
        (User.findOne as jest.Mock).mockRejectedValue(error);

        await putNewPassword(req as Request, res as Response);

        expect(console.error).toHaveBeenCalledWith(error.message);
        expect(res.render).toHaveBeenCalledWith("user", {
            title: "Profile",
            page: "user",
            errorMessage: "An error occurred while updating the password. Please try again.",
        });
    });
});
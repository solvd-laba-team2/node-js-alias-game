import { Request, Response } from "express";
import User from "../../models/userModel";
import { createUser, getUser, getUserPage, putNewPassword } from "../../controllers/userController";
import bcrypt from "bcrypt";


jest.mock("../../models/userModel", () => ({
    findOne: jest.fn(),
    create: jest.fn(),
}));
jest.mock("bcrypt", () => ({
    hash: jest.fn(),
}));

describe("UserController - createUser", () => {
    let req: Request;
    let res: Response;

    beforeEach(() => {
        req = {
            body: {
                username: "testuser",
                password: "password123",
            },
        } as Request;
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            console: {
                log: jest.fn(),
            },
        } as unknown as Response;
        jest.spyOn(console, "log").mockImplementation(() => { });
        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should create a new user and log success message", async () => {
        (User.create as jest.Mock).mockResolvedValue({ username: "testuser", password: "hashedpassword" });

        await createUser(req, res);

        expect(User.create).toHaveBeenCalledWith(req.body);
        expect(console.log).toHaveBeenCalledWith("User created:\n", { username: "testuser", password: "hashedpassword" });
    });


    it("should handle errors and return error message", async () => {
        (User.create as jest.Mock).mockRejectedValue(new Error("Server error"));

        await createUser(req, res);

        expect(User.create).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Server error" });
        expect(console.error).toHaveBeenCalledWith("Server error");
    });

});
describe("UserController - getUser", () => {
    let req: Request;
    let res: Response;

    beforeEach(() => {
        req = { body: { username: "testuser" } } as Request;
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return user if found", async () => {
        const mockUser = { username: "testuser", password: "hashedpassword" };
        (User.findOne as jest.Mock).mockResolvedValueOnce({ username: "testuser", password: "hashedpassword" });

        const result = await getUser(req, res);

        expect(User.findOne).toHaveBeenCalledWith({ username: "testuser" });
        expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
        (User.findOne as jest.Mock).mockResolvedValueOnce(null);

        const result = await getUser(req, res);

        expect(User.findOne).toHaveBeenCalledWith({ username: "testuser" });
        expect(result).toBeNull();
    });

    it("should log error if error thrown", async () => {
        const error = new Error("Test error");
        jest.spyOn(console, "error").mockImplementation(() => { });

        (User.findOne as jest.Mock).mockRejectedValueOnce(error);

        await getUser(req, res);

        expect(console.error).toHaveBeenCalledWith("Test error");
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
    let statusMock: jest.Mock;
    let renderMock: jest.Mock;
    let clearCookieMock: jest.Mock;
    let consoleLogSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        req = {
            cookies: { username: "testuser" },
            body: { password: "newPassword123" },
        };
        statusMock = jest.fn().mockReturnThis();
        renderMock = jest.fn().mockReturnThis();
        clearCookieMock = jest.fn();
        res = {
            status: statusMock,
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


    const mockUser = {
        username: "testuser",
        updateOne: jest.fn().mockResolvedValue({}),
        stats: { gamesPlayed: 10, gamesWon: 5, wordsGuessed: 50 },
    };

    it("should update the password and render success message", async () => {
        (User.findOne as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.hash as jest.Mock).mockResolvedValue("hashedNewPassword");

        await putNewPassword(req as Request, res as Response);

        expect(User.findOne).toHaveBeenCalledWith({ username: "testuser" });
        expect(bcrypt.hash).toHaveBeenCalledWith("newPassword123", 13);
        expect(mockUser.updateOne).toHaveBeenCalledWith({ password: "hashedNewPassword" });
        expect(console.log).toHaveBeenCalledWith("New password successfully set for user:", mockUser);
        expect(res.status).toHaveBeenCalledWith(200);
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
        expect(console.log).toHaveBeenCalledWith(`No user with username: ${mockUser.username}, logged out`);
        expect(res.clearCookie).toHaveBeenCalledWith("username");
        expect(res.clearCookie).toHaveBeenCalledWith("token");
        expect(res.status).toHaveBeenCalledWith(401);
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

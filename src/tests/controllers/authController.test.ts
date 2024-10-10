import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userController from "../../controllers/userController";
import { postLogin, getLogin, getRegister, postRegister, getLogout } from "../../controllers/authController";
import { Request, Response } from "express";

jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../../controllers/userController", () => ({
    __esModule: true,
    default: {
        getUser: jest.fn(),
        createUser: jest.fn(),
    },
}));

describe("authController", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let renderMock: jest.Mock;
    let redirectMock: jest.Mock;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        req = {
            body: { username: "testuser", password: "password123" },
        };
        statusMock = jest.fn().mockReturnThis();
        renderMock = jest.fn().mockReturnThis();
        redirectMock = jest.fn();
        res = {
            status: statusMock,
            render: renderMock,
            redirect: redirectMock,
            cookie: jest.fn(),
            clearCookie: jest.fn(),
        };


        consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {

        consoleSpy.mockRestore();
    });

    // Testy dla getLogin
    describe("getLogin", () => {
        it("should render login page", () => {
            getLogin(req as Request, res as Response);
            expect(res.render).toHaveBeenCalledWith("login", {
                title: "Login",
                page: "login",
                errorMessage: null,
            });
        });
    });

    // Testy dla getRegister
    describe("getRegister", () => {
        it("should render register page", () => {
            getRegister(req as Request, res as Response);
            expect(res.render).toHaveBeenCalledWith("register", {
                title: "Register",
                page: "register",
                errorMessage: null,
            });
        });
    });

    // Testy dla postLogin
    describe("postLogin", () => {
        it("should render login page with error if user is not found", async () => {
            (userController.getUser as jest.Mock).mockResolvedValue(null);

            await postLogin(req as Request, res as Response);

            expect(userController.getUser).toHaveBeenCalledWith(req, res);
            expect(res.render).toHaveBeenCalledWith("login", {
                title: "Login",
                page: "login",
                errorMessage: "Username or password is incorrect",
            });
        });

        it("should render login page with error if password does not match", async () => {
            const mockUser = { username: "testuser", password: "hashedpassword" };
            (userController.getUser as jest.Mock).mockResolvedValue(mockUser);

            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await postLogin(req as Request, res as Response);

            expect(res.render).toHaveBeenCalledWith("login", {
                title: "Login",
                page: "login",
                errorMessage: "Username or password is incorrect",
            });
        });

        it("should set cookie and redirect to home if login is successful", async () => {
            const mockUser = { username: "testuser", password: "hashedpassword" };
            (userController.getUser as jest.Mock).mockResolvedValue(mockUser);

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue("mocked-jwt-token");

            await postLogin(req as Request, res as Response);

            expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashedpassword");
            expect(jwt.sign).toHaveBeenCalledWith(
                { username: "testuser" },
                process.env.JWT_SECRET as string,
                { expiresIn: "1h" }
            );
            expect(res.cookie).toHaveBeenCalledWith("token", "mocked-jwt-token");
            expect(res.redirect).toHaveBeenCalledWith("/");
        });

        it("should render login page with 500 error if there is a server error", async () => {
            const error = new Error("Server error");
            (userController.getUser as jest.Mock).mockRejectedValue(error);

            await postLogin(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.render).toHaveBeenCalledWith("login", {
                title: "Login",
                page: "login",
                errorMessage: "Internal server error",
            });
        });
    });

    // Testy dla postRegister
    describe("postRegister", () => {
        it("should render register page with error if user already exists", async () => {
            const mockUser = { username: "testuser", password: "hashedpassword" };
            (userController.getUser as jest.Mock).mockResolvedValue(mockUser);

            await postRegister(req as Request, res as Response);

            expect(res.render).toHaveBeenCalledWith("register", {
                title: "Register",
                page: "register",
                errorMessage: "Username already exists",
            });
        });

        it("should hash the password and create user if registration is successful", async () => {
            (userController.getUser as jest.Mock).mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");
            (jwt.sign as jest.Mock).mockReturnValue("mocked-jwt-token");

            await postRegister(req as Request, res as Response);

            expect(bcrypt.hash).toHaveBeenCalledWith("password123", 13);
            expect(userController.createUser).toHaveBeenCalledWith(req, res);
            expect(jwt.sign).toHaveBeenCalledWith(
                { username: "testuser" },
                process.env.JWT_SECRET as string,
                { expiresIn: "1h" }
            );
            expect(res.cookie).toHaveBeenCalledWith("token", "mocked-jwt-token");
            expect(res.redirect).toHaveBeenCalledWith("/");
        });

        it("should render register page with 500 error if there is a server error", async () => {
            const error = new Error("Server error");
            (userController.getUser as jest.Mock).mockRejectedValue(error);

            await postRegister(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.render).toHaveBeenCalledWith("register", {
                title: "Register",
                page: "register",
                errorMessage: "Internal server error",
            });
        });
    });

    // Testy dla getLogout
    describe("getLogout", () => {
        it("should clear the token cookie and redirect to login", () => {
            getLogout(req as Request, res as Response);

            expect(res.clearCookie).toHaveBeenCalledWith("token");
            expect(res.redirect).toHaveBeenCalledWith("/login");
        });
    });
});

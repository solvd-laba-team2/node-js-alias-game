import { Request, Response } from "express";
import userController from "./userController";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// GET Login Page
export const getLogin = (req: Request, res: Response) => {
  res.render("login", { title: "Login", page: "login", errorMessage: null });
};

// GET Register Page
export const getRegister = (req: Request, res: Response) => {
  res.render("register", {
    title: "Register",
    page: "register",
    errorMessage: null,
  });
};

// POST Login
export const postLogin = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = await userController.getUser(req, res);
    if (!user) {
      console.error(`The user ${username} was not found`);
      return res.render("login", {
        title: "Login",
        page: "login",
        errorMessage: "Username or password is incorrect",
      });
    }

    // Await bcrypt.compare as it is asynchronous
    const passed = await bcrypt.compare(password, user.password);
    if (!passed) {
      console.error("Invalid password");
      return res.render("login", {
        title: "Login",
        page: "login",
        errorMessage: "Username or password is incorrect",
      });
    }

    const token = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      },
    );
    res.cookie("token", token);

    return res.status(200).redirect("/");
  } catch (error) {
    console.error(error.message);
    return res.status(500).render("login", {
      title: "Login",
      page: "login",
      errorMessage: "Internal server error",
    });
  }
};

// POST Register
export const postRegister = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    // Check if the user already exists
    const user = await userController.getUser(req, res);
    if (user) {
      console.error(`User ${username} already exists`);
      return res.render("register", {
        title: "Register",
        page: "register",
        errorMessage: "Username already exists",
      });
    }

    // Await bcrypt.hash to ensure password is hashed
    const hashedPassword = await bcrypt.hash(password, 13);
    req.body.password = hashedPassword;

    // Create the user
    await userController.createUser(req, res);

    // Generate JWT token after user registration
    const token = jwt.sign({ username }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });
    res.cookie("token", token);

    return res.redirect("/");
  } catch (error) {
    console.error(error.message);
    return res.status(500).render("register", {
      title: "Register",
      page: "register",
      errorMessage: "Internal server error",
    });
  }
};

// Logout
export const getLogout = (req: Request, res: Response) => {
  res.clearCookie("token");
  return res.redirect("/login");
};

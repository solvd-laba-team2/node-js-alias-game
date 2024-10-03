import { Request, Response } from "express";
import User from "../models/userModel";

export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const newUser = await User.create(req.body);
    console.log("User created:\n", newUser);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
};

export const getUser = async (req: Request, res: Response): Promise<any> => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log(`No user with username: ${username}`);
      return null;
    }
    console.log("Found user:\n", user);
    return user;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
};

export const getUserPage = async (req: Request, res: Response): Promise<any> => {
  const username = req.cookies.username;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log(`No user with username: ${username}, logged out`);
      res.clearCookie("username");
      res.clearCookie("token");
      res.render("login", { title: "Login", page: "login", errorMessage: null });
    }
    console.log("Found user:\n", user);
    res.render("user", {
      title: "Profile",
      page: "user",
      username: user.username,
      gamesPlayed: user.stats.gamesPlayed,
      gamesWon: user.stats.gamesWon,
      wordsGuessed: user.stats.wordsGuessed
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }


};

export default { getUser, createUser, getUserPage };

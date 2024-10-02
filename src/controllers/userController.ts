import { Request, Response } from "express";
import User from "../models/userModel";

export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const newUser = await User.create(req.body);
    console.log("User created:\n", newUser);
  } catch (error: any) {
    console.error(error.message);
  }
};

export const getUser = async (req: Request, res: Response) : Promise<any> => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log(`No user with username: ${username}`);
      return null;
    }
    console.log("Found user:\n", user);
    return user;
  } catch (error: any) {
    console.error(error.message);
    return null;
  }
};

export default { getUser, createUser };

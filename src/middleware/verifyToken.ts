import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.token;
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    //console.log(user);
    req.cookies.username = user.username;
    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    res.clearCookie("token");
    return res.redirect("/");
  }
};

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
    req.cookies.username = user.username;
    next();
  } catch (err) {
    console.error(err.message);
    res.clearCookie("token");
    return res.redirect("/");
  }
};

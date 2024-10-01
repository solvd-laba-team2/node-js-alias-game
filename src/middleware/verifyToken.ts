import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.token;
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.clearCookie("token");
    return res.redirect("/");
  }
};

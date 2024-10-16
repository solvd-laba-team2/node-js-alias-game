// import jwt from "jsonwebtoken";
// import { Request, Response, NextFunction } from "express";
//
// export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
//   const token = req.cookies.token;
//
//   if (!token) {
//     res.locals.isAuthenticated = false; // User is not logged in
//     return next();
//   }
//
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     res.locals.isAuthenticated = true; // Set isAuthenticated flag
//     res.locals.username = decoded.username; // Optional: Pass user info
//   } catch (err) {
//     console.error("JWT verification failed", err.message);
//     res.locals.isAuthenticated = false; // Token is invalid
//   }
//
//   return next();
// };
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    res.locals.isAuthenticated = false; // User is not logged in
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);


    if (typeof decoded !== "string" && (decoded as JwtPayload).username) {
      res.locals.isAuthenticated = true; // Set isAuthenticated flag
      res.locals.username = (decoded as JwtPayload).username; // Pass user info
    } else {
      res.locals.isAuthenticated = false;
    }
  } catch (err: any) {
    console.error("JWT verification failed", err.message);
    res.locals.isAuthenticated = false; // Token is invalid
  }

  return next();
};

import express, { Application } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { checkAuth } from "../middleware/checkAuth";

export default (app: Application): void => {
  // Middleware to serve static files
  app.use(express.static(path.join(__dirname, "../public")));

  // Middleware to handle POST data (forms)
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cookieParser());

  // Custom authentication middleware
  app.use(checkAuth);
};

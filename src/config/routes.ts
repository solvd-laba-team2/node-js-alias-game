import authRoutes from "../routes/authRoutes";
import userRoutes from "../routes/userRoutes";
import gameRoutes from "../routes/gameRoutes";
import { Application } from "express";

export default (app: Application) => {
  // User
  app.use("/", authRoutes);
  app.use("/", userRoutes);
//  Game 
  app.use("/game", gameRoutes);
};

import authRoutes from "../routes/authRoutes";
import userRoutes from "../routes/userRoutes";
import chatRoutes from "../routes/chatRoutes";
import gameRoutes from "../routes/gameRoutes";
import { Application } from "express";

export default (app: Application) => {
  app.use("/", authRoutes);
  app.use("/", userRoutes);
  app.use("/", chatRoutes);
  app.use("/game", gameRoutes);
};

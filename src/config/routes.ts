import authRoutes from "../routes/authRoutes";
import userRoutes from "../routes/userRoutes";
import { Express } from "express";

export default (app: Express) => {
  app.use("/", authRoutes);
  app.use("/", userRoutes);
};

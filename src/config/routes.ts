import authRoutes from "../routes/authRoutes";
import userRoutes from "../routes/userRoutes";
import { Application } from "express";

export default (app: Application) => {
  app.use("/", authRoutes);
  app.use("/", userRoutes);
};

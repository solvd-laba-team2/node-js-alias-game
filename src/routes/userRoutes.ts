import { Router } from "express";
import userController from "../controllers/userController";

const router = Router();

router.get("/user/:username", userController.getUser);

router.post("/user", userController.createUser);

export default router;

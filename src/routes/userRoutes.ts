import { Router } from "express";
import userController from "../controllers/userController";
import { verifyToken } from "../middleware/verifyToken";

const router = Router();

router.get("/user/", verifyToken, userController.getUserPage);

router.post("/user", userController.createUser);

router.put("/user", verifyToken, userController.putNewPassword);

export default router;

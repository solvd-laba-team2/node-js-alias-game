import express from "express";
import chatController from "../controllers/chatController";

const router = express.Router();
// Route to retrieve chat history
router.get("/game/:gameId", chatController.getChatHistory);
// Route to add a message to the chat via POST method
router.post("/game/:gameId/send", chatController.addMessage);

export default router;

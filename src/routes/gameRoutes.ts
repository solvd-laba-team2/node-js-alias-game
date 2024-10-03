import express from "express";
import gameController from "../controllers/gameController";

const router = express.Router();

// Route to render the form for creating a game
router.get("/create", gameController.renderCreateGameForm);  

// Route to create a new game
router.post("/create", gameController.createGame);

// Route to add a user to the game
router.post("/addUser", gameController.addUser);

// Route to update the score for a specific user in the game
router.get("/:gameId/updateScore/:username/:points", gameController.updateScore);

// Route to get the chat history for a specific game
router.get("/:gameId/chat", gameController.getChatHistory);

// Route to send a message in the game's chat
router.post("/:gameId/chat/send", gameController.addMessageToChat);

// Route to start a new turn in the game
router.get("/:gameId/startTurn", gameController.startTurn);

export default router;




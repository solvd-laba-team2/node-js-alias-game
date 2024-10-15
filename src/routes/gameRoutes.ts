import express from "express";
import gameController from "../controllers/gameController";
import { verifyToken } from "../middleware/verifyToken";

const router = express.Router();

// Route to render the form for creating a game1
router.get("/create", verifyToken, gameController.renderCreateGameForm);

// Route to render the page for joining a game1
router.get("/join", verifyToken, gameController.renderJoinGamePage);

// Route to create a new game1
router.post("/create", verifyToken, gameController.createGame);

// Route to join a game1
router.post("/join", verifyToken, gameController.joinGame);

// Route to update the score for a specific user in the game1
router.get(
    "/:gameId/updateScore/:username/:points",
    gameController.updateScore,
);

// Route to get the chat history for a specific game
router.get("/:gameCode/chat", gameController.getChatHistory);

// Route to send a message in the game's chat
router.post("/:gameCode/chat/send", gameController.addMessageToChat);

// Route to render the room page for a specific game1
router.get("/:gameId", verifyToken, gameController.renderRoomPage);

// Route to generate a new word for the game1
router.get("/:gameCode/generateWord", gameController.getGenerateWord);

// Route to get the current teams for a game1
router.get("/:gameCode/getTeams", gameController.getTeams);

// Route to get the current word in play for a game1
router.get("/:gameCode/currentWord", gameController.getCurrentWord);

// Route to get the current scores for a game1
router.get("/:gameCode/scores", gameController.getCurrentScores);

// Route to switch the turn to the next team/player1
router.get("/:gameCode/switchTurn", gameController.switchTurn);

// Route to get the current turn's team/player for a game
router.get("/:gameCode/getTurn", gameController.getTurn);

export default router;
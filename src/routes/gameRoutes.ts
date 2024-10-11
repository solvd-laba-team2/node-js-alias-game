import express from "express";
import gameController from "../controllers/gameController";
import { verifyToken } from "../middleware/verifyToken";

const router = express.Router();

// Route to render the form for creating a game
router.get("/create", verifyToken, gameController.renderCreateGameForm);

// Route to render the page for joining a game
router.get("/join", verifyToken, gameController.renderJoinGamePage);

// Route to create a new game
router.post("/create", gameController.createGame);

// Route to join a game
router.post("/join", gameController.joinGame);

// Route to add a user to the game
router.post("/addUser", gameController.addUser);

// Route to update the score for a specific user in the game
router.get(
    "/:gameId/updateScore/:username/:points",
    gameController.updateScore,
);

// Route to get the chat history for a specific game
router.get("/:gameId/chat", gameController.getChatHistory);

// Route to send a message in the game's chat
router.post("/:gameId/chat/send", gameController.addMessageToChat);

// Route to start a new turn in the game
router.get("/:gameId/startTurn", gameController.startTurn);

router.get("/:gameId", verifyToken, gameController.renderRoomPage);

router.get("/:gameCode/generateWord", gameController.getGenerateWord);

router.get("/:gameCode/getTeams", gameController.getTeams);

router.get("/:gameCode/currentWord", gameController.getCurrentWord);

router.get("/:gameCode/scores", gameController.getCurrentScores);

router.get("/:gameCode/switchTurn", gameController.switchTurn);

router.get("/:gameCode/getTurn", gameController.getTurn);

export default router;

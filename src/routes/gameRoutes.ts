import express from "express";
import gameController from "../controllers/gameController";

const router = express.Router();

// Tworzenie nowej gry
// Dodaj trasę do renderowania formularza tworzenia gry
router.get("/create", gameController.renderCreateGameForm);  // Wyświetlanie formularza

router.post("/create", gameController.createGame);

// Reszta tras (dodawanie użytkowników, aktualizacja punktów, czat)
router.post("/addUser", gameController.addUser);
router.get("/:gameId/updateScore/:username/:points", gameController.updateScore);
router.get("/:gameId/chat", gameController.getChatHistory);
router.post("/:gameId/chat/send", gameController.addMessageToChat);
router.get("/:gameId/startTurn", gameController.startTurn);

export default router;



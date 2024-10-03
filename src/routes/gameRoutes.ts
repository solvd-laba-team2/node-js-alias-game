import express from "express";
import gameController from "../controllers/gameController";

const router = express.Router();

router.get("/addUser/:username", gameController.addUser);

router.get("/updateScore/:username/:points", gameController.updateScore);


export default router;
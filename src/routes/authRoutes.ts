import { Router } from "express";
import authController from "../controllers/authController";

const router = Router();

// Route to the home page
router.get("/", (req, res) => {
  res.render("home", { title: "Alias Game - Home" });
});

// Route to login page
router.get("/login", authController.getLogin);

// Route to register page
router.get("/register", authController.getRegister);

// Route to post login form
router.post("/login", authController.postLogin);

// Route to post register form
router.post("/register", authController.postRegister);

// Route to logout
router.get("/logout", authController.getLogout);

export default router;

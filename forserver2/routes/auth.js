import express from "express";
import {
    handleRegister,
    handleLogin,
    handleCheckUsername
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", handleRegister);
router.post("/login", handleLogin);
router.get("/check-username", handleCheckUsername);

export default router;

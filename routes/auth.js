import express from "express";
import { checkUsernameAvailability, login, logout, register } from "../controllers/auth.js";

const router = express.Router();

router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)
router.get("/check-username", checkUsernameAvailability)

export default router
import express from "express";
import { generateReviewDraft, getAiTripPlan } from "../controllers/ai.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/trip-plan", getAiTripPlan);
router.post("/review-draft", verifyToken, generateReviewDraft);

export default router;

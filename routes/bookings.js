import express from "express";
import {
  cancelBooking,
  createBooking,
  getUserBookings,
  submitBookingReview,
} from "../controllers/booking.js";
import { verifyToken, verifyUser } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createBooking);
router.get("/user/:id", verifyUser, getUserBookings);
router.put("/:bookingId/cancel", verifyToken, cancelBooking);
router.put("/:bookingId/review", verifyToken, submitBookingReview);

export default router;

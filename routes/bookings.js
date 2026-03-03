import express from "express";
import {
  cancelBooking,
  createBooking,
  getUserBookings,
} from "../controllers/booking.js";
import { verifyToken, verifyUser } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createBooking);
router.get("/user/:id", verifyUser, getUserBookings);
router.put("/:bookingId/cancel", verifyToken, cancelBooking);

export default router;

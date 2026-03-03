import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import User from "../models/User.js";
import { createError } from "../utils/error.js";

const hasDateConflict = (existingDates, requestedDateTimes) => {
  const existing = new Set(existingDates.map((date) => new Date(date).getTime()));
  return requestedDateTimes.some((time) => existing.has(Number(time)));
};

const normalizeToUtcMidnight = (value) => {
  const date = new Date(Number(value));
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

export const createBooking = async (req, res, next) => {
  try {
    const { hotelId, roomNumberIds, dates, totalPrice } = req.body;

    if (!hotelId || !Array.isArray(roomNumberIds) || roomNumberIds.length === 0) {
      return next(createError(400, "Hotel and at least one room are required."));
    }

    if (!Array.isArray(dates) || dates.length === 0) {
      return next(createError(400, "Booking dates are required."));
    }

    const parsedDateTimes = dates.map((value) => normalizeToUtcMidnight(value));
    if (parsedDateTimes.some((value) => Number.isNaN(value))) {
      return next(createError(400, "Invalid booking dates."));
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return next(createError(404, "Hotel not found."));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(createError(404, "User not found."));
    }

    const dateObjects = parsedDateTimes.map((time) => new Date(time));

    const updatedRoomIds = [];

    for (const roomNumberId of roomNumberIds) {
      const roomUpdateResult = await Room.updateOne(
        {
          roomNumbers: {
            $elemMatch: {
              _id: roomNumberId,
              unavailableDates: {
                $not: {
                  $elemMatch: {
                    $in: dateObjects,
                  },
                },
              },
            },
          },
        },
        {
          $push: {
            "roomNumbers.$.unavailableDates": { $each: dateObjects },
          },
        }
      );

      if (!roomUpdateResult.modifiedCount) {
        await Promise.all(
          updatedRoomIds.map((updatedRoomId) =>
            Room.updateOne(
              { "roomNumbers._id": updatedRoomId },
              {
                $pull: {
                  "roomNumbers.$.unavailableDates": { $in: dateObjects },
                },
              }
            )
          )
        );

        return next(createError(409, "One or more selected rooms are already booked for these dates."));
      }

      updatedRoomIds.push(roomNumberId);
    }

    const newBooking = new Booking({
      userId: user._id.toString(),
      username: user.username,
      hotelId: hotel._id.toString(),
      hotelName: hotel.name,
      roomNumberIds,
      dates: dateObjects,
      totalPrice: Number(totalPrice) || 0,
      status: "confirmed",
    });

    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (err) {
    next(err);
  }
};

export const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return next(createError(404, "Booking not found."));
    }

    if (booking.userId !== req.user.id && !req.user.isAdmin) {
      return next(createError(403, "You are not authorized!"));
    }

    if (booking.status === "cancelled") {
      return res.status(200).json(booking);
    }

    await Promise.all(
      booking.roomNumberIds.map((roomNumberId) =>
        Room.updateOne(
          { "roomNumbers._id": roomNumberId },
          {
            $pull: {
              "roomNumbers.$.unavailableDates": { $in: booking.dates },
            },
          }
        )
      )
    );

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json(booking);
  } catch (err) {
    next(err);
  }
};

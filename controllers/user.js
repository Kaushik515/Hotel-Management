import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";

const isValidEmail = (email = "") => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
};

const sanitizeUser = (userDoc) => {
  const { password, ...safeUser } = userDoc;
  return safeUser;
};

export const updateUser = async (req,res,next)=>{
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
}
export const deleteUser = async (req,res,next)=>{
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted.");
  } catch (err) {
    next(err);
  }
}
export const getUser = async (req,res,next)=>{
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}
export const getUsers = async (req,res,next)=>{
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}

export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return next(createError(404, "User not found."));
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const allowedFields = ["username", "email", "country", "city", "phone", "img"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (typeof req.body[field] !== "undefined") {
        updates[field] = req.body[field];
      }
    });

    if (typeof updates.email === "string") {
      updates.email = updates.email.trim().toLowerCase();
      if (!isValidEmail(updates.email)) {
        return next(createError(400, "Please provide a valid email address."));
      }
    }

    if (typeof updates.username === "string") {
      updates.username = updates.username.trim();
      if (!updates.username) {
        return next(createError(400, "Username cannot be empty."));
      }
    }

    if (typeof updates.country === "string") {
      updates.country = updates.country.trim();
    }

    if (typeof updates.city === "string") {
      updates.city = updates.city.trim();
    }

    if (typeof updates.phone === "string") {
      updates.phone = updates.phone.trim();
    }

    const conflictChecks = [];

    if (updates.email) {
      conflictChecks.push(
        User.findOne({ email: updates.email, _id: { $ne: req.user.id } })
      );
    }

    if (updates.username) {
      conflictChecks.push(
        User.findOne({ username: updates.username, _id: { $ne: req.user.id } })
      );
    }

    if (conflictChecks.length) {
      const conflictResults = await Promise.all(conflictChecks);
      const hasEmailConflict = updates.email
        ? conflictResults.some((result) => result && result.email === updates.email)
        : false;
      const hasUsernameConflict = updates.username
        ? conflictResults.some((result) => result && result.username === updates.username)
        : false;

      if (hasEmailConflict) {
        return next(createError(409, "Email is already registered."));
      }
      if (hasUsernameConflict) {
        return next(createError(409, "Username is already taken."));
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    );

    if (!updatedUser) {
      return next(createError(404, "User not found."));
    }

    res.status(200).json(sanitizeUser(updatedUser._doc));
  } catch (err) {
    next(err);
  }
};

export const changeMyPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(createError(400, "Current and new password are required."));
    }

    if (newPassword.length < 6) {
      return next(createError(400, "New password must be at least 6 characters long."));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(createError(404, "User not found."));
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      return next(createError(401, "Current password is incorrect."));
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    await User.findByIdAndUpdate(req.user.id, {
      $set: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    next(err);
  }
};
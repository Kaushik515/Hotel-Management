import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";
import {
  isStrongPassword,
  PASSWORD_POLICY_MESSAGE,
} from "../utils/passwordPolicy.js";
import {
  isValidEmail,
  getEmailValidationError,
} from "../utils/emailValidation.js";
import {
  getPhoneValidationError,
} from "../utils/phoneValidation.js";

export const register = async (req, res, next) => {
  try {
    const normalizedEmail = (req.body.email || "").trim().toLowerCase();
    const normalizedUsername = (req.body.username || "").trim();

    if (!normalizedUsername) {
      return next(createError(400, "Username is required."));
    }

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      const emailError = getEmailValidationError(normalizedEmail);
      return next(createError(400, emailError || "Please provide a valid email address."));
    }

    const phoneError = getPhoneValidationError(req.body.phone || "", req.body.country || "");
    if (phoneError) {
      return next(createError(400, phoneError));
    }

    const existingUser = await User.findOne({ username: normalizedUsername });

    if (existingUser) {
      return next(createError(409, "Username is already taken."));
    }

    if (!isStrongPassword(req.body.password || "")) {
      return next(createError(400, PASSWORD_POLICY_MESSAGE));
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const newUser = new User({
      ...req.body,
      username: normalizedUsername,
      email: normalizedEmail,
      password: hash,
    });

    await newUser.save();

    res.status(200).send("User has been created.");
  } catch (err) {
    if (err?.code === 11000 && err?.keyPattern?.username) {
      return next(createError(409, "Username is already taken."));
    }
    next(err);
  }
};

export const checkUsernameAvailability = async (req, res, next) => {
  try {
    const username = (req.query.username || "").trim();

    if (!username) {
      return next(createError(400, "Username is required."));
    }

    const existingUser = await User.findOne({ username }).select("_id");
    const available = !existingUser;

    return res.status(200).json({
      available,
      message: available ? "Username is available." : "Username is already taken.",
    });
  } catch (err) {
    next(err);
  }
};
export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return next(createError(401, "Invalid username or password!"));

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect)
      return next(createError(401, "Invalid username or password!"));

    const sessionHours = Math.max(Number(process.env.SESSION_HOURS) || 1, 1);
    const sessionSeconds = Math.floor(sessionHours * 60 * 60);
    const sessionMs = sessionSeconds * 1000;

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT,
      { expiresIn: `${sessionSeconds}s` }
    );

    const requestOrigin = req.headers.origin || "";
    const isLocalClient =
      process.env.NODE_ENV !== "production" ||
      requestOrigin.includes("localhost") ||
      requestOrigin.includes("127.0.0.1");
    const cookieOptions = {
      httpOnly: true,
      sameSite: isLocalClient ? "lax" : "none",
      secure: !isLocalClient,
      path: "/",
      maxAge: sessionMs,
    };

    const { password, isAdmin, ...otherDetails } = user._doc;
    res
      .cookie("access_token", token, cookieOptions)
      .status(200)
      .json({ details: { ...otherDetails }, isAdmin, token });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const requestOrigin = req.headers.origin || "";
    const isLocalClient =
      process.env.NODE_ENV !== "production" ||
      requestOrigin.includes("localhost") ||
      requestOrigin.includes("127.0.0.1");

    res
      .clearCookie("access_token", {
        httpOnly: true,
        sameSite: isLocalClient ? "lax" : "none",
        secure: !isLocalClient,
        path: "/",
      })
      .status(200)
      .json({ message: "Logged out successfully." });
  } catch (err) {
    next(err);
  }
};

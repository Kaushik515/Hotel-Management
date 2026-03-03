import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";

const isValidEmail = (email = "") => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
};

export const register = async (req, res, next) => {
  try {
    const normalizedEmail = (req.body.email || "").trim().toLowerCase();

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      return next(createError(400, "Please provide a valid email address."));
    }

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: req.body.username }],
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return next(createError(409, "Email is already registered."));
      }
      return next(createError(409, "Username is already taken."));
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const newUser = new User({
      ...req.body,
      email: normalizedEmail,
      password: hash,
    });

    await newUser.save();

    res.status(200).send("User has been created.");
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

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT
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
    };

    const { password, isAdmin, ...otherDetails } = user._doc;
    res
      .cookie("access_token", token, cookieOptions)
      .status(200)
      .json({ details: { ...otherDetails }, isAdmin });
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

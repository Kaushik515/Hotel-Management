import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoute from "./routes/auth.js";
import usersRoute from "./routes/users.js";
import hotelsRoute from "./routes/hotels.js";
import roomsRoute from "./routes/rooms.js";
import bookingsRoute from "./routes/bookings.js";
import aiRoute from "./routes/ai.js";
import User from "./models/User.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
dotenv.config();
mongoose.set("strictQuery", true);

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean);

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    await User.syncIndexes();
    console.log("Connected to MongoDB.");
  } catch (error) {
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected!");
});

//middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
)
app.use(cookieParser())
app.use(express.json());

app.get("/",(req,res)=>{
  res.setHeader("Access-Control-Allow-Credentials","true");
  res.send("Api is Running.....");
});
app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/hotels", hotelsRoute);
app.use("/api/rooms", roomsRoute);
app.use("/api/bookings", bookingsRoute);
app.use("/api/ai", aiRoute);

app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: err.stack,
  });
});

const port = Number(process.env.PORT) || 5000;

const server = app.listen(port, () => {
  connect();
  console.log(`Connected to Backend on port ${port}.`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Stop the running process or set a different PORT.`);
    return;
  }
  console.error("Server startup error:", err.message);
});

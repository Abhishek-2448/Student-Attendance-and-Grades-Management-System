
import "./config/env.js";
import express from "express";
import cors from "cors";

import authRouter from "./routes/authRoute.js";
import studentsRouter from "./routes/studentsRoute.js";
import subjectsRouter from "./routes/subjectsRoute.js";
import attendanceRouter from "./routes/attendanceRoute.js";
import gradesRouter from "./routes/gradesRoute.js";

import { protect } from "./middleWares/authMiddleware.js";
import { notFound, errorHandler } from "./middleWares/errorMiddleware.js";

const appObj = express();

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((url) => url.trim().replace(/\/$/, ""))
    .filter(Boolean)
];

appObj.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header (e.g. server-to-server).
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204
  })
);

appObj.use(express.json());

appObj.get("/", (req, res) => {
  res.json({ message: "Students Management API is running" });
});

appObj.use("/auth", authRouter);

// Require JWT authentication for data routes when enabled.
const guard = process.env.REQUIRE_AUTH === "true" ? [protect] : [];

appObj.use("/students", ...guard, studentsRouter);
appObj.use("/subjects", ...guard, subjectsRouter);
appObj.use("/attendance", ...guard, attendanceRouter);
appObj.use("/grades", ...guard, gradesRouter);

appObj.use(notFound);
appObj.use(errorHandler);

export default appObj;

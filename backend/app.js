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

appObj.use(cors());
appObj.use(express.json());

appObj.get("/", (req, res) => {
  res.json({ message: "Students Management API is running" });
});

appObj.use("/auth", authRouter);

// Data routes only require a token when REQUIRE_AUTH=true in application.env.
const guard = process.env.REQUIRE_AUTH === "true" ? [protect] : [];

appObj.use("/students", ...guard, studentsRouter);
appObj.use("/subjects", ...guard, subjectsRouter);
appObj.use("/attendance", ...guard, attendanceRouter);
appObj.use("/grades", ...guard, gradesRouter);

appObj.use(notFound);
appObj.use(errorHandler);

export default appObj;

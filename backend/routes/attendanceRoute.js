import express from "express";
import * as attendanceController from "../controllers/attendanceController.js";

const router = express.Router();

router.get("/", attendanceController.getAllAttendance);
router.post("/", attendanceController.addAttendance);

// Must come before "/:id" or "student" would be read as an id.
router.get("/student/:studentId", attendanceController.getAttendanceByStudent);

router.get("/:id", attendanceController.getAttendanceById);
router.put("/:id", attendanceController.updateAttendance);
router.delete("/:id", attendanceController.deleteAttendance);

export default router;

import express from "express";
import * as studentsController from "../controllers/studentsController.js";

const router = express.Router();

router.get("/", studentsController.getAllStudents);
router.post("/", studentsController.addStudent);

router.get("/:id/profile", studentsController.getStudentProfile);

router.get("/:id", studentsController.getStudentById);
router.put("/:id", studentsController.updateStudent);
router.delete("/:id", studentsController.deleteStudent);

export default router;

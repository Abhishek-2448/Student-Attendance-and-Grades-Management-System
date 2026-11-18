import express from "express";
import * as gradesController from "../controllers/gradesController.js";

const router = express.Router();

router.get("/", gradesController.getAllGrades);
router.post("/", gradesController.addGrade);

// Must come before "/:id" or "student" would be read as an id.
router.get("/student/:studentId", gradesController.getGradesByStudent);

router.get("/:id", gradesController.getGradeById);
router.put("/:id", gradesController.updateGrade);
router.delete("/:id", gradesController.deleteGrade);

export default router;

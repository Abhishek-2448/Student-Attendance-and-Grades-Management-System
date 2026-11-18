import express from "express";
import * as subjectsController from "../controllers/subjectsController.js";

const router = express.Router();

router.get("/", subjectsController.getAllSubjects);
router.post("/", subjectsController.addSubject);
router.get("/:id", subjectsController.getSubjectById);

export default router;

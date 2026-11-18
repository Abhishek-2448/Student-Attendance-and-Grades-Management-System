import pool from "../config/db.js";
import AppError from "../utils/AppError.js";
import { dbError } from "../utils/dbErrors.js";

export async function getAllSubjects(req, res) {
  const [rows] = await pool.query("SELECT * FROM subjects ORDER BY id");

  res.json(rows);
}

export async function getSubjectById(req, res) {
  const [rows] = await pool.query("SELECT * FROM subjects WHERE id = ?", [
    req.params.id,
  ]);

  if (rows.length === 0) {
    throw new AppError("Subject not found", 404);
  }

  res.json(rows[0]);
}

export async function addSubject(req, res) {
  const { subjectName } = req.body;

  if (!subjectName) {
    throw new AppError("Subject name is required", 400);
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO subjects (subject_name) VALUES (?)",
      [subjectName],
    );

    res.status(201).json({
      message: "Subject added successfully",
      subjectId: result.insertId,
    });
  } catch (error) {
    throw dbError(error, { ER_DUP_ENTRY: "Subject already exists" });
  }
}

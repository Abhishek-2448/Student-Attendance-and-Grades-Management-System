import pool from "../config/db.js";
import AppError from "../utils/AppError.js";
import { dbError } from "../utils/dbErrors.js";

const SELECT_GRADES = `
  SELECT
    grades.id,
    grades.student_id,
    students.name AS student_name,
    grades.subject_id,
    subjects.subject_name,
    grades.marks
  FROM grades
  JOIN students ON grades.student_id = students.id
  JOIN subjects ON grades.subject_id = subjects.id`;

const DUPLICATE = {
  ER_DUP_ENTRY: "Grade already exists for this student and subject",
};

function readGradeBody(body) {
  const { studentId, subjectId, marks } = body;

  if (!studentId || !subjectId || marks === undefined) {
    throw new AppError("Student, subject and marks are required", 400);
  }

  if (Number(marks) < 0 || Number(marks) > 100) {
    throw new AppError("Marks must be between 0 and 100", 400);
  }

  return [studentId, subjectId, marks];
}

export async function getAllGrades(req, res) {
  const [rows] = await pool.query(
    `${SELECT_GRADES} ORDER BY students.name, subjects.subject_name`,
  );

  res.json(rows);
}

export async function getGradesByStudent(req, res) {
  const [rows] = await pool.query(
    `${SELECT_GRADES}
     WHERE grades.student_id = ?
     ORDER BY subjects.subject_name`,
    [req.params.studentId],
  );

  res.json(rows);
}

export async function getGradeById(req, res) {
  const [rows] = await pool.query(`${SELECT_GRADES} WHERE grades.id = ?`, [
    req.params.id,
  ]);

  if (rows.length === 0) {
    throw new AppError("Grade record not found", 404);
  }

  res.json(rows[0]);
}

export async function addGrade(req, res) {
  const values = readGradeBody(req.body);

  try {
    const [result] = await pool.query(
      "INSERT INTO grades (student_id, subject_id, marks) VALUES (?, ?, ?)",
      values,
    );

    res.status(201).json({
      message: "Grade added successfully",
      gradeId: result.insertId,
    });
  } catch (error) {
    throw dbError(error, {
      ...DUPLICATE,
      ER_NO_REFERENCED_ROW_2: "Student or subject does not exist",
    });
  }
}

export async function updateGrade(req, res) {
  const values = readGradeBody(req.body);

  let result;

  try {
    [result] = await pool.query(
      "UPDATE grades SET student_id = ?, subject_id = ?, marks = ? WHERE id = ?",
      [...values, req.params.id],
    );
  } catch (error) {
    throw dbError(error, DUPLICATE);
  }

  if (result.affectedRows === 0) {
    throw new AppError("Grade record not found", 404);
  }

  res.json({ message: "Grade updated successfully" });
}

export async function deleteGrade(req, res) {
  const [result] = await pool.query("DELETE FROM grades WHERE id = ?", [
    req.params.id,
  ]);

  if (result.affectedRows === 0) {
    throw new AppError("Grade record not found", 404);
  }

  res.json({ message: "Grade deleted successfully" });
}

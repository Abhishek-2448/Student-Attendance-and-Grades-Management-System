import pool from "../config/db.js";
import AppError from "../utils/AppError.js";
import { dbError } from "../utils/dbErrors.js";

const DUPLICATE_EMAIL = { ER_DUP_ENTRY: "Email already exists" };

function readStudentBody(body) {
  const { name, age, gender, studentClass, section, email, phone } = body;

  if (!name || !age || !gender || !studentClass || !section || !email || !phone) {
    throw new AppError("All student fields are required", 400);
  }

  return [name, age, gender, studentClass, section, email, phone];
}

export async function getAllStudents(req, res) {
  const [rows] = await pool.query("SELECT * FROM students ORDER BY id");

  res.json(rows);
}

export async function getStudentById(req, res) {
  const [rows] = await pool.query("SELECT * FROM students WHERE id = ?", [
    req.params.id,
  ]);

  if (rows.length === 0) {
    throw new AppError("Student not found", 404);
  }

  res.json(rows[0]);
}

export async function addStudent(req, res) {
  const values = readStudentBody(req.body);

  try {
    const [result] = await pool.query(
      `INSERT INTO students
         (name, age, gender, class, section, email, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      values,
    );

    res.status(201).json({
      message: "Student added successfully",
      studentId: result.insertId,
    });
  } catch (error) {
    throw dbError(error, DUPLICATE_EMAIL);
  }
}

export async function updateStudent(req, res) {
  const values = readStudentBody(req.body);

  let result;

  try {
    [result] = await pool.query(
      `UPDATE students
       SET name = ?, age = ?, gender = ?, class = ?,
           section = ?, email = ?, phone = ?
       WHERE id = ?`,
      [...values, req.params.id],
    );
  } catch (error) {
    throw dbError(error, DUPLICATE_EMAIL);
  }

  if (result.affectedRows === 0) {
    throw new AppError("Student not found", 404);
  }

  res.json({ message: "Student updated successfully" });
}

export async function deleteStudent(req, res) {
  const [result] = await pool.query("DELETE FROM students WHERE id = ?", [
    req.params.id,
  ]);

  if (result.affectedRows === 0) {
    throw new AppError("Student not found", 404);
  }

  res.json({ message: "Student deleted successfully" });
}

export async function getStudentProfile(req, res) {
  const studentId = req.params.id;

  const [students] = await pool.query("SELECT * FROM students WHERE id = ?", [
    studentId,
  ]);

  if (students.length === 0) {
    throw new AppError("Student not found", 404);
  }

  const [
    [attendanceSummary],
    [gradesSummary],
    [attendanceHistory],
    [gradeHistory],
  ] = await Promise.all([
    pool.query(
      `SELECT
         COUNT(*) AS total_classes,
         SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present_classes,
         SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS absent_classes,
         ROUND(
           SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) * 100.0
             / NULLIF(COUNT(*), 0),
           2
         ) AS attendance_percentage
       FROM attendance
       WHERE student_id = ?`,
      [studentId],
    ),
    pool.query(
      `SELECT COUNT(*) AS total_subjects, ROUND(AVG(marks), 2) AS average_marks
       FROM grades
       WHERE student_id = ?`,
      [studentId],
    ),
    pool.query(
      `SELECT id, date, status
       FROM attendance
       WHERE student_id = ?
       ORDER BY date DESC`,
      [studentId],
    ),
    pool.query(
      `SELECT grades.id, subjects.subject_name, grades.marks
       FROM grades
       JOIN subjects ON grades.subject_id = subjects.id
       WHERE grades.student_id = ?
       ORDER BY subjects.subject_name`,
      [studentId],
    ),
  ]);

  res.json({
    student: students[0],
    attendance: attendanceSummary[0],
    attendanceHistory,
    grades: gradesSummary[0],
    gradeHistory,
  });
}

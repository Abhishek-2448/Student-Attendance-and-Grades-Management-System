import pool from "../config/db.js";
import AppError from "../utils/AppError.js";
import { dbError } from "../utils/dbErrors.js";

const SELECT_ATTENDANCE = `
  SELECT
    attendance.id,
    attendance.student_id,
    students.name AS student_name,
    attendance.date,
    attendance.status
  FROM attendance
  JOIN students ON attendance.student_id = students.id`;

const DUPLICATE = {
  ER_DUP_ENTRY: "Attendance already exists for this student and date",
};

function readAttendanceBody(body) {
  const { studentId, date, status } = body;

  if (!studentId || !date || !status) {
    throw new AppError("Student, date and status are required", 400);
  }

  return [studentId, date, status];
}

export async function getAllAttendance(req, res) {
  const [rows] = await pool.query(
    `${SELECT_ATTENDANCE} ORDER BY attendance.date DESC, students.name`,
  );

  res.json(rows);
}

export async function getAttendanceByStudent(req, res) {
  const [rows] = await pool.query(
    `${SELECT_ATTENDANCE}
     WHERE attendance.student_id = ?
     ORDER BY attendance.date DESC`,
    [req.params.studentId],
  );

  res.json(rows);
}

export async function getAttendanceById(req, res) {
  const [rows] = await pool.query(
    `${SELECT_ATTENDANCE} WHERE attendance.id = ?`,
    [req.params.id],
  );

  if (rows.length === 0) {
    throw new AppError("Attendance record not found", 404);
  }

  res.json(rows[0]);
}

export async function addAttendance(req, res) {
  const values = readAttendanceBody(req.body);

  try {
    const [result] = await pool.query(
      "INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)",
      values,
    );

    res.status(201).json({
      message: "Attendance added successfully",
      attendanceId: result.insertId,
    });
  } catch (error) {
    throw dbError(error, {
      ...DUPLICATE,
      ER_NO_REFERENCED_ROW_2: "Student does not exist",
    });
  }
}

export async function updateAttendance(req, res) {
  const values = readAttendanceBody(req.body);

  let result;

  try {
    [result] = await pool.query(
      "UPDATE attendance SET student_id = ?, date = ?, status = ? WHERE id = ?",
      [...values, req.params.id],
    );
  } catch (error) {
    throw dbError(error, DUPLICATE);
  }

  if (result.affectedRows === 0) {
    throw new AppError("Attendance record not found", 404);
  }

  res.json({ message: "Attendance updated successfully" });
}

export async function deleteAttendance(req, res) {
  const [result] = await pool.query("DELETE FROM attendance WHERE id = ?", [
    req.params.id,
  ]);

  if (result.affectedRows === 0) {
    throw new AppError("Attendance record not found", 404);
  }

  res.json({ message: "Attendance deleted successfully" });
}

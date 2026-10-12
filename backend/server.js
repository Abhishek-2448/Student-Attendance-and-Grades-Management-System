const express = require("express");
const cors = require("cors");

const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// ==================================================
// HOME
// ==================================================

app.get("/", (req, res) => {
  res.json({
    message: "Students Management API is running",
  });
});

// ==================================================
// STUDENTS API
// ==================================================

// GET ALL STUDENTS

app.get("/students", (req, res) => {
  const sql = `
        SELECT *
        FROM students
        ORDER BY id
    `;

  db.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    res.json(results);
  });
});

// GET STUDENT BY ID

app.get("/students/:id", (req, res) => {
  const id = req.params.id;

  const sql = `
        SELECT *
        FROM students
        WHERE id = ?
    `;

  db.query(sql, [id], (error, results) => {
    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.json(results[0]);
  });
});

// ADD STUDENT

app.post("/students", (req, res) => {
  const { name, age, gender, studentClass, section, email, phone } = req.body;

  if (
    !name ||
    !age ||
    !gender ||
    !studentClass ||
    !section ||
    !email ||
    !phone
  ) {
    return res.status(400).json({
      message: "All student fields are required",
    });
  }

  const sql = `
        INSERT INTO students
        (name, age, gender, class, section, email, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

  const values = [name, age, gender, studentClass, section, email, phone];

  db.query(sql, values, (error, result) => {
    if (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          message: "Email already exists",
        });
      }

      return res.status(500).json({
        error: error.message,
      });
    }

    res.status(201).json({
      message: "Student added successfully",

      studentId: result.insertId,
    });
  });
});

// UPDATE STUDENT

app.put("/students/:id", (req, res) => {
  const id = req.params.id;

  const { name, age, gender, studentClass, section, email, phone } = req.body;

  if (
    !name ||
    !age ||
    !gender ||
    !studentClass ||
    !section ||
    !email ||
    !phone
  ) {
    return res.status(400).json({
      message: "All student fields are required",
    });
  }

  const sql = `
        UPDATE students
        SET
            name = ?,
            age = ?,
            gender = ?,
            class = ?,
            section = ?,
            email = ?,
            phone = ?
        WHERE id = ?
    `;

  const values = [name, age, gender, studentClass, section, email, phone, id];

  db.query(sql, values, (error, result) => {
    if (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          message: "Email already exists",
        });
      }

      return res.status(500).json({
        error: error.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.json({
      message: "Student updated successfully",
    });
  });
});

// DELETE STUDENT

app.delete("/students/:id", (req, res) => {
  const id = req.params.id;

  const sql = `
        DELETE FROM students
        WHERE id = ?
    `;

  db.query(sql, [id], (error, result) => {
    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.json({
      message: "Student deleted successfully",
    });
  });
});

// ==================================================
// SUBJECTS API
// ==================================================

// GET ALL SUBJECTS

app.get("/subjects", (req, res) => {
  const sql = `
        SELECT *
        FROM subjects
        ORDER BY id
    `;

  db.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    res.json(results);
  });
});

// GET SUBJECT BY ID

app.get("/subjects/:id", (req, res) => {
  const id = req.params.id;

  const sql = `
        SELECT *
        FROM subjects
        WHERE id = ?
    `;

  db.query(sql, [id], (error, results) => {
    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    res.json(results[0]);
  });
});

// ADD SUBJECT

app.post("/subjects", (req, res) => {
  const { subjectName } = req.body;

  if (!subjectName) {
    return res.status(400).json({
      message: "Subject name is required",
    });
  }

  const sql = `
        INSERT INTO subjects
        (subject_name)
        VALUES (?)
    `;

  db.query(sql, [subjectName], (error, result) => {
    if (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          message: "Subject already exists",
        });
      }

      return res.status(500).json({
        error: error.message,
      });
    }

    res.status(201).json({
      message: "Subject added successfully",

      subjectId: result.insertId,
    });
  });
});

// ==================================================
// ATTENDANCE API
// ==================================================

// GET ALL ATTENDANCE

app.get("/attendance", (req, res) => {
  const sql = `
        SELECT
            attendance.id,
            attendance.student_id,
            students.name AS student_name,
            attendance.date,
            attendance.status
        FROM attendance
        JOIN students
        ON attendance.student_id = students.id
        ORDER BY attendance.date DESC, students.name
    `;

  db.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    res.json(results);
  });
});

// GET ATTENDANCE FOR ONE STUDENT

app.get("/attendance/student/:studentId", (req, res) => {
  const studentId = req.params.studentId;

  const sql = `
            SELECT
                attendance.id,
                attendance.student_id,
                students.name AS student_name,
                attendance.date,
                attendance.status
            FROM attendance
            JOIN students
            ON attendance.student_id = students.id
            WHERE attendance.student_id = ?
            ORDER BY attendance.date DESC
        `;

  db.query(sql, [studentId], (error, results) => {
    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    res.json(results);
  });
});

// GET ATTENDANCE BY ID

app.get("/attendance/:id", (req, res) => {
  const id = req.params.id;

  const sql = `
        SELECT
            attendance.id,
            attendance.student_id,
            students.name AS student_name,
            attendance.date,
            attendance.status
        FROM attendance
        JOIN students
        ON attendance.student_id = students.id
        WHERE attendance.id = ?
    `;

  db.query(sql, [id], (error, results) => {
    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Attendance record not found",
      });
    }

    res.json(results[0]);
  });
});

// ADD ATTENDANCE

app.post("/attendance", (req, res) => {
  const { studentId, date, status } = req.body;

  if (!studentId || !date || !status) {
    return res.status(400).json({
      message: "Student, date and status are required",
    });
  }

  const sql = `
        INSERT INTO attendance
        (student_id, date, status)
        VALUES (?, ?, ?)
    `;

  db.query(sql, [studentId, date, status], (error, result) => {
    if (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          message: "Attendance already exists for this student and date",
        });
      }

      if (error.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({
          message: "Student does not exist",
        });
      }

      return res.status(500).json({
        error: error.message,
      });
    }

    res.status(201).json({
      message: "Attendance added successfully",

      attendanceId: result.insertId,
    });
  });
});

// UPDATE ATTENDANCE

app.put("/attendance/:id", (req, res) => {
  const id = req.params.id;

  const { studentId, date, status } = req.body;

  if (!studentId || !date || !status) {
    return res.status(400).json({
      message: "Student, date and status are required",
    });
  }

  const sql = `
        UPDATE attendance
        SET
            student_id = ?,
            date = ?,
            status = ?
        WHERE id = ?
    `;

  db.query(sql, [studentId, date, status, id], (error, result) => {
    if (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          message: "Attendance already exists for this student and date",
        });
      }

      return res.status(500).json({
        error: error.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Attendance record not found",
      });
    }

    res.json({
      message: "Attendance updated successfully",
    });
  });
});

// DELETE ATTENDANCE

app.delete("/attendance/:id", (req, res) => {
  const id = req.params.id;

  const sql = `
        DELETE FROM attendance
        WHERE id = ?
    `;

  db.query(sql, [id], (error, result) => {
    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Attendance record not found",
      });
    }

    res.json({
      message: "Attendance deleted successfully",
    });
  });
});

// ==================================================
// GRADES API
// ==================================================

// GET ALL GRADES

app.get("/grades", (req, res) => {
  const sql = `
        SELECT
            grades.id,
            grades.student_id,
            students.name AS student_name,
            grades.subject_id,
            subjects.subject_name,
            grades.marks
        FROM grades
        JOIN students
        ON grades.student_id = students.id
        JOIN subjects
        ON grades.subject_id = subjects.id
        ORDER BY students.name, subjects.subject_name
    `;

  db.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    res.json(results);
  });
});

// GET GRADES FOR ONE STUDENT

app.get("/grades/student/:studentId", (req, res) => {
  const studentId = req.params.studentId;

  const sql = `
            SELECT
                grades.id,
                grades.student_id,
                students.name AS student_name,
                grades.subject_id,
                subjects.subject_name,
                grades.marks
            FROM grades
            JOIN students
            ON grades.student_id = students.id
            JOIN subjects
            ON grades.subject_id = subjects.id
            WHERE grades.student_id = ?
            ORDER BY subjects.subject_name
        `;

  db.query(sql, [studentId], (error, results) => {
    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    res.json(results);
  });
});

// GET GRADE BY ID

app.get("/grades/:id", (req, res) => {
  const id = req.params.id;

  const sql = `
        SELECT
            grades.id,
            grades.student_id,
            students.name AS student_name,
            grades.subject_id,
            subjects.subject_name,
            grades.marks
        FROM grades
        JOIN students
        ON grades.student_id = students.id
        JOIN subjects
        ON grades.subject_id = subjects.id
        WHERE grades.id = ?
    `;

  db.query(sql, [id], (error, results) => {
    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Grade record not found",
      });
    }

    res.json(results[0]);
  });
});

// ADD GRADE

app.post("/grades", (req, res) => {
  const { studentId, subjectId, marks } = req.body;

  if (!studentId || !subjectId || marks === undefined) {
    return res.status(400).json({
      message: "Student, subject and marks are required",
    });
  }

  if (Number(marks) < 0 || Number(marks) > 100) {
    return res.status(400).json({
      message: "Marks must be between 0 and 100",
    });
  }

  const sql = `
        INSERT INTO grades
        (student_id, subject_id, marks)
        VALUES (?, ?, ?)
    `;

  db.query(sql, [studentId, subjectId, marks], (error, result) => {
    if (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          message: "Grade already exists for this student and subject",
        });
      }

      if (error.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({
          message: "Student or subject does not exist",
        });
      }

      return res.status(500).json({
        error: error.message,
      });
    }

    res.status(201).json({
      message: "Grade added successfully",

      gradeId: result.insertId,
    });
  });
});

// UPDATE GRADE

app.put("/grades/:id", (req, res) => {
  const id = req.params.id;

  const { studentId, subjectId, marks } = req.body;

  if (!studentId || !subjectId || marks === undefined) {
    return res.status(400).json({
      message: "Student, subject and marks are required",
    });
  }

  if (Number(marks) < 0 || Number(marks) > 100) {
    return res.status(400).json({
      message: "Marks must be between 0 and 100",
    });
  }

  const sql = `
        UPDATE grades
        SET
            student_id = ?,
            subject_id = ?,
            marks = ?
        WHERE id = ?
    `;

  db.query(sql, [studentId, subjectId, marks, id], (error, result) => {
    if (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          message: "Grade already exists for this student and subject",
        });
      }

      return res.status(500).json({
        error: error.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Grade record not found",
      });
    }

    res.json({
      message: "Grade updated successfully",
    });
  });
});

// DELETE GRADE

app.delete("/grades/:id", (req, res) => {
  const id = req.params.id;

  const sql = `
        DELETE FROM grades
        WHERE id = ?
    `;

  db.query(sql, [id], (error, result) => {
    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Grade record not found",
      });
    }

    res.json({
      message: "Grade deleted successfully",
    });
  });
});

// ==================================================
// STUDENT PROFILE API
// ==================================================

app.get("/students/:id/profile", (req, res) => {
  const studentId = req.params.id;

  const studentSql = `
            SELECT *
            FROM students
            WHERE id = ?
        `;

  db.query(studentSql, [studentId], (studentError, studentResults) => {
    if (studentError) {
      return res.status(500).json({
        error: studentError.message,
      });
    }

    if (studentResults.length === 0) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const student = studentResults[0];

    const attendanceSql = `
                    SELECT
                        COUNT(*) AS total_classes,

                        SUM(
                            CASE
                                WHEN status = 'Present'
                                THEN 1
                                ELSE 0
                            END
                        ) AS present_classes,

                        SUM(
                            CASE
                                WHEN status = 'Absent'
                                THEN 1
                                ELSE 0
                            END
                        ) AS absent_classes,

                        ROUND(
                            SUM(
                                CASE
                                    WHEN status = 'Present'
                                    THEN 1
                                    ELSE 0
                                END
                            ) * 100.0 /
                            NULLIF(COUNT(*), 0),
                            2
                        ) AS attendance_percentage

                    FROM attendance
                    WHERE student_id = ?
                `;

    const gradesSql = `
                    SELECT
                        COUNT(*) AS total_subjects,
                        ROUND(
                            AVG(marks),
                            2
                        ) AS average_marks

                    FROM grades
                    WHERE student_id = ?
                `;

    const attendanceHistorySql = `
                    SELECT
                        id,
                        date,
                        status
                    FROM attendance
                    WHERE student_id = ?
                    ORDER BY date DESC
                `;

    const gradesHistorySql = `
                    SELECT
                        grades.id,
                        subjects.subject_name,
                        grades.marks
                    FROM grades
                    JOIN subjects
                    ON grades.subject_id = subjects.id
                    WHERE grades.student_id = ?
                    ORDER BY subjects.subject_name
                `;

    db.query(
      attendanceSql,
      [studentId],
      (attendanceError, attendanceResults) => {
        if (attendanceError) {
          return res.status(500).json({
            error: attendanceError.message,
          });
        }

        db.query(gradesSql, [studentId], (gradesError, gradesResults) => {
          if (gradesError) {
            return res.status(500).json({
              error: gradesError.message,
            });
          }

          db.query(
            attendanceHistorySql,
            [studentId],
            (historyError, attendanceHistory) => {
              if (historyError) {
                return res.status(500).json({
                  error: historyError.message,
                });
              }

              db.query(
                gradesHistorySql,
                [studentId],
                (gradeHistoryError, gradeHistory) => {
                  if (gradeHistoryError) {
                    return res.status(500).json({
                      error: gradeHistoryError.message,
                    });
                  }

                  res.json({
                    student: student,

                    attendance: attendanceResults[0],

                    attendanceHistory: attendanceHistory,

                    grades: gradesResults[0],

                    gradeHistory: gradeHistory,
                  });
                },
              );
            },
          );
        });
      },
    );
  });
});

// ==================================================
// START SERVER
// ==================================================

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

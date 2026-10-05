const express = require("express");
const cors = require("cors");

const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());



app.get("/", (req, res) => {

    res.json({
        message: "Students Management API is running"
    });

});


app.get("/students", (req, res) => {

    const sql = "SELECT * FROM students";

    db.query(sql, (error, results) => {

        if (error) {

            return res.status(500).json({
                error: error.message
            });

        }

        res.json(results);

    });

});



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
                error: error.message
            });

        }

        if (results.length === 0) {

            return res.status(404).json({
                message: "Student not found"
            });

        }

        res.json(results[0]);

    });

});



app.post("/students", (req, res) => {

    const {
        name,
        age,
        gender,
        studentClass,
        section,
        email,
        phone
    } = req.body;

    const sql = `
        INSERT INTO students
        (name, age, gender, class, section, email, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        name,
        age,
        gender,
        studentClass,
        section,
        email,
        phone
    ];

    db.query(sql, values, (error, result) => {

        if (error) {

            return res.status(500).json({
                error: error.message
            });

        }

        res.status(201).json({

            message: "Student added successfully",

            studentId: result.insertId

        });

    });

});


app.put("/students/:id", (req, res) => {

    const id = req.params.id;

    const {
        name,
        age,
        gender,
        studentClass,
        section,
        email,
        phone
    } = req.body;

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

    const values = [
        name,
        age,
        gender,
        studentClass,
        section,
        email,
        phone,
        id
    ];

    db.query(sql, values, (error, result) => {

        if (error) {

            return res.status(500).json({
                error: error.message
            });

        }

        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Student not found"
            });

        }

        res.json({
            message: "Student updated successfully"
        });

    });

});


app.delete("/students/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
        DELETE FROM students
        WHERE id = ?
    `;

    db.query(sql, [id], (error, result) => {

        if (error) {

            return res.status(500).json({
                error: error.message
            });

        }

        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Student not found"
            });

        }

        res.json({
            message: "Student deleted successfully"
        });

    });

});

const PORT = 3000;

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});
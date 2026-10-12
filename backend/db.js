const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "2448",
  database: "students_management",
});

db.connect((error) => {
  if (error) {
    console.log("MySQL connection failed");
    console.log(error.message);
    return;
  }

  console.log("MySQL connected successfully");
});

module.exports = db;

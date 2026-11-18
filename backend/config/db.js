import "./env.js";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 4000,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // TiDB Cloud requires TLS. Keep certificate verification enabled.
  ssl: { minVersion: "TLSv1.2" },
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

export async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.ping();
    console.log("TiDB connected successfully");
  } finally {
    if (connection) connection.release();
  }
}

export default pool;

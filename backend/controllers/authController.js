import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

// Placeholder: checks the single admin account from application.env.
// Replace with a users table + bcrypt when you need real accounts.
export function login(req, res) {
  const { username, password } = req.body;

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    throw new AppError("Invalid username or password", 401);
  }

  const token = jwt.sign({ username, role: "Admin" }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({ token, role: "Admin" });
}

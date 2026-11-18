import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

export function protect(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    throw new AppError("Authentication required", 401);
  }

  try {
    req.user = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }

  next();
}

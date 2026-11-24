import AppError from "./AppError.js";

export function dbError(error, messages) {
  const message = messages[error.code];

  return message ? new AppError(message, 400) : error;
}

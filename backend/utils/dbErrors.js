import AppError from "./AppError.js";

// Turn known MySQL error codes into friendly 400 errors.
// Anything not listed is returned unchanged (becomes a 500).
//
//   throw dbError(error, { ER_DUP_ENTRY: "Email already exists" });
export function dbError(error, messages) {
  const message = messages[error.code];

  return message ? new AppError(message, 400) : error;
}

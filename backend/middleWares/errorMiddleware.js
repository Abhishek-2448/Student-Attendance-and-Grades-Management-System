export function notFound(req, res) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

// Express 5 forwards errors thrown in async handlers here automatically.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;

  if (status === 500) {
    console.error(err);
  }

  const hideDetails =
    status === 500 && process.env.NODE_ENV === "production";

  res.status(status).json({
    message: hideDetails ? "Internal server error" : err.message,
  });
}

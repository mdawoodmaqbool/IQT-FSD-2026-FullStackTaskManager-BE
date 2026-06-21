export function notFoundHandler(_req, res) {
  res.status(404).json({ message: "Route not found" });
}

export function errorHandler(err, _req, res, _next) {
  console.error(err);

  if (err.status) {
    return res.status(err.status).json({ message: err.message });
  }

  if (err.code && typeof err.code === "string" && err.code.startsWith("P")) {
    return res.status(503).json({
      message: "Database is unavailable. Please try again later.",
    });
  }

  const message =
    err?.message && !String(err.message).includes("Cannot read properties")
      ? err.message
      : "Something went wrong. Please try again.";

  res.status(500).json({ message });
}

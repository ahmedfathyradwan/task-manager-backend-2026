export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((validationError) => validationError.message)
      .join(", ");

    return res.status(400).json({ message });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid task id" });
  }

  console.error(err);

  res.status(500).json({ message: "Internal server error" });
};

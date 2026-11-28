import { HttpError } from "../utils/httpError.js";

export const notFound = (req, res) => {
  res.status(404).json({
    code: "NOT_FOUND",
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof HttpError) {
    return res
      .status(err.status)
      .json({ code: err.code, message: err.message });
  }

  if (err?.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((validationError) => validationError.message)
      .join(", ");
    return res.status(400).json({ code: "VALIDATION", message });
  }

  if (err?.name === "CastError") {
    return res.status(400).json({ code: "VALIDATION", message: "Invalid identifier." });
  }

  if (err?.type === "entity.parse.failed") {
    return res
      .status(400)
      .json({ code: "VALIDATION", message: "Malformed JSON body." });
  }

  if (err?.message?.startsWith("CORS blocked")) {
    return res
      .status(403)
      .json({ code: "FORBIDDEN", message: "Origin is not allowed." });
  }

  console.error(err);

  res.status(500).json({
    code: "SERVER_ERROR",
    message: "Something went wrong on the server.",
  });
};

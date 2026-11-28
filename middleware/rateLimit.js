import { HttpError } from "../utils/httpError.js";

export const createRateLimiter = ({ windowMs, max, scope }) => {
  const hits = new Map();

  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, windowMs);
  sweep.unref?.();

  return (req, res, next) => {
    const key = `${scope}:${req.ip}`;
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count += 1;

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      return next(
        new HttpError(
          429,
          "RATE_LIMITED",
          "Too many attempts. Please try again in a few minutes."
        )
      );
    }

    next();
  };
};

import { HttpError, unauthorized, forbidden } from "../utils/httpError.js";
import {
  SESSION_COOKIE,
  clearSessionCookie,
  verifySession,
} from "../utils/session.js";
import User from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.[SESSION_COOKIE];

    if (!token) {
      throw unauthorized();
    }

    let payload;
    try {
      payload = verifySession(token);
    } catch {
      clearSessionCookie(res);
      throw unauthorized("Your session has expired. Please sign in again.");
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      clearSessionCookie(res);
      throw unauthorized("Your session is no longer valid.");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return next(forbidden("Administrator access is required."));
  }
  next();
};

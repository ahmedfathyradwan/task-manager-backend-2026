import bcrypt from "bcryptjs";
import User from "../models/User.js";
import {
  isFourDigitPassword,
  isValidPhone,
  normalizePhone,
  normalizeName,
} from "../utils/validation.js";
import { badRequest, HttpError } from "../utils/httpError.js";
import {
  clearSessionCookie,
  setSessionCookie,
  signSession,
} from "../utils/session.js";

// Constant-time-ish comparison target so unknown phones take similar time.
const DUMMY_HASH = bcrypt.hashSync("0000", 10);
const BCRYPT_ROUNDS = 10;

export const register = async (req, res, next) => {
  try {
    const fullName = normalizeName(req.body?.fullName);
    const phone = normalizePhone(req.body?.phone);
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (fullName.length < 2 || fullName.length > 80) {
      throw badRequest(
        "VALIDATION",
        "Full name must be between 2 and 80 characters."
      );
    }

    if (!isValidPhone(phone)) {
      throw badRequest("VALIDATION", "Phone number must contain 8 to 15 digits.");
    }

    if (!isFourDigitPassword(password)) {
      throw badRequest("VALIDATION", "Password must be exactly 4 digits.");
    }

    if (await User.exists({ phone })) {
      throw new HttpError(409, "PHONE_TAKEN", "This phone number is already registered.");
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Role is assigned here on the server only; any client-sent role is ignored.
    const user = await User.create({
      fullName,
      phone,
      passwordHash,
      role: "user",
    });

    setSessionCookie(res, signSession(user._id));
    res.status(201).json({ user });
  } catch (error) {
    if (error?.code === 11000) {
      return next(
        new HttpError(409, "PHONE_TAKEN", "This phone number is already registered.")
      );
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body?.phone);
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    const user = isValidPhone(phone)
      ? await User.findOne({ phone }).select("+passwordHash")
      : null;

    if (!user) {
      await bcrypt.compare(password, DUMMY_HASH);
      throw new HttpError(
        401,
        "INVALID_CREDENTIALS",
        "Incorrect phone number or password."
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new HttpError(
        401,
        "INVALID_CREDENTIALS",
        "Incorrect phone number or password."
      );
    }

    setSessionCookie(res, signSession(user._id));
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  clearSessionCookie(res);
  res.status(200).json({ message: "Signed out." });
};

export const me = async (req, res) => {
  res.status(200).json({ user: req.user });
};

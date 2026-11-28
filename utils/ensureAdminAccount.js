import bcrypt from "bcryptjs";
import User from "../models/User.js";
import {
  isFourDigitPassword,
  isValidPhone,
  normalizePhone,
} from "./validation.js";

/**
 * The single administrator is provisioned from server-side environment
 * variables only. Registration always creates regular users, so the role
 * can never be chosen from the client.
 */
export const ensureAdminAccount = async () => {
  const phone = normalizePhone(process.env.ADMIN_PHONE || "");
  const password = process.env.ADMIN_PASSWORD || "";
  const fullName = (process.env.ADMIN_NAME || "").trim();

  if (!phone || !password || !fullName) {
    console.warn(
      "Admin account not configured. Set ADMIN_NAME, ADMIN_PHONE and ADMIN_PASSWORD to provision it."
    );
    return;
  }

  if (!isValidPhone(phone) || !isFourDigitPassword(password)) {
    throw new Error(
      "Invalid admin credentials: ADMIN_PHONE must be a valid Egyptian number (11 digits starting with 010, 011, 012 or 015) and ADMIN_PASSWORD exactly 4 digits."
    );
  }

  if (fullName.length < 2 || fullName.length > 80) {
    throw new Error("Invalid admin credentials: ADMIN_NAME must be 2-80 characters.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await User.findOne({ phone }).select("+passwordHash");

  let admin;
  if (!existing) {
    admin = await User.create({
      fullName,
      phone,
      passwordHash,
      role: "admin",
    });
    console.log(`Administrator account created for phone ${phone}.`);
  } else {
    existing.fullName = fullName;
    existing.passwordHash = passwordHash;
    existing.role = "admin";
    admin = await existing.save();
    console.log(`Administrator account synchronized for phone ${phone}.`);
  }

  const demoted = await User.updateMany(
    { role: "admin", _id: { $ne: admin._id } },
    { $set: { role: "user" } }
  );

  if (demoted.modifiedCount > 0) {
    console.log(`Demoted ${demoted.modifiedCount} extra admin account(s).`);
  }
};

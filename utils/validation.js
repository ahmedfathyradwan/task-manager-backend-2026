const ARABIC_INDIC = /[\u0660-\u0669]/g;
const EXTENDED_ARABIC_INDIC = /[\u06F0-\u06F9]/g;

const toLatinDigits = (value) =>
  String(value)
    .replace(ARABIC_INDIC, (ch) => String(ch.charCodeAt(0) - 0x0660))
    .replace(EXTENDED_ARABIC_INDIC, (ch) => String(ch.charCodeAt(0) - 0x06f0));

export const normalizeDigits = (value) =>
  typeof value === "string" ? toLatinDigits(value).trim() : "";

export const normalizePhone = (value) => {
  if (typeof value !== "string") return "";
  let phone = toLatinDigits(value).replace(/\D/g, "");
  if (phone.startsWith("0020") && phone.length >= 14) phone = phone.slice(4);
  else if (phone.startsWith("20") && phone.length >= 12) phone = phone.slice(2);
  if (phone.length === 10 && phone.startsWith("1")) phone = `0${phone}`;
  return phone.slice(0, 11);
};

export const isValidPhone = (phone) => /^01[0125]\d{8}$/.test(phone);

export const isFourDigitPassword = (value) =>
  typeof value === "string" && /^\d{4}$/.test(value);

export const normalizeName = (value) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";

export const cleanText = (value, max) => {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length > max ? null : text;
};

export const isDateString = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

export const isTimeString = (value) =>
  typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export const isValidObjectId = (value) =>
  typeof value === "string" && /^[a-f\d]{24}$/i.test(value);

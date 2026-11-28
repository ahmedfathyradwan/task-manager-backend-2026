import jwt from "jsonwebtoken";

export const SESSION_COOKIE = "tm_session";
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const isProduction = () => process.env.NODE_ENV === "production";

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET must be defined in the environment and be at least 32 characters long."
    );
  }
  return secret;
};

export const signSession = (userId) =>
  jwt.sign({ sub: String(userId) }, getJwtSecret(), {
    expiresIn: "30d",
    issuer: "task-manager",
  });

const cookieBase = () => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: isProduction() ? "none" : "lax",
  path: "/",
});

export const setSessionCookie = (res, token) => {
  res.cookie(SESSION_COOKIE, token, {
    ...cookieBase(),
    maxAge: SESSION_MAX_AGE_MS,
  });
};

export const clearSessionCookie = (res) => {
  res.clearCookie(SESSION_COOKIE, cookieBase());
};

export const verifySession = (token) =>
  jwt.verify(token, getJwtSecret(), { issuer: "task-manager" });

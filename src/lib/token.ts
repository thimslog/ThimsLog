import crypto from "crypto";

/** Returns { rawToken, hashedToken, expiresAt } */
export const generateVerificationToken = (minutes = 60) => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * minutes);

  return { rawToken, hashedToken, expiresAt };
};

export const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

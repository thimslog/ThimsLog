import jwt from "jsonwebtoken";

const JWT_SECRET = process.env?.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

export interface AuthTokenPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
}

export function generateToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, JWT_SECRET!, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET!) as AuthTokenPayload;
}

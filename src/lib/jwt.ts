import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type AdminPayload = {
  adminId: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  role: string;
};

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
const JWT_LIFETIME = process.env.JWT_LIFETIME ?? "1d";
export const COOKIE_NAME = "admin_auth_token";

export const createTokenAdmin = (admin: {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  role: string;
}): AdminPayload => ({
  adminId: admin.id,
  firstName: admin.firstName,
  lastName: admin.lastName,
  userName: admin.userName,
  email: admin.email,
  role: admin.role,
});

export const createAdminJWT = async (payload: AdminPayload) =>
  new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_LIFETIME)
    .sign(secret);

export const verifyAdminJWT = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AdminPayload;
  } catch {
    return null;
  }
};

/** Read the logged-in admin inside route handlers / server components */
export const getCurrentAdmin = async (): Promise<AdminPayload | null> => {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminJWT(token);
};

export const setAdminCookie = async (token: string) => {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });
};

export const clearAdminCookie = async () => {
  const store = await cookies();
  store.delete(COOKIE_NAME);
};
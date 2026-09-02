import bcrypt from "bcryptjs";

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (plain: string, hashed: string) => {
  if (!hashed) return false; // admin hasn't set a password yet
  return bcrypt.compare(plain, hashed);
};
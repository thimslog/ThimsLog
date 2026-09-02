import { z } from "zod";

export const signupAdminSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email"),
  phoneNumber: z.string().optional(),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]).optional(),
});

export const setPasswordSchema = z
  .object({
    email: z.string().email("Invalid email"),
    token: z.string().min(1, "Token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const signinSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const resendSchema = z.object({
  email: z.string().email("Invalid email"),
});
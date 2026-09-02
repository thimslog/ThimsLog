"use client";

import { Check, X } from "lucide-react";

export interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

export const passwordRequirements: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  { label: "One symbol", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function passwordMeetsRequirements(password: string): boolean {
  return passwordRequirements.every((r) => r.test(password));
}

export function PasswordRequirements({ password }: { password: string }) {
  return (
    <ul className="grid grid-cols-2 gap-1.5 mt-2.5">
      {passwordRequirements.map((req) => {
        const met = req.test(password);
        return (
          <li
            key={req.label}
            className={`flex items-center gap-1.5 text-[11.5px] ${
              met ? "text-good" : "text-ink-faint"
            }`}
          >
            {met ? <Check size={12} /> : <X size={12} />}
            {req.label}
          </li>
        );
      })}
    </ul>
  );
}

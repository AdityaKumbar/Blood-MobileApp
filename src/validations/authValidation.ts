import { z } from "zod";

import { bloodGroups } from "../constants/bloodGroups";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10,14}$/;
const identifierSchema = z
  .string()
  .trim()
  .min(1, "Enter email")
  .refine((value) => emailRegex.test(value), {
    message: "Enter a valid email address"
  });

export const loginSchema = z.object({
  identifier: identifierSchema,
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const registerSchema = z.object({
  name: z.string().trim().min(3, "Name should be at least 3 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Phone number should be 10 to 14 digits"),
  bloodGroup: z
    .string()
    .trim()
    .refine((value) => bloodGroups.includes(value as (typeof bloodGroups)[number]), {
      message: "Please select a blood group"
    }),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export const forgotPasswordSchema = z.object({
  identifier: identifierSchema
});

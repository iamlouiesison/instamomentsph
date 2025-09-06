import { z } from "zod";

// Sign in validation schema
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email ay kailangan")
    .email("Pakisuyo, maglagay ng wastong email address"),
  password: z
    .string()
    .min(1, "Password ay kailangan")
    .min(6, "Password ay dapat hindi bababa sa 6 na karakter"),
});

// Sign up validation schema
export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Buong pangalan ay kailangan")
      .min(2, "Buong pangalan ay dapat hindi bababa sa 2 na karakter")
      .max(100, "Buong pangalan ay dapat hindi hihigit sa 100 na karakter"),
    email: z
      .string()
      .min(1, "Email ay kailangan")
      .email("Pakisuyo, maglagay ng wastong email address"),
    password: z
      .string()
      .min(1, "Password ay kailangan")
      .min(8, "Password ay dapat hindi bababa sa 8 na karakter")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password ay dapat may maliit na titik, malaking titik, at numero",
      ),
    confirmPassword: z.string().min(1, "Kumpirmahin ang password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Ang mga password ay hindi magkatugma",
    path: ["confirmPassword"],
  });

// Reset password validation schema
export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email ay kailangan")
    .email("Pakisuyo, maglagay ng wastong email address"),
});

// Update password validation schema
export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Kasalukuyang password ay kailangan"),
    newPassword: z
      .string()
      .min(1, "Bagong password ay kailangan")
      .min(8, "Bagong password ay dapat hindi bababa sa 8 na karakter")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Bagong password ay dapat may maliit na titik, malaking titik, at numero",
      ),
    confirmNewPassword: z.string().min(1, "Kumpirmahin ang bagong password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Ang mga bagong password ay hindi magkatugma",
    path: ["confirmNewPassword"],
  });

// Profile update validation schema
export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(1, "Buong pangalan ay kailangan")
    .min(2, "Buong pangalan ay dapat hindi bababa sa 2 na karakter")
    .max(100, "Buong pangalan ay dapat hindi hihigit sa 100 na karakter"),
  phoneNumber: z
    .string()
    .optional()
    .refine((val) => !val || /^(\+63|0)?[0-9]{10}$/.test(val), {
      message: "Pakisuyo, maglagay ng wastong Philippine phone number",
    }),
});

// Complete profile validation schema (for new users)
export const completeProfileSchema = z.object({
  fullName: z
    .string()
    .min(1, "Buong pangalan ay kailangan")
    .min(2, "Buong pangalan ay dapat hindi bababa sa 2 na karakter")
    .max(100, "Buong pangalan ay dapat hindi hihigit sa 100 na karakter"),
  phoneNumber: z
    .string()
    .optional()
    .refine((val) => !val || /^(\+63|0)?[0-9]{10}$/.test(val), {
      message: "Pakisuyo, maglagay ng wastong Philippine phone number",
    }),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;

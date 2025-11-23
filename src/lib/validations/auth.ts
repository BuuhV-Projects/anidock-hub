import { z } from 'zod';

export const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email é obrigatório" })
    .email({ message: "Email inválido" })
    .max(255, { message: "Email deve ter no máximo 255 caracteres" })
});

export const passwordSchema = z
  .string()
  .min(6, { message: "Senha deve ter no mínimo 6 caracteres" })
  .max(100, { message: "Senha deve ter no máximo 100 caracteres" });

export const signInSchema = z.object({
  email: emailSchema.shape.email,
  password: passwordSchema
});

export const signUpSchema = z.object({
  email: emailSchema.shape.email,
  password: passwordSchema,
  confirmPassword: passwordSchema
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export const resetPasswordSchema = emailSchema;

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
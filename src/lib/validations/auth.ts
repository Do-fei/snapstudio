import { z } from "zod";

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "请输入邮箱地址" })
    .email({ message: "请输入有效的邮箱地址" }),
  password: z
    .string()
    .min(1, { message: "请输入密码" })
    .min(6, { message: "密码至少需要 6 个字符" }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Registration form validation schema
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "请输入邮箱地址" })
      .email({ message: "请输入有效的邮箱地址" }),
    password: z
      .string()
      .min(1, { message: "请输入密码" })
      .min(6, { message: "密码至少需要 6 个字符" })
      .regex(/[a-zA-Z]/, { message: "密码必须包含至少一个字母" })
      .regex(/[0-9]/, { message: "密码必须包含至少一个数字" }),
    confirmPassword: z.string().min(1, { message: "请确认密码" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Forgot password form validation schema
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "请输入邮箱地址" })
    .email({ message: "请输入有效的邮箱地址" }),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Update password form validation schema
 */
export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, { message: "请输入新密码" })
      .min(6, { message: "密码至少需要 6 个字符" })
      .regex(/[a-zA-Z]/, { message: "密码必须包含至少一个字母" })
      .regex(/[0-9]/, { message: "密码必须包含至少一个数字" }),
    confirmPassword: z.string().min(1, { message: "请确认新密码" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

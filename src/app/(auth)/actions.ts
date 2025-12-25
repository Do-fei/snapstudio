"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

/**
 * Sign up with email and password
 */
export async function signUp(formData: FormData) {
  const supabase = createClient();
  const origin = headers().get("origin");

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "请检查您的邮箱以完成注册验证" };
}

/**
 * Sign in with email and password
 */
export async function signIn(formData: FormData) {
  const supabase = createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message === "Invalid login credentials") {
      return { error: "邮箱或密码错误" };
    }
    if (error.message === "Email not confirmed") {
      return { error: "请先验证您的邮箱地址" };
    }
    return { error: error.message };
  }

  redirect("/");
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/**
 * Request password reset
 */
export async function resetPasswordRequest(formData: FormData) {
  const supabase = createClient();
  const origin = headers().get("origin");

  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/update-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "如果该邮箱已注册，您将收到密码重置链接" };
}

/**
 * Update password (after clicking reset link)
 */
export async function updatePassword(formData: FormData) {
  const supabase = createClient();

  const password = formData.get("password") as string;

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "密码已更新成功" };
}

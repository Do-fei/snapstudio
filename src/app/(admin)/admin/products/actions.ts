"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveProduct(productId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("products")
    .update({
      status: "approved",
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/browse");
  return { success: true };
}

export async function rejectProduct(productId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("products")
    .update({
      status: "rejected",
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteProduct(productId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  return { success: true };
}

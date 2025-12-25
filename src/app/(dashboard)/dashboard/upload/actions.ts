"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Generate slug from title
function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fa5-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
      .substring(0, 100) +
    "-" +
    Date.now().toString(36)
  );
}

interface Split {
  collaboratorEmail: string;
  percentage: number;
}

export async function createProduct(formData: FormData) {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "请先登录" };
  }

  // Parse form data
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const category = formData.get("category") as string;
  const coverImage = formData.get("cover_image") as string;
  const fileUrl = formData.get("file_url") as string;
  const splitsJson = formData.get("splits") as string;

  // Validate required fields
  if (!title || !price || !fileUrl) {
    return { error: "请填写所有必填字段" };
  }

  if (price < 0) {
    return { error: "价格不能为负数" };
  }

  // Parse splits
  let splits: Split[] = [];
  if (splitsJson) {
    try {
      splits = JSON.parse(splitsJson);
    } catch {
      return { error: "分账设置格式错误" };
    }
  }

  // Validate splits total percentage
  const totalPercentage = splits.reduce((sum, s) => sum + s.percentage, 0);
  if (totalPercentage > 100) {
    return { error: "分账比例总和不能超过 100%" };
  }

  // Generate slug
  const slug = generateSlug(title);

  // Create product
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      creator_id: user.id,
      title,
      slug,
      description: description || null,
      price,
      category: category || null,
      cover_image: coverImage || null,
      file_url: fileUrl,
      status: "pending", // Requires admin approval
    })
    .select("id")
    .single();

  if (productError) {
    return { error: "创建作品失败: " + productError.message };
  }

  // Create splits if any
  if (splits.length > 0) {
    // First, add creator's split if not 100% allocated
    const creatorPercentage = 100 - totalPercentage;
    
    const splitRecords = [];

    // Add creator's split
    if (creatorPercentage > 0) {
      splitRecords.push({
        product_id: product.id,
        collaborator_id: user.id,
        percentage: creatorPercentage,
      });
    }

    // Add collaborator splits
    for (const split of splits) {
      // Find collaborator by email
      const { data: collaborator } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", split.collaboratorEmail)
        .single();

      if (collaborator) {
        splitRecords.push({
          product_id: product.id,
          collaborator_id: collaborator.id,
          percentage: split.percentage,
        });
      }
    }

    if (splitRecords.length > 0) {
      await supabase.from("splits").insert(splitRecords);
    }
  } else {
    // No splits, creator gets 100%
    await supabase.from("splits").insert({
      product_id: product.id,
      collaborator_id: user.id,
      percentage: 100,
    });
  }

  // Update user role to creator if not already
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile && profile.role === "user") {
    await supabase
      .from("profiles")
      .update({ role: "creator" })
      .eq("id", user.id);
  }

  revalidatePath("/dashboard/products");
  revalidatePath("/admin/products");

  return { success: true, productId: product.id };
}

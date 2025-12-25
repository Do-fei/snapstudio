"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 100) + "-" + Date.now().toString(36);
}

export async function createPost(formData: FormData) {
  const supabase = createClient();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const coverImage = formData.get("cover_image") as string;
  const isPublished = formData.get("is_published") === "true";

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "未授权" };
  }

  const slug = generateSlug(title);

  const { error } = await supabase.from("posts").insert({
    title,
    slug,
    content,
    excerpt: excerpt || null,
    cover_image: coverImage || null,
    author_id: user.id,
    is_published: isPublished,
    published_at: isPublished ? new Date().toISOString() : null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}

export async function updatePost(postId: string, formData: FormData) {
  const supabase = createClient();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const coverImage = formData.get("cover_image") as string;
  const isPublished = formData.get("is_published") === "true";

  // Get current post to check if publishing status changed
  const { data: currentPost } = await supabase
    .from("posts")
    .select("is_published")
    .eq("id", postId)
    .single();

  const updateData: Record<string, unknown> = {
    title,
    content,
    excerpt: excerpt || null,
    cover_image: coverImage || null,
    is_published: isPublished,
    updated_at: new Date().toISOString(),
  };

  // Set published_at if publishing for the first time
  if (isPublished && !currentPost?.is_published) {
    updateData.published_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("posts")
    .update(updateData)
    .eq("id", postId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}

export async function deletePost(postId: string) {
  const supabase = createClient();

  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}

export async function togglePostStatus(postId: string, isPublished: boolean) {
  const supabase = createClient();

  const updateData: Record<string, unknown> = {
    is_published: isPublished,
    updated_at: new Date().toISOString(),
  };

  if (isPublished) {
    updateData.published_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("posts")
    .update(updateData)
    .eq("id", postId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}

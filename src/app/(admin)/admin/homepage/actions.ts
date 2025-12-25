"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { HomepageSettings } from "@/types/database";

// Default settings ID (single row)
const SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

// Default settings values
const DEFAULT_SETTINGS: Omit<HomepageSettings, "id" | "updated_at" | "updated_by"> = {
  hero_title_line1: "探索前沿的",
  hero_title_line2: "AI创作灵感",
  hero_subtitle: "SnapStudio 连接创作者与收藏家，让每一件数字艺术作品都能找到它的归属。公平分账，透明交易。",
  hero_button_primary_text: "开始浏览",
  hero_button_primary_link: "/browse",
  hero_button_secondary_text: "成为创作者",
  hero_button_secondary_link: "/register",
  cta_title: "准备好分享你的作品了吗？",
  cta_subtitle: "加入 SnapStudio，与全球创作者一起，将你的数字艺术作品带给更多人。我们只收取 10% 的平台费用。",
  cta_button_text: "立即注册",
  cta_button_link: "/register",
  section_top_rated_title: "高分榜单",
  section_latest_title: "最新上架",
  section_blog_title: "最新动态",
};

export async function getHomepageSettings(): Promise<HomepageSettings> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("homepage_settings")
    .select("*")
    .eq("id", SETTINGS_ID)
    .single();

  if (error || !data) {
    // Return default settings if not found
    return {
      id: SETTINGS_ID,
      ...DEFAULT_SETTINGS,
      updated_at: new Date().toISOString(),
      updated_by: null,
    };
  }

  return data as HomepageSettings;
}

export async function updateHomepageSettings(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "未登录" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { success: false, error: "无权限" };
  }

  // Extract form data
  const settings = {
    hero_title_line1: formData.get("hero_title_line1") as string,
    hero_title_line2: formData.get("hero_title_line2") as string,
    hero_subtitle: formData.get("hero_subtitle") as string,
    hero_button_primary_text: formData.get("hero_button_primary_text") as string,
    hero_button_primary_link: formData.get("hero_button_primary_link") as string,
    hero_button_secondary_text: formData.get("hero_button_secondary_text") as string,
    hero_button_secondary_link: formData.get("hero_button_secondary_link") as string,
    cta_title: formData.get("cta_title") as string,
    cta_subtitle: formData.get("cta_subtitle") as string,
    cta_button_text: formData.get("cta_button_text") as string,
    cta_button_link: formData.get("cta_button_link") as string,
    section_top_rated_title: formData.get("section_top_rated_title") as string,
    section_latest_title: formData.get("section_latest_title") as string,
    section_blog_title: formData.get("section_blog_title") as string,
    updated_by: user.id,
  };

  // Try to update existing row
  const { error: updateError } = await supabase
    .from("homepage_settings")
    .update(settings)
    .eq("id", SETTINGS_ID);

  if (updateError) {
    // If update fails, try to insert
    const { error: insertError } = await supabase
      .from("homepage_settings")
      .insert({ id: SETTINGS_ID, ...settings });

    if (insertError) {
      return { success: false, error: insertError.message };
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/homepage");

  return { success: true };
}

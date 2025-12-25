import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostForm } from "../post-form";

interface EditPostPageProps {
  params: {
    id: string;
  };
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const supabase = createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, content, cover_image, is_published")
    .eq("id", params.id)
    .single();

  if (!post) {
    notFound();
  }

  return <PostForm post={post} />;
}

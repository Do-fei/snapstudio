import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Calendar } from "lucide-react";
import { DEMO_POSTS, IS_DEMO_MODE } from "@/lib/demo-data";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
  profiles?: {
    display_name: string | null;
  } | null;
  author?: {
    display_name: string | null;
  };
}

export const metadata = {
  title: "博客 - SnapStudio",
  description: "阅读 SnapStudio 的最新动态、公告和创作者故事。",
};

export default async function BlogPage() {
  let posts: Post[] = [];

  if (IS_DEMO_MODE) {
    // Use demo data
    posts = DEMO_POSTS.filter(p => p.is_published).map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      cover_image: p.cover_image,
      published_at: p.published_at,
      profiles: { display_name: p.author.display_name },
      author: p.author,
    }));
  } else {
    const supabase = createClient();

    const { data } = await supabase
      .from("posts")
      .select(`
        id, title, slug, excerpt, cover_image, published_at,
        profiles!posts_author_id_fkey(display_name)
      `)
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    posts = (data as unknown as Post[]) || [];
  }

  return (
    <div className="container py-12">
      {/* Demo Mode Banner */}
      {IS_DEMO_MODE && (
        <div className="bg-blue-100 text-blue-800 rounded-lg p-4 mb-6 text-sm">
          💡 演示模式：展示 {posts.length} 篇示例博客文章
        </div>
      )}

      {/* Header */}
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">博客</h1>
        <p className="text-lg text-muted-foreground">
          阅读 SnapStudio 的最新动态、公告和创作者故事。
        </p>
      </div>

      {/* Posts Grid */}
      {posts && posts.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">暂无文章</h3>
          <p className="text-muted-foreground">
            敬请期待我们的第一篇文章
          </p>
        </div>
      )}
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const authorName = post.author?.display_name || post.profiles?.display_name || "SnapStudio";

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
        <div className="aspect-[16/9] relative bg-muted">
          {post.cover_image ? (
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Calendar className="h-4 w-4" />
            {post.published_at
              ? new Date(post.published_at).toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : ""}
          </div>
          <h2 className="text-xl font-semibold mb-2 line-clamp-2">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
          )}
          <p className="text-sm text-muted-foreground mt-4">
            作者: {authorName}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

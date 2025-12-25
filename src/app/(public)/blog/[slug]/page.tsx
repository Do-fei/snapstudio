import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, User, Sparkles } from "lucide-react";
import { DEMO_POSTS, IS_DEMO_MODE } from "@/lib/demo-data";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  if (IS_DEMO_MODE) {
    const post = DEMO_POSTS.find(p => p.slug === params.slug && p.is_published);
    if (!post) {
      return { title: "文章未找到 - SnapStudio" };
    }
    return {
      title: `${post.title} - SnapStudio`,
      description: post.excerpt || `阅读 ${post.title}`,
    };
  }

  const supabase = createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (!post) {
    return {
      title: "文章未找到 - SnapStudio",
    };
  }

  return {
    title: `${post.title} - SnapStudio`,
    description: post.excerpt || `阅读 ${post.title}`,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  let post: {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    cover_image: string | null;
    published_at: string | null;
    updated_at: string;
    author?: {
      display_name: string | null;
      avatar_url: string | null;
    };
    profiles?: {
      display_name: string | null;
      avatar_url: string | null;
    } | null;
  } | null = null;

  if (IS_DEMO_MODE) {
    const demoPost = DEMO_POSTS.find(p => p.slug === params.slug && p.is_published);
    if (demoPost) {
      post = {
        id: demoPost.id,
        title: demoPost.title,
        slug: demoPost.slug,
        content: demoPost.content,
        excerpt: demoPost.excerpt,
        cover_image: demoPost.cover_image,
        published_at: demoPost.published_at,
        updated_at: demoPost.updated_at,
        author: demoPost.author,
      };
    }
  } else {
    const supabase = createClient();

    const { data } = await supabase
      .from("posts")
      .select(`
        id, title, slug, content, excerpt, cover_image, published_at, updated_at,
        profiles!posts_author_id_fkey(display_name, avatar_url)
      `)
      .eq("slug", params.slug)
      .eq("is_published", true)
      .single();

    if (data) {
      post = {
        ...data,
        profiles: data.profiles as unknown as { display_name: string | null; avatar_url: string | null } | null,
      };
    }
  }

  if (!post) {
    notFound();
  }

  // Get author info
  const author = post.author || post.profiles;
  const authorName = author?.display_name || "SnapStudio";

  // Simple markdown to HTML conversion (basic)
  const renderContent = (content: string) => {
    // Convert markdown-like content to HTML
    let html = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>')
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 italic my-4">$1</blockquote>')
      // Unordered lists
      .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
      // Paragraphs (double newline)
      .replace(/\n\n/g, '</p><p class="mb-4">')
      // Single newlines within paragraphs
      .replace(/\n/g, '<br />');

    // Wrap in paragraph
    html = '<p class="mb-4">' + html + '</p>';

    // Fix list items
    html = html.replace(/(<li.*?<\/li>)+/g, '<ul class="list-disc my-4">$&</ul>');

    return html;
  };

  return (
    <article className="container py-12">
      {/* Demo Mode Banner */}
      {IS_DEMO_MODE && (
        <div className="bg-blue-100 text-blue-800 rounded-lg p-4 mb-6 text-sm max-w-3xl mx-auto">
          💡 演示模式：这是一篇示例博客文章
        </div>
      )}

      {/* Back Button */}
      <Button variant="ghost" className="mb-8" asChild>
        <Link href="/blog">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回博客
        </Link>
      </Button>

      {/* Header */}
      <header className="max-w-3xl mx-auto mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">{post.title}</h1>
        
        {post.excerpt && (
          <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
        )}

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {authorName}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {post.published_at
              ? new Date(post.published_at).toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : ""}
          </div>
        </div>
      </header>

      {/* Cover Image */}
      {post.cover_image && (
        <div className="max-w-4xl mx-auto mb-12">
          <div className="aspect-[21/9] relative rounded-lg overflow-hidden bg-muted">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-3xl mx-auto">
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
        />

        <Separator className="my-12" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              {author?.avatar_url ? (
                <Image
                  src={author.avatar_url}
                  alt={authorName}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium">{authorName}</p>
              <p className="text-sm text-muted-foreground">作者</p>
            </div>
          </div>

          <Button variant="outline" asChild>
            <Link href="/blog">
              <Sparkles className="mr-2 h-4 w-4" />
              阅读更多文章
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

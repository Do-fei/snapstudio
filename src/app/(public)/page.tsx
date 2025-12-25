import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Star, Sparkles } from "lucide-react";
import { 
  DEMO_PRODUCTS, 
  DEMO_POSTS, 
  DEMO_HOMEPAGE_SETTINGS,
  IS_DEMO_MODE 
} from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/server";
import { HomepageSettings } from "@/types/database";

// Type definitions for database results
interface ProductData {
  id: string;
  title: string;
  slug: string;
  cover_image: string | null;
  price: number;
  avg_rating: number;
  rating_count: number;
  creator_name?: string | null;
  profiles?: {
    display_name: string | null;
  }[] | {
    display_name: string | null;
  } | null;
}

interface PostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
}

// Default settings values
const DEFAULT_SETTINGS: Omit<HomepageSettings, "id" | "updated_at" | "updated_by"> = {
  hero_title_line1: "每一个创意都值得被尊重",
  hero_title_line2: "行动起来！像一纸禅一样！",
  hero_subtitle: "SnapStudio 连接创作者与收藏家，让您的作品都能找到它的归属。公平分账，透明交易。",
  hero_button_primary_text: "开始浏览",
  hero_button_primary_link: "/browse",
  hero_button_secondary_text: "成为创作者",
  hero_button_secondary_link: "/register",
  cta_title: "准备好分享你的作品了吗？",
  cta_subtitle: "动起来吧！就像一纸禅一样",
  cta_button_text: "立即注册",
  cta_button_link: "/register",
  section_top_rated_title: "高分榜单",
  section_latest_title: "最新上架",
  section_blog_title: "最新动态",
};

export default async function HomePage() {
  let settings = DEFAULT_SETTINGS;
  let latestPost: PostData | null = null;
  let topProducts: ProductData[] = [];
  let latestProducts: ProductData[] = [];

  if (IS_DEMO_MODE) {
    // Use demo data
    settings = DEMO_HOMEPAGE_SETTINGS;
    
    const publishedPosts = DEMO_POSTS.filter(p => p.is_published);
    latestPost = publishedPosts.length > 0 ? publishedPosts[0] : null;
    
    const approvedProducts = DEMO_PRODUCTS.filter(p => p.status === "approved");
    topProducts = [...approvedProducts].sort((a, b) => b.weighted_score - a.weighted_score).slice(0, 4);
    latestProducts = [...approvedProducts].sort((a, b) => 
      new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime()
    ).slice(0, 4);
  } else {
    // Use real Supabase data
    const supabase = createClient();

    const { data: settingsData } = await supabase
      .from("homepage_settings")
      .select("*")
      .eq("id", "00000000-0000-0000-0000-000000000001")
      .single();

    if (settingsData) {
      settings = settingsData;
    }

    const { data: postData } = await supabase
      .from("posts")
      .select("id, title, slug, excerpt, cover_image, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(1)
      .single();

    latestPost = postData as PostData | null;

    const { data: topData } = await supabase
      .from("products")
      .select(`
        id, title, slug, cover_image, price, avg_rating, rating_count,
        profiles!products_creator_id_fkey(display_name)
      `)
      .eq("status", "approved")
      .order("weighted_score", { ascending: false })
      .limit(4);

    topProducts = (topData as unknown as ProductData[]) || [];

    const { data: latestData } = await supabase
      .from("products")
      .select(`
        id, title, slug, cover_image, price, avg_rating, rating_count,
        profiles!products_creator_id_fkey(display_name)
      `)
      .eq("status", "approved")
      .order("published_at", { ascending: false })
      .limit(4);

    latestProducts = (latestData as unknown as ProductData[]) || [];
  }

  return (
    <div className="flex flex-col">
      {/* Demo Mode Banner */}
      {IS_DEMO_MODE && (
        <div className="bg-yellow-500 text-yellow-900 text-center py-2 text-sm font-medium">
          🎮 演示模式 - 使用演示账户登录体验完整功能 | 管理员: admin@demo.com / demo123
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-muted/50 to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              {settings.hero_title_line1}
              <span className="block">{settings.hero_title_line2}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {settings.hero_subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link href={settings.hero_button_primary_link}>
                  {settings.hero_button_primary_text}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={settings.hero_button_secondary_link}>
                  {settings.hero_button_secondary_text}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Blog Post */}
      {latestPost && (
        <section className="py-16 border-b">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight">{settings.section_blog_title}</h2>
              <Button variant="ghost" asChild>
                <Link href="/blog">
                  查看全部
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <Link href={`/blog/${latestPost.slug}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="aspect-[16/9] md:aspect-auto relative bg-muted min-h-[200px]">
                    {latestPost.cover_image ? (
                      <Image
                        src={latestPost.cover_image}
                        alt={latestPost.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-8 flex flex-col justify-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      {latestPost.published_at
                        ? new Date(latestPost.published_at).toLocaleDateString("zh-CN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : ""}
                    </p>
                    <h3 className="text-2xl font-semibold mb-4">{latestPost.title}</h3>
                    {latestPost.excerpt && (
                      <p className="text-muted-foreground line-clamp-3">{latestPost.excerpt}</p>
                    )}
                    <span className="inline-flex items-center text-sm font-medium mt-4 text-primary">
                      阅读更多
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </span>
                  </CardContent>
                </div>
              </Card>
            </Link>
          </div>
        </section>
      )}

      {/* Top Rated Products */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <h2 className="text-2xl font-bold tracking-tight">{settings.section_top_rated_title}</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/browse?sort=top">
                查看全部
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topProducts && topProducts.length > 0 ? (
              topProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="text-muted-foreground col-span-full text-center py-12">
                暂无作品
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">{settings.section_latest_title}</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/browse?sort=new">
                查看全部
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestProducts && latestProducts.length > 0 ? (
              latestProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="text-muted-foreground col-span-full text-center py-12">
                暂无作品
              </p>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">{settings.cta_title}</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            {settings.cta_subtitle}
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href={settings.cta_button_link}>{settings.cta_button_text}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

// Helper function to get creator name from profiles
function getCreatorName(product: ProductData): string {
  if (product.creator_name) return product.creator_name;
  if (!product.profiles) return "匿名创作者";
  if (Array.isArray(product.profiles)) {
    return product.profiles[0]?.display_name || "匿名创作者";
  }
  return product.profiles.display_name || "匿名创作者";
}

// Product Card Component
function ProductCard({ product }: { product: ProductData }) {
  const creatorName = getCreatorName(product);

  return (
    <Link href={`/product/${product.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="aspect-square relative bg-muted">
          {product.cover_image ? (
            <Image
              src={product.cover_image}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium truncate">{product.title}</h3>
          <p className="text-sm text-muted-foreground truncate">{creatorName}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="font-semibold">¥{product.price}</span>
            {product.rating_count > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                <span>{product.avg_rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

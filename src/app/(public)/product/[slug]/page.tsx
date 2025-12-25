import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  Package,
  User,
  Calendar,
  ArrowLeft,
  Shield,
  Download,
} from "lucide-react";
import { PurchaseButton } from "./purchase-button";
import { ReviewSection } from "./review-section";
import { DEMO_PRODUCTS, DEMO_REVIEWS, IS_DEMO_MODE } from "@/lib/demo-data";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps) {
  if (IS_DEMO_MODE) {
    const product = DEMO_PRODUCTS.find(p => p.slug === params.slug && p.status === "approved");
    if (!product) {
      return { title: "作品未找到 - SnapStudio" };
    }
    return {
      title: `${product.title} - SnapStudio`,
      description: product.description || `购买 ${product.title}`,
    };
  }

  const supabase = createClient();

  const { data: product } = await supabase
    .from("products")
    .select("title, description")
    .eq("slug", params.slug)
    .eq("status", "approved")
    .single();

  if (!product) {
    return { title: "作品未找到 - SnapStudio" };
  }

  return {
    title: `${product.title} - SnapStudio`,
    description: product.description || `购买 ${product.title}`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  let product: {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    cover_image: string | null;
    preview_images: string[];
    rating_score?: number;
    avg_rating?: number;
    rating_count: number;
    published_at: string | null;
    creator_id: string;
    profiles?: {
      id: string;
      display_name: string | null;
      avatar_url: string | null;
      bio: string | null;
    };
    splits?: Array<{
      collaborator_id: string;
      percentage: number;
      profiles: { display_name: string | null };
    }>;
  } | null = null;

  let reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    profiles: { display_name: string | null; avatar_url: string | null } | null;
  }> = [];

  let user: { id: string } | null = null;
  let hasPurchased = false;

  if (IS_DEMO_MODE) {
    const demoProduct = DEMO_PRODUCTS.find(p => p.slug === params.slug && p.status === "approved");
    if (demoProduct) {
      product = {
        id: demoProduct.id,
        title: demoProduct.title,
        slug: demoProduct.slug,
        description: demoProduct.description,
        price: demoProduct.price,
        cover_image: demoProduct.cover_image,
        preview_images: demoProduct.preview_images,
        rating_score: demoProduct.avg_rating,
        avg_rating: demoProduct.avg_rating,
        rating_count: demoProduct.rating_count,
        published_at: demoProduct.published_at,
        creator_id: demoProduct.creator_id,
        profiles: {
          id: demoProduct.creator_id,
          display_name: demoProduct.creator_name,
          avatar_url: demoProduct.creator_avatar,
          bio: "数字艺术创作者，专注于 AI 生成艺术",
        },
        splits: [],
      };

      // Get demo reviews for this product
      reviews = DEMO_REVIEWS.filter(r => r.product_id === demoProduct.id).map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        profiles: r.user,
      }));
    }
  } else {
    const supabase = createClient();

    // Get product details
    const { data: productData } = await supabase
      .from("products")
      .select(`
        *,
        profiles!products_creator_id_fkey(id, display_name, avatar_url, bio),
        splits(collaborator_id, percentage, profiles!splits_collaborator_id_fkey(display_name))
      `)
      .eq("slug", params.slug)
      .eq("status", "approved")
      .single();

    if (productData) {
      product = {
        ...productData,
        profiles: productData.profiles as unknown as {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
        },
        splits: productData.splits as unknown as Array<{
          collaborator_id: string;
          percentage: number;
          profiles: { display_name: string | null };
        }>,
      };
    }

    // Check if current user has purchased this product
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;

    if (user && product) {
      const { data: purchase } = await supabase
        .from("user_purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .single();

      hasPurchased = !!purchase;
    }

    // Get reviews
    if (product) {
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select(`
          id, rating, comment, created_at,
          profiles!reviews_user_id_fkey(display_name, avatar_url)
        `)
        .eq("product_id", product.id)
        .order("created_at", { ascending: false })
        .limit(10);

      reviews = (reviewsData || []).map(r => ({
        ...r,
        profiles: r.profiles as unknown as { display_name: string | null; avatar_url: string | null } | null,
      }));
    }
  }

  if (!product) {
    notFound();
  }

  // Check if user is the creator
  const isCreator = user?.id === product.creator_id;

  const creator = product.profiles || {
    id: product.creator_id,
    display_name: "创作者",
    avatar_url: null,
    bio: null,
  };

  const ratingScore = product.rating_score || product.avg_rating || 0;

  return (
    <div className="container py-8">
      {/* Demo Mode Banner */}
      {IS_DEMO_MODE && (
        <div className="bg-blue-100 text-blue-800 rounded-lg p-4 mb-6 text-sm">
          💡 演示模式：这是一个示例作品，购买功能仅供演示
        </div>
      )}

      {/* Back Button */}
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/browse">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回浏览
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
            {product.cover_image ? (
              <Image
                src={product.cover_image}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Preview Images */}
          {product.preview_images && product.preview_images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {product.preview_images.slice(0, 4).map((img: string, idx: number) => (
                <div
                  key={idx}
                  className="aspect-square relative rounded-lg overflow-hidden bg-muted"
                >
                  <Image
                    src={img}
                    alt={`预览 ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {product.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {product.rating_count > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-foreground">
                    {ratingScore.toFixed(1)}
                  </span>
                  <span>({product.rating_count} 评价)</span>
                </div>
              )}
              {product.published_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(product.published_at).toLocaleDateString("zh-CN")}
                </div>
              )}
            </div>
          </div>

          {/* Price & Purchase */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold">¥{product.price}</span>
                {hasPurchased && (
                  <span className="text-sm text-green-600 font-medium">
                    已购买
                  </span>
                )}
              </div>

              {isCreator ? (
                <Button className="w-full" disabled>
                  这是您的作品
                </Button>
              ) : hasPurchased ? (
                <Button className="w-full" asChild>
                  <Link href="/dashboard/purchases">
                    <Download className="mr-2 h-4 w-4" />
                    前往下载
                  </Link>
                </Button>
              ) : (
                <PurchaseButton
                  productId={product.id}
                  productTitle={product.title}
                  price={product.price}
                  isLoggedIn={!!user || IS_DEMO_MODE}
                />
              )}

              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>安全支付，购买后即可下载</span>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {product.description && (
            <div>
              <h2 className="text-lg font-semibold mb-2">作品介绍</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          <Separator />

          {/* Creator Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">创作者</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {creator.avatar_url ? (
                    <Image
                      src={creator.avatar_url}
                      alt={creator.display_name || "创作者"}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {creator.display_name || "创作者"}
                  </p>
                  {creator.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {creator.bio}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Split Info */}
          {product.splits && product.splits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">收益分配</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {product.splits.map((split) => (
                    <div
                      key={split.collaborator_id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{split.profiles?.display_name || "协作者"}</span>
                      <span className="font-medium">{split.percentage}%</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>平台费用</span>
                    <span>10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <ReviewSection
          productId={product.id}
          reviews={reviews}
          canReview={hasPurchased && !isCreator}
          isLoggedIn={!!user || IS_DEMO_MODE}
        />
      </div>
    </div>
  );
}

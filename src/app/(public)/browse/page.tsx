import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, Package } from "lucide-react";
import { DEMO_PRODUCTS, IS_DEMO_MODE } from "@/lib/demo-data";

interface BrowsePageProps {
  searchParams: {
    q?: string;
    sort?: string;
    category?: string;
  };
}

export const metadata = {
  title: "浏览作品 - SnapStudio",
  description: "发现独特的数字艺术作品，支持创作者。",
};

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const { q, sort = "newest", category } = searchParams;
  
  let products: Array<{
    id: string;
    title: string;
    slug: string;
    price: number;
    cover_image: string | null;
    rating_score?: number | null;
    avg_rating?: number;
    rating_count: number;
    profiles: { display_name: string | null } | null;
  }> = [];

  if (IS_DEMO_MODE) {
    // Use demo data
    let demoProducts = DEMO_PRODUCTS.filter(p => p.status === "approved").map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: p.price,
      cover_image: p.cover_image,
      rating_score: p.avg_rating,
      avg_rating: p.avg_rating,
      rating_count: p.rating_count,
      profiles: { display_name: p.creator_name },
    }));

    // Search filter
    if (q) {
      const query = q.toLowerCase();
      demoProducts = demoProducts.filter(p => 
        p.title.toLowerCase().includes(query)
      );
    }

    // Sorting
    switch (sort) {
      case "price_asc":
        demoProducts.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        demoProducts.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        demoProducts.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
        break;
      case "newest":
      default:
        // Already sorted by newest in demo data
        break;
    }

    products = demoProducts;
  } else {
    const supabase = createClient();

    // Build query
    let query = supabase
      .from("products")
      .select(`
        id, title, slug, price, cover_image, rating_score, rating_count,
        profiles!products_creator_id_fkey(display_name)
      `)
      .eq("status", "approved");

    // Search filter
    if (q) {
      query = query.ilike("title", `%${q}%`);
    }

    // Category filter
    if (category) {
      query = query.eq("category", category);
    }

    // Sorting
    switch (sort) {
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      case "rating":
        query = query.order("rating_score", { ascending: false });
        break;
      case "newest":
      default:
        query = query.order("published_at", { ascending: false });
        break;
    }

    const { data } = await query;
    products = (data || []).map(p => ({
      ...p,
      profiles: p.profiles as unknown as { display_name: string | null } | null,
    }));
  }

  return (
    <div className="container py-8">
      {/* Demo Mode Banner */}
      {IS_DEMO_MODE && (
        <div className="bg-blue-100 text-blue-800 rounded-lg p-4 mb-6 text-sm">
          💡 演示模式：展示 {products.length} 个示例作品，点击作品查看详情
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">浏览作品</h1>
        <p className="text-muted-foreground">
          发现独特的数字艺术作品，支持你喜爱的创作者。
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <form className="flex-1 flex gap-2" action="/browse" method="GET">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              name="q"
              placeholder="搜索作品..."
              defaultValue={q}
              className="pl-10"
            />
          </div>
          <Button type="submit">搜索</Button>
        </form>

        <div className="flex gap-2">
          <Select defaultValue={sort}>
            <SelectTrigger className="w-[140px]">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue placeholder="排序" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">最新上架</SelectItem>
              <SelectItem value="rating">评分最高</SelectItem>
              <SelectItem value="price_asc">价格从低到高</SelectItem>
              <SelectItem value="price_desc">价格从高到低</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {products && products.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            共 {products.length} 件作品
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">暂无作品</h3>
          <p className="text-muted-foreground">
            {q ? `没有找到与"${q}"相关的作品` : "敬请期待创作者上传作品"}
          </p>
        </div>
      )}
    </div>
  );
}

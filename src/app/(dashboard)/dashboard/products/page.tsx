import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";

export default async function MyProductsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch user's products
  const { data: products } = await supabase
    .from("products")
    .select("id, title, slug, description, price, cover_image, status, created_at, rating_score, rating_count")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  const approvedProducts = products?.filter((p) => p.status === "approved") || [];
  const pendingProducts = products?.filter((p) => p.status === "pending") || [];
  const rejectedProducts = products?.filter((p) => p.status === "rejected") || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">我的作品</h1>
          <p className="text-muted-foreground">
            管理您上传的所有作品
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/upload">
            <Plus className="mr-2 h-4 w-4" />
            上传新作品
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已上架</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedProducts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">审核中</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingProducts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已拒绝</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedProducts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Products Tabs */}
      <Tabs defaultValue="approved" className="space-y-4">
        <TabsList>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            已上架 ({approvedProducts.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            审核中 ({pendingProducts.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="h-4 w-4" />
            已拒绝 ({rejectedProducts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approved">
          <ProductGrid products={approvedProducts} showLink />
        </TabsContent>

        <TabsContent value="pending">
          <ProductGrid products={pendingProducts} />
        </TabsContent>

        <TabsContent value="rejected">
          <ProductGrid products={rejectedProducts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  cover_image: string | null;
  status: string;
  created_at: string;
  rating_score: number;
  rating_count: number;
}

function ProductGrid({
  products,
  showLink,
}: {
  products: Product[];
  showLink?: boolean;
}) {
  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">暂无作品</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <div className="aspect-video relative bg-muted">
            {product.cover_image ? (
              <Image
                src={product.cover_image}
                alt={product.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold truncate">{product.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              ¥{product.price}
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-muted-foreground">
                {new Date(product.created_at).toLocaleDateString("zh-CN")}
              </span>
              {showLink && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/product/${product.slug}`}>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

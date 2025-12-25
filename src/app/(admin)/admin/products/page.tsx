import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { ProductReviewItem } from "./product-review-item";

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  cover_image: string | null;
  status: string;
  created_at: string;
  profiles: {
    display_name: string | null;
    email: string;
  } | null;
}

export default async function ProductsManagementPage() {
  const supabase = createClient();

  // Fetch all products with creator info
  const { data: products } = await supabase
    .from("products")
    .select(`
      id, title, slug, description, price, cover_image, status, created_at,
      profiles!products_creator_id_fkey(display_name, email)
    `)
    .order("created_at", { ascending: false });

  const pendingProducts = products?.filter((p) => p.status === "pending") || [];
  const approvedProducts = products?.filter((p) => p.status === "approved") || [];
  const rejectedProducts = products?.filter((p) => p.status === "rejected") || [];

  const stats = [
    {
      title: "待审核",
      value: pendingProducts.length,
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      title: "已通过",
      value: approvedProducts.length,
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      title: "已拒绝",
      value: rejectedProducts.length,
      icon: XCircle,
      color: "text-red-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">作品审核</h1>
        <p className="text-muted-foreground">
          审核创作者提交的作品，确保内容质量。
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Products Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            待审核 ({pendingProducts.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            已通过 ({approvedProducts.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="h-4 w-4" />
            已拒绝 ({rejectedProducts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>待审核作品</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingProducts.length > 0 ? (
                <div className="divide-y">
                  {(pendingProducts as unknown as Product[]).map((product) => (
                    <ProductReviewItem
                      key={product.id}
                      product={product}
                      showActions
                    />
                  ))}
                </div>
              ) : (
                <EmptyState message="暂无待审核作品" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>已通过作品</CardTitle>
            </CardHeader>
            <CardContent>
              {approvedProducts.length > 0 ? (
                <div className="divide-y">
                  {(approvedProducts as unknown as Product[]).map((product) => (
                    <ProductReviewItem key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <EmptyState message="暂无已通过作品" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>已拒绝作品</CardTitle>
            </CardHeader>
            <CardContent>
              {rejectedProducts.length > 0 ? (
                <div className="divide-y">
                  {(rejectedProducts as unknown as Product[]).map((product) => (
                    <ProductReviewItem key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <EmptyState message="暂无已拒绝作品" />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <Package className="mx-auto h-12 w-12 text-muted-foreground" />
      <p className="mt-4 text-muted-foreground">{message}</p>
    </div>
  );
}

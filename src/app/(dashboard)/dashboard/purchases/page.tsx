import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingBag,
  Download,
  ExternalLink,
  Package,
  Calendar,
} from "lucide-react";

export default async function PurchasesPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch user's purchases
  const { data: purchases } = await supabase
    .from("user_purchases")
    .select(`
      id, purchased_at,
      products!user_purchases_product_id_fkey(
        id, title, slug, cover_image, file_url, price,
        profiles!products_creator_id_fkey(display_name)
      ),
      transactions!user_purchases_transaction_id_fkey(amount)
    `)
    .eq("user_id", user.id)
    .order("purchased_at", { ascending: false });

  const totalSpent =
    purchases?.reduce(
      (sum, p) => sum + Number((p.transactions as unknown as { amount: number } | null)?.amount || 0),
      0
    ) || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">已购作品</h1>
        <p className="text-muted-foreground">
          管理您购买的所有作品
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已购作品</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchases?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总消费</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Purchases List */}
      <Card>
        <CardHeader>
          <CardTitle>购买记录</CardTitle>
        </CardHeader>
        <CardContent>
          {purchases && purchases.length > 0 ? (
            <div className="space-y-4">
              {purchases.map((purchase) => {
                const product = purchase.products as unknown as {
                  id: string;
                  title: string;
                  slug: string;
                  cover_image: string | null;
                  file_url: string;
                  price: number;
                  profiles: { display_name: string | null };
                } | null;

                return (
                  <div
                    key={purchase.id}
                    className="flex items-center gap-4 p-4 rounded-lg border"
                  >
                    {/* Cover Image */}
                    <div className="h-20 w-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      {product?.cover_image ? (
                        <Image
                          src={product.cover_image}
                          alt={product.title}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {product?.title || "作品"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {product?.profiles?.display_name || "创作者"}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(purchase.purchased_at).toLocaleDateString(
                          "zh-CN",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/product/${product?.slug}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      {product?.file_url && (
                        <Button size="sm" asChild>
                          <a
                            href={product.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            下载
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">暂无购买记录</p>
              <Button className="mt-4" asChild>
                <Link href="/browse">浏览作品</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

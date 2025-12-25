import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Upload,
  Eye,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch user's statistics
  const [
    { count: productCount },
    { count: purchaseCount },
    { data: earnings },
    { data: recentProducts },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("creator_id", user.id),
    supabase
      .from("user_purchases")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("split_payments")
      .select("amount")
      .eq("recipient_id", user.id),
    supabase
      .from("products")
      .select("id, title, slug, status, created_at, cover_image")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const totalEarnings =
    earnings?.reduce((sum, e) => sum + Number(e.amount || 0), 0) || 0;

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .single();

  const stats = [
    {
      title: "我的作品",
      value: productCount || 0,
      icon: Package,
      href: "/dashboard/products",
    },
    {
      title: "总收益",
      value: `¥${totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      href: "/dashboard/earnings",
    },
    {
      title: "已购作品",
      value: purchaseCount || 0,
      icon: ShoppingBag,
      href: "/dashboard/purchases",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            欢迎回来，{profile?.display_name || "创作者"}
          </h1>
          <p className="text-muted-foreground">
            这是您的创作者工作台概览。
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/upload">
            <Upload className="mr-2 h-4 w-4" />
            上传作品
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            最近作品
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/products">查看全部</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentProducts && recentProducts.length > 0 ? (
            <div className="space-y-4">
              {recentProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                      {product.cover_image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={product.cover_image}
                          alt={product.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(product.created_at).toLocaleDateString(
                          "zh-CN"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : product.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.status === "approved"
                        ? "已上架"
                        : product.status === "pending"
                        ? "审核中"
                        : "已拒绝"}
                    </span>
                    {product.status === "approved" && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/product/${product.slug}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                您还没有上传任何作品
              </p>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/upload">上传第一个作品</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/dashboard/upload"
              className="block rounded-lg border p-3 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <Upload className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">上传新作品</p>
                  <p className="text-sm text-muted-foreground">
                    分享您的创作，开始赚取收益
                  </p>
                </div>
              </div>
            </Link>
            <Link
              href="/dashboard/settings"
              className="block rounded-lg border p-3 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">完善个人资料</p>
                  <p className="text-sm text-muted-foreground">
                    让买家更了解您
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>平台公告</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm">
                欢迎使用 SnapStudio！我们只收取 10% 的平台费用，90%
                的收益归创作者所有。
              </p>
              <Link
                href="/blog"
                className="text-sm text-primary hover:underline mt-2 inline-block"
              >
                了解更多 →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

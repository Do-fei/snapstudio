import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Package,
  DollarSign,
  FileText,
  TrendingUp,
  Clock,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = createClient();

  // Fetch statistics
  const [
    { count: userCount },
    { count: productCount },
    { count: pendingCount },
    { count: postCount },
    { data: recentTransactions },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase
      .from("transactions")
      .select("id, amount, platform_fee, created_at")
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Calculate total revenue
  const { data: revenueData } = await supabase
    .from("transactions")
    .select("platform_fee")
    .eq("status", "completed");

  const totalRevenue = revenueData?.reduce(
    (sum, t) => sum + Number(t.platform_fee || 0),
    0
  ) || 0;

  const stats = [
    {
      title: "总用户数",
      value: userCount || 0,
      icon: Users,
      description: "注册用户",
    },
    {
      title: "上架作品",
      value: productCount || 0,
      icon: Package,
      description: "已审核通过",
    },
    {
      title: "待审核",
      value: pendingCount || 0,
      icon: Clock,
      description: "等待审核的作品",
    },
    {
      title: "平台收入",
      value: `¥${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      description: "累计佣金",
    },
    {
      title: "已发布文章",
      value: postCount || 0,
      icon: FileText,
      description: "博客文章",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">管理后台</h1>
        <p className="text-muted-foreground">
          欢迎回来，这是平台的整体运营数据概览。
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              最近交易
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions && recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        ¥{Number(transaction.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        佣金: ¥{Number(transaction.platform_fee).toFixed(2)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">暂无交易记录</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/admin/blog"
              className="block rounded-lg border p-3 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">发布新文章</p>
                  <p className="text-sm text-muted-foreground">
                    撰写并发布博客文章
                  </p>
                </div>
              </div>
            </a>
            <a
              href="/admin/products"
              className="block rounded-lg border p-3 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">审核作品</p>
                  <p className="text-sm text-muted-foreground">
                    {pendingCount || 0} 个作品等待审核
                  </p>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

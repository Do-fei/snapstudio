import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  Percent,
} from "lucide-react";

export default async function AnalyticsPage() {
  const supabase = createClient();

  // Fetch comprehensive statistics
  const [
    { count: totalUsers },
    { count: totalCreators },
    { count: totalProducts },
    { count: totalTransactions },
    { data: transactions },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "creator"),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("transactions").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase
      .from("transactions")
      .select("amount, platform_fee, creator_amount, created_at")
      .eq("status", "completed"),
    supabase
      .from("profiles")
      .select("id, email, display_name, role, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  // Calculate financial metrics
  const totalRevenue = transactions?.reduce(
    (sum, t) => sum + Number(t.amount || 0),
    0
  ) || 0;

  const platformFees = transactions?.reduce(
    (sum, t) => sum + Number(t.platform_fee || 0),
    0
  ) || 0;

  const creatorPayouts = transactions?.reduce(
    (sum, t) => sum + Number(t.creator_amount || 0),
    0
  ) || 0;

  // Calculate monthly data (simplified)
  const now = new Date();
  const thisMonth = transactions?.filter((t) => {
    const date = new Date(t.created_at);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }) || [];

  const monthlyRevenue = thisMonth.reduce(
    (sum, t) => sum + Number(t.amount || 0),
    0
  );

  const monthlyFees = thisMonth.reduce(
    (sum, t) => sum + Number(t.platform_fee || 0),
    0
  );

  const stats = [
    {
      title: "总流水",
      value: `¥${totalRevenue.toFixed(2)}`,
      description: "累计交易金额",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "平台佣金",
      value: `¥${platformFees.toFixed(2)}`,
      description: "累计平台收入 (10%)",
      icon: Percent,
      color: "text-blue-500",
    },
    {
      title: "创作者收入",
      value: `¥${creatorPayouts.toFixed(2)}`,
      description: "累计创作者分成 (90%)",
      icon: TrendingUp,
      color: "text-purple-500",
    },
    {
      title: "本月流水",
      value: `¥${monthlyRevenue.toFixed(2)}`,
      description: `本月佣金: ¥${monthlyFees.toFixed(2)}`,
      icon: ShoppingCart,
      color: "text-orange-500",
    },
    {
      title: "总用户数",
      value: totalUsers || 0,
      description: `创作者: ${totalCreators || 0}`,
      icon: Users,
      color: "text-cyan-500",
    },
    {
      title: "上架作品",
      value: totalProducts || 0,
      description: `交易数: ${totalTransactions || 0}`,
      icon: Package,
      color: "text-pink-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">数据分析</h1>
        <p className="text-muted-foreground">
          查看平台运营数据和财务统计。
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
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
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              最近注册用户
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentUsers && recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {user.display_name || user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.role === "creator" ? "创作者" : "普通用户"}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">暂无用户</p>
            )}
          </CardContent>
        </Card>

        {/* Transaction Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              交易概览
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">总交易数</span>
                <span className="font-medium">{totalTransactions || 0} 笔</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">平均客单价</span>
                <span className="font-medium">
                  ¥{totalTransactions ? (totalRevenue / totalTransactions).toFixed(2) : "0.00"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">本月交易数</span>
                <span className="font-medium">{thisMonth.length} 笔</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">平台佣金率</span>
                <span className="font-medium">10%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>财务明细</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">总流水</p>
              <p className="text-3xl font-bold text-green-600">
                ¥{totalRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                所有已完成交易的总金额
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">平台收入</p>
              <p className="text-3xl font-bold text-blue-600">
                ¥{platformFees.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                10% 平台佣金
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">创作者分成</p>
              <p className="text-3xl font-bold text-purple-600">
                ¥{creatorPayouts.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                90% 创作者收入
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

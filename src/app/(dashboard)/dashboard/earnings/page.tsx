import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Calendar,
} from "lucide-react";

export default async function EarningsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch earnings data
  const { data: splitPayments } = await supabase
    .from("split_payments")
    .select(`
      id, amount, percentage, created_at,
      transactions!split_payments_transaction_id_fkey(
        amount,
        products!transactions_product_id_fkey(title, slug)
      )
    `)
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false });

  // Calculate totals
  const totalEarnings =
    splitPayments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

  // Calculate this month's earnings
  const now = new Date();
  const thisMonthPayments =
    splitPayments?.filter((p) => {
      const date = new Date(p.created_at);
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }) || [];

  const monthlyEarnings = thisMonthPayments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  const transactionCount = splitPayments?.length || 0;

  const stats = [
    {
      title: "总收益",
      value: `¥${totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      description: "累计收益",
    },
    {
      title: "本月收益",
      value: `¥${monthlyEarnings.toFixed(2)}`,
      icon: TrendingUp,
      description: `${thisMonthPayments.length} 笔交易`,
    },
    {
      title: "交易次数",
      value: transactionCount,
      icon: ShoppingCart,
      description: "总成交数",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">收益管理</h1>
        <p className="text-muted-foreground">
          查看您的收益统计和交易记录
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Earnings Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>收益明细</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-4 mb-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              平台收取 10% 服务费，您获得作品销售额的 90%（按分账比例分配）
            </p>
          </div>

          {splitPayments && splitPayments.length > 0 ? (
            <div className="space-y-4">
              {splitPayments.map((payment) => {
                const transaction = payment.transactions as unknown as {
                  amount: number;
                  products: { title: string; slug: string };
                } | null;

                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction?.products?.title || "作品销售"}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(payment.created_at).toLocaleDateString(
                            "zh-CN",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                          <span>·</span>
                          <span>分成 {payment.percentage}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        +¥{Number(payment.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        订单金额: ¥{Number(transaction?.amount || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">暂无收益记录</p>
              <p className="text-sm text-muted-foreground">
                上传作品并等待买家购买
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

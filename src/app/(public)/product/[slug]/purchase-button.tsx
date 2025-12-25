"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { ShoppingCart, Loader2, CheckCircle } from "lucide-react";
import { purchaseProduct } from "./actions";

interface PurchaseButtonProps {
  productId: string;
  productTitle: string;
  price: number;
  isLoggedIn: boolean;
}

export function PurchaseButton({
  productId,
  productTitle,
  price,
  isLoggedIn,
}: PurchaseButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePurchase = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setIsDialogOpen(true);
  };

  const confirmPurchase = async () => {
    setIsLoading(true);

    const result = await purchaseProduct(productId);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "购买失败",
        description: result.error,
      });
      setIsLoading(false);
    } else {
      setIsSuccess(true);
      toast({
        title: "购买成功",
        description: "您可以在个人中心下载作品",
      });
      setTimeout(() => {
        setIsDialogOpen(false);
        router.refresh();
      }, 1500);
    }
  };

  return (
    <>
      <Button className="w-full" size="lg" onClick={handlePurchase}>
        <ShoppingCart className="mr-2 h-4 w-4" />
        立即购买
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          {isSuccess ? (
            <div className="text-center py-6">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold">购买成功！</h3>
              <p className="text-muted-foreground">
                正在跳转...
              </p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>确认购买</DialogTitle>
                <DialogDescription>
                  您即将购买以下作品
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium">{productTitle}</h4>
                  <p className="text-2xl font-bold mt-2">¥{price}</p>
                </div>

                <div className="mt-4 text-sm text-muted-foreground space-y-1">
                  <p>• 购买后可立即下载作品文件</p>
                  <p>• 平台收取 10% 服务费</p>
                  <p>• 90% 收益将分配给创作者</p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isLoading}
                >
                  取消
                </Button>
                <Button onClick={confirmPurchase} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>确认支付 ¥{price}</>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import { CheckCircle, XCircle, Trash2, Package, ExternalLink } from "lucide-react";
import { approveProduct, rejectProduct, deleteProduct } from "./actions";

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

interface ProductReviewItemProps {
  product: Product;
  showActions?: boolean;
}

export function ProductReviewItem({ product, showActions }: ProductReviewItemProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const creatorName = product.profiles?.display_name || product.profiles?.email || "未知用户";

  const handleApprove = async () => {
    setIsLoading(true);
    const result = await approveProduct(product.id);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "审核失败",
        description: result.error,
      });
    } else {
      toast({
        title: "审核通过",
        description: "作品已发布到市场",
      });
      router.refresh();
    }
    setIsLoading(false);
  };

  const handleReject = async () => {
    setIsLoading(true);
    const result = await rejectProduct(product.id);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "操作失败",
        description: result.error,
      });
    } else {
      toast({
        title: "已拒绝",
        description: "作品已被拒绝",
      });
      router.refresh();
    }
    setIsLoading(false);
    setIsRejectDialogOpen(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    const result = await deleteProduct(product.id);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "删除失败",
        description: result.error,
      });
    } else {
      toast({
        title: "删除成功",
        description: "作品已被删除",
      });
      router.refresh();
    }
    setIsLoading(false);
    setIsDeleteDialogOpen(false);
  };

  const getStatusBadge = () => {
    switch (product.status) {
      case "pending":
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
            待审核
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            已通过
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            已拒绝
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex items-start gap-4 py-4">
        {/* Cover Image */}
        <div className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          {product.cover_image ? (
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
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{product.title}</h3>
            {getStatusBadge()}
          </div>
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {product.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>创作者: {creatorName}</span>
            <span>价格: ¥{product.price}</span>
            <span>
              提交于{" "}
              {new Date(product.created_at).toLocaleDateString("zh-CN")}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {product.status === "approved" && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/product/${product.slug}`} target="_blank">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}

          {showActions && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleApprove}
                disabled={isLoading}
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                通过
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRejectDialogOpen(true)}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="mr-1 h-4 w-4" />
                拒绝
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isLoading}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认拒绝</DialogTitle>
            <DialogDescription>
              您确定要拒绝作品「{product.title}」吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isLoading}
            >
              {isLoading ? "处理中..." : "确认拒绝"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除作品「{product.title}」吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "删除中..." : "删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

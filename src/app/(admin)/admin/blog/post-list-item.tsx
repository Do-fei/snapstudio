"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { MoreHorizontal, Pencil, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
import { deletePost, togglePostStatus } from "./actions";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export function PostListItem({ post }: { post: Post }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleStatus = async () => {
    setIsLoading(true);
    const result = await togglePostStatus(post.id, !post.is_published);
    
    if (result.error) {
      toast({
        variant: "destructive",
        title: "操作失败",
        description: result.error,
      });
    } else {
      toast({
        title: post.is_published ? "已取消发布" : "已发布",
        description: post.is_published
          ? "文章已转为草稿状态"
          : "文章已发布到前台",
      });
      router.refresh();
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    const result = await deletePost(post.id);
    
    if (result.error) {
      toast({
        variant: "destructive",
        title: "删除失败",
        description: result.error,
      });
    } else {
      toast({
        title: "删除成功",
        description: "文章已被删除",
      });
      router.refresh();
    }
    setIsLoading(false);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between py-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{post.title}</h3>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                post.is_published
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {post.is_published ? "已发布" : "草稿"}
            </span>
          </div>
          {post.excerpt && (
            <p className="text-sm text-muted-foreground truncate mt-1">
              {post.excerpt}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            创建于{" "}
            {new Date(post.created_at).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {post.is_published && post.published_at && (
              <>
                {" · "}
                发布于{" "}
                {new Date(post.published_at).toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </>
            )}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isLoading}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/blog/${post.id}`}>
                <Pencil className="mr-2 h-4 w-4" />
                编辑
              </Link>
            </DropdownMenuItem>
            {post.is_published && (
              <DropdownMenuItem asChild>
                <Link href={`/blog/${post.slug}`} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  查看
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleToggleStatus}>
              {post.is_published ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  取消发布
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  发布
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除文章「{post.title}」吗？此操作无法撤销。
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

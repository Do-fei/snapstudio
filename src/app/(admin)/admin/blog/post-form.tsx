"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, Eye, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { createPost, updatePost } from "./actions";

const postSchema = z.object({
  title: z.string().min(1, "请输入文章标题").max(200, "标题不能超过200字符"),
  excerpt: z.string().max(500, "摘要不能超过500字符").optional(),
  content: z.string().min(1, "请输入文章内容"),
  cover_image: z.string().url("请输入有效的图片URL").optional().or(z.literal("")),
  is_published: z.boolean(),
});

type PostFormData = z.infer<typeof postSchema>;

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  is_published: boolean;
}

interface PostFormProps {
  post?: Post;
}

export function PostForm({ post }: PostFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!post;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title || "",
      excerpt: post?.excerpt || "",
      content: post?.content || "",
      cover_image: post?.cover_image || "",
      is_published: post?.is_published || false,
    },
  });

  const isPublished = watch("is_published");

  const onSubmit = async (data: PostFormData) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("content", data.content);
    formData.append("excerpt", data.excerpt || "");
    formData.append("cover_image", data.cover_image || "");
    formData.append("is_published", data.is_published.toString());

    const result = isEditing
      ? await updatePost(post.id, formData)
      : await createPost(formData);

    if (result.error) {
      toast({
        variant: "destructive",
        title: isEditing ? "更新失败" : "创建失败",
        description: result.error,
      });
      setIsLoading(false);
    } else {
      toast({
        title: isEditing ? "更新成功" : "创建成功",
        description: data.is_published
          ? "文章已发布到前台"
          : "文章已保存为草稿",
      });
      router.push("/admin/blog");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/blog">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditing ? "编辑文章" : "新建文章"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "修改文章内容和设置" : "撰写新的博客文章"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="is_published"
              checked={isPublished}
              onCheckedChange={(checked) => setValue("is_published", checked)}
            />
            <Label htmlFor="is_published" className="text-sm">
              {isPublished ? "发布" : "草稿"}
            </Label>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>文章内容</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">标题 *</Label>
                <Input
                  id="title"
                  placeholder="输入文章标题"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="excerpt">摘要</Label>
                <Textarea
                  id="excerpt"
                  placeholder="简短描述文章内容（可选）"
                  rows={3}
                  {...register("excerpt")}
                />
                {errors.excerpt && (
                  <p className="text-sm text-destructive">
                    {errors.excerpt.message}
                  </p>
                )}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">正文 *</Label>
                <Textarea
                  id="content"
                  placeholder="输入文章正文内容（支持 Markdown 格式）"
                  rows={20}
                  className="font-mono text-sm"
                  {...register("content")}
                />
                {errors.content && (
                  <p className="text-sm text-destructive">
                    {errors.content.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>封面图片</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cover_image">图片 URL</Label>
                <Input
                  id="cover_image"
                  placeholder="https://example.com/image.jpg"
                  {...register("cover_image")}
                />
                {errors.cover_image && (
                  <p className="text-sm text-destructive">
                    {errors.cover_image.message}
                  </p>
                )}
              </div>
              {watch("cover_image") && (
                <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={watch("cover_image")}
                    alt="封面预览"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>发布设置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">状态</p>
                  <p className="text-sm text-muted-foreground">
                    {isPublished ? "文章将立即发布" : "保存为草稿"}
                  </p>
                </div>
                <div
                  className={`h-3 w-3 rounded-full ${
                    isPublished ? "bg-green-500" : "bg-yellow-500"
                  }`}
                />
              </div>
            </CardContent>
          </Card>

          {isEditing && post.is_published && (
            <Card>
              <CardHeader>
                <CardTitle>预览</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/blog/${post.slug}`} target="_blank">
                    <Eye className="mr-2 h-4 w-4" />
                    查看文章
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </form>
  );
}

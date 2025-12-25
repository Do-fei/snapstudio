"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  FileText,
  Users,
  Loader2,
  CheckCircle,
  X,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { createProduct } from "./actions";

const categories = [
  { value: "illustration", label: "插画" },
  { value: "photography", label: "摄影" },
  { value: "3d", label: "3D 模型" },
  { value: "ui", label: "UI 设计" },
  { value: "icon", label: "图标" },
  { value: "template", label: "模板" },
  { value: "other", label: "其他" },
];

const productSchema = z.object({
  title: z.string().min(1, "请输入作品标题").max(100, "标题不能超过100字符"),
  description: z.string().max(2000, "描述不能超过2000字符").optional(),
  price: z.number().min(0, "价格不能为负数").max(100000, "价格不能超过100000"),
  category: z.string().optional(),
  cover_image: z.string().url("请输入有效的图片URL").optional().or(z.literal("")),
  file_url: z.string().url("请输入有效的文件URL").min(1, "请上传作品文件"),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Split {
  collaboratorEmail: string;
  percentage: number;
}

export default function UploadPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [splits, setSplits] = useState<Split[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      category: "",
      cover_image: "",
      file_url: "",
    },
  });

  const steps = [
    { id: 1, title: "上传文件", icon: Upload },
    { id: 2, title: "作品信息", icon: FileText },
    { id: 3, title: "分账设置", icon: Users },
  ];

  const progress = (step / 3) * 100;

  const nextStep = async () => {
    if (step === 1) {
      const isValid = await trigger("file_url");
      if (!isValid) return;
    } else if (step === 2) {
      const isValid = await trigger(["title", "price", "description", "cover_image"]);
      if (!isValid) return;
    }
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const addSplit = () => {
    const totalPercentage = splits.reduce((sum, s) => sum + s.percentage, 0);
    if (totalPercentage >= 100) {
      toast({
        variant: "destructive",
        title: "无法添加",
        description: "分账比例总和已达到 100%",
      });
      return;
    }
    setSplits([...splits, { collaboratorEmail: "", percentage: 10 }]);
  };

  const removeSplit = (index: number) => {
    setSplits(splits.filter((_, i) => i !== index));
  };

  const updateSplit = (index: number, field: keyof Split, value: string | number) => {
    const newSplits = [...splits];
    if (field === "percentage") {
      newSplits[index][field] = Number(value);
    } else {
      newSplits[index][field] = value as string;
    }
    setSplits(newSplits);
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);

    // Validate splits
    const totalPercentage = splits.reduce((sum, s) => sum + s.percentage, 0);
    if (totalPercentage > 100) {
      toast({
        variant: "destructive",
        title: "分账设置错误",
        description: "分账比例总和不能超过 100%",
      });
      setIsSubmitting(false);
      return;
    }

    // Filter out empty splits
    const validSplits = splits.filter(
      (s) => s.collaboratorEmail && s.percentage > 0
    );

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description || "");
    formData.append("price", data.price.toString());
    formData.append("category", data.category || "");
    formData.append("cover_image", data.cover_image || "");
    formData.append("file_url", data.file_url);
    formData.append("splits", JSON.stringify(validSplits));

    const result = await createProduct(formData);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "上传失败",
        description: result.error,
      });
      setIsSubmitting(false);
    } else {
      setIsSuccess(true);
      toast({
        title: "上传成功",
        description: "作品已提交审核，请等待管理员审批",
      });
      setTimeout(() => {
        router.push("/dashboard/products");
      }, 2000);
    }
  };

  const totalSplitPercentage = splits.reduce((sum, s) => sum + s.percentage, 0);
  const creatorPercentage = 100 - totalSplitPercentage;

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">上传成功！</h1>
        <p className="text-muted-foreground mb-4">
          您的作品已提交审核，管理员审核通过后将自动上架。
        </p>
        <p className="text-sm text-muted-foreground">正在跳转...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回工作台
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">上传作品</h1>
        <p className="text-muted-foreground">
          分享您的创作，开始赚取收益
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <Progress value={progress} className="h-2 mb-4" />
        <div className="flex justify-between">
          {steps.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-2 ${
                step >= s.id ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  step >= s.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <s.icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Upload File */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>上传作品文件</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file_url">文件 URL *</Label>
                <Input
                  id="file_url"
                  placeholder="https://example.com/your-file.zip"
                  {...register("file_url")}
                />
                {errors.file_url && (
                  <p className="text-sm text-destructive">
                    {errors.file_url.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  请将文件上传到云存储（如阿里云 OSS、腾讯云 COS）后粘贴链接
                </p>
              </div>

              <div className="rounded-lg border-2 border-dashed p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  支持 ZIP、RAR、PSD、AI 等格式
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  最大文件大小：500MB
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Product Info */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>作品信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">标题 *</Label>
                <Input
                  id="title"
                  placeholder="给您的作品起个名字"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  placeholder="详细介绍您的作品..."
                  rows={5}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">价格 (¥) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...register("price", { valueAsNumber: true })}
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">分类</Label>
                  <Select
                    value={watch("category")}
                    onValueChange={(value) => setValue("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover_image">封面图片 URL</Label>
                <Input
                  id="cover_image"
                  placeholder="https://example.com/cover.jpg"
                  {...register("cover_image")}
                />
                {errors.cover_image && (
                  <p className="text-sm text-destructive">
                    {errors.cover_image.message}
                  </p>
                )}
              </div>

              {watch("cover_image") && (
                <div className="aspect-video relative rounded-lg overflow-hidden bg-muted max-w-sm">
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
        )}

        {/* Step 3: Split Settings */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>分账设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                设置收益分配比例。平台收取 10% 服务费，剩余 90% 按以下比例分配。
              </p>

              {/* Creator's share */}
              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">您的收益</p>
                    <p className="text-sm text-muted-foreground">
                      作为创作者的收益份额
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-primary">
                    {creatorPercentage}%
                  </span>
                </div>
              </div>

              {/* Collaborator splits */}
              {splits.map((split, index) => (
                <div key={index} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">协作者 {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSplit(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>邮箱</Label>
                      <Input
                        placeholder="collaborator@email.com"
                        value={split.collaboratorEmail}
                        onChange={(e) =>
                          updateSplit(index, "collaboratorEmail", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>分成比例 (%)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={split.percentage}
                        onChange={(e) =>
                          updateSplit(index, "percentage", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addSplit}
                disabled={totalSplitPercentage >= 100}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                添加协作者
              </Button>

              {/* Summary */}
              <div className="rounded-lg border p-4 space-y-2">
                <h4 className="font-medium">收益分配预览</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>平台服务费</span>
                    <span>10%</span>
                  </div>
                  <div className="flex justify-between text-primary">
                    <span>您的收益</span>
                    <span>{(creatorPercentage * 0.9).toFixed(1)}%</span>
                  </div>
                  {splits.map((split, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{split.collaboratorEmail || `协作者 ${index + 1}`}</span>
                      <span>{(split.percentage * 0.9).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            上一步
          </Button>

          {step < 3 ? (
            <Button type="button" onClick={nextStep}>
              下一步
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  提交审核
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

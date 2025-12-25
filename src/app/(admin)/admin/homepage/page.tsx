"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Save, Eye, Loader2 } from "lucide-react";
import { getHomepageSettings, updateHomepageSettings } from "./actions";
import { HomepageSettings } from "@/types/database";
import Link from "next/link";

export default function HomepageSettingsPage() {
  const [settings, setSettings] = useState<HomepageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await getHomepageSettings();
      setSettings(data);
    } catch {
      toast({
        title: "加载失败",
        description: "无法加载首页设置",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateHomepageSettings(formData);

    if (result.success) {
      toast({
        title: "保存成功",
        description: "首页设置已更新",
      });
    } else {
      toast({
        title: "保存失败",
        description: result.error || "请稍后重试",
        variant: "destructive",
      });
    }

    setSaving(false);
  }

  function handleChange(field: keyof HomepageSettings, value: string) {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">无法加载设置</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">首页设置</h1>
          <p className="text-muted-foreground">
            编辑首页显示的文案和链接
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/" target="_blank">
            <Eye className="mr-2 h-4 w-4" />
            预览首页
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hero Section */}
        <Card>
          <CardHeader>
            <CardTitle>Hero 区域</CardTitle>
            <CardDescription>
              首页顶部的主要展示区域
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hero_title_line1">标题第一行</Label>
                <Input
                  id="hero_title_line1"
                  name="hero_title_line1"
                  value={settings.hero_title_line1}
                  onChange={(e) => handleChange("hero_title_line1", e.target.value)}
                  placeholder="探索前沿的"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero_title_line2">标题第二行</Label>
                <Input
                  id="hero_title_line2"
                  name="hero_title_line2"
                  value={settings.hero_title_line2}
                  onChange={(e) => handleChange("hero_title_line2", e.target.value)}
                  placeholder="AI创作灵感"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hero_subtitle">副标题</Label>
              <Textarea
                id="hero_subtitle"
                name="hero_subtitle"
                value={settings.hero_subtitle}
                onChange={(e) => handleChange("hero_subtitle", e.target.value)}
                placeholder="SnapStudio 连接创作者与收藏家..."
                rows={3}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hero_button_primary_text">主按钮文字</Label>
                <Input
                  id="hero_button_primary_text"
                  name="hero_button_primary_text"
                  value={settings.hero_button_primary_text}
                  onChange={(e) => handleChange("hero_button_primary_text", e.target.value)}
                  placeholder="开始浏览"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero_button_primary_link">主按钮链接</Label>
                <Input
                  id="hero_button_primary_link"
                  name="hero_button_primary_link"
                  value={settings.hero_button_primary_link}
                  onChange={(e) => handleChange("hero_button_primary_link", e.target.value)}
                  placeholder="/browse"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hero_button_secondary_text">次按钮文字</Label>
                <Input
                  id="hero_button_secondary_text"
                  name="hero_button_secondary_text"
                  value={settings.hero_button_secondary_text}
                  onChange={(e) => handleChange("hero_button_secondary_text", e.target.value)}
                  placeholder="成为创作者"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero_button_secondary_link">次按钮链接</Label>
                <Input
                  id="hero_button_secondary_link"
                  name="hero_button_secondary_link"
                  value={settings.hero_button_secondary_link}
                  onChange={(e) => handleChange("hero_button_secondary_link", e.target.value)}
                  placeholder="/register"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Titles */}
        <Card>
          <CardHeader>
            <CardTitle>区块标题</CardTitle>
            <CardDescription>
              各个内容区块的标题
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="section_blog_title">博客区块标题</Label>
                <Input
                  id="section_blog_title"
                  name="section_blog_title"
                  value={settings.section_blog_title}
                  onChange={(e) => handleChange("section_blog_title", e.target.value)}
                  placeholder="最新动态"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section_top_rated_title">高分榜单标题</Label>
                <Input
                  id="section_top_rated_title"
                  name="section_top_rated_title"
                  value={settings.section_top_rated_title}
                  onChange={(e) => handleChange("section_top_rated_title", e.target.value)}
                  placeholder="高分榜单"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section_latest_title">最新上架标题</Label>
                <Input
                  id="section_latest_title"
                  name="section_latest_title"
                  value={settings.section_latest_title}
                  onChange={(e) => handleChange("section_latest_title", e.target.value)}
                  placeholder="最新上架"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card>
          <CardHeader>
            <CardTitle>CTA 区域</CardTitle>
            <CardDescription>
              页面底部的行动召唤区域
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cta_title">CTA 标题</Label>
              <Input
                id="cta_title"
                name="cta_title"
                value={settings.cta_title}
                onChange={(e) => handleChange("cta_title", e.target.value)}
                placeholder="准备好分享你的作品了吗？"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta_subtitle">CTA 副标题</Label>
              <Textarea
                id="cta_subtitle"
                name="cta_subtitle"
                value={settings.cta_subtitle}
                onChange={(e) => handleChange("cta_subtitle", e.target.value)}
                placeholder="加入 SnapStudio..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cta_button_text">CTA 按钮文字</Label>
                <Input
                  id="cta_button_text"
                  name="cta_button_text"
                  value={settings.cta_button_text}
                  onChange={(e) => handleChange("cta_button_text", e.target.value)}
                  placeholder="立即注册"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta_button_link">CTA 按钮链接</Label>
                <Input
                  id="cta_button_link"
                  name="cta_button_link"
                  value={settings.cta_button_link}
                  onChange={(e) => handleChange("cta_button_link", e.target.value)}
                  placeholder="/register"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存设置
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Last updated info */}
      {settings.updated_at && (
        <p className="text-sm text-muted-foreground text-right">
          上次更新: {new Date(settings.updated_at).toLocaleString("zh-CN")}
        </p>
      )}
    </div>
  );
}

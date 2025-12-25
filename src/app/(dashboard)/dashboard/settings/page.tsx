"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { User, Lock, Loader2, Save } from "lucide-react";
import { updateProfile, updatePassword } from "./actions";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [profile, setProfile] = useState({
    display_name: "",
    bio: "",
    avatar_url: "",
    email: "",
  });

  const [passwords, setPasswords] = useState({
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("display_name, bio, avatar_url")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile({
          display_name: data.display_name || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
          email: user.email || "",
        });
      }

      setIsLoading(false);
    };

    fetchProfile();
  }, [router]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    const formData = new FormData();
    formData.append("display_name", profile.display_name);
    formData.append("bio", profile.bio);
    formData.append("avatar_url", profile.avatar_url);

    const result = await updateProfile(formData);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "保存失败",
        description: result.error,
      });
    } else {
      toast({
        title: "保存成功",
        description: "您的个人资料已更新",
      });
    }

    setIsSavingProfile(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPassword(true);

    const formData = new FormData();
    formData.append("new_password", passwords.new_password);
    formData.append("confirm_password", passwords.confirm_password);

    const result = await updatePassword(formData);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "修改失败",
        description: result.error,
      });
    } else {
      toast({
        title: "修改成功",
        description: "您的密码已更新",
      });
      setPasswords({ new_password: "", confirm_password: "" });
    }

    setIsSavingPassword(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">个人设置</h1>
        <p className="text-muted-foreground">
          管理您的账户信息和安全设置
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            个人资料
          </CardTitle>
          <CardDescription>
            更新您的公开信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                邮箱地址不可修改
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_name">显示名称</Label>
              <Input
                id="display_name"
                placeholder="您的显示名称"
                value={profile.display_name}
                onChange={(e) =>
                  setProfile({ ...profile, display_name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">个人简介</Label>
              <Textarea
                id="bio"
                placeholder="介绍一下自己..."
                rows={4}
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar_url">头像 URL</Label>
              <Input
                id="avatar_url"
                placeholder="https://example.com/avatar.jpg"
                value={profile.avatar_url}
                onChange={(e) =>
                  setProfile({ ...profile, avatar_url: e.target.value })
                }
              />
            </div>

            {profile.avatar_url && (
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.avatar_url}
                    alt="头像预览"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">头像预览</span>
              </div>
            )}

            <Button type="submit" disabled={isSavingProfile}>
              {isSavingProfile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  保存更改
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Password Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            修改密码
          </CardTitle>
          <CardDescription>
            更新您的登录密码
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_password">新密码</Label>
              <Input
                id="new_password"
                type="password"
                placeholder="至少 6 个字符"
                value={passwords.new_password}
                onChange={(e) =>
                  setPasswords({ ...passwords, new_password: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">确认新密码</Label>
              <Input
                id="confirm_password"
                type="password"
                placeholder="再次输入新密码"
                value={passwords.confirm_password}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    confirm_password: e.target.value,
                  })
                }
              />
            </div>

            <Button
              type="submit"
              disabled={isSavingPassword || !passwords.new_password}
            >
              {isSavingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  修改中...
                </>
              ) : (
                "修改密码"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

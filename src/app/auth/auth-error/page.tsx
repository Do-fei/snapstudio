import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center">
          <Link href="/" className="text-xl font-bold tracking-tight">
            SnapStudio
          </Link>
        </div>
      </header>

      {/* Error Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold">验证失败</CardTitle>
              <CardDescription className="text-base">
                邮箱验证链接无效或已过期
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">
                这可能是因为：
              </p>
              <ul className="text-sm text-muted-foreground text-left list-disc pl-6 space-y-1">
                <li>链接已过期（通常有效期为 24 小时）</li>
                <li>链接已被使用过</li>
                <li>链接格式不正确</li>
              </ul>
              <div className="pt-4 space-y-2">
                <Button className="w-full" asChild>
                  <Link href="/register">重新注册</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/forgot-password">重置密码</Link>
                </Button>
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/">返回首页</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SnapStudio. 保留所有权利。
        </div>
      </footer>
    </div>
  );
}

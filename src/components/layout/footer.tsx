import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="text-xl font-bold tracking-tight">
              SnapStudio
            </Link>
            <p className="text-sm text-muted-foreground">
              发现、购买和销售独特的数字艺术作品。连接创作者与收藏家的平台。
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">浏览</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/browse" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  全部作品
                </Link>
              </li>
              <li>
                <Link 
                  href="/browse?sort=top" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  高分榜单
                </Link>
              </li>
              <li>
                <Link 
                  href="/browse?sort=new" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  最新上架
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">资源</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/blog" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  官方博客
                </Link>
              </li>
              <li>
                <Link 
                  href="/help" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  帮助中心
                </Link>
              </li>
              <li>
                <Link 
                  href="/register" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  成为创作者
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">法律</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/terms" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  服务条款
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  隐私政策
                </Link>
              </li>
              <li>
                <Link 
                  href="/copyright" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  版权声明
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} SnapStudio. 保留所有权利。
          </p>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              平台抽成: 10%
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

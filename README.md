# SnapStudio V2.2

一个现代化的数字艺术市场平台，连接创作者与收藏家。

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue)

---

## ✨ 功能特性

### 用户认证
- 📧 邮箱 + 密码注册/登录
- 🔐 邮箱验证
- 🔄 密码重置流程

### 市场功能
- 🛒 浏览和搜索作品
- 💳 购买数字艺术作品
- ⭐ 评分和评价系统
- 📊 智能排序（评分加权算法）

### 创作者工作台
- 📤 3步上传向导
- 💰 收益管理和分账
- 📈 数据可视化

### 管理后台
- 📝 博客 CMS
- ✅ 作品审核队列
- 📊 平台数据分析

---

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **样式**: Tailwind CSS + Shadcn UI
- **图标**: Lucide React
- **表单**: React Hook Form + Zod
- **图表**: Recharts

---

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填入您的 Supabase 配置：

```bash
cp .env.example .env.local
```

### 3. 初始化数据库

在 Supabase SQL Editor 中执行 `supabase/schema.sql`

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

---

## 📁 项目结构

```
snapstudio/
├── src/
│   ├── app/
│   │   ├── (admin)/        # 管理后台
│   │   ├── (auth)/         # 认证页面
│   │   ├── (dashboard)/    # 创作者工作台
│   │   ├── (public)/       # 公共页面
│   │   └── auth/           # 认证回调
│   ├── components/
│   │   ├── layout/         # 布局组件
│   │   ├── product/        # 商品组件
│   │   └── ui/             # Shadcn UI
│   ├── lib/
│   │   ├── supabase/       # Supabase 配置
│   │   └── validations/    # 表单验证
│   └── types/              # TypeScript 类型
├── supabase/
│   └── schema.sql          # 数据库架构
└── DEPLOYMENT.md           # 部署指南
```

---

## 📖 部署

详细部署步骤请参阅 [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 📄 许可证

MIT License

---

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)

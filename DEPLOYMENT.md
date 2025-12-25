# SnapStudio V2.2 部署指南

本文档将指导您完成 SnapStudio 的永久部署。

---

## 前置要求

- [Node.js](https://nodejs.org/) 18.x 或更高版本
- [pnpm](https://pnpm.io/) 包管理器
- [Supabase](https://supabase.com/) 账户（免费）
- [Vercel](https://vercel.com/) 账户（免费）或其他托管平台
- [GitHub](https://github.com/) 账户（可选，用于 CI/CD）

---

## 第一步：配置 Supabase

### 1.1 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project"
3. 填写项目信息：
   - **Name**: SnapStudio（或您喜欢的名称）
   - **Database Password**: 设置一个强密码（请保存好）
   - **Region**: 选择离您最近的区域
4. 点击 "Create new project"，等待项目创建完成（约2分钟）

### 1.2 执行数据库 Schema

1. 在 Supabase Dashboard 中，点击左侧 "SQL Editor"
2. 点击 "New query"
3. 复制 `supabase/schema.sql` 文件的全部内容并粘贴
4. 点击 "Run" 执行 SQL
5. 确认所有表和函数创建成功

### 1.3 获取 API 密钥

1. 点击左侧 "Project Settings" → "API"
2. 记录以下信息：
   - **Project URL**: `https://xxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 1.4 配置邮件模板（可选但推荐）

1. 点击 "Authentication" → "Email Templates"
2. 自定义以下模板：
   - **Confirm signup**: 注册确认邮件
   - **Reset password**: 密码重置邮件

### 1.5 配置重定向 URL

1. 点击 "Authentication" → "URL Configuration"
2. 添加您的域名到 "Redirect URLs"：
   - `https://your-domain.com/**`
   - `https://your-project.vercel.app/**`

---

## 第二步：部署到 Vercel（推荐）

### 2.1 准备 GitHub 仓库

```bash
# 初始化 Git 仓库
git init
git add .
git commit -m "Initial commit: SnapStudio V2.2"

# 在 GitHub 创建新仓库后执行
git remote add origin https://github.com/YOUR_USERNAME/snapstudio.git
git branch -M main
git push -u origin main
```

### 2.2 部署到 Vercel

1. 访问 [Vercel](https://vercel.com/) 并登录
2. 点击 "Add New..." → "Project"
3. 选择 "Import Git Repository"
4. 选择您的 `snapstudio` 仓库
5. 配置项目：
   - **Framework Preset**: Next.js（自动检测）
   - **Root Directory**: `./`（默认）
6. 展开 "Environment Variables"，添加：
   ```
   NEXT_PUBLIC_SUPABASE_URL = 您的Supabase项目URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY = 您的Supabase匿名密钥
   ```
7. 点击 "Deploy"
8. 等待部署完成（约2-3分钟）

### 2.3 获取您的域名

部署成功后，您将获得：
- 默认域名：`https://snapstudio-xxx.vercel.app`
- 可以在 Settings → Domains 添加自定义域名

---

## 第三步：创建管理员账户

### 3.1 注册账户

1. 访问您部署的网站 `/register`
2. 使用您的邮箱注册账户
3. 查收确认邮件并点击链接激活

### 3.2 提升为管理员

1. 回到 Supabase Dashboard → SQL Editor
2. 执行以下 SQL：

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

3. 现在您可以访问 `/admin` 管理后台了

---

## 备选方案：其他部署平台

### Netlify

1. 构建项目：`pnpm build`
2. 在 Netlify 创建新站点
3. 上传 `.next` 目录或连接 GitHub
4. 配置环境变量

### Railway

1. 连接 GitHub 仓库
2. 配置环境变量
3. 自动部署

### 自托管 (VPS/云服务器)

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 使用 PM2 运行
npm install -g pm2
pm2 start npm --name "snapstudio" -- start

# 配置 Nginx 反向代理（可选）
```

---

## 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJhbGci...` |

---

## 常见问题

### Q: 邮件发送失败？
A: 检查 Supabase 的 SMTP 配置，免费版每小时限制 4 封邮件。

### Q: 登录后跳转失败？
A: 确保在 Supabase Authentication → URL Configuration 中添加了正确的重定向 URL。

### Q: 图片无法显示？
A: 检查 `next.config.mjs` 中的 `images.remotePatterns` 配置。

---

## 技术支持

如有问题，请检查：
1. Supabase Dashboard 的 Logs
2. Vercel 的 Function Logs
3. 浏览器控制台错误信息

---

祝您部署顺利！🚀

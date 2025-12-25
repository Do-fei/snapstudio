/**
 * Demo Mode Data Provider
 * Provides mock data for demonstration without real Supabase connection
 */

// Demo user accounts
export const DEMO_USERS = {
  admin: {
    id: "demo-admin-001",
    email: "admin@demo.com",
    password: "demo123",
    username: "admin",
    display_name: "管理员",
    avatar_url: null,
    bio: "SnapStudio 平台管理员",
    role: "admin" as const,
    balance: 10000,
  },
  creator: {
    id: "demo-creator-001",
    email: "creator@demo.com",
    password: "demo123",
    username: "artist",
    display_name: "艺术家小王",
    avatar_url: null,
    bio: "数字艺术创作者，专注于 AI 生成艺术",
    role: "creator" as const,
    balance: 5680,
  },
  user: {
    id: "demo-user-001",
    email: "user@demo.com",
    password: "demo123",
    username: "collector",
    display_name: "收藏家小李",
    avatar_url: null,
    bio: "数字艺术爱好者",
    role: "user" as const,
    balance: 1000,
  },
};

// Demo products
export const DEMO_PRODUCTS = [
  {
    id: "prod-001",
    creator_id: "demo-creator-001",
    title: "赛博朋克城市",
    slug: "cyberpunk-city",
    description: "一幅充满未来感的赛博朋克城市景观，融合了霓虹灯光与高科技建筑。使用 Midjourney 和 Photoshop 精心制作。",
    price: 299,
    cover_image: "https://images.unsplash.com/photo-1573455494060-c5595004fb6c?w=800",
    preview_images: [],
    file_url: null,
    file_type: "image/png",
    file_size: 15728640,
    status: "approved" as const,
    view_count: 1234,
    download_count: 89,
    avg_rating: 4.8,
    rating_count: 45,
    weighted_score: 4.6,
    is_featured: true,
    published_at: "2024-12-20T10:00:00Z",
    created_at: "2024-12-15T08:00:00Z",
    updated_at: "2024-12-20T10:00:00Z",
    creator_name: "艺术家小王",
    creator_avatar: null,
  },
  {
    id: "prod-002",
    creator_id: "demo-creator-001",
    title: "梦幻森林",
    slug: "dream-forest",
    description: "神秘的梦幻森林场景，光影交织，充满魔幻色彩。适合用作壁纸或设计素材。",
    price: 199,
    cover_image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800",
    preview_images: [],
    file_url: null,
    file_type: "image/png",
    file_size: 12582912,
    status: "approved" as const,
    view_count: 856,
    download_count: 56,
    avg_rating: 4.5,
    rating_count: 32,
    weighted_score: 4.3,
    is_featured: false,
    published_at: "2024-12-18T14:00:00Z",
    created_at: "2024-12-10T09:00:00Z",
    updated_at: "2024-12-18T14:00:00Z",
    creator_name: "艺术家小王",
    creator_avatar: null,
  },
  {
    id: "prod-003",
    creator_id: "demo-creator-001",
    title: "抽象几何艺术",
    slug: "abstract-geometry",
    description: "现代抽象几何艺术作品，色彩鲜明，线条流畅。可用于室内装饰或数字展示。",
    price: 159,
    cover_image: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=800",
    preview_images: [],
    file_url: null,
    file_type: "image/png",
    file_size: 8388608,
    status: "approved" as const,
    view_count: 567,
    download_count: 34,
    avg_rating: 4.2,
    rating_count: 18,
    weighted_score: 3.9,
    is_featured: false,
    published_at: "2024-12-22T09:00:00Z",
    created_at: "2024-12-20T11:00:00Z",
    updated_at: "2024-12-22T09:00:00Z",
    creator_name: "艺术家小王",
    creator_avatar: null,
  },
  {
    id: "prod-004",
    creator_id: "demo-creator-001",
    title: "星空银河",
    slug: "galaxy-stars",
    description: "壮观的星空银河景象，展现宇宙的浩瀚与神秘。高分辨率，适合大尺寸打印。",
    price: 399,
    cover_image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800",
    preview_images: [],
    file_url: null,
    file_type: "image/png",
    file_size: 20971520,
    status: "approved" as const,
    view_count: 2345,
    download_count: 156,
    avg_rating: 4.9,
    rating_count: 78,
    weighted_score: 4.8,
    is_featured: true,
    published_at: "2024-12-19T16:00:00Z",
    created_at: "2024-12-12T10:00:00Z",
    updated_at: "2024-12-19T16:00:00Z",
    creator_name: "艺术家小王",
    creator_avatar: null,
  },
  {
    id: "prod-005",
    creator_id: "demo-creator-001",
    title: "水墨山水",
    slug: "ink-landscape",
    description: "传统中国水墨风格的山水画，融合现代 AI 技术重新诠释经典美学。",
    price: 259,
    cover_image: "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=800",
    preview_images: [],
    file_url: null,
    file_type: "image/png",
    file_size: 10485760,
    status: "pending" as const,
    view_count: 0,
    download_count: 0,
    avg_rating: 0,
    rating_count: 0,
    weighted_score: 0,
    is_featured: false,
    published_at: null,
    created_at: "2024-12-23T08:00:00Z",
    updated_at: "2024-12-23T08:00:00Z",
    creator_name: "艺术家小王",
    creator_avatar: null,
  },
];

// Demo blog posts
export const DEMO_POSTS = [
  {
    id: "post-001",
    author_id: "demo-admin-001",
    title: "欢迎来到 SnapStudio",
    slug: "welcome-to-snapstudio",
    excerpt: "SnapStudio 是一个连接数字艺术创作者与收藏家的平台，让每一件作品都能找到它的归属。",
    content: `# 欢迎来到 SnapStudio

我们很高兴地宣布 SnapStudio 正式上线！

## 我们的愿景

SnapStudio 致力于打造一个公平、透明的数字艺术交易平台。我们相信每一位创作者的作品都值得被看见，每一位收藏家都能找到心仪的艺术品。

## 平台特色

- **公平分账**：创作者获得 90% 的销售收入
- **透明交易**：所有交易记录清晰可查
- **优质社区**：汇聚全球优秀的数字艺术家

## 开始探索

现在就开始浏览我们的作品库，发现独特的数字艺术作品吧！

感谢您的支持！

— SnapStudio 团队`,
    cover_image: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800",
    is_published: true,
    is_featured: true,
    view_count: 1256,
    published_at: "2024-12-15T10:00:00Z",
    created_at: "2024-12-14T08:00:00Z",
    updated_at: "2024-12-15T10:00:00Z",
    author: {
      display_name: "管理员",
      avatar_url: null,
      username: "admin",
    },
  },
  {
    id: "post-002",
    author_id: "demo-admin-001",
    title: "AI 艺术创作指南",
    slug: "ai-art-creation-guide",
    excerpt: "想要开始 AI 艺术创作？这篇指南将带你入门，了解常用工具和技巧。",
    content: `# AI 艺术创作指南

AI 艺术正在改变创作的方式。本指南将帮助你开始你的 AI 艺术之旅。

## 常用工具

1. **Midjourney** - 强大的图像生成工具
2. **Stable Diffusion** - 开源的 AI 绘画模型
3. **DALL-E** - OpenAI 的图像生成服务

## 创作技巧

### 提示词编写

好的提示词是成功的一半。尝试：
- 描述具体的场景和氛围
- 指定艺术风格和参考艺术家
- 使用技术参数控制输出

### 后期处理

AI 生成的图像通常需要后期处理：
- 使用 Photoshop 进行细节调整
- 提升分辨率
- 色彩校正

## 开始创作

现在就开始你的 AI 艺术创作之旅吧！

— SnapStudio 团队`,
    cover_image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800",
    is_published: true,
    is_featured: false,
    view_count: 892,
    published_at: "2024-12-20T14:00:00Z",
    created_at: "2024-12-19T10:00:00Z",
    updated_at: "2024-12-20T14:00:00Z",
    author: {
      display_name: "管理员",
      avatar_url: null,
      username: "admin",
    },
  },
  {
    id: "post-003",
    author_id: "demo-admin-001",
    title: "创作者收益指南",
    slug: "creator-earnings-guide",
    excerpt: "了解如何在 SnapStudio 上获得收益，以及我们的分账机制。",
    content: `# 创作者收益指南

在 SnapStudio，我们致力于为创作者提供公平的收益分配。

## 分账机制

- **创作者获得 90%** 的销售收入
- **平台收取 10%** 作为服务费用

## 收益提现

- 最低提现金额：100 元
- 提现周期：T+3 工作日
- 支持支付宝、银行卡

## 提升销量技巧

1. 优化作品标题和描述
2. 使用高质量的预览图
3. 积极参与社区互动
4. 定期发布新作品

祝你创作愉快！

— SnapStudio 团队`,
    cover_image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800",
    is_published: false,
    is_featured: false,
    view_count: 0,
    published_at: null,
    created_at: "2024-12-22T09:00:00Z",
    updated_at: "2024-12-22T09:00:00Z",
    author: {
      display_name: "管理员",
      avatar_url: null,
      username: "admin",
    },
  },
];

// Demo reviews
export const DEMO_REVIEWS = [
  {
    id: "review-001",
    product_id: "prod-001",
    user_id: "demo-user-001",
    rating: 5,
    comment: "非常棒的作品！细节丰富，色彩绚丽，完全超出预期。强烈推荐！",
    is_verified_purchase: true,
    created_at: "2024-12-21T15:00:00Z",
    updated_at: "2024-12-21T15:00:00Z",
    user: {
      display_name: "收藏家小李",
      avatar_url: null,
      username: "collector",
    },
  },
  {
    id: "review-002",
    product_id: "prod-001",
    user_id: "demo-user-002",
    rating: 4,
    comment: "画面很有氛围感，适合做桌面壁纸。",
    is_verified_purchase: true,
    created_at: "2024-12-20T10:00:00Z",
    updated_at: "2024-12-20T10:00:00Z",
    user: {
      display_name: "匿名用户",
      avatar_url: null,
      username: "anonymous",
    },
  },
  {
    id: "review-003",
    product_id: "prod-004",
    user_id: "demo-user-001",
    rating: 5,
    comment: "震撼！打印出来挂在客厅，效果绝佳！",
    is_verified_purchase: true,
    created_at: "2024-12-22T08:00:00Z",
    updated_at: "2024-12-22T08:00:00Z",
    user: {
      display_name: "收藏家小李",
      avatar_url: null,
      username: "collector",
    },
  },
];

// Demo transactions
export const DEMO_TRANSACTIONS = [
  {
    id: "txn-001",
    buyer_id: "demo-user-001",
    product_id: "prod-001",
    amount: 299,
    platform_fee: 29.9,
    creator_revenue: 269.1,
    status: "completed" as const,
    payment_method: "alipay",
    payment_reference: "ALI202412210001",
    created_at: "2024-12-21T14:30:00Z",
    completed_at: "2024-12-21T14:30:05Z",
    product: {
      title: "赛博朋克城市",
      cover_image: "https://images.unsplash.com/photo-1573455494060-c5595004fb6c?w=800",
      slug: "cyberpunk-city",
    },
  },
  {
    id: "txn-002",
    buyer_id: "demo-user-001",
    product_id: "prod-004",
    amount: 399,
    platform_fee: 39.9,
    creator_revenue: 359.1,
    status: "completed" as const,
    payment_method: "wechat",
    payment_reference: "WX202412220001",
    created_at: "2024-12-22T09:15:00Z",
    completed_at: "2024-12-22T09:15:03Z",
    product: {
      title: "星空银河",
      cover_image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800",
      slug: "galaxy-stars",
    },
  },
];

// Demo homepage settings
export const DEMO_HOMEPAGE_SETTINGS = {
  id: "00000000-0000-0000-0000-000000000001",
  hero_title_line1: "每一个创意都值得被尊重",
  hero_title_line2: "行动起来！像一纸禅一样！",
  hero_subtitle: "SnapStudio 连接创作者与收藏家，让您的作品都能找到它的归属。公平分账，透明交易。",
  hero_button_primary_text: "开始浏览",
  hero_button_primary_link: "/browse",
  hero_button_secondary_text: "成为创作者",
  hero_button_secondary_link: "/register",
  cta_title: "准备好分享你的作品了吗？",
  cta_subtitle: "动起来吧！就像一纸禅一样",
  cta_button_text: "立即注册",
  cta_button_link: "/register",
  section_top_rated_title: "高分榜单",
  section_latest_title: "最新上架",
  section_blog_title: "最新动态",
  updated_at: "2024-12-23T10:00:00Z",
  updated_by: "demo-admin-001",
};

// Demo platform stats
export const DEMO_PLATFORM_STATS = {
  total_users: 1256,
  total_creators: 89,
  total_products: 342,
  total_transactions: 1567,
  total_revenue: 156780,
  total_platform_fees: 15678,
  total_posts: 12,
};

// Check if running in demo mode
export const IS_DEMO_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder") || 
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_DEMO_MODE === "true";

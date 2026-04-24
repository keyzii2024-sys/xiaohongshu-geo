# 小红薯GEO (SweetRed GEO) - SETUP 指南

本项目基于 Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Supabase 构建。请按照以下步骤进行本地开发环境的配置和数据库初始化。

## 1. 运行 Next.js 本地开发服务器

在开始前，请确保你已经安装了 Node.js (建议 v18+) 和 npm。

1. 进入项目目录：
   ```bash
   cd xiaohongshu-geo
   ```
2. 安装依赖 (如果尚未安装)：
   ```bash
   npm install
   ```
3. 启动开发服务器：
   ```bash
   npm run dev
   ```
4. 在浏览器中访问 `http://localhost:3000` 即可看到应用。

## 2. 初始化 Supabase 数据库

本项目使用 Supabase 作为后端服务（含数据库和 Auth）。为了让项目能够正常运行，你需要在 Supabase 后台执行 SQL 建表脚本。

1. 登录你的 [Supabase 控制台](https://app.supabase.com/)。
2. 创建一个新项目 (New Project)。
3. 在项目创建完成后，点击左侧菜单栏的 **"SQL Editor"**。
4. 点击 **"New Query"**。
5. 复制本项目 `supabase/migrations/00000000000000_init_schema.sql` 文件中的所有 SQL 内容。
6. 将 SQL 内容粘贴到 Query 编辑器中。
7. 点击右下角的 **"Run"** 执行脚本。这将会为你创建所需的 12 张核心数据表（如 `brands`, `user_brands`, `geo_metrics_daily` 等）。

如果你的 Supabase 项目已经对 `brands` / `user_brands` 启用了 RLS，还需要继续执行 `supabase/migrations/00000000000001_auth_brand_rls.sql`。这一步会补齐当前登录用户创建默认品牌和查询自身品牌归属所需的策略，否则首次进入 `/dashboard` 时会因为 RLS 拒绝写入而报错。

## 3. 配置环境变量

在本地运行项目连接到你刚才创建的 Supabase 项目，还需要配置环境变量：

1. 在 `xiaohongshu-geo` 目录下创建一个 `.env.local` 文件。
2. 填入你的 Supabase 项目 URL 和 Anon Key（在 Supabase 控制台的 **Project Settings -> API** 中可以找到）：

```env
NEXT_PUBLIC_SUPABASE_URL=你的_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_SUPABASE_ANON_KEY
```

重启 `npm run dev` 即可使环境变量生效。

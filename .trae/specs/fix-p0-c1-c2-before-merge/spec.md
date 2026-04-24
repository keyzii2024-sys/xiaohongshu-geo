# 竞品管理 P0 合流修复 Spec

## Why
合流前深度自检发现两个 P0 级问题：C-1（`getBrandIdForBrowser` 函数在 competitors 和 accounts 页面重复定义）和 C-2（竞品 CRUD 操作未封装到独立层，与 accounts 模块架构不一致）。必须在合流前修复以确保跨模块代码规范统一。

## What Changes
- **C-1 修复**：在 `@/lib/auth/brands.ts` 中新增浏览器端 `getBrandIdForBrowser()` 函数
- **C-2 修复**：新建 `@/lib/competitors/crud.ts` 封装 CRUD 层（参照 accounts/crud.ts 模式）
- **重构 competitors/page.tsx**：移除内联的 `getBrandIdForBrowser()`、内联 CRUD 调用，改为引用公共模块

## Impact
- 新增文件：`src/lib/competitors/crud.ts`
- 修改文件：`src/lib/auth/brands.ts`（新增导出函数）、`src/app/settings/competitors/page.tsx`（重构引用）
- 影响范围：仅竞品管理模块内部重构，不改变任何外部行为

## ADDED Requirements

### Requirement: C-1 公共品牌 ID 获取函数
系统 SHALL 在 `@/lib/auth/brands.ts` 中提供浏览器端品牌 ID 获取函数。

#### Scenario: 浏览器端获取品牌 ID
- **WHEN** 客户端组件调用 `getBrandIdForBrowser()`
- **THEN** 返回当前登录用户的主 brand_id（string），未登录时返回 null

### Requirement: C-2 竞品 CRUD 封装层
系统 SHALL 提供 `@/lib/competitors/crud.ts` 封装层，包含以下函数：

#### getCompetitors(brandId)
- 输入：brandId: string
- 输出：Competitor[]
- 行为：查询 competitors 表，按 created_at 倒序，normalize keywords 类型

#### createCompetitor(brandId, input)
- 输入：brandId + CreateCompetitorInput
- 输出：Competitor
- 行为：插入新竞品，keywords 字符串转数组

#### updateCompetitor(id, input)
- 输入：id + UpdateCompetitorInput
- 输出：Competitor
- 行为：更新竞品字段

#### deleteCompetitor(id)
- 输入：id
- 输出：void
- 行为：删除指定竞品

### Requirement: 页面组件重构
`competitors/page.tsx` SHALL 移除所有内联工具函数和直接 Supabase 调用，改为引用公共模块。

## MODIFIED Requirements
无破坏性变更，纯内部重构。

## REMOVED Requirements
无。

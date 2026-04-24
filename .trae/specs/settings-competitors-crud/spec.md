# 竞品管理模块 Spec

## Why
竞品管理是 GEO 项目中维护监测名单、对标品牌范围与竞品分组关系的核心功能。当前 settings 页面仅有入口占位，需要实现完整的竞品列表展示与 CRUD 操作。

## What Changes
- 新增 `src/app/settings/competitors/page.tsx` 竞品管理完整页面
- 支持竞品列表展示、添加、编辑、删除
- Supabase `competitors` 表 CRUD 接口对接
- 基础搜索筛选功能

## Impact
- 新增文件：`src/app/settings/competitors/page.tsx`
- 需修改：`src/app/settings/page.tsx`（将 `isAvailable` 改为 `true`）
- 依赖：`lib/supabase/browser.ts`、`lib/auth/brands.ts`

## ADDED Requirements

### Requirement: 竞品列表展示
系统 SHALL 从 Supabase `competitors` 表获取当前品牌的所有竞品，并按创建时间倒序展示。

#### Scenario: 正常加载
- **WHEN** 用户访问 `/settings/competitors`
- **THEN** 显示竞品列表，包含竞品名称、域名、关键词、创建时间

#### Scenario: 空状态
- **WHEN** 当前品牌没有任何竞品
- **THEN** 显示空状态提示"暂无竞品，请添加第一个竞品"

#### Scenario: 加载异常
- **WHEN** Supabase 查询失败
- **THEN** 显示错误提示，允许重试

### Requirement: 添加竞品
系统 SHALL 支持添加新竞品到当前品牌。

#### Scenario: 成功添加
- **WHEN** 用户填写竞品名称（必填）和域名（可选）并提交
- **THEN** 竞品保存到 Supabase，列表刷新显示新竞品

#### Scenario: 表单验证
- **WHEN** 用户未填写竞品名称就提交
- **THEN** 显示"请填写竞品名称"错误提示

### Requirement: 编辑竞品
系统 SHALL 支持编辑已有竞品信息。

#### Scenario: 成功编辑
- **WHEN** 用户修改竞品信息并提交
- **THEN** 更新 Supabase 数据，列表刷新显示更新后内容

### Requirement: 删除竞品
系统 SHALL 支持删除竞品。

#### Scenario: 成功删除
- **WHEN** 用户确认删除某个竞品
- **THEN** 从 Supabase 删除该记录，列表刷新

#### Scenario: 取消删除
- **WHEN** 用户在删除确认弹窗中取消
- **THEN** 不执行删除操作

### Requirement: 搜索筛选
系统 SHALL 支持按竞品名称或域名关键词搜索。

#### Scenario: 正常搜索
- **WHEN** 用户在搜索框输入关键词
- **THEN** 列表实时筛选显示匹配的竞品

## MODIFIED Requirements

### Requirement: Settings 入口状态
将 `src/app/settings/page.tsx` 中竞品管理模块的 `isAvailable` 从 `false` 改为 `true`。

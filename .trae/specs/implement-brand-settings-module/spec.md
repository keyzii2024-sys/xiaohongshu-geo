# 品牌设置模块规格说明

## Why
为完善设置体系，需要实现品牌设置子模块，让用户能够编辑和管理自己品牌的基础信息（名称、域名、核心关键词、Logo），之前该入口仅有信息架构占位。

## What Changes
- 新增 `src/app/settings/brand/page.tsx` 品牌设置页面
- 包含品牌名称、域名、核心关键词、Logo URL 的编辑表单
- 对接 Supabase `brands` 表完成 CRUD 操作
- 遵循纯白极简杂志风 UI 规范

## Impact
- 受影响的功能：设置模块入口 `/settings/brand` 现已可访问
- 受影响的代码：
  - `src/app/settings/brand/page.tsx`（新增）
  - `src/app/settings/page.tsx`（状态标签更新）
- 不影响任何已完成的 Dashboard、数据导入、竞品分析等模块

## ADDED Requirements

### Requirement: 品牌设置页面
系统 SHALL 提供品牌设置页面，支持查看和编辑当前用户所属品牌的完整信息。

#### Scenario: 正常加载品牌数据
- **WHEN** 用户访问 `/settings/brand` 页面
- **THEN** 系统从 Supabase 查询当前用户的品牌数据并填充表单
- **AND** 若品牌数据不存在，表单显示为空供用户新增

#### Scenario: 保存品牌信息
- **WHEN** 用户填写品牌名称（必填）并点击保存
- **THEN** 系统验证必填字段后写入/更新 Supabase `brands` 表
- **AND** 保存成功后显示成功提示

#### Scenario: 编辑品牌信息
- **WHEN** 用户已有品牌数据并进入页面
- **THEN** 表单预填充现有品牌信息
- **AND** 用户可修改任意字段后保存更新

#### Scenario: Logo 上传（URL 占位）
- **WHEN** 用户在 Logo URL 输入框输入有效的图片 URL
- **THEN** 系统预览该图片是否可正常显示
- **AND** 保存后将 URL 写入 `logo_url` 字段

#### Scenario: 核心关键词管理
- **WHEN** 用户在关键词输入框输入关键词并确认
- **THEN** 系统将该关键词添加到关键词列表（JSONB 数组）
- **AND** 支持删除已添加的关键词

#### Scenario: 表单验证失败
- **WHEN** 用户未填写必填的品牌名称就点击保存
- **THEN** 系统显示验证错误提示，不提交请求

#### Scenario: 保存失败
- **WHEN** 保存请求因网络或数据库错误失败
- **THEN** 系统显示友好的错误提示，允许用户重试

## MODIFIED Requirements

### Requirement: 设置首页入口状态
**修改前**：`品牌设置` 入口显示"即将开放"标签
**修改后**：`品牌设置` 入口显示"当前可访问"标签，`isAvailable` 更新为 `true`

## REMOVED Requirements
无

## 技术细节

### 数据层
- **查询**：通过 `getPrimaryBrandIdForUser` 获取用户品牌 ID，再查询 `brands` 表
- **新增**：使用 `supabase.from('brands').insert()`
- **更新**：使用 `supabase.from('brands').upsert()` 按 ID 覆盖
- **关键词**：存储为 JSONB 数组，前端维护字符串数组

### 响应式适配
- 移动端：单列布局，表单垂直堆叠
- 桌面端：两栏布局（表单区 + 信息说明侧边栏）

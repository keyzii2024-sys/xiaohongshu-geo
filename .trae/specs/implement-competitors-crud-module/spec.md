# 竞品管理模块 Spec

## Why
需要在设置体系内完整落地竞品管理能力，补齐 `/settings/competitors` 入口。当前仅为占位入口，本次需实现完整的竞品列表展示、添加、编辑、删除全流程操作，并对接 Supabase `competitors` 表。

## What Changes
- 新增 `src/app/settings/competitors/page.tsx`，实现竞品管理完整页面
- 支持竞品列表展示、搜索筛选、添加、编辑、删除
- 对接 Supabase `competitors` 表完成 CRUD 接口
- 权限校验：仅当前品牌下的竞品可操作
- 异常捕获与操作反馈提示

## Impact
- Affected specs: 设置体系信息架构、品牌数据隔离
- Affected code: `src/app/settings/competitors/*`

## ADDED Requirements
### Requirement: 竞品列表展示
系统 SHALL 从 Supabase `competitors` 表读取当前品牌下的所有竞品，并完整展示列表。

#### Scenario: 正常展示竞品列表
- **WHEN** 用户访问 `/settings/competitors`
- **THEN** 系统查询当前品牌的全部竞品
- **THEN** 展示竞品名称、域名、关键词、创建时间

#### Scenario: 品牌下无竞品
- **WHEN** 当前品牌下无任何竞品记录
- **THEN** 展示空状态提示

### Requirement: 竞品搜索筛选
系统 SHALL 支持按竞品名称或域名进行实时搜索筛选。

#### Scenario: 搜索竞品
- **WHEN** 用户在搜索框输入关键词
- **THEN** 系统过滤显示匹配的竞品

### Requirement: 添加竞品
系统 SHALL 支持添加新竞品到当前品牌。

#### Scenario: 添加成功
- **WHEN** 用户填写竞品名称（必填）、域名、关键词并提交
- **THEN** 系统在 `competitors` 表创建新记录
- **THEN** 列表刷新显示新竞品
- **THEN** 显示成功提示

#### Scenario: 添加失败
- **WHEN** 用户提交但服务器返回错误
- **THEN** 显示错误提示，不关闭表单

### Requirement: 编辑竞品
系统 SHALL 支持编辑现有竞品信息。

#### Scenario: 编辑成功
- **WHEN** 用户点击编辑按钮，修改竞品信息并提交
- **THEN** 系统更新 `competitors` 表对应记录
- **THEN** 列表刷新显示更新后数据
- **THEN** 显示成功提示

### Requirement: 删除竞品
系统 SHALL 支持删除竞品。

#### Scenario: 删除成功
- **WHEN** 用户确认删除某竞品
- **THEN** 系统从 `competitors` 表删除对应记录
- **THEN** 列表刷新
- **THEN** 显示成功提示

### Requirement: 响应式适配
系统 SHALL 页面支持响应式布局，适配不同屏幕尺寸。

## MODIFIED Requirements
### Requirement: 设置页入口状态
**原内容**: 竞品管理入口显示"即将开放"占位状态
**新内容**: 竞品管理入口启用，跳转至 `/settings/competitors`

## Technical Notes
- `competitors` 表结构：
  - `id`: UUID (主键)
  - `brand_id`: UUID (外键，关联 brands)
  - `competitor_name`: VARCHAR(200) 必填
  - `competitor_domain`: VARCHAR(200)
  - `keywords`: JSONB
  - `created_at`: TIMESTAMPTZ
- 权限控制：仅操作当前用户所属品牌的竞品
- UI 风格：纯白极简杂志排版，沿用项目统一设计规范

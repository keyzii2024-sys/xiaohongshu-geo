# 账号矩阵模块 Spec

## Why
账号矩阵管理是品牌 GEO 监测的重要基础能力，用于梳理品牌自有账号、竞品账号与合作 KOL 的关系，为后续笔记分析与引用追踪提供账号归属基础。

## What Changes
- 新增 `src/app/settings/accounts/page.tsx` 账号矩阵页面
- 新增 `src/lib/accounts/crud.ts` 账号 CRUD 操作接口
- 账号分组展示：自有矩阵、竞品矩阵、合作KOL三个分组概览
- 实现账号新增、编辑、删除、分组调整全流程操作
- 对接 Supabase `accounts` 表完成 CRUD 接口对接
- 异常捕获与友好操作提示

## Impact
- Affected specs: Settings 模块架构
- Affected code:
  - `src/app/settings/accounts/page.tsx` (新增)
  - `src/lib/accounts/crud.ts` (新增)

## ADDED Requirements

### Requirement: 账号矩阵页面
系统 SHALL 提供账号矩阵管理页面，路径为 `/settings/accounts`

#### Scenario: 页面加载成功
- **WHEN** 用户访问 `/settings/accounts`
- **THEN** 展示账号矩阵页面，包含三个分组（自有矩阵、竞品矩阵、合作KOL）的概览信息

#### Scenario: 账号列表展示
- **WHEN** 页面加载完成且存在账号数据
- **THEN** 按分组展示账号列表，每条账号显示：头像、昵称、粉丝数、分组标签

### Requirement: 新增账号
系统 SHALL 支持新增账号功能

#### Scenario: 打开新增账号弹窗
- **WHEN** 用户点击「新增账号」按钮
- **THEN** 展示新增账号表单弹窗

#### Scenario: 提交新增账号
- **WHEN** 用户填写必填字段（小红书用户ID、昵称、分组）并提交
- **THEN** 调用 Supabase API 创建账号，成功后关闭弹窗并刷新列表

#### Scenario: 新增账号失败
- **WHEN** 新增账号请求失败
- **THEN** 显示错误提示，弹窗保持打开状态

### Requirement: 编辑账号
系统 SHALL 支持编辑已有账号

#### Scenario: 打开编辑账号弹窗
- **WHEN** 用户点击账号行的编辑按钮
- **THEN** 展示预填数据的编辑表单弹窗

#### Scenario: 提交编辑账号
- **WHEN** 用户修改字段并提交
- **THEN** 调用 Supabase API 更新账号，成功后关闭弹窗并刷新列表

### Requirement: 删除账号
系统 SHALL 支持删除账号

#### Scenario: 确认删除账号
- **WHEN** 用户点击删除按钮并确认
- **THEN** 调用 Supabase API 删除账号，成功后刷新列表

### Requirement: 调整账号分组
系统 SHALL 支持调整账号所属分组

#### Scenario: 修改账号分组
- **WHEN** 用户在编辑表单中修改分组并提交
- **THEN** 调用 Supabase API 更新分组，成功后账号出现在新分组中

## MODIFIED Requirements
无

## REMOVED Requirements
无

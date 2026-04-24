# 竞品管理模块全部问题修复 Spec

## Why
P0 合流修复完成后，深度自检还遗留 P1（建议修复）和 P2（可选优化）级别的问题。为确保竞品管理模块在合流后能长期维护，需系统性解决这些代码复用性、健壮性和可维护性问题。

## What Changes

### P1 问题修复
- **C-3**：提取 `ToastMessage` 和 `ConfirmModal` 为公共 UI 组件
- **C-4**：提取 `useDebounce` 为公共 Hook
- **E-1**：搜索输入增加防抖（已解决），但列表需增加分页支持
- **E-2**：表单提交增加双重防护（防抖 + 前置守卫）
- **E-3**：keywords 输入增加最大长度限制（500 字符）+ 字符计数
- **E-4**：competitor_name 输入增加最大长度限制（200 字符）+ 字符计数

### P2 问题优化
- **M-1**：将 page.tsx 中的 `CompetitorFormData` 类型和 `EMPTY_FORM` 常量移到 crud.ts
- **M-2**：确保所有工具函数和类型都有明确归属，无冗余

## Impact
- 新增文件：
  - `src/components/ui/toast.tsx` — ToastMessage 组件
  - `src/components/ui/confirm-modal.tsx` — ConfirmModal 组件
  - `src/lib/hooks/use-debounce.ts` — useDebounce Hook
- 修改文件：
  - `src/app/settings/competitors/page.tsx`
  - `src/app/settings/accounts/page.tsx`（同步更新为使用公共组件）
  - `src/lib/competitors/crud.ts`

## ADDED Requirements

### Requirement: 公共 Toast 组件
系统 SHALL 提供可复用的 ToastMessage 组件。

#### Scenario: 成功提示
- **WHEN** 操作成功时显示 Toast
- **THEN** 显示绿色成功样式，3.5 秒后自动消失

#### Scenario: 错误提示
- **WHEN** 操作失败时显示 Toast
- **THEN** 显示红色错误样式，3.5 秒后自动消失

### Requirement: 公共 ConfirmModal 组件
系统 SHALL 提供可复用的确认弹窗组件，支持删除确认和放弃更改两种模式。

#### Scenario: 删除确认
- **WHEN** mode = "delete"，competitor 有值
- **THEN** 显示"确定要删除 X 吗？此操作不可撤销。"

#### Scenario: 放弃更改确认
- **WHEN** mode = "unsaved"
- **THEN** 显示"您有未保存的更改，确定要放弃吗？"

### Requirement: 公共 useDebounce Hook
系统 SHALL 提供通用的防抖 Hook，供全项目复用。

### Requirement: 表单输入长度限制
系统 SHALL 对 competitor_name 和 keywords 输入字段进行最大长度限制和字符计数提示。

#### Scenario: competitor_name 输入
- **WHEN** 用户输入超过 200 字符
- **THEN** 显示字符计数提示 "200/200"

#### Scenario: keywords 输入
- **WHEN** 用户输入超过 500 字符
- **THEN** 显示字符计数提示 "500/500"

### Requirement: 表单提交防抖
系统 SHALL 在提交前增加 `if (isSubmitting) return;` 前置守卫。

## MODIFIED Requirements
无破坏性变更。

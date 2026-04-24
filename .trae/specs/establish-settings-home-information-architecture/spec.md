# 设置主入口与信息架构 Spec

## Why
当前后台导航中已经存在“设置”入口，但项目内尚未建立 `/settings` 主入口页，也没有把品牌设置、竞品管理、账号矩阵管理与数据导入之间的关系清晰组织出来。这会导致后台信息架构断层，用户难以理解设置模块的整体范围，也不利于后续按 PRD 分步补全各个设置子页。

## What Changes
- 新增 `/settings` 受保护主入口页，作为系统设置的总览与导航中枢。
- 在主入口页中整理 PRD 定义的 4 个设置相关模块：品牌设置、竞品管理、账号矩阵管理、数据导入。
- 将当前已存在的 `/settings/import` 纳入设置模块体系，避免“数据导入”成为孤立子页。
- 以纯白极简杂志排版呈现设置模块的信息层级，不直接实现品牌/竞品/账号的完整编辑表单。
- 为后续 `/settings/brand`、`/settings/competitors`、`/settings/accounts` 的实现预留清晰入口与内容边界。

## Impact
- Affected specs: 设置主入口、后台导航信息架构、设置模块分组关系
- Affected code: `src/app/settings/page.tsx`、`src/app/settings/layout.tsx` 或共享受保护布局接入、可能微调 `src/components/protected-app-navigation.tsx`

## ADDED Requirements
### Requirement: 设置主入口页
系统 SHALL 提供可访问的 `/settings` 页面，作为设置模块的主入口。

#### Scenario: 进入设置页
- **WHEN** 已登录用户点击后台导航中的“设置”
- **THEN** 系统进入 `/settings`
- **THEN** 页面展示设置模块总览，而不是空白页或 404
- **THEN** 当前导航项显示为激活态

### Requirement: 设置模块分组清晰
系统 SHALL 在 `/settings` 页面中清晰呈现 PRD 定义的设置子模块。

#### Scenario: 浏览设置总览
- **WHEN** 用户进入 `/settings`
- **THEN** 页面展示品牌设置、竞品管理、账号矩阵管理、数据导入 4 个模块入口
- **THEN** 每个模块包含标题、简述与当前阶段边界说明
- **THEN** 当前已可访问的模块与待补充模块在表达上应区分清楚

### Requirement: 数据导入纳入设置体系
系统 SHALL 将现有 `/settings/import` 页面纳入设置模块信息架构，而不是作为孤立页面存在。

#### Scenario: 查看设置中的数据导入
- **WHEN** 用户浏览 `/settings` 页面
- **THEN** 用户能看到“数据导入”是设置模块的一部分
- **THEN** 用户能从设置总览进入 `/settings/import`
- **THEN** 页面说明需体现其与其他设置子模块的并列关系

### Requirement: 纯白极简杂志排版
系统 SHALL 让 `/settings` 主入口页与当前后台保持统一的极简杂志风格。

#### Scenario: 检查设置页视觉
- **WHEN** 用户浏览设置主入口页
- **THEN** 页面保持白底、黑灰文字、大留白、克制边框与有限强调色
- **THEN** 不使用复杂图标墙、过度装饰卡片或花哨渐变
- **THEN** 通过标题、说明与模块卡片建立清晰层级

## MODIFIED Requirements
### Requirement: 设置导航入口
此前后台导航中的“设置”仅指向一个尚未落地的总入口概念；本次起其应升级为真实可访问的设置总览页面。

#### Scenario: 点击设置导航
- **WHEN** 用户点击“设置”
- **THEN** 用户进入 `/settings`
- **THEN** 页面能承接后续所有设置子模块的入口和信息架构

## REMOVED Requirements
### Requirement: 设置入口先保持空缺
**Reason**: 这会让后台导航信息架构不完整，也无法承接 PRD 中的品牌、竞品、账号与导入配置模块。
**Migration**: 以 `/settings` 主入口页先完成总览与模块导航，再逐步补齐各子页功能。

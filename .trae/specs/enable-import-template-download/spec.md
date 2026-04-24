# 数据导入 CSV 模板下载 Spec

## Why
当前 `/settings/import` 页面已经具备三步式导入结构与本地 CSV 解析/校验能力，但“下载模板”仍停留在说明或占位状态，用户无法直接拿到符合系统字段要求的模板文件。本次先补齐真实 CSV 模板下载，降低首次导入的理解成本，并为后续真实入库保持字段一致性。

## What Changes
- 将 `/settings/import` 页面中的“下载模板”占位按钮接成可实际下载的 CSV 模板。
- 模板文件需包含 PRD 与当前前端校验共同约定的字段表头。
- 模板文件可包含 1-2 行示例数据或仅包含表头，但需要在 spec 中明确采用哪种策略。
- 下载行为必须在前端本地完成，不请求真实 API，不依赖数据库或对象存储。
- 保持当前纯白极简杂志排版，不因下载能力引入复杂弹窗或冗余引导。

## Impact
- Affected specs: 数据导入模板准备、CSV 字段规范、前端本地下载边界
- Affected code: `src/app/settings/import/page.tsx` 及可能抽离出的模板常量模块

## ADDED Requirements
### Requirement: CSV 模板下载
系统 SHALL 在 `/settings/import` 页面提供真实可用的 CSV 模板下载能力。

#### Scenario: 点击下载模板
- **WHEN** 用户在数据导入页面点击“下载模板”
- **THEN** 浏览器开始下载一个 `.csv` 文件
- **THEN** 文件名应清晰表达该文件为 GEO 数据导入模板
- **THEN** 下载过程不得发起真实网络请求

### Requirement: 模板字段一致性
系统 SHALL 让下载模板与当前导入页展示的字段定义保持一致。

#### Scenario: 查看模板列头
- **WHEN** 用户打开下载后的 CSV 模板
- **THEN** 模板至少包含 `date`、`visibility`、`citation_rate`
- **THEN** 模板中的可选字段应与页面样例表头和本地校验逻辑一致
- **THEN** 模板字段顺序应稳定，便于产品演示与用户填写

### Requirement: 模板内容清晰可理解
系统 SHALL 让模板在首次打开时足够清晰，降低用户填写门槛。

#### Scenario: 首次使用模板
- **WHEN** 用户首次下载并打开模板
- **THEN** 模板应通过表头或示例值帮助用户理解数据格式
- **THEN** 若包含示例数据，页面需明确说明示例行仅供参考、导入前可删除
- **THEN** 页面不得让用户误以为模板下载会触发真实导入

### Requirement: 纯前端下载边界
系统 SHALL 将模板下载能力限制在浏览器本地生成与下载，不引入后端依赖。

#### Scenario: 执行模板下载
- **WHEN** 用户点击下载模板
- **THEN** 页面使用前端生成的 Blob、data URL 或等效浏览器原生方式下载文件
- **THEN** 不调用 `/api/*` 接口
- **THEN** 不依赖 Supabase Storage 或外部静态文件服务

## MODIFIED Requirements
### Requirement: 数据导入页面第 1 步
此前 `/settings/import` 的“第 1 步：下载模板”只需展示占位按钮或静态说明；本次起应升级为可实际下载 CSV 模板的可执行入口。

#### Scenario: 查看第 1 步
- **WHEN** 用户进入数据导入页面
- **THEN** “下载模板”区域不再只是说明
- **THEN** 而是包含一个可触发真实 CSV 模板下载的操作入口

## REMOVED Requirements
### Requirement: 下载模板仅为占位说明
**Reason**: 该状态已不足以支持真实导入前的产品试用与用户理解。
**Migration**: 将占位按钮替换为真实下载入口，并复用当前字段定义生成模板内容。

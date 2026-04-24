# API 统一数据入口与仪表盘接线 Spec

## Why
当前 `Dashboard` 主内容区已经完成了高保真假数据展示，但数据仍直接从页面内导入本地 mock 模块，尚未满足 PRD 第三步“通过 `/api/geo` 统一数据入口返回仪表盘数据”的目标。本次需要先建立 Phase 1 可用的 API 边界，让页面改为从统一接口取数，同时继续保持静态 mock 数据驱动，避免过早耦合真实数据源。

## What Changes
- 新增 `/api/geo` 统一数据入口，用于返回当前阶段的 Dashboard mock 数据。
- 约定并固化仪表盘接口响应结构，尽量贴近 PRD 中的 JSON 示例。
- 将 `Dashboard` 页面从“直接 import 本地 mock 数据”调整为“通过 `/api/geo` 获取数据后渲染”。
- 将当前静态 mock 数据模块从页面私有展示数据升级为 API 响应数据源。
- 为后续 `brandId`、时间范围 `range`、以及真实 Data Provider 接入预留明确参数与结构边界。
- 本次不得接入真实 Supabase 业务查询、不得请求外部 API，仍然只返回静态 mock 数据。

## Impact
- Affected specs: `/api/geo` 统一数据入口、Dashboard 数据获取方式、Phase 1 mock 数据边界、后续 Data Provider 演进路径
- Affected code: `src/app/api/geo/route.ts`、`src/app/dashboard/page.tsx`、`src/lib/dashboard/mock-data.ts`、必要的数据类型定义或请求辅助模块

## ADDED Requirements
### Requirement: API 统一数据入口
系统 SHALL 提供 `/api/geo` 作为 Phase 1 的统一数据入口，并返回 Dashboard 所需数据。

#### Scenario: 请求 Dashboard 数据
- **WHEN** 已登录用户请求 `/api/geo`
- **THEN** 接口返回结构化 JSON 数据
- **THEN** 响应包含品牌信息、时间范围、KPI、趋势序列、告警、Top 问答与建议卡片所需字段

### Requirement: Dashboard 通过 API 取数
系统 SHALL 让 `Dashboard` 主内容区改为依赖 `/api/geo` 返回的数据进行渲染，而不是直接读取页面内静态对象。

#### Scenario: 进入仪表盘
- **WHEN** 用户访问 `/dashboard`
- **THEN** 页面通过统一数据入口获取主内容区展示数据
- **THEN** 页面渲染结果在视觉上与当前已完成版本保持一致或高度接近

### Requirement: 保持静态 Mock 边界
系统 SHALL 在本次实现中继续使用静态 mock 数据，不提前接入真实数据库查询或外部服务。

#### Scenario: Phase 1 静态版本
- **WHEN** 开发本次接口版本
- **THEN** `/api/geo` 返回值来自本地 mock 数据模块
- **THEN** 不得调用外部 API
- **THEN** 不得因为仪表盘主内容数据而新增真实业务写入逻辑

### Requirement: 请求参数预留
系统 SHALL 为后续演进保留基础查询参数边界，即便当前参数只用于占位或简单透传。

#### Scenario: 携带基础参数访问接口
- **WHEN** 请求 `/api/geo?brandId=xxx&range=7d`
- **THEN** 接口可接受 `brandId` 与 `range` 参数
- **THEN** 当前阶段可以返回同一份静态数据或轻量映射结果
- **THEN** 不因参数缺失导致页面白屏

### Requirement: 加载与异常状态
系统 SHALL 为 Dashboard 数据获取过程提供最小但清晰的加载态与异常态，避免直接报错或空白。

#### Scenario: 数据加载中
- **WHEN** 页面正在等待 `/api/geo` 返回
- **THEN** 主内容区展示克制的加载态或骨架占位

#### Scenario: 接口异常
- **WHEN** `/api/geo` 返回错误或请求失败
- **THEN** 页面展示简洁的异常提示
- **THEN** 页面不得白屏或抛出未处理异常

## MODIFIED Requirements
### Requirement: Dashboard 主内容区数据来源
此前 Dashboard 主内容区允许直接从本地 mock 数据模块读取静态对象；本次起，该页面应优先通过 `/api/geo` 统一入口获取数据。

#### Scenario: 数据来源升级
- **WHEN** 用户访问 `/dashboard`
- **THEN** 页面不再直接以内联或直接导入的页面数据对象作为主数据源
- **THEN** 而是通过接口层获取并渲染相同业务内容

# 导入后 Dashboard 切换真实数据源 Spec

## Why
当前 CSV 导入链路已经能把合法数据写入 `geo_metrics_daily`，但 `Dashboard` 仍主要消费 `/api/geo` 的 mock 数据，导致“导入成功”后看板内容没有真实变化，产品闭环仍不完整。需要让 `Dashboard` 在导入后优先读取真实数据库数据，并在无数据时保持平滑回退到 mock，避免演示和试用都出现空白。

## What Changes
- 将 `/api/geo` 从 mock-only 数据源升级为“优先读取 `geo_metrics_daily`，无数据时回退 mock”的混合数据入口。
- 读取当前登录用户的主品牌，并结合 `range` 参数查询对应时间范围内的真实日指标。
- 使用真实日指标计算 `Dashboard` 所需的 KPI、趋势数据、问候语辅助文案与数据来源标记。
- 在接口响应中显式返回 `meta.source`，区分 `database` 与 `mock`。
- 在 `Dashboard` 页面增加克制的数据源提示，让用户知道当前展示的是导入后的真实数据还是默认 mock 数据。
- 保留现有纯白极简杂志排版，不因数据源切换引入复杂筛选器、调试块或噪声提示。

## Impact
- Affected specs: `/api/geo` 数据提供方式、Dashboard 数据来源、导入后可见反馈、mock 回退边界
- Affected code: `src/app/api/geo/route.ts`、Dashboard 数据映射模块、`src/app/dashboard/page.tsx`、可能新增的数据库查询与聚合辅助模块

## ADDED Requirements
### Requirement: Dashboard 优先读取真实导入数据
系统 SHALL 在 `geo_metrics_daily` 存在品牌数据时，优先将其作为 `Dashboard` 的主数据源。

#### Scenario: 品牌已有导入数据
- **WHEN** 已登录用户请求 `/api/geo`
- **THEN** 系统先获取该用户当前主品牌
- **THEN** 系统优先查询 `geo_metrics_daily`
- **THEN** 返回基于真实导入数据计算出的 Dashboard 响应

### Requirement: 无数据时回退 mock
系统 SHALL 在真实数据库中无可用指标数据时，继续返回现有 mock 数据，避免页面空白。

#### Scenario: 品牌暂无导入数据
- **WHEN** 当前品牌在指定时间范围内查不到 `geo_metrics_daily`
- **THEN** `/api/geo` 返回与当前页面兼容的 mock 响应
- **THEN** 响应中标记当前数据源为 `mock`

### Requirement: 时间范围驱动查询
系统 SHALL 根据 `range` 参数查询并聚合指定时间窗口内的真实指标。

#### Scenario: 请求 7 天数据
- **WHEN** 用户请求 `/api/geo?range=7d`
- **THEN** 系统查询当前品牌最近 7 天的 `geo_metrics_daily`
- **THEN** 趋势图与 KPI 基于该时间范围内的数据计算

### Requirement: Dashboard 响应包含数据源标记
系统 SHALL 在 `/api/geo` 响应的 `meta` 中显式返回当前数据来源。

#### Scenario: 返回真实数据
- **WHEN** `/api/geo` 成功返回数据库聚合结果
- **THEN** `meta.source` 为 `database`

#### Scenario: 返回 mock 数据
- **WHEN** `/api/geo` 回退到 mock 数据
- **THEN** `meta.source` 为 `mock`

### Requirement: Dashboard 展示克制的数据源反馈
系统 SHALL 在页面中以克制方式提示当前数据来源，让导入后的变化可被用户理解。

#### Scenario: 使用真实数据源
- **WHEN** Dashboard 正在展示导入后的真实数据
- **THEN** 页面显示简洁提示说明当前内容来自已导入数据
- **THEN** 提示风格不破坏纯白极简杂志排版

#### Scenario: 使用 mock 数据源
- **WHEN** Dashboard 仍回退到 mock 数据
- **THEN** 页面显示简洁提示说明当前为默认示例数据

## MODIFIED Requirements
### Requirement: `/api/geo` 数据来源
此前 `/api/geo` 仅返回本地 mock 数据；本次起，它应升级为支持“数据库优先、mock 回退”的统一数据入口。

#### Scenario: 统一数据源升级
- **WHEN** 客户端请求 `/api/geo`
- **THEN** 系统不再固定返回 mock 数据
- **THEN** 而是优先尝试使用 `geo_metrics_daily` 生成响应

### Requirement: Dashboard 数据反馈闭环
此前用户导入 CSV 后，Dashboard 内容不一定发生可见变化；本次起，导入成功后的真实数据应能反映到 Dashboard 主内容区。

#### Scenario: 导入后返回看板
- **WHEN** 用户完成 CSV 导入并返回 Dashboard
- **THEN** 页面能看到基于导入数据生成的 KPI 与趋势变化

## REMOVED Requirements
### Requirement: Dashboard 当前阶段固定使用 mock 数据
**Reason**: CSV 导入链路已完成，固定 mock 数据会阻断真实试用闭环。
**Migration**: 改为数据库优先、mock 回退；保持现有响应结构不变，降低页面改造成本。

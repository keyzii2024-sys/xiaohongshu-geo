# Dashboard 与 Reports 共享真实 GEO 数据源 Spec

## Why
Milestone 2 已经打通 CSV 导入到 `geo_metrics_daily` 的真实入库链路，但 `Dashboard` 与 `Reports` 仍未共同消费这份真实数据，且现有展示逻辑仍分散在各自页面或 mock 模块中。Milestone 3 需要把“导入后的真实数据”真正贯通到看板与报告中心，并抽离共享数据访问层，避免两套页面分别维护各自的数据映射与回退逻辑。

## What Changes
- 将 `Dashboard` 改为优先读取 `geo_metrics_daily` 的真实聚合结果，无数据时平滑回退到 mock。
- 将 `Reports` 从纯静态 mock 预览升级为复用同一套真实 GEO 数据提供层，无数据时同样回退到 mock。
- 抽离共享 GEO 数据访问层，统一完成品牌识别、时间范围处理、数据库查询、聚合映射与 mock 回退。
- 统一 `Dashboard` 与 `Reports` 的核心指标口径，避免两个页面各自维护不同的映射逻辑。
- 在响应或数据提供结果中保留数据源标记，明确区分 `database` 与 `mock`。
- 保持纯白极简杂志排版，不因接入真实数据源而引入复杂筛选器、调试面板或噪声提示。

## Impact
- Affected specs: `/api/geo` 数据来源、Dashboard 数据获取、Reports 数据获取、共享 GEO Data Provider、mock 回退边界
- Affected code: `src/app/api/geo/route.ts`、`src/app/dashboard/page.tsx`、`src/app/reports/page.tsx`、`src/app/reports/[id]/page.tsx`、共享数据访问层模块、必要的数据类型与聚合辅助模块

## ADDED Requirements
### Requirement: Dashboard 优先消费真实 GEO 数据
系统 SHALL 在当前品牌存在 `geo_metrics_daily` 数据时，优先将其作为 Dashboard 的主数据源。

#### Scenario: 当前品牌已有导入数据
- **WHEN** 已登录用户访问 `/dashboard` 或请求 `/api/geo`
- **THEN** 系统先识别当前用户主品牌
- **THEN** 系统优先查询 `geo_metrics_daily`
- **THEN** 页面展示基于真实数据聚合后的 KPI、趋势与摘要信息

### Requirement: Reports 复用同一真实数据源
系统 SHALL 让报告中心与报告预览页复用与 Dashboard 相同的 GEO 数据提供层，而不是继续只依赖独立 mock 数据。

#### Scenario: 当前品牌已有导入数据并进入报告中心
- **WHEN** 已登录用户访问 `/reports` 或报告预览页
- **THEN** 页面优先使用共享 GEO 数据提供层返回的真实聚合结果
- **THEN** 报告摘要、KPI、趋势和重点结论与 Dashboard 的指标口径保持一致

### Requirement: 共享 GEO 数据访问层
系统 SHALL 提供一套共享的数据访问层，统一处理 GEO 指标查询、聚合、映射和回退逻辑。

#### Scenario: Dashboard 与 Reports 同时读取 GEO 数据
- **WHEN** 不同页面需要展示 GEO 指标
- **THEN** 它们通过同一数据访问层获取结构化结果
- **THEN** 共享层统一处理品牌识别、`range` 时间窗口、数据库查询、mock 回退与来源标记
- **THEN** 页面层不得各自重复维护一套数据库到视图模型的映射逻辑

### Requirement: 无数据时平滑回退 mock
系统 SHALL 在真实数据库中无可用数据时，继续回退到现有 mock 数据，确保看板与报告页面都可演示。

#### Scenario: 当前品牌暂无导入数据
- **WHEN** `geo_metrics_daily` 在指定范围内无记录
- **THEN** 共享数据访问层返回兼容页面结构的 mock 数据
- **THEN** Dashboard 与 Reports 都能继续正常渲染
- **THEN** 数据源标记为 `mock`

### Requirement: 时间范围驱动真实查询
系统 SHALL 支持至少 `1d`、`7d`、`30d` 三种时间范围驱动共享 GEO 查询与聚合。

#### Scenario: 请求不同时间范围
- **WHEN** 页面或接口请求 `1d`、`7d` 或 `30d`
- **THEN** 系统查询对应窗口内的 `geo_metrics_daily`
- **THEN** KPI、趋势和报告摘要随时间范围变化而重新计算

### Requirement: 统一数据源标记
系统 SHALL 在共享数据访问层的返回结果中显式标记数据来源，供 Dashboard 与 Reports 复用。

#### Scenario: 返回真实数据库结果
- **WHEN** 共享数据访问层成功返回真实聚合结果
- **THEN** `source` 标记为 `database`

#### Scenario: 返回 mock 结果
- **WHEN** 共享数据访问层回退到 mock 数据
- **THEN** `source` 标记为 `mock`

### Requirement: 克制的数据源提示
系统 SHALL 允许 Dashboard 与 Reports 以克制方式提示当前数据源，帮助用户理解当前内容是否来自真实导入数据。

#### Scenario: 使用真实数据
- **WHEN** 页面正在展示数据库聚合结果
- **THEN** 页面展示简洁提示说明当前内容来自已导入数据
- **THEN** 提示样式不得破坏纯白极简杂志排版

#### Scenario: 使用 mock 数据
- **WHEN** 页面回退到示例数据
- **THEN** 页面展示简洁提示说明当前为默认示例数据

## MODIFIED Requirements
### Requirement: Reports 当前阶段的数据来源
此前报告中心与预览页完全依赖本地静态 mock 数据；本次起，它们应升级为“共享数据提供层优先读取数据库，无数据时回退 mock”的模式。

#### Scenario: 报告中心数据来源升级
- **WHEN** 用户访问 `/reports` 或报告预览页
- **THEN** 页面不再固定只读独立 mock 模块
- **THEN** 而是优先消费共享 GEO 数据提供层返回的结构化结果

### Requirement: `/api/geo` 数据提供方式
此前 `/api/geo` 仅承担 Dashboard 接口边界；本次起，它应复用共享 GEO 数据访问层，而不是在接口文件内单独维护一套聚合逻辑。

#### Scenario: API 层复用共享提供层
- **WHEN** 客户端请求 `/api/geo`
- **THEN** 接口层调用共享 GEO 数据访问层
- **THEN** 不在路由文件内复制同一份数据库聚合与回退逻辑

## REMOVED Requirements
### Requirement: Dashboard 与 Reports 各自维护独立 mock / 映射逻辑
**Reason**: 继续分散维护会导致指标口径不一致，也会提高后续接入真实数据和扩展报表时的修改成本。
**Migration**: 抽离共享 GEO 数据访问层，集中管理数据库查询、聚合映射、来源标记与 mock 回退，再由 Dashboard 与 Reports 共同消费。

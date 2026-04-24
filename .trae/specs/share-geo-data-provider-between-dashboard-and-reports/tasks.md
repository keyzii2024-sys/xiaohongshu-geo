# Tasks
- [x] Task 1: 设计共享 GEO 数据提供层边界。
  - [x] 对齐 `geo_metrics_daily`、`/api/geo`、Dashboard 和 Reports 当前展示结构之间的字段映射。
  - [x] 明确 `1d / 7d / 30d` 三种时间范围的查询窗口、KPI 计算口径与 mock 回退规则。
  - [x] 明确共享层返回结构，包括 `source` 标记、Dashboard 视图模型与 Reports 视图模型。

- [x] Task 2: 实现共享 GEO 数据访问层。
  - [x] 抽离统一的品牌识别、数据库查询、聚合计算与 mock 回退逻辑。
  - [x] 让共享层优先读取 `geo_metrics_daily`，无数据时返回 mock。
  - [x] 保证共享层输出可被 Dashboard 与 Reports 共同消费。

- [ ] Task 3: 改造 `/api/geo` 与 Dashboard。
  - [ ] 让 `/api/geo` 复用共享 GEO 数据访问层，而不是单独维护聚合逻辑。
  - [ ] 让 Dashboard 读取新的真实/回退混合数据结果。
  - [ ] 在页面增加克制的数据源提示，但保持现有视觉层级不变。

- [ ] Task 4: 改造 Reports 复用同一数据源。
  - [ ] 让 `/reports` 页面复用共享 GEO 数据访问层，显示与 Dashboard 一致的指标口径。
  - [ ] 让报告预览页复用共享 GEO 数据访问层，而不是继续固定读取独立 mock。
  - [ ] 在无数据时平滑回退 mock，并提供克制的数据源提示。

- [ ] Task 5: 完成验证与回归检查。
  - [ ] 验证数据库有数据时 Dashboard 与 Reports 都能读取真实聚合结果。
  - [ ] 验证数据库无数据时两者都能平滑回退 mock。
  - [ ] 验证 `1d`、`7d`、`30d` 时间范围驱动结果变化。
  - [ ] 运行 lint、类型检查与构建，确认未引入新问题。

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1, Task 2
- Task 4 depends on Task 1, Task 2
- Task 5 depends on Task 3, Task 4

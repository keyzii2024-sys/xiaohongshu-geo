# Tasks
- [ ] Task 1: 设计 Dashboard 真实数据聚合边界。
  - [ ] 对齐 `geo_metrics_daily` 与当前 `/api/geo` 响应结构的字段映射。
  - [ ] 明确 `1d / 7d / 30d` 三种范围的查询窗口与 KPI 计算口径。
  - [ ] 明确无数据回退 mock、部分字段缺失容错与 `meta.source` 标记规则。

- [ ] Task 2: 实现数据库优先的数据提供层。
  - [ ] 在 `/api/geo` 读取当前用户主品牌。
  - [ ] 查询 `geo_metrics_daily` 并按 `range` 获取指定窗口内的日指标。
  - [ ] 将数据库记录聚合为当前 Dashboard 所需的 KPI、趋势与辅助文案结构。

- [ ] Task 3: 保留 mock 回退并统一响应形状。
  - [ ] 当数据库无数据时回退到现有 mock 数据。
  - [ ] 保证 `database` 与 `mock` 两种来源返回相同响应结构。
  - [ ] 在 `meta.source` 中明确标记当前数据源。

- [ ] Task 4: 更新 Dashboard 页面反馈。
  - [ ] 让 Dashboard 页面消费新的 `meta.source`。
  - [ ] 新增克制的数据源提示，说明当前是导入后的真实数据还是示例数据。
  - [ ] 保持现有纯白极简杂志排版与主要模块层级不变。

- [ ] Task 5: 完成验证与回归检查。
  - [ ] 验证数据库有数据时 `/api/geo` 返回真实聚合结果。
  - [ ] 验证数据库无数据时 Dashboard 平滑回退 mock。
  - [ ] 运行 lint、类型检查与构建，确认未引入新问题。

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1, Task 2
- Task 4 depends on Task 2, Task 3
- Task 5 depends on Task 4

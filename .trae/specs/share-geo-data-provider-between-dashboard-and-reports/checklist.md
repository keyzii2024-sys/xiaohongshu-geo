* [ ] `Dashboard` 在当前品牌存在 `geo_metrics_daily` 数据时，会优先展示基于数据库聚合的真实结果。

* [ ] `Dashboard` 在数据库无可用数据时，会平滑回退到现有 mock 数据而不是报错或空白。

* [ ] `/reports` 页面与报告预览页会复用同一套 GEO 数据提供层，而不是继续各自维护独立 mock / 映射逻辑。

* [ ] `Dashboard` 与 `Reports` 在真实数据模式下的核心 KPI 与趋势口径保持一致。

* [ ] `1d`、`7d`、`30d` 三种时间范围都会驱动共享数据层的查询与聚合。

* [ ] 共享 GEO 数据访问层会明确返回 `source = database` 或 `source = mock`。

* [ ] Dashboard 与 Reports 都会以克制方式提示当前数据源，且不破坏纯白极简杂志排版。

* [ ] 在数据库字段部分为空或无数据时，Dashboard 与 Reports 都不会白屏。

* [ ] `/api/geo` 已复用共享数据访问层，而不是在路由文件中单独维护同类聚合逻辑。

* [ ] 实现完成后未引入新的 lint、TypeScript 或构建错误。

- [ ] `/api/geo` 在当前品牌存在 `geo_metrics_daily` 数据时，优先返回基于数据库聚合的 Dashboard 响应。

- [ ] `/api/geo` 在数据库无可用数据时，会平滑回退到现有 mock 数据而不是报错或空白。

- [ ] `1d`、`7d`、`30d` 三种时间范围都会驱动对应窗口的数据查询与趋势计算。

- [ ] `/api/geo` 响应中的 `meta.source` 会明确标记为 `database` 或 `mock`。

- [ ] Dashboard 页面会以克制方式提示当前数据源，但不破坏纯白极简杂志排版。

- [ ] CSV 导入成功后，返回 Dashboard 能看到真实导入数据对 KPI 或趋势的影响。

- [ ] 在数据库字段部分为空时，页面不会白屏，仍能输出可用的 Dashboard 数据。

- [ ] 实现完成后未引入新的 lint、TypeScript 或构建错误。

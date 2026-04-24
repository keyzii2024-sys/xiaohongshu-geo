# Tasks
- [x] Task 1: 设计真实 CSV 导入字段边界与入库规则。
  - [x] 对齐 PRD 中 `geo_metrics_daily` 导入字段，明确必填字段与可选字段。
  - [x] 明确日期标准化规则、数字字段解析规则、错误行记录结构与提示文案。
  - [x] 确认 `brand_id + date` 的 upsert 规则与当前品牌归属获取方式。

- [x] Task 2: 实现 CSV 模板下载。
  - [x] 在 `/settings/import` 页面提供“下载 CSV 模板”真实能力。
  - [x] 生成带标准表头的 CSV 模板内容并触发浏览器下载。

- [x] Task 3: 实现前端 CSV 解析与字段校验。
  - [x] 接入 CSV 解析依赖并读取本地文件。
  - [x] 对表头执行 `trim` 容错，并校验必填字段是否完整。
  - [x] 处理空文件、无数据行、非 CSV 文件与基础格式错误。

- [x] Task 4: 实现日期标准化与错误行跳过。
  - [x] 将可识别日期统一转换为 `YYYY-MM-DD`。
  - [x] 对非法日期或非法数字字段的行执行跳过。
  - [x] 汇总成功条数、跳过条数与主要错误原因。

- [x] Task 5: 实现 `geo_metrics_daily` upsert 入库。
  - [x] 将合法数据映射为 `geo_metrics_daily` 所需结构。
  - [x] 写入 Supabase，并以 `brand_id, date` 作为冲突键执行 upsert。
  - [x] 在页面展示导入成功、部分跳过或失败反馈。

- [x] Task 6: 完成质量验证与回归检查。
  - [x] 验证模板下载、解析成功、部分失败、缺失字段、重复日期覆盖更新等关键路径。
  - [x] 运行 lint、类型检查与构建，修复新增问题。
  - [x] 确认页面风格仍符合纯白极简杂志排版，且不会因导入异常白屏。

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1
- Task 4 depends on Task 3
- Task 5 depends on Task 1, Task 3, Task 4
- Task 6 depends on Task 2, Task 4, Task 5

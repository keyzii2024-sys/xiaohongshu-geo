# Tasks
- [x] Task 1: 设计 CSV 解析与校验边界。
  - [x] 确定前端本地解析版本支持的字段范围，优先覆盖 `date`、`visibility`、`citation_rate`、`sentiment_score`、`roi_index`、`top3_rate`、`cited_notes_count`、`cited_accounts_count`。
  - [x] 明确必填字段、基础格式校验规则与错误反馈文案。
  - [x] 确认当前阶段仅做本地解析与预览，不接入数据库写入。

- [x] Task 2: 接入 CSV 本地解析能力。
  - [x] 为 `/settings/import` 页面补充 CSV 读取与解析依赖。
  - [x] 在用户选择有效 `.csv` 文件后，完成浏览器本地解析。
  - [x] 处理空文件、表头缺失、无数据行等基础异常。

- [x] Task 3: 实现字段校验与结果摘要。
  - [x] 校验必填字段是否存在。
  - [x] 校验关键数据行的日期与数字字段格式。
  - [x] 输出成功条数、跳过条数与主要错误原因摘要。

- [x] Task 4: 实现导入预览与边界提示。
  - [x] 展示解析后的前若干行预览数据。
  - [x] 明确标记“仅本地预览，尚未写入数据库”。
  - [x] 保持纯白极简杂志排版，避免复杂装饰和误导性成功状态。

- [x] Task 5: 完成验证与收口。
  - [x] 确认页面未发起真实网络请求、未写入数据库。
  - [x] 运行 lint、类型检查与诊断。
  - [x] 人工检查解析成功、部分失败、非 CSV、空文件四类路径的反馈是否清晰。

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1, Task 2
- Task 4 depends on Task 2, Task 3
- Task 5 depends on Task 4

# Tasks
- [x] Task 1: 设计 Dashboard 假数据结构。
  - [x] 定义问候语、KPI、趋势序列、告警、Top 问答、机会建议的本地 mock 数据结构。
  - [x] 统一数值格式与字段命名，保证后续可平滑替换为真实接口数据。

- [x] Task 2: 实现 KPI、告警与问答模块。
  - [x] 在 Dashboard 主内容区渲染问候语与 4 个 KPI 指标卡。
  - [x] 渲染高危告警条，文案符合 GEO 业务场景。
  - [x] 渲染 Top 5 问答排行表格，并处理移动端布局表现。

- [x] Task 3: 实现趋势图与机会分析模块。
  - [x] 引入并配置趋势图方案，渲染“我方 vs 竞品均值”数据。
  - [x] 渲染 2-3 条机会分析师卡片，形成完整主内容阅读流。
  - [x] 控制图表与卡片的层级、留白与颜色节奏，满足纯白极简风格。

- [x] Task 4: 完成 Dashboard 页面整合与样式收口。
  - [x] 将各模块整合进 `src/app/dashboard/page.tsx` 或拆分为局部展示组件。
  - [x] 校验桌面端与移动端无横向滚动，主内容区最大宽度与留白符合 PRD。
  - [x] 移除无意义占位文案与装饰性元素，确保界面可直接用于产品演示。

- [x] Task 5: 验证实现质量。
  - [x] 运行静态检查，确认未引入新的类型或 lint 问题。
  - [x] 人工检查页面是否未发起真实 API 请求。
  - [x] 人工检查视觉是否符合纯白极简杂志排版要求。

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1
- Task 4 depends on Task 2, Task 3
- Task 5 depends on Task 4

# Tasks
- [x] Task 1: 设计 `/api/geo` 的 Phase 1 响应结构。
  - [x] 对齐 PRD 中 Dashboard 接口示例，整理品牌信息、时间范围、KPI、趋势、告警、问答与建议字段。
  - [x] 收口现有 `mock-data` 模块的数据结构，使其既可作为本地数据源，也可作为 API 返回源。

- [x] Task 2: 实现 `/api/geo` 统一接口。
  - [x] 新增 `src/app/api/geo/route.ts`。
  - [x] 支持读取 `brandId` 与 `range` 查询参数，并返回静态 mock 数据。
  - [x] 处理基础错误分支，避免接口未捕获异常直接泄露到页面。

- [x] Task 3: 改造 Dashboard 为 API 取数。
  - [x] 将 `src/app/dashboard/page.tsx` 从直接读取 mock 对象改为请求 `/api/geo`。
  - [x] 处理加载态、异常态与成功态渲染。
  - [x] 保持当前已完成的纯白极简杂志排版基本不变。

- [x] Task 4: 收口数据映射与边界一致性。
  - [x] 确保页面所需字段全部来自接口返回，而不是残留页面内硬编码。
  - [x] 确保当前主内容数据不依赖真实 Supabase 业务查询。
  - [x] 为后续切换 Data Provider 保持清晰的数据层边界。

- [x] Task 5: 完成验证与回归检查。
  - [x] 验证 `/api/geo` 返回结构可被 Dashboard 正常消费。
  - [x] 验证页面在接口成功、加载、失败情况下均不白屏。
  - [x] 运行 lint / build 并修复新增问题。

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1, Task 2
- Task 4 depends on Task 2, Task 3
- Task 5 depends on Task 4

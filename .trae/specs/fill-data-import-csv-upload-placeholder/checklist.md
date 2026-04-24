* [x] 已新增 `/settings/import` 页面，并可从 Dashboard 侧边栏进入。

* [x] 侧边栏“数据导入”在对应页面显示为激活态，不再是禁用占位文本。

* [x] 页面包含 CSV 上传交互框占位，至少展示标题、说明、格式提示与选择文件入口。

* [x] 页面按 PRD 的三步结构展示“下载模板 / 填写数据 / 上传文件”，其中前两步可为占位说明。

* [x] 用户选择 `.csv` 文件后，页面仅展示本地前端反馈，不发起真实网络请求。

* [x] 用户选择非 `.csv` 文件后，页面展示明确且克制的格式限制提示。

* [x] 页面包含导入流程说明或字段建议等静态辅助模块，但不伪造解析结果、导入记录或成功回执。

* [x] 视觉风格符合纯白极简杂志排版：白底、黑灰字、细边框、大留白、有限强调色、无复杂装饰。

* [x] 桌面端与移动端均无横向滚动，上传框与说明区层级清晰，适合产品演示。

* [x] 实现后未引入新的 lint 或 TypeScript 报错。

## 验证记录

- 验证日期：2026-04-23
- 验证方式：逐项核对 `src/app/settings/import/page.tsx`、`src/app/settings/import/layout.tsx`、`src/components/protected-app-navigation.tsx` 与 `src/components/protected-app-shell.tsx` 的实现。
- 静态检查：`npm run lint` 通过，`npx tsc --noEmit` 通过。
- 补充结果：`npm run build` 成功产出，`/settings/import` 路由已参与构建；构建日志中的 `/api/geo` dynamic server usage 提示未导致失败，且不属于本次数据导入占位页验收范围。

* 2026-04-23 验收备注：已确认 `CSV` 选择入口、拖拽交互、本地文件反馈、非 `CSV` 提示、三步结构、导入说明与导航激活态均已到位；`npm run lint` 与诊断检查通过。

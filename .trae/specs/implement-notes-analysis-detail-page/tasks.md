# Tasks

- [x] Task 1: 创建笔记效果分析 mock 数据模块
  - 在 `src/lib/notes/mock-data.ts` 新增笔记详情页所需的 TypeScript 类型定义和 mock 数据
  - 包含：NoteBasicInfo, NoteTrendPoint, TrafficSource, CommentKeyword, NoteOptimization, NoteDetailData 类型
  - 包含贴合业务语境的 mock 数据

- [x] Task 2: 新增笔记效果分析详情页
  - 在 `src/app/notes/[noteId]/page.tsx` 创建页面组件
  - 使用 server component 或 client component 方式（待定）
  - 实现笔记基础信息卡片、数据趋势折线图、流量来源饼图、评论词云、优化建议卡片五大模块
  - 复用项目 SVG 趋势图 geometry 构建逻辑

- [x] Task 3: 新增侧边栏"笔记分析"导航入口
  - 修改 `src/components/protected-app-navigation.tsx`
  - 在 navigationItems 数组中新增 `{ label: "笔记分析", href: "/notes/demo-note-001" }`
  - 确保激活态判断逻辑正确（支持 `/notes/[noteId]` 动态路由高亮）

- [x] Task 4: 验证页面可正常渲染
  - 确认五大核心模块均正常展示
  - 确认 SVG 趋势图与 Dashboard 风格 100% 一致
  - 确认 recharts 饼图正常渲染
  - 确认无控制台错误

# Task Dependencies
- Task 2 依赖 Task 1（需要 mock 数据类型和常量）
- Task 3 可与 Task 2 并行执行
- Task 4 在 Task 1、2、3 完成后执行验证

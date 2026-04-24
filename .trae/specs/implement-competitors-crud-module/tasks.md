# Tasks

- [ ] Task 1: 创建竞品管理页面基础结构
  - [ ] SubTask 1.1: 创建 `src/app/settings/competitors/page.tsx` 基础页面骨架
  - [ ] SubTask 1.2: 沿用项目 UI 规范设计页面布局（头部信息、面包屑、搜索区、列表区）
  - [ ] SubTask 1.3: 实现返回设置总览的链接

- [ ] Task 2: 实现竞品数据层（CRUD 接口）
  - [ ] SubTask 2.1: 创建 `src/lib/competitors/client.ts` 封装 Supabase 竞品查询方法
  - [ ] SubTask 2.2: 实现 `fetchCompetitors(brandId)` 方法
  - [ ] SubTask 2.3: 实现 `createCompetitor(data)` 方法
  - [ ] SubTask 2.4: 实现 `updateCompetitor(id, data)` 方法
  - [ ] SubTask 2.5: 实现 `deleteCompetitor(id)` 方法

- [ ] Task 3: 实现竞品列表展示
  - [ ] SubTask 3.1: 页面加载时查询当前品牌竞品列表
  - [ ] SubTask 3.2: 实现加载状态骨架屏
  - [ ] SubTask 3.3: 实现空状态展示
  - [ ] SubTask 3.4: 展示竞品名称、域名、关键词、创建时间

- [ ] Task 4: 实现搜索筛选功能
  - [ ] SubTask 4.1: 添加搜索输入框
  - [ ] SubTask 4.2: 实现基于名称和域名的实时过滤

- [ ] Task 5: 实现添加竞品功能
  - [ ] SubTask 5.1: 添加"添加竞品"按钮
  - [ ] SubTask 5.2: 创建添加表单（竞品名称必填、域名、关键词）
  - [ ] SubTask 5.3: 实现表单提交与成功/失败反馈

- [ ] Task 6: 实现编辑竞品功能
  - [ ] SubTask 6.1: 每行添加编辑按钮
  - [ ] SubTask 6.2: 复用添加表单为编辑表单，预填充数据
  - [ ] SubTask 6.3: 实现更新提交与反馈

- [ ] Task 7: 实现删除竞品功能
  - [ ] SubTask 7.1: 每行添加删除按钮
  - [ ] SubTask 7.2: 实现删除确认对话框
  - [ ] SubTask 7.3: 实现删除提交与反馈

- [ ] Task 8: 实现响应式布局适配
  - [ ] SubTask 8.1: 确保页面在移动端和平板设备上正常显示
  - [ ] SubTask 8.2: 确保表格和表单在窄屏下可滚动或自适应

- [ ] Task 9: 更新设置页入口状态
  - [ ] SubTask 9.1: 修改 `src/app/settings/page.tsx` 中竞品管理模块的 `isAvailable` 为 `true`

# Task Dependencies
- Task 2 需在 Task 1 页面骨架创建后开始
- Task 3、4、5、6、7 依赖 Task 2 的数据层完成
- Task 8 可与前面任务并行
- Task 9 依赖其他任务完成后进行

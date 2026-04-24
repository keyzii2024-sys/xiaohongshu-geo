# Tasks

- [x] Task 1: 在 `@/lib/auth/brands.ts` 新增 `getBrandIdForBrowser()` 函数
  - [x] SubTask 1.1: 添加浏览器端 auth.getUser() + user_brands 查询逻辑
  - [x] SubTask 1.2: 返回类型为 `Promise<string | null>`，未登录返回 null

- [x] Task 2: 创建 `@/lib/competitors/crud.ts` CRUD 封装层
  - [x] SubTask 2.1: 定义 Competitor / CreateCompetitorInput / UpdateCompetitorInput 类型
  - [x] SubTask 2.2: 实现 getCompetitors(brandId) 含 keywords normalize
  - [x] SubTask 2.3: 实现 createCompetitor(brandId, input)
  - [x] SubTask 2.4: 实现 updateCompetitor(id, input)
  - [x] SubTask 2.5: 实现 deleteCompetitor(id)

- [x] Task 3: 重构 `competitors/page.tsx` 引用公共模块
  - [x] SubTask 3.1: 删除内联 `getBrandIdForBrowser()`，改用 `@/lib/auth/brands` 导入
  - [x] SubTask 3.2: 删除内联 Supabase CRUD 调用，改用 `@/lib/competitors/crud` 导入
  - [x] SubTask 3.3: 删除内联 `normalizeKeywords`（移入 crud.ts）
  - [x] SubTask 3.4: 验证页面功能不受影响

# Task Dependencies
- Task 1 无依赖，可立即执行
- Task 2 无依赖，可与 Task 1 并行
- Task 3 依赖 Task 1 和 Task 2 完成

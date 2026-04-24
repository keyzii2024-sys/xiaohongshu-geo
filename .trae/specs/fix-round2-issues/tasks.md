# Tasks

- [ ] Task 1: 修复 accounts/page.tsx 内联函数问题
  - [ ] SubTask 1.1: 移除 `useDebounce` 内联函数，添加 `import { useDebounce } from "@/lib/hooks/use-debounce"`
  - [ ] SubTask 1.2: 移除 `getBrandIdForBrowser` 内联函数，添加 `import { getBrandIdForBrowser } from "@/lib/auth/brands"`
  - [ ] SubTask 1.3: 移除 `import { createSupabaseBrowserClient } from "@/lib/supabase/browser"`（如果仅用于 getBrandIdForBrowser）

- [ ] Task 2: 修复 competitors/crud.ts normalizeKeywords 未导出
  - [ ] SubTask 2.1: 将 `function normalizeKeywords` 改为 `export function normalizeKeywords`

- [ ] Task 3: 修复 accounts/page.tsx 使用 getBrandIdForBrowser 共享函数
  - [ ] SubTask 3.1: loadInitialData 函数中直接获取 brandId 的逻辑改为调用 `await getBrandIdForBrowser()`

- [ ] Task 4: 修复 accounts/page.tsx ConfirmModalState itemName 使用
  - [ ] SubTask 4.1: 删除确认时传递 `itemName: account.nickname` 而非通过 `item` 对象
  - [ ] SubTask 4.2: 确认 ConfirmModalState 正确同时支持 `item?: T` 和 `itemName?: string`

- [ ] Task 5: 修复 competitors/page.tsx 冗余导入
  - [ ] SubTask 5.1: 移除未使用的 `UpdateCompetitorInput` 导入

# Task Dependencies
- 所有 Task 可并行执行（文件修改互不干扰）

# Task Parallelization
- Task 1, 2, 3, 4, 5 之间无依赖，可并行执行

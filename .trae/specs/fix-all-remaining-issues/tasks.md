# Tasks

- [ ] Task 1: 提取 ToastMessage 组件到 `src/components/ui/toast.tsx`
  - [ ] SubTask 1.1: 创建 toast.tsx，导出 ToastMessage 组件和 Toast 类型
  - [ ] SubTask 1.2: 更新 competitors/page.tsx 导入
  - [ ] SubTask 1.3: 更新 accounts/page.tsx 导入（保持功能不变）

- [ ] Task 2: 提取 ConfirmModal 组件到 `src/components/ui/confirm-modal.tsx`
  - [ ] SubTask 2.1: 创建 confirm-modal.tsx，导出 ConfirmModal 组件
  - [ ] SubTask 2.2: 更新 competitors/page.tsx 导入
  - [ ] SubTask 2.3: 更新 accounts/page.tsx 导入（同步用公共组件）

- [ ] Task 3: 提取 useDebounce Hook 到 `src/lib/hooks/use-debounce.ts`
  - [ ] SubTask 3.1: 创建 use-debounce.ts
  - [ ] SubTask 3.2: 更新 competitors/page.tsx 导入
  - [ ] SubTask 3.3: 检查项目中其他位置是否也有内联 useDebounce

- [ ] Task 4: competitors/page.tsx 增加表单输入长度限制
  - [ ] SubTask 4.1: competitor_name 添加 maxLength={200} + 字符计数
  - [ ] SubTask 4.2: keywords 添加 maxLength={500} + 字符计数

- [ ] Task 5: competitors/page.tsx 表单提交增加前置守卫
  - [ ] SubTask 5.1: handleAddCompetitor/handleEditCompetitor 开头加 `if (isSubmitting) return;`

# Task Dependencies
- Task 1、2、3 可并行
- Task 4、5 依赖 Task 1、2、3 完成（因为要用公共组件）

# Task Parallelization
- Task 1 和 Task 2 和 Task 3 之间无依赖，可并行执行

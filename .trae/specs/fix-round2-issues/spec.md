# 竞品管理模块第二轮深度自检问题修复 Spec

## Why
第二轮深度自检发现 accounts/page.tsx 上一轮修复未真正生效（内联函数未替换为共享模块），以及 normalizeKeywords 未导出、ConfirmModalState 使用不一致等跨模块一致性问题。必须在合流前全部清零。

## What Changes

### C-1 / M-1（高优先级）修复
- **accounts/page.tsx** 移除内联 `useDebounce` 函数（L46-60），改用 `import { useDebounce } from "@/lib/hooks/use-debounce"`
- **accounts/page.tsx** 移除内联 `getBrandIdForBrowser` 函数（L62-78），改用 `import { getBrandIdForBrowser } from "@/lib/auth/brands"`

### M-3（高优先级）修复
- **competitors/crud.ts** 导出 `normalizeKeywords` 函数（当前仅定义未导出）

### C-3（建议修复）修复
- **accounts/page.tsx** `loadInitialData` 函数中直接使用 `createSupabaseBrowserClient()` 方式获取 brandId 改为调用 `getBrandIdForBrowser()` 共享函数

### U-1（建议修复）修复
- **accounts/page.tsx** ConfirmModalState 使用 `state.item?.nickname` 改为统一使用 `state.itemName`
- **确保 lib/shared/types.ts** 的 ConfirmModalState 泛型 `item` 和 `itemName` 字段共存（itemName 为显示用字符串）

### M-4（低优先级）修复
- **competitors/page.tsx** 移除未使用的 `UpdateCompetitorInput` 导入

## Impact
- 修改文件：
  - `src/app/settings/accounts/page.tsx`
  - `src/app/settings/competitors/page.tsx`
  - `src/lib/competitors/crud.ts`
- 影响范围：仅 accounts 和 competitors 两个 settings 子模块内部重构

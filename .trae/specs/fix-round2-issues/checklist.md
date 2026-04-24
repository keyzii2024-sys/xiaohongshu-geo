# Checklist

- [ ] accounts/page.tsx 已移除内联 `useDebounce` 函数
- [ ] accounts/page.tsx 已移除内联 `getBrandIdForBrowser` 函数
- [ ] accounts/page.tsx 正确导入 `useDebounce` from `@/lib/hooks/use-debounce`
- [ ] accounts/page.tsx 正确导入 `getBrandIdForBrowser` from `@/lib/auth/brands`
- [ ] accounts/page.tsx loadInitialData 使用 `getBrandIdForBrowser()` 共享函数
- [ ] competitors/crud.ts 已导出 `normalizeKeywords` 函数
- [ ] accounts/page.tsx 删除确认传递 `itemName` 而非通过 `item` 对象
- [ ] competitors/page.tsx 已移除未使用的 `UpdateCompetitorInput` 导入
- [ ] 两个页面功能均正常（列表/添加/编辑/删除/搜索）

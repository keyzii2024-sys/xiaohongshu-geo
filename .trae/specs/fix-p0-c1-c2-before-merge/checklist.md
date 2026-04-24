# Checklist

- [x] `@/lib/auth/brands.ts` 已导出 `getBrandIdForBrowser()` 函数
- [x] `@/lib/competitors/crud.ts` 文件已创建，包含完整类型定义和 4 个 CRUD 函数
- [x] `competitors/page.tsx` 不再包含内联 `getBrandIdForBrowser()` 定义
- [x] `competitors/page.tsx` 不再包含内联 `supabase.from("competitors")` 直接调用
- [x] `competitors/page.tsx` 不再包含内联 `normalizeKeywords` 定义
- [x] competitors 页面功能正常：列表加载、添加、编辑、删除、搜索均可用
- [x] accounts 页面功能不受影响（回归验证）

# Checklist

- [ ] `src/components/ui/toast.tsx` 已创建，导出 ToastMessage 和 Toast 类型
- [ ] `src/components/ui/confirm-modal.tsx` 已创建，导出 ConfirmModal
- [ ] `src/lib/hooks/use-debounce.ts` 已创建，导出 useDebounce
- [ ] competitors/page.tsx 导入并使用公共 ToastMessage
- [ ] competitors/page.tsx 导入并使用公共 ConfirmModal
- [ ] competitors/page.tsx 导入并使用公共 useDebounce
- [ ] accounts/page.tsx 同步更新为使用公共 ToastMessage（回归验证）
- [ ] accounts/page.tsx 同步更新为使用公共 ConfirmModal（回归验证）
- [ ] competitor_name 输入框有 maxLength={200} 和字符计数
- [ ] keywords 输入框有 maxLength={500} 和字符计数
- [ ] handleAddCompetitor/handleEditCompetitor 有 `if (isSubmitting) return;` 前置守卫
- [ ] 页面功能正常：列表/添加/编辑/删除/搜索

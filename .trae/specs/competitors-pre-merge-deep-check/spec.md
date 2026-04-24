# 竞品管理模块合流前终极深度自检 Spec

## Why
在竞品管理模块开发完成后、与其他模块合流前，进行跨模块兼容性、一致性与风险排查，确保无冲突、无回归、可安全合流。

## What Changes
- 本次为纯验收任务，不修改任何代码
- 输出结构化问题清单，标注严重程度和修复建议

## Impact
- 验收范围：`src/app/settings/competitors/page.tsx`
- 对比范围：
  - `src/app/settings/accounts/page.tsx`（账号矩阵管理）
  - `src/app/settings/import/page.tsx`（数据导入）
  - `src/app/settings/page.tsx`（设置总览）
  - 项目整体路由/命名/依赖规范

## ADDED Requirements

### Requirement: 合流兼容性检查
系统 SHALL 通过以下维度的跨模块兼容性验证：

#### Scenario: 路由与命名规范
- **WHEN** 检查竞品管理模块的路由路径
- **THEN** 路径格式与 `/settings` 下其他子模块完全统一

#### Scenario: 类型与依赖隔离
- **WHEN** 检查组件/函数/变量命名
- **THEN** 无与项目其他模块的重名或冲突

#### Scenario: 数据层操作隔离
- **WHEN** 检查 Supabase 表操作
- **THEN** 仅操作 `competitors` 表，不影响其他表

### Requirement: 跨模块一致性检查
系统 SHALL 与项目已有模块保持 UI 和交互逻辑的完全一致：

#### Scenario: UI 组件一致性
- 所有元素样式与 accounts/import 页面 100% 统一

#### Scenario: 交互逻辑一致性
- 表单校验、错误提示、Toast 反馈、删除确认等逻辑统一

#### Scenario: 权限与路由守卫
- 权限校验方式与其他模块一致

### Requirement: 极端场景兜底
系统 SHALL 在极端场景下有完整处理：

#### Scenario: 数据边界
- 大数据量、空数据、重复提交、非法输入均有处理

#### Scenario: 网络异常
- 断网/超时报错时有错误兜底

#### Scenario: 响应式适配
- 不同屏幕尺寸下布局正常

## MODIFIED Requirements
无（本次为纯验收任务）

## REMOVED Requirements
无

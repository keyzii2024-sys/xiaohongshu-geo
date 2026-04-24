# Tasks

- [ ] Task 1: 创建账号 CRUD 接口模块
  - [ ] SubTask 1.1: 创建 `src/lib/accounts/` 目录结构
  - [ ] SubTask 1.2: 实现 `getAccounts(brandId)` 获取账号列表
  - [ ] SubTask 1.3: 实现 `createAccount(data)` 创建账号
  - [ ] SubTask 1.4: 实现 `updateAccount(id, data)` 更新账号
  - [ ] SubTask 1.5: 实现 `deleteAccount(id)` 删除账号

- [ ] Task 2: 创建账号矩阵页面
  - [ ] SubTask 2.1: 创建 `src/app/settings/accounts/page.tsx` 页面框架
  - [ ] SubTask 2.2: 实现账号分组概览卡片（自有矩阵、竞品矩阵、合作KOL）
  - [ ] SubTask 2.3: 实现账号列表展示组件
  - [ ] SubTask 2.4: 实现新增账号弹窗与表单
  - [ ] SubTask 2.5: 实现编辑账号弹窗与表单
  - [ ] SubTask 2.6: 实现删除账号确认逻辑
  - [ ] SubTask 2.7: 实现加载状态与错误状态展示
  - [ ] SubTask 2.8: 实现响应式布局适配

- [ ] Task 3: 集成 Supabase 数据层
  - [ ] SubTask 3.1: 在页面组件中调用 CRUD 接口
  - [ ] SubTask 3.2: 实现异常捕获与友好提示
  - [ ] SubTask 3.3: 测试账号 CRUD 全流程

# Task Dependencies
- Task 2 依赖 Task 1（需要先完成 CRUD 接口）

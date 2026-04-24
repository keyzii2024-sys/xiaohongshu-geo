# Tasks
- [x] Task 1: 完成登录页与 Dashboard Shell 基础搭建。
  - [x] 提供 `/login` 页面与邮箱密码登录/注册交互。
  - [x] 提供 `/dashboard` 路由守卫与基础布局骨架。

- [x] Task 2: 完成 Supabase 会话同步与路由跳转。
  - [x] 未登录访问 `/dashboard` 时重定向到 `/login`。
  - [x] 已登录访问 `/login` 时重定向到 `/dashboard`。

- [x] Task 3: 完成首次登录默认品牌初始化。
  - [x] 首次进入 `/dashboard` 时自动创建默认 `brands` 记录。
  - [x] 首次进入 `/dashboard` 时自动创建 `user_brands` 归属关系。

- [x] Task 4: 完成退出登录与基础账号展示。
  - [x] Dashboard 侧栏展示当前账号邮箱。
  - [x] 提供退出登录按钮并在退出后返回 `/login`。

- [x] Task 5: 完成认证联调与串行收口。
  - [x] 修复 `user_brands` 初始化链路，避免因缺少 `UPDATE policy` 导致首次登录写入失败。
  - [x] 补齐 RLS migration 中 `user_brands_update_own` 策略定义，保证数据库定义完整。
  - [x] 使用测试账号完成本地真实联调，验证登录跳转、首次初始化与再次登录幂等。
  - [x] 记录验证结果并完成交付清单勾选。

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 2
- Task 4 depends on Task 2
- Task 5 depends on Task 3, Task 4

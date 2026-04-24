* [x] 未登录访问 `/dashboard` 时会跳转到 `/login`。

* [x] 使用测试账号 `Keyzii@163.com` / `2025Mauy@163com` 可在本地成功登录并进入 `/dashboard`。

* [x] 首次完成默认品牌初始化后，当前用户在 `brands` 中存在 1 条默认品牌记录。

* [x] 首次完成默认品牌初始化后，当前用户在 `user_brands` 中存在 1 条 `OWNER` 归属关系。

* [x] 再次登录不会重复创建 `brands` 或 `user_brands` 记录，记录数保持不变。

* [x] `user_brands` 所需的 RLS 策略定义已补齐到迁移文件。

* [x] 串行主线实现未改动并行窗口负责的 Dashboard 页面内容。

* [x] 本次实现后未引入新的诊断错误，并已完成必要联调验证。

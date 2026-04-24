# 数据导入 CSV 解析与前端校验 Spec

## Why
当前 `/settings/import` 已具备静态演示能力和本地文件占位交互，但仍无法真正帮助产品验证“上传 CSV 后页面如何解析、校验并反馈结果”。在不立即接入数据库写入的前提下，先补齐前端解析、字段校验与结果摘要，可以把数据导入从“演示壳”推进到“可试用流程”，也是接入真实入库前风险最低的一步。

## What Changes
- 在 `/settings/import` 页面接入真实的本地 CSV 读取与前端解析能力。
- 对 CSV 必填字段、文件类型、空值、基础格式错误进行前端校验，并输出清晰结果摘要。
- 支持展示“成功 X 条 / 跳过 Y 条 / 错误原因”的本地解析反馈，但当前仍不写入数据库。
- 提供样例字段映射与导入预览列表，帮助用户理解后续真实入库前的数据质量。
- 保持纯白极简杂志排版，不引入复杂弹窗、动画或装饰性流程图。
- 本阶段不接 Supabase 写入、不执行 upsert、不产生真实导入历史。

## Impact
- Affected specs: 数据导入页面、CSV 解析反馈、字段校验、导入预览、无数据库写入边界
- Affected code: `src/app/settings/import/page.tsx`、数据导入辅助模块、CSV 解析依赖与本地校验逻辑

## ADDED Requirements
### Requirement: 本地 CSV 解析
系统 SHALL 在 `/settings/import` 页面支持读取并解析用户本地选择的 CSV 文件。

#### Scenario: 选择有效 CSV 文件
- **WHEN** 用户选择一个有效的 `.csv` 文件
- **THEN** 页面在浏览器本地读取文件内容
- **THEN** 页面解析 CSV 表头与数据行
- **THEN** 页面不发起真实网络请求

### Requirement: 必填字段校验
系统 SHALL 对 CSV 中的关键字段进行前端校验，避免用户误以为所有文件都可直接导入。

#### Scenario: 缺少必填字段
- **WHEN** CSV 文件缺少必填字段
- **THEN** 页面提示缺少哪些字段
- **THEN** 页面不进入“可导入”状态
- **THEN** 页面保持克制的错误表达，不使用突兀弹窗

### Requirement: 行级错误汇总
系统 SHALL 在解析完成后，汇总成功行数、跳过行数及主要错误原因。

#### Scenario: 存在部分错误行
- **WHEN** CSV 中只有部分数据行格式正确
- **THEN** 页面展示成功条数与跳过条数
- **THEN** 页面列出主要错误原因，如空值、数字格式错误、日期格式错误
- **THEN** 页面不因为单行错误导致整个页面崩溃

### Requirement: 导入预览列表
系统 SHALL 在不入库的前提下，展示解析后的局部预览，帮助用户理解数据会如何被系统消费。

#### Scenario: 解析成功
- **WHEN** 用户上传并成功解析 CSV
- **THEN** 页面展示前若干行导入预览
- **THEN** 每行至少包含核心字段，如 `date`、`visibility`、`citation_rate`
- **THEN** 页面明确标识当前仅为本地预览，尚未写入数据库

### Requirement: 无真实入库
系统 SHALL 在本阶段严格限制为本地解析与校验，不执行真实持久化。

#### Scenario: 完成前端解析
- **WHEN** 用户看到解析成功结果
- **THEN** 页面不得写入 Supabase
- **THEN** 页面不得生成真实导入历史记录
- **THEN** 页面应提示“下一阶段再接入真实导入”

## MODIFIED Requirements
### Requirement: 数据导入页面边界
此前 `/settings/import` 仅需提供本地文件占位与说明；本次起其应升级为“可本地解析、可前端校验、不可入库”的试用版本。

#### Scenario: 从占位升级为可试用
- **WHEN** 用户上传 CSV 文件
- **THEN** 页面不再只停留在文件名反馈
- **THEN** 而是展示实际解析、校验与预览结果

## REMOVED Requirements
### Requirement: 上传后仅展示文件名即结束
**Reason**: 该能力已不足以支撑产品验证真实导入体验。
**Migration**: 升级为本地解析与前端校验版本，但继续保持“无真实入库”边界。

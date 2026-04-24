# 数据导入真实 CSV 入库链路 Spec

## Why
当前 `/settings/import` 已完成占位版交互与三步结构演示，但仍无法真正把用户上传的 CSV 数据写入 `geo_metrics_daily`。Milestone 2 需要把数据导入从“可演示”升级为“可用流程”，先打通模板下载、前端解析、字段校验、日期标准化、错误行跳过和 Supabase upsert 入库的最小闭环。

## What Changes
- 在 `/settings/import` 页面提供真实的 CSV 模板下载能力。
- 接入前端 CSV 解析流程，读取本地文件并完成字段级与行级校验。
- 对 CSV 中不同日期格式进行标准化，统一转换为 `YYYY-MM-DD`。
- 对错误行执行跳过而不是整体失败，并输出成功/跳过摘要与主要错误原因。
- 将合法记录写入 Supabase `geo_metrics_daily` 表，使用 `(brand_id, date)` 作为冲突键执行 upsert。
- 页面保留纯白极简杂志排版，同时新增上传中、成功、失败与部分跳过等真实状态反馈。
- **BREAKING** 数据导入页面不再只是本地占位预览，而是会触发真实数据库写入。

## Impact
- Affected specs: 数据导入页面、CSV 模板下载、前端解析与校验、日期标准化、部分成功反馈、`geo_metrics_daily` 入库
- Affected code: `src/app/settings/import/page.tsx`、可能新增的 CSV 解析/校验辅助模块、Supabase 写入逻辑、模板下载逻辑、必要的类型定义

## ADDED Requirements
### Requirement: CSV 模板下载
系统 SHALL 在 `/settings/import` 页面提供真实的 CSV 模板下载能力。

#### Scenario: 点击下载模板
- **WHEN** 用户点击“下载 CSV 模板”
- **THEN** 浏览器下载一个带标准表头的 CSV 文件
- **THEN** 模板至少包含 `date`、`visibility`、`citation_rate`、`sentiment_score`、`roi_index`、`top3_rate`、`cited_notes_count`、`cited_accounts_count`

### Requirement: 前端 CSV 解析
系统 SHALL 在浏览器端解析用户选择的本地 CSV 文件，并识别表头与数据行。

#### Scenario: 选择有效 CSV 文件
- **WHEN** 用户选择一个合法的 `.csv` 文件
- **THEN** 页面在前端读取文件内容并解析数据
- **THEN** 解析过程不因单行异常导致页面白屏

### Requirement: 字段校验与列名容错
系统 SHALL 对 CSV 执行必填字段校验，并对表头空格进行容错处理。

#### Scenario: 表头存在前后空格
- **WHEN** 用户上传的 CSV 表头包含前后空格
- **THEN** 系统在解析时自动 `trim`
- **THEN** 只要字段语义正确，仍可识别为有效列

#### Scenario: 缺少必填字段
- **WHEN** CSV 缺少任一必填字段
- **THEN** 页面明确提示缺少哪些字段
- **THEN** 系统不得执行入库

### Requirement: 日期标准化
系统 SHALL 将 CSV 中多种可接受日期格式统一标准化为 `YYYY-MM-DD`。

#### Scenario: 日期格式不统一
- **WHEN** 用户上传的 CSV 中包含 `2026/4/23`、`2026.04.23` 或 `2026-04-23`
- **THEN** 系统将可识别日期统一转换为 `YYYY-MM-DD`
- **THEN** 无法识别的日期所在行被标记为错误并跳过

### Requirement: 错误行跳过
系统 SHALL 在存在错误行时继续处理其他有效行，而不是整体中断。

#### Scenario: 存在部分错误行
- **WHEN** CSV 中部分行的数字字段或日期字段格式非法
- **THEN** 系统跳过错误行
- **THEN** 页面展示成功条数、跳过条数与主要错误原因
- **THEN** 有效行仍可继续进入入库流程

### Requirement: `geo_metrics_daily` Upsert 入库
系统 SHALL 将通过校验的记录写入 Supabase `geo_metrics_daily`，并按 `(brand_id, date)` 执行 upsert。

#### Scenario: 上传新日期数据
- **WHEN** 用户上传的 CSV 包含数据库中不存在的日期
- **THEN** 系统插入新的 `geo_metrics_daily` 记录

#### Scenario: 上传重复日期数据
- **WHEN** 用户上传的 CSV 包含数据库中已存在的相同 `brand_id + date`
- **THEN** 系统覆盖更新该日期对应记录
- **THEN** 页面提示导入成功条数，而不是重复报错

### Requirement: 真实导入状态反馈
系统 SHALL 为真实导入过程提供上传中、成功、部分跳过与失败状态反馈。

#### Scenario: 导入成功
- **WHEN** 有效记录完成入库
- **THEN** 页面显示成功导入条数
- **THEN** 页面可提示跳过条数与错误原因摘要

#### Scenario: 导入失败
- **WHEN** Supabase 写入失败或解析阶段发生不可恢复错误
- **THEN** 页面展示简洁且明确的失败提示
- **THEN** 页面不得白屏

## MODIFIED Requirements
### Requirement: 数据导入页面边界
此前 `/settings/import` 仅需提供占位交互，或至多提供本地解析预览；本次起，该页面应升级为真实 CSV 导入入口，并把合法数据写入 `geo_metrics_daily`。

#### Scenario: 从试用版升级为真实导入
- **WHEN** 用户上传有效 CSV 并确认导入
- **THEN** 页面不再只是展示本地预览
- **THEN** 而是执行真实写入并返回导入结果

## REMOVED Requirements
### Requirement: 当前阶段禁止数据库写入
**Reason**: Milestone 2 的目标就是打通真实 CSV 导入链路。
**Migration**: 保留前端解析与错误摘要能力，同时接入 Supabase upsert 写入。

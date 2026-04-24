# 笔记效果分析详情页 Spec

## Why
当前项目已完成仪表盘、竞品分析和 CSV 数据导入全流程，但缺少"笔记效果分析"这一核心内容消费场景的承接页面。GEO 策略最终需要落地到具体笔记的可见度、引用和互动表现，需要一个详情页来展示单篇笔记的全维度数据，帮助运营者快速定位内容优化方向。

## What Changes
- 新增 `/notes/[noteId]` 动态路由页面，承载笔记效果分析详情内容。
- 复用项目已有 SVG 趋势图组件实现数据趋势折线图。
- 使用 recharts PieChart 实现流量来源占比饼图（不引入额外依赖）。
- 实现评论关键词词云占位展示（基于 span 标签模拟词云效果）。
- 新增笔记基础信息卡片、数据趋势区、流量来源区、评论词云区、优化建议卡片的完整静态页面。
- 数据层预留 Supabase API 接入边界，先完成 mock 数据填充和完整静态页面开发。
- 在侧边导航新增"笔记分析"入口。

## Impact
- Affected specs: 仪表盘、竞品分析页面、数据导入页面所定义的纯白极简杂志风格、SVG 趋势图组件复用约定、recharts 图表使用规范
- Affected code: `src/app/notes/[noteId]/page.tsx`（新增）、`src/lib/notes/mock-data.ts`（新增）、`src/components/protected-app-navigation.tsx`（修改）、`src/lib/geo/mock-data.ts`（扩展 Note 类型）

## ADDED Requirements
### Requirement: 笔记效果分析详情页可访问
系统 SHALL 允许已登录用户从侧边栏导航进入笔记效果分析详情页。

#### Scenario: 从侧边栏进入笔记分析
- **WHEN** 用户点击侧边栏"笔记分析"
- **THEN** 页面跳转至 `/notes/demo-note-001`（默认展示的示例笔记）
- **THEN** 当前导航项显示为激活态

### Requirement: 笔记基础信息卡片
系统 SHALL 在页面顶部展示笔记基础信息卡片，包含笔记标题、发布时间、作者、数据概览摘要。

#### Scenario: 查看笔记基础信息
- **WHEN** 用户进入笔记分析页
- **THEN** 展示笔记标题、发布时间、互动数据（点赞/收藏/评论）、GEO 相关指标摘要
- **THEN** 所有内容均由本地 mock 数据渲染

### Requirement: 数据趋势折线图
系统 SHALL 使用项目已有 SVG 趋势图组件展示笔记可见度随时间变化的折线图。

#### Scenario: 查看趋势图
- **WHEN** 用户浏览趋势区
- **THEN** 页面展示"可见度趋势"SVG 折线图
- **THEN** 图表样式与 Dashboard 趋势图保持 100% 一致（相同 geometry 构建逻辑、相同配色）
- **THEN** X 轴为日期，Y 轴为可见度百分比

### Requirement: 流量来源占比饼图
系统 SHALL 使用 recharts PieChart 展示笔记流量来源占比。

#### Scenario: 查看流量来源
- **WHEN** 用户浏览流量来源区
- **THEN** 页面展示饼图，包含搜索来源、推荐来源、关注来源、其他
- **THEN** 配色与项目现有色系保持一致（黑灰为主，品牌红为强调色）
- **THEN** 图例清晰标注各来源名称和占比

### Requirement: 评论关键词词云
系统 SHALL 通过 CSS 布局模拟词云效果，展示笔记评论中的高频关键词。

#### Scenario: 查看评论词云
- **WHEN** 用户浏览词云区
- **THEN** 页面展示关键词列表，每个词有不同字体大小和颜色深浅表示频率
- **THEN** 使用 span + inline style 模拟词云，不引入额外依赖
- **THEN** 关键词贴合业务语境（如"好用""成分安全""会回购"等）

### Requirement: 优化建议卡片
系统 SHALL 展示 2-3 条基于当前笔记数据的优化建议卡片。

#### Scenario: 查看优化建议
- **WHEN** 用户浏览建议区
- **THEN** 展示 2-3 条具体可执行的优化建议
- **THEN** 建议内容贴合 GEO 语境，如内容结构优化、关键词覆盖、引用来源补充等

### Requirement: 纯白极简杂志排版
系统 SHALL 严格遵守项目既有纯白极简杂志风格，确保与 Dashboard、竞品分析等页面 100% 统一。

#### Scenario: 检查页面视觉风格
- **WHEN** 用户浏览笔记分析页
- **THEN** 主背景保持纯白或极浅灰白
- **THEN** 使用圆角卡片（rounded-[28px]）、细边框（border-black/8）、弱阴影（shadow-sm shadow-black/[0.04]）
- **THEN** 标题层级：大标题 text-3xl(font-semibold)、小标题 text-xl(font-semibold)
- **THEN** 字间距统一使用 tracking-tight 或 tracking-[0.xx]em
- **THEN** 避免多余图标、复杂渐变、装饰性动画

### Requirement: 无真实 API 请求
系统 SHALL 在本次实现中完全基于本地静态 mock 数据渲染，不依赖任何外部请求。

#### Scenario: 首次实现静态版本
- **WHEN** 开发本次需求
- **THEN** 笔记分析页不发起真实网络请求获取数据
- **THEN** mock 数据应集中管理，便于后续替换为真实接口返回

## MODIFIED Requirements
### Requirement: 后台导航完整性
此前后台导航未包含"笔记分析"入口；本次起新增该导航项，用户可点击访问。

#### Scenario: 查看侧边栏导航
- **WHEN** 用户进入后台
- **THEN** 侧边栏新增"笔记分析"导航项
- **THEN** 该项为可点击链接，进入 `/notes/demo-note-001`

export type TrendDirection = "up" | "down" | "flat";

export type NoteBasicInfo = {
  noteId: string;
  title: string;
  publishTime: string;
  author: string;
  likes: number;
  collects: number;
  comments: number;
  geoVisibility: string;
  geoCitationRate: string;
  sentimentScore: string;
};

export type NoteTrendPoint = {
  label: string;
  visibility: number;
};

export type TrafficSourceItem = {
  name: string;
  value: number;
  fill: string;
};

export type CommentKeyword = {
  word: string;
  weight: number;
};

export type NoteOptimization = {
  title: string;
  summary: string;
  recommendation: string;
};

export type NoteDetailData = {
  basic: NoteBasicInfo;
  trend: {
    title: string;
    description: string;
    points: NoteTrendPoint[];
  };
  trafficSources: TrafficSourceItem[];
  commentKeywords: CommentKeyword[];
  optimizations: NoteOptimization[];
};

export const noteMockData: NoteDetailData = {
  basic: {
    noteId: "demo-note-001",
    title: "敏感肌必看！水乳搭配的 5 个常见误区",
    publishTime: "2026-04-18",
    author: "护肤研究社",
    likes: 12800,
    collects: 4300,
    comments: 892,
    geoVisibility: "6.2%",
    geoCitationRate: "2.8%",
    sentimentScore: "82",
  },
  trend: {
    title: "可见度趋势",
    description:
      "笔记发布后 5 天内可见度持续攀升，在'敏感肌水乳推荐'问题下的引用率于第 3 天达到峰值。",
    points: [
      { label: "04.18", visibility: 2.1 },
      { label: "04.19", visibility: 3.8 },
      { label: "04.20", visibility: 5.2 },
      { label: "04.21", visibility: 6.0 },
      { label: "04.22", visibility: 6.2 },
    ],
  },
  trafficSources: [
    { name: "搜索来源", value: 48, fill: "#111111" },
    { name: "推荐来源", value: 35, fill: "#6B7280" },
    { name: "关注来源", value: 12, fill: "#C73B31" },
    { name: "其他", value: 5, fill: "#D1D5DB" },
  ],
  commentKeywords: [
    { word: "好用", weight: 96 },
    { word: "成分安全", weight: 88 },
    { word: "会回购", weight: 82 },
    { word: "敏感肌适用", weight: 78 },
    { word: "保湿", weight: 72 },
    { word: "清爽不油腻", weight: 68 },
    { word: "性价比", weight: 62 },
    { word: "包装", weight: 55 },
    { word: "味道", weight: 48 },
    { word: "质地", weight: 45 },
    { word: "吸收快", weight: 42 },
    { word: "温和", weight: 38 },
    { word: "修复", weight: 35 },
    { word: "控油", weight: 32 },
    { word: "刺激", weight: 22 },
    { word: "过敏", weight: 18 },
  ],
  optimizations: [
    {
      title: "机会 01: 强化成分党的专业引用结构",
      summary:
        "当前评论区高频出现'成分安全''温和'等词汇，说明用户对成分视角的回答接受度高，但现有内容缺乏成分对比与引用来源。",
      recommendation:
        "建议在笔记中增加成分功效表格和来源引用，补充'防腐体系分析''活性成分浓度'等具备被引用价值的内容块。",
    },
    {
      title: "机会 02: 补充对比类内容的搜索覆盖",
      summary:
        "搜索来源占比达 48%，但同类问题下竞品笔记的对比型内容可见度更高，说明对比类结构尚未被点点 AI 充分收录。",
      recommendation:
        "建议在现有内容基础上增加'适合肤质对比''使用场景对比''价格带分析'等模块化章节，提升对比问答场景的命中率。",
    },
    {
      title: "机会 03: 优化笔记互动区的 SEO 沉淀",
      summary:
        "收藏率（收藏/点赞）约 33.6%，高于行业均值 25%，说明内容实用性强，但高收藏量尚未有效转化为可见度的持续增长。",
      recommendation:
        "建议在高收藏内容段增加'相关问题推荐阅读'模块，引导用户跳转至下一个问题，增加页面停留时长和回答引用概率。",
    },
  ],
};

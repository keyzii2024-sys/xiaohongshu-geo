export type DashboardGreeting = {
  eyebrow: string;
  title: string;
  description: string;
  focusLabel: string;
  focusValue: string;
};

export type DashboardMetric = {
  label: string;
  value: string;
  change: string;
  direction: "up" | "down" | "flat";
  hint: string;
};

export type DashboardTrendPoint = {
  label: string;
  brand: number;
  competitorAverage: number;
};

export type DashboardAlert = {
  level: string;
  title: string;
  description: string;
  action: string;
};

export type DashboardQuestion = {
  question: string;
  visibility: string;
  citationRate: string;
  trend: string;
  trendDirection: "up" | "down" | "flat";
};

export type DashboardOpportunity = {
  title: string;
  summary: string;
  recommendation: string;
};

export type DashboardRange = "1d" | "7d" | "30d";

export type DashboardDataSource = "database" | "mock";

export type DashboardBrand = {
  id: string;
  name: string;
};

export type DashboardTimeRange = {
  label: string;
  start: string;
  end: string;
};

export type DashboardKpiKey =
  | "roi_index"
  | "sentiment_score"
  | "visibility"
  | "citation_rate";

export type DashboardKpi = {
  label: string;
  value: number;
  displayValue: string;
  change: string;
  trend: "up" | "down" | "flat";
  hint: string;
};

export type GeoDashboardApiResponse = {
  brand: DashboardBrand;
  time_range: DashboardTimeRange;
  greeting: DashboardGreeting;
  kpis: Record<DashboardKpiKey, DashboardKpi>;
  trend: {
    title: string;
    description: string;
    readingHint: DashboardMockData["trend"]["readingHint"];
  };
  trend_series: DashboardTrendPoint[];
  alerts: DashboardAlert[];
  top_questions: DashboardQuestion[];
  recommendations: DashboardOpportunity[];
  meta: {
    brandId: string;
    range: DashboardRange;
    source: DashboardDataSource;
  };
};

export type DashboardMockData = {
  greeting: DashboardGreeting;
  metrics: DashboardMetric[];
  trend: {
    title: string;
    description: string;
    points: DashboardTrendPoint[];
    readingHint: {
      title: string;
      leadLabel: string;
      leadValue: string;
      changeLabel: string;
      changeValue: string;
      summary: string;
    };
  };
  alert: DashboardAlert;
  questions: DashboardQuestion[];
  opportunities: DashboardOpportunity[];
};

const dashboardBrand: DashboardBrand = {
  id: "mock-brand-xiaohongshu-geo",
  name: "小红薯 GEO",
};

const dashboardTimeRanges: Record<DashboardRange, DashboardTimeRange> = {
  "1d": {
    label: "昨日",
    start: "2026-04-22",
    end: "2026-04-22",
  },
  "7d": {
    label: "近 7 日",
    start: "2026-04-16",
    end: "2026-04-22",
  },
  "30d": {
    label: "近 30 日",
    start: "2026-03-24",
    end: "2026-04-22",
  },
};

function parseMetricNumber(value: string) {
  return Number(value.replace(/[^\d.-]/g, ""));
}

function createKpis(metrics: DashboardMetric[]) {
  return {
    roi_index: {
      label: metrics[0]?.label ?? "ROI 转化指数",
      value: parseMetricNumber(metrics[0]?.value ?? "0"),
      displayValue: metrics[0]?.value ?? "0",
      change: metrics[0]?.change ?? "持平",
      trend: metrics[0]?.direction ?? "flat",
      hint: metrics[0]?.hint ?? "",
    },
    sentiment_score: {
      label: metrics[1]?.label ?? "情感健康度",
      value: parseMetricNumber(metrics[1]?.value ?? "0"),
      displayValue: metrics[1]?.value ?? "0",
      change: metrics[1]?.change ?? "持平",
      trend: metrics[1]?.direction ?? "flat",
      hint: metrics[1]?.hint ?? "",
    },
    visibility: {
      label: metrics[2]?.label ?? "可见度",
      value: parseMetricNumber(metrics[2]?.value ?? "0"),
      displayValue: metrics[2]?.value ?? "0",
      change: metrics[2]?.change ?? "持平",
      trend: metrics[2]?.direction ?? "flat",
      hint: metrics[2]?.hint ?? "",
    },
    citation_rate: {
      label: metrics[3]?.label ?? "引用率",
      value: parseMetricNumber(metrics[3]?.value ?? "0"),
      displayValue: metrics[3]?.value ?? "0",
      change: metrics[3]?.change ?? "持平",
      trend: metrics[3]?.direction ?? "flat",
      hint: metrics[3]?.hint ?? "",
    },
  } satisfies Record<DashboardKpiKey, DashboardKpi>;
}

export function normalizeDashboardRange(value: string | null | undefined): DashboardRange {
  if (value === "1d" || value === "24h") {
    return "1d";
  }

  if (value === "30d") {
    return value;
  }

  return "7d";
}

export const dashboardMockData: DashboardMockData = {
  greeting: {
    eyebrow: "品牌可见度概览",
    title: "早上好，Linda。昨日可见度 8.5%，较前日上升 0.8pp。",
    description:
      "过去 7 天，品牌在“敏感肌水乳推荐”和“早 C 晚 A 搭配推荐”两类高意图问题中的可见度继续领先，但竞品 A 的追赶速度明显加快。",
    focusLabel: "本周复盘重点",
    focusValue: "敏感肌水乳 / 品牌词问答 / 对比类搜索词",
  },
  metrics: [
    {
      label: "ROI 转化指数",
      value: "78",
      change: "+5 分",
      direction: "up",
      hint: "高意图问题带来的站内转化效率持续回升，可继续放大优势问答。",
    },
    {
      label: "情感健康度",
      value: "85",
      change: "+2 分",
      direction: "up",
      hint: "整体口碑保持稳定，仅少量问答出现功效质疑类负面语义。",
    },
    {
      label: "可见度",
      value: "8.5%",
      change: "+0.8pp",
      direction: "up",
      hint: "品牌在核心问答中的首屏出现率保持行业领先。",
    },
    {
      label: "引用率",
      value: "3.2%",
      change: "+0.3pp",
      direction: "up",
      hint: "新增两组达人测评素材后，回答引用效率开始回升。",
    },
  ],
  trend: {
    title: "可见度趋势（我方 vs 竞品均值）",
    description:
      "我方整体保持领先，但近两次采样与竞品均值差距缩小，建议优先补齐功效验证与对比问答素材。",
    points: [
      { label: "04.16", brand: 7.5, competitorAverage: 6.2 },
      { label: "04.17", brand: 8.0, competitorAverage: 6.5 },
      { label: "04.18", brand: 8.3, competitorAverage: 6.8 },
      { label: "04.19", brand: 8.6, competitorAverage: 7.0 },
      { label: "04.20", brand: 8.8, competitorAverage: 7.3 },
      { label: "04.21", brand: 8.7, competitorAverage: 7.6 },
      { label: "04.22", brand: 8.5, competitorAverage: 7.7 },
    ],
    readingHint: {
      title: "读数提示",
      leadLabel: "当前领先差值",
      leadValue: "0.8pp",
      changeLabel: "近 48 小时变化",
      changeValue: "差距收窄 0.2pp",
      summary:
        "领先仍在，但竞品 A 在高意图问题上的引用密度提升更快，近两日差距持续收窄。",
    },
  },
  alert: {
    level: "高优先级告警",
    title: "检测到负面舆情：笔记《XX 测评》提及“烂脸”",
    description:
      "近 24 小时，一条高互动测评笔记在点点 AI 相关问答中被多次引用，负面描述集中于“烂脸”和“刺痛”，已经影响情感健康度走势。",
    action: "建议优先核查原笔记语境，并补充成分澄清与敏感肌使用说明素材。",
  },
  questions: [
    {
      question: "敏感肌水乳推荐",
      visibility: "12.5%",
      citationRate: "5.2%",
      trend: "较上周 +12%",
      trendDirection: "up",
    },
    {
      question: "XX 品牌怎么样",
      visibility: "10.2%",
      citationRate: "4.1%",
      trend: "较上周 持平",
      trendDirection: "flat",
    },
    {
      question: "早 C 晚 A 搭配推荐",
      visibility: "8.7%",
      citationRate: "2.3%",
      trend: "较上周 -3%",
      trendDirection: "down",
    },
    {
      question: "油皮防晒推荐",
      visibility: "7.9%",
      citationRate: "2.8%",
      trend: "较上周 +6%",
      trendDirection: "up",
    },
    {
      question: "竞品 A 和 XX 品牌哪个好",
      visibility: "6.8%",
      citationRate: "2.1%",
      trend: "较上周 +4%",
      trendDirection: "up",
    },
  ],
  opportunities: [
    {
      title: "机会 01: 强化敏感肌场景下的专业背书",
      summary:
        "当前高意图流量集中在“敏感肌能不能用”和“是否会刺激”两类问题，但现有被引内容以泛产品介绍为主，专业可信度不足。",
      recommendation:
        "补充皮肤科视角答法，并把回答结构统一为“适用人群 -> 使用频率 -> 风险提示 -> 推荐搭配”。",
    },
    {
      title: "机会 02: 追击竞品 A 的对比型问答增长",
      summary:
        "竞品 A 在“哪个好”“怎么选”类搜索词下的露出提升更快，说明其对比型素材更适合被点点 AI 收录。",
      recommendation:
        "优先制作 3 组标准化对比内容，明确适用肤质、功效节奏、使用体验与价格带差异。",
    },
    {
      title: "机会 03: 抢占早 C 晚 A 的高意图入口",
      summary:
        "“早 C 晚 A 搭配推荐”仍有稳定搜索热度，但当前引用率偏低，说明品牌内容尚未形成标准答案结构。",
      recommendation:
        "围绕使用顺序、避雷组合和敏感肌替代方案补足 3 组内容，以提升后续问答命中率。",
    },
  ],
};

export function buildGeoDashboardResponse({
  brandId,
  range,
}: {
  brandId?: string | null;
  range?: string | null;
} = {}): GeoDashboardApiResponse {
  const normalizedRange = normalizeDashboardRange(range);

  return {
    brand: {
      ...dashboardBrand,
      id: brandId?.trim() || dashboardBrand.id,
    },
    time_range: dashboardTimeRanges[normalizedRange],
    greeting: dashboardMockData.greeting,
    kpis: createKpis(dashboardMockData.metrics),
    trend: {
      title: dashboardMockData.trend.title,
      description: dashboardMockData.trend.description,
      readingHint: dashboardMockData.trend.readingHint,
    },
    trend_series: dashboardMockData.trend.points,
    alerts: [dashboardMockData.alert],
    top_questions: dashboardMockData.questions,
    recommendations: dashboardMockData.opportunities,
    meta: {
      brandId: brandId?.trim() || dashboardBrand.id,
      range: normalizedRange,
      source: "mock",
    },
  };
}

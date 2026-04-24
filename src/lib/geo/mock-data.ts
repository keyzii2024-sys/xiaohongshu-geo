export type TrendDirection = "up" | "down" | "flat";

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
  direction: TrendDirection;
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
  trendDirection: TrendDirection;
};

export type DashboardOpportunity = {
  title: string;
  summary: string;
  recommendation: string;
};

export type DashboardData = {
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

export type CompetitorMetricRow = {
  name: string;
  visibility: number;
  citationRate: number;
  sentiment: number;
  sov: number;
  roi: number;
};

export type CompetitorRadarPaletteItem = {
  key: string;
  stroke: string;
  fill: string;
  fillOpacity: number;
};

export type CompetitorRadarDatum = {
  metric: string;
} & Record<string, string | number>;

export type CompetitorsData = {
  eyebrow: string;
  title: string;
  description: string;
  chartTitle: string;
  chartDescription: string;
  tableEyebrow: string;
  tableTitle: string;
  insightEyebrow: string;
  insightTitle: string;
  insightText: string;
  rows: CompetitorMetricRow[];
  radarPalette: CompetitorRadarPaletteItem[];
  radarData: CompetitorRadarDatum[];
};

export type ImportStep = {
  title: string;
  description: string;
};

export type ImportFieldSuggestion = {
  field: string;
  example: string;
  note: string;
};

export type ImportData = {
  eyebrow: string;
  title: string;
  description: string;
  boundaryNote: string;
  uploadHint: string;
  acceptedFormat: string;
  templateLabel: string;
  templateHint: string;
  pendingIntegrationTitle: string;
  pendingIntegrationDescription: string;
  steps: ImportStep[];
  fieldSuggestions: ImportFieldSuggestion[];
};

export type GeoApiRange = "24h" | "7d" | "30d";

export type GeoApiDataSource = "database" | "mock";

export type GeoApiPayload = {
  brand: {
    id: string;
    name: string;
  };
  range: GeoApiRange;
  dashboard: DashboardData;
  competitors: CompetitorsData;
  importPage: ImportData;
};

export type LegacyDashboardGeoApiResponse = {
  brand: {
    id: string;
    name: string;
  };
  time_range: {
    label: string;
    start: string;
    end: string;
  };
  greeting: DashboardGreeting;
  kpis: {
    roi_index: {
      label: string;
      value: number;
      displayValue: string;
      change: string;
      trend: TrendDirection;
      hint: string;
    };
    sentiment_score: {
      label: string;
      value: number;
      displayValue: string;
      change: string;
      trend: TrendDirection;
      hint: string;
    };
    visibility: {
      label: string;
      value: number;
      displayValue: string;
      change: string;
      trend: TrendDirection;
      hint: string;
    };
    citation_rate: {
      label: string;
      value: number;
      displayValue: string;
      change: string;
      trend: TrendDirection;
      hint: string;
    };
  };
  trend: {
    title: string;
    description: string;
    readingHint: DashboardData["trend"]["readingHint"];
  };
  trend_series: DashboardTrendPoint[];
  alerts: DashboardAlert[];
  top_questions: DashboardQuestion[];
  recommendations: DashboardOpportunity[];
  meta: {
    brandId: string;
    range: "1d" | "7d" | "30d";
    source: GeoApiDataSource;
  };
};

export type GeoApiResponse = GeoApiPayload & LegacyDashboardGeoApiResponse;

const dashboard: DashboardData = {
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

const competitors: CompetitorsData = {
  eyebrow: "Competitor Analysis",
  title: "竞品分析",
  description:
    "以统一 mock 数据对照我方与 Top 3 竞品的 GEO 表现，先完成可见度、引用效率、情感质量与品牌声量的杂志式阅读落位。",
  chartTitle: "核心维度雷达图",
  chartDescription:
    "五个维度分别对应 PRD 中的核心判断口径，用于占位展示未来真实接口返回后的多品牌对比结构。",
  tableEyebrow: "Static Benchmark Table",
  tableTitle: "关键指标对比",
  insightEyebrow: "Insight Summary",
  insightTitle: "竞品动态摘要",
  insightText:
    "近 7 日，竞品 A 在“敏感肌水乳推荐”问题下的可见度提升了 12%，但我方仍在情感健康度与 ROI 转化指数上保持领先，适合继续强化高信任内容的引用占位。",
  rows: [
    {
      name: "小红薯 GEO",
      visibility: 8.5,
      citationRate: 3.2,
      sentiment: 85,
      sov: 36,
      roi: 78,
    },
    {
      name: "竞品 A",
      visibility: 7.2,
      citationRate: 2.8,
      sentiment: 78,
      sov: 32,
      roi: 65,
    },
    {
      name: "竞品 B",
      visibility: 5.1,
      citationRate: 1.9,
      sentiment: 71,
      sov: 21,
      roi: 58,
    },
    {
      name: "竞品 C",
      visibility: 4.3,
      citationRate: 1.5,
      sentiment: 68,
      sov: 17,
      roi: 51,
    },
  ],
  radarPalette: [
    { key: "小红薯 GEO", stroke: "#111111", fill: "#111111", fillOpacity: 0.08 },
    { key: "竞品 A", stroke: "#FF2442", fill: "#FF2442", fillOpacity: 0.12 },
    { key: "竞品 B", stroke: "#6B7280", fill: "#6B7280", fillOpacity: 0.08 },
    { key: "竞品 C", stroke: "#A8A29E", fill: "#A8A29E", fillOpacity: 0.06 },
  ],
  radarData: [
    {
      metric: "可见度",
      "小红薯 GEO": 85,
      "竞品 A": 72,
      "竞品 B": 51,
      "竞品 C": 43,
    },
    {
      metric: "引用率",
      "小红薯 GEO": 64,
      "竞品 A": 56,
      "竞品 B": 38,
      "竞品 C": 30,
    },
    {
      metric: "情感",
      "小红薯 GEO": 85,
      "竞品 A": 78,
      "竞品 B": 71,
      "竞品 C": 68,
    },
    {
      metric: "SOV",
      "小红薯 GEO": 72,
      "竞品 A": 64,
      "竞品 B": 42,
      "竞品 C": 34,
    },
    {
      metric: "ROI",
      "小红薯 GEO": 78,
      "竞品 A": 65,
      "竞品 B": 58,
      "竞品 C": 51,
    },
  ],
};

const importPage: ImportData = {
  eyebrow: "Data Import",
  title: "数据导入",
  description:
    "通过统一 mock 数据入口承载导入页的占位信息，当前仅展示流程、字段建议与本地文件反馈，不触发真实上传。",
  boundaryNote: "当前为占位流程：不解析 CSV、不写入数据库、不调用外部导入服务。",
  uploadHint: "将 CSV 文件拖拽到此处，或点击选择本地文件。",
  acceptedFormat: "仅支持 .csv 文件，建议 UTF-8 编码，首行保留字段表头。",
  templateLabel: "下载模板",
  templateHint: "先以字段说明卡片代替真实模板文件下载，便于后续替换为正式资产。",
  pendingIntegrationTitle: "待接入真实解析/导入服务",
  pendingIntegrationDescription:
    "后续会在此接入 CSV 解析、字段校验、品牌归属校验与导入任务状态回传；当前阶段只保留 API 边界和交互壳。",
  steps: [
    {
      title: "下载模板",
      description: "确认字段顺序、命名规范和示例值后，再组织导入数据。",
    },
    {
      title: "填写数据",
      description: "按样例补充问题、品牌、回答摘要、来源链接等字段。",
    },
    {
      title: "上传文件",
      description: "选择本地 CSV 文件，仅展示文件名、大小和格式校验反馈。",
    },
  ],
  fieldSuggestions: [
    {
      field: "question",
      example: "敏感肌水乳推荐",
      note: "建议使用完整问句，便于后续搜索词聚类。",
    },
    {
      field: "brand",
      example: "小红薯 GEO",
      note: "与系统品牌名保持一致，减少映射成本。",
    },
    {
      field: "answer_summary",
      example: "适合敏感肌，强调成分温和与使用频率建议。",
      note: "控制在 80 字以内，便于列表摘要展示。",
    },
    {
      field: "source_url",
      example: "https://example.com/post/123",
      note: "后续用于引用溯源与去重。",
    },
  ],
};

export function getGeoApiPayload(params?: {
  brandId?: string | null;
  range?: string | null;
}): GeoApiPayload {
  const brandId = params?.brandId?.trim() || "default-brand";
  const range = params?.range === "24h" || params?.range === "30d" ? params.range : "7d";

  return {
    brand: {
      id: brandId,
      name: "小红薯 GEO",
    },
    range,
    dashboard,
    competitors,
    importPage,
  };
}

export const geoMockData = getGeoApiPayload();

function parseMetricNumber(value: string) {
  return Number(value.replace(/[^\d.-]/g, ""));
}

function getLegacyRange(range: string | null | undefined): "1d" | "7d" | "30d" {
  if (range === "24h") {
    return "1d";
  }

  if (range === "30d") {
    return "30d";
  }

  return "7d";
}

export function getGeoApiResponse(params?: {
  brandId?: string | null;
  range?: string | null;
}): GeoApiResponse {
  const payload = getGeoApiPayload(params);
  const legacyRange = getLegacyRange(params?.range);

  return {
    ...payload,
    brand: payload.brand,
    time_range: {
      label: legacyRange === "1d" ? "昨日" : legacyRange === "30d" ? "近 30 日" : "近 7 日",
      start:
        legacyRange === "1d"
          ? "2026-04-22"
          : legacyRange === "30d"
            ? "2026-03-24"
            : "2026-04-16",
      end: "2026-04-22",
    },
    greeting: payload.dashboard.greeting,
    kpis: {
      roi_index: {
        label: payload.dashboard.metrics[0]?.label ?? "ROI 转化指数",
        value: parseMetricNumber(payload.dashboard.metrics[0]?.value ?? "0"),
        displayValue: payload.dashboard.metrics[0]?.value ?? "0",
        change: payload.dashboard.metrics[0]?.change ?? "持平",
        trend: payload.dashboard.metrics[0]?.direction ?? "flat",
        hint: payload.dashboard.metrics[0]?.hint ?? "",
      },
      sentiment_score: {
        label: payload.dashboard.metrics[1]?.label ?? "情感健康度",
        value: parseMetricNumber(payload.dashboard.metrics[1]?.value ?? "0"),
        displayValue: payload.dashboard.metrics[1]?.value ?? "0",
        change: payload.dashboard.metrics[1]?.change ?? "持平",
        trend: payload.dashboard.metrics[1]?.direction ?? "flat",
        hint: payload.dashboard.metrics[1]?.hint ?? "",
      },
      visibility: {
        label: payload.dashboard.metrics[2]?.label ?? "可见度",
        value: parseMetricNumber(payload.dashboard.metrics[2]?.value ?? "0"),
        displayValue: payload.dashboard.metrics[2]?.value ?? "0",
        change: payload.dashboard.metrics[2]?.change ?? "持平",
        trend: payload.dashboard.metrics[2]?.direction ?? "flat",
        hint: payload.dashboard.metrics[2]?.hint ?? "",
      },
      citation_rate: {
        label: payload.dashboard.metrics[3]?.label ?? "引用率",
        value: parseMetricNumber(payload.dashboard.metrics[3]?.value ?? "0"),
        displayValue: payload.dashboard.metrics[3]?.value ?? "0",
        change: payload.dashboard.metrics[3]?.change ?? "持平",
        trend: payload.dashboard.metrics[3]?.direction ?? "flat",
        hint: payload.dashboard.metrics[3]?.hint ?? "",
      },
    },
    trend: {
      title: payload.dashboard.trend.title,
      description: payload.dashboard.trend.description,
      readingHint: payload.dashboard.trend.readingHint,
    },
    trend_series: payload.dashboard.trend.points,
    alerts: [payload.dashboard.alert],
    top_questions: payload.dashboard.questions,
    recommendations: payload.dashboard.opportunities,
    meta: {
      brandId: payload.brand.id,
      range: legacyRange,
      source: "mock",
    },
  };
}

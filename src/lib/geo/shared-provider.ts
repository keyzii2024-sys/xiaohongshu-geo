import type { SupabaseClient } from "@supabase/supabase-js";

import {
  ensureDefaultBrandForUser,
  getPrimaryBrandIdForUser,
} from "@/lib/auth/brands";
import type {
  DashboardAlert,
  DashboardData,
  DashboardMetric,
  DashboardQuestion,
  DashboardTrendPoint,
  GeoApiResponse,
  GeoApiRange,
} from "@/lib/geo/mock-data";
import { getGeoApiPayload } from "@/lib/geo/mock-data";
import type {
  ReportHistoryItem,
  ReportPreview,
  ReportQuestionInsight,
  ReportRangeOption,
  ReportTypeOption,
} from "@/lib/reports/mock-data";
import { getReportPreviewById, reportCenterMockData } from "@/lib/reports/mock-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SharedGeoRange = "1d" | "7d" | "30d";
export type SharedGeoSource = "database" | "mock";
type TrendDirection = DashboardMetric["direction"];

type GeoMetricDailyRow = {
  date: string;
  visibility: number | null;
  citation_rate: number | null;
  sentiment_score: number | null;
  roi_index: number | null;
  top3_rate: number | null;
  cited_notes_count: number | null;
  cited_accounts_count: number | null;
};

export type SharedGeoBrand = {
  id: string;
  name: string;
};

export type SharedGeoTimeRange = {
  label: string;
  start: string;
  end: string;
  days: number;
};

export type SharedGeoReportsModel = {
  defaultPreviewReportId: string;
  generatorDefaults: {
    typeId: string;
    rangeId: SharedGeoRange;
  };
  reportTypes: ReportTypeOption[];
  reportRanges: ReportRangeOption[];
  history: ReportHistoryItem[];
  previews: ReportPreview[];
};

export type SharedGeoProviderResult = {
  brand: SharedGeoBrand;
  range: SharedGeoRange;
  timeRange: SharedGeoTimeRange;
  source: SharedGeoSource;
  dashboard: DashboardData;
  reports: SharedGeoReportsModel;
  meta: {
    brandId: string;
    range: SharedGeoRange;
    source: SharedGeoSource;
    rowCount: number;
    hasDatabaseRows: boolean;
  };
};

export type SharedGeoProviderOptions = {
  brandId?: string | null;
  range?: string | null;
  supabase?: SupabaseClient;
};

const DEFAULT_BRAND_NAME = "小红薯 GEO";
const DEFAULT_BRAND_ID = "default-brand";

const RANGE_DAY_COUNT: Record<SharedGeoRange, number> = {
  "1d": 1,
  "7d": 7,
  "30d": 30,
};

function roundTo(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function formatNumber(value: number, digits = 1) {
  return roundTo(value, digits).toFixed(digits).replace(/\.0+$/, "");
}

function formatPercent(value: number, digits = 1) {
  return `${formatNumber(value, digits)}%`;
}

function formatScore(value: number) {
  return formatNumber(value, Math.abs(value - Math.round(value)) < 0.05 ? 0 : 1);
}

function parseMetricNumericValue(value: string) {
  return Number(value.replace(/[^\d.-]/g, "")) || 0;
}

function getTrendDirection(delta: number, epsilon = 0.05): TrendDirection {
  if (delta > epsilon) {
    return "up";
  }

  if (delta < -epsilon) {
    return "down";
  }

  return "flat";
}

function formatSignedValue(delta: number, unit: string, digits = 1) {
  if (Math.abs(delta) < 0.05) {
    return "持平";
  }

  return `${delta > 0 ? "+" : ""}${formatNumber(delta, digits)}${unit}`;
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function shiftIsoDate(dateText: string, offsetDays: number) {
  const date = new Date(`${dateText}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return toIsoDate(date);
}

function toDateLabel(dateText: string) {
  const [, month, day] = dateText.split("-");
  return `${month}.${day}`;
}

function average(values: Array<number | null | undefined>) {
  const normalized = values.filter((value): value is number => typeof value === "number");

  if (normalized.length === 0) {
    return 0;
  }

  return normalized.reduce((sum, value) => sum + value, 0) / normalized.length;
}

function cloneDashboardData(data: DashboardData): DashboardData {
  return {
    greeting: { ...data.greeting },
    metrics: data.metrics.map((metric) => ({ ...metric })),
    trend: {
      title: data.trend.title,
      description: data.trend.description,
      points: data.trend.points.map((point) => ({ ...point })),
      readingHint: { ...data.trend.readingHint },
    },
    alert: { ...data.alert },
    questions: data.questions.map((question) => ({ ...question })),
    opportunities: data.opportunities.map((opportunity) => ({ ...opportunity })),
  };
}

function cloneReportPreview(preview: ReportPreview): ReportPreview {
  return {
    ...preview,
    cover: { ...preview.cover },
    executiveSummary: {
      ...preview.executiveSummary,
      bullets: [...preview.executiveSummary.bullets],
    },
    kpis: preview.kpis.map((item) => ({ ...item })),
    trend: {
      ...preview.trend,
      points: preview.trend.points.map((point) => ({ ...point })),
      signals: [...preview.trend.signals],
    },
    competitorComparison: {
      ...preview.competitorComparison,
      rows: preview.competitorComparison.rows.map((row) => ({ ...row })),
    },
    topQuestions: {
      ...preview.topQuestions,
      items: preview.topQuestions.items.map((item) => ({ ...item })),
    },
    opportunities: {
      ...preview.opportunities,
      items: preview.opportunities.items.map((item) => ({ ...item })),
    },
  };
}

function normalizeSharedGeoRange(value: string | null | undefined): SharedGeoRange {
  if (value === "24h" || value === "1d") {
    return "1d";
  }

  if (value === "30d") {
    return "30d";
  }

  return "7d";
}

function toGeoApiRange(range: SharedGeoRange): GeoApiRange {
  if (range === "1d") {
    return "24h";
  }

  return range;
}

function buildTimeRange(range: SharedGeoRange, endDate: string): SharedGeoTimeRange {
  const days = RANGE_DAY_COUNT[range];
  const startDate = shiftIsoDate(endDate, -(days - 1));

  return {
    label: range === "1d" ? "昨日" : range === "30d" ? "近 30 日" : "近 7 日",
    start: startDate,
    end: endDate,
    days,
  };
}

async function resolveBrandContext(
  supabase: SupabaseClient,
  explicitBrandId: string | null | undefined,
) {
  const normalizedExplicitBrandId = explicitBrandId?.trim();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let brandId = normalizedExplicitBrandId ?? DEFAULT_BRAND_ID;

  if (!normalizedExplicitBrandId && user) {
    await ensureDefaultBrandForUser(supabase, user);
    brandId = await getPrimaryBrandIdForUser(supabase, user.id);
  }

  const { data: brandRow } = await supabase
    .from("brands")
    .select("id, name")
    .eq("id", brandId)
    .maybeSingle();

  return {
    brandId,
    brandName: brandRow?.name ?? DEFAULT_BRAND_NAME,
  };
}

async function loadLatestMetricDate(supabase: SupabaseClient, brandId: string) {
  const { data, error } = await supabase
    .from("geo_metrics_daily")
    .select("date")
    .eq("brand_id", brandId)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.date ?? null;
}

async function loadMetricRows(
  supabase: SupabaseClient,
  brandId: string,
  startDate: string,
  endDate: string,
) {
  const { data, error } = await supabase
    .from("geo_metrics_daily")
    .select(
      "date, visibility, citation_rate, sentiment_score, roi_index, top3_rate, cited_notes_count, cited_accounts_count",
    )
    .eq("brand_id", brandId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as GeoMetricDailyRow[];
}

function deriveCompetitorAverage(row: GeoMetricDailyRow, fallbackVisibility: number) {
  const visibility = row.visibility ?? fallbackVisibility;
  const impliedGap = Math.max(
    0.4,
    Math.min(2.5, (row.top3_rate ?? fallbackVisibility * 1.2) / 12),
  );

  return roundTo(Math.max(visibility - impliedGap, 0), 1);
}

function buildDashboardQuestions(
  templateQuestions: DashboardQuestion[],
  visibilityChange: number,
  citationChange: number,
) {
  return templateQuestions.map((question, index) => {
    if (index > 1) {
      return { ...question };
    }

    const direction = index === 0 ? getTrendDirection(visibilityChange) : getTrendDirection(citationChange);
    const rawDelta = index === 0 ? visibilityChange : citationChange;

    return {
      ...question,
      trendDirection: direction,
      trend: `较上一周期 ${formatSignedValue(rawDelta, index === 0 ? "pp" : "pp")}`,
    };
  });
}

function buildDashboardAlert(templateAlert: DashboardAlert, sentimentChange: number) {
  if (sentimentChange < -1) {
    return {
      level: "高优先级告警",
      title: "情感健康度出现回落",
      description:
        "最近一个统计窗口内，品牌情感指标低于上一周期，建议尽快复核近期被引用内容与评论语义波动。",
      action: "优先核查负面语义来源，并补充风险提示与成分澄清内容。",
    };
  }

  return { ...templateAlert };
}

function buildDynamicDashboard(params: {
  brandName: string;
  range: SharedGeoRange;
  timeRange: SharedGeoTimeRange;
  currentRows: GeoMetricDailyRow[];
  previousRows: GeoMetricDailyRow[];
  fallbackDashboard: DashboardData;
}): DashboardData {
  const { brandName, range, timeRange, currentRows, previousRows, fallbackDashboard } = params;
  const dashboard = cloneDashboardData(fallbackDashboard);
  const currentVisibility = average(currentRows.map((row) => row.visibility));
  const currentCitationRate = average(currentRows.map((row) => row.citation_rate));
  const currentSentiment = average(currentRows.map((row) => row.sentiment_score));
  const currentRoi = average(currentRows.map((row) => row.roi_index));
  const currentTop3Rate = average(currentRows.map((row) => row.top3_rate));
  const previousVisibility = average(previousRows.map((row) => row.visibility));
  const previousCitationRate = average(previousRows.map((row) => row.citation_rate));
  const previousSentiment = average(previousRows.map((row) => row.sentiment_score));
  const previousRoi = average(previousRows.map((row) => row.roi_index));
  const visibilityChange = currentVisibility - previousVisibility;
  const citationChange = currentCitationRate - previousCitationRate;
  const sentimentChange = currentSentiment - previousSentiment;
  const roiChange = currentRoi - previousRoi;
  const trendPoints: DashboardTrendPoint[] = currentRows.map((row) => ({
    label: toDateLabel(row.date),
    brand: roundTo(row.visibility ?? currentVisibility, 1),
    competitorAverage: deriveCompetitorAverage(row, currentVisibility),
  }));
  const lastPoint = trendPoints[trendPoints.length - 1];
  const previousLead =
    trendPoints.length > 1
      ? trendPoints[trendPoints.length - 2].brand - trendPoints[trendPoints.length - 2].competitorAverage
      : 0;
  const currentLead = lastPoint ? lastPoint.brand - lastPoint.competitorAverage : 0;

  dashboard.greeting = {
    eyebrow: "品牌可见度概览",
    title: `${brandName} ${timeRange.label}可见度 ${formatPercent(currentVisibility)}，较上一周期 ${formatSignedValue(visibilityChange, "pp")}。`,
    description:
      range === "1d"
        ? "当前视图基于最近 1 天导入的 GEO 指标汇总，帮助快速判断短期波动与引用效率变化。"
        : `当前视图基于 ${timeRange.label} 已导入 GEO 指标聚合，统一输出 KPI、趋势与报告摘要口径。`,
    focusLabel: "当前查询窗口",
    focusValue: `${timeRange.start} 至 ${timeRange.end}`,
  };

  dashboard.metrics = [
    {
      label: "ROI 转化指数",
      value: formatScore(currentRoi),
      change: formatSignedValue(roiChange, " 分", 0),
      direction: getTrendDirection(roiChange, 0.5),
      hint: "按当前范围聚合 `geo_metrics_daily.roi_index` 后得到，用于观察内容被吸收后的转化效率变化。",
    },
    {
      label: "情感健康度",
      value: formatScore(currentSentiment),
      change: formatSignedValue(sentimentChange, " 分", 0),
      direction: getTrendDirection(sentimentChange, 0.5),
      hint: "按当前范围聚合 `geo_metrics_daily.sentiment_score` 后得到，用于观察整体语义情绪健康度。",
    },
    {
      label: "可见度",
      value: formatPercent(currentVisibility),
      change: formatSignedValue(visibilityChange, "pp"),
      direction: getTrendDirection(visibilityChange),
      hint: "按当前范围聚合 `geo_metrics_daily.visibility` 后得到，用于观察品牌首屏露出稳定度。",
    },
    {
      label: "引用率",
      value: formatPercent(currentCitationRate),
      change: formatSignedValue(citationChange, "pp"),
      direction: getTrendDirection(citationChange),
      hint: "按当前范围聚合 `geo_metrics_daily.citation_rate` 后得到，用于观察内容被回答引用的效率。",
    },
  ];

  dashboard.trend = {
    title: "可见度趋势（我方 vs 竞品均值）",
    description: `趋势按 ${timeRange.label} 的日粒度导入数据绘制，我方曲线来自真实可见度，竞品均值为基于导入占位指标推导的对照线。`,
    points: trendPoints,
    readingHint: {
      title: "读数提示",
      leadLabel: "当前领先差值",
      leadValue: `${formatNumber(currentLead, 1)}pp`,
      changeLabel: "最近一次采样变化",
      changeValue: `${formatSignedValue(currentLead - previousLead, "pp")}`,
      summary:
        currentLead >= 0
          ? `当前窗口内我方仍保持约 ${formatNumber(currentLead, 1)}pp 的领先幅度，Top3 占比均值约为 ${formatPercent(currentTop3Rate)}。`
          : `当前窗口内我方已落后约 ${formatNumber(Math.abs(currentLead), 1)}pp，建议优先复盘高意图问题与被引内容结构。`,
    },
  };

  dashboard.alert = buildDashboardAlert(fallbackDashboard.alert, sentimentChange);
  dashboard.questions = buildDashboardQuestions(
    fallbackDashboard.questions,
    visibilityChange,
    citationChange,
  );
  dashboard.opportunities = fallbackDashboard.opportunities.map((item, index) => {
    if (index === 0) {
      return {
        ...item,
        summary: `当前 ${timeRange.label} 平均可见度为 ${formatPercent(currentVisibility)}，说明核心内容仍有稳定入口，但需要继续强化被引解释结构。`,
      };
    }

    return { ...item };
  });

  return dashboard;
}

function buildTopQuestionInsights(questions: DashboardQuestion[]): ReportQuestionInsight[] {
  return questions.slice(0, 3).map((item) => ({
    question: item.question,
    whyItMatters: `当前可见度 ${item.visibility}，引用率 ${item.citationRate}，可作为当前周期的重点问题样本继续观察。`,
    nextMove:
      item.trendDirection === "down"
        ? "优先补足解释链路与对比素材，避免关键问题继续下滑。"
        : "继续强化现有答法结构，保持高意图问题的被引稳定性。",
  }));
}

function formatReportDateRange(timeRange: SharedGeoTimeRange) {
  return `${timeRange.start.replaceAll("-", ".")} - ${timeRange.end.replaceAll("-", ".")}`;
}

function buildReportRangeOptions(endDate: string): ReportRangeOption[] {
  return (["1d", "7d", "30d"] as const).map((range) => {
    const timeRange = buildTimeRange(range, endDate);

    return {
      id: range,
      label: timeRange.label,
      dateRange: formatReportDateRange(timeRange),
      description:
        range === "1d"
          ? "适合快速查看最近一次导入窗口的短期波动。"
          : range === "30d"
            ? "适合观察更长周期的可见度、引用率与情感变化趋势。"
            : "用于例行周报，覆盖最近一周的关键指标与重点问题变化。",
    };
  });
}

function buildSharedReportPreview(params: {
  template: ReportPreview;
  brand: SharedGeoBrand;
  range: SharedGeoRange;
  timeRange: SharedGeoTimeRange;
  source: SharedGeoSource;
  dashboard: DashboardData;
}): ReportPreview {
  const { template, brand, range, timeRange, source, dashboard } = params;
  const preview = cloneReportPreview(template);
  const metrics = dashboard.metrics;

  preview.name = `${brand.name} ${template.type}`;
  preview.period = `${timeRange.start.replaceAll("-", ".")} - ${timeRange.end.replaceAll("-", ".")}`;
  preview.cover = {
    ...preview.cover,
    title:
      range === "1d"
        ? `${brand.name} 最近 1 天 GEO 表现速览。`
        : `${brand.name} ${timeRange.label} GEO 指标复盘。`,
    subtitle: `${dashboard.greeting.title} 当前报告由共享 GEO provider 统一输出，数据源为 ${source === "database" ? "已导入数据" : "示例 mock"}。`,
    preparedFor: brand.name,
    preparedAt: `生成时间：${new Date().toISOString().slice(0, 16).replace("T", " ")}`,
    narrative:
      "本报告页的 KPI、趋势与摘要与 Dashboard 使用同一套 provider，后续接入页面时可直接复用同口径结果。",
  };
  preview.executiveSummary = {
    title: "核心摘要",
    lede: dashboard.greeting.description,
    bullets: [
      `${metrics[2]?.label ?? "可见度"}为 ${metrics[2]?.value ?? "-" }，变化 ${metrics[2]?.change ?? "持平"}。`,
      `${metrics[3]?.label ?? "引用率"}为 ${metrics[3]?.value ?? "-"}，变化 ${metrics[3]?.change ?? "持平"}。`,
      `${metrics[1]?.label ?? "情感健康度"}为 ${metrics[1]?.value ?? "-"}，变化 ${metrics[1]?.change ?? "持平"}。`,
    ],
  };
  preview.kpis = metrics.map((metric) => ({
    label: metric.label,
    value: metric.value,
    delta: metric.change,
    interpretation: metric.hint,
  }));
  preview.trend = {
    title: "趋势分析",
    description: dashboard.trend.description,
    observation: dashboard.trend.readingHint.summary,
    points: dashboard.trend.points.map((point) => ({
      label: point.label,
      ours: point.brand,
      competitorAverage: point.competitorAverage,
    })),
    signals: [
      `${dashboard.trend.readingHint.leadLabel}：${dashboard.trend.readingHint.leadValue}`,
      `${dashboard.trend.readingHint.changeLabel}：${dashboard.trend.readingHint.changeValue}`,
      `当前数据源：${source === "database" ? "已导入数据库数据" : "示例 mock 数据"}`,
    ],
  };
  preview.competitorComparison.rows = preview.competitorComparison.rows.map((row, index) => {
    if (index !== 0) {
      return row;
    }

    return {
      ...row,
      brand: brand.name,
      visibility: metrics[2]?.value ?? row.visibility,
      citationRate: metrics[3]?.value ?? row.citationRate,
      sentiment: metrics[1]?.value ?? row.sentiment,
      shareOfVoice: dashboard.trend.readingHint.leadValue,
      takeaway: dashboard.trend.readingHint.summary,
    };
  });
  preview.topQuestions.items = buildTopQuestionInsights(dashboard.questions);
  preview.opportunities.items = dashboard.opportunities.map((item) => ({
    title: item.title,
    opportunity: item.summary,
    action: item.recommendation,
  }));

  return preview;
}

function buildReportsModel(params: {
  brand: SharedGeoBrand;
  range: SharedGeoRange;
  timeRange: SharedGeoTimeRange;
  source: SharedGeoSource;
  dashboard: DashboardData;
}): SharedGeoReportsModel {
  const { brand, range, timeRange, source, dashboard } = params;
  const previews = reportCenterMockData.history
    .map((item) => getReportPreviewById(item.id))
    .filter((preview): preview is ReportPreview => preview !== null)
    .map((preview) =>
      buildSharedReportPreview({
        template: preview,
        brand,
        range,
        timeRange,
        source,
        dashboard,
      }),
    );
  const reportRanges = buildReportRangeOptions(timeRange.end);

  return {
    defaultPreviewReportId: reportCenterMockData.defaultPreviewReportId,
    generatorDefaults: {
      typeId: reportCenterMockData.generatorDefaults.typeId,
      rangeId: range,
    },
    reportTypes: [...reportCenterMockData.reportTypes],
    reportRanges,
    history: reportCenterMockData.history.map((item) => ({
      ...item,
      name: `${brand.name} ${item.type}`,
      period: formatReportDateRange(timeRange),
      summary:
        source === "database"
          ? `${timeRange.label} 已导入数据聚合结果，可与 Dashboard 共享同一指标口径。`
          : "当前使用示例 mock 数据占位，后续页面接入后仍走同一 provider。",
    })),
    previews,
  };
}

export function buildMockResult(brand: SharedGeoBrand, range: SharedGeoRange): SharedGeoProviderResult {
  const payload = getGeoApiPayload({
    brandId: brand.id,
    range: toGeoApiRange(range),
  });
  const dashboard = cloneDashboardData({
    ...payload.dashboard,
    greeting: {
      ...payload.dashboard.greeting,
      title: brand.name === DEFAULT_BRAND_NAME
        ? payload.dashboard.greeting.title
        : `${brand.name} 当前暂无导入数据，先展示示例 GEO 看板。`,
    },
  });
  const timeRange = buildTimeRange(range, "2026-04-22");

  return {
    brand,
    range,
    timeRange,
    source: "mock",
    dashboard,
    reports: buildReportsModel({
      brand,
      range,
      timeRange,
      source: "mock",
      dashboard,
    }),
    meta: {
      brandId: brand.id,
      range,
      source: "mock",
      rowCount: 0,
      hasDatabaseRows: false,
    },
  };
}

export function toGeoApiResponse(result: SharedGeoProviderResult): GeoApiResponse {
  const payload = getGeoApiPayload({
    brandId: result.brand.id,
    range: toGeoApiRange(result.range),
  });
  const [roiMetric, sentimentMetric, visibilityMetric, citationMetric] = result.dashboard.metrics;

  return {
    ...payload,
    brand: result.brand,
    range: toGeoApiRange(result.range),
    dashboard: result.dashboard,
    time_range: {
      label: result.timeRange.label,
      start: result.timeRange.start,
      end: result.timeRange.end,
    },
    greeting: result.dashboard.greeting,
    kpis: {
      roi_index: {
        label: roiMetric?.label ?? "ROI 转化指数",
        value: parseMetricNumericValue(roiMetric?.value ?? "0"),
        displayValue: roiMetric?.value ?? "0",
        change: roiMetric?.change ?? "持平",
        trend: roiMetric?.direction ?? "flat",
        hint: roiMetric?.hint ?? "",
      },
      sentiment_score: {
        label: sentimentMetric?.label ?? "情感健康度",
        value: parseMetricNumericValue(sentimentMetric?.value ?? "0"),
        displayValue: sentimentMetric?.value ?? "0",
        change: sentimentMetric?.change ?? "持平",
        trend: sentimentMetric?.direction ?? "flat",
        hint: sentimentMetric?.hint ?? "",
      },
      visibility: {
        label: visibilityMetric?.label ?? "可见度",
        value: parseMetricNumericValue(visibilityMetric?.value ?? "0"),
        displayValue: visibilityMetric?.value ?? "0",
        change: visibilityMetric?.change ?? "持平",
        trend: visibilityMetric?.direction ?? "flat",
        hint: visibilityMetric?.hint ?? "",
      },
      citation_rate: {
        label: citationMetric?.label ?? "引用率",
        value: parseMetricNumericValue(citationMetric?.value ?? "0"),
        displayValue: citationMetric?.value ?? "0",
        change: citationMetric?.change ?? "持平",
        trend: citationMetric?.direction ?? "flat",
        hint: citationMetric?.hint ?? "",
      },
    },
    trend: {
      title: result.dashboard.trend.title,
      description: result.dashboard.trend.description,
      readingHint: result.dashboard.trend.readingHint,
    },
    trend_series: result.dashboard.trend.points,
    alerts: [result.dashboard.alert],
    top_questions: result.dashboard.questions,
    recommendations: result.dashboard.opportunities,
    meta: {
      brandId: result.meta.brandId,
      range: result.range,
      source: result.source,
    },
  };
}

export async function getSharedGeoProviderData(
  options: SharedGeoProviderOptions = {},
): Promise<SharedGeoProviderResult> {
  const range = normalizeSharedGeoRange(options.range);
  const supabase = options.supabase ?? createSupabaseServerClient();

  try {
    const { brandId, brandName } = await resolveBrandContext(supabase, options.brandId);
    const brand = {
      id: brandId,
      name: brandName,
    };
    const latestMetricDate = await loadLatestMetricDate(supabase, brandId);

    if (!latestMetricDate) {
      return buildMockResult(brand, range);
    }

    const timeRange = buildTimeRange(range, latestMetricDate);
    const previousStartDate = shiftIsoDate(timeRange.start, -timeRange.days);
    const rows = await loadMetricRows(supabase, brandId, previousStartDate, timeRange.end);
    const currentRows = rows.filter((row) => row.date >= timeRange.start);
    const previousRows = rows.filter((row) => row.date < timeRange.start);

    if (currentRows.length === 0) {
      return buildMockResult(brand, range);
    }

    const fallbackPayload = getGeoApiPayload({
      brandId,
      range: toGeoApiRange(range),
    });
    const dashboard = buildDynamicDashboard({
      brandName,
      range,
      timeRange,
      currentRows,
      previousRows,
      fallbackDashboard: fallbackPayload.dashboard,
    });

    return {
      brand,
      range,
      timeRange,
      source: "database",
      dashboard,
      reports: buildReportsModel({
        brand,
        range,
        timeRange,
        source: "database",
        dashboard,
      }),
      meta: {
        brandId,
        range,
        source: "database",
        rowCount: currentRows.length,
        hasDatabaseRows: true,
      },
    };
  } catch (error) {
    console.error("Failed to build shared GEO provider data", error);

    return buildMockResult(
      {
        id: options.brandId?.trim() || DEFAULT_BRAND_ID,
        name: DEFAULT_BRAND_NAME,
      },
      range,
    );
  }
}

export { normalizeSharedGeoRange };

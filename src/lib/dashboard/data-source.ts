import type { SupabaseClient } from "@supabase/supabase-js";

import { getPrimaryBrandIdForUser } from "@/lib/auth/brands";

import {
  buildGeoDashboardResponse,
  dashboardMockData,
  normalizeDashboardRange,
  type DashboardDataSource,
  type DashboardKpi,
  type DashboardMetric,
  type DashboardRange,
  type DashboardTrendPoint,
  type GeoDashboardApiResponse,
} from "./mock-data";

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

type GetDashboardGeoDataOptions = {
  range?: string | null;
  brandId?: string | null;
};

const RANGE_DAY_COUNT: Record<DashboardRange, number> = {
  "1d": 1,
  "7d": 7,
  "30d": 30,
};

const RANGE_LABEL: Record<DashboardRange, string> = {
  "1d": "最新 1 日",
  "7d": "近 7 日",
  "30d": "近 30 日",
};

function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
}

function formatDateLabel(dateString: string) {
  return dateString.slice(5).replace("-", ".");
}

function formatNumber(value: number, digits = 1) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(digits);
}

function formatDisplayValue(
  value: number | null,
  unit: "percent" | "score",
  fallbackValue: string,
) {
  if (value === null) {
    return fallbackValue;
  }

  if (unit === "percent") {
    return `${formatNumber(value)}%`;
  }

  return formatNumber(value);
}

function average(values: Array<number | null>) {
  const numericValues = values.filter((value): value is number => value !== null);

  if (numericValues.length === 0) {
    return null;
  }

  return numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length;
}

function getLastTwoValues(rows: GeoMetricDailyRow[], key: keyof GeoMetricDailyRow) {
  const values = rows
    .map((row) => row[key])
    .filter((value): value is number => typeof value === "number");

  return {
    current: values.at(-1) ?? null,
    previous: values.length > 1 ? values.at(-2) ?? null : null,
  };
}

function getTrendDirection(delta: number | null): "up" | "down" | "flat" {
  if (delta === null || Math.abs(delta) < 0.05) {
    return "flat";
  }

  return delta > 0 ? "up" : "down";
}

function formatChange(
  delta: number | null,
  unit: "percentPoint" | "score",
  fallbackValue: string,
) {
  if (delta === null || Math.abs(delta) < 0.05) {
    return fallbackValue;
  }

  const prefix = delta > 0 ? "+" : "";
  const suffix = unit === "percentPoint" ? "pp" : " 分";

  return `${prefix}${formatNumber(delta)}${suffix}`;
}

function buildKpi(
  label: string,
  hint: string,
  current: number | null,
  previous: number | null,
  unit: "percent" | "score",
  changeUnit: "percentPoint" | "score",
  fallbackValue: string,
): DashboardKpi {
  const delta = current !== null && previous !== null ? current - previous : null;

  return {
    label,
    value: current ?? 0,
    displayValue: formatDisplayValue(current, unit, fallbackValue),
    change: formatChange(delta, changeUnit, "持平"),
    trend: getTrendDirection(delta),
    hint,
  };
}

function toMetricsFromKpis(kpis: GeoDashboardApiResponse["kpis"]): DashboardMetric[] {
  return [
    {
      label: kpis.roi_index.label,
      value: kpis.roi_index.displayValue,
      change: kpis.roi_index.change,
      direction: kpis.roi_index.trend,
      hint: kpis.roi_index.hint,
    },
    {
      label: kpis.sentiment_score.label,
      value: kpis.sentiment_score.displayValue,
      change: kpis.sentiment_score.change,
      direction: kpis.sentiment_score.trend,
      hint: kpis.sentiment_score.hint,
    },
    {
      label: kpis.visibility.label,
      value: kpis.visibility.displayValue,
      change: kpis.visibility.change,
      direction: kpis.visibility.trend,
      hint: kpis.visibility.hint,
    },
    {
      label: kpis.citation_rate.label,
      value: kpis.citation_rate.displayValue,
      change: kpis.citation_rate.change,
      direction: kpis.citation_rate.trend,
      hint: kpis.citation_rate.hint,
    },
  ];
}

function buildBenchmarkSeries(rows: GeoMetricDailyRow[]) {
  const fallbackPoints = dashboardMockData.trend.points;

  return rows.map((row, index) => {
    const visibility = row.visibility ?? fallbackPoints[index % fallbackPoints.length]?.brand ?? 0;
    const top3Rate = row.top3_rate;
    const derivedBenchmark =
      top3Rate !== null
        ? Math.max(0, Math.min(100, top3Rate * 0.82))
        : Math.max(0, visibility - 0.8);

    return {
      label: formatDateLabel(row.date),
      brand: Number(visibility.toFixed(1)),
      competitorAverage: Number(derivedBenchmark.toFixed(1)),
    } satisfies DashboardTrendPoint;
  });
}

function buildMockResponse({
  brandId,
  range,
  brandName,
}: {
  brandId: string;
  range: DashboardRange;
  brandName?: string | null;
}) {
  const response = buildGeoDashboardResponse({ brandId, range });

  return {
    ...response,
    brand: {
      ...response.brand,
      id: brandId,
      name: brandName?.trim() || response.brand.name,
    },
    meta: {
      ...response.meta,
      brandId,
      range,
      source: "mock" as DashboardDataSource,
    },
  } satisfies GeoDashboardApiResponse;
}

async function resolveBrandContext(
  supabase: SupabaseClient,
  userId: string,
  requestedBrandId?: string | null,
) {
  const brandId = requestedBrandId?.trim() || (await getPrimaryBrandIdForUser(supabase, userId));
  const { data: brandRecord, error: brandError } = await supabase
    .from("brands")
    .select("name")
    .eq("id", brandId)
    .maybeSingle();

  if (brandError) {
    throw brandError;
  }

  return {
    brandId,
    brandName: brandRecord?.name?.trim() || null,
  };
}

async function loadWindowRows(
  supabase: SupabaseClient,
  brandId: string,
  range: DashboardRange,
) {
  const { data: latestRow, error: latestRowError } = await supabase
    .from("geo_metrics_daily")
    .select("date")
    .eq("brand_id", brandId)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestRowError) {
    throw latestRowError;
  }

  if (!latestRow?.date) {
    return null;
  }

  const endDate = latestRow.date;
  const startDate = addDays(endDate, -(RANGE_DAY_COUNT[range] - 1));
  const { data: rows, error: rowsError } = await supabase
    .from("geo_metrics_daily")
    .select(
      "date, visibility, citation_rate, sentiment_score, roi_index, top3_rate, cited_notes_count, cited_accounts_count",
    )
    .eq("brand_id", brandId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (rowsError) {
    throw rowsError;
  }

  if (!rows || rows.length === 0) {
    return null;
  }

  return {
    rows: rows as GeoMetricDailyRow[],
    startDate,
    endDate,
  };
}

export async function getDashboardGeoData(
  supabase: SupabaseClient,
  userId: string,
  options: GetDashboardGeoDataOptions = {},
): Promise<GeoDashboardApiResponse> {
  const range = normalizeDashboardRange(options.range);
  const { brandId, brandName } = await resolveBrandContext(supabase, userId, options.brandId);
  const windowRows = await loadWindowRows(supabase, brandId, range);

  if (!windowRows) {
    return buildMockResponse({ brandId, range, brandName });
  }

  const { rows, startDate, endDate } = windowRows;
  const latestRow = rows.at(-1) ?? null;

  if (!latestRow) {
    return buildMockResponse({ brandId, range, brandName });
  }

  const roi = getLastTwoValues(rows, "roi_index");
  const sentiment = getLastTwoValues(rows, "sentiment_score");
  const visibility = getLastTwoValues(rows, "visibility");
  const citationRate = getLastTwoValues(rows, "citation_rate");
  const trendSeries = buildBenchmarkSeries(rows);
  const latestGap =
    trendSeries.length > 0
      ? trendSeries[trendSeries.length - 1].brand -
        trendSeries[trendSeries.length - 1].competitorAverage
      : 0;
  const firstGap =
    trendSeries.length > 0 ? trendSeries[0].brand - trendSeries[0].competitorAverage : 0;
  const gapDelta = latestGap - firstGap;
  const averageVisibility = average(rows.map((row) => row.visibility));
  const averageCitationRate = average(rows.map((row) => row.citation_rate));
  const latestNotes = latestRow.cited_notes_count ?? 0;
  const latestAccounts = latestRow.cited_accounts_count ?? 0;
  const visibilityChangeDirection = getTrendDirection(
    visibility.current !== null && visibility.previous !== null
      ? visibility.current - visibility.previous
      : null,
  );

  const kpis: GeoDashboardApiResponse["kpis"] = {
    roi_index: buildKpi(
      "ROI 转化指数",
      "沿用导入后的日级指标聚合结果，帮助快速判断内容投放与转化效率的变化。",
      roi.current,
      roi.previous,
      "score",
      "score",
      "0",
    ),
    sentiment_score: buildKpi(
      "情感健康度",
      "按导入数据中的情感分值汇总，适合追踪口碑变化是否稳定。",
      sentiment.current,
      sentiment.previous,
      "score",
      "score",
      "0",
    ),
    visibility: buildKpi(
      "可见度",
      "以导入后的品牌可见度为主读数，当前变化会直接反馈到 Dashboard。",
      visibility.current,
      visibility.previous,
      "percent",
      "percentPoint",
      "0%",
    ),
    citation_rate: buildKpi(
      "引用率",
      "引用率来自当前时间窗口内的真实导入数据，可与可见度联动观察。",
      citationRate.current,
      citationRate.previous,
      "percent",
      "percentPoint",
      "0%",
    ),
  };

  const response: GeoDashboardApiResponse = {
    brand: {
      id: brandId,
      name: brandName ?? "当前品牌",
    },
    time_range: {
      label: RANGE_LABEL[range],
      start: startDate,
      end: endDate,
    },
    greeting: {
      eyebrow: "品牌可见度概览",
      title: `${RANGE_LABEL[range]}可见度 ${kpis.visibility.displayValue}，${kpis.visibility.change === "持平" ? "较上一采样基本持平" : `较上一采样${kpis.visibility.trend === "down" ? "回落" : "提升"} ${kpis.visibility.change.replace("+", "")}`}`,
      description: `当前看板已优先读取导入后的真实数据。${RANGE_LABEL[range]}平均可见度 ${formatDisplayValue(averageVisibility, "percent", "0%")}，平均引用率 ${formatDisplayValue(averageCitationRate, "percent", "0%")}。`,
      focusLabel: "当前导入覆盖",
      focusValue: `${startDate} 至 ${endDate}，共 ${rows.length} 个采样日，引用笔记 ${latestNotes} 条 / 引用账号 ${latestAccounts} 个。`,
    },
    kpis,
    trend: {
      title: "可见度趋势（我方 vs 辅助基线）",
      description:
        visibilityChangeDirection === "down"
          ? "导入数据已生效，近几个采样点出现回落，建议优先复盘最近新增素材与引用质量。"
          : "导入数据已生效，趋势图优先展示真实可见度变化，并保留辅助基线帮助快速阅读波动。",
      readingHint: {
        title: "读数提示",
        leadLabel: "当前领先差值",
        leadValue: `${formatNumber(latestGap)}pp`,
        changeLabel: "窗口内变化",
        changeValue:
          Math.abs(gapDelta) < 0.05
            ? "差距基本持平"
            : `差距${gapDelta > 0 ? "扩大" : "收窄"} ${formatNumber(Math.abs(gapDelta))}pp`,
        summary: `当前窗口内共记录 ${rows.length} 个真实采样点，最近一日可见度 ${kpis.visibility.displayValue}，引用率 ${kpis.citation_rate.displayValue}。`,
      },
    },
    trend_series: trendSeries,
    alerts: [
      sentiment.current !== null && sentiment.current < 70
        ? {
            level: "监测提示",
            title: "情感分值偏低，建议优先检查最近被引用内容",
            description:
              "当前情感健康度已低于 70 分，导入后的真实数据提示品牌内容中可能存在负向表达或风险词累积。",
            action: "建议回看最近导入样本对应的来源内容，优先补充成分说明、适用人群与风险提示。",
          }
        : visibilityChangeDirection === "down"
          ? {
              level: "监测提示",
              title: "可见度出现回落，建议复盘近两次采样差异",
              description:
                "当前窗口内最近一日可见度较上一采样下降，说明高意图问题中的引用与露出可能正在被追赶。",
              action: "建议先比对近两次导入数据中的引用率、Top3 占比与被引内容差异，再决定补强方向。",
            }
          : {
              level: "监测提示",
              title: "导入数据已同步到看板，建议继续观察连续性",
              description:
                "当前主要 KPI 与趋势都来自真实导入数据。若后续持续补数，这里会更稳定地反映可见度与引用率变化。",
              action: "建议保持按日导入节奏，便于后续在同一口径下持续观察趋势波动。",
            },
    ],
    top_questions: dashboardMockData.questions,
    recommendations: dashboardMockData.opportunities,
    meta: {
      brandId,
      range,
      source: "database",
    },
  };

  return response;
}

export function toMetricsForDashboardPage(response: GeoDashboardApiResponse) {
  return toMetricsFromKpis(response.kpis);
}

import {
  dashboardMockData,
  type DashboardTrendPoint,
} from "@/lib/dashboard/mock-data";
import { getSharedGeoProviderData } from "@/lib/geo/shared-provider";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const chartWidth = 100;
const chartHeight = 52;
const chartPadding = 6;

function getTrendTone(direction: "up" | "down" | "flat") {
  if (direction === "up") {
    return "text-[#1F7A45]";
  }

  if (direction === "down") {
    return "text-[#C73B31]";
  }

  return "text-black/55";
}

function buildChartGeometry(points: DashboardTrendPoint[]) {
  const values = points.flatMap((point) => [point.brand, point.competitorAverage]);
  const minValue = Math.min(...values) - 4;
  const maxValue = Math.max(...values) + 4;
  const usableWidth = chartWidth - chartPadding * 2;
  const usableHeight = chartHeight - chartPadding * 2;

  const toCoordinate = (value: number, index: number, key: "brand" | "competitorAverage") => {
    const x =
      chartPadding + (usableWidth * index) / Math.max(points.length - 1, 1);
    const ratio = (value - minValue) / Math.max(maxValue - minValue, 1);
    const y = chartHeight - chartPadding - ratio * usableHeight;

    return { x, y, value, key };
  };

  const brandPoints = points.map((point, index) =>
    toCoordinate(point.brand, index, "brand"),
  );
  const competitorPoints = points.map((point, index) =>
    toCoordinate(point.competitorAverage, index, "competitorAverage"),
  );

  const toPath = (series: { x: number; y: number }[]) =>
    series
      .map((point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
      )
      .join(" ");

  const gridLines = Array.from({ length: 4 }, (_, index) => {
    const ratio = index / 3;
    const y = chartPadding + usableHeight * ratio;

    return y.toFixed(2);
  });

  return {
    brandPoints,
    competitorPoints,
    brandPath: toPath(brandPoints),
    competitorPath: toPath(competitorPoints),
    gridLines,
  };
}

function DashboardTrendChart({
  points,
  secondaryLabel,
}: {
  points: DashboardTrendPoint[];
  secondaryLabel: string;
}) {
  const { brandPath, competitorPath, brandPoints, competitorPoints, gridLines } =
    buildChartGeometry(points);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.16em] text-black/45">
        <span className="flex items-center gap-2">
          <span className="h-px w-6 bg-[#C73B31]" />
          我方
        </span>
        <span className="flex items-center gap-2">
          <span className="h-px w-6 bg-black/30" />
          {secondaryLabel}
        </span>
      </div>

      <div className="rounded-[28px] bg-white p-4 shadow-sm shadow-black/[0.04] sm:p-6">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-52 w-full"
          role="img"
          aria-label="可见度趋势图"
        >
          {gridLines.map((line) => (
            <line
              key={line}
              x1={chartPadding}
              x2={chartWidth - chartPadding}
              y1={line}
              y2={line}
              stroke="rgba(17,17,17,0.08)"
              strokeWidth="0.6"
              strokeDasharray="1.2 2.4"
            />
          ))}

          <path
            d={competitorPath}
            fill="none"
            stroke="rgba(17,17,17,0.35)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={brandPath}
            fill="none"
            stroke="#C73B31"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {competitorPoints.map((point, index) => (
            <circle
              key={`competitor-${points[index]?.label ?? index}`}
              cx={point.x}
              cy={point.y}
              r="1.4"
              fill="rgba(17,17,17,0.35)"
            />
          ))}

          {brandPoints.map((point, index) => (
            <circle
              key={`brand-${points[index]?.label ?? index}`}
              cx={point.x}
              cy={point.y}
              r="1.6"
              fill="#C73B31"
            />
          ))}
        </svg>

        <div
          className="mt-4 grid gap-2 text-[11px] uppercase tracking-[0.14em] text-black/40 sm:text-xs"
          style={{
            gridTemplateColumns: `repeat(${Math.max(points.length, 1)}, minmax(0, 1fr))`,
          }}
        >
          {points.map((point) => (
            <span key={point.label}>{point.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardSourceNotice({
  source,
}: {
  source: "database" | "mock";
}) {
  const copy =
    source === "database"
      ? "数据源：已导入数据"
      : "数据源：示例数据";

  return (
    <p className="text-[11px] uppercase tracking-[0.16em] text-black/42 sm:text-xs">
      {copy}
    </p>
  );
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const sharedResult = await getSharedGeoProviderData({
    supabase,
    range: "7d",
  });
  const { dashboard, source } = sharedResult;
  const greeting = dashboard.greeting;
  const metrics = dashboard.metrics;
  const trend = dashboard.trend;
  const alert = dashboard.alert ?? dashboardMockData.alert;
  const questions =
    dashboard.questions.length > 0 ? dashboard.questions : dashboardMockData.questions;
  const opportunities =
    dashboard.opportunities.length > 0
      ? dashboard.opportunities
      : dashboardMockData.opportunities;
  const secondarySeriesLabel = source === "database" ? "辅助基线" : "竞品均值";

  return (
    <section className="mx-auto max-w-7xl space-y-12">
      <header className="space-y-6 border-b border-black/10 pb-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.22em] text-black/45">
            {greeting.eyebrow}
          </p>
          <h1 className="max-w-4xl text-3xl font-semibold tracking-[-0.03em] text-black sm:text-5xl">
            {greeting.title}
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-black/62 sm:text-base">
            {greeting.description}
          </p>
        </div>

        <div className="flex flex-col gap-3 border-l border-black/10 pl-4 sm:max-w-2xl sm:pl-6">
          <span className="text-xs uppercase tracking-[0.2em] text-black/40">
            {greeting.focusLabel}
          </span>
          <span className="text-sm leading-7 text-black/72 sm:text-base">
            {greeting.focusValue}
          </span>
          <DashboardSourceNotice source={source} />
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-[28px] bg-white p-6 shadow-sm shadow-black/[0.04]"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-black/55">{metric.label}</p>
              <span
                className={`text-sm font-medium ${getTrendTone(metric.direction)}`}
              >
                {metric.change}
              </span>
            </div>
            <p className="mt-8 text-4xl font-semibold tracking-[-0.04em] text-black">
              {metric.value}
            </p>
            <p className="mt-4 text-sm leading-6 text-black/58">{metric.hint}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[32px] bg-[#FFF5F6] px-5 py-5 shadow-sm shadow-[#C73B31]/[0.06] sm:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.22em] text-[#C73B31]">
              {alert.level}
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-black">
              {alert.title}
            </h2>
            <p className="max-w-4xl text-sm leading-7 text-black/68">
              {alert.description}
            </p>
          </div>
          <p className="max-w-md border-l border-[#C73B31]/15 pl-4 text-sm leading-7 text-black/70">
            {alert.action}
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
        <article className="space-y-5 rounded-[32px] bg-white p-6 shadow-sm shadow-black/[0.04] sm:p-8">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-black/42">
              趋势区
            </p>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-black sm:text-3xl">
                  {trend.title}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-black/62">
                  {trend.description}
                </p>
              </div>
            </div>
          </div>

          <DashboardTrendChart
            points={trend.points}
            secondaryLabel={secondarySeriesLabel}
          />
        </article>

        <aside className="rounded-[32px] bg-white p-6 shadow-sm shadow-black/[0.04] sm:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-black/42">
            {trend.readingHint.title}
          </p>
          <div className="mt-6 space-y-6">
            <div>
              <p className="text-sm text-black/50">{trend.readingHint.leadLabel}</p>
              <p className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-black">
                {trend.readingHint.leadValue}
              </p>
            </div>
            <div>
              <p className="text-sm text-black/50">{trend.readingHint.changeLabel}</p>
              <p className="mt-2 text-2xl font-medium text-[#C73B31]">
                {trend.readingHint.changeValue}
              </p>
            </div>
            <p className="border-t border-black/10 pt-6 text-sm leading-7 text-black/66">
              {trend.readingHint.summary}
            </p>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <article className="rounded-[32px] bg-white p-6 shadow-sm shadow-black/[0.04] sm:p-8">
          <div className="flex flex-col gap-3 border-b border-black/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-black/42">
                Top 问答
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-black">
                高价值问答排行
              </h2>
            </div>
            <p className="text-sm text-black/50">按当前可见度与引用率综合排序</p>
          </div>

          <div className="mt-6 hidden md:block">
            <div className="grid grid-cols-[minmax(0,1.8fr)_120px_120px_120px] gap-4 border-b border-black/10 pb-3 text-xs uppercase tracking-[0.18em] text-black/40">
              <span>问题</span>
              <span>可见度</span>
              <span>引用率</span>
              <span>趋势</span>
            </div>

            <div className="divide-y divide-black/10">
              {questions.map((item) => (
                <div
                  key={item.question}
                  className="grid grid-cols-[minmax(0,1.8fr)_120px_120px_120px] gap-4 py-5"
                >
                  <p className="pr-4 text-sm leading-7 text-black/78">{item.question}</p>
                  <p className="text-sm text-black/70">{item.visibility}</p>
                  <p className="text-sm text-black/70">{item.citationRate}</p>
                  <p className={`text-sm font-medium ${getTrendTone(item.trendDirection)}`}>
                    {item.trend}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-4 md:hidden">
            {questions.map((item) => (
              <article
                key={item.question}
                className="rounded-[24px] bg-white p-4 shadow-sm shadow-black/[0.04]"
              >
                <p className="text-sm leading-7 text-black/80">{item.question}</p>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-black/38">
                      可见度
                    </p>
                    <p className="mt-2 text-black/72">{item.visibility}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-black/38">
                      引用率
                    </p>
                    <p className="mt-2 text-black/72">{item.citationRate}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-black/38">
                      趋势
                    </p>
                    <p className={`mt-2 font-medium ${getTrendTone(item.trendDirection)}`}>
                      {item.trend}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </article>

        <aside className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-black/42">
              机会分析师
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-black">
              下一步建议
            </h2>
          </div>

          {opportunities.map((opportunity) => (
            <article
              key={opportunity.title}
              className="rounded-[28px] bg-white p-6 shadow-sm shadow-black/[0.04]"
            >
              <h3 className="text-xl font-semibold tracking-[-0.03em] text-black">
                {opportunity.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-black/66">
                {opportunity.summary}
              </p>
              <p className="mt-6 border-t border-black/10 pt-5 text-sm leading-7 text-black/78">
                {opportunity.recommendation}
              </p>
            </article>
          ))}
        </aside>
      </section>
    </section>
  );
}

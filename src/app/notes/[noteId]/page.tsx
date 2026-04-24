"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

import { noteMockData, type NoteTrendPoint } from "@/lib/notes/mock-data";

const chartWidth = 100;
const chartHeight = 52;
const chartPadding = 6;

function buildChartGeometry(points: NoteTrendPoint[]) {
  const values = points.map((point) => point.visibility);
  const minValue = Math.min(...values) - 2;
  const maxValue = Math.max(...values) + 2;
  const usableWidth = chartWidth - chartPadding * 2;
  const usableHeight = chartHeight - chartPadding * 2;

  const toCoordinate = (value: number, index: number) => {
    const x = chartPadding + (usableWidth * index) / Math.max(points.length - 1, 1);
    const ratio = (value - minValue) / Math.max(maxValue - minValue, 1);
    const y = chartHeight - chartPadding - ratio * usableHeight;
    return { x, y, value };
  };

  const linePoints = points.map((point, index) => toCoordinate(point.visibility, index));

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
    linePoints,
    linePath: toPath(linePoints),
    gridLines,
  };
}

function NoteTrendChart({ points }: { points: NoteTrendPoint[] }) {
  const { linePath, linePoints, gridLines } = buildChartGeometry(points);

  return (
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
          d={linePath}
          fill="none"
          stroke="#C73B31"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {linePoints.map((point, index) => (
          <circle
            key={`point-${points[index]?.label ?? index}`}
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
  );
}

function TrafficSourceChart({
  sources,
}: {
  sources: { name: string; value: number; fill: string }[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-3">
        {sources.map((item) => (
          <div key={item.name} className="inline-flex items-center gap-2 text-sm text-black/65">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
            {item.name}
          </div>
        ))}
      </div>
      <div className="h-[240px] w-full sm:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sources}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
              dataKey="value"
              strokeWidth={0}
            >
              {sources.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3">
        {sources.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-sm text-black/65">{item.name}</span>
            </div>
            <span className="text-sm font-medium text-black">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommentWordCloud({
  keywords,
}: {
  keywords: { word: string; weight: number }[];
}) {
  const maxWeight = Math.max(...keywords.map((k) => k.weight));
  const minWeight = Math.min(...keywords.map((k) => k.weight));

  const getFontSize = (weight: number) => {
    const ratio = (weight - minWeight) / (maxWeight - minWeight);
    return 12 + ratio * 18;
  };

  const getOpacity = (weight: number) => {
    const ratio = (weight - minWeight) / (maxWeight - minWeight);
    return 0.4 + ratio * 0.6;
  };

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-3">
      {keywords.map((keyword) => (
        <span
          key={keyword.word}
          style={{
            fontSize: `${getFontSize(keyword.weight)}px`,
            opacity: getOpacity(keyword.weight),
          }}
          className="font-medium tracking-tight text-black"
        >
          {keyword.word}
        </span>
      ))}
    </div>
  );
}

export default function NoteDetailPage() {
  const { basic, trend, trafficSources, commentKeywords, optimizations } = noteMockData;

  return (
    <section className="space-y-8">
      <header className="space-y-4 border-b border-black/10 pb-6">
        <p className="text-xs uppercase tracking-[0.22em] text-black/45">Notes Analysis</p>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-[#111111] sm:text-4xl">
            {basic.title}
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-black/60 sm:text-base">
            笔记发布于 {basic.publishTime} · 作者：{basic.author}
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[28px] bg-white p-6 shadow-sm shadow-black/[0.04]">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-black/55">点赞数</p>
          </div>
          <p className="mt-8 text-4xl font-semibold tracking-[-0.04em] text-black">
            {basic.likes.toLocaleString()}
          </p>
        </article>
        <article className="rounded-[28px] bg-white p-6 shadow-sm shadow-black/[0.04]">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-black/55">收藏数</p>
          </div>
          <p className="mt-8 text-4xl font-semibold tracking-[-0.04em] text-black">
            {basic.collects.toLocaleString()}
          </p>
        </article>
        <article className="rounded-[28px] bg-white p-6 shadow-sm shadow-black/[0.04]">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-black/55">评论数</p>
          </div>
          <p className="mt-8 text-4xl font-semibold tracking-[-0.04em] text-black">
            {basic.comments.toLocaleString()}
          </p>
        </article>
        <article className="rounded-[28px] bg-white p-6 shadow-sm shadow-black/[0.04]">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm text-black/55">GEO 可见度</p>
          </div>
          <p className="mt-8 text-4xl font-semibold tracking-[-0.04em] text-black">
            {basic.geoVisibility}
          </p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
        <article className="space-y-5 rounded-[32px] bg-white p-6 shadow-sm shadow-black/[0.04] sm:p-8">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-black/42">趋势区</p>
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
          <NoteTrendChart points={trend.points} />
        </article>

        <aside className="rounded-[32px] bg-white p-6 shadow-sm shadow-black/[0.04] sm:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-black/42">GEO 指标</p>
          <div className="mt-6 space-y-6">
            <div>
              <p className="text-sm text-black/50">可见度</p>
              <p className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-black">
                {basic.geoVisibility}
              </p>
            </div>
            <div>
              <p className="text-sm text-black/50">引用率</p>
              <p className="mt-2 text-2xl font-medium text-[#C73B31]">
                {basic.geoCitationRate}
              </p>
            </div>
            <div>
              <p className="text-sm text-black/50">情感分</p>
              <p className="mt-2 text-2xl font-medium text-black">{basic.sentimentScore}</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="rounded-[32px] bg-white p-6 shadow-sm shadow-black/[0.04] sm:p-8">
          <div className="space-y-2 border-b border-black/10 pb-5">
            <p className="text-xs uppercase tracking-[0.22em] text-black/40">流量来源</p>
            <h2 className="text-2xl font-semibold tracking-tight">流量来源占比</h2>
          </div>
          <div className="mt-6">
            <TrafficSourceChart sources={trafficSources} />
          </div>
        </article>

        <article className="rounded-[32px] bg-white p-6 shadow-sm shadow-black/[0.04] sm:p-8">
          <div className="space-y-2 border-b border-black/10 pb-5">
            <p className="text-xs uppercase tracking-[0.22em] text-black/40">评论区</p>
            <h2 className="text-2xl font-semibold tracking-tight">评论关键词词云</h2>
          </div>
          <div className="mt-6">
            <CommentWordCloud keywords={commentKeywords} />
          </div>
        </article>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-black/42">优化建议</p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-black">内容优化机会</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {optimizations.map((item) => (
            <article
              key={item.title}
              className="rounded-[28px] bg-white p-6 shadow-sm shadow-black/[0.04]"
            >
              <h3 className="text-xl font-semibold tracking-[-0.03em] text-black">
                {item.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-black/66">{item.summary}</p>
              <p className="mt-6 border-t border-black/10 pt-5 text-sm leading-7 text-black/78">
                {item.recommendation}
              </p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

import { fetchGeoApiData } from "@/lib/geo/client";
import type { CompetitorsData } from "@/lib/geo/mock-data";

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatScore(value: number) {
  return value.toString();
}

export default function CompetitorsPage() {
  const [data, setData] = useState<CompetitorsData | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    let active = true;

    async function loadCompetitorsData() {
      try {
        setStatus("loading");
        const payload = await fetchGeoApiData({ range: "7d" });

        if (!active) {
          return;
        }

        setData(payload.competitors);
        setStatus("success");
      } catch (error) {
        if (!active) {
          return;
        }

        console.error("Failed to fetch competitors data", error);
        setStatus("error");
      }
    }

    void loadCompetitorsData();

    return () => {
      active = false;
    };
  }, []);

  if (status === "loading" && !data) {
    return (
      <section className="space-y-8">
        <div className="space-y-4 border-b border-black/10 pb-6">
          <div className="h-4 w-32 animate-pulse rounded bg-black/5" />
          <div className="h-10 w-56 animate-pulse rounded bg-black/5" />
          <div className="h-5 w-full max-w-3xl animate-pulse rounded bg-black/5" />
        </div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.95fr)]">
          <div className="bg-white p-8 shadow-sm shadow-black/[0.03]">
            <div className="h-[360px] animate-pulse rounded bg-black/5" />
          </div>
          <div className="bg-white p-8 shadow-sm shadow-black/[0.03]">
            <div className="h-[360px] animate-pulse rounded bg-black/5" />
          </div>
        </div>
      </section>
    );
  }

  if (status === "error" && !data) {
    return (
      <section className="space-y-8">
        <header className="space-y-4 border-b border-black/10 pb-6">
          <p className="text-xs uppercase tracking-[0.22em] text-black/45">
            Competitor Analysis
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#111111] sm:text-4xl">
            竞品分析数据暂不可用
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-black/60 sm:text-base">
            `/api/geo` 未成功返回竞品模块数据，请稍后刷新页面重试。
          </p>
        </header>
      </section>
    );
  }

  if (!data) {
    return null;
  }

  const competitorRows = data.rows;
  const radarPalette = data.radarPalette;
  const radarData = data.radarData;

  return (
    <section className="space-y-8">
      <header className="space-y-4 border-b border-black/10 pb-6">
        <p className="text-xs uppercase tracking-[0.22em] text-black/45">
          {data.eyebrow}
        </p>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-[#111111] sm:text-4xl">
            {data.title}
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-black/60 sm:text-base">
            {data.description}
          </p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.95fr)]">
        <section className="overflow-hidden bg-white p-6 shadow-sm shadow-black/[0.03] sm:p-8">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-black/40">
              我方 vs Top 3 竞品
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              {data.chartTitle}
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-black/55">
              {data.chartDescription}
            </p>
          </div>

          <div className="mt-8">
            <div className="flex flex-wrap gap-3">
              {radarPalette.map((item) => (
                <div
                  key={item.key}
                  className="inline-flex items-center gap-2 text-sm text-black/65"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.stroke }}
                  />
                  {item.key}
                </div>
              ))}
            </div>

            <div className="mt-6 h-[360px] w-full sm:h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="68%">
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: "#1A1A1A", fontSize: 13 }}
                  />
                  {radarPalette.map((item) => (
                    <Radar
                      key={item.key}
                      name={item.key}
                      dataKey={item.key}
                      stroke={item.stroke}
                      fill={item.fill}
                      fillOpacity={item.fillOpacity}
                      strokeWidth={2}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 shadow-sm shadow-black/[0.03] sm:p-8">
          <div className="space-y-2 border-b border-black/10 pb-5">
            <p className="text-xs uppercase tracking-[0.22em] text-black/40">
              {data.tableEyebrow}
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">{data.tableTitle}</h2>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-black/45">
                  <th className="pb-3 pr-4 font-medium">品牌</th>
                  <th className="pb-3 pr-4 font-medium">可见度</th>
                  <th className="pb-3 pr-4 font-medium">引用率</th>
                  <th className="pb-3 pr-4 font-medium">情感</th>
                  <th className="pb-3 pr-4 font-medium">SOV</th>
                  <th className="pb-3 font-medium">ROI</th>
                </tr>
              </thead>
              <tbody>
                {competitorRows.map((row, index) => {
                  const isOurs = index === 0;

                  return (
                    <tr
                      key={row.name}
                      className="border-b border-black/5 last:border-b-0"
                    >
                      <td className="py-4 pr-4">
                        <span
                          className={
                            isOurs
                              ? "font-semibold text-[#111111]"
                              : "text-black/75"
                          }
                        >
                          {row.name}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-black/75">
                        {formatPercent(row.visibility)}
                      </td>
                      <td className="py-4 pr-4 text-black/75">
                        {formatPercent(row.citationRate)}
                      </td>
                      <td className="py-4 pr-4 text-black/75">
                        {formatScore(row.sentiment)}
                      </td>
                      <td className="py-4 pr-4 text-black/75">
                        {formatPercent(row.sov)}
                      </td>
                      <td className="py-4 font-semibold text-[#111111]">
                        {formatScore(row.roi)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="bg-white p-6 shadow-sm shadow-black/[0.03] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-black/40">
              {data.insightEyebrow}
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">{data.insightTitle}</h2>
          </div>

          <p className="max-w-3xl text-base leading-8 text-black/70">
            {data.insightText}
          </p>
        </div>
      </section>
    </section>
  );
}

import { notFound } from "next/navigation";

import { getReportPreviewById } from "@/lib/reports/mock-data";

import { ReportPrintActions } from "./report-print-actions";

function getBarHeight(value: number, ceiling: number) {
  return `${Math.max((value / ceiling) * 100, 12)}%`;
}

export default function ReportPreviewPage({
  params,
  searchParams,
}: {
  params: { reportId: string };
  searchParams?: { print?: string };
}) {
  const report = getReportPreviewById(params.reportId);

  if (!report) {
    notFound();
  }

  const printOnLoad = searchParams?.print === "1";
  const trendCeiling = Math.max(
    ...report.trend.points.flatMap((point) => [point.ours, point.competitorAverage]),
  );

  return (
    <div className="space-y-8">
      <ReportPrintActions reportId={report.id} printOnLoad={printOnLoad} />

      <article className="report-print-page mx-auto max-w-5xl space-y-6 rounded-[40px] bg-white p-6 shadow-sm shadow-black/[0.04] sm:p-10">
        <section className="report-print-avoid-break rounded-[32px] border border-black/10 px-6 py-8 sm:px-10 sm:py-12">
          <div className="max-w-3xl space-y-6">
            <p className="text-xs uppercase tracking-[0.28em] text-black/42">
              {report.cover.eyebrow}
            </p>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-black sm:text-6xl">
                {report.cover.title}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-black/68 sm:text-lg">
                {report.cover.subtitle}
              </p>
            </div>
            <div className="grid gap-4 border-t border-black/10 pt-6 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-black/40">
                  汇报对象
                </p>
                <p className="mt-3 text-base text-black/78">{report.cover.preparedFor}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-black/40">
                  报告周期
                </p>
                <p className="mt-3 text-base text-black/78">{report.period}</p>
                <p className="mt-2 text-sm text-black/58">{report.cover.preparedAt}</p>
              </div>
            </div>
            <p className="border-l border-black/10 pl-4 text-sm leading-8 text-black/72 sm:pl-6 sm:text-base">
              {report.cover.narrative}
            </p>
          </div>
        </section>

        <section className="report-print-avoid-break grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
          <article className="rounded-[32px] border border-black/10 p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-black/42">
              {report.executiveSummary.title}
            </p>
            <p className="mt-5 text-lg leading-9 text-black/76">
              {report.executiveSummary.lede}
            </p>
          </article>

          <aside className="rounded-[32px] bg-[#FAFAFA] p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-black/42">本页结论</p>
            <div className="mt-5 space-y-4">
              {report.executiveSummary.bullets.map((bullet) => (
                <p
                  key={bullet}
                  className="border-b border-black/10 pb-4 text-sm leading-7 text-black/68 last:border-b-0 last:pb-0"
                >
                  {bullet}
                </p>
              ))}
            </div>
          </aside>
        </section>

        <section className="report-print-avoid-break space-y-5">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-black/42">KPI Snapshot</p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-black sm:text-3xl">
              核心 KPI
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {report.kpis.map((item) => (
              <article
                key={item.label}
                className="report-print-avoid-break rounded-[28px] border border-black/10 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm text-black/55">{item.label}</p>
                  <span className="text-sm font-medium text-black/70">{item.delta}</span>
                </div>
                <p className="mt-8 text-4xl font-semibold tracking-[-0.04em] text-black">
                  {item.value}
                </p>
                <p className="mt-4 text-sm leading-7 text-black/62">
                  {item.interpretation}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="report-print-avoid-break grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
          <article className="rounded-[32px] border border-black/10 p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-black/42">
              {report.trend.title}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-black">
              领先仍在，但已进入需要主动防守的阶段
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-black/66 sm:text-base">
              {report.trend.description}
            </p>

            <div className="mt-8 rounded-[28px] bg-[#FAFAFA] p-5 sm:p-6">
              <div className="grid grid-cols-7 gap-3">
                {report.trend.points.map((point) => (
                  <div key={point.label} className="flex flex-col items-center gap-3">
                    <div className="flex h-48 items-end gap-2">
                      <div className="flex h-full items-end">
                        <div
                          className="w-5 rounded-full bg-black"
                          style={{ height: getBarHeight(point.ours, trendCeiling) }}
                        />
                      </div>
                      <div className="flex h-full items-end">
                        <div
                          className="w-5 rounded-full bg-black/20"
                          style={{
                            height: getBarHeight(point.competitorAverage, trendCeiling),
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-black/40">
                        {point.label}
                      </p>
                      <p className="text-xs text-black/72">{point.ours}%</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-4 text-xs uppercase tracking-[0.16em] text-black/45">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-black" />
                  我方
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-black/20" />
                  竞品均值
                </span>
              </div>
            </div>
          </article>

          <aside className="rounded-[32px] bg-[#FAFAFA] p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-black/42">趋势解读</p>
            <p className="mt-5 text-sm leading-8 text-black/70 sm:text-base">
              {report.trend.observation}
            </p>
            <div className="mt-6 space-y-4">
              {report.trend.signals.map((item) => (
                <p
                  key={item}
                  className="border-b border-black/10 pb-4 text-sm leading-7 text-black/66 last:border-b-0 last:pb-0"
                >
                  {item}
                </p>
              ))}
            </div>
          </aside>
        </section>

        <section className="report-print-avoid-break rounded-[32px] border border-black/10 p-6 sm:p-8">
          <div className="space-y-3 border-b border-black/10 pb-5">
            <p className="text-xs uppercase tracking-[0.2em] text-black/42">
              {report.competitorComparison.title}
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-black">
              竞品对比
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-black/62 sm:text-base">
              {report.competitorComparison.description}
            </p>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="report-print-avoid-break min-w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-black/10 text-xs uppercase tracking-[0.16em] text-black/40">
                  <th className="pb-3 pr-4 font-medium">品牌</th>
                  <th className="pb-3 pr-4 font-medium">可见度</th>
                  <th className="pb-3 pr-4 font-medium">引用率</th>
                  <th className="pb-3 pr-4 font-medium">情感</th>
                  <th className="pb-3 pr-4 font-medium">SOV</th>
                  <th className="pb-3 font-medium">结论</th>
                </tr>
              </thead>
              <tbody>
                {report.competitorComparison.rows.map((row, index) => (
                  <tr
                    key={row.brand}
                    className="border-b border-black/10 align-top last:border-b-0"
                  >
                    <td className="py-4 pr-4 text-sm font-medium text-black">
                      {index === 0 ? `${row.brand}（我方）` : row.brand}
                    </td>
                    <td className="py-4 pr-4 text-sm text-black/72">{row.visibility}</td>
                    <td className="py-4 pr-4 text-sm text-black/72">
                      {row.citationRate}
                    </td>
                    <td className="py-4 pr-4 text-sm text-black/72">{row.sentiment}</td>
                    <td className="py-4 pr-4 text-sm text-black/72">
                      {row.shareOfVoice}
                    </td>
                    <td className="py-4 text-sm leading-7 text-black/68">{row.takeaway}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
          <article className="report-print-avoid-break rounded-[32px] border border-black/10 p-6 sm:p-8">
            <div className="space-y-3 border-b border-black/10 pb-5">
              <p className="text-xs uppercase tracking-[0.2em] text-black/42">
                {report.topQuestions.title}
              </p>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-black">
                高价值问答
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-black/62">
                {report.topQuestions.description}
              </p>
            </div>

            <div className="mt-6 space-y-5">
              {report.topQuestions.items.map((item, index) => (
                <article
                  key={item.question}
                  className="report-print-avoid-break rounded-[28px] bg-[#FAFAFA] p-5"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-black/38">
                    Top {index + 1}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-black">
                    {item.question}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-black/66">
                    {item.whyItMatters}
                  </p>
                  <p className="mt-4 border-t border-black/10 pt-4 text-sm leading-7 text-black/72">
                    下一步：{item.nextMove}
                  </p>
                </article>
              ))}
            </div>
          </article>

          <aside className="report-print-avoid-break rounded-[32px] bg-[#FAFAFA] p-6 sm:p-8">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-black/42">
                {report.opportunities.title}
              </p>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-black">
                机会建议
              </h2>
              <p className="text-sm leading-7 text-black/62">
                {report.opportunities.description}
              </p>
            </div>
            <div className="mt-6 space-y-4">
              {report.opportunities.items.map((item) => (
                <article
                  key={item.title}
                  className="report-print-avoid-break rounded-[28px] border border-black/10 bg-white p-5"
                >
                  <h3 className="text-lg font-semibold tracking-tight text-black">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-black/66">{item.opportunity}</p>
                  <p className="mt-4 border-t border-black/10 pt-4 text-sm leading-7 text-black/72">
                    动作：{item.action}
                  </p>
                </article>
              ))}
            </div>
          </aside>
        </section>
      </article>
    </div>
  );
}

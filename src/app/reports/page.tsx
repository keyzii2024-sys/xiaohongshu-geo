import Link from "next/link";

import { reportCenterMockData } from "@/lib/reports/mock-data";

export default function ReportsPage() {
  const selectedType = reportCenterMockData.reportTypes.find(
    (item) => item.id === reportCenterMockData.generatorDefaults.typeId,
  );
  const selectedRange = reportCenterMockData.reportRanges.find(
    (item) => item.id === reportCenterMockData.generatorDefaults.rangeId,
  );

  return (
    <section className="space-y-10">
      <header className="space-y-4 border-b border-black/10 pb-6">
        <p className="text-xs uppercase tracking-[0.22em] text-black/45">
          Report Center
        </p>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-[#111111] sm:text-4xl">
            报告中心
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-black/60 sm:text-base">
            用静态 mock 数据完整演示从生成报告、查看预览到导出 PDF 的闭环。
            当前阶段不会发起真实 API 请求，也不会读取数据库。
          </p>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <article className="rounded-[32px] bg-white p-6 shadow-sm shadow-black/[0.03] sm:p-8">
          <div className="flex flex-col gap-4 border-b border-black/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-black/40">
                生成新报告
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-black">
                选择报告类型与时间范围
              </h2>
            </div>
            <span className="inline-flex items-center rounded-full border border-black/10 px-4 py-2 text-sm text-black/60">
              静态演示模式
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="rounded-[28px] border border-black/10 bg-[#FAFAFA] p-5">
              <span className="text-xs uppercase tracking-[0.18em] text-black/40">
                报告类型
              </span>
              <select
                aria-label="报告类型"
                defaultValue={reportCenterMockData.generatorDefaults.typeId}
                className="mt-4 w-full border-b border-black/10 bg-transparent pb-3 text-lg font-medium text-black outline-none"
              >
                {reportCenterMockData.reportTypes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              <p className="mt-4 text-sm leading-7 text-black/58">
                {selectedType?.description}
              </p>
            </label>

            <label className="rounded-[28px] border border-black/10 bg-[#FAFAFA] p-5">
              <span className="text-xs uppercase tracking-[0.18em] text-black/40">
                时间范围
              </span>
              <select
                aria-label="时间范围"
                defaultValue={reportCenterMockData.generatorDefaults.rangeId}
                className="mt-4 w-full border-b border-black/10 bg-transparent pb-3 text-lg font-medium text-black outline-none"
              >
                {reportCenterMockData.reportRanges.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              <p className="mt-4 text-sm font-medium text-black/72">
                {selectedRange?.dateRange}
              </p>
              <p className="mt-2 text-sm leading-7 text-black/58">
                {selectedRange?.description}
              </p>
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-7 text-black/62">
              默认将生成本周管理层复盘预览，预览页提供打印导出按钮，并自动套用白底黑字的打印样式。
            </p>
            <Link
              href={`/reports/${reportCenterMockData.defaultPreviewReportId}`}
              className="inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-black/85"
            >
              生成报告预览
            </Link>
          </div>
        </article>

        <aside className="space-y-4">
          <article className="rounded-[32px] bg-white p-6 shadow-sm shadow-black/[0.03] sm:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-black/40">
              本次范围
            </p>
            <div className="mt-6 space-y-4 text-sm leading-7 text-black/66">
              <p>1. 报告中心入口、历史列表与预览跳转全部走本地静态数据。</p>
              <p>2. 预览页展示封面、摘要、KPI、趋势、竞品、问答与建议模块。</p>
              <p>3. 导出 PDF 使用浏览器原生打印能力，不引入额外依赖。</p>
            </div>
          </article>

          <article className="rounded-[32px] bg-[#FFF8EA] p-6 shadow-sm shadow-[#D4A643]/[0.05] sm:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-[#9A6A00]">
              演示提示
            </p>
            <p className="mt-4 text-sm leading-7 text-black/68">
              历史报告中的“导出”会直接打开对应预览页并触发打印对话框，方便演示归档与导出的完整路径。
            </p>
          </article>
        </aside>
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-sm shadow-black/[0.03] sm:p-8">
        <div className="flex flex-col gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/40">
              历史报告
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black">
              最近生成的静态报告
            </h2>
          </div>
          <p className="text-sm text-black/50">共 {reportCenterMockData.history.length} 份报告</p>
        </div>

        <div className="mt-6 hidden lg:block">
          <div className="grid grid-cols-[minmax(0,1.7fr)_160px_180px_180px_180px] gap-4 border-b border-black/10 pb-3 text-xs uppercase tracking-[0.18em] text-black/40">
            <span>报告名称</span>
            <span>类型</span>
            <span>生成时间</span>
            <span>汇报对象</span>
            <span>操作</span>
          </div>

          <div className="divide-y divide-black/10">
            {reportCenterMockData.history.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[minmax(0,1.7fr)_160px_180px_180px_180px] gap-4 py-5"
              >
                <div className="pr-6">
                  <p className="text-base font-medium text-black">{item.name}</p>
                  <p className="mt-2 text-sm leading-7 text-black/60">
                    {item.period} / {item.summary}
                  </p>
                </div>
                <p className="text-sm text-black/72">{item.type}</p>
                <p className="text-sm text-black/72">{item.generatedAt}</p>
                <p className="text-sm text-black/72">{item.audience}</p>
                <div className="flex items-start gap-3">
                  <Link
                    href={`/reports/${item.id}`}
                    className="inline-flex items-center rounded-full border border-black/10 px-4 py-2 text-sm text-black/70 transition hover:border-black hover:text-black"
                  >
                    预览
                  </Link>
                  <Link
                    href={`/reports/${item.id}?print=1`}
                    className="inline-flex items-center rounded-full border border-black/10 px-4 py-2 text-sm text-black/70 transition hover:border-black hover:text-black"
                  >
                    导出
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-4 lg:hidden">
          {reportCenterMockData.history.map((item) => (
            <article
              key={item.id}
              className="rounded-[28px] border border-black/10 p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-black px-3 py-1 text-xs uppercase tracking-[0.16em] text-white">
                  {item.type}
                </span>
                <span className="text-xs uppercase tracking-[0.16em] text-black/40">
                  {item.generatedAt}
                </span>
              </div>
              <h3 className="mt-4 text-xl font-semibold tracking-tight text-black">
                {item.name}
              </h3>
              <p className="mt-3 text-sm leading-7 text-black/60">{item.summary}</p>
              <p className="mt-4 text-sm text-black/68">
                {item.period} / {item.audience}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/reports/${item.id}`}
                  className="inline-flex items-center rounded-full border border-black/10 px-4 py-2 text-sm text-black/70"
                >
                  预览
                </Link>
                <Link
                  href={`/reports/${item.id}?print=1`}
                  className="inline-flex items-center rounded-full border border-black/10 px-4 py-2 text-sm text-black/70"
                >
                  导出
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

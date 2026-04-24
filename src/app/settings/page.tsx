import Link from "next/link";

type SettingsModule = {
  title: string;
  href: string;
  summary: string;
  boundary: string;
  statusLabel: string;
  statusTone: string;
  ctaLabel: string;
  isAvailable: boolean;
};

const settingsModules: SettingsModule[] = [
  {
    title: "品牌设置",
    href: "/settings/brand",
    summary: "用于承接品牌基础信息、展示口径与默认归属范围的设置入口。",
    boundary: "当前可编辑品牌名称、域名、关键词与 Logo 信息，数据实时写入 Supabase `brands` 表。",
    statusLabel: "当前可访问",
    statusTone: "border-[#CFE8D6] bg-[#F3FBF5] text-[#166534]",
    ctaLabel: "进入模块",
    isAvailable: true,
  },
  {
    title: "竞品管理",
    href: "/settings/competitors",
    summary: "用于维护监测名单、对标品牌范围与竞品分组关系。",
    boundary: "当前阶段可实现竞品的增删改查、信息维护与管理。",
    statusLabel: "当前可访问",
    statusTone: "border-[#CFE8D6] bg-[#F3FBF5] text-[#166534]",
    ctaLabel: "进入模块",
    isAvailable: true,
  },
  {
    title: "账号矩阵管理",
    href: "/settings/accounts",
    summary: "用于梳理品牌自有账号、引用账号与后续矩阵归属规则。",
    boundary: "当前已可访问账号矩阵管理页，支持账号的新增、编辑、删除与分组调整。",
    statusLabel: "当前可访问",
    statusTone: "border-[#CFE8D6] bg-[#F3FBF5] text-[#166534]",
    ctaLabel: "进入模块",
    isAvailable: true,
  },
  {
    title: "数据导入",
    href: "/settings/import",
    summary: "用于上传 CSV、完成本地校验，并将合法指标写入 `geo_metrics_daily`。",
    boundary: "当前已可访问导入子页；导入历史、批次审计与回滚能力暂未提供。",
    statusLabel: "当前可访问",
    statusTone: "border-[#CFE8D6] bg-[#F3FBF5] text-[#166534]",
    ctaLabel: "进入模块",
    isAvailable: true,
  },
];

export default function SettingsHomePage() {
  const availableCount = settingsModules.filter((item) => item.isAvailable).length;

  return (
    <section className="space-y-10">
      <header className="space-y-5 border-b border-black/10 pb-7">
        <p className="text-xs uppercase tracking-[0.22em] text-black/45">Settings Home</p>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_260px] lg:items-end">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-[#111111] sm:text-4xl">
              设置
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-black/60 sm:text-base">
              这里集中整理品牌设置、竞品管理、账号矩阵管理与数据导入 4 个模块的入口与边界。
              当前仅开放已落地能力，不在主页展开任何子页表单。
            </p>
          </div>

          <div className="rounded-[28px] border border-black/10 bg-white px-6 py-5">
            <p className="text-xs uppercase tracking-[0.18em] text-black/40">Current Scope</p>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-black">
              {availableCount} / {settingsModules.length}
            </p>
            <p className="mt-3 text-sm leading-7 text-black/58">
              已开放 {availableCount} 个模块入口，其余模块先以信息架构占位，避免误导评审为完整可编辑后台。
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <div className="grid gap-5 md:grid-cols-2">
          {settingsModules.map((module) => {
            const cardClasses = module.isAvailable
              ? "border-black/10 bg-white shadow-sm shadow-black/[0.03]"
              : "border-black/8 bg-white";

            return (
              <article
                key={module.title}
                className={`rounded-[30px] border p-6 sm:p-7 ${cardClasses}`}
              >
                <div className="flex min-h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <h2 className="text-2xl font-semibold tracking-tight text-black">
                        {module.title}
                      </h2>
                      <p className="text-sm leading-7 text-black/62">{module.summary}</p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] ${module.statusTone}`}
                    >
                      {module.statusLabel}
                    </span>
                  </div>

                  <div className="mt-6 rounded-[24px] bg-[#F7F7F5] px-5 py-4 text-sm leading-7 text-black/65">
                    {module.boundary}
                  </div>

                  <div className="mt-6 pt-1">
                    {module.isAvailable ? (
                      <Link
                        href={module.href}
                        className="inline-flex items-center border border-black px-4 py-3 text-sm text-black transition hover:bg-black hover:text-white"
                      >
                        {module.ctaLabel}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center border border-black/10 px-4 py-3 text-sm text-black/40">
                        {module.ctaLabel}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="space-y-5">
          <article className="rounded-[30px] bg-white p-6 shadow-sm shadow-black/[0.03] sm:p-7">
            <div className="space-y-2 border-b border-black/10 pb-5">
              <p className="text-xs uppercase tracking-[0.2em] text-black/40">Information Architecture</p>
              <h2 className="text-2xl font-semibold tracking-tight text-black">结构说明</h2>
            </div>

            <div className="mt-6 space-y-4 text-sm leading-7 text-black/65">
              <p>1. `/settings` 只承担总览与分发，不直接承接品牌、竞品或账号的表单编辑。</p>
              <p>2. 数据导入已纳入设置体系，作为 4 个并列模块之一，不再表现为孤立页面。</p>
              <p>3. 后续子页会沿用当前入口顺序逐步补齐，保持导航与 PRD 口径一致。</p>
            </div>
          </article>

          <article className="rounded-[30px] border border-black/10 bg-[#FCFCFB] p-6 sm:p-7">
            <div className="space-y-2 border-b border-black/10 pb-5">
              <p className="text-xs uppercase tracking-[0.2em] text-black/40">Current Access</p>
              <h2 className="text-2xl font-semibold tracking-tight text-black">当前可进入</h2>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] border border-[#CFE8D6] bg-[#F3FBF5] px-5 py-4 text-sm leading-7 text-[#166534]">
                `数据导入` 子页已可用，适合继续查看模板下载、本地解析与真实导入回执流程。
              </div>
              <Link
                href="/settings/import"
                className="inline-flex items-center border border-black px-4 py-3 text-sm text-black transition hover:bg-black hover:text-white"
              >
                前往数据导入
              </Link>
            </div>
          </article>
        </aside>
      </section>
    </section>
  );
}

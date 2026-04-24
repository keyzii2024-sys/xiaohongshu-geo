import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 text-[#111111]">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <p className="text-xs uppercase tracking-[0.24em] text-black/45">
          小红薯 GEO
        </p>

        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight">
            项目主入口已切换到登录与仪表盘
          </h1>
          <p className="max-w-2xl text-base leading-7 text-black/60">
            当前首页仅保留最小占位说明。请从登录页进入系统，登录成功后会进入受保护的
            Dashboard，并在首次访问时自动初始化默认品牌。
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex h-11 items-center border border-black bg-black px-5 text-sm font-medium text-white transition hover:bg-white hover:text-black"
          >
            前往登录
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center border border-black/10 px-5 text-sm font-medium text-black transition hover:border-black"
          >
            访问 Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

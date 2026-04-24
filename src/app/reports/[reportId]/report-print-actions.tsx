"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

function isSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return ua.includes("Safari") && !ua.includes("Chrome") && !ua.includes("Chromium");
}

export function ReportPrintActions({
  reportId,
  printOnLoad = false,
}: {
  reportId: string;
  printOnLoad?: boolean;
}) {
  const hasTriggeredPrintRef = useRef(false);
  const [isSafariBrowser, setIsSafariBrowser] = useState(false);

  useEffect(() => {
    setIsSafariBrowser(isSafari());
  }, []);

  useEffect(() => {
    if (!printOnLoad || hasTriggeredPrintRef.current) {
      return;
    }

    hasTriggeredPrintRef.current = true;
    window.print();
  }, [printOnLoad]);

  return (
    <div className="space-y-3">
      {isSafariBrowser && (
        <div className="rounded-[12px] bg-[#FFF7ED] px-4 py-3 text-[13px] text-[#9A3412]">
          <strong>温馨提示：</strong>检测到您正在使用 Safari 浏览器。Safari
          的打印样式可能与其他浏览器不同，建议使用 Chrome
          浏览器以获得最佳的 PDF 导出效果。
        </div>
      )}

      <div className="report-print-hide flex flex-col gap-3 border-b border-black/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-black/42">报告预览</p>
          <p className="text-sm text-black/60">
            当前页面为静态预览，导出使用浏览器原生打印能力。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/reports"
            className="inline-flex items-center rounded-full border border-black/10 px-4 py-2 text-sm text-black/70 transition hover:border-black hover:text-black"
          >
            返回报告中心
          </Link>
          <Link
            href={`/reports/${reportId}`}
            className="inline-flex items-center rounded-full border border-black/10 px-4 py-2 text-sm text-black/70 transition hover:border-black hover:text-black"
          >
            纯预览模式
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-black/85"
          >
            导出 PDF
          </button>
        </div>
      </div>
    </div>
  );
}

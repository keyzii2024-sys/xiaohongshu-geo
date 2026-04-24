"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navigationItems = [
  { label: "仪表盘", href: "/dashboard" },
  { label: "竞品分析", href: "/competitors" },
  { label: "笔记分析", href: "/notes/demo-note-001" },
  { label: "报告中心", href: "" },
  { label: "数据导入", href: "/settings/import" },
  { label: "设置", href: "/settings" },
];

function isItemActive(href: string, currentPath: string) {
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function ProtectedAppNavigation() {
  const pathname = usePathname();

  return (
    <>
      {navigationItems.map((item) => {
        if (!item.href) {
          return (
            <span
              key={item.label}
              className="inline-flex items-center border border-black/10 px-4 py-3 text-sm text-black/45"
            >
              {item.label}
            </span>
          );
        }

        const active = isItemActive(item.href, pathname);

        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "inline-flex items-center border px-4 py-3 text-sm transition",
              active
                ? "border-black bg-black text-white"
                : "border-black/10 text-black/60 hover:border-black hover:text-black",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

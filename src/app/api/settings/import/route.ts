import { NextResponse } from "next/server";

import {
  ensureDefaultBrandForUser,
  getPrimaryBrandIdForUser,
} from "@/lib/auth/brands";
import type { ParsedGeoMetricRow } from "@/lib/geo/csv-import";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ImportRequestBody = {
  rows?: unknown;
  totalRows?: unknown;
  skippedCount?: unknown;
};

type GeoMetricImportRow = Omit<ParsedGeoMetricRow, "rowNumber">;

function isOptionalNumber(value: unknown) {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function isGeoMetricImportRow(value: unknown): value is GeoMetricImportRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Record<string, unknown>;

  return (
    typeof row.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(row.date) &&
    typeof row.visibility === "number" &&
    Number.isFinite(row.visibility) &&
    typeof row.citation_rate === "number" &&
    Number.isFinite(row.citation_rate) &&
    isOptionalNumber(row.sentiment_score) &&
    isOptionalNumber(row.roi_index) &&
    isOptionalNumber(row.top3_rate) &&
    isOptionalNumber(row.cited_notes_count) &&
    isOptionalNumber(row.cited_accounts_count)
  );
}

function normalizeCount(value: unknown, fallbackValue: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : fallbackValue;
}

function deduplicateRowsByDate(rows: GeoMetricImportRow[]) {
  const rowMap = new Map<string, GeoMetricImportRow>();

  rows.forEach((row) => {
    rowMap.set(row.date, row);
  });

  return {
    rows: Array.from(rowMap.values()),
    deduplicatedCount: rows.length - rowMap.size,
  };
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          message: "请先登录后再导入 CSV 数据。",
        },
        { status: 401 },
      );
    }

    const body = (await request.json()) as ImportRequestBody;
    const rows = Array.isArray(body.rows) ? body.rows : null;

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        {
          message: "没有可导入的有效数据，请先完成 CSV 解析。",
        },
        { status: 400 },
      );
    }

    if (!rows.every(isGeoMetricImportRow)) {
      return NextResponse.json(
        {
          message: "导入数据格式无效，请重新解析 CSV 后重试。",
        },
        { status: 400 },
      );
    }

    await ensureDefaultBrandForUser(supabase, user);
    const brandId = await getPrimaryBrandIdForUser(supabase, user.id);
    const skippedCount = normalizeCount(body.skippedCount, 0);
    const totalRows = normalizeCount(body.totalRows, rows.length + skippedCount);
    const deduplicatedRows = deduplicateRowsByDate(rows);
    const existingDatesResult =
      deduplicatedRows.rows.length > 0
        ? await supabase
            .from("geo_metrics_daily")
            .select("date")
            .eq("brand_id", brandId)
            .in(
              "date",
              deduplicatedRows.rows.map((row) => row.date),
            )
        : { data: [], error: null };

    if (existingDatesResult.error) {
      console.error(
        "Failed to load existing geo_metrics_daily rows before import",
        existingDatesResult.error,
      );

      return NextResponse.json(
        {
          message: "暂时无法读取已有 GEO 数据，请稍后重试。",
        },
        { status: 500 },
      );
    }

    const overwrittenCount = new Set(
      (existingDatesResult.data ?? []).map((item) => item.date),
    ).size;
    const importedAt = new Date().toISOString();
    const upsertRows = deduplicatedRows.rows.map((row) => ({
      brand_id: brandId,
      ...row,
    }));

    const { error: upsertError } = await supabase
      .from("geo_metrics_daily")
      .upsert(upsertRows, {
        onConflict: "brand_id,date",
      });

    if (upsertError) {
      console.error("Failed to upsert geo_metrics_daily rows", upsertError);

      return NextResponse.json(
        {
          message: "Supabase 写入失败，请稍后重试。",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message:
        skippedCount > 0 || deduplicatedRows.deduplicatedCount > 0
          ? `导入完成：已写入 ${upsertRows.length} 条，跳过 ${skippedCount} 条，合并同批次重复日期 ${deduplicatedRows.deduplicatedCount} 条。`
          : `导入完成：已成功写入 ${upsertRows.length} 条 GEO 指标数据。`,
      receipt: {
        brandId,
        totalRows,
        importedCount: upsertRows.length,
        skippedCount,
        overwrittenCount,
        insertedCount: upsertRows.length - overwrittenCount,
        deduplicatedCount: deduplicatedRows.deduplicatedCount,
        importedAt,
      },
    });
  } catch (error) {
    console.error("Failed to import geo metrics CSV", error);

    return NextResponse.json(
      {
        message: "导入过程中出现异常，请检查 CSV 内容后重试。",
      },
      { status: 500 },
    );
  }
}

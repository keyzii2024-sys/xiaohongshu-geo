"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import {
  buildTemplateCsv,
  fieldDefinitions,
  importNotes,
  parseCsvImport,
  previewFieldKeys,
  sampleHeaders,
  supportedDateExamples,
  templateFileName,
} from "@/lib/geo/csv-import";
import type { ParseResult } from "@/lib/geo/csv-import";

type ImportReceipt = {
  brandId: string;
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  overwrittenCount: number;
  insertedCount: number;
  deduplicatedCount: number;
  importedAt: string;
  message: string;
};

type ImportStep = {
  index: string;
  title: string;
  description: string;
};

type FileFeedback = {
  name: string;
  size: string;
  type: string;
  isCsv: boolean;
};

const importSteps: ImportStep[] = [
  {
    index: "第 1 步",
    title: "下载模板",
    description: "浏览器本地生成并下载真实 CSV 模板，包含标准表头与示例数据。",
  },
  {
    index: "第 2 步",
    title: "填写数据",
    description: "按 `geo_metrics_daily` 字段边界整理 CSV，保留必填列并使用支持的日期格式。",
  },
  {
    index: "第 3 步",
    title: "上传文件",
    description: "浏览器本地解析 CSV，执行 trim 容错、日期标准化、错误摘要并生成导入确认摘要。",
  },
];

function downloadCsvTemplate() {
  const templateContent = `\uFEFF${buildTemplateCsv()}`;
  const blob = new Blob([templateContent], { type: "text/csv;charset=utf-8;" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = templateFileName;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}

function formatFileSize(file: File) {
  if (file.size < 1024) {
    return `${file.size} B`;
  }

  if (file.size < 1024 * 1024) {
    return `${(file.size / 1024).toFixed(1)} KB`;
  }

  return `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
}

function isCsvFile(file: File) {
  const normalizedName = file.name.toLowerCase();
  const normalizedType = file.type.toLowerCase();

  return normalizedName.endsWith(".csv") || normalizedType.includes("csv");
}

function getFileFeedback(file: File): FileFeedback {
  return {
    name: file.name,
    size: formatFileSize(file),
    type: file.type || "未识别类型",
    isCsv: isCsvFile(file),
  };
}

export default function SettingsImportPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmEntryOpen, setIsConfirmEntryOpen] = useState(false);
  const [templateHint, setTemplateHint] = useState(
    "模板包含标准表头与 2 行示例数据；示例行仅供参考，正式导入前可直接覆盖或删除。",
  );
  const [fileFeedback, setFileFeedback] = useState<FileFeedback | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [readError, setReadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [importReceipt, setImportReceipt] = useState<ImportReceipt | null>(null);

  const canEnterConfirmation =
    Boolean(fileFeedback?.isCsv) &&
    !isParsing &&
    !readError &&
    Boolean(parseResult) &&
    !parseResult?.blockingMessage &&
    (parseResult?.missingFields.length ?? 0) === 0 &&
    (parseResult?.successCount ?? 0) > 0;

  const confirmationDateRange = useMemo(() => {
    if (!parseResult || parseResult.validRows.length === 0) {
      return null;
    }

    const dates = parseResult.validRows
      .map((row) => row.date)
      .sort((left, right) => left.localeCompare(right));

    return {
      start: dates[0],
      end: dates[dates.length - 1],
    };
  }, [parseResult]);

  const statusMessage = useMemo(() => {
    if (isSubmitting) {
      return "正在将合法数据写入 Supabase `geo_metrics_daily`，请勿重复提交。";
    }

    if (submitError) {
      return submitError;
    }

    if (importReceipt) {
      return importReceipt.message;
    }

    if (!fileFeedback) {
      return "当前支持模板下载、CSV 解析、trim 容错、日期标准化与真实 Supabase 导入。";
    }

    if (!fileFeedback.isCsv) {
      return "仅支持 CSV 文件，当前文件不会被解析。请重新选择 `.csv` 文件。";
    }

    if (isParsing) {
      return "正在浏览器本地读取并解析 CSV，准备生成错误摘要与导入摘要。";
    }

    if (readError) {
      return readError;
    }

    if (parseResult?.blockingMessage) {
      return parseResult.blockingMessage;
    }

    if ((parseResult?.missingFields.length ?? 0) > 0) {
      return `缺少必填字段：${parseResult?.missingFields.join("、")}，当前不会进入可导入状态。`;
    }

    if (!parseResult) {
      return "CSV 文件已就绪，等待开始本地解析。";
    }

    if (parseResult.successCount === 0) {
      return `当前没有可导入数据，已跳过 ${parseResult.skippedCount} 条。请先修复错误后重试。`;
    }

    if (parseResult.skippedCount > 0) {
      return `解析完成：可导入 ${parseResult.successCount} 条，跳过 ${parseResult.skippedCount} 条。你可以直接导入合法数据。`;
    }

    return `解析完成：可导入 ${parseResult.successCount} 条，可以直接写入数据库。`;
  }, [fileFeedback, importReceipt, isParsing, isSubmitting, parseResult, readError, submitError]);

  const statusTone = useMemo(() => {
    if (!fileFeedback || isParsing || isSubmitting) {
      return "border-black/10 bg-[#F7F7F5] text-black/62";
    }

    if (submitError || !fileFeedback.isCsv || readError || parseResult?.blockingMessage) {
      return "border-[#F3D5BE] bg-[#FFF7F0] text-[#9A3412]";
    }

    if (importReceipt) {
      return "border-[#CFE8D6] bg-[#F3FBF5] text-[#166534]";
    }

    if ((parseResult?.missingFields.length ?? 0) > 0 || (parseResult?.skippedCount ?? 0) > 0) {
      return "border-[#F3E2B6] bg-[#FFF9ED] text-[#92400E]";
    }

    return "border-[#CFE8D6] bg-[#F3FBF5] text-[#166534]";
  }, [fileFeedback, importReceipt, isParsing, isSubmitting, parseResult, readError, submitError]);

  function handleTemplateDownload() {
    downloadCsvTemplate();
    setTemplateHint(
      `已开始下载 ${templateFileName}。文件由浏览器本地生成，包含标准表头与 2 行示例数据。`,
    );
  }

  async function handleFile(file: File | null) {
    if (!file) {
      return;
    }

    const nextFeedback = getFileFeedback(file);
    setFileFeedback(nextFeedback);
    setReadError(null);
    setSubmitError(null);
    setImportReceipt(null);
    setParseResult(null);
    setIsConfirmEntryOpen(false);

    if (!nextFeedback.isCsv) {
      return;
    }

    setIsParsing(true);

    try {
      const text = await file.text();
      setParseResult(parseCsvImport(text));
    } catch {
      setReadError("文件读取失败，请确认文件可访问后重新选择。");
    } finally {
      setIsParsing(false);
    }
  }

  async function handleImport() {
    if (!parseResult || !canEnterConfirmation || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setImportReceipt(null);

    try {
      const response = await fetch("/api/settings/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rows: parseResult.validRows.map((row) => ({
            date: row.date,
            visibility: row.visibility,
            citation_rate: row.citation_rate,
            sentiment_score: row.sentiment_score,
            roi_index: row.roi_index,
            top3_rate: row.top3_rate,
            cited_notes_count: row.cited_notes_count,
            cited_accounts_count: row.cited_accounts_count,
          })),
          totalRows: parseResult.totalRows,
          skippedCount: parseResult.skippedCount,
        }),
      });

      const result = (await response.json().catch(() => null)) as
        | {
            message?: string;
            receipt?: Omit<ImportReceipt, "message">;
          }
        | null;

      if (!response.ok || !result?.receipt) {
        throw new Error(result?.message ?? "导入失败，请稍后重试。");
      }

      setImportReceipt({
        ...result.receipt,
        message: result.message ?? "导入成功。",
      });
      setIsConfirmEntryOpen(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "导入失败，请稍后重试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    void handleFile(nextFile);
    event.target.value = "";
  }

  function onDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragActive(true);
  }

  function onDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragActive(false);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragActive(false);
    const nextFile = event.dataTransfer.files?.[0] ?? null;
    void handleFile(nextFile);
  }

  return (
    <section className="space-y-8">
      <header className="space-y-4 border-b border-black/10 pb-6">
        <p className="text-xs uppercase tracking-[0.22em] text-black/45">
          Settings / Import
        </p>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-[#111111] sm:text-4xl">
            CSV 数据导入
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-black/60 sm:text-base">
            上传 CSV 文件用于 GEO 指标导入。页面会先在浏览器侧完成模板对齐、trim 容错、
            日期标准化与错误摘要，再将合法数据真实 upsert 到 `geo_metrics_daily` 并返回回执。
          </p>
        </div>
        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-3xl text-sm leading-7 text-black/55">
            数据导入现已归入设置体系，与品牌设置、竞品管理、账号矩阵管理并列；当前阶段仅这一子模块开放访问。
          </p>
          <Link
            href="/settings"
            className="inline-flex w-fit items-center border border-black/10 px-4 py-3 text-sm text-black/65 transition hover:border-black hover:text-black"
          >
            返回设置总览
          </Link>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        {importSteps.map((step) => (
          <article
            key={step.title}
            className="rounded-[28px] border border-black/8 bg-white px-6 py-6 shadow-sm shadow-black/[0.03]"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-black/40">
              {step.index}
            </p>
            <h2 className="mt-4 text-xl font-semibold tracking-tight text-black">
              {step.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-black/62">{step.description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-6">
          <article className="rounded-[32px] bg-white p-6 shadow-sm shadow-black/[0.04] sm:p-8">
            <div className="flex flex-col gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.22em] text-black/40">
                  Step 1
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">下载模板</h2>
              </div>
              <button
                type="button"
                onClick={handleTemplateDownload}
                className="inline-flex w-fit items-center justify-center border border-black px-4 py-3 text-sm text-black transition hover:bg-black hover:text-white"
              >
                下载 CSV 模板
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <p className="text-sm leading-7 text-black/62">
                模板会在浏览器本地即时生成并下载，字段顺序与当前校验、标准化和后续
                `geo_metrics_daily` 映射保持一致。文件中附带 2 行示例数据，仅用于帮助理解格式。
              </p>
              <div className="rounded-[24px] border border-black/8 bg-[#F7F7F5] px-5 py-4 text-sm leading-7 text-black/65">
                {templateHint}
              </div>
            </div>
          </article>

          <article className="rounded-[32px] bg-white p-6 shadow-sm shadow-black/[0.04] sm:p-8">
            <div className="space-y-2 border-b border-black/10 pb-5">
              <p className="text-xs uppercase tracking-[0.22em] text-black/40">
                Step 2
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">填写数据</h2>
            </div>

            <div className="mt-6 space-y-5">
              <p className="text-sm leading-7 text-black/62">
                当前字段边界已对齐 `geo_metrics_daily` 导入列，缺少必填字段时不会进入确认导入；
                合法日期会统一标准化为 `YYYY-MM-DD`。
              </p>

              <div className="rounded-[24px] border border-black/8 px-5 py-5">
                <p className="text-sm font-medium text-black">样例表头</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {sampleHeaders.map((header) => (
                    <span
                      key={header}
                      className="inline-flex items-center rounded-full border border-black/10 px-3 py-1 text-xs text-black/62"
                    >
                      {header}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] bg-[#F7F7F5] px-5 py-4 text-sm leading-7 text-black/65">
                  必填字段：`date`、`visibility`、`citation_rate`。
                </div>
                <div className="rounded-[24px] bg-[#F7F7F5] px-5 py-4 text-sm leading-7 text-black/65">
                  支持日期：{supportedDateExamples.join(" / ")}。
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[24px] border border-black/8 px-5 py-4 text-sm leading-7 text-black/65">
                  目标表：`geo_metrics_daily`
                </div>
                <div className="rounded-[24px] border border-black/8 px-5 py-4 text-sm leading-7 text-black/65">
                  冲突键：`brand_id + date`
                </div>
                <div className="rounded-[24px] border border-black/8 px-5 py-4 text-sm leading-7 text-black/65">
                  品牌归属：确认导入时绑定当前登录品牌
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-[32px] bg-white p-6 shadow-sm shadow-black/[0.04] sm:p-8">
            <div className="space-y-2 border-b border-black/10 pb-5">
              <p className="text-xs uppercase tracking-[0.22em] text-black/40">
                Step 3
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">上传文件</h2>
            </div>

            <div className="mt-6 space-y-5">
              <label
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`block cursor-pointer rounded-[28px] border border-dashed px-6 py-10 text-center transition ${
                  isDragActive
                    ? "border-black bg-black/[0.02]"
                    : "border-black/15 bg-[#FCFCFB] hover:border-black/40"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="sr-only"
                  onChange={onFileChange}
                />
                <div className="mx-auto max-w-xl space-y-4">
                  <p className="text-lg font-semibold tracking-tight text-black">
                    拖拽 CSV 到这里，或点击选择文件
                  </p>
                  <p className="text-sm leading-7 text-black/58">
                    支持 `.csv` 格式，解析与校验全在浏览器本地完成；确认后只提交合法数据行。
                  </p>
                  <div className="inline-flex items-center border border-black px-4 py-3 text-sm text-black">
                    选择 CSV 文件
                  </div>
                </div>
              </label>

              <div className={`rounded-[24px] border px-5 py-4 text-sm leading-7 ${statusTone}`}>
                {statusMessage}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={!canEnterConfirmation || isSubmitting}
                  className={`inline-flex w-fit items-center justify-center border px-4 py-3 text-sm transition ${
                    canEnterConfirmation && !isSubmitting
                      ? "border-black text-black hover:bg-black hover:text-white"
                      : "cursor-not-allowed border-black/10 bg-[#F7F7F5] text-black/35"
                  }`}
                >
                  {isSubmitting ? "导入中..." : "导入到数据库"}
                </button>
                <p className="text-sm leading-7 text-black/52">
                  将按当前登录品牌写入 `geo_metrics_daily`，冲突键为 `brand_id + date`。
                </p>
              </div>

              {fileFeedback ? (
                <div className="rounded-[24px] border border-black/8 px-5 py-5">
                  <p className="text-sm font-medium text-black">本地文件反馈</p>
                  <dl className="mt-4 grid gap-3 text-sm text-black/65 sm:grid-cols-3">
                    <div>
                      <dt className="text-black/45">文件名</dt>
                      <dd className="mt-1 break-all font-medium text-black">
                        {fileFeedback.name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-black/45">文件大小</dt>
                      <dd className="mt-1 font-medium text-black">{fileFeedback.size}</dd>
                    </div>
                    <div>
                      <dt className="text-black/45">文件类型</dt>
                      <dd className="mt-1 break-all font-medium text-black">
                        {fileFeedback.type}
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : null}

              {parseResult ? (
                <div className="space-y-5">
                  {importReceipt ? (
                    <article className="rounded-[24px] border border-[#CFE8D6] bg-[#F3FBF5] px-5 py-5">
                      <div className="flex flex-col gap-4 border-b border-[#CFE8D6] pb-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-[#166534]">导入回执</p>
                          <p className="mt-2 text-sm leading-7 text-[#166534]/80">
                            {importReceipt.message}
                          </p>
                        </div>
                        <div className="rounded-full border border-[#CFE8D6] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#166534]/70">
                          Import Receipt
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-[20px] bg-white px-4 py-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#166534]/65">
                            已写入
                          </p>
                          <p className="mt-2 text-2xl font-semibold text-[#166534]">
                            {importReceipt.importedCount}
                          </p>
                        </div>
                        <div className="rounded-[20px] bg-white px-4 py-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#166534]/65">
                            覆盖更新
                          </p>
                          <p className="mt-2 text-2xl font-semibold text-[#166534]">
                            {importReceipt.overwrittenCount}
                          </p>
                        </div>
                        <div className="rounded-[20px] bg-white px-4 py-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#166534]/65">
                            新增
                          </p>
                          <p className="mt-2 text-2xl font-semibold text-[#166534]">
                            {importReceipt.insertedCount}
                          </p>
                        </div>
                        <div className="rounded-[20px] bg-white px-4 py-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#166534]/65">
                            已跳过
                          </p>
                          <p className="mt-2 text-2xl font-semibold text-[#166534]">
                            {importReceipt.skippedCount}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 rounded-[20px] bg-white px-4 py-4 text-sm leading-7 text-[#166534]/80">
                        品牌 ID：{importReceipt.brandId}
                        <br />
                        导入时间：{new Date(importReceipt.importedAt).toLocaleString("zh-CN")}
                        {importReceipt.deduplicatedCount > 0 ? (
                          <>
                            <br />
                            同批次重复日期已合并：{importReceipt.deduplicatedCount} 条。
                          </>
                        ) : null}
                      </div>
                    </article>
                  ) : null}

                  <article className="rounded-[24px] border border-black/8 px-5 py-5">
                    <div className="flex flex-col gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-black">解析摘要</p>
                        <p className="mt-2 text-sm leading-7 text-black/58">
                          当前已完成本地解析、trim 容错、日期标准化与错误聚合；合法数据可直接提交并写入数据库。
                        </p>
                      </div>
                      <div className="rounded-full border border-black/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-black/45">
                        {canEnterConfirmation ? "可确认导入" : "先修复 CSV"}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[20px] bg-[#F7F7F5] px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-black/40">
                          总数据行
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-black">
                          {parseResult.totalRows}
                        </p>
                      </div>
                      <div className="rounded-[20px] bg-[#F3FBF5] px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#166534]/75">
                          可导入
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-[#166534]">
                          {parseResult.successCount}
                        </p>
                      </div>
                      <div className="rounded-[20px] bg-[#FFF7F0] px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#9A3412]/75">
                          跳过
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-[#9A3412]">
                          {parseResult.skippedCount}
                        </p>
                      </div>
                    </div>

                    {parseResult.missingFields.length > 0 ? (
                      <div className="mt-5 rounded-[20px] border border-[#F3D5BE] bg-[#FFF7F0] px-4 py-4 text-sm leading-7 text-[#9A3412]">
                        缺少必填字段：{parseResult.missingFields.join("、")}。请先补齐表头，再继续预览或后续导入。
                      </div>
                    ) : null}

                    {parseResult.errorSummary.length > 0 ? (
                      <div className="mt-5 space-y-3">
                        <p className="text-sm font-medium text-black">主要错误原因</p>
                        <div className="flex flex-wrap gap-2">
                          {parseResult.errorSummary.map((item) => (
                            <span
                              key={item.reason}
                              className="inline-flex items-center rounded-full border border-[#F3D5BE] bg-[#FFF7F0] px-3 py-1 text-xs text-[#9A3412]"
                            >
                              {item.reason} · {item.count}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {parseResult.rowIssues.length > 0 ? (
                      <div className="mt-5 space-y-3">
                        <p className="text-sm font-medium text-black">错误行摘录</p>
                        <div className="space-y-3">
                          {parseResult.rowIssues.slice(0, 5).map((issue) => (
                            <div
                              key={`${issue.rowNumber}-${issue.reasons.join("-")}`}
                              className="rounded-[20px] bg-[#F7F7F5] px-4 py-4 text-sm leading-7 text-black/65"
                            >
                              第 {issue.rowNumber} 行：{issue.reasons.join("；")}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {parseResult.ignoredHeaders.length > 0 ? (
                      <div className="mt-5 rounded-[20px] bg-[#F7F7F5] px-4 py-4 text-sm leading-7 text-black/65">
                        以下表头当前仅保留原样，不参与校验：{parseResult.ignoredHeaders.join("、")}。
                      </div>
                    ) : null}

                    {confirmationDateRange ? (
                      <div className="mt-5 rounded-[20px] border border-[#CFE8D6] bg-[#F3FBF5] px-4 py-4 text-sm leading-7 text-[#166534]">
                        标准化日期范围：{confirmationDateRange.start} 至 {confirmationDateRange.end}
                        。本次导入会直接沿用该标准日期格式。
                      </div>
                    ) : null}
                  </article>

                  <article className="rounded-[24px] border border-black/8 px-5 py-5">
                    <div className="flex flex-col gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-black">确认导入</p>
                        <p className="mt-2 text-sm leading-7 text-black/58">
                          这里汇总最终导入范围，并提供真实 `upsert` 提交操作。
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsConfirmEntryOpen((currentValue) => !currentValue)}
                        disabled={!canEnterConfirmation}
                        className={`inline-flex w-fit items-center justify-center border px-4 py-3 text-sm transition ${
                          canEnterConfirmation
                            ? "border-black text-black hover:bg-black hover:text-white"
                            : "cursor-not-allowed border-black/10 bg-[#F7F7F5] text-black/35"
                        }`}
                      >
                        {isConfirmEntryOpen ? "收起确认导入" : "进入确认导入"}
                      </button>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[20px] bg-[#F7F7F5] px-4 py-4 text-sm leading-7 text-black/65">
                        将导入 {parseResult.successCount} 条合法记录
                      </div>
                      <div className="rounded-[20px] bg-[#F7F7F5] px-4 py-4 text-sm leading-7 text-black/65">
                        跳过 {parseResult.skippedCount} 条异常记录
                      </div>
                      <div className="rounded-[20px] bg-[#F7F7F5] px-4 py-4 text-sm leading-7 text-black/65">
                        目标冲突键：`brand_id + date`
                      </div>
                    </div>

                    {!canEnterConfirmation ? (
                      <div className="mt-5 rounded-[20px] border border-[#F3D5BE] bg-[#FFF7F0] px-4 py-4 text-sm leading-7 text-[#9A3412]">
                        只有在至少识别出 1 条合法记录且不存在必填字段缺失时，才能进入确认导入。
                      </div>
                    ) : null}

                    {isConfirmEntryOpen && canEnterConfirmation ? (
                      <div className="mt-5 space-y-4">
                        <div className="rounded-[20px] border border-[#CFE8D6] bg-[#F3FBF5] px-4 py-4 text-sm leading-7 text-[#166534]">
                          已进入确认导入状态。本次将以当前登录品牌为目标品牌，按标准化后的 `date`
                          值执行真实 upsert。
                        </div>
                        <div className="rounded-[20px] bg-[#F7F7F5] px-4 py-4 text-sm leading-7 text-black/65">
                          已锁定前 {Math.min(parseResult.validRows.length, 5)} 条合法记录用于确认摘要：
                          {parseResult.validRows
                            .slice(0, 5)
                            .map((row) => row.date)
                            .join("、")}
                        </div>
                        <button
                          type="button"
                          onClick={handleImport}
                          disabled={isSubmitting}
                          className={`inline-flex w-fit items-center justify-center border px-4 py-3 text-sm transition ${
                            isSubmitting
                              ? "cursor-not-allowed border-black/10 bg-[#F7F7F5] text-black/35"
                              : "border-black text-black hover:bg-black hover:text-white"
                          }`}
                        >
                          {isSubmitting ? "正在提交..." : "确认并导入"}
                        </button>
                      </div>
                    ) : null}
                  </article>

                  <article className="rounded-[24px] border border-black/8 px-5 py-5">
                    <div className="flex flex-col gap-3 border-b border-black/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-black">导入预览</p>
                        <p className="mt-2 text-sm leading-7 text-black/58">
                          仅展示解析成功的前 6 行，日期已是标准化后的最终形态，也是最终提交内容。
                        </p>
                      </div>
                      <div className="text-xs uppercase tracking-[0.18em] text-black/42">
                        预览已就绪
                      </div>
                    </div>

                    {parseResult.previewRows.length > 0 ? (
                      <div className="mt-5 overflow-x-auto">
                        <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-black/68">
                          <thead>
                            <tr>
                              <th className="border-b border-black/10 px-3 py-3 font-medium text-black">
                                行号
                              </th>
                              {previewFieldKeys.map((fieldKey) => (
                                <th
                                  key={fieldKey}
                                  className="border-b border-black/10 px-3 py-3 font-medium text-black"
                                >
                                  {fieldKey}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {parseResult.previewRows.map((row) => (
                              <tr key={row.rowNumber}>
                                <td className="border-b border-black/6 px-3 py-3 text-black/48">
                                  {row.rowNumber}
                                </td>
                                {previewFieldKeys.map((fieldKey) => (
                                  <td
                                    key={`${row.rowNumber}-${fieldKey}`}
                                    className="border-b border-black/6 px-3 py-3"
                                  >
                                    {row.values[fieldKey]}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="mt-5 rounded-[20px] bg-[#F7F7F5] px-4 py-4 text-sm leading-7 text-black/65">
                        当前没有可预览的成功行。请先修复缺失字段或错误数据后再查看预览。
                      </div>
                    )}
                  </article>
                </div>
              ) : null}
            </div>
          </article>
        </div>

        <aside className="space-y-6">
          <article className="rounded-[32px] bg-white p-6 shadow-sm shadow-black/[0.04] sm:p-8">
            <div className="space-y-2 border-b border-black/10 pb-5">
              <p className="text-xs uppercase tracking-[0.22em] text-black/40">
                Current Notes
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">导入说明</h2>
            </div>

            <div className="mt-6 space-y-4">
              {importNotes.map((note, index) => (
                <div
                  key={note}
                  className="rounded-[24px] border border-black/8 px-5 py-4"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-black/38">
                    Note {index + 1}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-black/65">{note}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[32px] bg-white p-6 shadow-sm shadow-black/[0.04] sm:p-8">
            <div className="space-y-2 border-b border-black/10 pb-5">
              <p className="text-xs uppercase tracking-[0.22em] text-black/40">
                Field Scope
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">字段边界</h2>
            </div>

            <div className="mt-6 space-y-3">
              {fieldDefinitions.map((field) => (
                <div
                  key={field.key}
                  className="rounded-[24px] border border-black/8 px-5 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-black">{field.key}</p>
                    <span className="text-xs uppercase tracking-[0.16em] text-black/42">
                      {field.required ? "Required" : "Optional"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-black/65">
                    {field.label}。{field.description}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[32px] bg-white p-6 shadow-sm shadow-black/[0.04] sm:p-8">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-black/40">
                Current Status
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">当前能力与边界</h2>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] bg-[#F7F7F5] px-5 py-4 text-sm leading-7 text-black/65">
                当前已支持模板下载，模板列顺序与页面解析规则保持一致。
              </div>
              <div className="rounded-[24px] bg-[#F7F7F5] px-5 py-4 text-sm leading-7 text-black/65">
                当前已支持浏览器本地 trim 容错、日期标准化、错误摘要、错误行跳过与合法行预览。
              </div>
              <div className="rounded-[24px] bg-[#F7F7F5] px-5 py-4 text-sm leading-7 text-black/65">
                当前会按 `brand_id + date` 将合法数据写入 `geo_metrics_daily` 并返回回执；导入历史、批次审计与回滚能力暂未提供。
              </div>
            </div>
          </article>
        </aside>
      </section>
    </section>
  );
}

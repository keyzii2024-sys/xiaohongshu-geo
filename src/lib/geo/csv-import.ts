"use client";

export type FieldDefinition = {
  key: GeoMetricFieldKey;
  label: string;
  required: boolean;
  type: "date" | "number" | "integer";
  description: string;
};

export type RowIssue = {
  rowNumber: number;
  reasons: string[];
};

export type ErrorSummaryItem = {
  reason: string;
  count: number;
};

export type PreviewRow = {
  rowNumber: number;
  values: Record<string, string>;
};

export type ParsedGeoMetricRow = {
  rowNumber: number;
  date: string;
  visibility: number;
  citation_rate: number;
  sentiment_score: number | null;
  roi_index: number | null;
  top3_rate: number | null;
  cited_notes_count: number | null;
  cited_accounts_count: number | null;
};

export type ParseResult = {
  totalRows: number;
  successCount: number;
  skippedCount: number;
  headers: string[];
  missingFields: string[];
  rowIssues: RowIssue[];
  errorSummary: ErrorSummaryItem[];
  previewRows: PreviewRow[];
  validRows: ParsedGeoMetricRow[];
  ignoredHeaders: string[];
  blockingMessage: string | null;
};

type GeoMetricFieldKey =
  | "date"
  | "visibility"
  | "citation_rate"
  | "sentiment_score"
  | "roi_index"
  | "top3_rate"
  | "cited_notes_count"
  | "cited_accounts_count";

type CsvParseResult = {
  rows: string[][];
  formatError: string | null;
};

const DATE_SEPARATOR_PATTERN = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/;

export const fieldDefinitions: FieldDefinition[] = [
  {
    key: "date",
    label: "日期",
    required: true,
    type: "date",
    description: "必填，支持 `YYYY-MM-DD`、`YYYY/M/D`、`YYYY.MM.DD`。",
  },
  {
    key: "visibility",
    label: "可见度",
    required: true,
    type: "number",
    description: "必填，需为合法数字，可带小数。",
  },
  {
    key: "citation_rate",
    label: "引用率",
    required: true,
    type: "number",
    description: "必填，需为合法数字，可带小数。",
  },
  {
    key: "sentiment_score",
    label: "情感分",
    required: false,
    type: "number",
    description: "选填，若存在值则需为合法数字。",
  },
  {
    key: "roi_index",
    label: "ROI 指数",
    required: false,
    type: "number",
    description: "选填，若存在值则需为合法数字。",
  },
  {
    key: "top3_rate",
    label: "Top3 占比",
    required: false,
    type: "number",
    description: "选填，若存在值则需为合法数字。",
  },
  {
    key: "cited_notes_count",
    label: "被引用笔记数",
    required: false,
    type: "integer",
    description: "选填，若存在值则需为合法整数。",
  },
  {
    key: "cited_accounts_count",
    label: "被引用账号数",
    required: false,
    type: "integer",
    description: "选填，若存在值则需为合法整数。",
  },
];

export const importNotes = [
  "模板下载会在浏览器本地生成 CSV，表头与页面校验规则保持一致。",
  "表头会自动执行 trim 容错，` date ` 这类列名仍可被识别为标准字段。",
  "日期会统一标准化为 `YYYY-MM-DD`，非法日期、非法数字或非法整数行会被跳过并进入错误摘要。",
  "当存在至少 1 条合法数据时，可继续执行真实导入，写入 `geo_metrics_daily` 并返回回执。",
];

export const supportedDateExamples = ["2026-04-23", "2026/4/23", "2026.04.23"];
export const sampleHeaders = fieldDefinitions.map((field) => field.key);
export const requiredFieldKeys = fieldDefinitions
  .filter((field) => field.required)
  .map((field) => field.key);
export const previewFieldKeys = [
  "date",
  "visibility",
  "citation_rate",
  "sentiment_score",
  "roi_index",
];
export const templateFileName = "geo-import-template.csv";

const fieldDefinitionMap = new Map(fieldDefinitions.map((field) => [field.key, field]));
const templateSampleRows = [
  ["2026-04-01", "62.5", "18.2", "73.4", "1.28", "41.6", "126", "24"],
  ["2026/4/2", "64.1", "19.0", "75.1", "1.35", "43.2", "131", "27"],
];

function padDateSegment(value: number) {
  return String(value).padStart(2, "0");
}

function isValidCalendarDate(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function normalizePercentValue(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const hasPercent = trimmed.endsWith("%");
  const numericPart = hasPercent ? trimmed.slice(0, -1) : trimmed;

  if (!/^-?\d+(\.\d+)?$/.test(numericPart)) {
    return null;
  }

  const numericValue = Number(numericPart);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return hasPercent ? numericValue / 100 : numericValue;
}

function normalizeNumberValue(value: string) {
  return normalizePercentValue(value);
}

function normalizeIntegerValue(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const hasPercent = trimmed.endsWith("%");
  const numericPart = hasPercent ? trimmed.slice(0, -1) : trimmed;

  if (!/^-?\d+$/.test(numericPart)) {
    return null;
  }

  const numericValue = Number(numericPart);

  if (!Number.isSafeInteger(numericValue)) {
    return null;
  }

  return hasPercent ? numericValue / 100 : numericValue;
}

function buildErrorSummary(rowIssues: RowIssue[]) {
  const counts = new Map<string, number>();

  rowIssues.forEach((issue) => {
    issue.reasons.forEach((reason) => {
      counts.set(reason, (counts.get(reason) ?? 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((left, right) => right.count - left.count || left.reason.localeCompare(right.reason));
}

function parseCsvText(content: string): CsvParseResult {
  const rows: string[][] = [];
  let row: string[] = [];
  let currentValue = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        currentValue += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (character === "," && !inQuotes) {
      row.push(currentValue);
      currentValue = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !inQuotes) {
      row.push(currentValue);
      rows.push(row);
      row = [];
      currentValue = "";

      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      continue;
    }

    currentValue += character;
  }

  if (inQuotes) {
    return {
      rows,
      formatError: "CSV 格式不完整，请检查是否存在未闭合的引号。",
    };
  }

  if (currentValue.length > 0 || row.length > 0) {
    row.push(currentValue);
    rows.push(row);
  }

  return {
    rows,
    formatError: null,
  };
}

export function escapeCsvValue(value: string) {
  if (/["\n,\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function buildTemplateCsv() {
  return [sampleHeaders, ...templateSampleRows]
    .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
    .join("\r\n");
}

export function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

export function normalizeDateValue(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  const matched = normalizedValue.match(DATE_SEPARATOR_PATTERN);

  if (!matched) {
    return null;
  }

  const [, rawYear, rawMonth, rawDay] = matched;
  const year = Number(rawYear);
  const month = Number(rawMonth);
  const day = Number(rawDay);

  if (!isValidCalendarDate(year, month, day)) {
    return null;
  }

  return `${year}-${padDateSegment(month)}-${padDateSegment(day)}`;
}

function assignNullableField(
  target: Partial<ParsedGeoMetricRow>,
  fieldKey: Exclude<GeoMetricFieldKey, "date" | "visibility" | "citation_rate">,
  value: number | null,
) {
  switch (fieldKey) {
    case "sentiment_score":
      target.sentiment_score = value;
      return;
    case "roi_index":
      target.roi_index = value;
      return;
    case "top3_rate":
      target.top3_rate = value;
      return;
    case "cited_notes_count":
      target.cited_notes_count = value;
      return;
    case "cited_accounts_count":
      target.cited_accounts_count = value;
      return;
  }
}

export function parseCsvImport(content: string): ParseResult {
  const normalizedContent = content.replace(/^\uFEFF/, "");

  if (!normalizedContent.trim()) {
    return {
      totalRows: 0,
      successCount: 0,
      skippedCount: 0,
      headers: [],
      missingFields: [],
      rowIssues: [],
      errorSummary: [],
      previewRows: [],
      validRows: [],
      ignoredHeaders: [],
      blockingMessage: "文件为空，当前无法解析。请补充表头和数据行后重试。",
    };
  }

  const parsedCsv = parseCsvText(normalizedContent);

  if (parsedCsv.formatError) {
    return {
      totalRows: 0,
      successCount: 0,
      skippedCount: 0,
      headers: [],
      missingFields: [],
      rowIssues: [],
      errorSummary: [],
      previewRows: [],
      validRows: [],
      ignoredHeaders: [],
      blockingMessage: parsedCsv.formatError,
    };
  }

  const indexedRows = parsedCsv.rows
    .map((cells, index) => ({
      rowNumber: index + 1,
      cells: cells.map((cell) => cell.trim()),
    }))
    .filter((row) => row.cells.some((cell) => cell !== ""));

  if (indexedRows.length === 0) {
    return {
      totalRows: 0,
      successCount: 0,
      skippedCount: 0,
      headers: [],
      missingFields: [],
      rowIssues: [],
      errorSummary: [],
      previewRows: [],
      validRows: [],
      ignoredHeaders: [],
      blockingMessage: "未识别到有效内容，请确认 CSV 不是空文件。",
    };
  }

  const headerRow = indexedRows[0];
  const headers = headerRow.cells.map((cell) => normalizeHeader(cell));

  if (headers.every((header) => header === "")) {
    return {
      totalRows: 0,
      successCount: 0,
      skippedCount: 0,
      headers: [],
      missingFields: [],
      rowIssues: [],
      errorSummary: [],
      previewRows: [],
      validRows: [],
      ignoredHeaders: [],
      blockingMessage: "表头缺失或不可识别，请保留 CSV 第一行字段名。",
    };
  }

  const dataRows = indexedRows.slice(1);

  if (dataRows.length === 0) {
    return {
      totalRows: 0,
      successCount: 0,
      skippedCount: 0,
      headers,
      missingFields: [],
      rowIssues: [],
      errorSummary: [],
      previewRows: [],
      validRows: [],
      ignoredHeaders: [],
      blockingMessage: "仅检测到表头，暂无数据行可供预览。",
    };
  }

  const missingFields = requiredFieldKeys.filter((field) => !headers.includes(field));
  const ignoredHeaders = headers.filter(
    (header) => header && !fieldDefinitionMap.has(header as GeoMetricFieldKey),
  );

  if (missingFields.length > 0) {
    return {
      totalRows: dataRows.length,
      successCount: 0,
      skippedCount: dataRows.length,
      headers,
      missingFields,
      rowIssues: [],
      errorSummary: [
        {
          reason: `缺少必填字段：${missingFields.join("、")}`,
          count: dataRows.length,
        },
      ],
      previewRows: [],
      validRows: [],
      ignoredHeaders,
      blockingMessage: null,
    };
  }

  const headerIndexMap = new Map<string, number>();

  headers.forEach((header, index) => {
    if (header && !headerIndexMap.has(header)) {
      headerIndexMap.set(header, index);
    }
  });

  const rowIssues: RowIssue[] = [];
  const previewRows: PreviewRow[] = [];
  const validRows: ParsedGeoMetricRow[] = [];

  dataRows.forEach((row) => {
    const reasons: string[] = [];
    const normalizedRow: Partial<ParsedGeoMetricRow> = {
      rowNumber: row.rowNumber,
    };

    fieldDefinitions.forEach((field) => {
      const fieldIndex = headerIndexMap.get(field.key);

      if (fieldIndex === undefined) {
        return;
      }

      const value = row.cells[fieldIndex] ?? "";
      const trimmedValue = value.trim();

      if (field.required && !trimmedValue) {
        reasons.push(`${field.key} 为空`);
        return;
      }

      if (!trimmedValue) {
        assignNullableField(
          normalizedRow,
          field.key as Exclude<GeoMetricFieldKey, "date" | "visibility" | "citation_rate">,
          null,
        );
        return;
      }

      if (field.type === "date") {
        const normalizedDateValue = normalizeDateValue(trimmedValue);

        if (!normalizedDateValue) {
          reasons.push("日期格式错误");
          return;
        }

        normalizedRow.date = normalizedDateValue;
        return;
      }

      if (field.type === "integer") {
        const normalizedIntegerValue = normalizeIntegerValue(trimmedValue);

        if (normalizedIntegerValue === null) {
          reasons.push(`${field.key} 不是合法整数`);
          return;
        }

        assignNullableField(
          normalizedRow,
          field.key as Exclude<GeoMetricFieldKey, "date" | "visibility" | "citation_rate">,
          normalizedIntegerValue,
        );
        return;
      }

      const normalizedNumberValue = normalizeNumberValue(trimmedValue);

      if (normalizedNumberValue === null) {
        reasons.push(`${field.key} 不是合法数字`);
        return;
      }

      if (field.key === "visibility" || field.key === "citation_rate") {
        normalizedRow[field.key] = normalizedNumberValue;
        return;
      }

      assignNullableField(
        normalizedRow,
        field.key as Exclude<GeoMetricFieldKey, "date" | "visibility" | "citation_rate">,
        normalizedNumberValue,
      );
    });

    if (reasons.length > 0) {
      rowIssues.push({
        rowNumber: row.rowNumber,
        reasons,
      });
      return;
    }

    const parsedRow = normalizedRow as ParsedGeoMetricRow;
    validRows.push(parsedRow);

    if (previewRows.length >= 6) {
      return;
    }

    previewRows.push({
      rowNumber: row.rowNumber,
      values: previewFieldKeys.reduce<Record<string, string>>((accumulator, fieldKey) => {
        const currentValue = parsedRow[fieldKey as keyof ParsedGeoMetricRow];
        accumulator[fieldKey] = currentValue === null ? "—" : String(currentValue);
        return accumulator;
      }, {}),
    });
  });

  return {
    totalRows: dataRows.length,
    successCount: validRows.length,
    skippedCount: rowIssues.length,
    headers,
    missingFields: [],
    rowIssues,
    errorSummary: buildErrorSummary(rowIssues),
    previewRows,
    validRows,
    ignoredHeaders,
    blockingMessage: null,
  };
}

import { NextResponse } from "next/server";

import { ensureDefaultBrandForUser } from "@/lib/auth/brands";
import { buildMockResult, getSharedGeoProviderData, toGeoApiResponse } from "@/lib/geo/shared-provider";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const REQUEST_TIMEOUT = 30000;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

function normalizeRange(range: string | null): "1d" | "7d" | "30d" {
  if (range === "24h") return "1d";
  if (range === "30d") return "30d";
  return "7d";
}

async function fetchWithTimeout<T>(
  fetchFn: () => Promise<T>,
  timeout: number,
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("请求超时，请稍后重试")), timeout);
  });

  return Promise.race([fetchFn(), timeoutPromise]);
}

async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  maxRetries: number,
  initialDelay: number,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("请求失败");
}

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          message: "请先登录后再读取 Dashboard 数据。",
          code: "UNAUTHORIZED",
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId");
    const rangeParam = searchParams.get("range");
    const normalizedRange = normalizeRange(rangeParam);

    let sharedResult;
    let usingMockData = false;

    try {
      sharedResult = await fetchWithRetry(
        async () => {
          await ensureDefaultBrandForUser(supabase, user);

          return fetchWithTimeout(
            async () => {
              return getSharedGeoProviderData({
                supabase,
                brandId,
                range: normalizedRange,
              });
            },
            REQUEST_TIMEOUT,
          );
        },
        MAX_RETRIES,
        INITIAL_RETRY_DELAY,
      );
    } catch (dbError) {
      console.warn("数据库查询失败，回退到Mock数据:", dbError);

      sharedResult = buildMockResult(
        { id: brandId || "default-brand", name: "小红薯 GEO" },
        normalizedRange,
      );
      usingMockData = true;
    }

    const response = toGeoApiResponse(sharedResult);

    if (usingMockData) {
      return NextResponse.json({
        ...response,
        meta: {
          ...response.meta,
          source: "mock" as const,
          databaseError: true,
          errorMessage: "数据暂时使用示例展示，数据库恢复后会显示真实数据",
        },
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to build /api/geo response", error);

    const errorMessage = error instanceof Error ? error.message : "未知错误";

    let userMessage = "暂时无法读取仪表盘数据，请稍后重试。";
    let code = "INTERNAL_ERROR";

    if (errorMessage.includes("timeout") || errorMessage.includes("超时")) {
      userMessage = "请求超时，请稍后重试。";
      code = "TIMEOUT";
    } else if (errorMessage.includes("network") || errorMessage.includes("网络")) {
      userMessage = "网络连接不稳定，请检查网络后重试。";
      code = "NETWORK_ERROR";
    }

    return NextResponse.json(
      {
        message: userMessage,
        code,
      },
      { status: 500 },
    );
  }
}

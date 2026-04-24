import { NextResponse } from "next/server";

import {
  ensureDefaultBrandForUser,
  getPrimaryBrandIdForUser,
} from "@/lib/auth/brands";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type BrandRequestBody = {
  name?: unknown;
  domain?: unknown;
  keywords?: unknown;
  logo_url?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringOrUndefined(value: unknown): value is string | undefined {
  return typeof value === "string" || value === undefined;
}

function isStringArrayOrUndefined(value: unknown): value is string[] | undefined {
  if (value === undefined) {
    return true;
  }
  if (!Array.isArray(value)) {
    return false;
  }
  return value.every((item) => typeof item === "string");
}

function validateBrandBody(value: unknown): value is BrandRequestBody {
  if (!value || typeof value !== "object") {
    return false;
  }

  const body = value as Record<string, unknown>;

  if (!isNonEmptyString(body.name)) {
    return false;
  }
  if (!isStringOrUndefined(body.domain)) {
    return false;
  }
  if (!isStringArrayOrUndefined(body.keywords)) {
    return false;
  }
  if (!isStringOrUndefined(body.logo_url)) {
    return false;
  }

  return true;
}

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          message: "请先登录后再查看品牌信息。",
        },
        { status: 401 },
      );
    }

    await ensureDefaultBrandForUser(supabase, user);
    const brandId = await getPrimaryBrandIdForUser(supabase, user.id);

    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select(
        `
        id,
        name,
        domain,
        keywords,
        logo_url,
        created_at,
        updated_at
      `,
      )
      .eq("id", brandId)
      .maybeSingle();

    if (brandError) {
      console.error("Failed to load brand data", brandError);

      return NextResponse.json(
        {
          message: "暂时无法读取品牌信息，请稍后重试。",
        },
        { status: 500 },
      );
    }

    if (!brand) {
      return NextResponse.json(
        {
          message: "未找到品牌信息。",
        },
        { status: 404 },
      );
    }

    const { data: userBrandRelation, error: relationError } = await supabase
      .from("user_brands")
      .select("role, created_at")
      .eq("user_id", user.id)
      .eq("brand_id", brandId)
      .maybeSingle();

    if (relationError) {
      console.error("Failed to load user brand relation", relationError);

      return NextResponse.json(
        {
          message: "暂时无法读取用户品牌关联信息，请稍后重试。",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      brand: {
        ...brand,
        role: userBrandRelation?.role ?? null,
        joined_at: userBrandRelation?.created_at ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to get brand settings", error);

    return NextResponse.json(
      {
        message: "获取品牌信息时出现异常，请稍后重试。",
      },
      { status: 500 },
    );
  }
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
          message: "请先登录后再保存品牌信息。",
        },
        { status: 401 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          message: "请求参数格式无效，请检查 JSON 格式。",
        },
        { status: 400 },
      );
    }

    if (!validateBrandBody(body)) {
      return NextResponse.json(
        {
          message: "请求参数无效，请检查输入的品牌名称等字段。",
        },
        { status: 400 },
      );
    }

    const nameTrimmed = (body.name as string).trim();
    if (nameTrimmed.length > 100) {
      return NextResponse.json(
        {
          message: "品牌名称不能超过 100 个字符。",
        },
        { status: 400 },
      );
    }

    if (body.domain && typeof body.domain === "string") {
      const domainTrimmed = body.domain.trim();
      if (domainTrimmed) {
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;
        if (!domainRegex.test(domainTrimmed)) {
          return NextResponse.json(
            {
              message: "域名格式不正确，请输入有效的域名，如 example.com。",
            },
            { status: 400 },
          );
        }
      }
    }

    if (body.logo_url && typeof body.logo_url === "string") {
      const logoUrlTrimmed = body.logo_url.trim();
      if (logoUrlTrimmed) {
        try {
          const url = new URL(logoUrlTrimmed);
          if (url.protocol !== "http:" && url.protocol !== "https:") {
            return NextResponse.json(
              {
                message: "Logo URL 必须以 http:// 或 https:// 开头。",
              },
              { status: 400 },
            );
          }
        } catch {
          return NextResponse.json(
            {
              message: "Logo URL 格式不正确，请输入有效的 HTTP/HTTPS URL。",
            },
            { status: 400 },
          );
        }
      }
    }

    if (Array.isArray(body.keywords) && body.keywords.length > 20) {
      return NextResponse.json(
        {
          message: "关键词数量不能超过 20 个。",
        },
        { status: 400 },
      );
    }

    await ensureDefaultBrandForUser(supabase, user);
    const brandId = await getPrimaryBrandIdForUser(supabase, user.id);

    const upsertData = {
      id: brandId,
      name: nameTrimmed,
      domain: (body.domain as string)?.trim() || null,
      keywords: Array.isArray(body.keywords) ? body.keywords : [],
      logo_url: (body.logo_url as string)?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { data: brand, error: upsertError } = await supabase
      .from("brands")
      .upsert(upsertData, {
        onConflict: "id",
      })
      .select(
        `
        id,
        name,
        domain,
        keywords,
        logo_url,
        created_at,
        updated_at
      `,
      )
      .maybeSingle();

    if (upsertError) {
      console.error("Failed to upsert brand data", upsertError);

      return NextResponse.json(
        {
          message: "Supabase 写入失败，请稍后重试。",
        },
        { status: 500 },
      );
    }

    if (!brand) {
      return NextResponse.json(
        {
          message: "品牌保存失败，请稍后重试。",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "品牌信息保存成功。",
      brand,
    });
  } catch (error) {
    console.error("Failed to save brand settings", error);

    return NextResponse.json(
      {
        message: "保存品牌信息时出现异常，请检查输入后重试。",
      },
      { status: 500 },
    );
  }
}

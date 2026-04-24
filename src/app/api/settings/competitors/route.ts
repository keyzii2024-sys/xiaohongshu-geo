import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 },
      );
    }

    let query = supabase
      .from("competitors")
      .select("*")
      .order("created_at", { ascending: false });

    if (brandId) {
      query = query.eq("brand_id", brandId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to fetch competitors:", error);
      return NextResponse.json(
        { error: "获取竞品列表失败" },
        { status: 500 },
      );
    }

    return NextResponse.json({ competitors: data });
  } catch (error) {
    console.error("Competitors GET error:", error);
    return NextResponse.json(
      { error: "服务器错误，请稍后重试" },
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
        { error: "请先登录" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { brandId, competitorName, domain, keywords } = body;

    if (!competitorName || !competitorName.trim()) {
      return NextResponse.json(
        { error: "竞品名称不能为空" },
        { status: 400 },
      );
    }

    if (!brandId) {
      return NextResponse.json(
        { error: "品牌ID不能为空" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("competitors")
      .insert({
        brand_id: brandId,
        competitor_name: competitorName.trim(),
        domain: domain?.trim() || null,
        keywords: Array.isArray(keywords) ? keywords : [],
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create competitor:", error);
      return NextResponse.json(
        { error: "创建竞品失败" },
        { status: 500 },
      );
    }

    return NextResponse.json({ competitor: data }, { status: 201 });
  } catch (error) {
    console.error("Competitors POST error:", error);
    return NextResponse.json(
      { error: "服务器错误，请稍后重试" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { id, competitorName, domain, keywords } = body;

    if (!id) {
      return NextResponse.json(
        { error: "竞品ID不能为空" },
        { status: 400 },
      );
    }

    if (!competitorName || !competitorName.trim()) {
      return NextResponse.json(
        { error: "竞品名称不能为空" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("competitors")
      .update({
        competitor_name: competitorName.trim(),
        domain: domain?.trim() || null,
        keywords: Array.isArray(keywords) ? keywords : [],
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update competitor:", error);
      return NextResponse.json(
        { error: "更新竞品失败" },
        { status: 500 },
      );
    }

    return NextResponse.json({ competitor: data });
  } catch (error) {
    console.error("Competitors PUT error:", error);
    return NextResponse.json(
      { error: "服务器错误，请稍后重试" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 },
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: "竞品ID不能为空" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("competitors")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete competitor:", error);
      return NextResponse.json(
        { error: "删除竞品失败" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Competitors DELETE error:", error);
    return NextResponse.json(
      { error: "服务器错误，请稍后重试" },
      { status: 500 },
    );
  }
}

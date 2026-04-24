import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10) || 20));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

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
      .from("accounts")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (brandId) {
      query = query.eq("brand_id", brandId);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Failed to fetch accounts:", error);
      return NextResponse.json(
        { error: "获取账号列表失败" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: data ?? [],
      total: count ?? 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("Accounts GET error:", error);
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
    const { brandId, xhsUserId, nickname, avatarUrl, followers, groupType } = body;

    if (!brandId) {
      return NextResponse.json(
        { error: "品牌ID不能为空" },
        { status: 400 },
      );
    }

    if (!xhsUserId || !xhsUserId.trim()) {
      return NextResponse.json(
        { error: "小红书用户ID不能为空" },
        { status: 400 },
      );
    }

    if (!groupType) {
      return NextResponse.json(
        { error: "账号分组不能为空" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("accounts")
      .insert({
        brand_id: brandId,
        xhs_user_id: xhsUserId.trim(),
        nickname: nickname?.trim() || null,
        avatar_url: avatarUrl?.trim() || null,
        followers: followers || 0,
        group_type: groupType,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create account:", error);
      return NextResponse.json(
        { error: "创建账号失败" },
        { status: 500 },
      );
    }

    return NextResponse.json({ account: data }, { status: 201 });
  } catch (error) {
    console.error("Accounts POST error:", error);
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
    const { id, xhsUserId, nickname, avatarUrl, followers, groupType } = body;

    if (!id) {
      return NextResponse.json(
        { error: "账号ID不能为空" },
        { status: 400 },
      );
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (xhsUserId !== undefined) updateData.xhs_user_id = xhsUserId.trim();
    if (nickname !== undefined) updateData.nickname = nickname?.trim() || null;
    if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl?.trim() || null;
    if (followers !== undefined) updateData.followers = followers;
    if (groupType !== undefined) updateData.group_type = groupType;

    const { data, error } = await supabase
      .from("accounts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update account:", error);
      return NextResponse.json(
        { error: "更新账号失败" },
        { status: 500 },
      );
    }

    return NextResponse.json({ account: data });
  } catch (error) {
    console.error("Accounts PUT error:", error);
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
        { error: "账号ID不能为空" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete account:", error);
      return NextResponse.json(
        { error: "删除账号失败" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Accounts DELETE error:", error);
    return NextResponse.json(
      { error: "服务器错误，请稍后重试" },
      { status: 500 },
    );
  }
}

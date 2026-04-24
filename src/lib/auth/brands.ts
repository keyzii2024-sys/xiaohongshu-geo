import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function getDefaultBrandName(user: User) {
  const emailPrefix = user.email?.split("@")[0]?.trim();

  if (emailPrefix) {
    return `${emailPrefix} 默认品牌`;
  }

  return "默认品牌";
}

export async function ensureDefaultBrandForUser(
  supabase: SupabaseClient,
  user: User,
) {
  const defaultBrandId = user.id;

  const { count, error: countError } = await supabase
    .from("user_brands")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (countError) {
    throw countError;
  }

  if ((count ?? 0) > 0) {
    return false;
  }

  const { data: brand, error: brandError } = await supabase
    .from("brands")
    .upsert(
      {
        id: defaultBrandId,
        name: getDefaultBrandName(user),
        keywords: [],
      },
      {
        onConflict: "id",
      },
    )
    .select("id")
    .single();

  if (brandError || !brand) {
    throw brandError ?? new Error("Failed to create default brand.");
  }

  const { error: relationError } = await supabase.from("user_brands").insert({
    user_id: user.id,
    brand_id: brand.id,
    role: "OWNER",
  });

  if (relationError) {
    throw relationError;
  }

  const { count: finalCount, error: finalCountError } = await supabase
    .from("user_brands")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (finalCountError) {
    throw finalCountError;
  }

  return (finalCount ?? 0) === 1;
}

export async function getPrimaryBrandIdForUser(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("user_brands")
    .select("brand_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.brand_id ?? userId;
}

export async function getBrandIdForBrowser(): Promise<string | null> {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_brands")
    .select("brand_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.brand_id ?? user.id;
}

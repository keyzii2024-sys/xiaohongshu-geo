import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export interface Competitor {
  id: string;
  brand_id: string;
  competitor_name: string;
  competitor_domain: string | null;
  keywords: string[] | null;
  created_at: string;
}

export interface CreateCompetitorInput {
  competitor_name: string;
  competitor_domain?: string | null;
  keywords?: string;
}

export interface UpdateCompetitorInput {
  competitor_name?: string;
  competitor_domain?: string | null;
  keywords?: string;
}

export function normalizeKeywords(value: unknown): string[] | null {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) {
    const filtered = value.filter((item): item is string => typeof item === "string");
    return filtered.length > 0 ? filtered : null;
  }
  return null;
}

function parseKeywordsString(keywords?: string | null): string[] | null {
  if (!keywords || !keywords.trim()) return null;
  return keywords.split(",").map((k) => k.trim()).filter(Boolean);
}

export async function getCompetitors(brandId: string): Promise<Competitor[]> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("competitors")
    .select("*")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as Competitor[];

  return rows.map((row) => ({
    ...row,
    keywords: normalizeKeywords(row.keywords),
  }));
}

export async function createCompetitor(
  brandId: string,
  input: CreateCompetitorInput,
): Promise<Competitor> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("competitors")
    .insert({
      brand_id: brandId,
      competitor_name: input.competitor_name,
      competitor_domain: input.competitor_domain ?? null,
      keywords: parseKeywordsString(input.keywords),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  const result = data as Competitor;
  return {
    ...result,
    keywords: normalizeKeywords(result.keywords),
  };
}

export async function updateCompetitor(
  id: string,
  input: UpdateCompetitorInput,
): Promise<Competitor> {
  const supabase = createSupabaseBrowserClient();

  const updateData: Record<string, unknown> = {};

  if (input.competitor_name !== undefined) {
    updateData.competitor_name = input.competitor_name;
  }
  if (input.competitor_domain !== undefined) {
    updateData.competitor_domain = input.competitor_domain;
  }
  if (input.keywords !== undefined) {
    updateData.keywords = parseKeywordsString(input.keywords);
  }

  const { data, error } = await supabase
    .from("competitors")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  const result = data as Competitor;
  return {
    ...result,
    keywords: normalizeKeywords(result.keywords),
  };
}

export async function deleteCompetitor(id: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase.from("competitors").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

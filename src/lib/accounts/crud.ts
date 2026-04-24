import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type AccountGroup = "自有矩阵" | "竞品矩阵" | "合作KOL";

export interface Account {
  id: string;
  brand_id: string;
  xhs_user_id: string;
  nickname: string;
  avatar_url: string | null;
  followers_count: number | null;
  account_group: AccountGroup;
  created_at: string;
}

export interface CreateAccountInput {
  xhs_user_id: string;
  nickname: string;
  avatar_url?: string | null;
  followers_count?: number | null;
  account_group: AccountGroup;
}

export interface UpdateAccountInput {
  xhs_user_id?: string;
  nickname?: string;
  avatar_url?: string | null;
  followers_count?: number | null;
  account_group?: AccountGroup;
}

export interface AccountsGrouped {
  自有矩阵: Account[];
  竞品矩阵: Account[];
  合作KOL: Account[];
}

export interface PaginatedAccounts {
  data: Account[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getAccounts(brandId: string): Promise<AccountsGrouped> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const accounts = (data ?? []) as Account[];

  return {
    自有矩阵: accounts.filter((a) => a.account_group === "自有矩阵"),
    竞品矩阵: accounts.filter((a) => a.account_group === "竞品矩阵"),
    合作KOL: accounts.filter((a) => a.account_group === "合作KOL"),
  };
}

export async function getAccountsPaginated(
  brandId: string,
  page: number = 1,
  pageSize: number = 20,
): Promise<PaginatedAccounts> {
  const supabase = createSupabaseBrowserClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("accounts")
    .select("*", { count: "exact" })
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return {
    data: (data ?? []) as Account[],
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function createAccount(
  brandId: string,
  input: CreateAccountInput,
): Promise<Account> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("accounts")
    .insert({
      brand_id: brandId,
      xhs_user_id: input.xhs_user_id,
      nickname: input.nickname,
      avatar_url: input.avatar_url ?? null,
      followers_count: input.followers_count ?? null,
      account_group: input.account_group,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Account;
}

export async function updateAccount(
  id: string,
  input: UpdateAccountInput,
): Promise<Account> {
  const supabase = createSupabaseBrowserClient();

  const updateData: Record<string, unknown> = {};

  if (input.xhs_user_id !== undefined) {
    updateData.xhs_user_id = input.xhs_user_id;
  }
  if (input.nickname !== undefined) {
    updateData.nickname = input.nickname;
  }
  if (input.avatar_url !== undefined) {
    updateData.avatar_url = input.avatar_url;
  }
  if (input.followers_count !== undefined) {
    updateData.followers_count = input.followers_count;
  }
  if (input.account_group !== undefined) {
    updateData.account_group = input.account_group;
  }

  const { data, error } = await supabase
    .from("accounts")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Account;
}

export async function deleteAccount(id: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase.from("accounts").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export function getGroupSummary(accounts: Account[]) {
  return {
    count: accounts.length,
    totalFollowers: accounts.reduce(
      (sum, a) => sum + (a.followers_count ?? 0),
      0,
    ),
  };
}

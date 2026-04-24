"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type Account,
  type AccountGroup,
  type AccountsGrouped,
  getAccountsPaginated,
  type PaginatedAccounts,
  createAccount as createAccountApi,
  updateAccount as updateAccountApi,
  deleteAccount as deleteAccountApi,
} from "@/lib/accounts/crud";
import ConfirmModal from "@/components/ui/confirm-modal";
import { ToastMessage, type Toast } from "@/components/ui/toast";
import type { ConfirmModalState, ModalMode } from "@/lib/shared/types";
import { getBrandIdForBrowser } from "@/lib/auth/brands";
import { useDebounce } from "@/lib/hooks/use-debounce";

type AccountFormData = {
  xhs_user_id: string;
  nickname: string;
  avatar_url: string;
  followers_count: string;
  account_group: AccountGroup;
};

const ACCOUNT_GROUP_OPTIONS: { value: AccountGroup; label: string }[] = [
  { value: "自有矩阵", label: "自有矩阵" },
  { value: "竞品矩阵", label: "竞品矩阵" },
  { value: "合作KOL", label: "合作KOL" },
];

const EMPTY_FORM: AccountFormData = {
  xhs_user_id: "",
  nickname: "",
  avatar_url: "",
  followers_count: "",
  account_group: "自有矩阵",
}

function GroupSummaryCard({
  label,
  count,
  totalFollowers,
}: {
  label: string;
  count: number;
  totalFollowers: number;
}) {
  return (
    <div className="rounded-[24px] bg-white px-5 py-5 shadow-sm shadow-black/[0.03]">
      <p className="text-sm text-black/55">{label}</p>
      <div className="mt-4 flex items-end gap-4">
        <p className="text-3xl font-semibold tracking-tight text-black">
          {count}
        </p>
        <p className="mb-1 text-sm text-black/48">
          总粉丝 {totalFollowers.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function AccountRow({
  account,
  onEdit,
  onDelete,
}: {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-black/8 px-5 py-4 transition hover:bg-black/[0.02] last:border-0">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {account.avatar_url ? (
          <img
            src={account.avatar_url}
            alt={account.nickname}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F7F7F5] text-sm text-black/40">
            {account.nickname.charAt(0) || "?"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-black">
            {account.nickname || "未命名"}
          </p>
          <p className="truncate text-xs text-black/45">
            @{account.xhs_user_id}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {account.followers_count != null && (
          <span className="hidden rounded-full border border-black/10 px-2 py-1 text-xs text-black/55 sm:inline">
            {account.followers_count.toLocaleString()} 粉丝
          </span>
        )}
        <button
          type="button"
          onClick={() => onEdit(account)}
          className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/65 transition hover:border-black hover:text-black"
        >
          编辑
        </button>
        <button
          type="button"
          onClick={() => onDelete(account)}
          className="rounded-full border border-[#F3D5BE] bg-[#FFF7F0] px-3 py-1 text-xs text-[#9A3412] transition hover:border-[#C73B31] hover:bg-[#FFF0EF] hover:text-[#C73B31]"
        >
          删除
        </button>
      </div>
    </div>
  );
}

function AccountModal({
  mode,
  initialData,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  mode: ModalMode;
  initialData: Account | null;
  onClose: (hasChanges: boolean) => void;
  onSubmit: (data: AccountFormData) => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState<AccountFormData>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const initialFormRef = useRef<AccountFormData | null>(null);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      const data: AccountFormData = {
        xhs_user_id: initialData.xhs_user_id,
        nickname: initialData.nickname,
        avatar_url: initialData.avatar_url ?? "",
        followers_count: initialData.followers_count?.toString() ?? "",
        account_group: initialData.account_group,
      };
      setForm(data);
      initialFormRef.current = data;
    } else if (mode === "add") {
      setForm(EMPTY_FORM);
      initialFormRef.current = null;
    }
    setError(null);
  }, [mode, initialData]);

  const handleClose = () => {
    const hasChanges =
      mode === "add"
        ? form.xhs_user_id.trim() !== "" ||
          form.nickname.trim() !== "" ||
          form.avatar_url.trim() !== ""
        : initialFormRef.current
          ? JSON.stringify(form) !== JSON.stringify(initialFormRef.current)
          : false;

    onClose(hasChanges);
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!form.xhs_user_id.trim()) {
      errors.push("请输入小红书号");
    } else if (!/^[a-zA-Z0-9_-]+$/.test(form.xhs_user_id.trim())) {
      errors.push("小红书号格式不正确");
    }

    if (!form.nickname.trim()) {
      errors.push("请输入昵称");
    } else if (form.nickname.trim().length > 50) {
      errors.push("昵称不能超过50个字符");
    }

    if (form.avatar_url.trim() && !/^https?:\/\/.+/.test(form.avatar_url.trim())) {
      errors.push("头像URL格式不正确");
    }

    if (form.followers_count.trim()) {
      const num = parseInt(form.followers_count.trim(), 10);
      if (isNaN(num) || num < 0) {
        errors.push("粉丝数必须是正整数");
      } else if (num > 999999999) {
        errors.push("粉丝数超出范围");
      }
    }

    if (errors.length > 0) {
      setError(errors.join("；"));
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    onSubmit({
      ...form,
      followers_count: form.followers_count.trim(),
    });
  };

  const isFormFilled = form.xhs_user_id.trim() && form.nickname.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold tracking-tight text-black">
          {mode === "add" ? "添加账号" : "编辑账号"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-black">
              小红书号 <span className="text-[#C73B31]">*</span>
            </label>
            <input
              type="text"
              value={form.xhs_user_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, xhs_user_id: e.target.value }))
              }
              placeholder="输入小红书 user_id"
              disabled={mode === "edit" || isSubmitting}
              className={`w-full rounded-[20px] border px-4 py-3 text-sm transition focus:outline-none ${
                mode === "edit"
                  ? "cursor-not-allowed border-black/10 bg-[#F7F7F5] text-black/40"
                  : isSubmitting
                    ? "cursor-not-allowed border-black/10 bg-[#F7F7F5] text-black/40"
                    : "border-black/15 focus:border-black"
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-black">
              昵称 <span className="text-[#C73B31]">*</span>
            </label>
            <input
              type="text"
              value={form.nickname}
              onChange={(e) =>
                setForm((f) => ({ ...f, nickname: e.target.value }))
              }
              placeholder="输入账号昵称"
              maxLength={50}
              disabled={isSubmitting}
              className={`w-full rounded-[20px] border px-4 py-3 text-sm transition focus:outline-none ${
                isSubmitting
                  ? "cursor-not-allowed border-black/10 bg-[#F7F7F5] text-black/40"
                  : "border-black/15 focus:border-black"
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-black">
              分组 <span className="text-[#C73B31]">*</span>
            </label>
            <select
              value={form.account_group}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  account_group: e.target.value as AccountGroup,
                }))
              }
              disabled={isSubmitting}
              className="w-full rounded-[20px] border border-black/15 px-4 py-3 text-sm transition focus:border-black focus:outline-none disabled:cursor-not-allowed disabled:bg-[#F7F7F5]"
            >
              {ACCOUNT_GROUP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-black">
              头像 URL
            </label>
            <input
              type="text"
              value={form.avatar_url}
              onChange={(e) =>
                setForm((f) => ({ ...f, avatar_url: e.target.value }))
              }
              placeholder="https://example.com/avatar.jpg（可选）"
              disabled={isSubmitting}
              className={`w-full rounded-[20px] border px-4 py-3 text-sm transition focus:outline-none ${
                isSubmitting
                  ? "cursor-not-allowed border-black/10 bg-[#F7F7F5] text-black/40"
                  : "border-black/15 focus:border-black"
              }`}
            />
            <p className="text-xs text-black/45">
              支持HTTP/HTTPS链接（可选）
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-black">
              粉丝数
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={form.followers_count}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d]/g, "");
                setForm((f) => ({ ...f, followers_count: value }));
              }}
              placeholder="输入粉丝数量（可选）"
              disabled={isSubmitting}
              className={`w-full rounded-[20px] border px-4 py-3 text-sm transition focus:outline-none ${
                isSubmitting
                  ? "cursor-not-allowed border-black/10 bg-[#F7F7F5] text-black/40"
                  : "border-black/15 focus:border-black"
              }`}
            />
          </div>

          {error && (
            <div className="rounded-[20px] border border-[#F3D5BE] bg-[#FFF7F0] px-4 py-3 text-sm text-[#9A3412]">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 rounded-[20px] border border-black/10 px-4 py-3 text-sm text-black/65 transition hover:border-black/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!isFormFilled || isSubmitting}
              className={`flex-1 rounded-[20px] px-4 py-3 text-sm transition ${
                isFormFilled && !isSubmitting
                  ? "bg-black text-white hover:bg-black/80"
                  : "cursor-not-allowed bg-black/20 text-white"
              }`}
            >
              {isSubmitting ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <section className="space-y-8">
      <header className="space-y-4 border-b border-black/10 pb-6">
        <div className="h-4 w-40 animate-pulse rounded bg-[#F7F7F5]" />
        <div className="h-8 w-56 animate-pulse rounded bg-[#F7F7F5]" />
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-[24px] bg-[#F7F7F5]"
          />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-[28px] bg-[#F7F7F5]" />
    </section>
  );
}

export default function SettingsAccountsPage() {
  const [brandId, setBrandId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<AccountsGrouped>({
    自有矩阵: [],
    竞品矩阵: [],
    合作KOL: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmModalState>({
    isOpen: false,
    mode: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [pageSize] = useState(20);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const showToast = useCallback(
    (message: string, type: Toast["type"]) => {
      setToast({ message, type });
    },
    [],
  );

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const fetchAccounts = useCallback(async (page: number = 1) => {
    if (!brandId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result: PaginatedAccounts = await getAccountsPaginated(
        brandId,
        page,
        pageSize,
      );
      const allAccounts = result.data;
      setTotalAccounts(result.total);
      setCurrentPage(page);

      setAccounts({
        自有矩阵: allAccounts.filter((a) => a.account_group === "自有矩阵"),
        竞品矩阵: allAccounts.filter((a) => a.account_group === "竞品矩阵"),
        合作KOL: allAccounts.filter((a) => a.account_group === "合作KOL"),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "获取账号数据失败，请稍后重试",
      );
    } finally {
      setIsLoading(false);
    }
  }, [brandId, pageSize]);

  const loadInitialData = useCallback(async () => {
    setIsInitialLoading(true);
    const id = await getBrandIdForBrowser();
    if (!id) {
      showToast("未检测到登录用户", "error");
      setIsInitialLoading(false);
      return;
    }
    setBrandId(id);
  }, [showToast]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (brandId) {
      void fetchAccounts(currentPage);
    }
  }, [brandId, fetchAccounts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredAccounts = useMemo(() => {
    const result: AccountsGrouped = {
      自有矩阵: [],
      竞品矩阵: [],
      合作KOL: [],
    };

    const groups: AccountGroup[] = ["自有矩阵", "竞品矩阵", "合作KOL"];

    for (const group of groups) {
      const filtered = accounts[group].filter((account) => {
        if (!debouncedSearchQuery.trim()) {
          return true;
        }

        const query = debouncedSearchQuery.toLowerCase();
        const matchNickname = account.nickname
          .toLowerCase()
          .includes(query);
        const matchUserId = account.xhs_user_id.toLowerCase().includes(query);

        return matchNickname || matchUserId;
      });

      result[group] = filtered;
    }

    return result;
  }, [accounts, debouncedSearchQuery]);

  const totalAccountCount = useMemo(() => {
    return Object.values(accounts).reduce(
      (sum, group) => sum + group.length,
      0,
    );
  }, [accounts]);

  const filteredAccountCount = useMemo(() => {
    return Object.values(filteredAccounts).reduce(
      (sum, group) => sum + group.length,
      0,
    );
  }, [filteredAccounts]);

  const handleAddAccount = async (formData: AccountFormData) => {
    if (!brandId) return;

    setIsSubmitting(true);

    try {
      await createAccountApi(brandId, {
        xhs_user_id: formData.xhs_user_id.trim(),
        nickname: formData.nickname.trim(),
        avatar_url: formData.avatar_url.trim() || null,
        followers_count: formData.followers_count
          ? parseInt(formData.followers_count, 10)
          : null,
        account_group: formData.account_group,
      });

      setModalMode(null);
      showToast("账号添加成功", "success");
      void fetchAccounts();
    } catch {
      showToast("添加账号失败，请稍后重试", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAccount = async (formData: AccountFormData) => {
    if (!editingAccount) return;

    setIsSubmitting(true);

    try {
      await updateAccountApi(editingAccount.id, {
        nickname: formData.nickname.trim(),
        avatar_url: formData.avatar_url.trim() || null,
        followers_count: formData.followers_count
          ? parseInt(formData.followers_count, 10)
          : null,
        account_group: formData.account_group,
      });

      setModalMode(null);
      setEditingAccount(null);
      showToast("账号更新成功", "success");
      void fetchAccounts();
    } catch {
      showToast("更新账号失败，请稍后重试", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirmState.item) return;

    setIsSubmitting(true);

    try {
      await deleteAccountApi(confirmState.item.id);

      setConfirmState({ isOpen: false, mode: null });
      showToast("账号已删除", "success");
      void fetchAccounts();
    } catch {
      showToast("删除账号失败，请稍后重试", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = (hasChanges: boolean) => {
    if (hasChanges) {
      setConfirmState({ isOpen: true, mode: "unsaved" });
    } else {
      setModalMode(null);
      setEditingAccount(null);
    }
  };

  const getGroupSummary = (groupAccounts: Account[]) => ({
    count: groupAccounts.length,
    totalFollowers: groupAccounts.reduce(
      (sum, a) => sum + (a.followers_count ?? 0),
      0,
    ),
  });

  if (isInitialLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <section className="space-y-8">
      <header className="space-y-4 border-b border-black/10 pb-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-black/45">
          <Link href="/settings" className="transition hover:text-black">
            Settings
          </Link>
          <span>/</span>
          <span>账号矩阵管理</span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-[#111111] sm:text-4xl">
              账号矩阵管理
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-black/60">
              用于梳理品牌自有账号、竞品账号与 KOL 合作关系的矩阵管理模块。支持账号的增删改查与分组调整。
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalMode("add")}
            className="inline-flex w-fit items-center justify-center border border-black px-5 py-3 text-sm text-black transition hover:bg-black hover:text-white"
          >
            + 添加账号
          </button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {(["自有矩阵", "竞品矩阵", "合作KOL"] as AccountGroup[]).map(
          (group) => {
            const summary = getGroupSummary(accounts[group]);
            return (
              <GroupSummaryCard
                key={group}
                label={group}
                count={summary.count}
                totalFollowers={summary.totalFollowers}
              />
            );
          },
        )}
      </section>

      <article className="rounded-[28px] bg-white shadow-sm shadow-black/[0.03]">
        <div className="flex flex-col gap-4 border-b border-black/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索账号昵称或小红书号..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-[20px] border border-black/10 bg-white px-4 py-3 pl-10 text-sm text-black placeholder:text-black/40 outline-none transition focus:border-black sm:w-64"
              />
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  !searchQuery.trim()
                    ? "border-black bg-black text-white"
                    : "border-black/10 text-black/55 hover:border-black hover:text-black"
                }`}
              >
                全部 ({totalAccountCount})
              </button>
              {(["自有矩阵", "竞品矩阵", "合作KOL"] as AccountGroup[]).map(
                (group) => (
                  <button
                    key={group}
                    type="button"
                    className="rounded-full border border-black/10 px-3 py-1.5 text-xs text-black/55 transition hover:border-black hover:text-black"
                  >
                    {group} ({accounts[group].length})
                  </button>
                ),
              )}
            </div>
          </div>

          {(debouncedSearchQuery.trim() || error) && (
            <p className="text-sm text-black/45">
              {error
                ? error
                : `找到 ${filteredAccountCount} 个匹配结果`}
            </p>
          )}
        </div>

        {error ? (
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-[#9A3412]">{error}</span>
            <button
              type="button"
              onClick={() => void fetchAccounts()}
              className="rounded-full border border-[#9A3412] px-4 py-2 text-xs text-[#9A3412] transition hover:bg-[#9A3412] hover:text-white"
            >
              重试
            </button>
          </div>
        ) : isLoading ? (
          <div className="divide-y divide-black/8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-5">
                <div className="h-10 w-10 animate-pulse rounded-full bg-black/10" />
                <div className="h-5 w-32 animate-pulse rounded bg-black/10" />
                <div className="h-5 w-24 animate-pulse rounded bg-black/10" />
                <div className="ml-auto h-8 w-16 animate-pulse rounded bg-black/10" />
              </div>
            ))}
          </div>
        ) : filteredAccountCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="space-y-3 text-center">
              <p className="text-lg font-semibold tracking-tight text-black">
                {debouncedSearchQuery.trim()
                  ? "未找到匹配的账号"
                  : "暂无账号数据"}
              </p>
              <p className="text-sm text-black/58">
                {debouncedSearchQuery.trim()
                  ? "请尝试其他搜索关键词"
                  : "点击上方「添加账号」按钮创建第一个账号"}
              </p>
              {!debouncedSearchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => setModalMode("add")}
                  className="mt-2 inline-flex items-center border border-black px-4 py-3 text-sm text-black transition hover:bg-black hover:text-white"
                >
                  添加账号
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-black/8">
            {(["自有矩阵", "竞品矩阵", "合作KOL"] as AccountGroup[]).map(
              (group) => {
                const groupAccounts = filteredAccounts[group];

                if (groupAccounts.length === 0) {
                  return null;
                }

                return (
                  <div key={group}>
                    <div className="border-b border-black/10 px-5 py-3">
                      <h2 className="text-base font-semibold tracking-tight text-black">
                        {group}
                        <span className="ml-2 text-sm font-normal text-black/45">
                          ({groupAccounts.length})
                        </span>
                      </h2>
                    </div>
                    {groupAccounts.map((account) => (
                      <AccountRow
                        key={account.id}
                        account={account}
                        onEdit={(acc) => {
                          setEditingAccount(acc);
                          setModalMode("edit");
                        }}
                        onDelete={(acc) => {
                          setConfirmState({
                            isOpen: true,
                            mode: "delete",
                            itemName: acc.nickname || acc.xhs_user_id,
                          });
                        }}
                      />
                    ))}
                  </div>
                );
              },
            )}
          </div>
        )}
      </article>

      {modalMode && (
        <AccountModal
          mode={modalMode}
          initialData={editingAccount}
          onClose={handleModalClose}
          onSubmit={
            modalMode === "add" ? handleAddAccount : handleEditAccount
          }
          isSubmitting={isSubmitting}
        />
      )}

      {confirmState.isOpen && (
        <ConfirmModal
          state={confirmState}
          onClose={() => {
            setConfirmState({ isOpen: false, mode: null });
          }}
          onConfirm={() => {
            if (confirmState.mode === "delete") {
              void handleDeleteAccount();
            } else if (confirmState.mode === "unsaved") {
              setConfirmState({ isOpen: false, mode: null });
              setModalMode(null);
              setEditingAccount(null);
            }
          }}
          isSubmitting={isSubmitting}
        />
      )}

      {totalAccounts > pageSize && (
        <div className="flex items-center justify-center gap-2 py-4">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-full border border-black/10 px-4 py-2 text-sm text-black/65 transition hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            上一页
          </button>
          <span className="text-sm text-black/55">
            第 {currentPage} / {Math.ceil(totalAccounts / pageSize)} 页
          </span>
          <button
            type="button"
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(Math.ceil(totalAccounts / pageSize), p + 1),
              )
            }
            disabled={
              currentPage >= Math.ceil(totalAccounts / pageSize)
            }
            className="rounded-full border border-black/10 px-4 py-2 text-sm text-black/65 transition hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            下一页
          </button>
        </div>
      )}

      {toast && <ToastMessage toast={toast} onDismiss={dismissToast} />}
    </section>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getBrandIdForBrowser } from "@/lib/auth/brands";
import { isValidDomain } from "@/lib/brands/validation";
import {
  type Competitor,
  getCompetitors,
  createCompetitor,
  updateCompetitor,
  deleteCompetitor,
  normalizeKeywords,
} from "@/lib/competitors/crud";
import { ToastMessage, type Toast } from "@/components/ui/toast";
import ConfirmModal from "@/components/ui/confirm-modal";
import { useDebounce } from "@/lib/hooks/use-debounce";
import type { ConfirmModalState, ModalMode } from "@/lib/shared/types";

type CompetitorFormData = {
  competitor_name: string;
  competitor_domain: string;
  keywords: string;
};

const EMPTY_FORM: CompetitorFormData = {
  competitor_name: "",
  competitor_domain: "",
  keywords: "",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CompetitorModal({
  mode,
  initialData,
  existingNames,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  mode: ModalMode;
  initialData: Competitor | null;
  existingNames: Set<string>;
  onClose: (hasChanges: boolean) => void;
  onSubmit: (data: CompetitorFormData) => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState<CompetitorFormData>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const initialFormRef = useRef<CompetitorFormData | null>(null);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      const normalizedKeywords = normalizeKeywords(initialData.keywords)?.join(", ") ?? "";
      const data: CompetitorFormData = {
        competitor_name: initialData.competitor_name,
        competitor_domain: initialData.competitor_domain ?? "",
        keywords: normalizedKeywords,
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
        ? form.competitor_name.trim() !== "" ||
          form.competitor_domain.trim() !== "" ||
          form.keywords.trim() !== ""
        : initialFormRef.current
          ? JSON.stringify(form) !== JSON.stringify(initialFormRef.current)
          : false;

    onClose(hasChanges);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.competitor_name.trim()) {
      setError("请填写竞品名称");
      return;
    }

    const trimmedName = form.competitor_name.trim();
    const isDuplicate =
      mode === "add" ||
      (initialData && initialData.competitor_name !== trimmedName);

    if (isDuplicate && existingNames.has(trimmedName.toLowerCase())) {
      setError("该竞品名称已存在，请使用其他名称");
      return;
    }

    if (form.competitor_domain.trim() && !isValidDomain(form.competitor_domain.trim())) {
      setError("域名格式不正确，请输入有效的域名，如 example.com");
      return;
    }

    onSubmit({
      competitor_name: trimmedName,
      competitor_domain: form.competitor_domain.trim() || "",
      keywords: form.keywords.trim(),
    });
  };

  const isValid = form.competitor_name.trim() !== "";

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
          {mode === "add" ? "添加竞品" : "编辑竞品"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-black">
              竞品名称 <span className="text-[#C73B31]">*</span>
            </label>
            <input
              type="text"
              value={form.competitor_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, competitor_name: e.target.value }))
              }
              placeholder="例如：小红书、抖音"
              disabled={isSubmitting}
              maxLength={200}
              className={`w-full rounded-[20px] border px-4 py-3 text-sm transition ${
                isSubmitting
                  ? "cursor-not-allowed border-black/10 bg-[#F7F7F5] text-black/40"
                  : "border-black/15 focus:border-black focus:outline-none"
              }`}
            />
            <p className="text-xs text-black/45">
              {form.competitor_name.length}/200
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-black">
              域名
            </label>
            <input
              type="text"
              value={form.competitor_domain}
              onChange={(e) =>
                setForm((f) => ({ ...f, competitor_domain: e.target.value }))
              }
              placeholder="例如：xiaohongshu.com（可选）"
              disabled={isSubmitting}
              className={`w-full rounded-[20px] border px-4 py-3 text-sm transition ${
                isSubmitting
                  ? "cursor-not-allowed border-black/10 bg-[#F7F7F5] text-black/40"
                  : "border-black/15 focus:border-black focus:outline-none"
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-black">
              关键词
            </label>
            <input
              type="text"
              value={form.keywords}
              onChange={(e) =>
                setForm((f) => ({ ...f, keywords: e.target.value }))
              }
              placeholder="多个关键词用逗号分隔（可选）"
              disabled={isSubmitting}
              maxLength={500}
              className={`w-full rounded-[20px] border px-4 py-3 text-sm transition ${
                isSubmitting
                  ? "cursor-not-allowed border-black/10 bg-[#F7F7F5] text-black/40"
                  : "border-black/15 focus:border-black focus:outline-none"
              }`}
            />
            <p className="text-xs text-black/45">
              {form.keywords.length}/500
            </p>
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
              className="flex-1 rounded-[20px] border border-black/10 px-4 py-3 text-sm text-black/65 transition hover:border-black/30"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`flex-1 rounded-[20px] px-4 py-3 text-sm transition ${
                isValid && !isSubmitting
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

export default function SettingsCompetitorsPage() {
  const [brandId, setBrandId] = useState<string | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmModalState>({
    isOpen: false,
    mode: null,
  });
  const [deletingCompetitor, setDeletingCompetitor] = useState<Competitor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const showToast = useCallback((message: string, type: Toast["type"]) => {
    setToast({ message, type });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const existingCompetitorNames = useMemo(() => {
    return new Set(
      competitors
        .filter((c) => c.id !== editingCompetitor?.id)
        .map((c) => c.competitor_name.toLowerCase()),
    );
  }, [competitors, editingCompetitor]);

  const fetchCompetitors = useCallback(async () => {
    if (!brandId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getCompetitors(brandId);
      setCompetitors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取竞品数据失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  }, [brandId]);

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
      void fetchCompetitors();
    }
  }, [brandId, fetchCompetitors]);

  const filteredCompetitors = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return competitors;

    const query = debouncedSearchQuery.toLowerCase();
    return competitors.filter(
      (c) =>
        c.competitor_name.toLowerCase().includes(query) ||
        (c.competitor_domain?.toLowerCase().includes(query) ?? false),
    );
  }, [competitors, debouncedSearchQuery]);

  const handleAddCompetitor = async (formData: CompetitorFormData) => {
    if (isSubmitting) return;
    if (!brandId) return;

    setIsSubmitting(true);

    try {
      const keywordsArray = formData.keywords?.trim() || undefined;
      await createCompetitor(brandId, {
        competitor_name: formData.competitor_name.trim(),
        competitor_domain: formData.competitor_domain.trim() || null,
        keywords: keywordsArray,
      });

      setModalMode(null);
      showToast("竞品添加成功", "success");
      void fetchCompetitors();
    } catch {
      showToast("添加竞品失败，请稍后重试", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCompetitor = async (formData: CompetitorFormData) => {
    if (isSubmitting) return;
    if (!editingCompetitor) return;

    setIsSubmitting(true);

    try {
      const keywordsArray = formData.keywords?.trim() || undefined;
      await updateCompetitor(editingCompetitor.id, {
        competitor_name: formData.competitor_name.trim(),
        competitor_domain: formData.competitor_domain.trim() || null,
        keywords: keywordsArray,
      });

      setModalMode(null);
      setEditingCompetitor(null);
      showToast("竞品更新成功", "success");
      void fetchCompetitors();
    } catch {
      showToast("更新竞品失败，请稍后重试", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompetitor = async () => {
    if (isSubmitting) return;
    if (!deletingCompetitor) return;

    setIsSubmitting(true);

    try {
      await deleteCompetitor(deletingCompetitor.id);

      setConfirmState({ isOpen: false, mode: null });
      showToast("竞品已删除", "success");
      void fetchCompetitors();
    } catch {
      showToast("删除竞品失败，请稍后重试", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = (hasChanges: boolean) => {
    if (hasChanges) {
      setConfirmState({ isOpen: true, mode: "unsaved" });
    } else {
      setModalMode(null);
      setEditingCompetitor(null);
    }
  };

  if (isInitialLoading) {
    return (
      <section className="space-y-8">
        <header className="space-y-4 border-b border-black/10 pb-6">
          <div className="h-4 w-32 animate-pulse rounded bg-[#F7F7F5]" />
          <div className="h-8 w-48 animate-pulse rounded bg-[#F7F7F5]" />
        </header>
        <div className="h-64 animate-pulse rounded-[28px] bg-[#F7F7F5]" />
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <header className="space-y-4 border-b border-black/10 pb-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-black/45">
          <Link href="/settings" className="transition hover:text-black">
            Settings
          </Link>
          <span>/</span>
          <span>竞品管理</span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-[#111111] sm:text-4xl">
              竞品管理
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-black/60">
              管理你的竞品信息，跟踪竞品动态和关键词策略。
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalMode("add")}
            className="inline-flex w-fit items-center justify-center border border-black px-5 py-3 text-sm text-black transition hover:bg-black hover:text-white"
          >
            + 添加竞品
          </button>
        </div>
      </header>

      <article className="rounded-[28px] bg-white shadow-sm shadow-black/[0.03]">
        <div className="flex flex-col gap-4 border-b border-black/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="搜索竞品名称或域名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-[20px] border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none transition focus:border-black sm:max-w-[280px]"
            />
          </div>
          <p className="text-sm text-black/45">
            共 {filteredCompetitors.length} 个竞品
          </p>
        </div>

        {error ? (
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-[#9A3412]">{error}</span>
            <button
              type="button"
              onClick={() => void fetchCompetitors()}
              className="rounded-full border border-[#9A3412] px-4 py-2 text-xs text-[#9A3412] transition hover:bg-[#9A3412] hover:text-white"
            >
              重试
            </button>
          </div>
        ) : isLoading ? (
          <div className="divide-y divide-black/8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-5">
                <div className="h-5 w-32 animate-pulse rounded bg-black/10" />
                <div className="h-5 w-40 animate-pulse rounded bg-black/10" />
                <div className="h-5 w-24 animate-pulse rounded bg-black/10" />
                <div className="h-5 w-36 animate-pulse rounded bg-black/10" />
              </div>
            ))}
          </div>
        ) : filteredCompetitors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="space-y-3 text-center">
              <p className="text-lg font-semibold tracking-tight text-black">
                {searchQuery ? "未找到匹配的竞品" : "暂无竞品数据"}
              </p>
              <p className="text-sm text-black/58">
                {searchQuery
                  ? "请尝试其他搜索关键词"
                  : "点击上方「添加竞品」按钮创建第一个竞品"}
              </p>
              {!searchQuery && (
                <button
                  type="button"
                  onClick={() => setModalMode("add")}
                  className="mt-2 inline-flex items-center border border-black px-4 py-3 text-sm text-black transition hover:bg-black hover:text-white"
                >
                  添加竞品
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-black/8">
            {filteredCompetitors.map((competitor) => (
              <div
                key={competitor.id}
                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-black/[0.02]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-black">
                    {competitor.competitor_name}
                  </p>
                  <p className="truncate text-xs text-black/45">
                    {competitor.competitor_domain || "无域名"}
                  </p>
                </div>
                <div className="hidden min-w-0 flex-1 sm:block">
                  {competitor.keywords && competitor.keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {competitor.keywords.slice(0, 3).map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full border border-black/10 px-2 py-0.5 text-xs text-black/62"
                        >
                          {keyword}
                        </span>
                      ))}
                      {competitor.keywords.length > 3 && (
                        <span className="inline-flex items-center text-xs text-black/45">
                          +{competitor.keywords.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-black/30">无关键词</span>
                  )}
                </div>
                <div className="hidden text-xs text-black/45 sm:block">
                  {formatDate(competitor.created_at)}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCompetitor(competitor);
                      setModalMode("edit");
                    }}
                    className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/65 transition hover:border-black hover:text-black"
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingCompetitor(competitor);
                      setConfirmState({
                        isOpen: true,
                        mode: "delete",
                        itemName: competitor.competitor_name,
                      });
                    }}
                    className="rounded-full border border-[#F3D5BE] bg-[#FFF7F0] px-3 py-1 text-xs text-[#9A3412] transition hover:border-[#C73B31] hover:bg-[#FFF0EF] hover:text-[#C73B31]"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>

      {modalMode && (
        <CompetitorModal
          mode={modalMode}
          initialData={editingCompetitor}
          existingNames={existingCompetitorNames}
          onClose={handleModalClose}
          onSubmit={modalMode === "add" ? handleAddCompetitor : handleEditCompetitor}
          isSubmitting={isSubmitting}
        />
      )}

      {confirmState.isOpen && (
        <ConfirmModal
          state={confirmState}
          onClose={() => {
            setConfirmState({ isOpen: false, mode: null });
            setDeletingCompetitor(null);
          }}
          onConfirm={() => {
            if (confirmState.mode === "delete") {
              void handleDeleteCompetitor();
            } else if (confirmState.mode === "unsaved") {
              setConfirmState({ isOpen: false, mode: null });
              setModalMode(null);
              setEditingCompetitor(null);
            }
          }}
          isSubmitting={isSubmitting}
        />
      )}

      {toast && <ToastMessage toast={toast} onDismiss={dismissToast} />}
    </section>
  );
}
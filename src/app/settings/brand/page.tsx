"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  type BrandFormData,
  type FieldErrors,
  type StatusState,
} from "@/lib/brands/types";
import {
  isValidUrl,
  validateBrandName,
  validateDomain,
  validateLogoUrl,
} from "@/lib/brands/validation";

const STATUS_TONE_MAP: Record<StatusState, string> = {
  idle: "border-black/10 bg-[#F7F7F5] text-black/62",
  loading: "border-black/10 bg-[#F7F7F5] text-black/62",
  saving: "border-black/10 bg-[#F7F7F5] text-black/62",
  success: "border-[#CFE8D6] bg-[#F3FBF5] text-[#166534]",
  error: "border-[#F3D5BE] bg-[#FFF7F0] text-[#9A3412]",
};

export default function BrandSettingsPage() {
  const supabaseRef = useRef(createSupabaseBrowserClient());
  const supabase = supabaseRef.current;

  const [status, setStatus] = useState<StatusState>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [error, setError] = useState<FieldErrors>({});
  const [brandId, setBrandId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [lastRemovedKeyword, setLastRemovedKeyword] = useState<string | null>(null);

  const [formData, setFormData] = useState<BrandFormData>({
    name: "",
    domain: "",
    keywords: [],
    logo_url: "",
  });

  const [keywordInput, setKeywordInput] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLogoPreviewLoading, setIsLogoPreviewLoading] = useState(false);

  const fetchBrandData = useCallback(async (uid: string) => {
    setStatus("loading");
    setStatusMessage("正在加载品牌数据，请稍候...");
    setError({});

    try {
      const { data: userBrand, error: userBrandError } = await supabase
        .from("user_brands")
        .select("brand_id")
        .eq("user_id", uid)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (userBrandError) {
        throw new Error(`加载用户品牌关联失败: ${userBrandError.message}`);
      }

      const currentBrandId = userBrand?.brand_id ?? uid;
      setBrandId(currentBrandId);

      const { data: brand, error: brandError } = await supabase
        .from("brands")
        .select("name, domain, keywords, logo_url")
        .eq("id", currentBrandId)
        .maybeSingle();

      if (brandError) {
        throw new Error(`加载品牌数据失败: ${brandError.message}`);
      }

      if (brand) {
        setFormData({
          name: brand.name ?? "",
          domain: brand.domain ?? "",
          keywords: Array.isArray(brand.keywords) ? brand.keywords : [],
          logo_url: brand.logo_url ?? "",
        });

        if (brand.logo_url) {
          setLogoPreview(brand.logo_url);
        }

        setStatus("idle");
        setStatusMessage("请填写品牌信息后保存。");
      } else {
        setStatus("idle");
        setStatusMessage("尚未设置品牌信息，请填写并保存。");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载品牌数据失败，请稍后重试。";
      setStatus("error");
      setStatusMessage(message);
      console.error("Failed to fetch brand data:", err);
    }
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (user) {
        setUserId(user.id);
        void fetchBrandData(user.id);
      } else {
        setStatus("error");
        setStatusMessage("无法获取用户信息，请先登录。");
      }
    }

    void getUser();

    return () => {
      isMounted = false;
    };
  }, [fetchBrandData, supabase.auth]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FieldErrors = {};

    const nameError = validateBrandName(formData.name);
    if (nameError) {
      newErrors.name = nameError;
    }

    const domainError = validateDomain(formData.domain);
    if (domainError) {
      newErrors.domain = domainError;
    }

    const logoUrlError = validateLogoUrl(formData.logo_url);
    if (logoUrlError) {
      newErrors.logo_url = logoUrlError;
    }

    setError(newErrors);

    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = (field: keyof BrandFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setStatus("idle");
    setStatusMessage("请保存更改。");

    if (field === "logo_url") {
      setLogoPreview(value.trim() || null);
    }

    const fieldKey = field as keyof FieldErrors;
    if (fieldKey in error && error[fieldKey]) {
      setError((prev) => ({ ...prev, [fieldKey]: undefined }));
    }
  };

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();

    if (!trimmed) {
      return;
    }

    if (formData.keywords.includes(trimmed)) {
      setStatus("error");
      setStatusMessage(`关键词 "${trimmed}" 已存在，请勿重复添加。`);

      return;
    }

    if (trimmed.length > 50) {
      setStatus("error");
      setStatusMessage("单个关键词不能超过 50 个字符。");

      return;
    }

    if (formData.keywords.length >= 20) {
      setStatus("error");
      setStatusMessage("关键词数量已达上限（20个），请删除部分关键词后再添加。");

      return;
    }

    setFormData((prev) => ({
      ...prev,
      keywords: [...prev.keywords, trimmed],
    }));
    setKeywordInput("");
    setStatus("idle");
    setStatusMessage("关键词已添加，请保存更改。");
    setLastRemovedKeyword(null);
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keywordToRemove),
    }));
    setLastRemovedKeyword(keywordToRemove);
    setStatus("success");
    setStatusMessage(`已移除关键词 "${keywordToRemove}"，可撤销或保存更改。`);
  };

  const handleUndoRemoveKeyword = () => {
    if (!lastRemovedKeyword || formData.keywords.includes(lastRemovedKeyword)) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      keywords: [...prev.keywords, lastRemovedKeyword],
    }));
    setLastRemovedKeyword(null);
    setStatus("idle");
    setStatusMessage("已撤销删除操作。");
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      void handleAddKeyword();
    }
  };

  const handleLogoUrlBlur = () => {
    const url = formData.logo_url.trim();

    if (!url) {
      setLogoPreview(null);

      return;
    }

    if (!isValidUrl(url)) {
      setError((prev) => ({
        ...prev,
        logo_url: "Logo URL 格式不正确，请输入有效的 HTTP/HTTPS URL。",
      }));

      return;
    }

    setIsLogoPreviewLoading(true);
    const img = new Image();

    img.onload = () => {
      if (formData.logo_url.trim() === url) {
        setLogoPreview(url);
      }

      setIsLogoPreviewLoading(false);
    };

    img.onerror = () => {
      if (formData.logo_url.trim() === url) {
        setLogoPreview(null);
        setError((prev) => ({
          ...prev,
          logo_url: "Logo URL 无法访问，请检查链接是否有效。",
        }));
      }

      setIsLogoPreviewLoading(false);
    };

    img.src = url;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!userId || !brandId) {
      setStatus("error");
      setStatusMessage("用户信息不完整，无法保存。请刷新页面后重试。");

      return;
    }

    setStatus("saving");
    setStatusMessage("正在保存品牌设置，请勿关闭页面...");

    try {
      const { error: upsertError } = await supabase
        .from("brands")
        .upsert(
          {
            id: brandId,
            name: formData.name.trim(),
            domain: formData.domain.trim() || null,
            keywords: formData.keywords,
            logo_url: formData.logo_url.trim() || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );

      if (upsertError) {
        throw new Error(`保存失败: ${upsertError.message}`);
      }

      setStatus("success");
      setStatusMessage("品牌设置已保存成功。");
      setLastRemovedKeyword(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "保存失败，请稍后重试。";
      setStatus("error");
      setStatusMessage(message);
      console.error("Failed to save brand:", err);
    }
  };

  const isFormDisabled = status === "loading" || status === "saving";

  return (
    <section className="space-y-8">
      <header className="space-y-4 border-b border-black/10 pb-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-black/45">
          <Link href="/settings" className="transition hover:text-black">
            Settings
          </Link>
          <span>/</span>
          <span>Brand</span>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-[#111111] sm:text-4xl">
            品牌设置
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-black/60 sm:text-base">
            管理品牌基本信息、域名与关键词设置。保存后将立即更新品牌配置。
          </p>
        </div>
        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-3xl text-sm leading-7 text-black/55">
            品牌设置用于 GEO 策略分析、数据归属与竞品对比。
          </p>
          <Link
            href="/settings"
            className="inline-flex w-fit items-center border border-black/10 px-4 py-3 text-sm text-black/65 transition hover:border-black hover:text-black"
          >
            返回设置总览
          </Link>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <article className="rounded-[32px] bg-white p-6 shadow-sm shadow-black/[0.04] sm:p-8">
          <div className="space-y-2 border-b border-black/10 pb-5">
            <p className="text-xs uppercase tracking-[0.22em] text-black/40">
              Brand Information
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">基本信息</h2>
          </div>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="brand-name"
                className="text-sm font-medium text-black"
              >
                品牌名称 <span className="text-[#9A3412]">*</span>
              </label>
              <input
                id="brand-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="请输入品牌名称"
                disabled={isFormDisabled}
                maxLength={100}
                className={`w-full rounded-[20px] border px-5 py-4 text-sm text-black transition placeholder:text-black/35 ${
                  isFormDisabled
                    ? "cursor-not-allowed bg-[#F7F7F5] text-black/35"
                    : error.name
                      ? "border-[#F3D5BE] bg-[#FFF7F0] focus:border-[#9A3412] focus:outline-none"
                      : "border-black/10 bg-[#FCFCFB] focus:border-black focus:outline-none"
                }`}
              />
              {error.name && (
                <div className="mt-2 rounded-[20px] border border-[#F3D5BE] bg-[#FFF7F0] px-4 py-3 text-xs text-[#9A3412]">
                  {error.name}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="brand-domain"
                className="text-sm font-medium text-black"
              >
                品牌域名
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-sm text-black/35">
                  https://
                </span>
                <input
                  id="brand-domain"
                  type="text"
                  value={formData.domain}
                  onChange={(e) => handleInputChange("domain", e.target.value)}
                  placeholder="example.com"
                  disabled={isFormDisabled}
                  className={`w-full rounded-[20px] border px-5 py-4 pl-[4.5rem] text-sm text-black transition placeholder:text-black/35 ${
                    isFormDisabled
                      ? "cursor-not-allowed bg-[#F7F7F5] text-black/35"
                      : error.domain
                        ? "border-[#F3D5BE] bg-[#FFF7F0] focus:border-[#9A3412] focus:outline-none"
                        : "border-black/10 bg-[#FCFCFB] focus:border-black focus:outline-none"
                  }`}
                />
              </div>
              {error.domain && (
                <div className="mt-2 rounded-[20px] border border-[#F3D5BE] bg-[#FFF7F0] px-4 py-3 text-xs text-[#9A3412]">
                  {error.domain}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="brand-keywords"
                className="text-sm font-medium text-black"
              >
                品牌关键词
              </label>
              <div className="flex gap-2">
                <input
                  id="brand-keywords"
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeywordKeyDown}
                  placeholder="输入关键词后按回车添加"
                  disabled={isFormDisabled}
                  className="flex-1 rounded-[20px] border border-black/10 bg-[#FCFCFB] px-5 py-4 text-sm text-black transition placeholder:text-black/35 focus:border-black focus:outline-none disabled:cursor-not-allowed disabled:bg-[#F7F7F5] disabled:text-black/35"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  disabled={isFormDisabled || !keywordInput.trim()}
                  className="inline-flex w-fit items-center justify-center rounded-[20px] border border-black px-4 py-3 text-sm text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-black/10 disabled:bg-[#F7F7F5] disabled:text-black/35"
                >
                  添加
                </button>
              </div>
              {formData.keywords.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#F7F7F5] px-3 py-1.5 text-sm text-black/65"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(keyword)}
                          disabled={isFormDisabled}
                          className="text-black/45 transition hover:text-[#C73B31] disabled:cursor-not-allowed disabled:text-black/25"
                          aria-label={`删除关键词 ${keyword}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  {lastRemovedKeyword && !formData.keywords.includes(lastRemovedKeyword) && (
                    <div className="flex items-center gap-3 rounded-[20px] border border-[#CFE8D6] bg-[#F3FBF5] px-4 py-3">
                      <p className="text-xs text-[#166534]">
                        已删除「{lastRemovedKeyword}」
                      </p>
                      <button
                        type="button"
                        onClick={handleUndoRemoveKeyword}
                        disabled={isFormDisabled}
                        className="text-xs font-medium text-[#166534] underline underline-offset-2 transition hover:text-[#14532d] disabled:no-underline disabled:cursor-not-allowed disabled:text-black/30"
                      >
                        撤销
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-black/45">
                  添加品牌相关关键词，用于 GEO 分析与竞品对比（最多 20 个）
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="brand-logo"
                className="text-sm font-medium text-black"
              >
                Logo URL
              </label>
              <input
                id="brand-logo"
                type="url"
                value={formData.logo_url}
                onChange={(e) => handleInputChange("logo_url", e.target.value)}
                onBlur={handleLogoUrlBlur}
                placeholder="https://example.com/logo.png"
                disabled={isFormDisabled}
                className={`w-full rounded-[20px] border px-5 py-4 text-sm text-black transition placeholder:text-black/35 ${
                  isFormDisabled
                    ? "cursor-not-allowed bg-[#F7F7F5] text-black/35"
                    : error.logo_url
                      ? "border-[#F3D5BE] bg-[#FFF7F0] focus:border-[#9A3412] focus:outline-none"
                      : "border-black/10 bg-[#FCFCFB] focus:border-black focus:outline-none"
                }`}
              />
              {error.logo_url && (
                <div className="mt-2 rounded-[20px] border border-[#F3D5BE] bg-[#FFF7F0] px-4 py-3 text-xs text-[#9A3412]">
                  {error.logo_url}
                </div>
              )}
              {logoPreview && !error.logo_url && (
                <div className="mt-3 hidden rounded-[20px] border border-black/8 p-4 lg:block">
                  <p className="mb-3 text-xs uppercase tracking-[0.16em] text-black/40">
                    Logo 预览
                  </p>
                  <div className="flex items-center justify-center rounded-[16px] bg-[#F7F7F5] px-4 py-6">
                    {isLogoPreviewLoading ? (
                      <div className="h-12 w-12 animate-pulse rounded-full bg-black/10" />
                    ) : (
                      <img
                        src={logoPreview}
                        alt="Logo 预览"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        className="max-h-20 max-w-full object-contain"
                        onError={() => setLogoPreview(null)}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={`rounded-[24px] border px-5 py-4 text-sm leading-7 ${STATUS_TONE_MAP[status]}`}>
              {statusMessage || "请填写品牌信息后保存。"}
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={isFormDisabled}
              className={`inline-flex w-fit items-center justify-center rounded-[24px] border px-6 py-3 text-sm font-medium transition ${
                isFormDisabled
                  ? "cursor-not-allowed border-black/10 bg-[#F7F7F5] text-black/35"
                  : "border-black text-black hover:bg-black hover:text-white"
              }`}
            >
              {status === "saving" ? "保存中..." : "保存设置"}
            </button>
          </div>
        </article>

        <aside className="space-y-6">
          <article className="rounded-[32px] bg-white p-6 shadow-sm shadow-black/[0.04] sm:p-8">
            <div className="space-y-2 border-b border-black/10 pb-5">
              <p className="text-xs uppercase tracking-[0.22em] text-black/40">
                Current Status
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">当前配置</h2>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] border border-black/8 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-black/38">
                  品牌 ID
                </p>
                <p className="mt-2 break-all text-sm font-medium text-black">
                  {brandId ?? "—"}
                </p>
              </div>

              <div className="rounded-[24px] border border-black/8 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-black/38">
                  关键词数量
                </p>
                <p className="mt-2 text-2xl font-semibold text-black">
                  {formData.keywords.length}
                  <span className="ml-1 text-sm font-normal text-black/45">/ 20</span>
                </p>
              </div>

              <div className="rounded-[24px] border border-black/8 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-black/38">
                  域名状态
                </p>
                <p className="mt-2 text-sm font-medium text-black">
                  {formData.domain.trim() ? (
                    <span className="text-[#166534]">已设置</span>
                  ) : (
                    <span className="text-black/45">未设置</span>
                  )}
                </p>
              </div>

              <div className="rounded-[24px] border border-black/8 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-black/38">
                  Logo 状态
                </p>
                <p className="mt-2 text-sm font-medium text-black">
                  {formData.logo_url.trim() ? (
                    logoPreview ? (
                      <span className="text-[#166534]">已设置</span>
                    ) : (
                      <span className="text-[#9A3412]">URL 无效</span>
                    )
                  ) : (
                    <span className="text-black/45">未设置</span>
                  )}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[32px] bg-white p-6 shadow-sm shadow-black/[0.04] sm:p-8">
            <div className="space-y-2 border-b border-black/10 pb-5">
              <p className="text-xs uppercase tracking-[0.22em] text-black/40">
                About Brand Settings
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">说明</h2>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] bg-[#F7F7F5] px-5 py-4 text-sm leading-7 text-black/65">
                品牌名称用于 GEO 分析中的数据归属与报告标题。
              </div>
              <div className="rounded-[24px] bg-[#F7F7F5] px-5 py-4 text-sm leading-7 text-black/65">
                域名用于识别品牌官方网站，辅助竞品分析与引用来源验证。
              </div>
              <div className="rounded-[24px] bg-[#F7F7F5] px-5 py-4 text-sm leading-7 text-black/65">
                关键词用于 GEO 策略分析与竞品内容对比，支持多维度标签管理。
              </div>
              <div className="rounded-[24px] bg-[#F7F7F5] px-5 py-4 text-sm leading-7 text-black/65">
                Logo 用于报告和导出文件的品牌标识展示。
              </div>
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}

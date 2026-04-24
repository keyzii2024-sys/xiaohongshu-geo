"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthMode = "login" | "signup";

function getAuthErrorMessage(error: unknown) {
  const message =
    error instanceof Error ? error.message : "操作失败，请稍后重试。";

  switch (message) {
    case "Invalid login credentials":
      return "邮箱或密码错误，请确认后重试。";
    case "User already registered":
      return "该邮箱已注册，请直接登录。";
    case "email rate limit exceeded":
      return "当前注册过于频繁，请稍后再试或完成邮箱确认后再登录。";
    default:
      return message;
  }
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFeedback("");
    setErrorMessage("");

    if (mode === "signup" && password !== confirmPassword) {
      setErrorMessage("两次输入的密码不一致。");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        setFeedback("登录成功，正在进入仪表盘。");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        if (!data.session) {
          setFeedback("注册成功！如果项目启用了邮箱确认，请先完成确认后再登录。");
          return;
        }

        setFeedback("注册成功，正在进入仪表盘。");
      }

      router.replace(nextPath);
      router.refresh();
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-10 flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setFeedback("");
            setErrorMessage("");
          }}
          className={`border px-4 py-2 transition ${
            mode === "login"
              ? "border-black text-black"
              : "border-black/10 text-black/55"
          }`}
        >
          登录
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setFeedback("");
            setErrorMessage("");
          }}
          className={`border px-4 py-2 transition ${
            mode === "signup"
              ? "border-black text-black"
              : "border-black/10 text-black/55"
          }`}
        >
          注册
        </button>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {mode === "login" && (
          <div className="space-y-3">
            <button
              type="button"
              className="relative flex h-12 w-full items-center justify-center gap-3 rounded-full border border-black/10 bg-white text-sm font-medium text-black/85 transition hover:border-black/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <GoogleIcon />
              <span>使用 Google 继续</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="h-px flex-1 bg-black/10" />
              <span className="px-3 text-xs text-black/40">或</span>
              <div className="h-px flex-1 bg-black/10" />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm text-black/70" htmlFor="email">
            邮箱
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 w-full border border-black/10 bg-white px-4 text-base outline-none transition focus:border-black"
            placeholder="name@example.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-black/70" htmlFor="password">
            密码
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 w-full border border-black/10 bg-white px-4 pr-12 text-base outline-none transition focus:border-black"
              placeholder="至少 6 位"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 transition hover:text-black/70"
              tabIndex={-1}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        {mode === "signup" ? (
          <div className="space-y-2">
            <label className="text-sm text-black/70" htmlFor="confirm-password">
              确认密码
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-12 w-full border border-black/10 bg-white px-4 pr-12 text-base outline-none transition focus:border-black"
                placeholder="再次输入密码"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 transition hover:text-black/70"
                tabIndex={-1}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>
        ) : null}

        {errorMessage ? (
          <p className="text-sm leading-6 text-[#B42318]">{errorMessage}</p>
        ) : null}

        {feedback ? (
          <p className="text-sm leading-6 text-black/65">{feedback}</p>
        ) : null}

        {mode === "login" && (
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-5 w-5 rounded border-black/20 accent-black"
            />
            <span className="text-sm text-black/70">
              记住登录状态（30天内免登录）
            </span>
          </label>
        )}

        {mode === "signup" && (
          <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-medium">注册说明：</p>
            <ul className="mt-2 space-y-1 text-blue-700">
              <li>• 注册成功后可直接登录</li>
              <li>• 如启用邮箱验证，请先完成验证</li>
              <li>• 支持任意有效邮箱（QQ、163、Gmail等）</li>
            </ul>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 w-full items-center justify-center border border-black bg-black px-4 text-sm font-medium text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-black/10 disabled:bg-black/15 disabled:text-black/40"
        >
          {isSubmitting
            ? "提交中..."
            : mode === "login"
              ? "进入仪表盘"
              : "创建账户"}
        </button>

        {mode === "login" ? (
          <div className="flex items-center justify-between text-sm">
            <a
              href="/login/forgot-password"
              className="text-[#FF2442] transition hover:underline"
            >
              忘记密码？
            </a>
          </div>
        ) : null}
      </form>

      <div className="mt-6 border-t border-black/10 pt-6">
        <p className="text-center text-xs text-black/40">
          支持所有有效邮箱：QQ邮箱、163邮箱、Gmail、企业邮箱等
        </p>
      </div>
    </div>
  );
}

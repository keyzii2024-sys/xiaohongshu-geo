"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient as createClient } from "@/lib/supabase/browser";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    if (!email.trim()) {
      setStatus("error");
      setMessage("请输入邮箱地址");
      return;
    }

    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login/reset-password`,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message || "发送失败，请稍后重试");
    } else {
      setStatus("success");
      setMessage("重置链接已发送到您的邮箱，请查收");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="bg-white rounded-[28px] shadow-sm shadow-black/[0.03] p-8">
          <div className="text-center mb-8">
            <h1 className="text-[24px] font-semibold text-black/85 mb-2">
              忘记密码
            </h1>
            <p className="text-[14px] text-black/55">
              输入您的注册邮箱，我们将发送重置链接
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-[14px] font-medium text-black/85 mb-2"
              >
                邮箱地址
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入注册邮箱"
                className="w-full h-[48px] px-4 rounded-[20px] border border-black/10 bg-[#FAFAFA] text-[14px] text-black/85 placeholder:text-black/35 focus:outline-none focus:border-[#FF2442] transition-colors"
                disabled={status === "loading" || status === "success"}
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-[12px] text-[13px] ${
                  status === "success"
                    ? "bg-[#F3FBF5] text-[#166534] border border-[#CFE8D6]"
                    : "bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="w-full h-[48px] bg-[#FF2442] text-white text-[15px] font-medium rounded-[20px] hover:bg-[#E51D3D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "发送中..." : "发送重置链接"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-[14px] text-[#FF2442] hover:underline"
            >
              返回登录
            </Link>
          </div>
        </div>

        <p className="text-center text-[12px] text-black/35 mt-6">
          想起密码了？{" "}
          <Link href="/login" className="text-[#FF2442] hover:underline">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  );
}

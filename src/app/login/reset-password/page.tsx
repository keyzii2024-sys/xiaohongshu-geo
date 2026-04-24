"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient as createClient } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isValidSession, setIsValidSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setIsValidSession(false);
        setStatus("error");
        setMessage("链接已过期，请重新请求密码重置");
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    if (!password) {
      setStatus("error");
      setMessage("请输入新密码");
      return;
    }

    if (password.length < 6) {
      setStatus("error");
      setMessage("密码长度至少6位");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("两次输入的密码不一致");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message || "重置失败，请稍后重试");
    } else {
      setStatus("success");
      setMessage("密码重置成功！即将跳转到登录页...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  };

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
        <div className="w-full max-w-[400px]">
          <div className="bg-white rounded-[28px] shadow-sm shadow-black/[0.03] p-8 text-center">
            <h2 className="text-[20px] font-semibold text-black/85 mb-4">链接已过期</h2>
            <p className="text-[14px] text-black/55 mb-6">
              请重新请求密码重置
            </p>
            <a
              href="/login/forgot-password"
              className="inline-block w-full h-[48px] bg-[#FF2442] text-white text-[15px] font-medium rounded-[20px] hover:bg-[#E51D3D] transition-colors"
            >
              重新请求重置
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="bg-white rounded-[28px] shadow-sm shadow-black/[0.03] p-8">
          <div className="text-center mb-8">
            <h1 className="text-[24px] font-semibold text-black/85 mb-2">
              设置新密码
            </h1>
            <p className="text-[14px] text-black/55">
              请输入您的新密码
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-[14px] font-medium text-black/85 mb-2"
              >
                新密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少6位字符"
                className="w-full h-[48px] px-4 rounded-[20px] border border-black/10 bg-[#FAFAFA] text-[14px] text-black/85 placeholder:text-black/35 focus:outline-none focus:border-[#FF2442] transition-colors"
                disabled={status === "loading" || status === "success"}
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-[14px] font-medium text-black/85 mb-2"
              >
                确认密码
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入新密码"
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
              {status === "loading" ? "重置中..." : "确认重置"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

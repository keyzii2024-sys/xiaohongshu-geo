import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-white px-6 py-16 text-[#111111]">
      <div className="mx-auto flex max-w-5xl flex-col gap-16 lg:flex-row lg:items-start lg:justify-between">
        <section className="max-w-xl space-y-6">
          <p className="text-xs uppercase tracking-[0.24em] text-black/45">
            小红薯 GEO
          </p>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight">
              登录或注册后进入后台
            </h1>
            <p className="max-w-lg text-base leading-7 text-black/60">
              使用 Supabase Auth 进行邮箱密码登录。首次成功进入系统后，会自动为当前账号初始化默认品牌与品牌归属关系。
            </p>
          </div>
        </section>

        <LoginForm />
      </div>
    </main>
  );
}

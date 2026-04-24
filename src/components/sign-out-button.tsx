"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSignOut() {
    setIsPending(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signOut();

    if (error) {
      setErrorMessage("退出失败，请稍后重试。");
      setIsPending(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isPending}
        className="inline-flex h-10 items-center border border-black/10 px-4 text-sm text-black transition hover:border-black disabled:cursor-not-allowed disabled:border-black/10 disabled:text-black/35"
      >
        {isPending ? "退出中..." : "退出登录"}
      </button>

      {errorMessage ? (
        <p className="text-sm leading-6 text-[#B42318]">{errorMessage}</p>
      ) : null}
    </div>
  );
}

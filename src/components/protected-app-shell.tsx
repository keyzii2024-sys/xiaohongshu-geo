import { redirect } from "next/navigation";

import { ensureDefaultBrandForUser } from "@/lib/auth/brands";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { SignOutButton } from "./sign-out-button";
import { ProtectedAppNavigation } from "./protected-app-navigation";

export async function ProtectedAppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  await ensureDefaultBrandForUser(supabase, user);

  return (
    <div className="min-h-screen bg-white text-[#111111]">
      <div className="min-h-screen lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="flex flex-col border-b border-black/10 bg-white px-6 py-8 lg:border-b-0 lg:border-r lg:px-8 lg:py-10">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-black/45">
              小红薯 GEO
            </p>
            <p className="text-lg font-medium">Strategy Workspace</p>
          </div>

          <nav
            className="mt-10 flex flex-wrap gap-2 lg:mt-12 lg:flex-col lg:gap-1"
            aria-label="后台导航"
          >
            <ProtectedAppNavigation />
          </nav>

          <div className="mt-10 space-y-6 lg:mt-auto lg:pt-12">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-black/40">
                当前账号
              </p>
              <p className="break-all text-sm leading-6 text-black/75">
                {user.email}
              </p>
            </div>

            <SignOutButton />
          </div>
        </aside>

        <main className="bg-[#FAFAFA] px-5 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

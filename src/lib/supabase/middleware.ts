import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseAnonKey, getSupabaseUrl } from "./config";

function copyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });

  return target;
}

const protectedPrefixes = [
  "/dashboard",
  "/competitors",
  "/reports",
  "/settings",
  "/notes",
  "/api/geo",
];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!user && isProtectedRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return copyCookies(response, NextResponse.redirect(redirectUrl));
  }

  if (!user && pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "未登录或登录已过期，请先登录" },
      { status: 401 },
    );
  }

  if (user && pathname === "/login") {
    return copyCookies(
      response,
      NextResponse.redirect(new URL("/dashboard", request.url)),
    );
  }

  if (user && pathname === "/") {
    return copyCookies(
      response,
      NextResponse.redirect(new URL("/dashboard", request.url)),
    );
  }

  return response;
}

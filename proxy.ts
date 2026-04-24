import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/register"];
const PROTECTED_ROUTES = [
  "/feed",
  "/announcements",
  "/create",
  "/assistant",
  "/profile",
  "/post",
  "/complete-profile",
  "/assignments",
  "/admin",
];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAuthRoute = AUTH_ROUTES.some((p) => path === p || path.startsWith(`${p}/`));
  const isProtectedRoute = PROTECTED_ROUTES.some((p) => path === p || path.startsWith(`${p}/`));

  // Бесплатный fast-path: если роут не защищён и не auth — Supabase вообще не дёргаем.
  // Срабатывает на /, /api/*, /_next/data/* и т.п. — экономит сетевой round-trip к auth.
  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() делает сетевой вызов в Supabase auth — нужен только когда реально решаем
  // редирект, иначе getSession() читает только cookie и работает мгновенно.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/feed";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

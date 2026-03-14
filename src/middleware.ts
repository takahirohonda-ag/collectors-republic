import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes only for non-authenticated users
const authRoutes = ["/login", "/signup", "/reset-password"];

// Public routes that don't require authentication
const publicRoutes = ["/login", "/signup", "/reset-password", "/faq", "/legal", "/terms", "/privacy"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes and static assets
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  // Check for Supabase auth token in cookies
  const hasAuthToken = request.cookies.getAll().some(
    (cookie) => cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")
  );

  // Redirect authenticated users away from auth pages
  if (hasAuthToken && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect unauthenticated users to login for all non-public routes
  if (!hasAuthToken && !publicRoutes.some((route) => pathname.startsWith(route))) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

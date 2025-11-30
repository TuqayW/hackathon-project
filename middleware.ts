import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth session cookie (NextAuth v5 uses this cookie name)
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  const isLoggedIn = !!sessionToken;

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  const isDashboardPage = pathname.startsWith("/dashboard");

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect non-logged-in users to login
  if (!isLoggedIn && isDashboardPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json).*)"],
};

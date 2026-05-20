import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = (req.auth?.user as any)?.role;

  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isAuthRoute = ["/login", "/register", "/"].includes(nextUrl.pathname);
  const isStudentRoute = nextUrl.pathname.startsWith("/student");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isSuperAdminRoute = nextUrl.pathname.startsWith("/superadmin");

  if (isApiRoute) {
    return NextResponse.next();
  }

  // Redirect to dashboard if logged in and trying to access landing/login/register pages
  if (isAuthRoute) {
    if (isLoggedIn) {
      if (userRole === "superadmin") {
        return NextResponse.redirect(new URL("/superadmin/dashboard", nextUrl));
      } else if (userRole === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
      } else {
        return NextResponse.redirect(new URL("/student/dashboard", nextUrl));
      }
    }
    return NextResponse.next();
  }

  // Protect student routes
  if (isStudentRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (userRole !== "student") {
      // Admin/Superadmin trying to access student route -> redirect to their dashboard
      return NextResponse.redirect(
        new URL(userRole === "superadmin" ? "/superadmin/dashboard" : "/admin/dashboard", nextUrl)
      );
    }
    return NextResponse.next();
  }

  // Protect admin routes
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (userRole === "student") {
      return NextResponse.redirect(new URL("/student/dashboard", nextUrl));
    }
    if (userRole === "superadmin") {
      return NextResponse.redirect(new URL("/superadmin/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // Protect superadmin routes
  if (isSuperAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (userRole !== "superadmin") {
      return NextResponse.redirect(
        new URL(userRole === "admin" ? "/admin/dashboard" : "/student/dashboard", nextUrl)
      );
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.svg).*)"],
};

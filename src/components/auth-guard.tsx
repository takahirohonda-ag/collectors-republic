"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";

const PUBLIC_ROUTES = ["/login", "/signup", "/reset-password", "/faq", "/legal", "/terms", "/privacy"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  useEffect(() => {
    if (!loading && !user && !isPublicRoute) {
      const params = pathname !== "/" ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${params}`);
    }
  }, [user, loading, isPublicRoute, pathname, router]);

  // Show nothing while checking auth (prevents flash of protected content)
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-red-500" />
      </div>
    );
  }

  // Not authenticated and not on public route — will redirect
  if (!user && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}

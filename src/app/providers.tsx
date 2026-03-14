"use client";

import { AuthProvider } from "@/context/auth-context";
import { UserProvider } from "@/context/user-context";
import { AuthGuard } from "@/components/auth-guard";
import { mockCollection } from "@/data/mock";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <UserProvider initialCollection={mockCollection}>
        <AuthGuard>{children}</AuthGuard>
      </UserProvider>
    </AuthProvider>
  );
}

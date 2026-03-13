"use client";

import { AuthProvider } from "@/context/auth-context";
import { UserProvider } from "@/context/user-context";
import { mockCollection } from "@/data/mock";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <UserProvider initialCollection={mockCollection}>
        {children}
      </UserProvider>
    </AuthProvider>
  );
}

"use client";

import { UserProvider } from "@/context/user-context";
import { mockCollection } from "@/data/mock";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider initialCollection={mockCollection}>
      {children}
    </UserProvider>
  );
}

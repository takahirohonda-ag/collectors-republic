"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";
import { Coins, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useUser } from "@/context/user-context";

const navItems = [
  { href: "/", label: "Gacha" },
  { href: "/collection", label: "Collection" },
  { href: "/rankings", label: "Rankings" },
  { href: "/faq", label: "FAQ" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { coinBalance } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-amber-500">
            <span className="text-sm font-bold text-white">CR</span>
          </div>
          <span className="hidden text-lg font-bold tracking-tight sm:block">
            COLLECTORS<span className="text-red-500">REPUBLIC</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Balance + Account */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-card px-3 py-1.5 border border-border">
            <Coins className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium">{formatNumber(coinBalance)}</span>
          </div>
          <Link
            href="/account"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border transition-colors hover:bg-card-hover"
          >
            <User className="h-4 w-4 text-muted" />
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <nav className="border-t border-border px-4 py-3 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

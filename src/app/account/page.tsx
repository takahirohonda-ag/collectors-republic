"use client";

import { formatNumber } from "@/lib/utils";
import {
  User,
  Coins,
  Gift,
  Shield,
  Phone,
  HelpCircle,
  LogOut,
  ChevronRight,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/user-context";
import { useAuth } from "@/context/auth-context";

const menuItems = [
  { icon: Coins, label: "Purchase Coins", href: "/coins", badge: null },
  { icon: Gift, label: "Referral Program", href: "#", badge: "Earn 500 pts" },
  { icon: Phone, label: "Verify Phone Number", href: "#", badge: null },
  { icon: Shield, label: "Change Password", href: "/reset-password", badge: null },
  { icon: User, label: "User Profile", href: "#", badge: null },
  { icon: HelpCircle, label: "FAQ", href: "/faq", badge: null },
];

export default function AccountPage() {
  const router = useRouter();
  const { coinBalance, pointBalance } = useUser();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
      {/* Profile Card */}
      <div className="rounded-xl bg-card border border-border p-5">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {(user?.username || "U")[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-lg font-bold">{user?.username || "User"}</h1>
            <p className="text-sm text-muted">{user?.email || ""}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3 w-3 text-amber-400" />
              <span className="text-xs text-amber-400 font-medium">
                Silver Member
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="h-4 w-4 text-amber-400" />
            <span className="text-xs text-muted">Coins</span>
          </div>
          <p className="text-xl font-bold">{formatNumber(coinBalance)}</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="h-4 w-4 text-purple-400" />
            <span className="text-xs text-muted">Points</span>
          </div>
          <p className="text-xl font-bold">{formatNumber(pointBalance)}</p>
        </div>
      </div>

      {/* Menu */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-card-hover border-b border-border last:border-b-0"
          >
            <item.icon className="h-5 w-5 text-muted" />
            <span className="flex-1 text-sm font-medium">{item.label}</span>
            {item.badge && (
              <span className="text-[10px] font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
            <ChevronRight className="h-4 w-4 text-muted" />
          </Link>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/5"
      >
        <LogOut className="h-4 w-4" />
        Log Out
      </button>
    </div>
  );
}

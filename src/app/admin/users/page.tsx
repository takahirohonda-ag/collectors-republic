"use client";

import { useState } from "react";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { Search, Eye, Ban } from "lucide-react";

const mockUsers = [
  { id: "u1", username: "CryptoKnight", email: "crypto@example.com", joinDate: "2026-01-15", totalSpent: 2450, packs: 48, status: "active" },
  { id: "u2", username: "ZenTrader", email: "zen@example.com", joinDate: "2026-02-01", totalSpent: 1200, packs: 22, status: "active" },
  { id: "u3", username: "CRYPTOWHALE", email: "whale@example.com", joinDate: "2026-01-05", totalSpent: 8900, packs: 156, status: "active" },
  { id: "u4", username: "NewCollector", email: "new@example.com", joinDate: "2026-03-10", totalSpent: 85, packs: 1, status: "active" },
  { id: "u5", username: "SuspiciousUser", email: "sus@example.com", joinDate: "2026-03-12", totalSpent: 0, packs: 0, status: "banned" },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");

  const filtered = mockUsers.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">User Management</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm focus:border-red-500 focus:outline-none" />
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-card">
            <tr className="text-left text-xs text-muted">
              <th className="p-3">User</th>
              <th className="p-3 hidden md:table-cell">Joined</th>
              <th className="p-3">Spent</th>
              <th className="p-3 hidden md:table-cell">Packs</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-card/50">
                <td className="p-3">
                  <p className="text-sm font-medium">{user.username}</p>
                  <p className="text-[10px] text-muted">{user.email}</p>
                </td>
                <td className="p-3 text-sm text-muted hidden md:table-cell">{user.joinDate}</td>
                <td className="p-3 text-sm">{formatCurrency(user.totalSpent)}</td>
                <td className="p-3 text-sm text-muted hidden md:table-cell">{user.packs}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    user.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  }`}>{user.status}</span>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <button className="rounded p-1 hover:bg-card-hover"><Eye className="h-3.5 w-3.5 text-muted" /></button>
                    <button className="rounded p-1 hover:bg-red-500/10"><Ban className="h-3.5 w-3.5 text-red-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

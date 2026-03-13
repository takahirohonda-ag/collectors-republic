"use client";

import { useState, useEffect } from "react";
import { formatNumber } from "@/lib/utils";
import { Search, Eye, Database } from "lucide-react";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  joinDate: string;
  coinBalance: number;
  packsOpened: number;
  status: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [isDbConnected, setIsDbConnected] = useState(false);

  useEffect(() => {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    fetch(`/api/admin/users${params}`)
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users);
        setIsDbConnected(data.isDbConnected);
      });
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">User Management</h1>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${isDbConnected ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"}`}>
          <Database className="h-3 w-3" />
          {isDbConnected ? "Live" : "Mock"}
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm focus:border-red-500 focus:outline-none"
        />
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-card">
            <tr className="text-left text-xs text-muted">
              <th className="p-3">User</th>
              <th className="p-3 hidden md:table-cell">Joined</th>
              <th className="p-3">Balance</th>
              <th className="p-3 hidden md:table-cell">Packs</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-card/50">
                <td className="p-3">
                  <p className="text-sm font-medium">{user.username}</p>
                  <p className="text-[10px] text-muted">{user.email}</p>
                </td>
                <td className="p-3 text-sm text-muted hidden md:table-cell">{user.joinDate}</td>
                <td className="p-3 text-sm">{formatNumber(user.coinBalance)} Coins</td>
                <td className="p-3 text-sm text-muted hidden md:table-cell">{user.packsOpened}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    user.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  }`}>{user.status}</span>
                </td>
                <td className="p-3">
                  <button className="rounded p-1 hover:bg-card-hover">
                    <Eye className="h-3.5 w-3.5 text-muted" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="text-center text-sm text-muted py-8">No users found</p>
        )}
      </div>
    </div>
  );
}

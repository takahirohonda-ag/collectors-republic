"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { Plus, Search, Edit, Trash2, Database, X, Check } from "lucide-react";

interface AdminCard {
  id: string;
  name: string;
  imageUrl: string;
  rarity: string;
  marketValue: number;
  series: string;
  seriesId: string | null;
  collectionsCount?: number;
  createdAt: string;
}

interface Series {
  id: string;
  name: string;
  slug: string;
}

const rarityConfig: Record<string, { label: string; bg: string; text: string }> = {
  tier1: { label: "Tier 1", bg: "bg-green-500/20", text: "text-green-400" },
  tier2: { label: "Tier 2", bg: "bg-blue-500/20", text: "text-blue-400" },
  tier3: { label: "Tier 3", bg: "bg-purple-500/20", text: "text-purple-400" },
  tier4: { label: "Tier 4", bg: "bg-amber-500/20", text: "text-amber-400" },
};

const emptyForm = { name: "", imageUrl: "", rarity: "tier1", marketValue: "", seriesId: "" };

export default function AdminCardsPage() {
  const [cards, setCards] = useState<AdminCard[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [total, setTotal] = useState(0);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [search, setSearch] = useState("");
  const [filterSeriesId, setFilterSeriesId] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = () => {
    const params = new URLSearchParams();
    if (filterSeriesId) params.set("seriesId", filterSeriesId);
    fetch(`/api/admin/cards?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setCards(data.cards || []);
        setTotal(data.total || 0);
        setIsDbConnected(data.isDbConnected);
      });
  };

  useEffect(() => {
    fetchCards();
  }, [filterSeriesId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch series list for filter/form selects
  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .catch(() => null);
    // Try to get series from cards API or fall back to inline list
    setSeries([
      { id: "", name: "All Series", slug: "" },
    ]);
  }, []);

  const filtered = cards.filter((c) =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.series.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!form.name || !form.imageUrl || !form.rarity || !form.marketValue) {
      setError("All fields except Series are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        imageUrl: form.imageUrl,
        rarity: form.rarity,
        marketValue: parseInt(form.marketValue),
        seriesId: form.seriesId || null,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Failed to create card");
      return;
    }
    setCards((prev) => [data.card, ...prev]);
    setTotal((t) => t + 1);
    setForm(emptyForm);
    setShowAddForm(false);
  };

  const handleEdit = async (id: string) => {
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/cards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        name: editForm.name,
        imageUrl: editForm.imageUrl,
        rarity: editForm.rarity,
        marketValue: parseInt(editForm.marketValue),
        seriesId: editForm.seriesId || null,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Failed to update card");
      return;
    }
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...data.card } : c)));
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);
    const res = await fetch("/api/admin/cards", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    setDeletingId(null);
    setConfirmDeleteId(null);
    if (!res.ok) {
      setError(data.error || "Failed to delete card");
      return;
    }
    setCards((prev) => prev.filter((c) => c.id !== id));
    setTotal((t) => t - 1);
  };

  const startEdit = (card: AdminCard) => {
    setEditingId(card.id);
    setEditForm({
      name: card.name,
      imageUrl: card.imageUrl,
      rarity: card.rarity,
      marketValue: String(card.marketValue),
      seriesId: card.seriesId || "",
    });
    setError(null);
  };

  const inputCls = "rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-red-500 focus:outline-none w-full";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Card Master</h1>
          <p className="text-xs text-muted mt-0.5">{total} cards total</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ${
              isDbConnected ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"
            }`}
          >
            <Database className="h-3 w-3" />
            {isDbConnected ? "Live" : "Mock"}
          </span>
          <Button size="sm" onClick={() => { setShowAddForm(!showAddForm); setError(null); }}>
            <Plus className="h-4 w-4 mr-1" /> Add Card
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Add Card Form */}
      {showAddForm && (
        <div className="rounded-xl bg-card border border-border p-4 space-y-3">
          <h3 className="text-sm font-semibold">New Card</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="Card Name *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputCls}
            />
            <input
              placeholder="Image URL *"
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              className={inputCls}
            />
            <select
              value={form.rarity}
              onChange={(e) => setForm((f) => ({ ...f, rarity: e.target.value }))}
              className={inputCls}
            >
              <option value="tier1">Tier 1 — Common</option>
              <option value="tier2">Tier 2 — Uncommon</option>
              <option value="tier3">Tier 3 — Rare</option>
              <option value="tier4">Tier 4 — Ultra Rare</option>
            </select>
            <input
              placeholder="Market Value (coins) *"
              type="number"
              min="0"
              value={form.marketValue}
              onChange={(e) => setForm((f) => ({ ...f, marketValue: e.target.value }))}
              className={inputCls}
            />
            <select
              value={form.seriesId}
              onChange={(e) => setForm((f) => ({ ...f, seriesId: e.target.value }))}
              className={inputCls}
            >
              <option value="">No Series</option>
              {series.filter((s) => s.id).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          {/* Preview */}
          {form.imageUrl && (
            <div className="flex items-center gap-3">
              <img
                src={form.imageUrl}
                alt="preview"
                className="h-16 w-12 rounded-lg object-cover border border-border"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <span className="text-xs text-muted">Image preview</span>
            </div>
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={submitting}>
              {submitting ? "Saving..." : "Save Card"}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => { setShowAddForm(false); setForm(emptyForm); setError(null); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cards..."
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm focus:border-red-500 focus:outline-none"
          />
        </div>
        <select
          value={filterSeriesId}
          onChange={(e) => setFilterSeriesId(e.target.value)}
          className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm focus:border-red-500 focus:outline-none"
        >
          <option value="">All Series</option>
          {series.filter((s) => s.id).map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-card">
            <tr className="text-left text-xs text-muted">
              <th className="p-3">Card</th>
              <th className="p-3 hidden md:table-cell">Series</th>
              <th className="p-3">Rarity</th>
              <th className="p-3">Market Value</th>
              <th className="p-3 hidden lg:table-cell">Collections</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((card) => {
              const rarity = rarityConfig[card.rarity] || { label: card.rarity, bg: "bg-muted/20", text: "text-muted" };
              const isEditing = editingId === card.id;

              return (
                <tr key={card.id} className="hover:bg-card/50">
                  <td className="p-3">
                    {isEditing ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          {editForm.imageUrl && (
                            <img
                              src={editForm.imageUrl}
                              alt=""
                              className="h-10 w-8 rounded object-cover border border-border flex-shrink-0"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          )}
                          <input
                            value={editForm.name}
                            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                            className="rounded-lg border border-border bg-background px-2 py-1 text-sm focus:border-red-500 focus:outline-none w-full"
                            placeholder="Card Name"
                          />
                        </div>
                        <input
                          value={editForm.imageUrl}
                          onChange={(e) => setEditForm((f) => ({ ...f, imageUrl: e.target.value }))}
                          className="rounded-lg border border-border bg-background px-2 py-1 text-xs focus:border-red-500 focus:outline-none w-full"
                          placeholder="Image URL"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        {card.imageUrl ? (
                          <img
                            src={card.imageUrl}
                            alt={card.name}
                            className="h-10 w-8 rounded object-cover border border-border flex-shrink-0"
                            onError={(e) => {
                              const parent = (e.target as HTMLImageElement).parentElement;
                              if (parent) {
                                const placeholder = document.createElement("div");
                                placeholder.className = "h-10 w-8 rounded border border-border bg-card flex items-center justify-center text-[10px] text-muted flex-shrink-0";
                                placeholder.textContent = "🃏";
                                parent.replaceChild(placeholder, e.target as HTMLImageElement);
                              }
                            }}
                          />
                        ) : (
                          <div className="h-10 w-8 rounded border border-border bg-card flex items-center justify-center text-[10px] flex-shrink-0">🃏</div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{card.name}</p>
                          <p className="text-[10px] text-muted">{card.createdAt}</p>
                        </div>
                      </div>
                    )}
                  </td>

                  <td className="p-3 text-sm text-muted hidden md:table-cell">
                    {isEditing ? (
                      <select
                        value={editForm.seriesId}
                        onChange={(e) => setEditForm((f) => ({ ...f, seriesId: e.target.value }))}
                        className="rounded-lg border border-border bg-background px-2 py-1 text-sm focus:border-red-500 focus:outline-none"
                      >
                        <option value="">No Series</option>
                        {series.filter((s) => s.id).map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    ) : (
                      card.series
                    )}
                  </td>

                  <td className="p-3">
                    {isEditing ? (
                      <select
                        value={editForm.rarity}
                        onChange={(e) => setEditForm((f) => ({ ...f, rarity: e.target.value }))}
                        className="rounded-lg border border-border bg-background px-2 py-1 text-sm focus:border-red-500 focus:outline-none"
                      >
                        <option value="tier1">Tier 1</option>
                        <option value="tier2">Tier 2</option>
                        <option value="tier3">Tier 3</option>
                        <option value="tier4">Tier 4</option>
                      </select>
                    ) : (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${rarity.bg} ${rarity.text}`}>
                        {rarity.label}
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-sm">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        value={editForm.marketValue}
                        onChange={(e) => setEditForm((f) => ({ ...f, marketValue: e.target.value }))}
                        className="rounded-lg border border-border bg-background px-2 py-1 text-sm focus:border-red-500 focus:outline-none w-28"
                      />
                    ) : (
                      <span>{formatNumber(card.marketValue)} coins</span>
                    )}
                  </td>

                  <td className="p-3 text-sm text-muted hidden lg:table-cell">
                    {card.collectionsCount ?? "—"}
                  </td>

                  <td className="p-3">
                    {isEditing ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(card.id)}
                          disabled={submitting}
                          className="rounded p-1 hover:bg-green-500/10 disabled:opacity-50"
                          title="Save"
                        >
                          <Check className="h-3.5 w-3.5 text-green-400" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded p-1 hover:bg-card-hover"
                          title="Cancel"
                        >
                          <X className="h-3.5 w-3.5 text-muted" />
                        </button>
                      </div>
                    ) : confirmDeleteId === card.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-red-400">Delete?</span>
                        <button
                          onClick={() => handleDelete(card.id)}
                          disabled={deletingId === card.id}
                          className="rounded p-1 hover:bg-red-500/20 disabled:opacity-50"
                          title="Confirm"
                        >
                          <Check className="h-3.5 w-3.5 text-red-400" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded p-1 hover:bg-card-hover"
                          title="Cancel"
                        >
                          <X className="h-3.5 w-3.5 text-muted" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(card)}
                          className="rounded p-1 hover:bg-card-hover"
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5 text-muted" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(card.id)}
                          className="rounded p-1 hover:bg-red-500/10"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted py-8">No cards found</p>
        )}
      </div>
    </div>
  );
}

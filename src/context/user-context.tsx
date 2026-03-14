"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { Card, CollectionItem } from "@/types";
import { useAuth } from "@/context/auth-context";

interface UserState {
  coinBalance: number;
  pointBalance: number;
  collection: CollectionItem[];
}

interface UserContextType extends UserState {
  spendCoins: (amount: number) => boolean;
  addCoins: (amount: number) => void;
  addToCollection: (cards: Card[]) => void;
  sellBackCards: (cardIds: string[]) => number;
  removeFromCollection: (cardIds: string[]) => void;
  refreshBalance: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children, initialCollection }: { children: ReactNode; initialCollection: CollectionItem[] }) {
  const { user } = useAuth();
  const [coinBalance, setCoinBalance] = useState(0);
  const [pointBalance, setPointBalance] = useState(0);
  const [collection, setCollection] = useState<CollectionItem[]>(initialCollection);

  // Sync balance from API when user is logged in
  const refreshBalance = useCallback(async () => {
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        setCoinBalance(data.coinBalance);
        setPointBalance(data.pointBalance);
      }
    } catch {
      // Keep local state on error
    }
  }, []);

  // Fetch real balance when user changes
  useEffect(() => {
    if (user) {
      refreshBalance();
    }
  }, [user, refreshBalance]);

  const spendCoins = useCallback((amount: number) => {
    if (coinBalance < amount) return false;
    setCoinBalance((prev) => prev - amount);
    return true;
  }, [coinBalance]);

  const addCoins = useCallback((amount: number) => {
    setCoinBalance((prev) => prev + amount);
  }, []);

  const addToCollection = useCallback((cards: Card[]) => {
    const newItems: CollectionItem[] = cards.map((card, i) => ({
      id: `col-${Date.now()}-${i}`,
      card,
      acquiredAt: new Date(),
      status: "in_collection" as const,
      sellBackValue: Math.floor(card.marketValue * 0.8),
    }));
    setCollection((prev) => [...newItems, ...prev]);
  }, []);

  const sellBackCards = useCallback((cardIds: string[]) => {
    let totalRefund = 0;
    setCollection((prev) => {
      const toSell = prev.filter((item) => cardIds.includes(item.id) && item.status === "in_collection");
      totalRefund = toSell.reduce((sum, item) => sum + item.sellBackValue, 0);
      return prev.map((item) =>
        cardIds.includes(item.id) && item.status === "in_collection"
          ? { ...item, status: "sold_back" as const }
          : item
      );
    });
    setCoinBalance((prev) => prev + totalRefund);
    return totalRefund;
  }, []);

  const removeFromCollection = useCallback((cardIds: string[]) => {
    setCollection((prev) => prev.filter((item) => !cardIds.includes(item.id)));
  }, []);

  return (
    <UserContext.Provider
      value={{
        coinBalance,
        pointBalance,
        collection,
        spendCoins,
        addCoins,
        addToCollection,
        sellBackCards,
        removeFromCollection,
        refreshBalance,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}

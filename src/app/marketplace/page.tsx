"use client";

import { useState, useEffect } from "react";
import { ListingCard } from "@/components/marketplace/listing-card";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { Hexagon, Search, SlidersHorizontal, Coins } from "lucide-react";
import type { CardRarity } from "@/types";

interface ListingData {
  id: string;
  cardName: string;
  cardImageUrl: string;
  cardRarity: CardRarity;
  series: string;
  priceCoins: number;
  marketValue: number;
  sellerName: string;
  gradeProvider?: string;
  gradeScore?: number;
}

// Mock listings for development
const mockListings: ListingData[] = [
  { id: "l1", cardName: "Charizard VMAX", cardImageUrl: "https://images.pokemontcg.io/swsh3/20_hires.png", cardRarity: "tier4", series: "Pokemon", priceCoins: 420, marketValue: 450, sellerName: "CardKing", gradeProvider: "PSA", gradeScore: 9 },
  { id: "l2", cardName: "Umbreon VMAX", cardImageUrl: "https://images.pokemontcg.io/swsh7/215_hires.png", cardRarity: "tier4", series: "Pokemon", priceCoins: 480, marketValue: 500, sellerName: "NftWhale" },
  { id: "l3", cardName: "Monkey D. Luffy (Gear 5)", cardImageUrl: "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP05/OP05-119_EN.webp", cardRarity: "tier4", series: "One Piece", priceCoins: 600, marketValue: 650, sellerName: "OnePieceFan" },
  { id: "l4", cardName: "Rayquaza VMAX", cardImageUrl: "https://images.pokemontcg.io/swsh7/218_hires.png", cardRarity: "tier3", series: "Pokemon", priceCoins: 160, marketValue: 180, sellerName: "TrainerRed", gradeProvider: "BGS", gradeScore: 9.5 },
  { id: "l5", cardName: "Shanks", cardImageUrl: "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP01/OP01-120_EN.webp", cardRarity: "tier3", series: "One Piece", priceCoins: 175, marketValue: 200, sellerName: "GrandLine" },
  { id: "l6", cardName: "Lugia V", cardImageUrl: "https://images.pokemontcg.io/swsh12pt5/186_hires.png", cardRarity: "tier3", series: "Pokemon", priceCoins: 195, marketValue: 220, sellerName: "SilverWing" },
  { id: "l7", cardName: "Espeon VMAX", cardImageUrl: "https://images.pokemontcg.io/swsh7/65_hires.png", cardRarity: "tier2", series: "Pokemon", priceCoins: 80, marketValue: 95, sellerName: "EeveeLover" },
  { id: "l8", cardName: "Nami", cardImageUrl: "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP01/OP01-016_EN.webp", cardRarity: "tier2", series: "One Piece", priceCoins: 78, marketValue: 90, sellerName: "Navigator" },
  { id: "l9", cardName: "Kaido", cardImageUrl: "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP01/OP01-094_EN.webp", cardRarity: "tier4", series: "One Piece", priceCoins: 350, marketValue: 380, sellerName: "BeastPirate" },
  { id: "l10", cardName: "Pikachu VMAX", cardImageUrl: "https://images.pokemontcg.io/swsh4/44_hires.png", cardRarity: "tier1", series: "Pokemon", priceCoins: 38, marketValue: 45, sellerName: "PikaFan" },
  { id: "l11", cardName: "Nico Robin", cardImageUrl: "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP01/OP01-017_EN.webp", cardRarity: "tier3", series: "One Piece", priceCoins: 155, marketValue: 175, sellerName: "OharaScholar" },
  { id: "l12", cardName: "Gengar VMAX", cardImageUrl: "https://images.pokemontcg.io/swsh8/271_hires.png", cardRarity: "tier2", series: "Pokemon", priceCoins: 65, marketValue: 75, sellerName: "GhostType" },
];

const seriesOptions = ["All", "Pokemon", "One Piece"] as const;
const rarityOptions: { value: CardRarity | "all"; label: string }[] = [
  { value: "all", label: "All Tiers" },
  { value: "tier1", label: "Tier 1" },
  { value: "tier2", label: "Tier 2" },
  { value: "tier3", label: "Tier 3" },
  { value: "tier4", label: "Tier 4" },
];
const sortOptions = [
  { value: "recent", label: "Recently Listed" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "discount", label: "Best Deals" },
] as const;

type SortOption = (typeof sortOptions)[number]["value"];

export default function MarketplacePage() {
  const [listings, setListings] = useState<ListingData[]>(mockListings);
  const [series, setSeries] = useState<string>("All");
  const [rarity, setRarity] = useState<CardRarity | "all">("all");
  const [sort, setSort] = useState<SortOption>("recent");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort
  const filtered = listings
    .filter((l) => series === "All" || l.series === series)
    .filter((l) => rarity === "all" || l.cardRarity === rarity)
    .filter((l) => !search || l.cardName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      switch (sort) {
        case "price-low": return a.priceCoins - b.priceCoins;
        case "price-high": return b.priceCoins - a.priceCoins;
        case "discount": {
          const dA = a.marketValue > 0 ? (a.marketValue - a.priceCoins) / a.marketValue : 0;
          const dB = b.marketValue > 0 ? (b.marketValue - b.priceCoins) / b.marketValue : 0;
          return dB - dA;
        }
        default: return 0;
      }
    });

  const totalVolume = listings.reduce((s, l) => s + l.priceCoins, 0);
  const floorPrice = listings.length > 0 ? Math.min(...listings.map((l) => l.priceCoins)) : 0;

  // Try loading from API (fallback to mock)
  useEffect(() => {
    fetch("/api/marketplace/listings")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (data.listings?.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setListings(
            data.listings.map((l: any) => ({
              id: l.id,
              cardName: l.nft?.card?.name ?? "Unknown",
              cardImageUrl: l.nft?.card?.imageUrl ?? "",
              cardRarity: l.nft?.card?.rarity ?? "tier1",
              series: l.nft?.card?.series ?? "",
              priceCoins: l.priceCoins,
              marketValue: l.nft?.card?.marketValue ?? 0,
              sellerName: l.seller?.username ?? "Unknown",
            }))
          );
        }
      })
      .catch(() => {
        // use mock data
      });
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      {/* Header */}
      <section className="rounded-xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 border border-purple-500/20 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
            <Hexagon className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold">NFT Marketplace</h1>
            <p className="text-xs text-muted">Buy, sell, and trade NFT trading cards</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-black/20 p-2 text-center">
            <p className="text-[10px] text-muted">Listings</p>
            <p className="text-sm font-bold text-foreground">{listings.length}</p>
          </div>
          <div className="rounded-lg bg-black/20 p-2 text-center">
            <p className="text-[10px] text-muted">Floor Price</p>
            <div className="flex items-center justify-center gap-1">
              <Coins className="h-3 w-3 text-amber-400" />
              <p className="text-sm font-bold text-amber-400">{formatNumber(floorPrice)}</p>
            </div>
          </div>
          <div className="rounded-lg bg-black/20 p-2 text-center">
            <p className="text-[10px] text-muted">Volume</p>
            <div className="flex items-center justify-center gap-1">
              <Coins className="h-3 w-3 text-amber-400" />
              <p className="text-sm font-bold text-amber-400">{formatNumber(totalVolume)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search + Filter Toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search cards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-purple-500/50"
          />
        </div>
        <Button
          variant={showFilters ? "primary" : "secondary"}
          size="md"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? "bg-purple-600 hover:bg-purple-500" : ""}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="rounded-xl bg-card border border-border p-4 space-y-3">
          {/* Series */}
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wider mb-1.5">Series</p>
            <div className="flex gap-2 flex-wrap">
              {seriesOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setSeries(s)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    series === s
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "bg-background text-muted border border-border hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Rarity */}
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wider mb-1.5">Rarity</p>
            <div className="flex gap-2 flex-wrap">
              {rarityOptions.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRarity(r.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    rarity === r.value
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "bg-background text-muted border border-border hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wider mb-1.5">Sort By</p>
            <div className="flex gap-2 flex-wrap">
              {sortOptions.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSort(s.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    sort === s.value
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "bg-background text-muted border border-border hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">{filtered.length} items</p>
      </div>

      {/* Listing Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((listing) => (
            <ListingCard key={listing.id} {...listing} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Hexagon className="h-12 w-12 text-muted mb-3" />
          <p className="text-sm font-medium text-foreground">No listings found</p>
          <p className="text-xs text-muted mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}

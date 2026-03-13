"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";
import { CardImage } from "@/components/ui/card-image";
import { NftBadge } from "@/components/nft/nft-badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user-context";
import {
  Hexagon, Coins, ArrowLeft, Shield, ExternalLink,
  Tag, Clock, TrendingDown, ShoppingCart, HandCoins,
} from "lucide-react";
import type { CardRarity, NftStatus } from "@/types";

interface ListingDetail {
  id: string;
  cardName: string;
  cardImageUrl: string;
  cardRarity: CardRarity;
  series: string;
  priceCoins: number;
  marketValue: number;
  sellerName: string;
  sellerId: string;
  gradeProvider?: string;
  gradeScore?: number;
  nftStatus: NftStatus;
  tokenId?: number;
  contractAddress?: string;
  mintTxHash?: string;
  listedAt: string;
  description?: string;
}

// Mock detail data
const mockListingDetails: Record<string, ListingDetail> = {
  l1: { id: "l1", cardName: "Charizard VMAX", cardImageUrl: "https://images.pokemontcg.io/swsh3/20_hires.png", cardRarity: "tier4", series: "Pokemon", priceCoins: 420, marketValue: 450, sellerName: "CardKing", sellerId: "u1", gradeProvider: "PSA", gradeScore: 9, nftStatus: "listed", tokenId: 1042, contractAddress: "0x1234...abcd", mintTxHash: "0xabc123", listedAt: "2025-01-15T10:30:00Z", description: "Rare Charizard VMAX from Darkness Ablaze. PSA 9 certified." },
  l2: { id: "l2", cardName: "Umbreon VMAX", cardImageUrl: "https://images.pokemontcg.io/swsh7/215_hires.png", cardRarity: "tier4", series: "Pokemon", priceCoins: 480, marketValue: 500, sellerName: "NftWhale", sellerId: "u2", nftStatus: "listed", tokenId: 2105, contractAddress: "0x1234...abcd", mintTxHash: "0xdef456", listedAt: "2025-01-14T08:00:00Z" },
  l3: { id: "l3", cardName: "Monkey D. Luffy (Gear 5)", cardImageUrl: "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP05/OP05-119_EN.webp", cardRarity: "tier4", series: "One Piece", priceCoins: 600, marketValue: 650, sellerName: "OnePieceFan", sellerId: "u3", nftStatus: "listed", tokenId: 3201, contractAddress: "0x1234...abcd", listedAt: "2025-01-13T15:45:00Z" },
  l4: { id: "l4", cardName: "Rayquaza VMAX", cardImageUrl: "https://images.pokemontcg.io/swsh7/218_hires.png", cardRarity: "tier3", series: "Pokemon", priceCoins: 160, marketValue: 180, sellerName: "TrainerRed", sellerId: "u4", gradeProvider: "BGS", gradeScore: 9.5, nftStatus: "listed", tokenId: 887, contractAddress: "0x1234...abcd", listedAt: "2025-01-12T12:00:00Z" },
  l5: { id: "l5", cardName: "Shanks", cardImageUrl: "https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP01/OP01-120_EN.webp", cardRarity: "tier3", series: "One Piece", priceCoins: 175, marketValue: 200, sellerName: "GrandLine", sellerId: "u5", nftStatus: "listed", tokenId: 1501, contractAddress: "0x1234...abcd", listedAt: "2025-01-11T09:20:00Z" },
};

export default function MarketplaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { coinBalance, spendCoins } = useUser();
  const id = params.id as string;

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [offerAmount, setOfferAmount] = useState("");
  const [showOfferInput, setShowOfferInput] = useState(false);
  const [buying, setBuying] = useState(false);
  const [bought, setBought] = useState(false);

  useEffect(() => {
    // Try API, fallback to mock
    fetch(`/api/marketplace/listings?id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (data.listing) {
          setListing({
            id: data.listing.id,
            cardName: data.listing.nft?.card?.name ?? "Unknown",
            cardImageUrl: data.listing.nft?.card?.imageUrl ?? "",
            cardRarity: data.listing.nft?.card?.rarity ?? "tier1",
            series: data.listing.nft?.card?.series ?? "",
            priceCoins: data.listing.priceCoins,
            marketValue: data.listing.nft?.card?.marketValue ?? 0,
            sellerName: data.listing.seller?.username ?? "Unknown",
            sellerId: data.listing.seller?.id ?? "",
            nftStatus: "listed",
            tokenId: data.listing.nft?.tokenId,
            contractAddress: data.listing.nft?.contractAddress,
            listedAt: data.listing.listedAt,
          });
        } else throw new Error();
      })
      .catch(() => {
        setListing(mockListingDetails[id] ?? null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleBuy = async () => {
    if (!listing || buying) return;
    setBuying(true);
    try {
      const res = await fetch("/api/marketplace/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing.id }),
      });
      if (res.ok) {
        spendCoins(listing.priceCoins);
        setBought(true);
      } else {
        // Fallback: simulate purchase for mock mode
        if (spendCoins(listing.priceCoins)) {
          setBought(true);
        }
      }
    } catch {
      if (spendCoins(listing.priceCoins)) {
        setBought(true);
      }
    } finally {
      setBuying(false);
    }
  };

  const handleOffer = async () => {
    const amount = parseInt(offerAmount);
    if (!amount || amount <= 0 || !listing) return;
    try {
      await fetch("/api/marketplace/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nftId: listing.id, priceCoins: amount }),
      });
    } catch {
      // silent fail in mock mode
    }
    setShowOfferInput(false);
    setOfferAmount("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Hexagon className="h-8 w-8 text-purple-400 animate-pulse" />
          <p className="text-sm text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Hexagon className="h-12 w-12 text-muted" />
        <p className="text-sm text-foreground">Listing not found</p>
        <Link href="/marketplace">
          <Button variant="secondary">Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const discount = listing.marketValue > 0
    ? Math.round(((listing.marketValue - listing.priceCoins) / listing.marketValue) * 100)
    : 0;
  const canAfford = coinBalance >= listing.priceCoins;
  const sellBackValue = Math.floor(listing.marketValue * 0.9);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      {/* Back */}
      <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Marketplace
      </Link>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card Image */}
        <div className="space-y-3">
          <div className="relative rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-border p-6 flex items-center justify-center">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-purple-500/20 via-blue-500/10 to-purple-500/20 blur-xl opacity-60" />
            <div className="relative">
              <CardImage src={listing.cardImageUrl} alt={listing.cardName} rarity={listing.cardRarity} size="lg" />
            </div>
          </div>

          {/* NFT Info */}
          <div className="rounded-xl bg-card border border-border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Hexagon className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-medium">NFT Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-background p-2">
                <p className="text-[10px] text-muted">Token ID</p>
                <p className="text-xs font-medium">#{listing.tokenId ?? "—"}</p>
              </div>
              <div className="rounded-lg bg-background p-2">
                <p className="text-[10px] text-muted">Chain</p>
                <p className="text-xs font-medium text-purple-400">Polygon</p>
              </div>
              <div className="rounded-lg bg-background p-2">
                <p className="text-[10px] text-muted">Contract</p>
                <p className="text-xs font-medium truncate">{listing.contractAddress ?? "—"}</p>
              </div>
              <div className="rounded-lg bg-background p-2">
                <p className="text-[10px] text-muted">Standard</p>
                <p className="text-xs font-medium">ERC-721</p>
              </div>
            </div>
            {listing.mintTxHash && (
              <a
                href={`https://amoy.polygonscan.com/tx/${listing.mintTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-purple-400/60 hover:text-purple-400 transition-colors"
              >
                View on Polygonscan <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
        </div>

        {/* Details + Actions */}
        <div className="space-y-4">
          {/* Title & Meta */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <NftBadge status={listing.nftStatus} />
              {listing.gradeProvider && listing.gradeScore && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                  {listing.gradeProvider} {listing.gradeScore}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold">{listing.cardName}</h1>
            <p className="text-xs text-muted mt-0.5">{listing.series}</p>
            {listing.description && (
              <p className="text-xs text-muted mt-2 leading-relaxed">{listing.description}</p>
            )}
          </div>

          {/* Price Card */}
          <div className="rounded-xl bg-card border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted uppercase tracking-wider">Price</p>
              {discount > 0 && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                  -{discount}% below FMV
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-400" />
              <span className="text-2xl font-bold text-amber-400">{formatNumber(listing.priceCoins)}</span>
              <span className="text-xs text-muted">Coins</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <Tag className="h-3 w-3 text-muted" />
                <span className="text-muted">Market Value:</span>
                <span className="font-medium">{formatNumber(listing.marketValue)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingDown className="h-3 w-3 text-green-400" />
                <span className="text-muted">Buyback:</span>
                <span className="font-medium text-green-400">{formatNumber(sellBackValue)}</span>
              </div>
            </div>
          </div>

          {/* Seller */}
          <div className="rounded-xl bg-card border border-border p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{listing.sellerName[0]}</span>
              </div>
              <div>
                <p className="text-sm font-medium">{listing.sellerName}</p>
                <p className="text-[10px] text-muted">Seller</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted">
              <Clock className="h-3 w-3" />
              Listed {new Date(listing.listedAt).toLocaleDateString()}
            </div>
          </div>

          {/* Vault Custody */}
          <div className="rounded-xl bg-green-500/5 border border-green-500/20 p-3 flex items-center gap-3">
            <Shield className="h-5 w-5 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-green-400">Physical Card in Vault</p>
              <p className="text-[10px] text-muted">The physical card is securely stored. Redeem anytime after purchase.</p>
            </div>
          </div>

          {/* Actions */}
          {!bought ? (
            <div className="space-y-2">
              <Button
                size="lg"
                onClick={handleBuy}
                disabled={!canAfford || buying}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 shadow-lg shadow-purple-500/20"
              >
                {buying ? (
                  "Processing..."
                ) : canAfford ? (
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Buy for {formatNumber(listing.priceCoins)} Coins
                  </span>
                ) : (
                  "Not enough coins"
                )}
              </Button>

              {!showOfferInput ? (
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={() => setShowOfferInput(true)}
                >
                  <span className="flex items-center gap-2">
                    <HandCoins className="h-4 w-4" />
                    Make an Offer
                  </span>
                </Button>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
                    <input
                      type="number"
                      placeholder="Your offer..."
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                      autoFocus
                    />
                  </div>
                  <Button onClick={handleOffer} className="bg-purple-600 hover:bg-purple-500">
                    Send
                  </Button>
                  <Button variant="ghost" onClick={() => setShowOfferInput(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-center space-y-2">
              <p className="text-sm font-bold text-green-400">Purchase Complete!</p>
              <p className="text-xs text-muted">The NFT has been transferred to your wallet.</p>
              <div className="flex gap-2 justify-center mt-3">
                <Link href="/collection">
                  <Button variant="secondary" size="sm">View Collection</Button>
                </Link>
                <Link href="/marketplace">
                  <Button variant="ghost" size="sm">Continue Shopping</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

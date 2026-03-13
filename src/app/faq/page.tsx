"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  { q: "What is CollectorsRepublic?", a: "CollectorsRepublic is an online platform where you can open virtual trading card packs (gacha) containing real, physical cards sourced from Japan. Cards can be shipped to you or sold back for coins." },
  { q: "How does the gacha work?", a: "Choose a pack tier (Basic, Elite, or Legendary), purchase it with coins, and open it to reveal a random card. Each pack has transparent probabilities shown before purchase." },
  { q: "What happens after I pull a card?", a: "After pulling a card, it's added to your collection. You can keep it, sell it back for 80% of market value in coins, or request physical shipping." },
  { q: "How long does shipping take?", a: "Cards are pre-shipped to the UAE. Once you request shipping, delivery takes approximately 3 business days." },
  { q: "What is the sell back policy?", a: "You can sell back any card within 7 days of pulling for 80% of its market value. The value is credited as coins to your balance." },
  { q: "How are card values determined?", a: "Market values are sourced from PriceCharting.com and other platforms. Values are updated regularly but are subject to change." },
  { q: "Are the probabilities fair?", a: "Yes. All probabilities are fixed, transparent, and displayed before every purchase. Our algorithm is randomized by a proprietary system." },
  { q: "How do I purchase coins?", a: "Go to Account > Purchase Coins. We accept Visa, Mastercard, AMEX, Google Pay, and Apple Pay." },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold">Frequently Asked Questions</h1>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between p-4 text-left"
            >
              <span className="text-sm font-medium pr-4">{faq.q}</span>
              <ChevronDown className={cn("h-4 w-4 text-muted shrink-0 transition-transform", openIndex === i && "rotate-180")} />
            </button>
            {openIndex === i && (
              <div className="border-t border-border px-4 py-3">
                <p className="text-sm text-muted leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Package, CheckCircle } from "lucide-react";
import Link from "next/link";

const mockShipCards = [
  { id: "1", name: "Pikachu VMAX", marketValue: 45 },
  { id: "2", name: "Rayquaza V Alt Art", marketValue: 180 },
];

type Step = "info" | "confirm" | "complete";

export default function ShippingPage() {
  const [step, setStep] = useState<Step>("info");
  const [address, setAddress] = useState({ name: "", line1: "", line2: "", city: "", state: "", zip: "", country: "AE" });

  if (step === "complete") {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4">
        <div className="w-full text-center space-y-6">
          <div className="relative mx-auto w-fit">
            <CheckCircle className="h-16 w-16 text-green-400" />
            <Package className="absolute -right-1 -bottom-1 h-8 w-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold">Shipping Request Submitted!</h1>
          <p className="text-sm text-muted">Your cards will be shipped within 3 business days. You&apos;ll receive a tracking email.</p>
          <div className="rounded-xl bg-card border border-border p-4 space-y-2">
            {mockShipCards.map((c) => (
              <div key={c.id} className="flex justify-between text-sm">
                <span>{c.name}</span>
                <span className="text-green-400">Preparing</span>
              </div>
            ))}
          </div>
          <Link href="/collection"><Button size="lg" className="w-full">Back to Collection</Button></Link>
        </div>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
        <button onClick={() => setStep("info")} className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Edit Address
        </button>
        <h1 className="text-xl font-bold">Confirm Shipping</h1>

        <div className="rounded-xl bg-card border border-border p-4 space-y-3">
          <h3 className="text-sm font-semibold">Ship to:</h3>
          <p className="text-sm text-muted">{address.name}<br />{address.line1}<br />{address.line2 && `${address.line2}\n`}{address.city}, {address.state} {address.zip}</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Cards ({mockShipCards.length})</h3>
          {mockShipCards.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg bg-card border border-border p-3">
              <div className="flex items-center gap-2"><span>🃏</span><span className="text-sm">{c.name}</span></div>
              <span className="text-xs text-muted">{formatCurrency(c.marketValue)}</span>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-card border border-border p-4 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-muted">Shipping</span><span className="text-green-400">FREE</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted">Estimated Delivery</span><span>3 business days</span></div>
        </div>

        <Button size="lg" className="w-full" onClick={() => setStep("complete")}>Confirm & Ship</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
      <Link href="/collection" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="text-xl font-bold">Shipping Address</h1>

      <form onSubmit={(e) => { e.preventDefault(); setStep("confirm"); }} className="space-y-4">
        {[
          { label: "Full Name", key: "name" as const, placeholder: "John Doe" },
          { label: "Address Line 1", key: "line1" as const, placeholder: "123 Street" },
          { label: "Address Line 2", key: "line2" as const, placeholder: "Apt, Suite (optional)" },
          { label: "City", key: "city" as const, placeholder: "Dubai" },
          { label: "State / Province", key: "state" as const, placeholder: "Dubai" },
          { label: "Postal Code", key: "zip" as const, placeholder: "00000" },
        ].map((field) => (
          <div key={field.key} className="space-y-1">
            <label className="text-xs font-medium text-muted">{field.label}</label>
            <input
              type="text"
              value={address[field.key]}
              onChange={(e) => setAddress({ ...address, [field.key]: e.target.value })}
              placeholder={field.placeholder}
              className="w-full rounded-xl border border-border bg-card py-3 px-4 text-sm text-foreground placeholder:text-muted/50 focus:border-red-500 focus:outline-none"
              required={field.key !== "line2"}
            />
          </div>
        ))}

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted">Country</label>
          <select value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} className="w-full rounded-xl border border-border bg-card py-3 px-4 text-sm text-foreground focus:border-red-500 focus:outline-none">
            <option value="AE">United Arab Emirates</option>
            <option value="SA">Saudi Arabia</option>
            <option value="QA">Qatar</option>
            <option value="KW">Kuwait</option>
            <option value="BH">Bahrain</option>
            <option value="OM">Oman</option>
          </select>
        </div>

        <Button type="submit" size="lg" className="w-full">Continue</Button>
      </form>
    </div>
  );
}

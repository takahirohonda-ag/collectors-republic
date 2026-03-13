"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4">
      <div className="w-full space-y-6">
        <Link href="/login" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>

        {sent ? (
          <div className="text-center space-y-4">
            <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
            <h1 className="text-2xl font-bold">Check your email</h1>
            <p className="text-sm text-muted">We sent a password reset link to <span className="text-foreground">{email}</span></p>
            <Button variant="secondary" onClick={() => setSent(false)} className="w-full">Try another email</Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Reset Password</h1>
              <p className="text-sm text-muted">Enter your email and we&apos;ll send you a reset link</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted/50 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500" required />
              </div>
              <Button type="submit" size="lg" className="w-full">Send Reset Link</Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

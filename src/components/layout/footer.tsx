import Link from "next/link";

const links = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/legal", label: "Legal" },
  { href: "/faq", label: "FAQ" },
  { href: "/campaign", label: "Campaign" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 py-6">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-red-500 to-amber-500">
              <span className="text-[10px] font-bold text-white">CR</span>
            </div>
            <span className="text-xs text-muted">
              &copy; 2026 CollectorsRepublic. All rights reserved.
            </span>
          </div>
          <nav className="flex gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-muted hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

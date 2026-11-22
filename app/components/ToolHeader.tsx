"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthControls, useAuthInfo } from "./AuthState";

const TOOLS = [
  { href: "/plan", label: "1 · Plan" },
  { href: "/review", label: "2 · Review" },
  { href: "/tracker", label: "3 · Track" },
];

export default function ToolHeader() {
  const pathname = usePathname();
  const auth = useAuthInfo();
  const links = auth.signedIn ? [{ href: "/dashboard", label: "My projects" }, ...TOOLS] : TOOLS;
  return (
    <header className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-orange-200 pb-4">
      <Link href="/" className="flex items-center gap-2" aria-label="Permivo home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo/permivo-logo-a.svg" alt="" width={30} height={30} />
        <span className="text-lg font-bold tracking-tight text-[#211b18]">Permivo</span>
      </Link>
      <nav aria-label="Tools" className="flex items-center gap-4 text-sm">
        {links.map((t) => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "border-b-2 border-orange-600 pb-0.5 font-medium text-[#211b18]"
                  : "text-[#776a61] hover:text-orange-800"
              }
            >
              {t.label}
            </Link>
          );
        })}
        <AuthControls />
      </nav>
    </header>
  );
}

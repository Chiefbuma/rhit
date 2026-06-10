
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className={`px-4 py-2 rounded-md ${isActive ? "bg-gray-200" : "hover:bg-gray-100"}`}>
      {children}
    </Link>
  );
}

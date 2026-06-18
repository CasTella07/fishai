"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export function UserChip() {
  const { user, loading } = useAuth();
  if (loading || !user) return null;

  const handle  = user.email?.split("@")[0] ?? "user";
  const initial = handle.slice(0, 1).toUpperCase();

  return (
    <Link
      href="/analysis"
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full active:opacity-70"
      style={{
        background: "rgba(34,211,238,0.1)",
        border: "1px solid rgba(34,211,238,0.25)",
      }}
    >
      <div
        className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
        style={{ background: "#22D3EE", color: "#07111F" }}
      >
        {initial}
      </div>
      <span className="text-[10px] font-semibold max-w-[70px] truncate" style={{ color: "#22D3EE" }}>
        {handle}
      </span>
    </Link>
  );
}

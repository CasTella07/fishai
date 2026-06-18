"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* ── Icons (outline, 22×22) ─────────────────────── */
function IconHome({ active }: { active: boolean }) {
  const s = active ? "#E2EAF4" : "#516070";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke={s} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12L12 3L21 12V20a1 1 0 0 1-1 1H15V16H9V21H4a1 1 0 0 1-1-1V12z" />
    </svg>
  );
}
function IconBot({ active }: { active: boolean }) {
  const s = active ? "#E2EAF4" : "#516070";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke={s} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="13" rx="2.5" />
      <path d="M12 8V5" />
      <circle cx="12" cy="4" r="1" fill={s} stroke="none" />
      <circle cx="8.5" cy="14" r="1.2" fill={s} stroke="none" />
      <circle cx="15.5" cy="14" r="1.2" fill={s} stroke="none" />
      <path d="M9 18h6" />
    </svg>
  );
}
function IconClipboard({ active }: { active: boolean }) {
  const s = active ? "#E2EAF4" : "#516070";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke={s} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7C5.9 5 5 5.9 5 7V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V7C19 5.9 18.1 5 17 5H15" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  );
}
function IconUser({ active }: { active: boolean }) {
  const s = active ? "#E2EAF4" : "#516070";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke={s} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const ITEMS = [
  { label: "ホーム",    href: "/",          Icon: IconHome      },
  { label: "AI相談",    href: "/ai-chat",   Icon: IconBot       },
  { label: "記録",      href: "/catch-log", Icon: IconClipboard },
  { label: "マイページ", href: "/analysis", Icon: IconUser      },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 z-50 nav-safe"
      style={{
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 430,
        background: "rgba(7,17,31,0.92)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex justify-around items-center px-2 pt-2">
        {ITEMS.map(({ label, href, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl min-w-0 relative"
            >
              <Icon active={active} />
              <span
                className="text-[10px] font-medium leading-none"
                style={{ color: active ? "#E2EAF4" : "#516070" }}
              >
                {label}
              </span>
              {active && (
                <span
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full"
                  style={{ background: "#22D3EE" }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { TIDE_LOCATIONS } from "@/data/tideLocations";

export function SpotPickerSheet({ currentId }: { currentId: string }) {
  const [open, setOpen]       = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  /* createPortal は SSR では使えないので、クライアント mount 後にフラグを立てる */
  useEffect(() => { setMounted(true); }, []);

  /* モーダルが開いている間は背景スクロールを止める */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const close  = () => setOpen(false);
  const select = (id: string) => {
    close();
    router.push(`/?spot=${id}`);
  };

  const modal = (
    <>
      {/* backdrop — document.body 直下なので backdropFilter の影響を受けない */}
      <div
        onClick={close}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,.65)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />

      {/* bottom sheet */}
      <div
        style={{
          position: "fixed", bottom: 0,
          left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 430,
          zIndex: 201,
        }}
      >
        <div
          style={{
            background: "#0D1B2E",
            borderRadius: "24px 24px 0 0",
            border: "1px solid rgba(255,255,255,.1)",
            borderBottom: "none",
            overflow: "hidden",
          }}
        >
          {/* handle */}
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 12 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,.18)" }} />
          </div>

          {/* header */}
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px 12px",
              borderBottom: "1px solid rgba(255,255,255,.07)",
            }}
          >
            <p style={{ color: "#E2EAF4", fontWeight: 700, fontSize: 16 }}>ポイントを変更</p>
            <button
              onClick={close}
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(255,255,255,.07)",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="rgba(255,255,255,.5)" strokeWidth={2.5} strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* list */}
          <div
            style={{
              overflowY: "auto",
              maxHeight: "60dvh",
              paddingBottom: "calc(max(16px, env(safe-area-inset-bottom)) + 64px)",
            }}
          >
            {TIDE_LOCATIONS.map((loc) => {
              const active = loc.id === currentId;
              return (
                <button
                  key={loc.id}
                  onClick={() => select(loc.id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    padding: "14px 20px",
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid rgba(255,255,255,.05)",
                    cursor: "pointer", textAlign: "left",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ color: active ? "#22d3ee" : "#E2EAF4", fontWeight: 600, fontSize: 14 }}>
                        {loc.name}
                      </span>
                      <span style={{
                        fontSize: 10, padding: "2px 6px", borderRadius: 99,
                        color: "#64748b", background: "rgba(255,255,255,.06)",
                      }}>
                        {loc.prefecture}
                      </span>
                      {active && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 99,
                          color: "#22d3ee", background: "rgba(34,211,238,.12)",
                        }}>
                          選択中
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 11, marginTop: 3, color: "#516070", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {loc.mainFish.slice(0, 3).join(" · ")}
                    </p>
                  </div>
                  {active ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                         stroke="#22d3ee" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                         stroke="rgba(255,255,255,.2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          fontSize: 10, fontWeight: 500,
          padding: "2px 8px", borderRadius: 99,
          color: "#516070",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.09)",
          cursor: "pointer",
        }}
      >
        変更
      </button>

      {/* document.body 直下にレンダリング → ヘッダーの backdropFilter に影響されない */}
      {mounted && open && createPortal(modal, document.body)}
    </>
  );
}

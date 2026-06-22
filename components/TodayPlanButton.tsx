"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  IconMapPin, IconClock, IconFish, IconFishHook, IconDiamond, IconAnchor,
} from "@tabler/icons-react";

/* ── Props (all serializable — passed from Server Component) ── */
export interface PlanData {
  decisionType:   string;
  decisionIcon:   string;
  decisionColor:  string;
  decisionBg:     string;
  decisionBorder: string;
  decisionReason: string;
  decisionAction: string;
  spotName:       string;
  spotIcon:       string;
  startTime:      string;
  endTime:        string;
  timeLabel:      string;
  fishName:       string;
  fishEmoji:      string;
  fishScore:      number;
  methodName:     string;
  lureName:       string;
  safetyLevel:    string;
  safetyColor:    string;
  safetyBg:       string;
  safetyMessage:  string;
  safetyIcon:     string;
  goScore:        number;
  captainComment: string;
}

/* ── Component ─────────────────────────────────── */
export function TodayPlanButton({ plan }: { plan: PlanData }) {
  const [open, setOpen] = useState(false);

  // Body scroll lock while sheet is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const rows: { Icon: React.ComponentType<{ size?: number; stroke?: number; color?: string }>; label: string; value: string }[] = [
    { Icon: IconMapPin,    label: "場所",       value: plan.spotName },
    { Icon: IconClock,     label: "時間",       value: `${plan.startTime}〜${plan.endTime}` },
    { Icon: IconFish,      label: "ターゲット", value: `${plan.fishName}（${plan.fishScore}点）` },
    { Icon: IconFishHook,  label: "釣り方",     value: plan.methodName },
    { Icon: IconDiamond,   label: "ルアー",     value: plan.lureName },
  ];

  return (
    <>
      {/* ── Trigger button ─────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between rounded-2xl px-5 py-4 transition-transform active:scale-[.98]"
        style={{
          background: "#0D1B2E",
          border: `1.5px solid ${plan.decisionColor}50`,
        }}
      >
        <div className="flex items-center gap-3.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${plan.decisionColor}18`, border: `1px solid ${plan.decisionColor}30` }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke={plan.decisionColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-[16px] font-black leading-tight" style={{ color: plan.decisionColor }}>
              今日どうする？
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "#8AA0B5" }}>
              場所・時間・仕掛けをまとめて確認
            </p>
          </div>
        </div>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${plan.decisionColor}18` }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
               stroke={plan.decisionColor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </button>

      {/* ── Bottom sheet portal ─────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end"
          style={{ left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430 }}
        >
          {/* Backdrop (full viewport) */}
          <div
            className="fixed inset-0"
            style={{ background: "rgba(0,0,0,.65)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <div
            className="relative w-full rounded-t-[28px] overflow-hidden"
            style={{
              background: "#0A1828",
              border: "1px solid rgba(255,255,255,.12)",
              borderBottom: "none",
              maxHeight: "90dvh",
              overflowY: "auto",
              zIndex: 1,
            }}
          >
            {/* Sticky drag handle + title */}
            <div
              className="sticky top-0 pt-3 z-10"
              style={{ background: "#0A1828", borderBottom: "1px solid rgba(255,255,255,.08)" }}
            >
              <div className="flex justify-center mb-2">
                <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,.15)" }} />
              </div>
              <div className="flex items-center justify-between px-5 pb-3">
                <h2 className="text-[18px] font-black text-white">今日の完全プラン</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,.08)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                       stroke="#7c92ab" strokeWidth={2.5} strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-5 pt-4 pb-10">

              {/* Decision + score */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                  style={{ background: plan.decisionBg, border: `1px solid ${plan.decisionBorder}` }}
                >
                  <span className="text-[20px] leading-none">{plan.decisionIcon}</span>
                  <span className="text-[18px] font-black" style={{ color: plan.decisionColor }}>
                    {plan.decisionType}
                  </span>
                </div>
                <div className="flex items-baseline gap-0.5">
                  <span className="font-black text-[32px] num-tab" style={{ color: plan.decisionColor }}>
                    {plan.goScore}
                  </span>
                  <span className="text-[14px]" style={{ color: "#64748b" }}>/100</span>
                </div>
              </div>

              {/* Plan rows */}
              <div
                className="rounded-2xl overflow-hidden mb-4"
                style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}
              >
                {rows.map((row, i) => (
                  <div
                    key={row.label}
                    className={`flex items-center gap-3 px-4 py-3.5 ${i < rows.length - 1 ? "border-b" : ""}`}
                    style={{ borderColor: "rgba(255,255,255,.06)" }}
                  >
                    <row.Icon size={18} stroke={1.5} color="#516070" />
                    <span className="text-[11px] w-[4.5rem] flex-shrink-0 font-medium" style={{ color: "#64748b" }}>
                      {row.label}
                    </span>
                    <span className="text-[14px] font-semibold" style={{ color: "#e8f1fc" }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Safety */}
              <div
                className="rounded-2xl px-4 py-4 mb-4 flex items-start gap-3"
                style={{ background: plan.safetyBg, border: `1px solid ${plan.safetyColor}38` }}
              >
                <span className="text-[20px] leading-none mt-0.5 flex-shrink-0">{plan.safetyIcon}</span>
                <div>
                  <p className="text-[11px] font-bold mb-1" style={{ color: plan.safetyColor }}>
                    安全判定：{plan.safetyLevel}
                  </p>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#c5d5e8" }}>
                    {plan.safetyMessage}
                  </p>
                </div>
              </div>

              {/* Captain comment */}
              <div
                className="rounded-2xl px-4 py-4 mb-4"
                style={{ background: "rgba(14,165,233,.06)", border: "1px solid rgba(14,165,233,.18)" }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <IconAnchor size={14} stroke={1.5} color="#0ea5e9" />
                  <p className="text-[10px] font-bold tracking-widest" style={{ color: "#0ea5e9" }}>
                    船長より
                  </p>
                </div>
                <p className="text-[13px] leading-relaxed" style={{ color: "#c5d5e8" }}>
                  {plan.captainComment}
                </p>
              </div>

              {/* Action */}
              <div
                className="rounded-2xl px-4 py-3.5 mb-5"
                style={{ background: `${plan.decisionColor}0e`, border: `1px solid ${plan.decisionColor}28` }}
              >
                <p className="text-[14px] font-bold" style={{ color: plan.decisionColor }}>
                  ▶ {plan.decisionAction}
                </p>
              </div>

              {/* CTA */}
              <Link
                href={`/ai-chat?q=${encodeURIComponent(`今日${plan.spotName}で${plan.fishName}を狙いたい。最適な仕掛けと釣り方を詳しく教えてください`)}&mode=today`}
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl transition-transform active:scale-[.98]"
                style={{ background: "rgba(14,165,233,.12)", border: "1px solid rgba(14,165,233,.28)", color: "#0ea5e9" }}
              >
                <span className="text-[15px] font-bold">AI船長に詳しく相談する</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

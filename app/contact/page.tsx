"use client";

import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [type, setType] = useState("feedback");
  const [message, setMessage] = useState("");

  const TYPES = [
    { id: "feedback",  label: "フィードバック", icon: "💬" },
    { id: "bug",       label: "不具合報告",      icon: "🐛" },
    { id: "request",   label: "機能リクエスト",  icon: "✨" },
    { id: "other",     label: "その他",           icon: "📝" },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    // β版: 実際の送信はせず、感謝画面を表示
    setSent(true);
  }

  if (sent) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-6" style={{ background: "#030b16" }}>
        <div className="text-center max-w-sm">
          <div className="text-[56px] mb-4">🙏</div>
          <p className="text-[20px] font-bold text-white mb-2">ありがとうございます！</p>
          <p className="text-[14px] leading-relaxed mb-8" style={{ color: "#64748b" }}>
            フィードバックを受け取りました。<br />
            β版の改善に活かします。
          </p>
          <Link href="/" className="inline-flex items-center justify-center rounded-2xl px-8 py-3.5 text-[15px] font-bold transition-transform active:scale-[.98]"
                style={{ background: "rgba(14,165,233,.14)", color: "#0ea5e9", border: "1px solid rgba(14,165,233,.3)" }}>
            ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh pb-16" style={{ background: "#030b16" }}>
      <header
        className="sticky top-0 z-40 flex items-center gap-3 px-5 pt-12 pb-4"
        style={{ background: "rgba(3,11,22,.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,.06)" }}
      >
        <Link href="/analysis"
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-4 h-4" style={{ color: "rgba(255,255,255,.6)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div>
          <h1 className="text-[18px] font-bold text-white">お問い合わせ</h1>
          <p className="text-[11px]" style={{ color: "#64748b" }}>β版へのご意見・ご感想をお聞かせください</p>
        </div>
      </header>

      <div className="px-5 pt-6 max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Type selection */}
          <div>
            <p className="text-[12px] font-semibold mb-2.5" style={{ color: "#64748b" }}>種別</p>
            <div className="grid grid-cols-2 gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className="flex items-center gap-2 px-3.5 py-3 rounded-2xl text-left transition-colors"
                  style={{
                    background: type === t.id ? "rgba(14,165,233,.12)" : "rgba(255,255,255,.04)",
                    border: `1px solid ${type === t.id ? "rgba(14,165,233,.35)" : "rgba(255,255,255,.08)"}`,
                    color: type === t.id ? "#0ea5e9" : "#7c92ab",
                  }}
                >
                  <span className="text-[16px]">{t.icon}</span>
                  <span className="text-[13px] font-semibold">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <p className="text-[12px] font-semibold mb-2.5" style={{ color: "#64748b" }}>メッセージ</p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="β版の感想・気になった点・改善してほしい機能など、なんでもお聞かせください。"
              rows={6}
              className="w-full rounded-2xl px-4 py-3.5 text-[14px] leading-relaxed resize-none outline-none"
              style={{
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.1)",
                color: "#e8f1fc",
              }}
            />
          </div>

          {/* Note */}
          <div
            className="rounded-2xl px-4 py-3"
            style={{ background: "rgba(14,165,233,.05)", border: "1px solid rgba(14,165,233,.12)" }}
          >
            <p className="text-[11px] leading-relaxed" style={{ color: "#64748b" }}>
              β版期間中のフィードバックは開発に直接活かします。
              緊急の安全情報については、必ず公式機関（海上保安庁等）にご連絡ください。
            </p>
          </div>

          <button
            type="submit"
            disabled={!message.trim()}
            className="w-full rounded-2xl py-4 text-[15px] font-black transition-all active:scale-[.98]"
            style={{
              background: message.trim() ? "#0ea5e9" : "rgba(255,255,255,.08)",
              color: message.trim() ? "#030b16" : "#64748b",
              cursor: message.trim() ? "pointer" : "default",
            }}
          >
            送信する
          </button>

        </form>

        <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: "rgba(255,255,255,.06)" }}>
          <p className="text-[12px] mb-3" style={{ color: "#64748b" }}>
            メールでのお問い合わせも受け付けています
          </p>
          <a
            href="mailto:contact@fishai.app"
            className="text-[13px] font-semibold"
            style={{ color: "#0ea5e9" }}
          >
            contact@fishai.app
          </a>
        </div>
      </div>
    </div>
  );
}

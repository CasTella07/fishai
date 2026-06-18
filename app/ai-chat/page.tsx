"use client";

import Link from "next/link";
import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { TIDE_LOCATIONS } from "@/data/tideLocations";

/* ─── TYPES ────────────────────────────────── */
type Message = { role: "user" | "assistant"; content: string };

/* ─── MODE CHIPS ────────────────────────────── */
// spotName を受け取って動的スターターを生成する関数
function buildModes(spotName: string) {
  return [
    {
      id: "today",
      icon: "🎯",
      label: "今日の狙い目",
      color: "#06b6d4",
      bg: "rgba(6,182,212,.12)",
      border: "rgba(6,182,212,.3)",
      starter: `今日の${spotName}で何が狙えますか？\n狙い目の魚種、おすすめの時間帯・釣り方を教えてください。`,
    },
    {
      id: "tackle",
      icon: "🧰",
      label: "仕掛け提案",
      color: "#a78bfa",
      bg: "rgba(167,139,250,.12)",
      border: "rgba(167,139,250,.3)",
      starter: `${spotName}での仕掛けを提案してください。\n\n🎣 狙う魚（例: ヒラメ・シーバス）：\n💰 予算：`,
    },
    {
      id: "condition",
      icon: "🌊",
      label: "コンディション判断",
      color: "#38bdf8",
      bg: "rgba(56,189,248,.12)",
      border: "rgba(56,189,248,.3)",
      starter: `今日の${spotName}の釣りコンディションを総合判断してください。今行く価値はありますか？`,
    },
    {
      id: "recipe",
      icon: "🍽️",
      label: "レシピ提案",
      color: "#10b981",
      bg: "rgba(16,185,129,.12)",
      border: "rgba(16,185,129,.3)",
      starter: "釣った魚の料理を教えてください。\n\n🐟 魚の種類：\n📏 サイズ（例: 35cm）：\n🍳 調理したいもの（例: 刺身・焼き・揚げ）：",
    },
    {
      id: "plan",
      icon: "🗓️",
      label: "釣行プラン",
      color: "#f59e0b",
      bg: "rgba(245,158,11,.12)",
      border: "rgba(245,158,11,.3)",
      starter: `${spotName}への釣行プランを作ってください。\n\n🎣 経験レベル（初心者/中級/上級）：\n⏰ 予定時間（例: 朝6〜10時）：`,
    },
    {
      id: "beginner",
      icon: "🎓",
      label: "初心者モード",
      color: "#fb923c",
      bg: "rgba(251,146,60,.12)",
      border: "rgba(251,146,60,.3)",
      starter: "釣り初心者です。専門用語を使わず、湘南エリアでの釣りを分かりやすく教えてください。\nまず何から始めればいいですか？",
    },
  ];
}

/* ─── INNER PAGE (searchParams使用) ──────────── */
function AiChatInner() {
  const searchParams = useSearchParams();
  const initialQ    = searchParams.get("q") ?? "";
  const initialMode = searchParams.get("mode") ?? "";
  const spotId      = searchParams.get("spot") ?? "chigasaki";

  const spotLoc = TIDE_LOCATIONS.find((l) => l.id === spotId) ?? TIDE_LOCATIONS[0];
  const MODES   = buildModes(spotLoc.name);

  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState(initialQ);
  const [activeMode, setActiveMode] = useState<string | null>(
    initialMode ? (MODES.find((m) => m.id === initialMode)?.id ?? null) : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef    = useRef<HTMLDivElement>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);

  /* auto-send when ?q= is provided */
  const didAutoSend = useRef(false);
  useEffect(() => {
    if (initialQ && !didAutoSend.current) {
      didAutoSend.current = true;
      sendMessage(initialQ);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setIsLoading(true);

    setMessages([...next, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, spotId }),
      });
      if (!res.ok || !res.body) {
        throw new Error(`API error ${res.status}: ${await res.text()}`);
      }
      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          return [...prev.slice(0, -1), { ...last, content: last.content + chunk }];
        });
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      console.error("[ai-chat] sendMessage error:", raw);
      const friendlyError = raw.includes("401") || raw.includes("403")
        ? `AIサービスの認証に問題があります。\n詳細: ${raw}`
        : raw.includes("429") || raw.includes("529")
        ? `アクセスが集中しています。少し時間をおいてお試しください。\n詳細: ${raw}`
        : raw.includes("500") || raw.includes("502") || raw.includes("503")
        ? `サーバーで問題が発生しました。\n詳細: ${raw}`
        : `通信エラーが発生しました。\n詳細: ${raw}`;
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: friendlyError },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function selectMode(mode: typeof MODES[number]) {
    setActiveMode(mode.id);
    setInput(mode.starter);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  }

  const hasMessages = messages.length > 0;
  const activeModeData = MODES.find((m) => m.id === activeMode);

  return (
    <div className="flex flex-col" style={{ background: "#080f1c", height: "100dvh", paddingBottom: "calc(56px + env(safe-area-inset-bottom))" }}>

      {/* ── HEADER ─────────────────────────────── */}
      <header className="flex items-center gap-3 px-4 pt-12 pb-3 border-b"
              style={{ background: "rgba(8,15,28,.98)", borderColor: "rgba(255,255,255,.06)" }}>
        <Link href="/"
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 text-white/60"
              style={{ background: "rgba(255,255,255,.06)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div className="flex-1">
          <p className="text-white font-bold text-[16px] leading-tight">
            Fish<span style={{ color: "#22d3ee" }}>AI</span>
            {activeModeData && (
              <span className="ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ color: activeModeData.color, background: activeModeData.bg }}>
                {activeModeData.icon} {activeModeData.label}
              </span>
            )}
          </p>
          <p className="text-slate-500 text-[11px]">
            {spotLoc.name}
            <span className="mx-1 opacity-40">·</span>
            リアルタイム天気・潮汐参照中
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
             style={{ background: "rgba(16,185,129,.15)", border: "1px solid rgba(16,185,129,.25)" }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#34d399" }} />
          <span className="text-[10px] font-bold" style={{ color: "#34d399" }}>オンライン</span>
        </div>
      </header>

      {/* ── MODE CHIPS ─────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto px-4 py-2.5"
           style={{ background: "rgba(8,15,28,.95)", backdropFilter: "blur(12px)", scrollbarWidth: "none",
                    borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        {MODES.map((m) => {
          const sel = activeMode === m.id;
          return (
            <button key={m.id}
                    onClick={() => selectMode(m)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95"
                    style={{
                      background: sel ? m.bg : "rgba(255,255,255,.06)",
                      border: `1px solid ${sel ? m.border : "rgba(255,255,255,.1)"}`,
                      color: sel ? m.color : "#64748b",
                    }}>
              <span className="text-[14px] leading-none">{m.icon}</span>
              {m.label}
            </button>
          );
        })}
      </div>

      {/* ── CHAT AREA ──────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4">

        {/* Greeting */}
        <div className="flex items-end gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[14px] flex-shrink-0"
               style={{ background: "linear-gradient(135deg,#0891b2,#1d4ed8)" }}>
            🤖
          </div>
          <div className="rounded-2xl rounded-bl-sm px-4 py-3 max-w-[82%] border border-white/8"
               style={{ background: "#0d1829" }}>
            <p className="text-white text-[13px] leading-relaxed">
              こんにちは！湘南エリア専属のFishAIです🎣<br />
              <span style={{ color: "#22d3ee" }}>茅ヶ崎・平塚・江ノ島・相模川・大磯</span>の<br />
              釣りなら何でも聞いてください！<br />
              <br />
              上のチップからモードを選ぶと<br />
              AIが最適な質問を準備します。
            </p>
          </div>
        </div>

        {/* Mode guide — before first message */}
        {!hasMessages && (
          <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: "#0d1829" }}>
            <div className="px-4 py-3 border-b border-white/8">
              <p className="text-slate-400 text-[11px] font-black tracking-widest uppercase">できること</p>
            </div>
            {MODES.map((m) => (
              <button key={m.id}
                      onClick={() => selectMode(m)}
                      className="w-full flex items-center gap-3 px-4 py-3 border-b border-white/6 last:border-b-0 text-left active:bg-white/4 transition-colors">
                <span className="w-8 h-8 rounded-xl flex items-center justify-center text-[16px] flex-shrink-0"
                      style={{ background: m.bg, border: `1px solid ${m.border}` }}>
                  {m.icon}
                </span>
                <span className="text-white text-[13px] font-semibold">{m.label}</span>
                <span className="ml-auto text-slate-600 text-[16px]">›</span>
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) =>
          msg.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="rounded-2xl rounded-br-sm px-4 py-3 max-w-[82%]"
                   style={{ background: "linear-gradient(135deg,#0891b2,#1e40af)" }}>
                <p className="text-white text-[13px] leading-relaxed whitespace-pre-line">{msg.content}</p>
              </div>
            </div>
          ) : (
            <div key={i} className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[14px] flex-shrink-0"
                   style={{ background: "linear-gradient(135deg,#0891b2,#1d4ed8)" }}>
                🤖
              </div>
              <div className="rounded-2xl rounded-bl-sm px-4 py-3 max-w-[82%] border border-white/8"
                   style={{ background: "#0d1829" }}>
                {msg.content ? (
                  <p className="text-white text-[13px] leading-relaxed whitespace-pre-line">{msg.content}</p>
                ) : (
                  <div className="flex gap-1 py-1">
                    <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                )}
              </div>
            </div>
          )
        )}

        <div ref={bottomRef} />
      </main>

      {/* ── INPUT BAR ──────────────────────────── */}
      <div className="flex-shrink-0 border-t border-white/8 px-4 py-3 flex items-end gap-2"
           style={{ background: "rgba(8,15,28,.98)", backdropFilter: "blur(16px)" }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力... (Shift+Enterで改行)"
          rows={1}
          disabled={isLoading}
          className="flex-1 resize-none rounded-2xl px-4 py-3 text-[13px] text-white placeholder:text-slate-600 outline-none transition-colors max-h-36 disabled:opacity-50"
          style={{
            background: "#0d1829",
            border: "1px solid rgba(255,255,255,.1)",
            lineHeight: "1.5",
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          className="w-11 h-11 rounded-full flex items-center justify-center text-white flex-shrink-0 disabled:opacity-30 active:scale-95 transition-all"
          style={{ background: "linear-gradient(135deg,#0891b2,#1d4ed8)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>
        </button>
      </div>
      <BottomNav />
    </div>
  );
}

/* ─── PAGE (Suspense wrapper for useSearchParams) ── */
export default function AiChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080f1c" }}>
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    }>
      <AiChatInner />
    </Suspense>
  );
}

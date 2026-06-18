"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { SHONAN_FISH, SHONAN_SPOTS } from "@/data/shonanData";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/components/AuthProvider";
import type { CatchAnalysisResult } from "@/app/api/analyze-catch/route";

/* ─── 定数 ──────────────────────────────────────────── */

const METHODS = ["サビキ", "ルアー", "投げ釣り", "フカセ", "ヘチ釣り", "ジギング", "テンヤ", "ライトゲーム", "穴釣り", "泳がせ", "その他"];

const TIME_SLOTS = [
  { label: "朝マズメ", sub: "〜7時",    icon: "🌅", color: "#f59e0b" },
  { label: "朝",       sub: "7〜10時",  icon: "☀️", color: "#fbbf24" },
  { label: "昼",       sub: "10〜15時", icon: "🌤️", color: "#94a3b8" },
  { label: "夕マズメ", sub: "15〜18時", icon: "🌇", color: "#fb923c" },
  { label: "夜",       sub: "18時〜",   icon: "🌙", color: "#a78bfa" },
];

const BG   = "#080f1c";
const CARD = "rgba(255,255,255,.05)";
const BORDER = "rgba(255,255,255,.1)";
const CYAN = "#22d3ee";

/* ─── 履歴レコード型 ─────────────────────────────────── */

interface DisplayRecord {
  id: string;
  fishName: string;
  emoji: string;
  sizeCm: number | null;
  count: number;
  location: string | null;
  timeSlot: string | null;
  method: string | null;
  bait: string | null;
  note: string | null;
  date: string;
  photoUrl: string | null;
  aiConfidence: string | null;
  aiSizeNote: string | null;
}

/* ─── 画像を Canvas で圧縮し base64 を返す ──────────── */

function compressImage(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX = 1024;
        const scale = img.width > MAX ? MAX / img.width : 1;
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        resolve({ base64: dataUrl.split(",")[1], mimeType: "image/jpeg" });
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/* ─── 魚名 → emoji ──────────────────────────────────── */

function fishEmoji(name: string): string {
  return SHONAN_FISH.find((f) => f.name === name)?.emoji ?? "🐟";
}

/* ══════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════ */

export default function CatchLogPage() {
  const { user, supabase } = useAuth();

  /* ── tab ── */
  const [tab, setTab] = useState<"form" | "history">("form");

  /* ── form state ── */
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile,    setPhotoFile]    = useState<File | null>(null);
  const [selectedFish,    setSelectedFish]    = useState<string | null>(null);
  const [customFishName,  setCustomFishName]  = useState("");
  const [sizeStr,      setSizeStr]      = useState("");
  const [countStr,     setCountStr]     = useState("1");
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [customSpot,   setCustomSpot]   = useState("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [bait,  setBait]  = useState("");
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().split("T")[0]);
  const [memo,  setMemo]  = useState("");

  /* ── AI state ── */
  type AiState = "idle" | "analyzing" | "done" | "error";
  const [aiState,  setAiState]  = useState<AiState>("idle");
  const [aiResult, setAiResult] = useState<CatchAnalysisResult | null>(null);
  const [aiError,  setAiError]  = useState<string | null>(null);

  /* ── save state ── */
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  /* ── post-catch AI feedback ── */
  const [aiFeedback, setAiFeedback] = useState<{ recipeIdeas: string[]; nextTips: string[] } | null>(null);
  const [aiFeedbackLoading, setAiFeedbackLoading] = useState(false);

  /* ── history ── */
  const [historyRecords,  setHistoryRecords]  = useState<DisplayRecord[]>([]);
  const [historyLoading,  setHistoryLoading]  = useState(false);
  const [selectedRecord, setSelectedRecord]  = useState<DisplayRecord | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── 写真選択 ── */
  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setAiState("idle");
    setAiResult(null);
    setAiError(null);
  }

  /* ── AI 判定 ── */
  async function handleAnalyze() {
    if (!photoFile) return;
    setAiState("analyzing");
    setAiError(null);
    try {
      const { base64, mimeType } = await compressImage(photoFile);
      const res = await fetch("/api/analyze-catch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAiError(data.error ?? "AI 判定に失敗しました");
        setAiState("error");
        return;
      }
      const result = data as CatchAnalysisResult;
      setAiResult(result);
      setAiState("done");
      // 魚種を自動セット（未選択の場合のみ）
      if (!selectedFish && result.fishName !== "不明") {
        const matched = SHONAN_FISH.find(
          (f) => f.name === result.fishName || result.fishName.includes(f.name),
        );
        if (matched) {
          setSelectedFish(matched.name);
        } else {
          // 一覧にない魚種 → その他で自由入力欄に入れる
          setSelectedFish("__OTHER__");
          setCustomFishName(result.fishName);
        }
      }
      // AI のサイズ推定を size フィールドにヒント（未入力の場合）
      if (!sizeStr && result.sizeNote) {
        const num = result.sizeNote.match(/(\d+)/);
        if (num) setSizeStr(num[1]);
      }
    } catch {
      setAiError("通信エラーが発生しました");
      setAiState("error");
    }
  }

  /* ── 保存 ── */
  async function handleSave() {
    const actualFishName = selectedFish === "__OTHER__"
      ? customFishName.trim()
      : selectedFish;
    if (!actualFishName || !dateStr) return;
    setSaving(true);

    try {
      let photoUrl: string | null = null;

      if (photoFile && user) {
        const ext = photoFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("catch-photos")
          .upload(path, photoFile, { upsert: true });

        if (uploadError) {
          console.error("Storage upload error:", uploadError.message);
        } else if (uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from("catch-photos")
            .getPublicUrl(uploadData.path);
          photoUrl = publicUrl;
        }
      }

      if (user) {
        const { error } = await supabase.from("catch_records").insert({
          user_id:       user.id,
          fish_name:     actualFishName,
          date:          dateStr,
          location:      selectedSpot
            ? SHONAN_SPOTS.find((s) => s.id === selectedSpot)?.name ?? selectedSpot
            : customSpot || null,
          length_cm:     sizeStr ? parseFloat(sizeStr) : null,
          count:         parseInt(countStr, 10) || 1,
          time_slot:     selectedTime ?? null,
          method:        selectedMethod ?? null,
          bait:          bait || null,
          note:          memo || null,
          photo_url:     photoUrl,
          ai_confidence: aiResult?.confidence ?? null,
          ai_size_note:  aiResult?.sizeNote ?? null,
        });
        if (error) console.error("DB insert error:", error.message);
      } else {
        // localStorage fallback（未ログイン時）
        const record = {
          id:       `catch_${Date.now()}`,
          fish:     actualFishName,
          emoji:    fishEmoji(actualFishName),
          sizeCm:   sizeStr ? parseFloat(sizeStr) : null,
          count:    parseInt(countStr, 10) || 1,
          spot:     (selectedSpot ?? customSpot) || null,
          time:     selectedTime ?? null,
          method:   selectedMethod ?? null,
          bait:     bait || null,
          date:     dateStr,
          memo:     memo || null,
          savedAt:  new Date().toISOString(),
        };
        try {
          const prev = JSON.parse(localStorage.getItem("fishai_catches") ?? "[]");
          localStorage.setItem("fishai_catches", JSON.stringify([record, ...prev.slice(0, 199)]));
        } catch { /* ignore */ }
      }

      setSaved(true);

      // 非同期でAIフィードバック取得（保存完了をブロックしない）
      setAiFeedbackLoading(true);
      fetch("/api/post-catch-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fishName: actualFishName,
          sizeCm: sizeStr ? parseFloat(sizeStr) : null,
          count: parseInt(countStr, 10) || 1,
          location: selectedSpot
            ? SHONAN_SPOTS.find((s) => s.id === selectedSpot)?.name ?? selectedSpot
            : customSpot || null,
          timeSlot: selectedTime ?? null,
          method: selectedMethod ?? null,
          bait: bait || null,
          memo: memo || null,
        }),
      })
        .then((r) => r.json())
        .then((data: { recipeIdeas: string[]; nextTips: string[] }) => setAiFeedback(data))
        .catch(() => { /* silent fail */ })
        .finally(() => setAiFeedbackLoading(false));
    } finally {
      setSaving(false);
    }
  }

  /* ── 履歴ロード ── */
  useEffect(() => {
    if (tab !== "history") return;

    let cancelled = false;
    async function load() {
      setHistoryLoading(true);
      try {
        if (user) {
          const { data } = await supabase
            .from("catch_records")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(60);

          if (!cancelled) {
            setHistoryRecords(
              (data ?? []).map((r) => ({
                id:            r.id,
                fishName:      r.fish_name,
                emoji:         fishEmoji(r.fish_name),
                sizeCm:        r.length_cm ?? null,
                count:         r.count ?? 1,
                location:      r.location ?? null,
                timeSlot:      r.time_slot ?? null,
                method:        r.method ?? null,
                bait:          r.bait ?? null,
                note:          r.note ?? null,
                date:          r.date,
                photoUrl:      r.photo_url ?? null,
                aiConfidence:  r.ai_confidence ?? null,
                aiSizeNote:    r.ai_size_note ?? null,
              })),
            );
          }
        } else {
          const raw = JSON.parse(localStorage.getItem("fishai_catches") ?? "[]") as {
            id: string; fish: string; emoji?: string;
            sizeCm: number | null; count: number;
            spot: string | null; time: string | null;
            method: string | null; date: string;
          }[];
          if (!cancelled) {
            setHistoryRecords(raw.map((r) => ({
              id:           r.id,
              fishName:     r.fish,
              emoji:        r.emoji ?? fishEmoji(r.fish),
              sizeCm:       r.sizeCm,
              count:        r.count,
              location:     r.spot,
              timeSlot:     r.time,
              method:       r.method,
              bait:         (r as { bait?: string | null }).bait ?? null,
              note:         (r as { memo?: string | null }).memo ?? null,
              date:         r.date,
              photoUrl:     null,
              aiConfidence: null,
              aiSizeNote:   null,
            })));
          }
        }
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [tab, user, supabase]);

  /* ── 削除 ── */
  async function handleDelete(id: string) {
    if (user) {
      const { error } = await supabase.from("catch_records").delete().eq("id", id).eq("user_id", user.id);
      if (error) { console.error("delete error:", error.message); return; }
    } else {
      try {
        const prev = JSON.parse(localStorage.getItem("fishai_catches") ?? "[]");
        localStorage.setItem("fishai_catches", JSON.stringify(prev.filter((r: { id: string }) => r.id !== id)));
      } catch { /* ignore */ }
    }
    setHistoryRecords((prev) => prev.filter((r) => r.id !== id));
    setSelectedRecord(null);
  }

  /* ── フォームリセット ── */
  function resetForm() {
    setSaved(false);
    setPhotoPreview(null);
    setPhotoFile(null);
    setSelectedFish(null);
    setCustomFishName("");
    setSizeStr("");
    setCountStr("1");
    setSelectedSpot(null);
    setCustomSpot("");
    setSelectedTime(null);
    setSelectedMethod(null);
    setBait("");
    setMemo("");
    setAiState("idle");
    setAiResult(null);
    setAiError(null);
    setAiFeedback(null);
    setAiFeedbackLoading(false);
  }

  const effectiveFishName = selectedFish === "__OTHER__" ? customFishName.trim() : (selectedFish ?? "");
  const canSave = !!effectiveFishName && !!dateStr;

  /* ── 保存完了画面 ──────────────────────────────────── */
  if (saved) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: BG }}>
        <div className="text-center">
          <div className="text-[64px] mb-4">{fishEmoji(effectiveFishName)}</div>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: "rgba(16,185,129,.2)", border: "2px solid rgba(16,185,129,.4)" }}
          >
            <span className="text-[28px]">✓</span>
          </div>
          <p className="text-white font-black text-[22px] mb-1">釣果を記録しました！</p>
          <p className="text-slate-500 text-[14px] mb-6">
            {effectiveFishName}{sizeStr ? ` ${sizeStr}cm` : ""} {countStr}匹
          </p>
          {!user && (
            <p className="text-amber-400 text-[11px] mb-4 px-4 py-2 rounded-xl"
               style={{ background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.2)" }}>
              ログインすると写真付きで保存・閲覧できます
            </p>
          )}
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <Link
              href={`/recipes?fish=${encodeURIComponent(effectiveFishName)}`}
              className="flex items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-black active:scale-[.98] transition-transform"
              style={{ background: "rgba(34,211,238,.15)", border: "1px solid rgba(34,211,238,.3)", color: CYAN }}
            >
              🍽️ {effectiveFishName}のレシピを見る
            </Link>
            <button
              onClick={() => { resetForm(); setTab("history"); }}
              className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-bold active:scale-[.98] transition-transform border border-white/10"
              style={{ background: "rgba(255,255,255,.05)", color: "#94a3b8" }}
            >
              📋 記録一覧を見る
            </button>
            <button onClick={resetForm} className="text-slate-500 text-[13px] font-medium py-2">
              続けて記録する
            </button>
          </div>

          {/* AI フィードバック */}
          <div className="mt-6 w-full max-w-sm text-left">
            {aiFeedbackLoading ? (
              <div className="flex items-center justify-center gap-2 py-6">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="text-slate-400 text-[13px] ml-1">AIが提案を生成中...</span>
              </div>
            ) : aiFeedback && (
              <>
                <div className="mb-3 p-4 rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                  <p className="text-white font-bold text-[14px] mb-2">🍽️ レシピアイデア</p>
                  {aiFeedback.recipeIdeas.map((r, i) => (
                    <p key={i} className="text-slate-300 text-[13px] leading-relaxed mb-1">{r}</p>
                  ))}
                </div>
                <div className="p-4 rounded-2xl" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                  <p className="text-white font-bold text-[14px] mb-2">📌 次回へのヒント</p>
                  {aiFeedback.nextTips.map((t, i) => (
                    <p key={i} className="text-slate-300 text-[13px] leading-relaxed mb-1">{t}</p>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── メイン ────────────────────────────────────────── */
  return (
    <div className="min-h-screen overflow-x-hidden pb-28" style={{ background: BG }}>

      {/* HEADER */}
      <header
        className="flex items-center gap-3 px-5 pt-12 pb-3 sticky top-0 z-40"
        style={{
          background: "rgba(8,15,28,.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <Link
          href="/"
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 flex-shrink-0"
          style={{ background: "rgba(255,255,255,.06)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-4 h-4 text-white/60">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <p className="text-white font-bold text-[16px] leading-tight flex-1">釣果記録</p>
        {tab === "form" && canSave && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-[12px] font-black px-3.5 py-1.5 rounded-full active:scale-95 transition-all"
            style={{ background: CYAN, color: BG, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "保存中…" : "保存"}
          </button>
        )}
      </header>

      {/* TAB BAR */}
      <div
        className="flex mx-4 mt-3 mb-1 rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,.05)" }}
      >
        {(["form", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2.5 text-[13px] font-bold transition-colors"
            style={{
              background: tab === t ? CYAN : "transparent",
              color: tab === t ? BG : "#64748b",
            }}
          >
            {t === "form" ? "📝 記録する" : "📋 釣果一覧"}
          </button>
        ))}
      </div>

      {/* ──────────────── TAB: FORM ──────────────────── */}
      {tab === "form" && (
        <div className="flex flex-col gap-6 pt-4 px-4">

          {/* ── 写真 + AI ── */}
          <section>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhoto}
            />
            {/* 写真プレビュー or プレースホルダー */}
            <div
              className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border cursor-pointer"
              style={{ borderColor: photoPreview ? "rgba(255,255,255,.12)" : "rgba(34,211,238,.25)", background: photoPreview ? "transparent" : "rgba(34,211,238,.04)" }}
              onClick={() => fileInputRef.current?.click()}
            >
              {photoPreview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreview} alt="釣果写真" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-end p-3 pointer-events-none">
                    <span className="text-white text-[11px] font-bold px-2 py-1 rounded-full" style={{ background: "rgba(0,0,0,.55)" }}>
                      タップして変更
                    </span>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(34,211,238,.12)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7" style={{ color: CYAN }}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                    </svg>
                  </div>
                  <p className="font-bold text-[13px]" style={{ color: CYAN }}>写真を追加</p>
                  <p className="text-[11px]" style={{ color: "#4b6280" }}>撮影またはライブラリから選択</p>
                </div>
              )}
            </div>

            {/* AI 判定ボタン */}
            {photoPreview && aiState !== "done" && (
              <button
                onClick={handleAnalyze}
                disabled={aiState === "analyzing"}
                className="w-full mt-3 py-3 rounded-2xl text-[14px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[.98]"
                style={{
                  background: aiState === "analyzing" ? "rgba(34,211,238,.08)" : "linear-gradient(135deg,rgba(34,211,238,.18),rgba(14,165,233,.18))",
                  border: "1px solid rgba(34,211,238,.3)",
                  color: CYAN,
                  opacity: aiState === "analyzing" ? 0.75 : 1,
                }}
              >
                {aiState === "analyzing" ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: CYAN, borderTopColor: "transparent" }} />
                    AI 判定中…
                  </>
                ) : (
                  <>🤖 AI で魚を判定する</>
                )}
              </button>
            )}

            {/* AI エラー */}
            {aiState === "error" && aiError && (
              <div className="mt-3 px-4 py-3 rounded-2xl text-[12px]" style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", color: "#f87171" }}>
                {aiError}
              </div>
            )}

            {/* AI 結果カード */}
            {aiState === "done" && aiResult && (
              <div
                className="mt-3 px-4 py-4 rounded-2xl"
                style={{ background: "rgba(34,211,238,.07)", border: "1px solid rgba(34,211,238,.25)" }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[22px] leading-none">{fishEmoji(aiResult.fishName)}</span>
                    <div>
                      <p className="text-white font-black text-[16px] leading-none">{aiResult.fishName}</p>
                      {aiResult.sizeNote && (
                        <p className="text-[11px] mt-0.5" style={{ color: "#8AA0B5" }}>{aiResult.sizeNote}</p>
                      )}
                    </div>
                  </div>
                  <ConfidenceBadge value={aiResult.confidence} />
                </div>
                <p className="text-[10px]" style={{ color: "#516070" }}>
                  ↑ 魚種・サイズは下のフォームで確認・修正できます
                </p>
                <button
                  onClick={() => { setAiState("idle"); setAiResult(null); }}
                  className="mt-2 text-[11px] font-semibold underline"
                  style={{ color: "#516070" }}
                >
                  再判定する
                </button>
              </div>
            )}
          </section>

          {/* ── 魚種 ── */}
          <FormSection label="魚種" required>
            <div className="flex flex-wrap gap-2">
              {SHONAN_FISH.map((f) => {
                const sel = selectedFish === f.name;
                return (
                  <button
                    key={f.name}
                    onClick={() => setSelectedFish(sel ? null : f.name)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold border transition-all active:scale-95"
                    style={{
                      background:   sel ? f.catBg : "rgba(255,255,255,.05)",
                      borderColor:  sel ? `${f.catColor}50` : BORDER,
                      color:        sel ? f.catColor : "#64748b",
                      boxShadow:    sel ? `0 0 0 1px ${f.catColor}30` : "none",
                    }}
                  >
                    <span className="text-[16px] leading-none">{f.emoji}</span>
                    {f.name}
                  </button>
                );
              })}
              {/* その他ボタン */}
              <button
                onClick={() => setSelectedFish(selectedFish === "__OTHER__" ? null : "__OTHER__")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold border transition-all active:scale-95"
                style={{
                  background:  selectedFish === "__OTHER__" ? "rgba(148,163,184,.15)" : "rgba(255,255,255,.05)",
                  borderColor: selectedFish === "__OTHER__" ? "rgba(148,163,184,.5)"  : BORDER,
                  color:       selectedFish === "__OTHER__" ? "#e2e8f0" : "#64748b",
                }}
              >
                <span className="text-[16px] leading-none">✏️</span>
                その他
              </button>
            </div>
            {/* その他選択時の自由入力欄 */}
            {selectedFish === "__OTHER__" && (
              <input
                type="text"
                placeholder="魚種名を入力（例: カワハギ、ウマヅラハギ）"
                value={customFishName}
                onChange={(e) => setCustomFishName(e.target.value)}
                autoFocus
                className="mt-2.5 w-full rounded-2xl px-4 py-3 text-white text-[13px] outline-none border"
                style={{ background: "#0d1829", borderColor: "rgba(148,163,184,.4)" }}
              />
            )}
          </FormSection>

          {/* ── サイズ・数 ── */}
          <FormSection label="サイズ・数">
            <div className="flex gap-3">
              <div className="flex-1 rounded-2xl border flex items-center gap-2 px-4" style={{ background: "#0d1829", borderColor: BORDER }}>
                <input
                  type="number" placeholder="0" min="0" max="300"
                  value={sizeStr}
                  onChange={(e) => setSizeStr(e.target.value)}
                  className="flex-1 bg-transparent text-white text-[16px] font-bold outline-none py-3.5"
                />
                <span className="text-slate-500 text-[13px]">cm</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border px-4" style={{ background: "#0d1829", borderColor: BORDER }}>
                <button onClick={() => setCountStr(String(Math.max(1, parseInt(countStr || "1") - 1)))}
                        className="text-white/50 text-[22px] leading-none w-8 text-center active:text-white">−</button>
                <span className="text-white font-black text-[18px] w-8 text-center">{countStr}</span>
                <button onClick={() => setCountStr(String(parseInt(countStr || "1") + 1))}
                        className="text-white/50 text-[22px] leading-none w-8 text-center active:text-white">＋</button>
              </div>
            </div>
          </FormSection>

          {/* ── ポイント ── */}
          <FormSection label="ポイント">
            <div className="flex flex-wrap gap-2 mb-2">
              {SHONAN_SPOTS.map((s) => {
                const sel = selectedSpot === s.id;
                return (
                  <button key={s.id}
                          onClick={() => { setSelectedSpot(sel ? null : s.id); setCustomSpot(""); }}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold border transition-all active:scale-95"
                          style={{
                            background:  sel ? "rgba(34,211,238,.12)" : "rgba(255,255,255,.05)",
                            borderColor: sel ? "rgba(34,211,238,.3)"  : BORDER,
                            color:       sel ? CYAN : "#64748b",
                          }}>
                    <span className="text-[14px] leading-none">{s.icon}</span>
                    {s.name}
                  </button>
                );
              })}
            </div>
            <input
              type="text" placeholder="その他（場所名を入力）"
              value={customSpot}
              onChange={(e) => { setCustomSpot(e.target.value); setSelectedSpot(null); }}
              className="w-full rounded-2xl px-4 py-3 text-white text-[13px] outline-none border"
              style={{ background: "#0d1829", borderColor: BORDER }}
            />
          </FormSection>

          {/* ── 日時 ── */}
          <FormSection label="日時" required>
            <input
              type="date" value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full rounded-2xl px-4 py-3.5 text-white text-[14px] font-bold outline-none border mb-3"
              style={{ background: "#0d1829", borderColor: BORDER, colorScheme: "dark" }}
            />
            <div className="grid grid-cols-5 gap-1.5">
              {TIME_SLOTS.map((t) => {
                const sel = selectedTime === t.label;
                return (
                  <button key={t.label}
                          onClick={() => setSelectedTime(sel ? null : t.label)}
                          className="flex flex-col items-center py-2.5 rounded-xl border text-center transition-all active:scale-95"
                          style={{
                            background:  sel ? `${t.color}18` : "rgba(255,255,255,.05)",
                            borderColor: sel ? `${t.color}45` : BORDER,
                          }}>
                    <span className="text-[16px] leading-none">{t.icon}</span>
                    <span className="text-[10px] font-bold mt-1" style={{ color: sel ? t.color : "#64748b" }}>{t.label}</span>
                    <span className="text-[8px]" style={{ color: sel ? `${t.color}99` : "#374151" }}>{t.sub}</span>
                  </button>
                );
              })}
            </div>
          </FormSection>

          {/* ── 釣法 ── */}
          <FormSection label="釣法">
            <div className="flex flex-wrap gap-2">
              {METHODS.map((m) => {
                const sel = selectedMethod === m;
                return (
                  <button key={m}
                          onClick={() => setSelectedMethod(sel ? null : m)}
                          className="px-3 py-1.5 rounded-xl text-[12px] font-bold border transition-all active:scale-95"
                          style={{
                            background:  sel ? "rgba(34,211,238,.12)" : "rgba(255,255,255,.05)",
                            borderColor: sel ? "rgba(34,211,238,.3)"  : BORDER,
                            color:       sel ? CYAN : "#64748b",
                          }}>
                    {m}
                  </button>
                );
              })}
            </div>
          </FormSection>

          {/* ── エサ / ルアー ── */}
          <FormSection label="エサ / ルアー">
            <input
              type="text" placeholder="例: アオイソメ、メタルジグ20g"
              value={bait} onChange={(e) => setBait(e.target.value)}
              className="w-full rounded-2xl px-4 py-3.5 text-white text-[13px] outline-none border"
              style={{ background: "#0d1829", borderColor: BORDER }}
            />
          </FormSection>

          {/* ── メモ ── */}
          <FormSection label="メモ">
            <textarea
              rows={3} placeholder="天気・潮の状況・気づいたことなど…"
              value={memo} onChange={(e) => setMemo(e.target.value)}
              className="w-full rounded-2xl px-4 py-3.5 text-white text-[13px] outline-none border resize-none"
              style={{ background: "#0d1829", borderColor: BORDER }}
            />
          </FormSection>

          {/* ── 保存ボタン ── */}
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="w-full rounded-2xl font-black text-[15px] transition-all active:scale-[.98] disabled:opacity-30"
            style={{
              background: canSave ? "linear-gradient(135deg,#06b6d4,#0891b2)" : "#1e293b",
              color: "white",
              paddingTop: "16px",
              paddingBottom: "16px",
              boxShadow: canSave ? "0 8px 24px rgba(6,182,212,.3)" : "none",
            }}
          >
            {saving ? "保存中…" : canSave ? "🎣 釣果を保存する" : "魚種と日付を選択してください"}
          </button>

          {!user && (
            <p className="text-center text-[11px] pb-2" style={{ color: "#516070" }}>
              ※ ログインすると写真付きクラウド保存・一覧表示ができます
            </p>
          )}
        </div>
      )}

      {/* ──────────────── TAB: HISTORY ───────────────── */}
      {tab === "history" && (
        <div className="pt-4 px-4">
          {historyLoading ? (
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-2xl h-24 animate-pulse" style={{ background: CARD }} />
              ))}
            </div>
          ) : historyRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-[40px] mb-4">🎣</p>
              <p className="text-white font-bold text-[16px] mb-1">まだ記録がありません</p>
              <p className="text-[13px] mb-6" style={{ color: "#64748b" }}>
                {user ? "最初の釣果を記録しましょう！" : "ログインするとクラウドに保存できます"}
              </p>
              <button
                onClick={() => setTab("form")}
                className="px-5 py-3 rounded-2xl text-[14px] font-bold"
                style={{ background: "rgba(34,211,238,.15)", border: "1px solid rgba(34,211,238,.3)", color: CYAN }}
              >
                記録する →
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pb-4">
              <p className="text-[11px] font-semibold mb-1" style={{ color: "#516070" }}>
                {historyRecords.length} 件の記録
              </p>
              {historyRecords.map((r) => (
                <CatchCard key={r.id} record={r} onSelect={setSelectedRecord} />
              ))}
            </div>
          )}
        </div>
      )}

      <BottomNav />

      {selectedRecord && (
        <CatchDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

/* ─── 釣果カード ─────────────────────────────────────── */

function CatchCard({ record: r, onSelect }: { record: DisplayRecord; onSelect: (r: DisplayRecord) => void }) {
  const dateObj = new Date(r.date);
  const month   = dateObj.getMonth() + 1;
  const day     = dateObj.getDate();
  const dow     = ["日", "月", "火", "水", "木", "金", "土"][dateObj.getDay()];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(r)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(r)}
      className="rounded-2xl overflow-hidden flex cursor-pointer active:opacity-75 transition-opacity"
      style={{ background: CARD, border: `1px solid ${BORDER}` }}
    >
      {/* 写真サムネイル or 絵文字 */}
      <div className="w-24 flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(255,255,255,.03)", minHeight: 96 }}>
        {r.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.photoUrl} alt={r.fishName} className="w-full h-full object-cover" style={{ maxHeight: 120 }} />
        ) : (
          <span className="text-[38px]">{r.emoji}</span>
        )}
      </div>

      {/* 詳細 */}
      <div className="flex-1 min-w-0 px-3.5 py-3">
        <div className="flex items-start justify-between mb-1">
          <p className="text-white font-black text-[16px] leading-tight">
            {r.emoji} {r.fishName}
          </p>
          {r.aiConfidence && (
            <ConfidenceBadge value={r.aiConfidence as "高" | "中" | "低"} small />
          )}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          <span className="text-[11px] font-semibold" style={{ color: CYAN }}>
            {month}/{day}（{dow}）
          </span>
          {r.sizeCm && (
            <span className="text-[11px]" style={{ color: "#8AA0B5" }}>{r.sizeCm}cm</span>
          )}
          {r.count > 1 && (
            <span className="text-[11px]" style={{ color: "#8AA0B5" }}>{r.count}匹</span>
          )}
        </div>
        {(r.location || r.timeSlot || r.method) && (
          <p className="text-[10px] mt-1 truncate" style={{ color: "#516070" }}>
            {[r.location, r.timeSlot, r.method].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── 確信度バッジ ───────────────────────────────────── */

function ConfidenceBadge({ value, small }: { value: "高" | "中" | "低"; small?: boolean }) {
  const map = {
    高: { color: "#10B981", bg: "rgba(16,185,129,.12)" },
    中: { color: "#F59E0B", bg: "rgba(245,158,11,.12)" },
    低: { color: "#94A3B8", bg: "rgba(148,163,184,.12)" },
  };
  const { color, bg } = map[value] ?? map["低"];
  return (
    <span
      className={`font-bold rounded-full flex-shrink-0 ${small ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5"}`}
      style={{ color, background: bg }}
    >
      AI {value}
    </span>
  );
}

/* ─── 詳細モーダル ───────────────────────────────────── */

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      padding: "10px 12px",
      background: "rgba(255,255,255,.04)",
      border: "1px solid rgba(255,255,255,.08)",
      borderRadius: 12,
    }}>
      <p style={{ color: "#516070", fontSize: 9, fontWeight: 700, marginBottom: 3 }}>{label}</p>
      <p style={{ color: "#E2EAF4", fontSize: 13, fontWeight: 600 }}>{value}</p>
    </div>
  );
}

function CatchDetailModal({ record: r, onClose, onDelete }: {
  record: DisplayRecord;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const dateObj = new Date(r.date);
  const year  = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day   = dateObj.getDate();
  const dow   = ["日", "月", "火", "水", "木", "金", "土"][dateObj.getDay()];

  if (!mounted) return null;

  const modal = (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,.72)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />

      {/* sheet */}
      <div style={{
        position: "fixed",
        top: "env(safe-area-inset-top, 0px)",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 430,
        zIndex: 201,
        display: "flex",
        flexDirection: "column",
        background: "#080f1c",
        borderRadius: "24px 24px 0 0",
        overflow: "hidden",
        maxHeight: "calc(100dvh - env(safe-area-inset-top, 0px))",
      }}>
        {/* handle + header */}
        <div style={{ flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,.07)" }}>
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 12 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,.18)" }} />
          </div>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 20px 14px",
          }}>
            <p style={{ color: "#E2EAF4", fontWeight: 700, fontSize: 16 }}>釣果詳細</p>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(255,255,255,.07)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke="rgba(255,255,255,.5)" strokeWidth={2.5} strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* scrollable body */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* photo or emoji hero */}
          {r.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.photoUrl} alt={r.fishName}
                 style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{
              width: "100%", aspectRatio: "4/3",
              background: "rgba(255,255,255,.03)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 80,
            }}>
              {r.emoji}
            </div>
          )}

          <div style={{ padding: "20px 20px 0" }}>
            {/* fish name + badge */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
              <p style={{ color: "white", fontSize: 22, fontWeight: 900, lineHeight: 1.2 }}>
                {r.emoji} {r.fishName}
              </p>
              {r.aiConfidence && (
                <ConfidenceBadge value={r.aiConfidence as "高" | "中" | "低"} />
              )}
            </div>
            <p style={{ color: CYAN, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
              {year}年{month}月{day}日（{dow}）
            </p>

            {/* size + count */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <DetailCell label="サイズ" value={r.sizeCm ? `${r.sizeCm}cm` : "—"} />
              <DetailCell label="数" value={`${r.count}匹`} />
            </div>

            {/* location */}
            {r.location && (
              <div style={{ marginBottom: 8 }}>
                <DetailCell label="ポイント" value={r.location} />
              </div>
            )}

            {/* time + method */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              <DetailCell label="時間帯" value={r.timeSlot ?? "—"} />
              <DetailCell label="釣法" value={r.method ?? "—"} />
            </div>

            {/* bait */}
            {r.bait && (
              <div style={{ marginBottom: 8 }}>
                <DetailCell label="エサ / ルアー" value={r.bait} />
              </div>
            )}

            {/* AI result */}
            {(r.aiConfidence || r.aiSizeNote) && (
              <div style={{
                padding: "12px 14px",
                background: "rgba(34,211,238,.06)",
                border: "1px solid rgba(34,211,238,.2)",
                borderRadius: 16,
                marginBottom: 8,
              }}>
                <p style={{ color: CYAN, fontSize: 10, fontWeight: 700, marginBottom: 8 }}>AI 判定結果</p>
                {r.aiConfidence && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: r.aiSizeNote ? 4 : 0 }}>
                    <span style={{ color: "#8AA0B5", fontSize: 12 }}>信頼度</span>
                    <span style={{ color: "white", fontSize: 12, fontWeight: 600 }}>{r.aiConfidence}</span>
                  </div>
                )}
                {r.aiSizeNote && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#8AA0B5", fontSize: 12 }}>サイズ推定</span>
                    <span style={{ color: "white", fontSize: 12, fontWeight: 600 }}>{r.aiSizeNote}</span>
                  </div>
                )}
              </div>
            )}

            {/* note */}
            {r.note && (
              <div style={{
                padding: "12px 14px",
                background: "rgba(255,255,255,.04)",
                border: "1px solid rgba(255,255,255,.08)",
                borderRadius: 16,
                marginBottom: 8,
              }}>
                <p style={{ color: "#516070", fontSize: 10, fontWeight: 700, marginBottom: 6 }}>メモ</p>
                <p style={{ color: "#8AA0B5", fontSize: 13, lineHeight: 1.65 }}>{r.note}</p>
              </div>
            )}

            <div style={{ height: 8 }} />
          </div>
        </div>

        {/* delete button */}
        <div style={{
          flexShrink: 0,
          padding: "12px 20px",
          paddingBottom: "calc(max(12px, env(safe-area-inset-bottom)) + 64px)",
          borderTop: "1px solid rgba(255,255,255,.07)",
        }}>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{
                width: "100%", padding: "14px",
                borderRadius: 14,
                background: "rgba(239,68,68,.1)",
                border: "1px solid rgba(239,68,68,.2)",
                color: "#f87171",
                fontSize: 14, fontWeight: 700,
                cursor: "pointer",
              }}
            >
              この記録を削除
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={() => onDelete(r.id)}
                style={{
                  width: "100%", padding: "14px",
                  borderRadius: 14,
                  background: "rgba(239,68,68,.25)",
                  border: "1px solid rgba(239,68,68,.5)",
                  color: "#fca5a5",
                  fontSize: 14, fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                本当に削除する
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{
                  width: "100%", padding: "10px",
                  background: "transparent", border: "none",
                  color: "#64748b", fontSize: 12, cursor: "pointer",
                }}
              >
                キャンセル
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(modal, document.body);
}

/* ─── FormSection ─────────────────────────────────────── */

function FormSection({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-1.5 mb-2.5">
        <p className="text-white font-bold text-[14px]">{label}</p>
        {required && (
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ color: CYAN, background: "rgba(34,211,238,.12)" }}>
            必須
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

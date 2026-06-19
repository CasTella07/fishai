"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

/* ── constants ──────────────────────────────────────────────── */

const PURPOSE_OPTIONS = [
  "シーバス","サーフヒラメ","ライト五目","エギング","アジング",
  "メバリング","ジギング","タイラバ","渓流","ブラックバス","その他",
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:bg-white transition-colors";

/* ── types ──────────────────────────────────────────────────── */

interface Tackle {
  id: string;
  rod:     string | null;
  reel:    string | null;
  line:    string | null;
  leader:  string | null;
  lure:    string | null;
  purpose: string | null;
  memo:    string | null;
}

/* ── sub-components ─────────────────────────────────────────── */

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider px-4 pt-5 pb-2 bg-slate-50 border-t border-b border-slate-100">
      {children}
    </p>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 px-4 py-3 border-b border-slate-100">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function TackleCard({ tackle, onDelete }: { tackle: Tackle; onDelete: (id: string) => void }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="mx-4 rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-50">
        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth={1.6} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">{tackle.rod ?? "（ロッド名なし）"}</p>
          {tackle.purpose && (
            <p className="text-xs text-blue-600 font-medium mt-0.5">{tackle.purpose}</p>
          )}
        </div>
        {confirming ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(tackle.id)}
              className="text-xs font-bold text-white bg-red-500 px-2.5 py-1 rounded-lg active:bg-red-600"
            >
              削除
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs font-semibold text-slate-500 px-2 py-1"
            >
              戻る
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="text-slate-400 p-1.5 rounded-lg hover:bg-slate-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        )}
      </div>

      {/* Card body */}
      <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2">
        {tackle.reel && (
          <div>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">リール</p>
            <p className="text-xs text-slate-700 mt-0.5">{tackle.reel}</p>
          </div>
        )}
        {tackle.line && (
          <div>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">ライン</p>
            <p className="text-xs text-slate-700 mt-0.5">{tackle.line}</p>
          </div>
        )}
        {tackle.leader && (
          <div>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">リーダー</p>
            <p className="text-xs text-slate-700 mt-0.5">{tackle.leader}</p>
          </div>
        )}
        {tackle.lure && (
          <div>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">ルアー / 仕掛け</p>
            <p className="text-xs text-slate-700 mt-0.5 truncate">{tackle.lure}</p>
          </div>
        )}
        {tackle.memo && (
          <div className="col-span-2">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">メモ</p>
            <p className="text-xs text-slate-500 mt-0.5">{tackle.memo}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════ */

export default function TacklePage() {
  const { user, supabase } = useAuth();

  /* ── data state ── */
  const [tackles, setTackles] = useState<Tackle[]>([]);
  const [listLoading, setListLoading] = useState(false);

  /* ── form state ── */
  const [rod,     setRod]     = useState("");
  const [reel,    setReel]    = useState("");
  const [line,    setLine]    = useState("");
  const [leader,  setLeader]  = useState("");
  const [lure,    setLure]    = useState("");
  const [purpose, setPurpose] = useState("");
  const [memo,    setMemo]    = useState("");
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  /* ── load tackles ── */
  useEffect(() => {
    if (!user || !supabase) return;
    setListLoading(true);
    void (async () => {
      try {
        const { data } = await supabase
          .from("tackles")
          .select("id, rod, reel, line, leader, lure, purpose, memo")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        setTackles(data ?? []);
      } finally {
        setListLoading(false);
      }
    })();
  }, [user, supabase]);

  /* ── save ── */
  async function handleSave() {
    if (!user || !supabase) return;
    if (!rod.trim() && !purpose.trim()) return;
    setSaving(true);
    setSaved(false);
    try {
      const { data, error } = await supabase
        .from("tackles")
        .insert({
          user_id: user.id,
          rod:     rod     || null,
          reel:    reel    || null,
          line:    line    || null,
          leader:  leader  || null,
          lure:    lure    || null,
          purpose: purpose || null,
          memo:    memo    || null,
        })
        .select("id, rod, reel, line, leader, lure, purpose, memo")
        .single();

      if (!error && data) {
        setTackles((prev) => [data, ...prev]);
        setRod(""); setReel(""); setLine(""); setLeader(""); setLure(""); setPurpose(""); setMemo("");
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  /* ── delete ── */
  async function handleDelete(id: string) {
    if (!supabase) return;
    await supabase.from("tackles").delete().eq("id", id);
    setTackles((prev) => prev.filter((t) => t.id !== id));
  }

  /* ── render ── */
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* Header */}
      <header className="bg-gradient-to-br from-blue-600 to-blue-700 px-4 pt-12 pb-4 flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20 text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-white font-bold text-lg leading-tight">タックルを登録する</h1>
          <p className="text-blue-100 text-xs">タックルボックスを管理しよう</p>
        </div>
        {user && tackles.length > 0 && (
          <div className="bg-white/20 rounded-full px-3 py-1">
            <span className="text-white text-xs font-medium">{tackles.length}件</span>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto">

        {/* not logged in */}
        {!user && (
          <div className="mx-4 mt-6 rounded-2xl bg-blue-50 border border-blue-100 px-5 py-5">
            <p className="text-[14px] font-bold text-blue-700 mb-1">ログインが必要です</p>
            <p className="text-[12px] text-blue-600 leading-relaxed mb-3">
              タックルを保存するにはアカウントが必要です。
            </p>
            <Link
              href="/analysis"
              className="inline-block text-[13px] font-bold text-white bg-blue-600 px-4 py-2 rounded-xl active:bg-blue-700"
            >
              ログイン / 新規登録 →
            </Link>
          </div>
        )}

        {/* tackle list */}
        {user && (<>
          <SectionHeader>登録済みタックル</SectionHeader>
          {listLoading ? (
            <p className="text-center text-xs text-slate-400 py-8">読み込み中…</p>
          ) : tackles.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-8">まだタックルが登録されていません</p>
          ) : (
            <div className="flex flex-col gap-3 py-4">
              {tackles.map((tackle) => (
                <TackleCard key={tackle.id} tackle={tackle} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </>)}

        {/* new tackle form */}
        {user && (<>
          <SectionHeader>新しいタックルを登録</SectionHeader>
          <div className="bg-white">
            <Field label="ロッド名">
              <input
                type="text"
                value={rod}
                onChange={(e) => setRod(e.target.value)}
                placeholder="例：シマノ エンカウンター S96M"
                className={inputClass}
              />
            </Field>
            <Field label="リール名">
              <input
                type="text"
                value={reel}
                onChange={(e) => setReel(e.target.value)}
                placeholder="例：レガリス LT4000-CXH"
                className={inputClass}
              />
            </Field>
            <Field label="ライン">
              <input
                type="text"
                value={line}
                onChange={(e) => setLine(e.target.value)}
                placeholder="例：PE1.5号、ナイロン4号"
                className={inputClass}
              />
            </Field>
            <Field label="リーダー">
              <input
                type="text"
                value={leader}
                onChange={(e) => setLeader(e.target.value)}
                placeholder="例：フロロ3号"
                className={inputClass}
              />
            </Field>
            <Field label="ルアー / 仕掛け">
              <input
                type="text"
                value={lure}
                onChange={(e) => setLure(e.target.value)}
                placeholder="例：メタルジグ各種、サビキ仕掛け"
                className={inputClass}
              />
            </Field>
            <Field label="用途">
              <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className={inputClass}>
                <option value="">選択してください</option>
                {PURPOSE_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="メモ">
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="使用感、購入日、改造内容など"
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </Field>
          </div>

          <div className="px-4 pt-6">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || (!rod.trim() && !purpose.trim())}
              className="w-full py-4 rounded-2xl font-bold text-base transition-colors shadow-sm"
              style={{
                background: saved ? "#10b981" : "#2563EB",
                color: "#fff",
                opacity: saving || (!rod.trim() && !purpose.trim()) ? 0.5 : 1,
              }}
            >
              {saved ? "✓ 保存しました" : saving ? "保存中…" : "タックルを保存する"}
            </button>
          </div>
        </>)}
      </main>
    </div>
  );
}

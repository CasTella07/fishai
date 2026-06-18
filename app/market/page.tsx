"use client";

import Link from "next/link";
import { useState } from "react";

/* ─────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────── */

type ConditionLabel = "未使用に近い" | "美品" | "良い" | "使用感あり" | "難あり";

interface Product {
  id: number;
  brand: string;
  name: string;
  price: number;
  condition: ConditionLabel;
  categories: string[];
  emoji: string;
  from: string;
  to: string;
  aiScore: number;
  aiReason: string;
  forFishing: string[];
  notForFishing: string[];
  pairWith: string;
  beginnerScore: number;
  costScore: number;
  aiComment: string;
  isAiPick: boolean;
  type: "ロッド" | "リール" | "その他";
}

/* ─────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────── */

const PRODUCTS: Product[] = [
  {
    id: 1,
    brand: "シマノ", name: "ムーンショット S96ML",
    price: 12800, condition: "良い",
    categories: ["サーフ", "シーバス", "ライトショアジギング"],
    emoji: "🎣", from: "from-blue-600", to: "to-blue-900",
    aiScore: 94, isAiPick: true, type: "ロッド",
    aiReason: "湘南サーフのヒラメ・シーバスに使いやすく、初心者にも扱いやすい万能ロッド。9.6ftでサーフの飛距離も十分確保できます。",
    forFishing: ["湘南サーフヒラメ", "シーバスゲーム", "ライトショアジギング"],
    notForFishing: ["船釣り", "ライトゲーム（アジング・メバリング）", "渓流釣り"],
    pairWith: "4000番スピニングリール + PE1〜1.5号",
    beginnerScore: 4, costScore: 4,
    aiComment: "サーフ入門に最適なコストパフォーマンス。中古でもシマノ品質は健在で、長く使えます。今の予算感だと最有力候補です。",
  },
  {
    id: 2,
    brand: "ダイワ", name: "レガリス LT4000-CXH",
    price: 7500, condition: "美品",
    categories: ["サーフ", "ライトショアジギング", "エギング"],
    emoji: "⚙️", from: "from-cyan-500", to: "to-cyan-800",
    aiScore: 88, isAiPick: true, type: "リール",
    aiReason: "サーフ・ライトショアジギングに対応しコスパが高いリール。美品状態で7,500円は相場より安い。",
    forFishing: ["サーフゲーム全般", "ライトショアジギング", "エギング"],
    notForFishing: ["大型青物ジギング", "タイラバ（専用機推奨）"],
    pairWith: "9〜10ft MLロッド + PE1〜1.5号",
    beginnerScore: 5, costScore: 5,
    aiComment: "入門〜中級者に最もおすすめのリール。美品7,500円は破格。ムーンショットとセットにすると最高の組み合わせです。",
  },
  {
    id: 3,
    brand: "ダイワ", name: "ライトゲーム X 73 M-190",
    price: 9800, condition: "使用感あり",
    categories: ["船釣り", "ライト五目", "サビキ"],
    emoji: "🚢", from: "from-indigo-500", to: "to-indigo-800",
    aiScore: 82, isAiPick: true, type: "ロッド",
    aiReason: "ライト五目や船釣り入門に向いた船竿。堤防サビキにも使えコスパ良し。",
    forFishing: ["ライト五目船釣り", "堤防サビキ", "胴突き仕掛け全般"],
    notForFishing: ["サーフキャスティング", "ルアーゲーム全般"],
    pairWith: "小型両軸リール または 2500番スピニング",
    beginnerScore: 4, costScore: 3,
    aiComment: "船釣り入門者に適した1本。使用感はあるが機能は十分。初めての船釣りで試したい方にピッタリです。",
  },
  {
    id: 4,
    brand: "シマノ", name: "エクスセンス S906ML/R",
    price: 24500, condition: "美品",
    categories: ["シーバス", "サーフ", "ミノーゲーム"],
    emoji: "🎣", from: "from-slate-600", to: "to-slate-900",
    aiScore: 78, isAiPick: false, type: "ロッド",
    aiReason: "シーバス専用ハイエンドロッド。感度と飛距離が圧倒的。",
    forFishing: ["シーバス専用", "サーフフラットフィッシュ", "ビッグベイトゲーム"],
    notForFishing: ["船釣り", "ライトゲーム", "管理釣り場"],
    pairWith: "4000〜5000番スピニング + PE1号前後",
    beginnerScore: 2, costScore: 2,
    aiComment: "中上級者向けのハイエンドモデル。美品24,500円は相場より安め。シーバスに本腰を入れるなら検討価値あり。",
  },
  {
    id: 5,
    brand: "ダイワ", name: "カルディア LT2500S-XH",
    price: 8900, condition: "良い",
    categories: ["アジング", "メバリング", "エギング"],
    emoji: "⚙️", from: "from-teal-500", to: "to-teal-700",
    aiScore: 86, isAiPick: false, type: "リール",
    aiReason: "軽さと巻き感度に優れたライトゲーム向きリール。",
    forFishing: ["アジング", "メバリング", "エギング", "管理釣り場"],
    notForFishing: ["サーフ（重いルアーは不向き）", "ジギング"],
    pairWith: "7ft前後のライトロッド + PE0.3〜0.6号",
    beginnerScore: 3, costScore: 4,
    aiComment: "ライトゲーム入門〜中級者に最適。カルディアの巻き心地は中古でも健在。手軽なアジング入門に。",
  },
  {
    id: 6,
    brand: "メジャークラフト", name: "ソルパラ SPS-862ML",
    price: 3800, condition: "使用感あり",
    categories: ["サーフ", "エギング", "シーバス入門"],
    emoji: "🎣", from: "from-sky-400", to: "to-sky-700",
    aiScore: 70, isAiPick: false, type: "ロッド",
    aiReason: "入門価格で購入できるコスパロッド。釣り初体験に最適。",
    forFishing: ["サーフ入門", "堤防ルアー全般", "エギング入門"],
    notForFishing: ["ヘビーなジギング", "ビッグベイト", "ハイエンドゲーム"],
    pairWith: "2500〜3000番スピニング + PE0.8〜1号",
    beginnerScore: 5, costScore: 5,
    aiComment: "最安クラスの入門ロッド。釣りを始めたい方に最適。上達後は中〜上位機種への買い替えも考えてみて。",
  },
];

const GENRES = ["すべて", "サーフ", "シーバス", "アジング", "エギング", "船釣り", "ライト五目", "バス"];
const FISHES = ["指定なし", "ヒラメ", "シーバス", "アジ", "メバル", "青物", "タコ", "サバ"];
const BUDGETS = ["指定なし", "〜5,000円", "〜10,000円", "〜20,000円", "〜30,000円", "上限なし"];
const LEVELS  = ["初心者", "中級者", "上級者"];
const PRIOS   = ["コスパ", "軽さ", "万能", "長く使える", "安さ"];

const COND_COLOR: Record<ConditionLabel, string> = {
  "未使用に近い": "bg-emerald-100 text-emerald-700",
  "美品":         "bg-green-100 text-green-700",
  "良い":         "bg-blue-100 text-blue-700",
  "使用感あり":   "bg-amber-100 text-amber-700",
  "難あり":       "bg-red-100 text-red-700",
};

/* ─────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────── */

export default function MarketPage() {
  const [search, setSearch]       = useState("");
  const [genre, setGenre]         = useState("すべて");
  const [fish, setFish]           = useState("指定なし");
  const [budget, setBudget]       = useState("指定なし");
  const [level, setLevel]         = useState("初心者");
  const [prio, setPrio]           = useState("コスパ");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const aiPicks = PRODUCTS.filter((p) => p.isAiPick);
  const allProducts = PRODUCTS.filter((p) =>
    genre === "すべて" || p.categories.some((c) => c.includes(genre))
  );

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">

      {/* ── HEADER ── */}
      <header className="bg-gradient-to-br from-slate-900 to-slate-800 px-4 pt-12 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div className="flex-1">
            <p className="text-white/50 text-[10px] font-bold tracking-[0.2em] uppercase">AI Tackle Market</p>
            <h1 className="text-white font-black text-[20px] leading-tight tracking-tight">
              AIタックルマーケット
            </h1>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-lg">🏪</div>
        </div>
        <p className="text-white/60 text-[12px] leading-snug mb-4">
          あなたの釣りスタイル・予算・持ち物に合わせて、<br />最適な中古釣具をAIが提案します。
        </p>

        {/* Search bar */}
        <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-slate-400 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="「湘南サーフでヒラメ」「ライト五目リール」..."
            className="flex-1 text-[13px] text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-300 text-lg leading-none">✕</button>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-5 pb-24">

        {/* ── AI CONDITION INPUT ── */}
        <section className="px-4 pt-4">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="w-full flex items-center justify-between bg-white border border-slate-100 rounded-2xl px-4 py-3.5 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-sm font-black text-white flex-shrink-0">AI</div>
              <div className="text-left">
                <p className="text-[11px] font-black text-blue-600 tracking-wide uppercase">AI Filter</p>
                <p className="text-slate-800 font-bold text-[13px]">条件を入力してAIが絞り込む</p>
              </div>
            </div>
            <span className={`text-slate-400 text-sm transition-transform ${filterOpen ? "rotate-180" : ""}`}>▼</span>
          </button>

          {filterOpen && (
            <div className="mt-2 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-50">

              <FilterRow label="釣りジャンル">
                {GENRES.map((g) => (
                  <Pill key={g} active={genre === g} onClick={() => setGenre(g)}>{g}</Pill>
                ))}
              </FilterRow>

              <FilterRow label="狙う魚">
                {FISHES.map((f) => (
                  <Pill key={f} active={fish === f} onClick={() => setFish(f)}>{f}</Pill>
                ))}
              </FilterRow>

              <FilterRow label="予算">
                {BUDGETS.map((b) => (
                  <Pill key={b} active={budget === b} onClick={() => setBudget(b)}>{b}</Pill>
                ))}
              </FilterRow>

              <FilterRow label="レベル">
                {LEVELS.map((l) => (
                  <Pill key={l} active={level === l} onClick={() => setLevel(l)}>{l}</Pill>
                ))}
              </FilterRow>

              <FilterRow label="重視すること">
                {PRIOS.map((p) => (
                  <Pill key={p} active={prio === p} onClick={() => setPrio(p)}>{p}</Pill>
                ))}
              </FilterRow>

              <div className="px-4 py-3">
                <button className="w-full bg-blue-600 text-white font-bold text-[13px] py-3 rounded-xl active:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
                  🤖 AIで絞り込む
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── AI PICKS ── */}
        <section className="px-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[11px] font-black text-white flex-shrink-0">AI</div>
            <div>
              <p className="text-[9px] font-black text-slate-400 tracking-[0.18em] uppercase leading-none">AI Recommended</p>
              <p className="text-slate-800 font-bold text-[16px] leading-tight">AIのおすすめ3選</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {aiPicks.map((p) => (
              <AiPickCard
                key={p.id}
                product={p}
                expanded={expandedId === p.id}
                onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)}
              />
            ))}
          </div>
        </section>

        {/* ── ALL PRODUCTS ── */}
        <section className="px-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[9px] font-black text-slate-400 tracking-[0.18em] uppercase leading-none">All Items</p>
              <p className="text-slate-800 font-bold text-[16px] leading-tight">出品一覧</p>
            </div>
            <span className="text-[11px] font-bold text-slate-400">{allProducts.length}件</span>
          </div>

          <div className="flex flex-col gap-3">
            {allProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                expanded={expandedId === p.id}
                onToggle={() => setExpandedId(expandedId === p.id ? null : p.id)}
              />
            ))}
          </div>
        </section>

        {/* ── SELL CTA ── */}
        <section className="px-4">
          <div className="bg-slate-900 rounded-3xl px-5 py-5 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-white/50 text-[10px] font-black tracking-widest uppercase">Sell</p>
              <p className="text-white font-black text-[16px] leading-tight mt-0.5">
                釣具を出品する
              </p>
              <p className="text-white/60 text-[11px] mt-1 leading-relaxed">
                使わなくなったタックルをAIが最適な価格で出品サポート
              </p>
            </div>
            <button className="bg-white text-slate-900 font-bold text-[12px] px-4 py-2.5 rounded-xl flex-shrink-0 active:scale-95 transition-transform">
              出品する
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   AI PICK CARD
───────────────────────────────────────────────────── */

function AiPickCard({ product: p, expanded, onToggle }: {
  product: Product;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      {/* AI recommended banner */}
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-600">
        <span className="text-white text-[11px] font-black tracking-wide">🤖 AIおすすめ</span>
        <span className="ml-auto bg-white/20 text-white text-[11px] font-black px-2 py-0.5 rounded-full">
          適合度 {p.aiScore}%
        </span>
      </div>

      <div className="flex gap-3 px-4 py-3">
        {/* Thumbnail */}
        <div className={`w-[72px] h-[72px] rounded-xl bg-gradient-to-br ${p.from} ${p.to} flex items-center justify-center flex-shrink-0`}>
          <span className="text-[32px]">{p.emoji}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div>
              <p className="text-[10px] font-bold text-slate-400">{p.brand}</p>
              <p className="font-bold text-slate-800 text-[14px] leading-tight">{p.name}</p>
            </div>
            <p className="text-blue-600 font-black text-[15px] flex-shrink-0">
              ¥{p.price.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${COND_COLOR[p.condition]}`}>
              {p.condition}
            </span>
            {p.categories.slice(0, 2).map((c) => (
              <span key={c} className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{c}</span>
            ))}
          </div>
        </div>
      </div>

      {/* AI Reason */}
      <div className="mx-4 mb-3 bg-blue-50 rounded-xl px-3 py-2.5 flex gap-2">
        <span className="text-[13px] flex-shrink-0">💬</span>
        <p className="text-blue-700 text-[12px] leading-relaxed">{p.aiReason}</p>
      </div>

      {/* Expand toggle */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-center gap-1 py-2.5 border-t border-slate-50 text-[12px] font-bold text-slate-500 active:bg-slate-50 transition-colors"
      >
        {expanded ? "閉じる ▲" : "詳細を見る ▼"}
      </button>

      {/* Expanded detail */}
      {expanded && <ProductDetail product={p} />}

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4 pt-2">
        <Link href="/ai-chat" className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 font-bold text-[12px] py-2.5 rounded-xl active:bg-slate-200 transition-colors">
          🤖 AIに相談
        </Link>
        <button className="flex-1 bg-blue-600 text-white font-bold text-[12px] py-2.5 rounded-xl active:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
          詳細ページへ
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────────────────── */

function ProductCard({ product: p, expanded, onToggle }: {
  product: Product;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex gap-3 px-4 py-3">
        {/* Thumbnail */}
        <div className={`w-[60px] h-[60px] rounded-xl bg-gradient-to-br ${p.from} ${p.to} flex items-center justify-center flex-shrink-0`}>
          <span className="text-[26px]">{p.emoji}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400">{p.brand} · {p.type}</p>
              <p className="font-bold text-slate-800 text-[13px] leading-tight truncate">{p.name}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-blue-600 font-black text-[14px]">¥{p.price.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${COND_COLOR[p.condition]}`}>
              {p.condition}
            </span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              AI {p.aiScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-center gap-1 py-2.5 border-t border-slate-50 text-[11px] font-bold text-slate-400 active:bg-slate-50 transition-colors"
      >
        {expanded ? "閉じる ▲" : "AI分析を見る ▼"}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <>
          <div className="px-4 pb-2">
            <div className="bg-blue-50 rounded-xl px-3 py-2.5 mb-3 flex gap-2">
              <span className="text-[13px] flex-shrink-0">💬</span>
              <p className="text-blue-700 text-[12px] leading-relaxed">{p.aiReason}</p>
            </div>
          </div>
          <ProductDetail product={p} />
          <div className="flex gap-2 px-4 pb-4 pt-1">
            <Link href="/ai-chat" className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 font-bold text-[12px] py-2.5 rounded-xl">
              🤖 AIに相談
            </Link>
            <button className="flex-1 bg-blue-600 text-white font-bold text-[12px] py-2.5 rounded-xl shadow-sm shadow-blue-200">
              詳細ページへ
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   PRODUCT DETAIL PANEL
───────────────────────────────────────────────────── */

function ProductDetail({ product: p }: { product: Product }) {
  return (
    <div className="border-t border-slate-50 px-4 pt-3 pb-3 flex flex-col gap-3">
      {/* For / Not for */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-green-50 rounded-xl p-3">
          <p className="text-[10px] font-black text-green-600 mb-1.5">✅ 向いている釣り</p>
          {p.forFishing.map((f) => (
            <p key={f} className="text-[11px] text-green-700 leading-snug">• {f}</p>
          ))}
        </div>
        <div className="bg-red-50 rounded-xl p-3">
          <p className="text-[10px] font-black text-red-500 mb-1.5">❌ 向いていない釣り</p>
          {p.notForFishing.map((f) => (
            <p key={f} className="text-[11px] text-red-600 leading-snug">• {f}</p>
          ))}
        </div>
      </div>

      {/* Pair with */}
      <div className="bg-slate-50 rounded-xl px-3 py-2.5">
        <p className="text-[10px] font-black text-slate-500 mb-1">🔗 合う道具の組み合わせ</p>
        <p className="text-[12px] text-slate-700 font-semibold">{p.pairWith}</p>
      </div>

      {/* Score bars */}
      <div className="flex flex-col gap-2">
        <ScoreBar label="初心者向け度" score={p.beginnerScore} max={5} color="bg-blue-500" />
        <ScoreBar label="コスパ"       score={p.costScore}     max={5} color="bg-cyan-500" />
      </div>

      {/* AI Comment */}
      <div className="bg-slate-900 rounded-xl px-3 py-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-black text-white/50 tracking-widest uppercase">AI Comment</span>
        </div>
        <p className="text-white text-[12px] leading-relaxed">{p.aiComment}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────── */

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3">
      <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase mb-2">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
        {children}
      </div>
    </div>
  );
}

function Pill({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {children}
    </button>
  );
}

function ScoreBar({ label, score, max, color }: {
  label: string;
  score: number;
  max: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-bold text-slate-500">{label}</p>
        <p className="text-[10px] font-black text-slate-600">{score}/{max}</p>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${(score / max) * 100}%` }}
        />
      </div>
    </div>
  );
}

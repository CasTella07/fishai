"use client";

import Link from "next/link";

const DUMMY_TACKLE = [
  {
    id: 1,
    rod: "シマノ エンカウンター S96M",
    reel: "レガリス LT4000-CXH",
    line: "PE1.5号",
    leader: "フロロ3号",
    lure: "メタルジグ各種",
    purpose: "サーフヒラメ",
    memo: "",
  },
  {
    id: 2,
    rod: "ライトゲーム X 73 M-190",
    reel: "PR100",
    line: "PE2号",
    leader: "フロロ2号",
    lure: "サビキ仕掛け・胴突き仕掛け",
    purpose: "ライト五目",
    memo: "堤防・波止釣りメイン",
  },
];

const PURPOSE_OPTIONS = [
  "シーバス","サーフヒラメ","ライト五目","エギング","アジング",
  "メバリング","ジギング","タイラバ","渓流","ブラックバス","その他",
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:bg-white transition-colors";

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

function TackleCard({ tackle }: { tackle: typeof DUMMY_TACKLE[0] }) {
  return (
    <div className="mx-4 rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-blue-50">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 text-blue-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">{tackle.rod}</p>
          <p className="text-xs text-blue-600 font-medium mt-0.5">{tackle.purpose}</p>
        </div>
        <button className="text-slate-400 p-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
          </svg>
        </button>
      </div>

      {/* Card body */}
      <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">リール</p>
          <p className="text-xs text-slate-700 mt-0.5">{tackle.reel}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">ライン</p>
          <p className="text-xs text-slate-700 mt-0.5">{tackle.line}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">リーダー</p>
          <p className="text-xs text-slate-700 mt-0.5">{tackle.leader}</p>
        </div>
        <div>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">ルアー / 仕掛け</p>
          <p className="text-xs text-slate-700 mt-0.5 truncate">{tackle.lure}</p>
        </div>
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

export default function TacklePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
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
        <div className="bg-white/20 rounded-full px-3 py-1">
          <span className="text-white text-xs font-medium">{DUMMY_TACKLE.length}件</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-8">
        {/* Registered tackle list */}
        <SectionHeader>登録済みタックル</SectionHeader>
        <div className="flex flex-col gap-3 py-4">
          {DUMMY_TACKLE.map((tackle) => (
            <TackleCard key={tackle.id} tackle={tackle} />
          ))}
        </div>

        {/* New tackle form */}
        <SectionHeader>新しいタックルを登録</SectionHeader>
        <div className="bg-white">
          <Field label="ロッド名">
            <input type="text" placeholder="例：シマノ エンカウンター S96M" className={inputClass} />
          </Field>
          <Field label="リール名">
            <input type="text" placeholder="例：レガリス LT4000-CXH" className={inputClass} />
          </Field>
          <Field label="ライン">
            <input type="text" placeholder="例：PE1.5号、ナイロン4号" className={inputClass} />
          </Field>
          <Field label="リーダー">
            <input type="text" placeholder="例：フロロ3号" className={inputClass} />
          </Field>
          <Field label="ルアー / 仕掛け">
            <input type="text" placeholder="例：メタルジグ各種、サビキ仕掛け" className={inputClass} />
          </Field>
          <Field label="用途">
            <select className={inputClass}>
              <option value="">選択してください</option>
              {PURPOSE_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="メモ">
            <textarea
              placeholder="使用感、購入日、改造内容など"
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </Field>
        </div>

        {/* Save button */}
        <div className="px-4 pt-6">
          <button
            type="button"
            className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-base active:bg-blue-700 transition-colors shadow-sm"
          >
            タックルを保存する
          </button>
        </div>
      </main>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "利用規約",
};

export default function TermsPage() {
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
        <h1 className="text-[18px] font-bold text-white">利用規約</h1>
      </header>

      <div className="px-5 pt-6 max-w-2xl mx-auto">
        <div className="rounded-2xl px-5 py-4 mb-4"
             style={{ background: "rgba(245,158,11,.06)", border: "1px solid rgba(245,158,11,.2)" }}>
          <p className="text-[12px] leading-relaxed" style={{ color: "#d4a82a" }}>
            FishAIはβ版サービスです。釣行の最終判断はご自身の責任でお願いします。
          </p>
        </div>

        <div className="flex flex-col gap-6" style={{ color: "#c5d5e8" }}>
          <Section title="第1条（サービス概要）">
            FishAI（以下「本サービス」）は、湘南エリアの釣り情報をAIによって提供するWebアプリケーションです。潮汐データ、気象情報、釣果予測等の情報をもとに、釣行判断のサポートを行います。
          </Section>

          <Section title="第2条（免責事項）">
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li>本サービスが提供する潮汐・天気・釣果予測情報は参考情報です。実際の海況と異なる場合があります。</li>
              <li>釣行の安全については、気象庁・海上保安庁等の公式情報を必ず確認してください。</li>
              <li>本サービスの利用に起因するいかなる損害についても、運営者は責任を負いません。</li>
              <li>β版のため、予告なくサービス内容が変更・停止される場合があります。</li>
            </ul>
          </Section>

          <Section title="第3条（禁止事項）">
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li>本サービスへの不正アクセスまたはシステムへの攻撃</li>
              <li>AIを利用した大量・自動送信</li>
              <li>他のユーザーへの迷惑行為</li>
              <li>法令に違反する目的での利用</li>
            </ul>
          </Section>

          <Section title="第4条（知的財産権）">
            本サービスのコンテンツ（テキスト・デザイン・ロゴ等）に関する著作権その他の知的財産権は運営者に帰属します。
          </Section>

          <Section title="第5条（プライバシー）">
            個人情報の取り扱いについては
            <Link href="/privacy" style={{ color: "#0ea5e9" }}> プライバシーポリシー</Link>
            をご確認ください。
          </Section>

          <Section title="第6条（規約の変更）">
            本規約は予告なく変更する場合があります。変更後も引き続き利用された場合は、変更後の規約に同意したものとみなします。
          </Section>

          <p className="text-[11px] pb-8" style={{ color: "#64748b" }}>
            制定日：2026年6月17日
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[14px] font-bold text-white mb-2">{title}</h2>
      <div className="text-[13px] leading-relaxed" style={{ color: "#7c92ab" }}>{children}</div>
    </div>
  );
}

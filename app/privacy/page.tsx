import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
};

export default function PrivacyPage() {
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
        <h1 className="text-[18px] font-bold text-white">プライバシーポリシー</h1>
      </header>

      <div className="px-5 pt-6 max-w-2xl mx-auto">
        <div className="flex flex-col gap-6" style={{ color: "#c5d5e8" }}>
          <Section title="収集する情報">
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li><strong style={{ color: "#e8f1fc" }}>釣果記録：</strong>魚種・サイズ・場所・日時等、ユーザーが入力した情報。現在はデバイス内（localStorage）にのみ保存されます。</li>
              <li><strong style={{ color: "#e8f1fc" }}>AIチャット：</strong>Anthropic社のAPIにメッセージが送信されます。Anthropicのプライバシーポリシーも適用されます。</li>
              <li><strong style={{ color: "#e8f1fc" }}>アクセスログ：</strong>Vercel等のホスティングサービスによるアクセスログが収集される場合があります。</li>
            </ul>
          </Section>

          <Section title="情報の利用目的">
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li>サービスの提供・改善</li>
              <li>釣果統計・分析機能の提供（将来的な機能）</li>
              <li>ユーザーサポート対応</li>
            </ul>
          </Section>

          <Section title="第三者への提供">
            以下の場合を除き、個人情報を第三者に提供しません：
            <ul className="list-disc pl-5 mt-2 flex flex-col gap-2">
              <li>法令に基づく場合</li>
              <li>AIチャット機能利用時のAnthropic社へのメッセージ送信</li>
            </ul>
          </Section>

          <Section title="Cookieの利用">
            本サービスは現在、認証・セッション管理のためのCookieを使用していません。将来的にログイン機能を追加した際に改定します。
          </Section>

          <Section title="データの削除">
            釣果記録はブラウザの設定からlocalStorageを削除することで消去できます。将来的にアカウント機能を追加した際は、画面内から削除できるようにします。
          </Section>

          <Section title="外部サービス">
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li><strong style={{ color: "#e8f1fc" }}>Anthropic（Claude API）：</strong>AIチャット機能に使用。<a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener" style={{ color: "#0ea5e9" }}>Anthropicプライバシーポリシー</a></li>
              <li><strong style={{ color: "#e8f1fc" }}>Vercel：</strong>ホスティングに使用。<a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener" style={{ color: "#0ea5e9" }}>Vercelプライバシーポリシー</a></li>
            </ul>
          </Section>

          <Section title="お問い合わせ">
            プライバシーに関するお問い合わせは
            <Link href="/contact" style={{ color: "#0ea5e9" }}> お問い合わせページ</Link>
            からご連絡ください。
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

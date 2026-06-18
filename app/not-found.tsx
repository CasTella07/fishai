import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "#030b16" }}
    >
      {/* Ambient */}
      <div aria-hidden style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, height: 400, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 50% 0%, rgba(14,165,233,.1) 0%, transparent 70%)",
      }} />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-sm">
        <div className="text-[64px] leading-none">🎣</div>
        <div>
          <p className="text-[64px] font-black leading-none num-tab" style={{ color: "#0ea5e9" }}>404</p>
          <p className="text-[20px] font-bold text-white mt-2">ページが見つかりません</p>
          <p className="text-[14px] mt-2 leading-relaxed" style={{ color: "#64748b" }}>
            このページは存在しないか、移動した可能性があります。
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-black transition-transform active:scale-[.98]"
            style={{ background: "rgba(14,165,233,.14)", color: "#0ea5e9", border: "1px solid rgba(14,165,233,.3)" }}
          >
            ホームに戻る
          </Link>
          <Link
            href="/ai-chat"
            className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-bold transition-transform active:scale-[.98]"
            style={{ background: "rgba(255,255,255,.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,.1)" }}
          >
            AI船長に聞く
          </Link>
        </div>
      </div>
    </div>
  );
}

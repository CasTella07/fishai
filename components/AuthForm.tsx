"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

const C = {
  card:   "#0D1B2E",
  border: "rgba(255,255,255,0.09)",
  text1:  "#E2EAF4",
  text2:  "#8AA0B5",
  text3:  "#516070",
  ocean:  "#0EA5E9",
  cyan:   "#22D3EE",
  red:    "#F06060",
  green:  "#10B981",
} as const;

type Tab = "login" | "signup";

function translateError(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "メールアドレスまたはパスワードが正しくありません";
  if (msg.includes("already registered"))        return "このメールアドレスはすでに登録されています";
  if (msg.includes("Password should be at least")) return "パスワードは6文字以上で入力してください";
  if (msg.includes("Unable to validate email"))  return "有効なメールアドレスを入力してください";
  return msg;
}

export function AuthForm() {
  const { supabase } = useAuth();
  const [tab, setTab]           = useState<Tab>("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (tab === "signup") {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setSuccess("登録完了！ログインできます。");
        setTab("login");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        // onAuthStateChange が user を更新するので何もしなくてよい
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "エラーが発生しました";
      setError(translateError(msg));
    } finally {
      setLoading(false);
    }
  }

  function switchTab(t: Tab) {
    setTab(t);
    setError(null);
    setSuccess(null);
  }

  return (
    <div
      className="rounded-2xl px-5 py-6"
      style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      {/* Tab row */}
      <div
        className="flex mb-6 rounded-xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        {(["login", "signup"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => switchTab(t)}
            className="flex-1 py-2.5 text-[13px] font-bold transition-colors"
            style={{
              background: tab === t ? C.ocean : "transparent",
              color: tab === t ? "#fff" : C.text3,
            }}
          >
            {t === "login" ? "ログイン" : "新規登録"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            className="block text-[11px] font-semibold mb-1.5"
            style={{ color: C.text2 }}
          >
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="example@gmail.com"
            className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: `1px solid ${C.border}`,
              color: C.text1,
            }}
          />
        </div>

        <div>
          <label
            className="block text-[11px] font-semibold mb-1.5"
            style={{ color: C.text2 }}
          >
            パスワード{tab === "signup" ? "（6文字以上）" : ""}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl text-[14px] outline-none"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: `1px solid ${C.border}`,
              color: C.text1,
            }}
          />
        </div>

        {error && (
          <p
            className="text-[12px] px-3 py-2.5 rounded-xl leading-snug"
            style={{ color: C.red, background: `${C.red}14`, border: `1px solid ${C.red}30` }}
          >
            {error}
          </p>
        )}
        {success && (
          <p
            className="text-[12px] px-3 py-2.5 rounded-xl leading-snug"
            style={{ color: C.green, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}
          >
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-[15px] font-bold transition-opacity active:scale-[.98]"
          style={{
            background: `linear-gradient(135deg, ${C.ocean}, ${C.cyan})`,
            color: "#fff",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "処理中..." : tab === "login" ? "ログイン" : "アカウント作成"}
        </button>
      </form>
    </div>
  );
}

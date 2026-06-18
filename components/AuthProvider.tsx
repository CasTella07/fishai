"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  supabase: SupabaseClient;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      supabase,
      signOut: async () => { await supabase.auth.signOut(); },
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

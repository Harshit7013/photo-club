import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { ensureAdminRole } from "@/lib/admin.functions";
import { Camera, ArrowUpRight } from "lucide-react";

const searchSchema = z.object({ next: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Sign in — PHOTOMANIA 2026" },
      { name: "description", content: "Sign in or create an account to register for PHOTOMANIA 2026." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const ensureAdmin = useServerFn(ensureAdminRole);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigateAfter();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const safeNext = (() => {
    if (!next) return "/";
    try {
      const u = new URL(next, window.location.origin);
      if (u.origin !== window.location.origin) return "/";
      return u.pathname + u.search;
    } catch {
      return "/";
    }
  })();

  async function navigateAfter() {
    try { await ensureAdmin(); } catch { /* ignore */ }
    navigate({ to: safeNext, replace: true });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/auth",
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setInfo("Check your email to confirm your account, then sign in.");
          setMode("signin");
        } else {
          await navigateAfter();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await navigateAfter();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground grain">
      <div className="mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 md:grid-cols-[1.2fr_1fr]">
        <div className="hidden bg-gradient-to-br from-orange to-orange-burnt p-10 text-ink md:flex md:flex-col md:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full border border-ink/30 bg-ink/10">
              <Camera className="h-5 w-5" />
            </div>
            <span className="font-display text-2xl tracking-widest">PHOTOMANIA</span>
          </Link>
          <div>
            <h1 className="font-display text-6xl leading-[0.9]">
              Capture.<br />Create.<br />Inspire.
            </h1>
            <p className="mt-6 max-w-sm font-editorial italic text-lg text-ink/80">
              Create an account to register for Photomania 2026 and track your submission.
            </p>
          </div>
          <div className="text-[10px] tracking-[0.4em] uppercase text-ink/70">
            14 · 08 · 2026 — TKR CET, Hyderabad
          </div>
        </div>

        <div className="flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-2 rounded-full border border-line/60 bg-ink/40 p-1 text-xs uppercase tracking-[0.25em]">
              <button
                onClick={() => setMode("signin")}
                className={`flex-1 rounded-full px-4 py-2.5 transition ${mode === "signin" ? "bg-orange text-ink" : "text-muted-foreground"}`}
              >
                Sign in
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 rounded-full px-4 py-2.5 transition ${mode === "signup" ? "bg-orange text-ink" : "text-muted-foreground"}`}
              >
                Create account
              </button>
            </div>

            <h2 className="mt-8 font-display text-4xl text-cream">
              {mode === "signin" ? "Welcome back." : "Join Photomania."}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to continue your registration."
                : "An account lets you register and view your status."}
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              {mode === "signup" && (
                <Input label="Full Name" value={fullName} onChange={setFullName} required />
              )}
              <Input label="Email" type="email" value={email} onChange={setEmail} required />
              <Input label="Password" type="password" value={password} onChange={setPassword} minLength={6} required />

              {error && <p className="text-sm text-red-400">{error}</p>}
              {info && <p className="text-sm text-orange">{info}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-orange px-6 py-4 text-sm font-semibold tracking-[0.25em] uppercase text-ink transition-all hover:bg-orange-soft disabled:opacity-60"
              >
                {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </form>

            <Link to="/" className="mt-8 inline-block text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-cream">
              ← Back to site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <div>
      <div className="mb-2 text-[10px] tracking-[0.3em] uppercase text-muted-foreground">{label}</div>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-line/60 bg-ink/60 px-4 py-3 text-cream placeholder:text-muted-foreground/60 focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30"
      />
    </div>
  );
}

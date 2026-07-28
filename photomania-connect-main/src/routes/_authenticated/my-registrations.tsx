import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { ArrowLeft, Check, Clock, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/my-registrations")({
  head: () => ({
    meta: [
      { title: "My Registrations — PHOTOMANIA 2026" },
      { name: "description", content: "View the status of your Photomania 2026 registration." },
    ],
  }),
  component: MyRegistrations,
});

type Reg = Tables<"registrations">;

function MyRegistrations() {
  const [rows, setRows] = useState<Reg[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setRows(data ?? []);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background px-5 py-10 text-foreground md:px-10 md:py-16">
      <div className="mx-auto max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-cream">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to site
        </Link>
        <h1 className="mt-6 font-display text-5xl text-cream md:text-6xl">My Registrations</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Registration is confirmed only after payment verification by our team.
        </p>

        {error && <p className="mt-8 text-sm text-red-400">{error}</p>}

        <div className="mt-10 space-y-4">
          {rows === null && <p className="text-sm text-muted-foreground">Loading…</p>}
          {rows && rows.length === 0 && (
            <div className="rounded-3xl border border-line/50 bg-ink/40 p-10 text-center">
              <p className="text-sm text-muted-foreground">You haven't registered yet.</p>
              <Link
                to="/"
                className="mt-6 inline-block rounded-full bg-orange px-6 py-3 text-xs font-semibold tracking-[0.25em] uppercase text-ink hover:bg-orange-soft"
              >
                Register now
              </Link>
            </div>
          )}
          {rows?.map((r) => <Card key={r.id} r={r} />)}
        </div>
      </div>
    </div>
  );
}

function Card({ r }: { r: Reg }) {
  const badge = {
    pending: { icon: Clock, label: "Pending verification", cls: "bg-amber-500/15 text-amber-300 border-amber-500/40" },
    verified: { icon: Check, label: "Verified ✓ You're in", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" },
    rejected: { icon: X, label: "Rejected", cls: "bg-red-500/15 text-red-300 border-red-500/40" },
  }[r.status];
  const Icon = badge.icon;
  return (
    <div className="rounded-3xl border border-line/50 bg-ink/40 p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            {r.category}{r.theme ? ` · ${r.theme}` : ""}
          </div>
          <div className="mt-2 font-display text-2xl text-cream">{r.full_name}</div>
          <div className="mt-1 text-xs text-muted-foreground">{r.college}</div>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] ${badge.cls}`}>
          <Icon className="h-3.5 w-3.5" /> {badge.label}
        </div>
      </div>
      <div className="mt-4 grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
        <div>UTR / Txn ID: <span className="text-cream">{r.transaction_id}</span></div>
        <div>Submitted: {new Date(r.created_at).toLocaleString()}</div>
      </div>
      {r.admin_notes && r.status !== "pending" && (
        <p className="mt-4 rounded-2xl border border-line/50 bg-ink/60 p-4 text-xs text-cream/80">
          Note from organizers: {r.admin_notes}
        </p>
      )}
    </div>
  );
}

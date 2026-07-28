import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { ArrowLeft, Check, X, Eye } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [{ title: "Admin — PHOTOMANIA 2026" }],
  }),
  component: AdminPage,
});

type Reg = Tables<"registrations">;
type Status = "all" | "pending" | "verified" | "rejected";

function AdminPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Reg[] | null>(null);
  const [filter, setFilter] = useState<Status>("pending");
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [notesFor, setNotesFor] = useState<string | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    (async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        navigate({ to: "/auth", search: { next: "/admin" } });
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.user.id);
      const isAdmin = roles?.some((r) => r.role === "admin");
      if (!isAdmin) {
        setError("You do not have admin access.");
        setChecked(true);
        return;
      }
      setChecked(true);
      load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setRows(data ?? []);
  }

  async function viewProof(path: string) {
    const { data, error } = await supabase.storage
      .from("payment-proofs")
      .createSignedUrl(path, 300);
    if (error) return alert(error.message);
    setPreviewUrl(data.signedUrl);
  }

  async function decide(id: string, status: "verified" | "rejected") {
    const { data: u } = await supabase.auth.getUser();
    const updates: Partial<Reg> = {
      status,
      admin_notes: notesFor === id ? note || null : null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: u.user?.id ?? null,
    };
    const { error } = await supabase.from("registrations").update(updates).eq("id", id);
    if (error) return alert(error.message);
    setNotesFor(null);
    setNote("");
    load();
  }

  const filtered = rows?.filter((r) => filter === "all" || r.status === filter) ?? [];

  return (
    <div className="min-h-screen bg-background px-5 py-10 text-foreground md:px-10 md:py-16">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-cream">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to site
        </Link>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.4em] text-orange">Admin Console</div>
            <h1 className="mt-2 font-display text-5xl text-cream md:text-6xl">Registrations</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["pending", "verified", "rejected", "all"] as Status[]).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.25em] transition ${
                  filter === s ? "border-orange bg-orange text-ink" : "border-line/60 text-muted-foreground hover:text-cream"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="mt-8 text-sm text-red-400">{error}</p>}
        {!checked && <p className="mt-8 text-sm text-muted-foreground">Checking access…</p>}

        <div className="mt-8 grid gap-4">
          {rows === null && checked && !error && <p className="text-sm text-muted-foreground">Loading…</p>}
          {filtered.map((r) => (
            <div key={r.id} className="rounded-3xl border border-line/50 bg-ink/40 p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    {r.category}{r.theme ? ` · ${r.theme}` : ""} · {new Date(r.created_at).toLocaleString()}
                  </div>
                  <div className="mt-1 font-display text-2xl text-cream">{r.full_name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{r.email} · {r.phone}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{r.college}</div>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <div className="mt-4 grid gap-2 text-xs text-cream/80">
                <div>UTR / Txn ID: <span className="text-cream font-medium">{r.transaction_id}</span></div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={() => viewProof(r.screenshot_path)}
                  className="inline-flex items-center gap-2 rounded-full border border-line/60 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-cream hover:border-orange"
                >
                  <Eye className="h-3.5 w-3.5" /> View proof
                </button>
                {r.status === "pending" && (
                  <>
                    <button
                      onClick={() => decide(r.id, "verified")}
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-ink hover:bg-emerald-400"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => { setNotesFor(r.id); setNote(""); }}
                      className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-ink hover:bg-red-400"
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                  </>
                )}
              </div>
              {notesFor === r.id && (
                <div className="mt-4 rounded-2xl border border-line/60 bg-ink/60 p-4">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    placeholder="Reason (optional)"
                    className="w-full rounded-xl bg-transparent p-3 text-sm text-cream placeholder:text-muted-foreground focus:outline-none"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => decide(r.id, "rejected")}
                      className="rounded-full bg-red-500 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-ink hover:bg-red-400"
                    >
                      Confirm reject
                    </button>
                    <button
                      onClick={() => { setNotesFor(null); setNote(""); }}
                      className="rounded-full border border-line/60 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-cream"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {rows && filtered.length === 0 && !error && (
            <p className="rounded-3xl border border-line/50 bg-ink/40 p-10 text-center text-sm text-muted-foreground">
              No {filter === "all" ? "" : filter} registrations.
            </p>
          )}
        </div>
      </div>

      {previewUrl && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <img src={previewUrl} alt="Payment proof" className="max-h-[90vh] max-w-full rounded-2xl" />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Reg["status"] }) {
  const map = {
    pending: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    verified: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    rejected: "bg-red-500/15 text-red-300 border-red-500/40",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] ${map[status]}`}>
      {status}
    </span>
  );
}

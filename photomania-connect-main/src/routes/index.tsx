import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { ensureAdminRole } from "@/lib/admin.functions";
import type { User } from "@supabase/supabase-js";
import {
  Camera,
  Video,
  Calendar,
  MapPin,
  Clock,
  ArrowUpRight,
  Trophy,
  Award,
  Instagram,
  Gift,
  Mail,
  ChevronDown,
  X,
  Upload,
  QrCode,
  Check,
} from "lucide-react";

import hero from "@/assets/hero.jpg";
import videographyImg from "@/assets/videography.jpg";
import photographyImg from "@/assets/photography.jpg";
import g1 from "@/assets/g1.jpg";
import g2 from "@/assets/g2.jpg";
import g3 from "@/assets/g3.jpg";
import g4 from "@/assets/g4.jpg";
import g5 from "@/assets/g5.jpg";
import g6 from "@/assets/g6.jpg";
import about from "@/assets/about.jpg";

export const Route = createFileRoute("/")({
  component: Photomania,
});

/* --------------------------- helpers --------------------------- */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("reveal-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => {
      el.classList.add("reveal");
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
}

function Marquee({ text }: { text: string }) {
  const items = Array.from({ length: 12 });
  return (
    <div className="relative overflow-hidden border-y border-line/60 bg-ink/40 py-3">
      <div className="marquee-track flex w-max gap-10 whitespace-nowrap">
        {[...items, ...items].map((_, i) => (
          <span
            key={i}
            className="font-display text-xs tracking-[0.4em] text-cream/40"
          >
            {text} <span className="text-orange">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* --------------------------- page --------------------------- */

export type RegDraft = {
  full_name: string;
  email: string;
  phone: string;
  college: string;
  category: string;
  theme: string;
};

function Photomania() {
  useReveal();
  const navigate = useNavigate();
  const ensureAdmin = useServerFn(ensureAdminRole);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openReg, setOpenReg] = useState(false);
  const [openPay, setOpenPay] = useState(false);
  const [prefill, setPrefill] = useState<{ category?: string; theme?: string }>({});
  const [regDraft, setRegDraft] = useState<RegDraft | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user ?? null);
      if (data.user) {
        try { const r = await ensureAdmin(); setIsAdmin(r.isAdmin); } catch { /* ignore */ }
        const { data: roles } = await supabase
          .from("user_roles").select("role").eq("user_id", data.user.id);
        setIsAdmin((prev) => prev || !!roles?.some((r) => r.role === "admin"));
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (!session) setIsAdmin(false);
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openRegistration = (category?: string, theme?: string) => {
    if (!user) {
      navigate({ to: "/auth", search: { next: "/" } });
      return;
    }
    setPrefill({ category, theme });
    setOpenReg(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav onRegister={() => openRegistration()} user={user} isAdmin={isAdmin} />

      <Hero onRegister={() => openRegistration()} />

      <Marquee text="PHOTOMANIA 2026" />

      <Categories onRegister={openRegistration} />

      <About />

      <WhyParticipate />

      <Gallery />

      <FAQ />

      <Footer />

      <RegistrationModal
        open={openReg}
        onClose={() => setOpenReg(false)}
        prefill={prefill}
        user={user}
        onSubmit={(draft) => {
          setRegDraft(draft);
          setOpenReg(false);
          setTimeout(() => setOpenPay(true), 250);
        }}
      />
      <PaymentModal
        open={openPay}
        onClose={() => setOpenPay(false)}
        draft={regDraft}
        user={user}
      />
    </div>
  );
}

/* --------------------------- nav --------------------------- */

function Nav({
  onRegister,
  user,
  isAdmin,
}: {
  onRegister: () => void;
  user: User | null;
  isAdmin: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
        scrolled
          ? "bg-ink/70 backdrop-blur-xl border-b border-line/60"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-10 md:py-5">
        <a href="#top" className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-orange/40 bg-gradient-to-br from-orange to-orange-burnt text-ink shadow-[0_0_24px_rgba(230,120,40,0.35)]">
            <span className="font-display text-lg leading-none">TKR</span>
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="font-display text-sm tracking-[0.28em] text-cream">
              PRATHIBIMB
            </div>
            <div className="text-[10px] tracking-[0.32em] text-muted-foreground uppercase">
              Photography Club · TKR CET
            </div>
          </div>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {[
            ["Event", "#event"],
            ["Categories", "#categories"],
            ["Gallery", "#gallery"],
            ["FAQ", "#faq"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-xs tracking-[0.28em] uppercase text-cream/70 transition-colors hover:text-orange"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="hidden md:inline text-xs tracking-[0.28em] uppercase text-cream/70 hover:text-orange">
                  Admin
                </Link>
              )}
              <Link
                to="/my-registrations"
                className="hidden md:inline text-xs tracking-[0.28em] uppercase text-cream/70 hover:text-orange"
              >
                My Regs
              </Link>
              <button
                onClick={async () => { await supabase.auth.signOut(); }}
                className="hidden md:inline text-xs tracking-[0.28em] uppercase text-cream/70 hover:text-orange"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link to="/auth" search={{ next: "/" }} className="hidden md:inline text-xs tracking-[0.28em] uppercase text-cream/70 hover:text-orange">
              Sign in
            </Link>
          )}
          <button
            onClick={onRegister}
            className="group inline-flex items-center gap-2 rounded-full bg-orange px-5 py-2.5 text-xs font-semibold tracking-[0.2em] uppercase text-ink transition-all hover:bg-orange-soft hover:shadow-[0_10px_40px_-10px_rgba(230,120,40,0.8)]"
          >
            Register
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
}

/* --------------------------- hero --------------------------- */

function Hero({ onRegister }: { onRegister: () => void }) {
  return (
    <section id="top" className="relative min-h-screen overflow-hidden pt-24">
      {/* editorial split layout inspired by the reference */}
      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-3 px-3 md:px-6">
        {/* Left orange block */}
        <div className="col-span-12 md:col-span-4 relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange to-orange-burnt p-8 md:p-10 min-h-[420px] md:min-h-[640px] grain">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-ink" />
            <span className="text-[10px] tracking-[0.4em] uppercase text-ink/70">
              Edition 01 · 2026
            </span>
          </div>
          <h1 className="mt-8 font-display text-[15vw] leading-[0.85] text-ink md:text-[7.5vw]">
            Capture.<br />Create.<br />Inspire.
          </h1>
          <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
            <div>
              <div className="text-[10px] tracking-[0.32em] uppercase text-ink/60">
                An Inter-college
              </div>
              <div className="font-editorial italic text-xl text-ink">
                Photography & Videography festival
              </div>
            </div>
          </div>
        </div>

        {/* Center hero photo */}
        <div className="col-span-12 md:col-span-5 relative overflow-hidden rounded-3xl min-h-[420px] md:min-h-[640px] grain">
          <img
            src={hero}
            alt="Photographer at golden hour"
            width={1600}
            height={1200}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/20" />
          <div className="absolute inset-x-0 top-6 flex items-center justify-around px-6 text-[10px] tracking-[0.3em] uppercase text-cream/50">
            <span>Photomania</span>
            <span>Photomania</span>
            <span>Photomania</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="font-display text-white text-[12vw] leading-[0.85] md:text-[6vw]">
              PHOTO<br/>MANIA
            </div>
            <div className="mt-2 text-xs tracking-[0.4em] uppercase text-orange">
              14 · 08 · 2026 &nbsp;·&nbsp; Hyderabad
            </div>
          </div>
        </div>

        {/* Right cream block */}
        <div className="col-span-12 md:col-span-3 relative overflow-hidden rounded-3xl bg-cream p-8 min-h-[420px] md:min-h-[640px] text-ink">
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="text-[10px] tracking-[0.4em] uppercase text-ink/50">
                Presented by
              </div>
              <div className="mt-2 font-display text-2xl">PRATHIBIMB</div>
              <div className="text-xs text-ink/60">
                Photography Club · TKR CET
              </div>
            </div>

            <div className="mx-auto my-6 grid h-40 w-40 place-items-center rounded-full bg-gradient-to-br from-orange to-orange-burnt text-center text-ink shadow-[0_20px_60px_-20px_rgba(230,120,40,0.6)]">
              <div>
                <div className="font-display text-2xl leading-none">2026</div>
                <div className="text-[10px] tracking-[0.3em] uppercase mt-1">
                  Edition
                </div>
              </div>
            </div>

            <button
              onClick={onRegister}
              className="group flex w-full items-center justify-between rounded-2xl bg-ink px-5 py-4 text-cream transition-all hover:bg-orange hover:text-ink"
            >
              <span className="font-display text-lg tracking-[0.15em]">
                REGISTER NOW
              </span>
              <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Info trio */}
      <div
        id="event"
        className="mx-auto mt-6 grid max-w-[1400px] grid-cols-1 gap-3 px-3 md:grid-cols-3 md:px-6"
      >
        <InfoCard
          icon={<Calendar className="h-5 w-5" />}
          label="Date"
          value="14 August 2026"
          sub="Thursday · Mark your calendar"
        />
        <InfoCard
          icon={<MapPin className="h-5 w-5" />}
          label="Venue"
          value="TKR CET — K9 Block"
          sub="Medbowli, Meerpet, Hyderabad"
        />
        <InfoCard
          icon={<Clock className="h-5 w-5" />}
          label="Time"
          value="10:00 AM Onwards"
          sub="Doors open at 9:30 AM"
        />
      </div>

      <div className="mx-auto mt-10 flex max-w-[1400px] items-center justify-center gap-2 px-6 pb-16 text-muted-foreground">
        <ChevronDown className="h-5 w-5 animate-bounce" />
        <span className="text-[10px] tracking-[0.4em] uppercase">
          Scroll to explore
        </span>
      </div>
    </section>
  );
}

function InfoCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div
      data-reveal
      className="group relative overflow-hidden rounded-3xl border border-line/60 bg-charcoal/60 p-7 backdrop-blur-xl transition-all hover:border-orange/50 hover:bg-charcoal"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-orange/15 text-orange">
          {icon}
        </div>
        <div className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground">
          {label}
        </div>
      </div>
      <div className="mt-6 font-display text-3xl text-cream md:text-4xl">
        {value}
      </div>
      <div className="mt-2 text-sm text-muted-foreground">{sub}</div>
      <div className="absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-orange/10 blur-3xl transition-opacity group-hover:opacity-100" />
    </div>
  );
}

/* --------------------------- categories --------------------------- */

function Categories({
  onRegister,
}: {
  onRegister: (cat?: string, theme?: string) => void;
}) {
  return (
    <section id="categories" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div data-reveal>
            <div className="text-[10px] tracking-[0.4em] uppercase text-orange">
              02 — Compete
            </div>
            <h2 className="mt-4 font-display text-[14vw] leading-[0.9] text-cream md:text-[6.5vw]">
              Two lenses.<br />
              <span className="font-editorial italic text-orange">
                One story.
              </span>
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground" data-reveal>
            Pick your medium — a frozen moment, or a moving frame. Both are open
            to every college in the region.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Videography */}
          <div
            data-reveal
            className="group relative overflow-hidden rounded-3xl bg-charcoal"
          >
            <div className="relative aspect-[4/5] overflow-hidden md:aspect-[4/5]">
              <img
                src={videographyImg}
                alt="Videography"
                loading="lazy"
                width={1200}
                height={1400}
                className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
              <div className="absolute top-6 left-6 flex items-center gap-2 rounded-full border border-cream/30 bg-ink/40 px-3 py-1.5 backdrop-blur-md">
                <Video className="h-3.5 w-3.5 text-orange" />
                <span className="text-[10px] tracking-[0.3em] uppercase text-cream">
                  Category 01
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
                <h3 className="font-display text-6xl leading-none text-cream md:text-8xl">
                  Videography
                </h3>
                <div className="mt-3 font-editorial italic text-orange">
                  Complete UGC Content
                </div>
              </div>
            </div>
            <div className="border-t border-line/60 p-6 md:p-8">
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  "Jewellery",
                  "Cosmetics",
                  "Products",
                  "Food",
                  "Fashion",
                  "Accessories",
                ].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-line px-3 py-1 text-xs text-cream/80"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Capture any product using creative cinematic shots. Final cut
                should run between <span className="text-cream">30–45 seconds.</span>
              </p>
              <button
                onClick={() => onRegister("Videography", "Complete UGC Content")}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-cream px-5 py-3 text-xs font-semibold tracking-[0.25em] uppercase text-ink transition-all hover:bg-orange"
              >
                Register for Videography
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Photography */}
          <div
            data-reveal
            className="group relative overflow-hidden rounded-3xl bg-charcoal"
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src={photographyImg}
                alt="Photography"
                loading="lazy"
                width={1200}
                height={1400}
                className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
              <div className="absolute top-6 left-6 flex items-center gap-2 rounded-full border border-cream/30 bg-ink/40 px-3 py-1.5 backdrop-blur-md">
                <Camera className="h-3.5 w-3.5 text-orange" />
                <span className="text-[10px] tracking-[0.3em] uppercase text-cream">
                  Category 02
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
                <h3 className="font-display text-6xl leading-none text-cream md:text-8xl">
                  Photography
                </h3>
                <div className="mt-3 font-editorial italic text-orange">
                  Three themes. Three visions.
                </div>
              </div>
            </div>
            <div className="border-t border-line/60 p-6 md:p-8">
              <div className="space-y-2">
                {[
                  ["01", "Telangana Unfiltered", "Festival · Bonalu"],
                  ["02", "Minimal Architecture", "Through My Lens"],
                  ["03", "Candid Photography", "Real. Raw. Unposed."],
                ].map(([n, title, sub]) => (
                  <button
                    key={n}
                    onClick={() => onRegister("Photography", title)}
                    className="group/theme flex w-full items-center justify-between rounded-2xl border border-line/60 bg-ink/50 px-5 py-4 text-left transition-all hover:border-orange/60 hover:bg-ink"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-editorial italic text-orange">
                        {n}
                      </span>
                      <div>
                        <div className="font-display text-lg tracking-wide text-cream">
                          {title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {sub}
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-cream/60 transition-all group-hover/theme:-translate-y-0.5 group-hover/theme:translate-x-0.5 group-hover/theme:text-orange" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- about --------------------------- */

function About() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-6 px-5 md:px-10">
        <div className="col-span-12 md:col-span-6" data-reveal>
          <div className="relative overflow-hidden rounded-3xl">
            <img
              src={about}
              alt="Prathibimb photography club"
              loading="lazy"
              width={1200}
              height={1400}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 flex flex-col justify-center">
          <div data-reveal>
            <div className="text-[10px] tracking-[0.4em] uppercase text-orange">
              About the Festival
            </div>
            <h2 className="mt-4 font-display text-[13vw] leading-[0.9] text-cream md:text-[5.5vw]">
              A festival of<br />
              <span className="font-editorial italic text-orange">seeing.</span>
            </h2>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-cream/80">
              Photomania is an inter-college photography and videography
              competition conducted by <span className="text-cream">Prathibimb Photography Club</span>. Participants showcase creativity through storytelling,
              visual composition and cinematic content creation.
            </p>
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-line/60 pt-8">
              {[
                ["50+", "Colleges"],
                ["4", "Themes"],
                ["₹100", "Entry Fee"],
              ].map(([n, l]) => (
                <div key={l}>
                  <div className="font-display text-4xl text-orange md:text-5xl">
                    {n}
                  </div>
                  <div className="mt-1 text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- why participate --------------------------- */

function WhyParticipate() {
  const items = [
    { icon: <Trophy className="h-6 w-6" />, title: "Cash Prizes", body: "Compete for exciting cash rewards across every category." },
    { icon: <Award className="h-6 w-6" />, title: "Certificates", body: "Every participant receives a signed certificate of participation." },
    { icon: <Instagram className="h-6 w-6" />, title: "Feature on Prathibimb", body: "Winning frames get featured on our official Instagram." },
    { icon: <Gift className="h-6 w-6" />, title: "Goodies & Surprises", body: "Exclusive kits, merch and surprise partner drops." },
  ];
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <h2
            className="font-display text-[14vw] leading-[0.9] text-cream md:text-[6vw]"
            data-reveal
          >
            Why <span className="font-editorial italic text-orange">participate?</span>
          </h2>
          <div className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground" data-reveal>
            Perks · 04
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <div
              key={it.title}
              data-reveal
              className="group relative overflow-hidden rounded-3xl border border-line/60 bg-charcoal/60 p-7 transition-all hover:-translate-y-1 hover:border-orange/50"
            >
              <div className="text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="mt-6 grid h-14 w-14 place-items-center rounded-2xl bg-orange/15 text-orange">
                {it.icon}
              </div>
              <div className="mt-6 font-display text-2xl text-cream">
                {it.title}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{it.body}</p>
              <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-orange/10 blur-3xl opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- gallery --------------------------- */

function Gallery() {
  const items = [
    { src: g1, w: 900, h: 1200, tall: true },
    { src: g2, w: 900, h: 900 },
    { src: g5, w: 900, h: 1200, tall: true },
    { src: g3, w: 900, h: 1100 },
    { src: g6, w: 900, h: 1100, tall: true },
    { src: g4, w: 900, h: 900 },
  ];
  return (
    <section id="gallery" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div data-reveal>
            <div className="text-[10px] tracking-[0.4em] uppercase text-orange">
              Archive · Selected work
            </div>
            <h2 className="mt-4 font-display text-[14vw] leading-[0.9] text-cream md:text-[6vw]">
              The <span className="font-editorial italic text-orange">gallery.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground" data-reveal>
            Frames from the Prathibimb archive — culture, portrait, product,
            architecture. A glimpse of what past editions delivered.
          </p>
        </div>

        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [column-fill:_balance]">
          {items.map((it, i) => (
            <figure
              key={i}
              data-reveal
              className="group mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-charcoal"
            >
              <div className="relative overflow-hidden">
                <img
                  src={it.src}
                  alt=""
                  loading="lazy"
                  width={it.w}
                  height={it.h}
                  className="h-auto w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-4 text-[10px] tracking-[0.3em] uppercase text-cream opacity-0 transition-opacity group-hover:opacity-100">
                  <span>Prathibimb · Archive</span>
                  <span className="text-orange">#{String(i + 1).padStart(2, "0")}</span>
                </div>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- faq --------------------------- */

const faqs = [
  {
    q: "Who can participate in Photomania 2026?",
    a: "Any student pursuing an undergraduate, degree or intermediate course from any college or school across India can participate. Bring a valid ID card on the event day.",
  },
  {
    q: "What should I bring on the event day?",
    a: "Your camera / phone, memory cards, any lenses you plan to use, a valid college ID, and your registration confirmation (email or SMS).",
  },
  {
    q: "Can I participate using mobile photography?",
    a: "Absolutely. All categories are open to both DSLR / mirrorless and mobile photography as long as the work is original.",
  },
  {
    q: "What is the registration fee?",
    a: "A flat entry fee of ₹100 per participant covers all categories you register for. Payment is completed via UPI QR after the form is submitted.",
  },
  {
    q: "When will winners be announced?",
    a: "Winners are announced at the closing ceremony on 14 August 2026 and later published on our official Instagram @prathibimb.tkr.",
  },
];

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-8 px-5 md:px-10">
        <div className="col-span-12 md:col-span-4" data-reveal>
          <div className="text-[10px] tracking-[0.4em] uppercase text-orange">
            Frequently asked
          </div>
          <h2 className="mt-4 font-display text-[14vw] leading-[0.9] text-cream md:text-[5vw]">
            Questions,<br />
            <span className="font-editorial italic text-orange">answered.</span>
          </h2>
          <p className="mt-6 text-sm text-muted-foreground">
            Can't find what you're looking for? Reach us on Instagram at{" "}
            <span className="text-cream">@prathibimb.tkr</span>.
          </p>
        </div>
        <div className="col-span-12 md:col-span-8">
          <div className="divide-y divide-line/60 border-y border-line/60">
            {faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={f.q} data-reveal>
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <div className="flex items-start gap-5">
                      <span className="mt-1 font-editorial italic text-orange">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-2xl leading-tight text-cream md:text-3xl">
                        {f.q}
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-cream/60 transition-transform duration-500 ${
                        isOpen ? "rotate-180 text-orange" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`grid overflow-hidden transition-[grid-template-rows] duration-500 ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="min-h-0">
                      <p className="pb-6 pl-10 pr-6 text-base text-muted-foreground">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- footer --------------------------- */

function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line/60 bg-ink pt-20 pb-10">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="font-display text-[22vw] leading-[0.8] text-cream/5 md:text-[14vw]">
          PHOTOMANIA
        </div>

        <div className="mt-16 grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-orange to-orange-burnt text-ink">
                <span className="font-display text-lg">TKR</span>
              </div>
              <div>
                <div className="font-display tracking-[0.28em] text-cream">
                  PRATHIBIMB
                </div>
                <div className="text-[10px] tracking-[0.32em] uppercase text-muted-foreground">
                  Photography Club · TKR CET
                </div>
              </div>
            </div>
            <p className="mt-6 max-w-md text-sm text-muted-foreground">
              TKR College of Engineering & Technology (Autonomous), Medbowli,
              Meerpet, Hyderabad — 500097.
            </p>
          </div>

          <div className="col-span-6 md:col-span-3">
            <div className="text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
              Quick Links
            </div>
            <ul className="mt-4 space-y-2 text-cream/80">
              <li><a href="#event" className="hover:text-orange">Event</a></li>
              <li><a href="#categories" className="hover:text-orange">Categories</a></li>
              <li><a href="#gallery" className="hover:text-orange">Gallery</a></li>
              <li><a href="#faq" className="hover:text-orange">FAQ</a></li>
            </ul>
          </div>

          <div className="col-span-6 md:col-span-4">
            <div className="text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
              Connect
            </div>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="#" className="flex items-center gap-3 text-cream/80 hover:text-orange">
                  <Instagram className="h-4 w-4" /> @prathibimb.tkr
                </a>
              </li>
              <li>
                <a href="mailto:prathibimb@tkrcet.ac.in" className="flex items-center gap-3 text-cream/80 hover:text-orange">
                  <Mail className="h-4 w-4" /> prathibimb@tkrcet.ac.in
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-3 text-cream/80 hover:text-orange">
                  <MapPin className="h-4 w-4" /> Medbowli, Meerpet, Hyderabad
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line/60 pt-6 text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          <div>© 2026 Prathibimb Photography Club · TKR CET</div>
          <div>Designed with care · Photomania Edition 01</div>
        </div>
      </div>
    </footer>
  );
}

/* --------------------------- modals --------------------------- */

function ModalShell({
  open,
  onClose,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", esc);
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-ink/80 p-4 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${wide ? "max-w-4xl" : "max-w-2xl"} overflow-hidden rounded-3xl border border-line/60 bg-charcoal shadow-2xl animate-in zoom-in-95 duration-300`}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-full border border-line/60 bg-ink/60 text-cream backdrop-blur transition-colors hover:bg-orange hover:text-ink"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

const photoThemes = [
  "Telangana Unfiltered — Bonalu",
  "Minimal Architecture — Through My Lens",
  "Candid Photography",
];
const videoThemes = ["Complete UGC Content"];

function RegistrationModal({
  open,
  onClose,
  prefill,
  user,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  prefill: { category?: string; theme?: string };
  user: User | null;
  onSubmit: (draft: RegDraft) => void;
}) {
  const [category, setCategory] = useState(prefill.category ?? "");
  const [theme, setTheme] = useState(prefill.theme ?? "");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");

  useEffect(() => {
    if (open) {
      setCategory(prefill.category ?? "");
      setTheme(prefill.theme ?? "");
      setEmail(user?.email ?? "");
      const meta = (user?.user_metadata ?? {}) as { full_name?: string };
      setFullName(meta.full_name ?? "");
    }
  }, [open, prefill, user]);

  const themes =
    category === "Photography"
      ? photoThemes
      : category === "Videography"
        ? videoThemes
        : [];

  return (
    <ModalShell open={open} onClose={onClose} wide>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr]">
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-orange to-orange-burnt p-8 text-ink md:block grain">
          <div className="text-[10px] tracking-[0.4em] uppercase">Step 01 of 02</div>
          <h3 className="mt-8 font-display text-6xl leading-none">Register.</h3>
          <p className="mt-4 font-editorial italic text-lg">
            Reserve your seat at Photomania 2026.
          </p>
          <div className="absolute bottom-8 left-8 right-8 text-[10px] tracking-[0.3em] uppercase text-ink/70">
            14 · 08 · 2026<br />TKR CET, Hyderabad
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              full_name: fullName.trim(),
              email: email.trim(),
              phone: phone.trim(),
              college: college.trim(),
              category,
              theme,
            });
          }}
          className="max-h-[85vh] overflow-y-auto p-6 md:p-10"
        >
          <h3 className="font-display text-3xl text-cream md:hidden">Register.</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <ControlledField label="Full Name" value={fullName} onChange={setFullName} placeholder="Alina Sharma" required />
            <ControlledField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@college.edu" required />
            <ControlledField label="Phone Number" type="tel" value={phone} onChange={setPhone} placeholder="+91 98xxxxxxxx" required />
            <div className="md:col-span-1">
              <ControlledField label="College / School" value={college} onChange={setCollege} placeholder="TKR College of Engineering & Technology" required />
            </div>

            <div>
              <Label>Event Category</Label>
              <Select
                value={category}
                onChange={(v) => {
                  setCategory(v);
                  setTheme("");
                }}
                options={["Photography", "Videography"]}
                placeholder="Choose category"
              />
            </div>
            <div>
              <Label>Theme</Label>
              <Select
                value={theme}
                onChange={setTheme}
                options={themes}
                placeholder={category ? "Select a theme" : "Pick a category first"}
                disabled={!category}
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-orange px-6 py-4 text-sm font-semibold tracking-[0.25em] uppercase text-ink transition-all hover:bg-orange-soft"
          >
            Continue to Payment
            <ArrowUpRight className="h-4 w-4" />
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Registration is confirmed only after payment verification.
          </p>
        </form>
      </div>
    </ModalShell>
  );
}

function ControlledField({
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
      <Label>{label}</Label>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-line/60 bg-ink/60 px-4 py-3 text-cream placeholder:text-muted-foreground/60 focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30"
      />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
      {children}
    </div>
  );
}

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        {...props}
        className="w-full rounded-2xl border border-line/60 bg-ink/60 px-4 py-3 text-cream placeholder:text-muted-foreground/60 focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30"
      />
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required
        className="w-full appearance-none rounded-2xl border border-line/60 bg-ink/60 px-4 py-3 text-cream focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/30 disabled:opacity-50"
      >
        <option value="" className="bg-charcoal">
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-charcoal">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function PaymentModal({
  open,
  onClose,
  draft,
  user,
}: {
  open: boolean;
  onClose: () => void;
  draft: RegDraft | null;
  user: User | null;
}) {
  const [done, setDone] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [utr, setUtr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setDone(false);
      setFile(null);
      setUtr("");
      setError(null);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!user || !draft) {
      setError("Missing session or registration details.");
      return;
    }
    if (!file) {
      setError("Please upload your payment screenshot.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Screenshot must be an image (PNG or JPG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Screenshot must be under 5 MB.");
      return;
    }
    const trimmed = utr.trim();
    if (trimmed.length < 6) {
      setError("Enter a valid Transaction / UTR ID.");
      return;
    }

    setSubmitting(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage
        .from("payment-proofs")
        .upload(path, file, { contentType: file.type });
      if (up.error) throw up.error;

      const { error: insErr } = await supabase.from("registrations").insert({
        user_id: user.id,
        full_name: draft.full_name,
        email: draft.email,
        phone: draft.phone,
        college: draft.college,
        category: draft.category,
        theme: draft.theme || null,
        transaction_id: trimmed,
        screenshot_path: path,
      });
      if (insErr) throw insErr;

      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell open={open} onClose={onClose} wide>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative bg-cream p-8 text-ink md:p-10">
          <div className="text-[10px] tracking-[0.4em] uppercase text-ink/60">
            Step 02 of 02 · Payment
          </div>
          <div className="mt-6 grid place-items-center rounded-3xl border border-ink/10 bg-white p-6">
            <div className="grid aspect-square w-full max-w-[260px] place-items-center rounded-2xl bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%)] bg-[length:16px_16px] bg-[position:0_0,8px_8px]">
              <div className="grid h-20 w-20 place-items-center rounded-xl bg-white shadow">
                <QrCode className="h-10 w-10 text-ink" />
              </div>
            </div>
            <div className="mt-6 text-center">
              <div className="text-[10px] tracking-[0.35em] uppercase text-ink/50">
                Scan to pay
              </div>
              <div className="mt-2 font-display text-5xl text-ink">₹100</div>
              <div className="mt-1 text-xs text-ink/60">
                UPI · prathibimb@upi
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10">
          <div className="text-[10px] tracking-[0.4em] uppercase text-orange">
            Verify Payment
          </div>
          <h3 className="mt-4 font-display text-4xl text-cream">
            Confirm your entry.
          </h3>
          {done ? (
            <div className="mt-8 flex flex-col items-center rounded-3xl border border-orange/40 bg-orange/10 p-8 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-orange text-ink">
                <Check className="h-6 w-6" />
              </div>
              <div className="mt-4 font-display text-2xl text-cream">
                Submission received
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Your entry is <strong className="text-orange">pending verification</strong>. We'll review your payment and update your status within 24 hours.
              </p>
              <Link
                to="/my-registrations"
                onClick={onClose}
                className="mt-6 rounded-full bg-cream px-6 py-3 text-xs font-semibold tracking-[0.25em] uppercase text-ink hover:bg-orange"
              >
                View my registrations
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <ControlledField
                label="Transaction ID / UTR"
                value={utr}
                onChange={setUtr}
                placeholder="e.g. 4302XXXXXX"
                required
              />
              <div>
                <Label>Upload Screenshot</Label>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full items-center justify-between rounded-2xl border border-dashed border-line bg-ink/60 px-4 py-4 text-left text-cream/80 transition-colors hover:border-orange"
                >
                  <span className="flex items-center gap-3">
                    <Upload className="h-4 w-4 text-orange" />
                    {file ? file.name : "Choose payment screenshot"}
                  </span>
                  <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                    PNG / JPG · &lt;5MB
                  </span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  hidden
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-orange px-6 py-4 text-sm font-semibold tracking-[0.25em] uppercase text-ink transition-all hover:bg-orange-soft disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit for Verification"}
                <Check className="h-4 w-4" />
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Registration will only be confirmed after payment verification.
              </p>
            </form>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

/* ── Support Modal ───────────────────────────────── */
function SupportModal({ onClose }: { onClose: () => void }) {
  const [sujet, setSujet] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const to = "houllegatte.arnaud@gmail.com";
    const subject = encodeURIComponent(sujet || "Demande de support – Prodige RH Tools");
    const body = encodeURIComponent(message);
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 anim-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-lg" />
      <div
        className="relative w-full max-w-md z-10 rounded-2xl overflow-hidden anim-slide-down"
        style={{
          background: "linear-gradient(145deg, #0c1d2e, #081520)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(181,228,103,0.06)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top lime line */}
        <div
          className="h-px w-full"
          style={{ background: "linear-gradient(90deg, transparent, #B5E467 40%, transparent)" }}
        />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <img
                src="/arnaud.png"
                alt="Arnaud"
                className="w-11 h-11 rounded-full object-cover"
                style={{ border: "2px solid rgba(181,228,103,0.6)" }}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#B5E467] border-[2px] border-[#081520] anim-pulse-lime" />
            </div>
            <div>
              <h2 className="font-bold text-white text-[15px]" style={{ fontFamily: "Syne, sans-serif" }}>
                Contacter Arnaud
              </h2>
              <p className="text-white/40 text-xs">Support &amp; suggestions sur l'outil</p>
            </div>
            <button
              onClick={onClose}
              className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                Sujet
              </label>
              <input
                type="text"
                value={sujet}
                onChange={(e) => setSujet(e.target.value)}
                placeholder="Ex: Problème sur la génération de synthèse…"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#B5E467]/40"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
              />
            </div>
            <div>
              <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Décrivez votre demande ou suggestion…"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#B5E467]/40 resize-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
              />
            </div>
          </div>

          <div className="flex gap-2.5 mt-5">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white/40 hover:text-white transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.09)" }}
            >
              Annuler
            </button>
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm btn-lime flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Module data ─────────────────────────────────── */
const modules = [
  {
    title: "Synthèse Candidat",
    description: "Générez une synthèse de candidature au format Word avec l'IA, fidèle à votre charte.",
    href: "/synthese",
    badge: true,
    featured: true,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
  {
    title: "Tableau de Bord",
    description: "Importez vos exports Tiime et pilotez votre activité : CA, pipeline, recouvrement, TJM.",
    href: "/dashboard",
    badge: true,
    featured: true,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    title: "Fiche de Poste IA",
    description: "Générez une offre d'emploi dans l'esprit Positiv' Recrutement de Prodige RH.",
    href: "/fiche-poste",
    badge: true,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
      </svg>
    ),
  },
  {
    title: "Compte-rendu IA",
    description: "Collez un transcript de call client — l'IA génère un CR structuré avec actions.",
    href: "/compte-rendu",
    badge: true,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
      </svg>
    ),
  },
  {
    title: "Proposition Commerciale",
    description: "Générez une lettre de mission personnalisée et professionnelle en quelques secondes.",
    href: "/proposition",
    badge: true,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    title: "Préqualification IA",
    description: "Guide structuré pour vos appels de préqualification — checklist + notes + synthèse IA à chaud.",
    href: "/prequalification",
    badge: true,
    featured: true,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
      </svg>
    ),
  },
  {
    title: "Kit Communication",
    description: "Calendrier éditorial, idées de posts LinkedIn et prompts IA optimisés.",
    href: "/communication",
    badge: false,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 1 8.835-2.535m0 0A23.74 23.74 0 0 1 18.795 3c1.167 0 2.31.22 3.36.63m-3.36-.63a23.74 23.74 0 0 0-3.36-.63M3.75 12c0 .14.003.28.007.42M12 12c0-.14-.003-.28-.007-.42m.007.42A11.95 11.95 0 0 1 12 12Z" />
      </svg>
    ),
  },
  {
    title: "Veille Tendances",
    description: "Rapport IA sur le marché du recrutement à Laval, Mayenne et Pays de la Loire.",
    href: "/veille",
    badge: true,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
      </svg>
    ),
  },
  {
    title: "Onboarding Candidats",
    description: "Suivi post-recrutement : rappels J+2, J+21, J+30 avec relances email personnalisées.",
    href: "/onboarding",
    badge: false,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
  },
];

const delayClasses = ["d-50", "d-100", "d-150", "d-200", "d-250", "d-300", "d-350", "d-400", "d-500"];

/* ── Page ────────────────────────────────────────── */
type RecentModule = { href: string; title: string; ts: number };

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (min < 2) return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${d}j`;
}

export default function Home() {
  const [supportOpen, setSupportOpen] = useState(false);
  const [recent, setRecent] = useState<RecentModule[]>([]);
  const [onboardingAlerts, setOnboardingAlerts] = useState(0);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  useEffect(() => {
    try {
      const stored = localStorage.getItem("prodige_recent");
      if (stored) setRecent(JSON.parse(stored));
    } catch {}
    try {
      const raw = localStorage.getItem("prodige_onboarding");
      if (raw) {
        const entries = JSON.parse(raw) as Array<{
          statut: string;
          dates: { j2: string; j21: string; j30: string };
          reminders: { j2: { sent: boolean }; j21_candidat: { sent: boolean }; j21_client: { sent: boolean }; j30: { sent: boolean } };
        }>;
        const now = new Date(); now.setHours(0,0,0,0);
        const count = entries.filter((e) => {
          if (e.statut !== "actif") return false;
          const overdue = (d: string, sent: boolean) => !sent && new Date(d + "T00:00:00") < now;
          return overdue(e.dates.j2, e.reminders.j2.sent) ||
            overdue(e.dates.j21, e.reminders.j21_candidat.sent) ||
            overdue(e.dates.j21, e.reminders.j21_client.sent) ||
            overdue(e.dates.j30, e.reminders.j30.sent);
        }).length;
        setOnboardingAlerts(count);
      }
    } catch {}
  }, []);

  const trackVisit = (href: string, title: string) => {
    try {
      const prev: RecentModule[] = JSON.parse(localStorage.getItem("prodige_recent") || "[]");
      const updated = [{ href, title, ts: Date.now() }, ...prev.filter((r) => r.href !== href)].slice(0, 3);
      localStorage.setItem("prodige_recent", JSON.stringify(updated));
      setRecent(updated);
    } catch {}
  };

  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #060e1a 0%, #071525 60%, #060e1a 100%)" }}
    >
      {/* ── Atmospheric background ── */}
      <div className="fixed inset-0 pointer-events-none dot-grid" />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Teal blob – top right */}
        <div
          className="absolute anim-float-a"
          style={{
            top: "-20%",
            right: "-8%",
            width: 740,
            height: 740,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(3,75,92,0.38) 0%, transparent 68%)",
          }}
        />
        {/* Lime blob – bottom left */}
        <div
          className="absolute anim-float-b"
          style={{
            bottom: "-20%",
            left: "-12%",
            width: 680,
            height: 680,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(181,228,103,0.07) 0%, transparent 68%)",
          }}
        />
        {/* Mid depth blob */}
        <div
          className="absolute"
          style={{
            top: "35%",
            left: "25%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6,14,26,0.7) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ── Header ── */}
      <header className="relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <img
            src="https://images.squarespace-cdn.com/content/v1/6899b74809899f1d0b9b0b17/a96abffa-706a-4cf0-a1f9-76421c8f822e/prodige+rh+logo+transparent.png?format=1500w"
            alt="Prodige RH"
            className="h-9"
          />

          {/* Right */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-right">
              <p className="text-white/25 text-[11px]">Outils professionnels</p>
              <p className="text-[11px] font-semibold" style={{ color: "#B5E467" }}>
                by Arnaud
              </p>
            </div>
            <button
              onClick={() => setSupportOpen(true)}
              title="Contacter Arnaud – Support"
              className="relative group focus:outline-none"
            >
              <img
                src="/arnaud.png"
                alt="Arnaud"
                className="w-9 h-9 rounded-full object-cover transition-transform duration-200 group-hover:scale-105"
                style={{
                  border: "2px solid rgba(181,228,103,0.5)",
                  boxShadow: "0 0 0 3px rgba(181,228,103,0)",
                  transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#B5E467";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(181,228,103,0.2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(181,228,103,0.5)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(181,228,103,0)";
                }}
              />
            </button>
          </div>
        </div>
        {/* Separator */}
        <div
          className="h-px mx-6"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }}
        />
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-14 pb-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-20">

          {/* Left – text */}
          <div className="flex-1 anim-fade-up">
            {/* Status pill */}
            <div className="pill-lime mb-8 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B5E467] anim-pulse-lime flex-shrink-0" />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: "#B5E467" }}
              >
                Tableau de bord · Prodige RH
              </span>
            </div>

            {/* Heading */}
            <h1
              className="text-5xl lg:text-6xl xl:text-[68px] leading-[1.04] mb-5"
              style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, color: "white" }}
            >
              {greeting},
              <br />
              <span style={{ color: "#B5E467" }}>Delphine</span>
            </h1>

            <p className="text-white/40 text-base lg:text-[17px] leading-relaxed mb-10 max-w-md">
              Tous vos outils Prodige RH en un seul endroit.{" "}
              <span className="text-white/60">Gagnez du temps, recrutez mieux.</span>
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-7">
              {[
                { value: "9", label: "outils" },
                { value: "7", label: "avec IA", accent: true },
                { value: "∞", label: "possibilités" },
              ].map((s, i) => (
                <div
                  key={i}
                  className={i > 0 ? "border-l border-white/10 pl-7" : ""}
                >
                  <p
                    className="text-2xl font-bold leading-none mb-1"
                    style={{
                      fontFamily: "Syne, sans-serif",
                      color: s.accent ? "#B5E467" : "white",
                    }}
                  >
                    {s.value}
                  </p>
                  <p className="text-white/30 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right – Delphine portrait */}
          <div className="relative flex-shrink-0 anim-fade-up d-200 lg:mt-2">
            {/* Outer dashed orbit */}
            <div
              className="absolute anim-spin-slow rounded-full pointer-events-none"
              style={{
                inset: "-28px",
                border: "1px dashed rgba(181,228,103,0.14)",
              }}
            />
            {/* Inner orbit */}
            <div
              className="absolute anim-spin-rev rounded-full pointer-events-none"
              style={{
                inset: "-14px",
                border: "1px solid rgba(181,228,103,0.08)",
              }}
            />
            {/* Glow aura */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                inset: "-4px",
                background: "radial-gradient(circle, rgba(181,228,103,0.18) 0%, transparent 70%)",
                filter: "blur(16px)",
              }}
            />
            {/* Portrait */}
            <div
              className="relative rounded-full overflow-hidden"
              style={{
                width: 188,
                height: 188,
                border: "3px solid rgba(181,228,103,0.55)",
                boxShadow: "0 0 0 1px rgba(181,228,103,0.15), 0 24px 64px rgba(0,0,0,0.55)",
              }}
            >
              <img
                src="/delphine.jpg"
                alt="Delphine Pilorge"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Name badge */}
            <div
              className="absolute left-1/2 z-10 px-4 py-2 rounded-xl text-center whitespace-nowrap"
              style={{
                bottom: "-18px",
                transform: "translateX(-50%)",
                background: "rgba(6,14,26,0.92)",
                border: "1px solid rgba(181,228,103,0.2)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
            >
              <p
                className="text-white text-xs font-bold"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Delphine Pilorge
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "#B5E467" }}>
                Gérante · Prodige RH
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Module grid ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-20">
        {/* ── Reprendre ── */}
        {recent.length > 0 && (
          <div className="mb-10 anim-fade-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-4 h-px" style={{ background: "rgba(255,255,255,0.15)" }} />
              <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.22em]">Reprendre</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {recent.map((r) => {
                const mod = modules.find((m) => m.href === r.href);
                return (
                  <Link
                    key={r.href}
                    href={r.href}
                    className="recent-pill group"
                    onClick={() => trackVisit(r.href, r.title)}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(181,228,103,0.10)", color: "#B5E467" }}>
                      {mod?.icon}
                    </div>
                    <div>
                      <p className="text-white text-xs font-semibold leading-tight">{r.title}</p>
                      <p className="text-white/30 text-[10px] mt-0.5">{timeAgo(r.ts)}</p>
                    </div>
                    <svg className="w-3 h-3 text-white/20 ml-1 group-hover:text-[#B5E467] transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Section label */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-6 h-px" style={{ background: "#B5E467" }} />
          <p className="text-white/25 text-[10px] font-bold uppercase tracking-[0.22em]">
            Vos outils
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m, i) => (
            <Link key={m.href} href={m.href} className="group block" onClick={() => trackVisit(m.href, m.title)}>
              <div className={`card-glass rounded-2xl p-6 h-full anim-fade-up ${delayClasses[i]} ${"featured" in m && m.featured ? "card-featured" : ""}`}>
                {/* Top row */}
                <div className="flex items-start justify-between mb-5">
                  <div className="relative">
                    <div className="icon-box">
                      {m.icon}
                    </div>
                    {m.href === "/onboarding" && onboardingAlerts > 0 && (
                      <span
                        className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: "#ef4444", boxShadow: "0 0 0 2px #060e1a" }}
                      >
                        {onboardingAlerts}
                      </span>
                    )}
                  </div>
                  {m.badge && <span className="badge-ia">IA</span>}
                </div>

                {/* Title */}
                <h3 className="mod-title text-[15px] mb-2">{m.title}</h3>

                {/* Description */}
                <p className="text-white/35 text-sm leading-relaxed mb-6">
                  {m.description}
                </p>

                {/* CTA */}
                <div className="cta-link">
                  <span>Accéder</span>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="relative z-10"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/20 text-[11px]">
            Prodige RH — 27 rue Jules Ferry, 53 000 Laval — SIRET : 893 173 575 00034
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B5E467] anim-pulse-lime" />
            <span className="text-white/20 text-[11px]">Outils en ligne</span>
          </div>
        </div>
      </footer>

      {/* Support Modal */}
      {supportOpen && <SupportModal onClose={() => setSupportOpen(false)} />}
    </main>
  );
}

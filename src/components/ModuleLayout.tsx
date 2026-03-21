"use client";

import { useState } from "react";
import Link from "next/link";

/* ── Support Modal ─────────────────────────────────── */
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
        <div
          className="h-px w-full"
          style={{ background: "linear-gradient(90deg, transparent, #B5E467 40%, transparent)" }}
        />
        <div className="p-6">
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
              <p className="text-white font-semibold text-sm">Arnaud · Développeur</p>
              <p className="text-white/40 text-xs">Support technique Prodige RH Tools</p>
            </div>
          </div>
          <div className="space-y-3 mb-5">
            <input
              value={sujet}
              onChange={(e) => setSujet(e.target.value)}
              placeholder="Sujet de votre message"
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-[#B5E467]/60"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Décrivez votre problème ou suggestion…"
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-[#B5E467]/60 resize-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:text-white/80 transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              Annuler
            </button>
            <button
              onClick={handleSend}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold btn-lime"
              style={{ borderRadius: "12px" }}
            >
              Envoyer →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Module icons map ──────────────────────────────── */
const MODULE_ICONS: Record<string, React.ReactNode> = {
  document: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
  chart: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  ),
  briefcase: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  ),
  chat: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
    </svg>
  ),
  envelope: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  ),
  megaphone: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 1 8.835-2.535m0 0A23.74 23.74 0 0 1 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
    </svg>
  ),
  trending: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
    </svg>
  ),
  people: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  ),
};

/* ── Props ─────────────────────────────────────────── */
interface ModuleLayoutProps {
  children: React.ReactNode;
  title: string;
  titleAccent?: string;
  subtitle?: string;
  badge?: boolean;
  icon?: keyof typeof MODULE_ICONS;
  backHref?: string;
  darkBody?: boolean;
}

/* ── Component ─────────────────────────────────────── */
export default function ModuleLayout({
  children,
  title,
  titleAccent,
  subtitle,
  badge = false,
  icon = "document",
  backHref = "/",
  darkBody = false,
}: ModuleLayoutProps) {
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: darkBody ? "linear-gradient(160deg, #060e1a 0%, #071525 60%, #060e1a 100%)" : "#f0ebe3" }}
    >
      {/* ── Header ──────────────────────────────────── */}
      <header
        className="relative z-20 flex-shrink-0"
        style={{
          background: "linear-gradient(180deg, #060e1a 0%, #081F34 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Left: logo + breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex-shrink-0">
              <img
                src="https://images.squarespace-cdn.com/content/v1/6899b74809899f1d0b9b0b17/a96abffa-706a-4cf0-a1f9-76421c8f822e/prodige+rh+logo+transparent.png?format=1500w"
                alt="Prodige RH"
                className="h-8"
              />
            </Link>

            <div className="h-4 w-px bg-white/10 flex-shrink-0" />

            <Link
              href={backHref}
              className="flex items-center gap-1.5 text-white/35 hover:text-white/70 transition-colors text-xs font-medium flex-shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              <span className="hidden sm:inline">Accueil</span>
            </Link>

            <div className="h-4 w-px bg-white/10 flex-shrink-0" />

            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(181,228,103,0.12)", border: "1px solid rgba(181,228,103,0.2)", color: "#B5E467" }}
              >
                {MODULE_ICONS[icon]}
              </div>
              <h1
                className="text-sm font-bold text-white truncate"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                {title}
                {titleAccent && (
                  <span style={{ color: "#B5E467" }}> {titleAccent}</span>
                )}
              </h1>
              {badge && <span className="badge-ia flex-shrink-0">IA</span>}
            </div>
          </div>

          {/* Right: logout + support */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/login";
              }}
              className="hidden sm:block text-white/20 text-[11px] hover:text-white/50 transition-colors"
              title="Se déconnecter"
            >
              Déconnexion
            </button>
            <button
              onClick={() => setSupportOpen(true)}
              title="Contacter Arnaud – Support"
              className="relative group focus:outline-none"
            >
              <img
                src="/arnaud.png"
                alt="Arnaud"
                className="w-8 h-8 rounded-full object-cover"
                style={{ border: "2px solid rgba(181,228,103,0.4)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#B5E467";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(181,228,103,0.2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(181,228,103,0.4)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              />
            </button>
          </div>
        </div>

        {/* Module hero strip */}
        {subtitle && (
          <div
            style={{
              background: "linear-gradient(135deg, #034B5C 0%, #071e2e 100%)",
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
              <p className="text-white/55 text-sm max-w-2xl leading-relaxed">{subtitle}</p>
            </div>
          </div>
        )}
      </header>

      {/* ── Body ────────────────────────────────────── */}
      <main className="flex-1">
        {children}
      </main>

      {/* ── Footer ──────────────────────────────────── */}
      <footer
        className="flex-shrink-0 mt-auto"
        style={{
          background: "linear-gradient(180deg, #060e1a 0%, #071525 100%)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
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
    </div>
  );
}

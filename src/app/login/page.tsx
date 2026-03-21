"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const LOGO =
  "https://images.squarespace-cdn.com/content/v1/6899b74809899f1d0b9b0b17/a96abffa-706a-4cf0-a1f9-76421c8f822e/prodige+rh+logo+transparent.png?format=1500w";

const FEATURES = [
  { icon: "✦", label: "Synthèse candidat générée en 1 clic" },
  { icon: "✦", label: "Veille tendances RH Laval & Mayenne" },
  { icon: "✦", label: "Pilotage financier & tableau de bord" },
  { icon: "✦", label: "Emails clients personnalisés par l'IA" },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push(from);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Identifiants incorrects");
      }
    } catch {
      setError("Erreur réseau, réessayez");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex" style={{ background: "#05101e" }}>

      {/* ── LEFT PANEL ───────────────────────────────────────────────── */}
      <div
        className="hidden md:flex flex-col justify-between w-[46%] p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(150deg, #071828 0%, #060e1a 100%)" }}
      >
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{
            position: "absolute", top: "5%", left: "-15%",
            width: 560, height: 560, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(181,228,103,0.055) 0%, transparent 65%)",
          }} />
          <div style={{
            position: "absolute", bottom: "-10%", right: "-20%",
            width: 480, height: 480, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(3,75,92,0.22) 0%, transparent 65%)",
          }} />
        </div>

        {/* Vertical accent line */}
        <div
          className="absolute right-0 top-0 bottom-0 w-px"
          style={{ background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent 100%)" }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <img src={LOGO} alt="Prodige RH" className="h-9 mb-3" />
          <p
            className="text-white/90 font-light uppercase tracking-[0.35em] text-sm"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Connect
          </p>
        </div>

        {/* Center — tagline + features */}
        <div className="relative z-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
            style={{ background: "rgba(181,228,103,0.08)", border: "1px solid rgba(181,228,103,0.15)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#B5E467] animate-pulse" />
            <span className="text-[#B5E467] text-xs font-medium tracking-wide">Propulsé par GPT-4o</span>
          </div>

          <h2
            className="text-3xl font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Votre espace de travail<br />
            <span style={{ color: "#B5E467" }}>augmenté par l&apos;IA</span>
          </h2>

          <p className="text-white/35 text-sm leading-relaxed mb-10 max-w-xs">
            Tout ce dont Prodige RH a besoin au quotidien, centralisé et automatisé en un seul outil.
          </p>

          <div className="flex flex-col gap-4">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-center gap-3.5">
                <span className="text-[#B5E467] text-[10px]">{f.icon}</span>
                <span className="text-white/45 text-sm">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="relative z-10 text-white/15 text-xs">
          © {new Date().getFullYear()} Prodige RH · Laval (53) · prodige-rh.fr
        </p>
      </div>

      {/* ── RIGHT PANEL — FORM ──────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Subtle top gradient line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(181,228,103,0.2) 50%, transparent)" }}
        />

        <div className="w-full max-w-[360px] anim-fade-up">

          {/* Mobile logo */}
          <div className="md:hidden text-center mb-10">
            <img src={LOGO} alt="Prodige RH" className="h-9 mx-auto mb-3" />
            <p
              className="text-white/80 font-light uppercase tracking-[0.35em] text-sm"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Connect
            </p>
          </div>

          {/* Form header */}
          <div className="mb-8">
            <h1
              className="text-2xl font-bold text-white mb-2"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Connexion
            </h1>
            <p className="text-white/30 text-sm">Accès réservé à l&apos;équipe Prodige RH</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-white/35 text-[10px] font-semibold uppercase tracking-widest mb-2">
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom@prodige-rh.fr"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/18 transition-all focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  caretColor: "#B5E467",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(181,228,103,0.35)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(181,228,103,0.06)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/35 text-[10px] font-semibold uppercase tracking-widest mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm text-white placeholder-white/18 transition-all focus:outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    caretColor: "#B5E467",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "1px solid rgba(181,228,103,0.35)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(181,228,103,0.06)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", color: "#f87171" }}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3.5 rounded-xl text-sm font-bold transition-all mt-1 relative overflow-hidden disabled:opacity-40"
              style={{
                background: loading
                  ? "rgba(181,228,103,0.7)"
                  : "linear-gradient(135deg, #c6f135 0%, #B5E467 100%)",
                color: "#081F34",
                boxShadow: loading ? "none" : "0 4px 24px rgba(181,228,103,0.22)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#081F34]/40 border-t-[#081F34] rounded-full animate-spin inline-block" />
                  Connexion…
                </span>
              ) : (
                "Se connecter →"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-white/12 text-xs mt-8 md:hidden">
            © {new Date().getFullYear()} Prodige RH · Laval (53)
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

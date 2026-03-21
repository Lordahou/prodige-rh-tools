"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        setError(data.error || "Erreur de connexion");
      }
    } catch {
      setError("Erreur réseau, réessayez");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #060e1a 0%, #071525 60%, #060e1a 100%)" }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none dot-grid" />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute anim-float-a"
          style={{ top: "-20%", right: "-8%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(3,75,92,0.35) 0%, transparent 68%)" }}
        />
        <div
          className="absolute anim-float-b"
          style={{ bottom: "-20%", left: "-12%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(181,228,103,0.07) 0%, transparent 68%)" }}
        />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm anim-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="https://images.squarespace-cdn.com/content/v1/6899b74809899f1d0b9b0b17/a96abffa-706a-4cf0-a1f9-76421c8f822e/prodige+rh+logo+transparent.png?format=1500w"
            alt="Prodige RH"
            className="h-10 mx-auto mb-3"
          />
          <p
            className="text-white text-2xl font-light tracking-[0.25em] uppercase"
            style={{ fontFamily: "Syne, sans-serif", letterSpacing: "0.3em" }}
          >
            Connect
          </p>
        </div>

        <div
          className="rounded-2xl p-7"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
          }}
        >
          {/* Top lime line */}
          <div
            className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
            style={{ background: "linear-gradient(90deg, transparent, rgba(181,228,103,0.5) 40%, transparent)" }}
          />

          <h1
            className="text-xl font-bold text-white mb-1"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Connexion
          </h1>
          <p className="text-white/30 text-sm mb-6">Outils Prodige RH</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom@prodige-rh.fr"
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#B5E467]/40"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
              />
            </div>

            <div>
              <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#B5E467]/40"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
              />
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className={`w-full py-3 rounded-xl text-sm font-bold btn-lime mt-2 ${loading ? "btn-loading" : ""}`}
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>

        <p className="text-center text-white/15 text-xs mt-6">
          Prodige RH — Laval (53)
        </p>
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

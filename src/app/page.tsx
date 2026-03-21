"use client";

import Link from "next/link";

const modules = [
  {
    title: "Synthese Candidat",
    description:
      "Generez une synthese de candidature au format Word avec l'IA, fidele a votre charte.",
    href: "/synthese",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
    badge: "IA",
  },
  {
    title: "Tableau de Bord",
    description:
      "Importez vos exports Tiime et pilotez votre activite : CA, pipeline, recouvrement, TJM.",
    href: "/dashboard",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
    badge: "IA",
  },
  {
    title: "Kit Communication",
    description:
      "Calendrier editorial, idees de posts LinkedIn et prompts IA optimises.",
    href: "/communication",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
      </svg>
    ),
  },
  {
    title: "Veille Tendances",
    description:
      "Rapport IA sur le marche du recrutement a Laval, Mayenne et Pays de la Loire.",
    href: "/veille",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
      </svg>
    ),
    badge: "IA",
  },
];

export default function Home() {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon apres-midi" : "Bonsoir";

  return (
    <main className="min-h-screen bg-[#f0ebe3]">
      {/* Header dark - style site Prodige RH */}
      <header className="bg-[#081F34]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <img
            src="https://images.squarespace-cdn.com/content/v1/6899b74809899f1d0b9b0b17/a96abffa-706a-4cf0-a1f9-76421c8f822e/prodige+rh+logo+transparent.png?format=1500w"
            alt="Prodige RH"
            className="h-10"
          />
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex flex-col items-end">
              <p className="text-sm text-gray-400">Outils professionnels</p>
              <p className="text-xs text-gray-300">by Arnaud</p>
            </div>
            <img
              src="/arnaud.png"
              alt="Arnaud"
              className="w-9 h-9 rounded-full object-cover border-2 border-[#B5E467]"
            />
          </div>
        </div>
      </header>

      {/* Hero section - fond dark teal */}
      <section className="bg-[#034B5C] text-white">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <h2 className="text-3xl font-extrabold mb-2">
            {greeting}, <span className="text-[#B5E467]">Delphine</span>
          </h2>
          <p className="text-white/70 text-lg">
            Vos outils pour gagner du temps au quotidien.
          </p>
        </div>
      </section>

      {/* Module cards - fond beige */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-2 gap-6">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group relative bg-white rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300"
              style={{ boxShadow: "var(--shadow-card)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card-hover)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card)"; }}
            >
              <div className="p-7">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#034B5C] text-[#B5E467] flex items-center justify-center">
                    {m.icon}
                  </div>
                  {m.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#B5E467] text-[#081F34] px-2.5 py-1 rounded-full">
                      {m.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-[#081F34] uppercase tracking-wide mb-2">
                  {m.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {m.description}
                </p>

                <div className="inline-flex items-center gap-2 bg-[#081F34] text-white text-sm font-semibold px-5 py-2.5 rounded-full group-hover:bg-[#B5E467] group-hover:text-[#081F34] transition-all">
                  <span>Acceder</span>
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer - vert lime comme le site */}
      <footer className="bg-[#B5E467] mt-8">
        <div className="max-w-6xl mx-auto px-6 py-5 text-center text-sm font-semibold text-[#081F34]">
          Prodige RH — 27 rue Jules Ferry, 53 000 Laval — SIRET : 893 173 575 00034
        </div>
      </footer>
    </main>
  );
}

"use client";

import Link from "next/link";

const modules = [
  {
    title: "Synthèse Candidat",
    description:
      "Générez une synthèse de candidature professionnelle au format Word, respectant la charte Prodige RH.",
    href: "/synthese",
    icon: "📄",
    color: "border-[#034B5C]",
  },
  {
    title: "Tableau de Bord",
    description:
      "Importez vos exports Tiime et visualisez vos KPIs : CA, pipeline, recouvrement, panier moyen.",
    href: "/dashboard",
    icon: "📊",
    color: "border-[#B5E467]",
  },
  {
    title: "Kit Communication",
    description:
      "Calendrier éditorial, générateur d'idées de posts LinkedIn et prompts optimisés pour la communication.",
    href: "/communication",
    icon: "💬",
    color: "border-[#034B5C]",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8fafb]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#034B5C] flex items-center justify-center">
              <span className="text-[#B5E467] font-bold text-xl">P</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#034B5C]">
                Prod<span className="text-[#B5E467]">!</span>ge RH
              </h1>
              <p className="text-sm text-gray-500">
                Outils professionnels
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-[#081F34] mb-2">
          Bonjour Delphine
        </h2>
        <p className="text-gray-600 mb-10 text-lg">
          Vos outils pour gagner du temps au quotidien.
        </p>

        {/* Module cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className={`group bg-white rounded-xl border-l-4 ${m.color} shadow-sm hover:shadow-md transition-all p-6 block`}
            >
              <div className="text-4xl mb-4">{m.icon}</div>
              <h3 className="text-xl font-semibold text-[#034B5C] mb-2 group-hover:text-[#B5E467] transition-colors">
                {m.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {m.description}
              </p>
              <div className="mt-4 text-[#034B5C] font-medium text-sm group-hover:translate-x-1 transition-transform inline-block">
                Accéder →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-4 text-center text-sm text-gray-400">
          Prodige RH — 27 rue Jules Ferry, 53 000 Laval — SIRET : 893 173 575 00034
        </div>
      </footer>
    </main>
  );
}

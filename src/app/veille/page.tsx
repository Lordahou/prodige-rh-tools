"use client";

import { useState } from "react";
import ModuleLayout from "@/components/ModuleLayout";

interface TendanceLocale {
  titre: string;
  description: string;
  impact: string;
  action_prodige: string;
  source?: string;
  url?: string;
}

interface ProfilPenurique {
  profil: string;
  secteur: string;
  tension: string;
  conseil: string;
  source?: string;
  url?: string;
}

interface Reglementation {
  titre: string;
  description: string;
  date_effet: string;
  impact_recrutement: string;
  url?: string;
}

interface IdeeLinkedin {
  sujet: string;
  angle: string;
  accroche: string;
}

interface ChiffreCle {
  chiffre: string;
  source: string;
  url?: string;
  commentaire: string;
}

interface VeilleData {
  date: string;
  resume_executif: string;
  tendances_locales: TendanceLocale[];
  marche_emploi: {
    mayenne: string;
    pays_de_la_loire: string;
    national: string;
    sources?: { nom: string; url: string }[];
  };
  profils_penuriques: ProfilPenurique[];
  reglementation: Reglementation[];
  idees_linkedin: IdeeLinkedin[];
  chiffres_cles: ChiffreCle[];
}

function SourceLink({ url, label }: { url?: string; label?: string }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs text-[#034B5C] hover:text-[#B5E467] hover:underline transition-colors mt-1"
    >
      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
      </svg>
      {label || "Vérifier la source"}
    </a>
  );
}

const impactColors: Record<string, string> = {
  fort: "bg-red-100 text-red-700",
  moyen: "bg-orange-100 text-orange-700",
  faible: "bg-[#e8f5d0] text-[#3d6b0f]",
  critique: "bg-red-100 text-red-700",
  elevee: "bg-orange-100 text-orange-700",
  moderee: "bg-[#e8e2d8] text-[#081F34]",
};

export default function VeillePage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VeilleData | null>(null);
  const [error, setError] = useState("");
  const [focus, setFocus] = useState("");
  const [activeSection, setActiveSection] = useState("resume");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/veille", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focus }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setData(result.data);
      setActiveSection("resume");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { key: "resume", label: "Resume", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg> },
    { key: "tendances", label: "Tendances locales", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg> },
    { key: "marche", label: "Marche emploi", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg> },
    { key: "profils", label: "Profils penuriques", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg> },
    { key: "reglementation", label: "Reglementation", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg> },
    { key: "linkedin", label: "Idees LinkedIn", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg> },
    { key: "chiffres", label: "Chiffres cles", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg> },
  ];

  return (
    <ModuleLayout
      title="Veille Tendances"
      subtitle="Rapport IA sur le marché du recrutement à Laval, Mayenne et Pays de la Loire."
      badge={true}
      icon="trending"
    >
      <div className="max-w-6xl mx-auto px-6 pt-6 pb-2">
        <div className="bg-white rounded-2xl p-5 flex flex-col sm:flex-row gap-3" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <input
              type="text"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="Focus optionnel (ex: profils IT, industrie agroalimentaire...)"
              className="flex-1 border border-[#e8e2d8] rounded-xl px-4 py-3 text-sm text-[#081F34] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B5E467] bg-white"
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-[#B5E467] text-[#081F34] px-7 py-3 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-[#B5E467]/30 transition-all disabled:opacity-40 flex items-center gap-2 shrink-0"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-[#081F34] border-t-transparent rounded-full" />
                  Generation... (30-60s)
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" /></svg>
                  Generer la veille
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {data ? (
          <>
            {/* Section tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {sections.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                    activeSection === s.key
                      ? "bg-[#081F34] text-white shadow-lg shadow-[#081F34]/20"
                      : "bg-white text-[#081F34] hover:bg-[#e8e2d8]"
                  }`}
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </div>

            {/* Resume */}
            {activeSection === "resume" && (
              <div className="bg-[#034B5C] rounded-2xl p-8 text-white" style={{ boxShadow: "var(--shadow-card)" }}>
                <h3 className="text-lg font-bold text-[#B5E467] mb-3">Resume executif</h3>
                <p className="text-white/90 leading-relaxed text-base">{data.resume_executif}</p>
                <p className="text-white/40 text-xs mt-4">Genere le {data.date}</p>
              </div>
            )}

            {/* Tendances locales */}
            {activeSection === "tendances" && (
              <div className="space-y-4">
                {data.tendances_locales.map((t, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-bold text-[#081F34] text-base">{t.titre}</h4>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold shrink-0 ${impactColors[t.impact] || "bg-gray-100 text-gray-600"}`}>
                        Impact {t.impact}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">{t.description}</p>
                    <div className="bg-[#e8f5d0] rounded-xl p-3 flex items-start gap-2">
                      <svg className="w-4 h-4 text-[#3d6b0f] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>
                      <span className="text-sm text-[#3d6b0f] font-medium">{t.action_prodige}</span>
                    </div>
                    <SourceLink url={t.url} label={t.source || "Vérifier la source"} />
                  </div>
                ))}
              </div>
            )}

            {/* Marche emploi */}
            {activeSection === "marche" && (
              <div className="space-y-4">
                {[
                  { titre: "Mayenne (53)", content: data.marche_emploi.mayenne, color: "bg-[#034B5C]", textColor: "text-white", accent: "text-[#B5E467]" },
                  { titre: "Pays de la Loire", content: data.marche_emploi.pays_de_la_loire, color: "bg-white", textColor: "text-[#081F34]", accent: "text-[#034B5C]" },
                  { titre: "National", content: data.marche_emploi.national, color: "bg-white", textColor: "text-[#081F34]", accent: "text-[#034B5C]" },
                ].map((m) => (
                  <div key={m.titre} className={`${m.color} rounded-2xl p-6`} style={{ boxShadow: "var(--shadow-card)" }}>
                    <h4 className={`font-bold ${m.accent} text-sm uppercase tracking-wider mb-2`}>{m.titre}</h4>
                    <p className={`${m.textColor} ${m.color === "bg-[#034B5C]" ? "text-white/90" : ""} text-sm leading-relaxed`}>{m.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Profils penuriques */}
            {activeSection === "profils" && (
              <div className="grid md:grid-cols-2 gap-4">
                {data.profils_penuriques.map((p, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-[#081F34]">{p.profil}</h4>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold shrink-0 ${impactColors[p.tension] || "bg-gray-100 text-gray-600"}`}>
                        {p.tension}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-medium mb-2">{p.secteur}</p>
                    <p className="text-sm text-gray-600">{p.conseil}</p>
                    <SourceLink url={p.url} label={p.source || "Vérifier la source"} />
                  </div>
                ))}
              </div>
            )}

            {/* Reglementation */}
            {activeSection === "reglementation" && (
              <div className="space-y-4">
                {data.reglementation.map((r, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-bold text-[#081F34]">{r.titre}</h4>
                      {r.date_effet && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#034B5C]/10 text-[#034B5C] font-bold shrink-0">
                          {r.date_effet}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{r.description}</p>
                    <div className="bg-[#faf8f5] rounded-xl p-3 border border-[#e8e2d8]">
                      <p className="text-sm text-[#081F34] font-medium">{r.impact_recrutement}</p>
                    </div>
                    <SourceLink url={r.url} label="Source officielle" />
                  </div>
                ))}
              </div>
            )}

            {/* Idees LinkedIn */}
            {activeSection === "linkedin" && (
              <div className="space-y-4">
                {data.idees_linkedin.map((idea, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                    <h4 className="font-bold text-[#081F34] mb-1">{idea.sujet}</h4>
                    <p className="text-sm text-gray-500 mb-3">{idea.angle}</p>
                    <div className="bg-[#081F34] rounded-xl p-4">
                      <p className="text-[#B5E467] text-sm italic leading-relaxed">&quot;{idea.accroche}&quot;</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Chiffres cles */}
            {activeSection === "chiffres" && (
              <div className="grid md:grid-cols-2 gap-4">
                {data.chiffres_cles.map((c, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
                    <p className="text-2xl font-extrabold text-[#034B5C] mb-1">{c.chiffre}</p>
                    <p className="text-sm text-gray-600 mb-2">{c.commentaire}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400 font-medium">Source : {c.source}</p>
                      <SourceLink url={c.url} label="Vérifier" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : !loading ? (
          <div className="bg-white rounded-2xl p-14 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="w-20 h-20 rounded-2xl bg-[#034B5C] text-[#B5E467] flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#081F34] mb-2">
              Generez votre <span className="text-[#034B5C]">veille tendances</span>
            </h2>
            <p className="text-gray-500 mb-6 max-w-lg mx-auto">
              L'IA analyse le marche du recrutement sur Laval, la Mayenne et les Pays de la Loire. Vous recevrez un rapport complet avec tendances, profils penuriques, reglementation et idees de posts LinkedIn.
            </p>
            <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
              {[
                { icon: "tendances", label: "Tendances locales", desc: "Analyse du tissu economique et des evolutions" },
                { icon: "profils", label: "Profils penuriques", desc: "Les metiers en tension sur votre bassin" },
                { icon: "linkedin", label: "Idees LinkedIn", desc: "3 sujets de posts prets a publier" },
              ].map((f) => (
                <div key={f.label} className="bg-[#faf8f5] rounded-xl p-4 border border-[#e8e2d8]">
                  <p className="font-bold text-[#081F34] text-sm mb-1">{f.label}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </ModuleLayout>
  );
}

"use client";

import { useState, useEffect } from "react";
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

interface ArticleSEO {
  title: string;
  meta_description: string;
  slug: string;
  h1: string;
  mots_cles_principaux: string[];
  mots_cles_secondaires: string[];
}

interface ArticleSection {
  h2: string;
  contenu: string;
  h3s?: { h3: string; contenu: string }[];
}

interface ArticleData {
  seo: ArticleSEO;
  article: {
    introduction: string;
    sections: ArticleSection[];
    conclusion: string;
    cta: string;
  };
  faq: { question: string; reponse: string }[];
  geo_optimisation: {
    entites_cles: string[];
    statistiques_citables: string[];
    schema_recommande: string;
    conseils_geo: string[];
  };
  checklist_seo: {
    longueur_estimee: string;
    densite_kw_principal: string;
    maillage_interne: string[];
    points_forts: string[];
    points_amelioration: string[];
  };
}

function CopyButton({ text, label = "Copier" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all"
      style={{
        background: copied ? "rgba(181,228,103,0.15)" : "rgba(8,31,52,0.06)",
        color: copied ? "#3d6b0f" : "#034B5C",
        border: `1px solid ${copied ? "rgba(181,228,103,0.3)" : "rgba(3,75,92,0.15)"}`,
      }}
    >
      {copied ? (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
        </svg>
      )}
      {copied ? "Copié !" : label}
    </button>
  );
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

// How old a cache is considered "fresh" (7 days in ms)
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function formatCacheDate(createdAt: string): string {
  const date = new Date(createdAt);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }) + " à " + date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isCacheFresh(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < CACHE_TTL_MS;
}

export default function VeillePage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VeilleData | null>(null);
  const [error, setError] = useState("");
  const [focus, setFocus] = useState("");
  const [activeSection, setActiveSection] = useState("resume");
  const [cacheInfo, setCacheInfo] = useState<{ createdAt: string; focus: string | null } | null>(null);
  const [loadingCache, setLoadingCache] = useState(true);

  // Article state
  const [articleData, setArticleData] = useState<ArticleData | null>(null);
  const [articleLoading, setArticleLoading] = useState(false);
  const [articleError, setArticleError] = useState("");
  const [articleSujet, setArticleSujet] = useState("");
  const [articleAngle, setArticleAngle] = useState("");
  const [articleMots, setArticleMots] = useState("");
  const [articleAutoPropose, setArticleAutoPropose] = useState<string | null>(null);
  const [articleProposeLoading, setArticleProposeLoading] = useState(false);
  const [articleJustification, setArticleJustification] = useState<string | null>(null);

  // Load cache on mount
  useEffect(() => {
    const loadCache = async () => {
      try {
        const res = await fetch("/api/db/veille-cache");
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.created_at) {
            setData(json.data);
            setCacheInfo({ createdAt: json.created_at, focus: json.focus });
            setActiveSection("resume");
          }
        }
      } catch {
        // Cache not available, that's fine
      } finally {
        setLoadingCache(false);
      }
    };
    loadCache();
  }, []);

  const handleGenerate = async (force = false) => {
    setLoading(true);
    setError("");
    if (force) {
      setData(null);
      setCacheInfo(null);
    }
    try {
      const response = await fetch("/api/veille", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focus }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setData(result.data);
      setCacheInfo(null); // Fresh data, no cache badge
      setActiveSection("resume");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  // Auto-propose article fields via IA when switching to "article" tab
  useEffect(() => {
    if (activeSection !== "article" || !data || articleSujet) return;

    const propose = async () => {
      setArticleProposeLoading(true);
      try {
        const res = await fetch("/api/article-propose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ veille: data }),
        });
        if (!res.ok) throw new Error();
        const suggestion = await res.json();
        if (suggestion.sujet) {
          setArticleSujet(suggestion.sujet);
          setArticleAngle(suggestion.angle ?? "");
          setArticleMots(suggestion.mots_cles ?? "");
          setArticleJustification(suggestion.justification ?? null);
          setArticleAutoPropose(data.date);
        }
      } catch {
        // Fallback silencieux — l'utilisateur peut remplir manuellement
      } finally {
        setArticleProposeLoading(false);
      }
    };

    propose();
  }, [activeSection, data, articleSujet]);

  const handleGenerateArticle = async () => {
    setArticleLoading(true);
    setArticleError("");
    try {
      // Passe un résumé de la veille comme contexte si disponible
      const contexte_veille = data
        ? `${data.resume_executif}\n\nTendances : ${data.tendances_locales.map((t) => t.titre).join(", ")}`
        : undefined;
      const res = await fetch("/api/article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sujet: articleSujet,
          angle: articleAngle || undefined,
          mots_cles: articleMots || undefined,
          contexte_veille,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setArticleData(result.data);
    } catch (err) {
      setArticleError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setArticleLoading(false);
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
    { key: "article", label: "Article web", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg> },
  ];

  const isFromCache = !!cacheInfo;
  const cacheIsFresh = cacheInfo ? isCacheFresh(cacheInfo.createdAt) : false;

  return (
    <ModuleLayout
      title="Veille Tendances"
      subtitle="Rapport IA sur le marché du recrutement à Laval, Mayenne et Pays de la Loire."
      badge={true}
      icon="trending"
    >
      <div className="max-w-6xl mx-auto px-6 pt-6 pb-2">
        <div className="bg-white rounded-2xl p-5 flex flex-col gap-3" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="Focus optionnel (ex: profils IT, industrie agroalimentaire...)"
              className="flex-1 border border-[#e8e2d8] rounded-xl px-4 py-3 text-sm text-[#081F34] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B5E467] bg-white"
            />
            <button
              onClick={() => handleGenerate(false)}
              disabled={loading || loadingCache}
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

          {/* Cache status bar */}
          {!loading && (isFromCache || (!data && loadingCache)) && (
            <div className="flex items-center justify-between flex-wrap gap-2">
              {isFromCache && (
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
                    cacheIsFresh
                      ? "bg-[#e8f5d0] text-[#3d6b0f]"
                      : "bg-orange-100 text-orange-700"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cacheIsFresh ? "bg-[#3d6b0f]" : "bg-orange-500"}`} />
                    {cacheIsFresh
                      ? `Veille en cache — ${formatCacheDate(cacheInfo!.createdAt)}`
                      : `Cache expiré — ${formatCacheDate(cacheInfo!.createdAt)}`}
                  </span>
                  {cacheInfo?.focus && (
                    <span className="text-xs text-gray-400">Focus : {cacheInfo.focus}</span>
                  )}
                </div>
              )}
              {isFromCache && (
                <button
                  onClick={() => handleGenerate(true)}
                  disabled={loading}
                  className="text-xs text-[#034B5C] hover:text-[#081F34] font-medium flex items-center gap-1 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Forcer une nouvelle veille
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">
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
                <div className="flex items-center gap-3 mt-4">
                  <p className="text-white/40 text-xs">Genere le {data.date}</p>
                  {isFromCache && (
                    <span className="text-white/30 text-xs">• depuis le cache</span>
                  )}
                </div>
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

            {/* Article web */}
            {activeSection === "article" && (
              <div className="space-y-6">
                {/* Formulaire */}
                <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-[#034B5C] flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#B5E467]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#081F34] text-sm">Génération d&apos;article web</h3>
                      <p className="text-xs text-gray-400">Optimisé SEO + GEO (ChatGPT, Perplexity, Google AI)</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Sujet / Titre indicatif *</label>
                      <input
                        type="text"
                        value={articleSujet}
                        onChange={(e) => setArticleSujet(e.target.value)}
                        placeholder="Ex: Comment recruter un directeur commercial en Mayenne ?"
                        className="w-full border border-[#e8e2d8] rounded-xl px-4 py-2.5 text-sm text-[#081F34] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B5E467] bg-white"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Angle éditorial</label>
                        <input
                          type="text"
                          value={articleAngle}
                          onChange={(e) => setArticleAngle(e.target.value)}
                          placeholder="Ex: Conseils pratiques pour DRH"
                          className="w-full border border-[#e8e2d8] rounded-xl px-4 py-2.5 text-sm text-[#081F34] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B5E467] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Mots-clés cibles</label>
                        <input
                          type="text"
                          value={articleMots}
                          onChange={(e) => setArticleMots(e.target.value)}
                          placeholder="Ex: recrutement Laval, cabinet RH 53"
                          className="w-full border border-[#e8e2d8] rounded-xl px-4 py-2.5 text-sm text-[#081F34] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B5E467] bg-white"
                        />
                      </div>
                    </div>
                    {/* Proposition IA en cours */}
                    {articleProposeLoading && (
                      <div className="flex items-center gap-2.5 bg-[#034B5C]/5 rounded-xl px-3 py-2.5">
                        <span className="animate-spin w-3.5 h-3.5 border-2 border-[#034B5C] border-t-transparent rounded-full flex-shrink-0" />
                        <p className="text-xs text-[#034B5C]">L&apos;IA analyse la veille pour proposer le meilleur sujet...</p>
                      </div>
                    )}

                    {/* Proposition IA reçue */}
                    {articleAutoPropose && !articleProposeLoading && (
                      <div className="flex items-start gap-2 bg-[#B5E467]/10 border border-[#B5E467]/30 rounded-xl px-3 py-2.5">
                        <svg className="w-3.5 h-3.5 text-[#3d6b0f] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#3d6b0f]">
                            Proposition IA — veille du {articleAutoPropose}
                          </p>
                          {articleJustification && (
                            <p className="text-[11px] text-[#3d6b0f]/80 mt-0.5 leading-relaxed">{articleJustification}</p>
                          )}
                          <p className="text-[11px] text-[#3d6b0f]/50 mt-1">Modifiez les champs à votre guise avant de générer.</p>
                        </div>
                        <button
                          onClick={() => { setArticleSujet(""); setArticleAngle(""); setArticleMots(""); setArticleAutoPropose(null); setArticleJustification(null); }}
                          className="text-[#3d6b0f]/40 hover:text-[#3d6b0f] transition-colors text-[10px] flex-shrink-0 mt-0.5"
                        >
                          Effacer
                        </button>
                      </div>
                    )}

                    {/* Pas encore de proposition */}
                    {data && !articleAutoPropose && !articleProposeLoading && (
                      <p className="text-xs text-[#034B5C] bg-[#034B5C]/5 rounded-lg px-3 py-2">
                        ✓ Le contexte de la veille du {data.date} sera injecté dans l&apos;article.
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={handleGenerateArticle}
                      disabled={articleLoading || !articleSujet.trim()}
                      className="bg-[#B5E467] text-[#081F34] px-6 py-2.5 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-[#B5E467]/30 transition-all disabled:opacity-40 flex items-center gap-2"
                    >
                      {articleLoading ? (
                        <><span className="animate-spin w-4 h-4 border-2 border-[#081F34] border-t-transparent rounded-full inline-block" />Génération...</>
                      ) : (
                        <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg>Générer l&apos;article</>
                      )}
                    </button>
                    {articleData && (
                      <button onClick={() => setArticleData(null)} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                        Réinitialiser
                      </button>
                    )}
                  </div>
                  {articleError && <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-xl p-3">{articleError}</p>}
                </div>

                {/* Résultat */}
                {articleData && (
                  <>
                    {/* SEO Metadata */}
                    <div className="bg-[#034B5C] rounded-2xl p-6 text-white" style={{ boxShadow: "var(--shadow-card)" }}>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-[#B5E467] text-sm uppercase tracking-wide">Métadonnées SEO</h4>
                        <CopyButton
                          label="Tout copier"
                          text={`Title: ${articleData.seo.title}\nMeta: ${articleData.seo.meta_description}\nSlug: /${articleData.seo.slug}\nH1: ${articleData.seo.h1}`}
                        />
                      </div>
                      <div className="space-y-3">
                        {[
                          { label: "Title", value: articleData.seo.title, hint: `${articleData.seo.title.length} car.` },
                          { label: "Meta description", value: articleData.seo.meta_description, hint: `${articleData.seo.meta_description.length} car.` },
                          { label: "Slug URL", value: `/${articleData.seo.slug}`, hint: "" },
                          { label: "H1", value: articleData.seo.h1, hint: "" },
                        ].map((field) => (
                          <div key={field.label} className="bg-white/5 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider">{field.label}</span>
                              <div className="flex items-center gap-2">
                                {field.hint && <span className="text-white/30 text-[10px]">{field.hint}</span>}
                                <CopyButton text={field.value} />
                              </div>
                            </div>
                            <p className="text-white/90 text-sm">{field.value}</p>
                          </div>
                        ))}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {articleData.seo.mots_cles_principaux.map((kw, i) => (
                            <span key={i} className="text-xs px-2.5 py-0.5 rounded-full bg-[#B5E467]/15 text-[#B5E467] font-medium">{kw}</span>
                          ))}
                          {articleData.seo.mots_cles_secondaires.map((kw, i) => (
                            <span key={i} className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white/50">{kw}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Corps de l'article */}
                    <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                      <div className="flex items-center justify-between mb-5">
                        <h4 className="font-bold text-[#081F34]">Corps de l&apos;article</h4>
                        <CopyButton
                          label="Copier tout"
                          text={[
                            `# ${articleData.seo.h1}\n`,
                            articleData.article.introduction,
                            ...articleData.article.sections.flatMap((s) => [
                              `\n## ${s.h2}\n`,
                              s.contenu,
                              ...(s.h3s?.flatMap((h) => [`\n### ${h.h3}\n`, h.contenu]) ?? []),
                            ]),
                            `\n## Conclusion\n`,
                            articleData.article.conclusion,
                            `\n> ${articleData.article.cta}`,
                          ].join("\n")}
                        />
                      </div>
                      <div className="space-y-5">
                        {/* Intro */}
                        <div className="border-l-4 border-[#B5E467] pl-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Introduction</span>
                            <CopyButton text={articleData.article.introduction} />
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{articleData.article.introduction}</p>
                        </div>
                        {/* Sections */}
                        {articleData.article.sections.map((section, i) => (
                          <div key={i} className="border border-[#e8e2d8] rounded-xl p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h5 className="font-bold text-[#034B5C] text-base">{section.h2}</h5>
                              <CopyButton text={`## ${section.h2}\n\n${section.contenu}${section.h3s ? "\n" + section.h3s.map((h) => `\n### ${h.h3}\n\n${h.contenu}`).join("") : ""}`} />
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed mb-3">{section.contenu}</p>
                            {section.h3s?.map((h3, j) => (
                              <div key={j} className="ml-4 mt-3 border-l-2 border-[#e8e2d8] pl-3">
                                <h6 className="font-semibold text-[#081F34] text-sm mb-1">{h3.h3}</h6>
                                <p className="text-sm text-gray-600 leading-relaxed">{h3.contenu}</p>
                              </div>
                            ))}
                          </div>
                        ))}
                        {/* Conclusion */}
                        <div className="bg-[#faf8f5] rounded-xl p-4 border border-[#e8e2d8]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Conclusion</span>
                            <CopyButton text={articleData.article.conclusion} />
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{articleData.article.conclusion}</p>
                          <p className="text-sm font-semibold text-[#034B5C] mt-3 pt-3 border-t border-[#e8e2d8]">{articleData.article.cta}</p>
                        </div>
                      </div>
                    </div>

                    {/* FAQ */}
                    <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-[#081F34]">FAQ — Schema FAQPage</h4>
                          <p className="text-xs text-gray-400 mt-0.5">Optimisé pour être cité par les IA génératives</p>
                        </div>
                        <CopyButton
                          label="Copier FAQ"
                          text={articleData.faq.map((f) => `Q: ${f.question}\nR: ${f.reponse}`).join("\n\n")}
                        />
                      </div>
                      <div className="space-y-3">
                        {articleData.faq.map((faq, i) => (
                          <div key={i} className="border border-[#e8e2d8] rounded-xl p-4">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="font-semibold text-[#081F34] text-sm">{faq.question}</p>
                              <CopyButton text={`Q: ${faq.question}\nR: ${faq.reponse}`} />
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">{faq.reponse}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* GEO + SEO Checklist */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* GEO */}
                      <div className="bg-[#081F34] rounded-2xl p-5 text-white" style={{ boxShadow: "var(--shadow-card)" }}>
                        <h4 className="font-bold text-[#B5E467] text-sm uppercase tracking-wide mb-4">GEO — Optimisation IA</h4>
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-white/40 text-[10px] uppercase tracking-wide mb-1">Schéma recommandé</p>
                            <p className="text-white/80">{articleData.geo_optimisation.schema_recommande}</p>
                          </div>
                          <div>
                            <p className="text-white/40 text-[10px] uppercase tracking-wide mb-1.5">Entités clés</p>
                            <div className="flex flex-wrap gap-1">
                              {articleData.geo_optimisation.entites_cles.map((e, i) => (
                                <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">{e}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-white/40 text-[10px] uppercase tracking-wide mb-1">Conseils GEO</p>
                            <ul className="space-y-1">
                              {articleData.geo_optimisation.conseils_geo.map((c, i) => (
                                <li key={i} className="text-white/60 text-xs flex gap-1.5">
                                  <span className="text-[#B5E467] mt-0.5 flex-shrink-0">▸</span>{c}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      {/* SEO Checklist */}
                      <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
                        <h4 className="font-bold text-[#081F34] text-sm uppercase tracking-wide mb-4">Checklist SEO</h4>
                        <div className="space-y-2.5 text-sm">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Longueur estimée</span>
                            <span className="font-semibold text-[#081F34]">{articleData.checklist_seo.longueur_estimee}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Densité KW</span>
                            <span className="font-semibold text-[#081F34]">{articleData.checklist_seo.densite_kw_principal}</span>
                          </div>
                          <div className="pt-2 border-t border-[#e8e2d8]">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Points forts</p>
                            {articleData.checklist_seo.points_forts.map((p, i) => (
                              <p key={i} className="text-xs text-[#3d6b0f] flex gap-1.5 mb-0.5"><span>✓</span>{p}</p>
                            ))}
                          </div>
                          <div className="pt-2 border-t border-[#e8e2d8]">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">À améliorer</p>
                            {articleData.checklist_seo.points_amelioration.map((p, i) => (
                              <p key={i} className="text-xs text-orange-600 flex gap-1.5 mb-0.5"><span>⚡</span>{p}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        ) : !loading && !loadingCache ? (
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
              L&apos;IA analyse le marche du recrutement sur Laval, la Mayenne et les Pays de la Loire avec des sources de moins de 30 jours. Vous recevrez un rapport complet avec tendances, profils penuriques, reglementation et idees de posts LinkedIn.
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
        ) : loadingCache ? (
          <div className="flex items-center justify-center py-20">
            <span className="animate-spin w-6 h-6 border-2 border-[#034B5C] border-t-transparent rounded-full" />
          </div>
        ) : null}
      </div>
    </ModuleLayout>
  );
}

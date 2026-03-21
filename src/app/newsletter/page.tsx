"use client";

import { useState, useEffect } from "react";
import ModuleLayout from "@/components/ModuleLayout";

interface NewsletterProfile {
  profil: string;
  secteur: string;
  conseil: string;
}

interface NewsletterData {
  sujet: string;
  preheader: string;
  mois_annee: string;
  edito: string;
  marche_local: { titre: string; contenu: string };
  tendance_cle: { titre: string; contenu: string; action_drh: string };
  profils_en_tension: NewsletterProfile[];
  activite_prodige: { accroche: string; point_fort: string };
  conseil_rh: { titre: string; contenu: string; cta: string };
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

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function buildTextVersion(data: NewsletterData): string {
  return [
    `NEWSLETTER PRODIGE RH — ${data.mois_annee}`,
    ``,
    `ÉDITO`,
    data.edito,
    ``,
    data.marche_local.titre.toUpperCase(),
    data.marche_local.contenu,
    ``,
    data.tendance_cle.titre.toUpperCase(),
    data.tendance_cle.contenu,
    `→ Conseil DRH : ${data.tendance_cle.action_drh}`,
    ``,
    `PROFILS EN TENSION CE MOIS-CI`,
    ...data.profils_en_tension.map((p) => `• ${p.profil} (${p.secteur}) — ${p.conseil}`),
    ``,
    `PRODIGE RH EN ACTION`,
    data.activite_prodige.accroche,
    data.activite_prodige.point_fort,
    ``,
    data.conseil_rh.titre.toUpperCase(),
    data.conseil_rh.contenu,
    ``,
    data.conseil_rh.cta,
    ``,
    `---`,
    `Prodige RH · Positiv' Recrutement · Laval (53)`,
    `www.prodige-rh.fr`,
  ].join("\n");
}

export default function NewsletterPage() {
  const now = new Date();
  const [mois, setMois] = useState(now.getMonth() + 1);
  const [annee, setAnnee] = useState(now.getFullYear());
  const [ton, setTon] = useState("informatif");
  const [messageDelphine, setMessageDelphine] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<NewsletterData | null>(null);
  const [sources, setSources] = useState<{ hasSnapshot: boolean; hasVeille: boolean } | null>(null);

  // Check available data sources on mount
  useEffect(() => {
    const checkSources = async () => {
      try {
        const [snapRes, veilleRes] = await Promise.all([
          fetch(`/api/db/snapshot?year=${now.getFullYear()}`),
          fetch("/api/db/veille-cache"),
        ]);
        const hasSnapshot = snapRes.ok && (await snapRes.json()).snapshot != null;
        const veilleJson = veilleRes.ok ? await veilleRes.json() : null;
        const hasVeille = !!(veilleJson?.data);
        setSources({ hasSnapshot, hasVeille });
      } catch {
        setSources({ hasSnapshot: false, hasVeille: false });
      }
    };
    checkSources();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mois, annee, ton, message_delphine: messageDelphine || undefined }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setData(result.data);
      setSources(result.sources);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <ModuleLayout
      title="Newsletter RH"
      subtitle="Lettre mensuelle pour vos clients DRH et dirigeants, enrichie par la veille et vos données activité."
      badge={true}
      icon="envelope"
    >
      <div className="max-w-5xl mx-auto px-6 pt-6 pb-2">
        {/* Sources status */}
        {sources && (
          <div className="flex flex-wrap gap-2 mb-4">
            <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${sources.hasSnapshot ? "bg-[#e8f5d0] text-[#3d6b0f]" : "bg-orange-50 text-orange-600"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sources.hasSnapshot ? "bg-[#3d6b0f]" : "bg-orange-400"}`} />
              {sources.hasSnapshot ? "Tableau de bord connecté" : "Tableau de bord : non chargé"}
            </div>
            <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${sources.hasVeille ? "bg-[#e8f5d0] text-[#3d6b0f]" : "bg-orange-50 text-orange-600"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sources.hasVeille ? "bg-[#3d6b0f]" : "bg-orange-400"}`} />
              {sources.hasVeille ? "Veille RH disponible" : "Veille RH : non générée"}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl p-6 mb-6" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            {/* Mois */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Mois de la newsletter</label>
              <select
                value={mois}
                onChange={(e) => setMois(Number(e.target.value))}
                className="w-full border border-[#e8e2d8] rounded-xl px-4 py-2.5 text-sm text-[#081F34] focus:outline-none focus:ring-2 focus:ring-[#B5E467] bg-white"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            {/* Année */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Année</label>
              <select
                value={annee}
                onChange={(e) => setAnnee(Number(e.target.value))}
                className="w-full border border-[#e8e2d8] rounded-xl px-4 py-2.5 text-sm text-[#081F34] focus:outline-none focus:ring-2 focus:ring-[#B5E467] bg-white"
              >
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            {/* Ton */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Ton éditorial</label>
              <select
                value={ton}
                onChange={(e) => setTon(e.target.value)}
                className="w-full border border-[#e8e2d8] rounded-xl px-4 py-2.5 text-sm text-[#081F34] focus:outline-none focus:ring-2 focus:ring-[#B5E467] bg-white"
              >
                <option value="informatif">Informatif &amp; actionnable</option>
                <option value="chaleureux">Chaleureux &amp; bienveillant</option>
                <option value="expert">Expert &amp; analytique</option>
              </select>
            </div>
          </div>

          {/* Message Delphine */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Message de Delphine <span className="font-normal text-gray-300 normal-case">(optionnel — intégré dans l&apos;édito)</span>
            </label>
            <textarea
              value={messageDelphine}
              onChange={(e) => setMessageDelphine(e.target.value)}
              rows={2}
              placeholder="Ex : Ce mois-ci j'ai eu de beaux échanges sur la rétention des talents en PME. Je voudrais partager..."
              className="w-full border border-[#e8e2d8] rounded-xl px-4 py-2.5 text-sm text-[#081F34] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B5E467] bg-white resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-[#B5E467] text-[#081F34] px-7 py-3 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-[#B5E467]/30 transition-all disabled:opacity-40 flex items-center gap-2"
            >
              {loading ? (
                <><span className="animate-spin w-4 h-4 border-2 border-[#081F34] border-t-transparent rounded-full inline-block" />Génération...</>
              ) : (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg>Générer la newsletter {MONTHS[mois - 1]} {annee}</>
              )}
            </button>
            {data && (
              <button onClick={() => setData(null)} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                Réinitialiser
              </button>
            )}
          </div>

          {error && <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>}
        </div>
      </div>

      {/* Result */}
      {data && (
        <div className="max-w-5xl mx-auto px-6 pb-10 space-y-5">
          {/* Subject + preheader */}
          <div className="bg-[#034B5C] rounded-2xl p-6 text-white" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.1)" }}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-[#B5E467] text-sm uppercase tracking-wide">Email — Objet &amp; Prévisualisation</h4>
              <CopyButton text={`Objet : ${data.sujet}\nPréview : ${data.preheader}`} label="Copier" />
            </div>
            <div className="space-y-3">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Objet</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/30 text-[10px]">{data.sujet.length} car.</span>
                    <CopyButton text={data.sujet} />
                  </div>
                </div>
                <p className="text-white font-semibold text-sm">{data.sujet}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Texte prévisualisation</span>
                  <CopyButton text={data.preheader} />
                </div>
                <p className="text-white/70 text-sm italic">{data.preheader}</p>
              </div>
            </div>
          </div>

          {/* Newsletter preview */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.08)" }}>
            {/* Preview header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8e2d8]">
              <div>
                <h4 className="font-bold text-[#081F34] text-sm">Aperçu newsletter</h4>
                <p className="text-xs text-gray-400">{data.mois_annee}</p>
              </div>
              <CopyButton text={buildTextVersion(data)} label="Copier version texte" />
            </div>

            {/* Newsletter brand header */}
            <div className="bg-[#081F34] px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#B5E467] flex items-center justify-center">
                  <span className="text-[#081F34] font-black text-sm">P</span>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Prodige RH</p>
                  <p className="text-white/40 text-xs">La Lettre RH · {data.mois_annee}</p>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 space-y-7">
              {/* Édito */}
              <div className="border-l-4 border-[#B5E467] pl-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#034B5C] flex items-center justify-center">
                      <span className="text-[#B5E467] text-[10px] font-bold">D</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Édito de Delphine</span>
                  </div>
                  <CopyButton text={data.edito} />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{data.edito}</p>
              </div>

              {/* Marché local */}
              <NewsletterSection
                title={data.marche_local.titre}
                content={data.marche_local.contenu}
                accent="bg-[#034B5C]"
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>}
              />

              {/* Tendance clé */}
              <div className="bg-[#faf8f5] rounded-2xl p-5 border border-[#e8e2d8]">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#081F34] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-[#B5E467]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg>
                    </div>
                    <h3 className="font-bold text-[#081F34] text-base leading-snug">{data.tendance_cle.titre}</h3>
                  </div>
                  <CopyButton text={`${data.tendance_cle.titre}\n\n${data.tendance_cle.contenu}\n\nConseil DRH : ${data.tendance_cle.action_drh}`} />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">{data.tendance_cle.contenu}</p>
                <div className="bg-[#B5E467]/15 border border-[#B5E467]/30 rounded-xl p-3 flex items-start gap-2">
                  <svg className="w-3.5 h-3.5 text-[#3d6b0f] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>
                  <p className="text-xs text-[#3d6b0f] font-medium">{data.tendance_cle.action_drh}</p>
                </div>
              </div>

              {/* Profils en tension */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-[#034B5C]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>
                  <h3 className="font-bold text-[#081F34] text-sm">Profils en tension ce mois-ci</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {data.profils_en_tension.map((p, i) => (
                    <div key={i} className="bg-white border border-[#e8e2d8] rounded-xl p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-bold text-[#081F34] text-sm">{p.profil}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold shrink-0">En tension</span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium mb-2">{p.secteur}</p>
                      <p className="text-xs text-gray-600">{p.conseil}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activité Prodige */}
              <div className="bg-[#034B5C] rounded-2xl p-5 text-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-[#B5E467] text-sm uppercase tracking-wide">Prodige RH en action</h3>
                  <CopyButton text={`${data.activite_prodige.accroche}\n${data.activite_prodige.point_fort}`} />
                </div>
                <p className="text-white/90 text-sm leading-relaxed mb-2">{data.activite_prodige.accroche}</p>
                <p className="text-white/60 text-sm italic">{data.activite_prodige.point_fort}</p>
              </div>

              {/* Conseil RH */}
              <div className="bg-[#081F34] rounded-2xl p-5 text-white">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-bold text-[#B5E467] text-base">{data.conseil_rh.titre}</h3>
                  <CopyButton text={`${data.conseil_rh.titre}\n\n${data.conseil_rh.contenu}\n\n${data.conseil_rh.cta}`} />
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-4">{data.conseil_rh.contenu}</p>
                <div className="border-t border-white/10 pt-3">
                  <p className="text-[#B5E467] text-sm font-semibold">{data.conseil_rh.cta}</p>
                </div>
              </div>

              {/* Footer newsletter */}
              <div className="border-t border-[#e8e2d8] pt-5 text-center">
                <p className="text-xs text-gray-400">
                  <span className="font-semibold text-[#034B5C]">Prodige RH</span> · Positiv&apos; Recrutement · Laval (53)<br />
                  <a href="https://www.prodige-rh.fr" target="_blank" rel="noopener noreferrer" className="hover:underline">www.prodige-rh.fr</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!data && !loading && (
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <div className="bg-white rounded-2xl p-12 text-center" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
            <div className="w-20 h-20 rounded-2xl bg-[#034B5C] text-[#B5E467] flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#081F34] mb-2">
              Votre newsletter RH mensuelle
            </h2>
            <p className="text-gray-500 mb-6 max-w-lg mx-auto text-sm">
              L&apos;IA croise vos données clients (tableau de bord) et la veille RH locale pour générer une newsletter personnalisée prête à envoyer à vos contacts DRH et dirigeants.
            </p>
            <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
              {[
                { label: "Édito de Delphine", desc: "Mot personnalisé ancré dans l'actualité du mois" },
                { label: "Marché emploi local", desc: "Données Mayenne et Pays de la Loire depuis la veille" },
                { label: "Conseil RH du mois", desc: "Actionnable pour vos clients DRH et dirigeants" },
              ].map((f) => (
                <div key={f.label} className="bg-[#faf8f5] rounded-xl p-4 border border-[#e8e2d8]">
                  <p className="font-bold text-[#081F34] text-sm mb-1">{f.label}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ModuleLayout>
  );
}

function NewsletterSection({
  title, content, accent, icon
}: {
  title: string;
  content: string;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg ${accent} flex items-center justify-center flex-shrink-0 text-[#B5E467]`}>
            {icon}
          </div>
          <h3 className="font-bold text-[#081F34] text-base">{title}</h3>
        </div>
        <CopyButton text={`${title}\n\n${content}`} />
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
    </div>
  );
}

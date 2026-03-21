"use client";

import { useState } from "react";
import ModuleLayout from "@/components/ModuleLayout";

interface FicheData {
  titre: string;
  accroche: string;
  entreprise: { presentation: string; chiffres: string };
  poste: { contexte: string; missions: string[]; environnement: string };
  profil: { formation: string; experience: string; competences: string[]; qualites: string[] };
  conditions: { contrat: string; lieu: string; remuneration: string; avantages: string[] };
  call_to_action: string;
}

const inputClass = "w-full border border-[#e8e2d8] rounded-xl px-4 py-2.5 text-sm text-[#081F34] focus:outline-none focus:ring-2 focus:ring-[#B5E467] placeholder:text-gray-300 bg-white";
const textareaClass = "w-full border border-[#e8e2d8] rounded-xl px-4 py-2.5 text-sm text-[#081F34] focus:outline-none focus:ring-2 focus:ring-[#B5E467] placeholder:text-gray-300 bg-white resize-none";
const labelClass = "block text-xs font-bold text-[#081F34] mb-1.5 uppercase tracking-wide";

export default function FichePostePage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FicheData | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    poste: "", entreprise: "", secteur: "", lieu: "",
    contrat: "CDI", remuneration: "", teletravail: "",
    missions: "", profil: "", avantages: "", contexte: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleGenerate = async () => {
    if (!form.poste || !form.entreprise || !form.lieu || !form.missions || !form.profil) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/fiche-poste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const buildText = (d: FicheData) => `${d.titre}

${d.accroche}

L'ENTREPRISE
${d.entreprise.presentation}
${d.entreprise.chiffres}

LE POSTE
${d.poste.contexte}

Vos missions :
${d.poste.missions.map((m) => `• ${m}`).join("\n")}

${d.poste.environnement}

VOTRE PROFIL
Formation : ${d.profil.formation}
Expérience : ${d.profil.experience}

Compétences :
${d.profil.competences.map((c) => `• ${c}`).join("\n")}

Qualités :
${d.profil.qualites.map((q) => `• ${q}`).join("\n")}

CONDITIONS
Contrat : ${d.conditions.contrat}
Lieu : ${d.conditions.lieu}
Rémunération : ${d.conditions.remuneration}
Avantages : ${d.conditions.avantages.join(" • ")}

${d.call_to_action}`;

  const handleCopy = async () => {
    if (!data) return;
    const text = buildText(data);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ModuleLayout
      title="Fiche de Poste"
      subtitle="L'IA génère une offre d'emploi dans l'esprit Prodige RH — chaleureuse, humaine et engageante."
      badge={true}
      icon="briefcase"
    >
      <div className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-2 gap-8">
        {/* Formulaire */}
        <div className="bg-white rounded-2xl p-6 space-y-5" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
          <h3 className="font-bold text-[#081F34] text-base border-b border-[#e8e2d8] pb-3">Informations du poste</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Intitulé du poste *</label>
              <input className={inputClass} value={form.poste} onChange={set("poste")} placeholder="Ex: Responsable RH" />
            </div>
            <div>
              <label className={labelClass}>Entreprise *</label>
              <input className={inputClass} value={form.entreprise} onChange={set("entreprise")} placeholder="Nom de l'entreprise" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Secteur</label>
              <input className={inputClass} value={form.secteur} onChange={set("secteur")} placeholder="Ex: Industrie, Santé..." />
            </div>
            <div>
              <label className={labelClass}>Lieu *</label>
              <input className={inputClass} value={form.lieu} onChange={set("lieu")} placeholder="Ex: Laval (53)" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Contrat</label>
              <select className={inputClass} value={form.contrat} onChange={set("contrat")}>
                {["CDI", "CDD", "CDI Cadre", "Freelance", "Alternance", "Stage"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Rémunération</label>
              <input className={inputClass} value={form.remuneration} onChange={set("remuneration")} placeholder="Ex: 45-55K€" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Télétravail</label>
            <input className={inputClass} value={form.teletravail} onChange={set("teletravail")} placeholder="Ex: 2 jours/semaine possible" />
          </div>

          <div>
            <label className={labelClass}>Missions principales *</label>
            <textarea className={textareaClass} rows={4} value={form.missions} onChange={set("missions")}
              placeholder="Décrivez les missions clés du poste (librement, l'IA les mettra en forme)" />
          </div>

          <div>
            <label className={labelClass}>Profil recherché *</label>
            <textarea className={textareaClass} rows={3} value={form.profil} onChange={set("profil")}
              placeholder="Formation, expérience, compétences, qualités attendues..." />
          </div>

          <div>
            <label className={labelClass}>Avantages / Points forts</label>
            <textarea className={textareaClass} rows={2} value={form.avantages} onChange={set("avantages")}
              placeholder="Ex: tickets resto, mutuelle, voiture, ambiance top..." />
          </div>

          <div>
            <label className={labelClass}>Contexte / Infos complémentaires</label>
            <textarea className={textareaClass} rows={2} value={form.contexte} onChange={set("contexte")}
              placeholder="Création de poste, remplacement, contexte de croissance..." />
          </div>

          {error && <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">{error}</div>}

          <button
            onClick={handleGenerate}
            disabled={loading || !form.poste || !form.entreprise || !form.lieu || !form.missions || !form.profil}
            className="w-full bg-[#B5E467] text-[#081F34] py-3 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-[#B5E467]/30 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="animate-spin w-4 h-4 border-2 border-[#081F34] border-t-transparent rounded-full inline-block" />Génération... (15-30s)</>
            ) : (
              <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" /></svg>Générer la fiche de poste</>
            )}
          </button>
        </div>

        {/* Résultat */}
        <div>
          {data ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#081F34]">Fiche générée</h3>
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-sm font-bold text-[#034B5C] hover:text-[#081F34] transition-colors">
                  {copied ? (
                    <><svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>Copié !</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" /></svg>Copier le texte</>
                  )}
                </button>
              </div>

              {/* Titre + accroche */}
              <div className="bg-[#034B5C] text-white rounded-2xl p-6">
                <h2 className="text-xl font-extrabold text-[#B5E467] mb-2">{data.titre}</h2>
                <p className="text-white/90 text-sm leading-relaxed">{data.accroche}</p>
              </div>

              {/* Entreprise */}
              <div className="bg-white rounded-2xl p-5 space-y-2" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
                <h4 className="font-bold text-[#034B5C] text-xs uppercase tracking-wider">L'entreprise</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{data.entreprise.presentation}</p>
                {data.entreprise.chiffres && <p className="text-xs text-gray-400">{data.entreprise.chiffres}</p>}
              </div>

              {/* Poste */}
              <div className="bg-white rounded-2xl p-5 space-y-3" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
                <h4 className="font-bold text-[#034B5C] text-xs uppercase tracking-wider">Le poste</h4>
                <p className="text-sm text-gray-600">{data.poste.contexte}</p>
                <div>
                  <p className="text-xs font-bold text-[#081F34] mb-2">Vos missions :</p>
                  <ul className="space-y-1">{data.poste.missions.map((m, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-[#B5E467] font-bold mt-0.5">•</span>{m}
                    </li>
                  ))}</ul>
                </div>
                <p className="text-sm text-gray-500 italic">{data.poste.environnement}</p>
              </div>

              {/* Profil */}
              <div className="bg-white rounded-2xl p-5 space-y-3" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
                <h4 className="font-bold text-[#034B5C] text-xs uppercase tracking-wider">Votre profil</h4>
                <p className="text-sm text-gray-600"><span className="font-medium">Formation :</span> {data.profil.formation}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Expérience :</span> {data.profil.experience}</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-bold text-[#081F34] mb-1.5">Compétences</p>
                    <ul className="space-y-1">{data.profil.competences.map((c, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-1.5"><span className="text-[#034B5C] font-bold">•</span>{c}</li>
                    ))}</ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#081F34] mb-1.5">Qualités</p>
                    <ul className="space-y-1">{data.profil.qualites.map((q, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-1.5"><span className="text-[#034B5C] font-bold">•</span>{q}</li>
                    ))}</ul>
                  </div>
                </div>
              </div>

              {/* Conditions */}
              <div className="bg-white rounded-2xl p-5 space-y-2" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
                <h4 className="font-bold text-[#034B5C] text-xs uppercase tracking-wider">Conditions</h4>
                <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                  <p><span className="font-medium">Contrat :</span> {data.conditions.contrat}</p>
                  <p><span className="font-medium">Lieu :</span> {data.conditions.lieu}</p>
                  <p><span className="font-medium">Rémunération :</span> {data.conditions.remuneration}</p>
                </div>
                {data.conditions.avantages?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {data.conditions.avantages.map((a, i) => (
                      <span key={i} className="bg-[#e8f5d0] text-[#3d6b0f] text-xs px-2.5 py-0.5 rounded-full font-medium">{a}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="bg-[#081F34] rounded-2xl p-5">
                <p className="text-[#B5E467] text-sm font-medium italic leading-relaxed">{data.call_to_action}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-14 text-center h-full flex flex-col items-center justify-center" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
              <div className="w-16 h-16 rounded-2xl bg-[#034B5C] text-[#B5E467] flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
              </div>
              <p className="text-[#081F34] font-bold mb-1">Remplissez le formulaire</p>
              <p className="text-sm text-gray-400 max-w-xs">L'IA génèrera une fiche de poste dans l'esprit Positiv' Recrutement de Prodige RH</p>
            </div>
          )}
        </div>
      </div>
    </ModuleLayout>
  );
}

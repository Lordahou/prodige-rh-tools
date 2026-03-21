"use client";

import { useState } from "react";
import Link from "next/link";

interface Etape { etape: string; description: string; delai: string; }
interface PropData {
  reference: string; date: string;
  destinataire: { nom: string; fonction: string; entreprise: string; adresse: string; };
  objet: string; introduction: string; contexte_client: string; notre_approche: string;
  perimetre: { mission: string; poste: string; profil: string; livrables: string[]; };
  methodologie: Etape[];
  honoraires: { montant: string; modalites: string; garantie: string; note: string; };
  engagements: string[];
  conclusion: string;
  signature: { nom: string; titre: string; tel: string; email: string; };
}

const inputClass = "w-full border border-[#e8e2d8] rounded-xl px-4 py-2.5 text-sm text-[#081F34] focus:outline-none focus:ring-2 focus:ring-[#B5E467] placeholder:text-gray-300 bg-white";
const textareaClass = "w-full border border-[#e8e2d8] rounded-xl px-4 py-2.5 text-sm text-[#081F34] focus:outline-none focus:ring-2 focus:ring-[#B5E467] placeholder:text-gray-300 bg-white resize-none";
const labelClass = "block text-xs font-bold text-[#081F34] mb-1.5 uppercase tracking-wide";

export default function PropositionPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PropData | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    contact: "", entreprise: "", secteur: "", adresse: "",
    poste: "", contexte: "", profil: "", honoraires: "", conditions: "", infos: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleGenerate = async () => {
    if (!form.contact || !form.entreprise || !form.poste || !form.contexte) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/proposition", {
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

  const buildText = (d: PropData) => `PRODIGE RH — 27 rue Jules Ferry, 53 000 Laval
${d.reference} — ${d.date}

${d.destinataire.nom}
${d.destinataire.fonction}
${d.destinataire.entreprise}
${d.destinataire.adresse}

Objet : ${d.objet}

Madame, Monsieur,

${d.introduction}

VOTRE CONTEXTE
${d.contexte_client}

NOTRE APPROCHE
${d.notre_approche}

PÉRIMÈTRE DE LA MISSION
${d.perimetre.mission}
Poste : ${d.perimetre.poste}
Profil : ${d.perimetre.profil}

Livrables :
${d.perimetre.livrables.map((l) => `• ${l}`).join("\n")}

MÉTHODOLOGIE
${d.methodologie.map((e, i) => `${i + 1}. ${e.etape}\n${e.description}${e.delai ? ` (${e.delai})` : ""}`).join("\n\n")}

HONORAIRES
${d.honoraires.montant}
${d.honoraires.modalites}
Garantie : ${d.honoraires.garantie}
${d.honoraires.note}

NOS ENGAGEMENTS
${d.engagements.map((e) => `• ${e}`).join("\n")}

${d.conclusion}

Cordialement,

${d.signature.nom}
${d.signature.titre}
${d.signature.email}`;

  const handleCopy = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(buildText(data));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#f0ebe3]">
      <header className="bg-[#081F34]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-[#B5E467] hover:text-white transition-colors text-sm font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
            Retour
          </Link>
          <div className="h-5 w-px bg-gray-600" />
          <h1 className="text-lg font-bold text-white">Proposition commerciale <span className="text-[#B5E467]">IA</span></h1>
        </div>
      </header>

      <section className="bg-[#034B5C] text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h2 className="text-2xl font-extrabold mb-1">Lettre de mission <span className="text-[#B5E467]">personnalisée</span></h2>
          <p className="text-white/60 text-sm">Générez une proposition commerciale professionnelle signée Prodige RH en quelques secondes.</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-2 gap-8">
        {/* Formulaire */}
        <div className="bg-white rounded-2xl p-6 space-y-5" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
          <h3 className="font-bold text-[#081F34] text-base border-b border-[#e8e2d8] pb-3">Informations du mandat</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Contact client *</label>
              <input className={inputClass} value={form.contact} onChange={set("contact")} placeholder="Prénom Nom, Fonction" />
            </div>
            <div>
              <label className={labelClass}>Entreprise *</label>
              <input className={inputClass} value={form.entreprise} onChange={set("entreprise")} placeholder="Raison sociale" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Secteur</label>
              <input className={inputClass} value={form.secteur} onChange={set("secteur")} placeholder="Ex: Industrie, BTP..." />
            </div>
            <div>
              <label className={labelClass}>Adresse client</label>
              <input className={inputClass} value={form.adresse} onChange={set("adresse")} placeholder="Ville ou adresse complète" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Poste à recruter *</label>
            <input className={inputClass} value={form.poste} onChange={set("poste")} placeholder="Ex: Directeur Général, Responsable Supply Chain..." />
          </div>

          <div>
            <label className={labelClass}>Contexte du besoin *</label>
            <textarea className={textareaClass} rows={3} value={form.contexte} onChange={set("contexte")}
              placeholder="Pourquoi ce recrutement ? Création de poste, départ, croissance... Contexte de l'entreprise." />
          </div>

          <div>
            <label className={labelClass}>Profil recherché</label>
            <textarea className={textareaClass} rows={2} value={form.profil} onChange={set("profil")}
              placeholder="Formation, expérience, compétences clés attendues..." />
          </div>

          <div>
            <label className={labelClass}>Honoraires envisagés</label>
            <input className={inputClass} value={form.honoraires} onChange={set("honoraires")} placeholder="Ex: 15% de la rémunération annuelle brute" />
          </div>

          <div>
            <label className={labelClass}>Conditions particulières</label>
            <textarea className={textareaClass} rows={2} value={form.conditions} onChange={set("conditions")}
              placeholder="Modalités spécifiques, exclusivité, garantie souhaitée..." />
          </div>

          <div>
            <label className={labelClass}>Informations complémentaires</label>
            <textarea className={textareaClass} rows={2} value={form.infos} onChange={set("infos")}
              placeholder="Tout autre élément utile pour personnaliser la proposition..." />
          </div>

          {error && <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">{error}</div>}

          <button
            onClick={handleGenerate}
            disabled={loading || !form.contact || !form.entreprise || !form.poste || !form.contexte}
            className="w-full bg-[#B5E467] text-[#081F34] py-3 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-[#B5E467]/30 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="animate-spin w-4 h-4 border-2 border-[#081F34] border-t-transparent rounded-full inline-block" />Génération... (20-40s)</>
            ) : (
              <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" /></svg>Générer la proposition</>
            )}
          </button>
        </div>

        {/* Résultat */}
        <div>
          {data ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#081F34]">Proposition générée</h3>
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-sm font-bold text-[#034B5C] hover:text-[#081F34] transition-colors">
                  {copied ? (
                    <><svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>Copié !</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" /></svg>Copier</>
                  )}
                </button>
              </div>

              {/* En-tête lettre */}
              <div className="bg-[#034B5C] text-white rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-white/50 font-mono">{data.reference}</p>
                    <p className="text-xs text-white/50">{data.date}</p>
                  </div>
                  <img src="/arnaud.png" alt="" className="w-8 h-8 rounded-full opacity-60" />
                </div>
                <p className="font-bold text-[#B5E467] text-sm">{data.destinataire.nom} — {data.destinataire.fonction}</p>
                <p className="text-white/70 text-xs">{data.destinataire.entreprise}</p>
                <div className="mt-3 pt-3 border-t border-white/20">
                  <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Objet</p>
                  <p className="text-white font-bold text-sm">{data.objet}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 space-y-2" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
                <p className="text-sm text-gray-600 leading-relaxed">{data.introduction}</p>
              </div>

              <div className="bg-white rounded-2xl p-5 space-y-3" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
                <h4 className="font-bold text-[#034B5C] text-xs uppercase tracking-wider">Votre contexte</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{data.contexte_client}</p>
                <h4 className="font-bold text-[#034B5C] text-xs uppercase tracking-wider pt-2">Notre approche</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{data.notre_approche}</p>
              </div>

              <div className="bg-white rounded-2xl p-5 space-y-3" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
                <h4 className="font-bold text-[#034B5C] text-xs uppercase tracking-wider">Périmètre de la mission</h4>
                <p className="text-sm text-gray-600">{data.perimetre.mission}</p>
                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                  <p><span className="font-medium text-[#081F34]">Poste :</span> <span className="text-gray-600">{data.perimetre.poste}</span></p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#081F34] mb-2">Livrables :</p>
                  <ul className="space-y-1">{data.perimetre.livrables.map((l, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-sm text-gray-600"><span className="text-[#B5E467] font-bold">✓</span>{l}</li>
                  ))}</ul>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 space-y-3" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
                <h4 className="font-bold text-[#034B5C] text-xs uppercase tracking-wider">Méthodologie</h4>
                {data.methodologie.map((e, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#B5E467] text-[#081F34] flex items-center justify-center text-xs font-extrabold shrink-0">{i + 1}</div>
                    <div>
                      <p className="font-bold text-[#081F34] text-sm">{e.etape} {e.delai && <span className="text-xs text-gray-400 font-normal">— {e.delai}</span>}</p>
                      <p className="text-sm text-gray-600">{e.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#faf8f5] border border-[#e8e2d8] rounded-2xl p-5 space-y-2">
                <h4 className="font-bold text-[#034B5C] text-xs uppercase tracking-wider">Honoraires</h4>
                <p className="text-base font-extrabold text-[#081F34]">{data.honoraires.montant}</p>
                <p className="text-sm text-gray-600">{data.honoraires.modalites}</p>
                <p className="text-sm text-gray-600">Garantie : {data.honoraires.garantie}</p>
                {data.honoraires.note && <p className="text-xs text-gray-400">{data.honoraires.note}</p>}
              </div>

              <div className="bg-white rounded-2xl p-5 space-y-2" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
                <h4 className="font-bold text-[#034B5C] text-xs uppercase tracking-wider">Nos engagements</h4>
                {data.engagements.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-[#034B5C] font-bold shrink-0">•</span>{e}
                  </div>
                ))}
              </div>

              <div className="bg-[#081F34] rounded-2xl p-5 space-y-3">
                <p className="text-white/90 text-sm leading-relaxed italic">{data.conclusion}</p>
                <div className="pt-3 border-t border-white/20">
                  <p className="text-[#B5E467] font-bold text-sm">{data.signature.nom}</p>
                  <p className="text-white/60 text-xs">{data.signature.titre}</p>
                  <p className="text-white/60 text-xs">{data.signature.email}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-14 text-center h-full flex flex-col items-center justify-center" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
              <div className="w-16 h-16 rounded-2xl bg-[#034B5C] text-[#B5E467] flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
              </div>
              <p className="text-[#081F34] font-bold mb-1">Remplissez le formulaire</p>
              <p className="text-sm text-gray-400 max-w-xs">L'IA génère une lettre de mission personnalisée prête à envoyer au client</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

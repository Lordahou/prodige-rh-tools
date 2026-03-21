"use client";

import { useState } from "react";
import Link from "next/link";

interface Action { action: string; responsable: string; echeance: string; }
interface PointAborde { theme: string; contenu: string; decisions: string[]; }
interface CRData {
  titre: string;
  meta: { date: string; participants: string; objet: string; duree: string; };
  resume_executif: string;
  points_abordes: PointAborde[];
  actions: Action[];
  prochaines_etapes: string;
  prochain_rdv: string;
}

const inputClass = "w-full border border-[#e8e2d8] rounded-xl px-4 py-2.5 text-sm text-[#081F34] focus:outline-none focus:ring-2 focus:ring-[#B5E467] placeholder:text-gray-300 bg-white";
const textareaClass = "w-full border border-[#e8e2d8] rounded-xl px-4 py-2.5 text-sm text-[#081F34] focus:outline-none focus:ring-2 focus:ring-[#B5E467] placeholder:text-gray-300 bg-white resize-none";
const labelClass = "block text-xs font-bold text-[#081F34] mb-1.5 uppercase tracking-wide";

export default function CompteRenduPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CRData | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [objet, setObjet] = useState("");
  const [participants, setParticipants] = useState("");
  const [date, setDate] = useState("");

  const handleGenerate = async () => {
    if (transcript.trim().length < 50) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/compte-rendu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, objet, participants, date }),
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

  const buildText = (d: CRData) => `${d.titre}

Date : ${d.meta.date}
Participants : ${d.meta.participants}
Objet : ${d.meta.objet}
${d.meta.duree ? `Durée : ${d.meta.duree}` : ""}

RÉSUMÉ EXÉCUTIF
${d.resume_executif}

POINTS ABORDÉS
${d.points_abordes.map((p) => `\n${p.theme}\n${p.contenu}${p.decisions?.length ? "\nDécisions :\n" + p.decisions.map((dec) => `• ${dec}`).join("\n") : ""}`).join("\n")}

ACTIONS À MENER
${d.actions.map((a) => `• ${a.action} — ${a.responsable}${a.echeance ? ` (avant : ${a.echeance})` : ""}`).join("\n")}

PROCHAINES ÉTAPES
${d.prochaines_etapes}
${d.prochain_rdv ? `\nProchain RDV : ${d.prochain_rdv}` : ""}`;

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
          <h1 className="text-lg font-bold text-white">Compte-rendu <span className="text-[#B5E467]">IA</span></h1>
        </div>
      </header>

      <section className="bg-[#034B5C] text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h2 className="text-2xl font-extrabold mb-1">Compte-rendu de réunion <span className="text-[#B5E467]">automatique</span></h2>
          <p className="text-white/60 text-sm">Collez le transcript d'un call client — l'IA génère un CR structuré avec actions et décisions.</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-2 gap-8">
        {/* Formulaire */}
        <div className="bg-white rounded-2xl p-6 space-y-5" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
          <h3 className="font-bold text-[#081F34] text-base border-b border-[#e8e2d8] pb-3">Informations de la réunion</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date</label>
              <input className={inputClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Objet</label>
              <input className={inputClass} value={objet} onChange={(e) => setObjet(e.target.value)} placeholder="Ex: Point avancement recrutement DG" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Participants</label>
            <input className={inputClass} value={participants} onChange={(e) => setParticipants(e.target.value)} placeholder="Ex: Delphine Pilorge (Prodige RH), Jean Dupont (Client SA)" />
          </div>

          <div>
            <label className={labelClass}>Transcript de la réunion *</label>
            <textarea
              className={`${textareaClass} min-h-[280px] font-mono text-xs`}
              rows={14}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Collez ici le transcript de la réunion ou vos notes brutes...&#10;&#10;Exemple :&#10;00:00 - Delphine : Bonjour Jean, merci pour ce call...&#10;00:30 - Jean : Bonjour ! Alors, où en est-on sur le poste de DG ?"
            />
            <p className="text-xs text-gray-400 mt-1">{transcript.length} caractères</p>
          </div>

          {error && <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">{error}</div>}

          <button
            onClick={handleGenerate}
            disabled={loading || transcript.trim().length < 50}
            className="w-full bg-[#B5E467] text-[#081F34] py-3 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-[#B5E467]/30 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="animate-spin w-4 h-4 border-2 border-[#081F34] border-t-transparent rounded-full inline-block" />Génération... (20-40s)</>
            ) : (
              <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" /></svg>Générer le compte-rendu</>
            )}
          </button>
        </div>

        {/* Résultat */}
        <div>
          {data ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#081F34]">Compte-rendu généré</h3>
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-sm font-bold text-[#034B5C] hover:text-[#081F34] transition-colors">
                  {copied ? (
                    <><svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>Copié !</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" /></svg>Copier</>
                  )}
                </button>
              </div>

              <div className="bg-[#034B5C] text-white rounded-2xl p-5">
                <h2 className="font-extrabold text-[#B5E467] text-base mb-3">{data.titre}</h2>
                <div className="grid sm:grid-cols-2 gap-1 text-xs text-white/70">
                  {data.meta.date && <p>📅 {data.meta.date}</p>}
                  {data.meta.duree && <p>⏱ {data.meta.duree}</p>}
                  {data.meta.objet && <p className="sm:col-span-2">📋 {data.meta.objet}</p>}
                  {data.meta.participants && <p className="sm:col-span-2">👥 {data.meta.participants}</p>}
                </div>
                <div className="mt-3 pt-3 border-t border-white/20">
                  <p className="text-white/90 text-sm leading-relaxed">{data.resume_executif}</p>
                </div>
              </div>

              {data.points_abordes?.length > 0 && (
                <div className="bg-white rounded-2xl p-5 space-y-4" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
                  <h4 className="font-bold text-[#034B5C] text-xs uppercase tracking-wider">Points abordés</h4>
                  {data.points_abordes.map((p, i) => (
                    <div key={i} className="border-l-2 border-[#B5E467] pl-3">
                      <p className="font-bold text-[#081F34] text-sm mb-1">{p.theme}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{p.contenu}</p>
                      {p.decisions?.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {p.decisions.map((d, j) => (
                            <div key={j} className="flex items-start gap-1.5">
                              <span className="text-[#034B5C] text-xs font-bold mt-0.5 shrink-0">✓</span>
                              <span className="text-xs text-[#034B5C] font-medium">{d}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {data.actions?.length > 0 && (
                <div className="bg-white rounded-2xl p-5 space-y-3" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
                  <h4 className="font-bold text-[#034B5C] text-xs uppercase tracking-wider">Actions à mener</h4>
                  {data.actions.map((a, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-[#faf8f5] rounded-xl border border-[#e8e2d8]">
                      <div className="w-5 h-5 rounded-full bg-[#081F34] text-[#B5E467] flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#081F34]">{a.action}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          {a.responsable && <span>👤 {a.responsable}</span>}
                          {a.echeance && <span>📅 {a.echeance}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(data.prochaines_etapes || data.prochain_rdv) && (
                <div className="bg-[#081F34] rounded-2xl p-5 space-y-2">
                  {data.prochaines_etapes && <p className="text-white/90 text-sm leading-relaxed">{data.prochaines_etapes}</p>}
                  {data.prochain_rdv && <p className="text-[#B5E467] text-sm font-medium">📅 Prochain RDV : {data.prochain_rdv}</p>}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-14 text-center h-full flex flex-col items-center justify-center" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
              <div className="w-16 h-16 rounded-2xl bg-[#034B5C] text-[#B5E467] flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
              </div>
              <p className="text-[#081F34] font-bold mb-1">Collez votre transcript</p>
              <p className="text-sm text-gray-400 max-w-xs">L'IA structure automatiquement les points abordés, décisions et actions à mener</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

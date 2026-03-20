"use client";

import { useState } from "react";
import Link from "next/link";

interface Experience {
  titre: string;
  periode: string;
  introduction: string;
  role: string;
  missions: string;
  realisations: string;
  ressenti: string;
  raisonsChangement: string;
}

interface PointFort {
  categorie: string;
  items: string;
}

interface ActivitePrivilegiee {
  pct: string;
  titre: string;
  description: string;
}

const emptyExperience: Experience = {
  titre: "",
  periode: "",
  introduction: "",
  role: "",
  missions: "",
  realisations: "",
  ressenti: "",
  raisonsChangement: "",
};

export default function SynthesePage() {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [aiMessage, setAiMessage] = useState("");

  const [nom, setNom] = useState("");
  const [poste, setPoste] = useState("");
  const [structure, setStructure] = useState("");
  const [dateEntretien, setDateEntretien] = useState("");
  const [contexte, setContexte] = useState("");
  const [salaireValide, setSalaireValide] = useState("");
  const [disponibilite, setDisponibilite] = useState("");
  const [souhaits, setSouhaits] = useState("");
  const [motivations, setMotivations] = useState("");
  const [positionNonSelection, setPositionNonSelection] = useState("");

  const [experiences, setExperiences] = useState<Experience[]>([
    { ...emptyExperience },
  ]);

  const [stylePersonnel, setStylePersonnel] = useState("");
  const [styleDescription, setStyleDescription] = useState("");
  const [pointsForts, setPointsForts] = useState<PointFort[]>([
    { categorie: "Dans sa relation avec les autres", items: "" },
    { categorie: "Dans sa maniere de travailler", items: "" },
    { categorie: "Dans sa gestion des emotions", items: "" },
  ]);
  const [ameliorations, setAmeliorations] = useState("");
  const [activites, setActivites] = useState<ActivitePrivilegiee[]>([
    { pct: "", titre: "", description: "" },
  ]);
  const [gestionEnergie, setGestionEnergie] = useState("");
  const [comportementTravail, setComportementTravail] = useState("");
  const [priseDecision, setPriseDecision] = useState("");
  const [styleApprentissage, setStyleApprentissage] = useState("");

  const [tachesConfier, setTachesConfier] = useState("");
  const [tachesEviter, setTachesEviter] = useState("");
  const [objectifsAdherer, setObjectifsAdherer] = useState("");
  const [objectifsEchouer, setObjectifsEchouer] = useState("");
  const [managementAttendu, setManagementAttendu] = useState("");
  const [managementEviter, setManagementEviter] = useState("");
  const [reconnaissanceMeilleure, setReconnaissanceMeilleure] = useState("");
  const [reconnaissanceMoinsSensible, setReconnaissanceMoinsSensible] = useState("");

  const [competencesOp, setCompetencesOp] = useState("");
  const [qualitesMan, setQualitesMan] = useState("");
  const [pointsVigilance, setPointsVigilance] = useState("");
  const [recommandation, setRecommandation] = useState("");

  const handleAnalyzeTranscript = async () => {
    if (!transcript.trim()) return;
    setAnalyzing(true);
    setAiMessage("");
    try {
      const response = await fetch("/api/analyze-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      const d = result.data;
      if (d.nom) setNom(d.nom);
      if (d.poste) setPoste(d.poste);
      if (d.structure) setStructure(d.structure);
      if (d.dateEntretien) setDateEntretien(d.dateEntretien);
      if (d.contexte) setContexte(d.contexte);
      if (d.salaireValide) setSalaireValide(d.salaireValide);
      if (d.disponibilite) setDisponibilite(d.disponibilite);
      if (d.souhaits?.length) setSouhaits(d.souhaits.join("\n"));
      if (d.motivations?.length) setMotivations(d.motivations.join("\n"));
      if (d.positionNonSelection) setPositionNonSelection(d.positionNonSelection);
      if (d.experiences?.length) {
        setExperiences(d.experiences.map((e: Record<string, unknown>) => ({
          titre: (e.titre as string) || "",
          periode: (e.periode as string) || "",
          introduction: (e.introduction as string) || "",
          role: (e.role as string) || "",
          missions: Array.isArray(e.missions) ? (e.missions as string[]).join("\n") : "",
          realisations: (e.realisations as string) || "",
          ressenti: (e.ressenti as string) || "",
          raisonsChangement: (e.raisonsChangement as string) || "",
        })));
      }
      if (d.stylePersonnel) setStylePersonnel(d.stylePersonnel);
      if (d.styleDescription) setStyleDescription(d.styleDescription);
      if (d.pointsForts?.length) {
        setPointsForts(d.pointsForts.map((pf: Record<string, unknown>) => ({
          categorie: (pf.categorie as string) || "",
          items: Array.isArray(pf.items) ? (pf.items as string[]).join("\n") : "",
        })));
      }
      if (d.ameliorations?.length) setAmeliorations(d.ameliorations.join("\n"));
      if (d.activitesPrivilegiees?.length) setActivites(d.activitesPrivilegiees);
      if (d.gestionEnergie) setGestionEnergie(d.gestionEnergie);
      if (d.comportementTravail) setComportementTravail(d.comportementTravail);
      if (d.priseDecision) setPriseDecision(d.priseDecision);
      if (d.styleApprentissage) setStyleApprentissage(d.styleApprentissage);
      if (d.compatibiliteManageriale) {
        const cm = d.compatibiliteManageriale;
        if (cm.tachesConfier?.length) setTachesConfier(cm.tachesConfier.join("\n"));
        if (cm.tachesEviter?.length) setTachesEviter(cm.tachesEviter.join("\n"));
        if (cm.objectifsAdherer?.length) setObjectifsAdherer(cm.objectifsAdherer.join("\n"));
        if (cm.objectifsEchouer?.length) setObjectifsEchouer(cm.objectifsEchouer.join("\n"));
        if (cm.managementAttendu?.length) setManagementAttendu(cm.managementAttendu.join("\n"));
        if (cm.managementEviter?.length) setManagementEviter(cm.managementEviter.join("\n"));
        if (cm.reconnaissanceMeilleure?.length) setReconnaissanceMeilleure(cm.reconnaissanceMeilleure.join("\n"));
        if (cm.reconnaissanceMoinsSensible?.length) setReconnaissanceMoinsSensible(cm.reconnaissanceMoinsSensible.join("\n"));
      }
      if (d.competencesOperationnelles?.length) setCompetencesOp(d.competencesOperationnelles.join("\n"));
      if (d.qualitesManageriales?.length) setQualitesMan(d.qualitesManageriales.join("\n"));
      if (d.pointsVigilance?.length) setPointsVigilance(d.pointsVigilance.join("\n"));
      if (d.recommandation) setRecommandation(d.recommandation);

      const tokens = result.usage?.total_tokens || 0;
      setAiMessage(`Analyse terminee (${tokens} tokens). Verifiez les onglets et ajustez si besoin.`);
      setActiveTab(1);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setAiMessage(`Erreur : ${msg}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const splitLines = (text: string) =>
    text.split("\n").map((l) => l.trim()).filter(Boolean);

  const addExperience = () =>
    setExperiences([...experiences, { ...emptyExperience }]);

  const updateExperience = (
    index: number,
    field: keyof Experience,
    value: string
  ) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const removeExperience = (index: number) => {
    if (experiences.length > 1) {
      setExperiences(experiences.filter((_, i) => i !== index));
    }
  };

  const addActivite = () =>
    setActivites([...activites, { pct: "", titre: "", description: "" }]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const payload = {
        nom,
        poste,
        structure,
        dateEntretien,
        contexte,
        salaireValide,
        disponibilite,
        souhaits: splitLines(souhaits),
        motivations: splitLines(motivations),
        positionNonSelection,
        experiences: experiences.map((e) => ({
          ...e,
          missions: splitLines(e.missions),
        })),
        stylePersonnel,
        styleDescription,
        pointsForts: pointsForts.map((pf) => ({
          categorie: pf.categorie,
          items: splitLines(pf.items),
        })),
        ameliorations: splitLines(ameliorations),
        activitesPrivilegiees: activites,
        gestionEnergie,
        comportementTravail,
        priseDecision,
        styleApprentissage,
        compatibiliteManageriale: {
          tachesConfier: splitLines(tachesConfier),
          tachesEviter: splitLines(tachesEviter),
          objectifsAdherer: splitLines(objectifsAdherer),
          objectifsEchouer: splitLines(objectifsEchouer),
          managementAttendu: splitLines(managementAttendu),
          managementEviter: splitLines(managementEviter),
          reconnaissanceMeilleure: splitLines(reconnaissanceMeilleure),
          reconnaissanceMoinsSensible: splitLines(reconnaissanceMoinsSensible),
        },
        competencesOperationnelles: splitLines(competencesOp),
        qualitesManageriales: splitLines(qualitesMan),
        pointsVigilance: splitLines(pointsVigilance),
        recommandation,
      };

      const response = await fetch("/api/generate-synthese", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Erreur serveur");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Synthese_${nom.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Erreur lors de la generation. Verifiez les donnees.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: "IA", icon: "sparkles" },
    { label: "Identite", icon: "user" },
    { label: "Motivations", icon: "heart" },
    { label: "Parcours", icon: "briefcase" },
    { label: "Personnalite", icon: "brain" },
    { label: "Management", icon: "users" },
    { label: "Synthese", icon: "document" },
  ];

  const stepIcons: Record<string, React.ReactNode> = {
    sparkles: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" /></svg>,
    user: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>,
    heart: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>,
    briefcase: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>,
    brain: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" /></svg>,
    users: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>,
    document: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-6.024-.5c-2.206 0-4.369.178-6.474.5C4.595 4.01 3.75 4.973 3.75 6.108V16.5A2.25 2.25 0 0 0 6 18.75h.75" /></svg>,
  };

  const inputClass =
    "w-full border border-[#d5cec0] bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B5E467] focus:border-transparent placeholder:text-gray-400";
  const textareaClass = `${inputClass} resize-y min-h-[80px]`;
  const labelClass = "block text-sm font-semibold text-[#081F34] mb-1.5";

  return (
    <main className="min-h-screen bg-[#f0ebe3]">
      {/* Header */}
      <header className="bg-[#081F34]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-[#B5E467] hover:text-white transition-colors text-sm font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
            Retour
          </Link>
          <div className="h-5 w-px bg-gray-600" />
          <h1 className="text-lg font-bold text-white">
            Synthese <span className="text-[#B5E467]">Candidat</span>
          </h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 bg-white rounded-2xl p-4" style={{ boxShadow: "var(--shadow-card)" }}>
          {steps.map((step, i) => (
            <button
              key={step.label}
              onClick={() => setActiveTab(i)}
              className="flex-1 flex flex-col items-center gap-1.5 group relative"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                i === activeTab
                  ? "bg-[#034B5C] text-[#B5E467] shadow-lg shadow-[#034B5C]/20"
                  : i < activeTab
                  ? "bg-[#B5E467] text-[#081F34]"
                  : "bg-[#e8e2d8] text-gray-500 group-hover:bg-[#d5cec0]"
              }`}>
                {stepIcons[step.icon]}
              </div>
              <span className={`text-[11px] font-semibold transition-colors ${
                i === activeTab ? "text-[#034B5C]" : "text-gray-400"
              }`}>
                {step.label}
              </span>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className={`absolute top-5 left-[55%] w-[90%] h-0.5 ${
                  i < activeTab ? "bg-[#B5E467]" : "bg-[#e8e2d8]"
                }`} />
              )}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8" style={{ boxShadow: "var(--shadow-card)" }}>
          {/* Tab 0: IA Transcription */}
          {activeTab === 0 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#034B5C] text-[#B5E467] flex items-center justify-center">
                  {stepIcons.sparkles}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#081F34]">
                    Analyse automatique par <span className="text-[#034B5C]">IA</span>
                  </h2>
                  <p className="text-sm text-gray-400">
                    Collez la transcription d'entretien, l'IA remplit tout.
                  </p>
                </div>
              </div>

              <div>
                <label className={labelClass}>Transcription de l'entretien</label>
                <textarea
                  className={`${textareaClass} min-h-[280px] font-mono text-xs`}
                  rows={15}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Collez ici la transcription complete de l'entretien...&#10;&#10;Exemple :&#10;00:00:04 Arnaud : Bonjour, on demarre l'entretien...&#10;00:00:10 Candidat : Bonjour, je suis..."
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleAnalyzeTranscript}
                  disabled={analyzing || transcript.trim().length < 50}
                  className="bg-[#B5E467] text-[#081F34] px-7 py-3 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-[#B5E467]/30 transition-all disabled:opacity-40 flex items-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-[#081F34] border-t-transparent rounded-full" />
                      Analyse en cours... (30-60s)
                    </>
                  ) : (
                    <>
                      {stepIcons.sparkles}
                      Analyser avec l'IA
                    </>
                  )}
                </button>
                <span className="text-xs text-gray-400">
                  {transcript.length > 0 ? `${transcript.length} caracteres` : ""}
                </span>
              </div>
              {aiMessage && (
                <div className={`p-4 rounded-xl text-sm font-medium ${
                  aiMessage.startsWith("Erreur") ? "bg-red-50 text-red-600 border border-red-100" : "bg-[#e8f5d0] text-[#3d6b0f] border border-[#B5E467]/30"
                }`}>
                  {aiMessage}
                </div>
              )}
              <div className="bg-[#f0ebe3] rounded-xl p-4 text-sm text-[#081F34]/70 flex items-start gap-3">
                <svg className="w-5 h-5 text-[#034B5C] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
                <span>Vous pouvez aussi remplir les onglets manuellement. Cliquez sur <strong>Suivant</strong> pour passer au formulaire.</span>
              </div>
            </div>
          )}

          {/* Tab 1: Identite */}
          {activeTab === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#081F34] mb-4">
                Informations du <span className="text-[#034B5C]">candidat</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Nom complet</label>
                  <input className={inputClass} value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Sylvain Bertrand" />
                </div>
                <div>
                  <label className={labelClass}>Poste vise</label>
                  <input className={inputClass} value={poste} onChange={(e) => setPoste(e.target.value)} placeholder="Ex: Directeur General Adjoint (H/F)" />
                </div>
                <div>
                  <label className={labelClass}>Structure / Entreprise</label>
                  <input className={inputClass} value={structure} onChange={(e) => setStructure(e.target.value)} placeholder="Ex: Laval Agglomeration" />
                </div>
                <div>
                  <label className={labelClass}>Date(s) d'entretien</label>
                  <input className={inputClass} value={dateEntretien} onChange={(e) => setDateEntretien(e.target.value)} placeholder="Ex: Entretiens menes le 19/01, 26/01, 03/03" />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Motivations */}
          {activeTab === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#081F34] mb-4">
                Motivations <span className="text-[#034B5C]">professionnelles</span>
              </h2>
              <div>
                <label className={labelClass}>Contexte de la recherche d'emploi</label>
                <textarea className={textareaClass} rows={3} value={contexte} onChange={(e) => setContexte(e.target.value)} placeholder="Decrivez le contexte..." />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Salaire valide</label>
                  <input className={inputClass} value={salaireValide} onChange={(e) => setSalaireValide(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Disponibilite</label>
                  <input className={inputClass} value={disponibilite} onChange={(e) => setDisponibilite(e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Souhaits particuliers (1 par ligne)</label>
                <textarea className={textareaClass} rows={4} value={souhaits} onChange={(e) => setSouhaits(e.target.value)} placeholder="Poste a responsabilites&#10;Vision transversale&#10;..." />
              </div>
              <div>
                <label className={labelClass}>Motivations cles (1 par ligne)</label>
                <textarea className={textareaClass} rows={4} value={motivations} onChange={(e) => setMotivations(e.target.value)} placeholder="Capacite operationnelle immediate&#10;Connaissance approfondie..." />
              </div>
              <div>
                <label className={labelClass}>Position en cas de non-selection</label>
                <textarea className={textareaClass} rows={2} value={positionNonSelection} onChange={(e) => setPositionNonSelection(e.target.value)} />
              </div>
            </div>
          )}

          {/* Tab 3: Parcours */}
          {activeTab === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#081F34]">
                  Parcours <span className="text-[#034B5C]">professionnel</span>
                </h2>
                <button onClick={addExperience} className="bg-[#B5E467] text-[#081F34] px-5 py-2 rounded-full text-sm font-bold hover:shadow-lg hover:shadow-[#B5E467]/30 transition-all flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  Ajouter
                </button>
              </div>
              {experiences.map((exp, idx) => (
                <div key={idx} className="border border-[#e8e2d8] rounded-2xl p-5 space-y-4 bg-[#faf8f5]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[#034B5C] flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-[#034B5C] text-[#B5E467] text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      Experience {idx + 1}
                    </h3>
                    {experiences.length > 1 && (
                      <button onClick={() => removeExperience(idx)} className="text-red-400 hover:text-red-600 text-sm font-medium">
                        Supprimer
                      </button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Titre du poste + Entreprise</label>
                      <input className={inputClass} value={exp.titre} onChange={(e) => updateExperience(idx, "titre", e.target.value)} placeholder="Ex: Directeur de departement - Laval Agglo" />
                    </div>
                    <div>
                      <label className={labelClass}>Periode</label>
                      <input className={inputClass} value={exp.periode} onChange={(e) => updateExperience(idx, "periode", e.target.value)} placeholder="Ex: 2023 - aujourd'hui" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Introduction / Contexte</label>
                    <textarea className={textareaClass} rows={2} value={exp.introduction} onChange={(e) => updateExperience(idx, "introduction", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Role et responsabilites</label>
                    <textarea className={textareaClass} rows={2} value={exp.role} onChange={(e) => updateExperience(idx, "role", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Missions quotidiennes (1 par ligne)</label>
                    <textarea className={textareaClass} rows={4} value={exp.missions} onChange={(e) => updateExperience(idx, "missions", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Realisations specifiques</label>
                    <textarea className={textareaClass} rows={2} value={exp.realisations} onChange={(e) => updateExperience(idx, "realisations", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Ressenti</label>
                    <textarea className={textareaClass} rows={2} value={exp.ressenti} onChange={(e) => updateExperience(idx, "ressenti", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Raisons du changement</label>
                    <textarea className={textareaClass} rows={2} value={exp.raisonsChangement} onChange={(e) => updateExperience(idx, "raisonsChangement", e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: AssessFirst */}
          {activeTab === 4 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#081F34] mb-4">
                Adequation de <span className="text-[#034B5C]">personnalite</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Style personnel</label>
                  <input className={inputClass} value={stylePersonnel} onChange={(e) => setStylePersonnel(e.target.value)} placeholder="Ex: Initiateur" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Description du style</label>
                <textarea className={textareaClass} rows={4} value={styleDescription} onChange={(e) => setStyleDescription(e.target.value)} />
              </div>

              {pointsForts.map((pf, idx) => (
                <div key={idx}>
                  <label className={labelClass}>{pf.categorie} (1 point fort par ligne)</label>
                  <textarea className={textareaClass} rows={3} value={pf.items} onChange={(e) => {
                    const updated = [...pointsForts];
                    updated[idx] = { ...updated[idx], items: e.target.value };
                    setPointsForts(updated);
                  }} />
                </div>
              ))}

              <div>
                <label className={labelClass}>Domaines d'amelioration (1 par ligne)</label>
                <textarea className={textareaClass} rows={3} value={ameliorations} onChange={(e) => setAmeliorations(e.target.value)} />
              </div>

              <h3 className="font-bold text-[#034B5C] pt-2">Activites privilegiees</h3>
              {activites.map((act, idx) => (
                <div key={idx} className="grid grid-cols-[80px_1fr_2fr] gap-3">
                  <input className={inputClass} value={act.pct} onChange={(e) => {
                    const u = [...activites]; u[idx] = { ...u[idx], pct: e.target.value }; setActivites(u);
                  }} placeholder="75%" />
                  <input className={inputClass} value={act.titre} onChange={(e) => {
                    const u = [...activites]; u[idx] = { ...u[idx], titre: e.target.value }; setActivites(u);
                  }} placeholder="COORDONNER" />
                  <input className={inputClass} value={act.description} onChange={(e) => {
                    const u = [...activites]; u[idx] = { ...u[idx], description: e.target.value }; setActivites(u);
                  }} placeholder="Description..." />
                </div>
              ))}
              <button onClick={addActivite} className="text-sm font-semibold text-[#034B5C] hover:text-[#B5E467] flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Ajouter une activite
              </button>

              <div>
                <label className={labelClass}>Gestion de l'energie</label>
                <textarea className={textareaClass} rows={3} value={gestionEnergie} onChange={(e) => setGestionEnergie(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Comportement au travail</label>
                <textarea className={textareaClass} rows={3} value={comportementTravail} onChange={(e) => setComportementTravail(e.target.value)} />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Prise de decision</label>
                  <input className={inputClass} value={priseDecision} onChange={(e) => setPriseDecision(e.target.value)} placeholder="Ex: raisonnee" />
                </div>
                <div>
                  <label className={labelClass}>Style d'apprentissage</label>
                  <input className={inputClass} value={styleApprentissage} onChange={(e) => setStyleApprentissage(e.target.value)} placeholder="Ex: Innover" />
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Management */}
          {activeTab === 5 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#081F34] mb-4">
                Compatibilite <span className="text-[#034B5C]">manageriale</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-[#faf8f5] rounded-xl p-4 border border-[#e8e2d8]">
                  <label className={labelClass}>Taches a confier (1 par ligne)</label>
                  <textarea className={textareaClass} rows={3} value={tachesConfier} onChange={(e) => setTachesConfier(e.target.value)} />
                </div>
                <div className="bg-[#faf8f5] rounded-xl p-4 border border-[#e8e2d8]">
                  <label className={labelClass}>Taches a eviter (1 par ligne)</label>
                  <textarea className={textareaClass} rows={3} value={tachesEviter} onChange={(e) => setTachesEviter(e.target.value)} />
                </div>
                <div className="bg-[#faf8f5] rounded-xl p-4 border border-[#e8e2d8]">
                  <label className={labelClass}>Pour le faire adherer (1 par ligne)</label>
                  <textarea className={textareaClass} rows={3} value={objectifsAdherer} onChange={(e) => setObjectifsAdherer(e.target.value)} />
                </div>
                <div className="bg-[#faf8f5] rounded-xl p-4 border border-[#e8e2d8]">
                  <label className={labelClass}>Ce qui echouera (1 par ligne)</label>
                  <textarea className={textareaClass} rows={3} value={objectifsEchouer} onChange={(e) => setObjectifsEchouer(e.target.value)} />
                </div>
                <div className="bg-[#faf8f5] rounded-xl p-4 border border-[#e8e2d8]">
                  <label className={labelClass}>Management attendu (1 par ligne)</label>
                  <textarea className={textareaClass} rows={3} value={managementAttendu} onChange={(e) => setManagementAttendu(e.target.value)} />
                </div>
                <div className="bg-[#faf8f5] rounded-xl p-4 border border-[#e8e2d8]">
                  <label className={labelClass}>Management a eviter (1 par ligne)</label>
                  <textarea className={textareaClass} rows={3} value={managementEviter} onChange={(e) => setManagementEviter(e.target.value)} />
                </div>
                <div className="bg-[#faf8f5] rounded-xl p-4 border border-[#e8e2d8]">
                  <label className={labelClass}>Reconnaissance efficace (1 par ligne)</label>
                  <textarea className={textareaClass} rows={3} value={reconnaissanceMeilleure} onChange={(e) => setReconnaissanceMeilleure(e.target.value)} />
                </div>
                <div className="bg-[#faf8f5] rounded-xl p-4 border border-[#e8e2d8]">
                  <label className={labelClass}>Reconnaissance moins sensible (1 par ligne)</label>
                  <textarea className={textareaClass} rows={3} value={reconnaissanceMoinsSensible} onChange={(e) => setReconnaissanceMoinsSensible(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Synthese finale */}
          {activeTab === 6 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#081F34] mb-4">
                Thematiques & <span className="text-[#034B5C]">recommandation</span>
              </h2>
              <div>
                <label className={labelClass}>Competences operationnelles (1 par ligne)</label>
                <textarea className={textareaClass} rows={4} value={competencesOp} onChange={(e) => setCompetencesOp(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Qualites manageriales (1 par ligne)</label>
                <textarea className={textareaClass} rows={4} value={qualitesMan} onChange={(e) => setQualitesMan(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Points de vigilance (1 par ligne)</label>
                <textarea className={textareaClass} rows={4} value={pointsVigilance} onChange={(e) => setPointsVigilance(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Recommandation / Actions complementaires</label>
                <textarea className={textareaClass} rows={4} value={recommandation} onChange={(e) => setRecommandation(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        {/* Navigation & Generate */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
            disabled={activeTab === 0}
            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-[#081F34] hover:text-[#034B5C] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
            Precedent
          </button>

          {activeTab < steps.length - 1 ? (
            <button
              onClick={() => setActiveTab(activeTab + 1)}
              className="bg-[#081F34] text-white px-7 py-2.5 rounded-full text-sm font-bold hover:bg-[#034B5C] transition-all flex items-center gap-1.5"
            >
              Suivant
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={loading || !nom || !poste}
              className="bg-[#B5E467] text-[#081F34] px-8 py-3 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-[#B5E467]/30 transition-all disabled:opacity-40 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-[#081F34] border-t-transparent rounded-full" />
                  Generation...
                </>
              ) : (
                <>
                  {stepIcons.document}
                  Generer la synthese Word
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <footer className="bg-[#B5E467] mt-8">
        <div className="max-w-5xl mx-auto px-6 py-4 text-center text-sm font-semibold text-[#081F34]">
          Prodige RH — 27 rue Jules Ferry, 53 000 Laval
        </div>
      </footer>
    </main>
  );
}

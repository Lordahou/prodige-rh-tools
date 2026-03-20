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

  // Données du formulaire
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

  // Expériences
  const [experiences, setExperiences] = useState<Experience[]>([
    { ...emptyExperience },
  ]);

  // AssessFirst
  const [stylePersonnel, setStylePersonnel] = useState("");
  const [styleDescription, setStyleDescription] = useState("");
  const [pointsForts, setPointsForts] = useState<PointFort[]>([
    { categorie: "Dans sa relation avec les autres", items: "" },
    { categorie: "Dans sa manière de travailler", items: "" },
    { categorie: "Dans sa gestion des émotions", items: "" },
  ]);
  const [ameliorations, setAmeliorations] = useState("");
  const [activites, setActivites] = useState<ActivitePrivilegiee[]>([
    { pct: "", titre: "", description: "" },
  ]);
  const [gestionEnergie, setGestionEnergie] = useState("");
  const [comportementTravail, setComportementTravail] = useState("");
  const [priseDecision, setPriseDecision] = useState("");
  const [styleApprentissage, setStyleApprentissage] = useState("");

  // Compatibilité managériale
  const [tachesConfier, setTachesConfier] = useState("");
  const [tachesEviter, setTachesEviter] = useState("");
  const [objectifsAdherer, setObjectifsAdherer] = useState("");
  const [objectifsEchouer, setObjectifsEchouer] = useState("");
  const [managementAttendu, setManagementAttendu] = useState("");
  const [managementEviter, setManagementEviter] = useState("");
  const [reconnaissanceMeilleure, setReconnaissanceMeilleure] = useState("");
  const [reconnaissanceMoinsSensible, setReconnaissanceMoinsSensible] = useState("");

  // Thématiques
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
      // Remplir tous les champs
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
      setAiMessage(`Analyse terminée (${tokens} tokens). Vérifiez les onglets et ajustez si besoin.`);
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
      alert("Erreur lors de la génération. Vérifiez les données.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    "IA Transcription",
    "Identité",
    "Motivations",
    "Parcours",
    "AssessFirst",
    "Management",
    "Synthèse",
  ];

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#034B5C] focus:border-transparent";
  const textareaClass = `${inputClass} resize-y min-h-[80px]`;
  const labelClass = "block text-sm font-medium text-[#034B5C] mb-1";

  return (
    <main className="min-h-screen bg-[#f8fafb]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-[#034B5C] hover:text-[#B5E467] transition-colors">
            ← Retour
          </Link>
          <h1 className="text-xl font-bold text-[#034B5C]">
            Générateur de Synthèse Candidat
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 shadow-sm overflow-x-auto">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === i
                  ? "bg-[#034B5C] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Tab 0: IA Transcription */}
          {activeTab === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#034B5C] mb-2">
                Analyse automatique par IA
              </h2>
              <p className="text-sm text-gray-500">
                Collez la transcription d'entretien (Noota, Jarvi ou autre) et l'IA remplira automatiquement tous les champs de la synthèse. Vous pourrez ensuite vérifier et ajuster chaque onglet.
              </p>
              <div>
                <label className={labelClass}>Transcription de l'entretien</label>
                <textarea
                  className={`${textareaClass} min-h-[300px] font-mono text-xs`}
                  rows={15}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Collez ici la transcription complète de l'entretien...&#10;&#10;Exemple :&#10;00:00:04 Arnaud : Bonjour, on démarre l'entretien...&#10;00:00:10 Candidat : Bonjour, je suis..."
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleAnalyzeTranscript}
                  disabled={analyzing || transcript.trim().length < 50}
                  className="bg-[#B5E467] text-[#034B5C] px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#a5d455] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-[#034B5C] border-t-transparent rounded-full" />
                      Analyse en cours... (30-60s)
                    </>
                  ) : (
                    <>Analyser avec l'IA</>
                  )}
                </button>
                <span className="text-xs text-gray-400">
                  {transcript.length > 0 ? `${transcript.length} caractères` : ""}
                </span>
              </div>
              {aiMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  aiMessage.startsWith("Erreur") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
                }`}>
                  {aiMessage}
                </div>
              )}
              <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
                <strong>Astuce :</strong> Vous pouvez aussi remplir les onglets manuellement sans utiliser l'IA. Cliquez sur "Suivant" pour passer au formulaire.
              </div>
            </div>
          )}

          {/* Tab 1: Identité */}
          {activeTab === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#034B5C] mb-4">
                Informations du candidat
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nom complet</label>
                  <input className={inputClass} value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Sylvain Bertrand" />
                </div>
                <div>
                  <label className={labelClass}>Poste visé</label>
                  <input className={inputClass} value={poste} onChange={(e) => setPoste(e.target.value)} placeholder="Ex: Directeur Général Adjoint (H/F)" />
                </div>
                <div>
                  <label className={labelClass}>Structure / Entreprise</label>
                  <input className={inputClass} value={structure} onChange={(e) => setStructure(e.target.value)} placeholder="Ex: Laval Agglomération" />
                </div>
                <div>
                  <label className={labelClass}>Date(s) d'entretien</label>
                  <input className={inputClass} value={dateEntretien} onChange={(e) => setDateEntretien(e.target.value)} placeholder="Ex: Entretiens menés le 19/01, 26/01, 03/03" />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Motivations */}
          {activeTab === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#034B5C] mb-4">
                Motivations professionnelles
              </h2>
              <div>
                <label className={labelClass}>Contexte de la recherche d'emploi</label>
                <textarea className={textareaClass} rows={3} value={contexte} onChange={(e) => setContexte(e.target.value)} placeholder="Décrivez le contexte..." />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Salaire validé</label>
                  <input className={inputClass} value={salaireValide} onChange={(e) => setSalaireValide(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Disponibilité</label>
                  <input className={inputClass} value={disponibilite} onChange={(e) => setDisponibilite(e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Souhaits particuliers (1 par ligne)</label>
                <textarea className={textareaClass} rows={4} value={souhaits} onChange={(e) => setSouhaits(e.target.value)} placeholder="Poste à responsabilités&#10;Vision transversale&#10;..." />
              </div>
              <div>
                <label className={labelClass}>Motivations clés (1 par ligne)</label>
                <textarea className={textareaClass} rows={4} value={motivations} onChange={(e) => setMotivations(e.target.value)} placeholder="Capacité opérationnelle immédiate&#10;Connaissance approfondie..." />
              </div>
              <div>
                <label className={labelClass}>Position en cas de non-sélection</label>
                <textarea className={textareaClass} rows={2} value={positionNonSelection} onChange={(e) => setPositionNonSelection(e.target.value)} />
              </div>
            </div>
          )}

          {/* Tab 3: Parcours */}
          {activeTab === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#034B5C]">
                  Parcours professionnel
                </h2>
                <button onClick={addExperience} className="bg-[#B5E467] text-[#034B5C] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#a5d455] transition-colors">
                  + Ajouter une expérience
                </button>
              </div>
              {experiences.map((exp, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-[#034B5C]">
                      Expérience {idx + 1}
                    </h3>
                    {experiences.length > 1 && (
                      <button onClick={() => removeExperience(idx)} className="text-red-400 hover:text-red-600 text-sm">
                        Supprimer
                      </button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Titre du poste + Entreprise</label>
                      <input className={inputClass} value={exp.titre} onChange={(e) => updateExperience(idx, "titre", e.target.value)} placeholder="Ex: Directeur de département - Laval Agglo" />
                    </div>
                    <div>
                      <label className={labelClass}>Période</label>
                      <input className={inputClass} value={exp.periode} onChange={(e) => updateExperience(idx, "periode", e.target.value)} placeholder="Ex: 2023 - aujourd'hui" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Introduction / Contexte</label>
                    <textarea className={textareaClass} rows={2} value={exp.introduction} onChange={(e) => updateExperience(idx, "introduction", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Rôle et responsabilités</label>
                    <textarea className={textareaClass} rows={2} value={exp.role} onChange={(e) => updateExperience(idx, "role", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Missions quotidiennes (1 par ligne)</label>
                    <textarea className={textareaClass} rows={4} value={exp.missions} onChange={(e) => updateExperience(idx, "missions", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Réalisations spécifiques</label>
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
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#034B5C] mb-4">
                Adéquation de personnalité - AssessFirst
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
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
                <label className={labelClass}>Domaines d'amélioration (1 par ligne)</label>
                <textarea className={textareaClass} rows={3} value={ameliorations} onChange={(e) => setAmeliorations(e.target.value)} />
              </div>

              <h3 className="font-medium text-[#034B5C] pt-2">Activités privilégiées</h3>
              {activites.map((act, idx) => (
                <div key={idx} className="grid grid-cols-[80px_1fr_2fr] gap-2">
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
              <button onClick={addActivite} className="text-sm text-[#034B5C] hover:text-[#B5E467]">
                + Ajouter une activité
              </button>

              <div>
                <label className={labelClass}>Gestion de l'énergie</label>
                <textarea className={textareaClass} rows={3} value={gestionEnergie} onChange={(e) => setGestionEnergie(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Comportement au travail</label>
                <textarea className={textareaClass} rows={3} value={comportementTravail} onChange={(e) => setComportementTravail(e.target.value)} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Prise de décision</label>
                  <input className={inputClass} value={priseDecision} onChange={(e) => setPriseDecision(e.target.value)} placeholder="Ex: raisonnée" />
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
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#034B5C] mb-4">
                Compatibilité managériale
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Tâches à confier (1 par ligne)</label>
                  <textarea className={textareaClass} rows={3} value={tachesConfier} onChange={(e) => setTachesConfier(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Tâches à éviter (1 par ligne)</label>
                  <textarea className={textareaClass} rows={3} value={tachesEviter} onChange={(e) => setTachesEviter(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Pour le faire adhérer (1 par ligne)</label>
                  <textarea className={textareaClass} rows={3} value={objectifsAdherer} onChange={(e) => setObjectifsAdherer(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Ce qui échouera (1 par ligne)</label>
                  <textarea className={textareaClass} rows={3} value={objectifsEchouer} onChange={(e) => setObjectifsEchouer(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Management attendu (1 par ligne)</label>
                  <textarea className={textareaClass} rows={3} value={managementAttendu} onChange={(e) => setManagementAttendu(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Management à éviter (1 par ligne)</label>
                  <textarea className={textareaClass} rows={3} value={managementEviter} onChange={(e) => setManagementEviter(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Reconnaissance efficace (1 par ligne)</label>
                  <textarea className={textareaClass} rows={3} value={reconnaissanceMeilleure} onChange={(e) => setReconnaissanceMeilleure(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Reconnaissance moins sensible (1 par ligne)</label>
                  <textarea className={textareaClass} rows={3} value={reconnaissanceMoinsSensible} onChange={(e) => setReconnaissanceMoinsSensible(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Synthèse finale */}
          {activeTab === 6 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[#034B5C] mb-4">
                Thématiques et recommandation
              </h2>
              <div>
                <label className={labelClass}>Compétences opérationnelles (1 par ligne)</label>
                <textarea className={textareaClass} rows={4} value={competencesOp} onChange={(e) => setCompetencesOp(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Qualités managériales (1 par ligne)</label>
                <textarea className={textareaClass} rows={4} value={qualitesMan} onChange={(e) => setQualitesMan(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Points de vigilance (1 par ligne)</label>
                <textarea className={textareaClass} rows={4} value={pointsVigilance} onChange={(e) => setPointsVigilance(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Recommandation / Actions complémentaires</label>
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
            className="px-4 py-2 text-sm text-gray-500 hover:text-[#034B5C] disabled:opacity-30"
          >
            ← Précédent
          </button>

          {activeTab < tabs.length - 1 ? (
            <button
              onClick={() => setActiveTab(activeTab + 1)}
              className="bg-[#034B5C] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#023a48] transition-colors"
            >
              Suivant →
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={loading || !nom || !poste}
              className="bg-[#B5E467] text-[#034B5C] px-8 py-3 rounded-lg font-bold text-sm hover:bg-[#a5d455] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span> Génération...
                </>
              ) : (
                <>📄 Générer la synthèse Word</>
              )}
            </button>
          )}
        </div>
      </div>

      <footer className="border-t border-gray-200 mt-8">
        <div className="max-w-4xl mx-auto px-6 py-4 text-center text-sm text-gray-400">
          Prodige RH — 27 rue Jules Ferry, 53 000 Laval
        </div>
      </footer>
    </main>
  );
}

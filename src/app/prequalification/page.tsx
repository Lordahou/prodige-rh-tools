"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

/* ── Types ───────────────────────────────────────── */
interface PhaseData {
  questions: string[];
  note: string;
}
interface SynthesisData {
  decision: "Go" | "No-go" | "À approfondir";
  score_motivation: number;
  resume: string;
  points_forts: string[];
  points_vigilance: string[];
  profil: { situation: string; motivations: string; competences: string; conditions: string };
  prochaines_etapes: string;
  note_interne: string;
}

/* ── Call phases ─────────────────────────────────── */
const PHASES = [
  {
    id: "intro",
    title: "Introduction",
    color: "#034B5C",
    duration: "2 min",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 1 0 3 0 7.5 7.5 0 0 1 7.5 7.5h-1.5a6 6 0 0 0-6-6v1.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69Z" />
      </svg>
    ),
    questions: [
      "Vérifier que c'est le bon moment pour parler (sinon proposer un rappel)",
      "Se présenter : [votre prénom] de Prodige RH, cabinet de recrutement à Laval",
      "Présenter brièvement le poste et l'entreprise en 2 phrases",
      "Confirmer l'intérêt du candidat à en savoir plus",
    ],
  },
  {
    id: "situation",
    title: "Situation actuelle",
    color: "#0e4f6b",
    duration: "5 min",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
      </svg>
    ),
    questions: [
      "Poste actuel et depuis combien de temps ?",
      "En poste actuellement ou en recherche active ?",
      "Raison principale de la recherche d'un nouveau poste ?",
      "D'autres pistes ou processus en cours ?",
    ],
  },
  {
    id: "motivations",
    title: "Motivations",
    color: "#155e75",
    duration: "5 min",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
      </svg>
    ),
    questions: [
      "Qu'est-ce qui vous a attiré dans cette offre en particulier ?",
      "Quel type de structure et d'environnement vous correspond ?",
      "Quelles sont vos 3 priorités pour votre prochain poste ?",
      "Où vous voyez-vous dans 3 à 5 ans ?",
    ],
  },
  {
    id: "competences",
    title: "Compétences",
    color: "#1a6b87",
    duration: "8 min",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    ),
    questions: [
      "Expériences les plus significatives sur les missions clés du poste ?",
      "Principales compétences techniques et savoir-faire ?",
      "Comment votre entourage professionnel vous décrirait-il ?",
      "Plus beau succès ou réalisation dans votre carrière ?",
    ],
  },
  {
    id: "conditions",
    title: "Conditions",
    color: "#0f4c5c",
    duration: "4 min",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
      </svg>
    ),
    questions: [
      "Prétention salariale (fixe + variable) ?",
      "Disponibilité / durée du préavis ?",
      "Mobilité géographique et télétravail souhaité ?",
      "Autres conditions importantes (véhicule, avantages...) ?",
    ],
  },
  {
    id: "closing",
    title: "Clôture",
    color: "#034B5C",
    duration: "3 min",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    questions: [
      "Intérêt pour ce poste sur une échelle de 1 à 10 ?",
      "Questions du candidat sur le poste ou l'entreprise ?",
      "Présenter les prochaines étapes du processus",
      "Valider coordonnées et créneaux pour la suite",
    ],
  },
];

const inputCls =
  "w-full border border-[#e8e2d8] rounded-xl px-4 py-2.5 text-sm text-[#081F34] focus:outline-none focus:ring-2 focus:ring-[#B5E467] placeholder:text-gray-300 bg-white";
const labelCls = "block text-xs font-bold text-[#081F34] mb-1.5 uppercase tracking-wide";

/* ── Timer display ───────────────────────────────── */
function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

/* ── Decision badge ──────────────────────────────── */
function DecisionBadge({ decision }: { decision: string }) {
  const cfg: Record<string, { bg: string; text: string; dot: string }> = {
    "Go":             { bg: "bg-green-50 border-green-200",  text: "text-green-700", dot: "bg-green-500" },
    "No-go":          { bg: "bg-red-50 border-red-200",      text: "text-red-700",   dot: "bg-red-500" },
    "À approfondir":  { bg: "bg-amber-50 border-amber-200",  text: "text-amber-700", dot: "bg-amber-500" },
  };
  const c = cfg[decision] ?? cfg["À approfondir"];
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-bold ${c.bg} ${c.text}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
      {decision}
    </span>
  );
}

/* ── Page ────────────────────────────────────────── */
export default function PrequalificationPage() {
  const [step, setStep] = useState<"setup" | "call" | "synthesis">("setup");
  const [currentPhase, setCurrentPhase] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [synthesis, setSynthesis] = useState<SynthesisData | null>(null);
  const [copied, setCopied] = useState(false);

  // Setup form
  const [candidat, setCandidat] = useState("");
  const [poste, setPoste] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [secteur, setSecteur] = useState("");

  // Notes per phase: { phaseId -> { questions: string[], note: string } }
  const [phaseData, setPhaseData] = useState<Record<string, PhaseData>>(() =>
    Object.fromEntries(PHASES.map((p) => [p.id, { questions: [], note: "" }]))
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive]);

  const startCall = () => {
    setStep("call");
    setCurrentPhase(0);
    setTimer(0);
    setTimerActive(true);
  };

  const toggleQuestion = (phaseId: string, question: string) => {
    setPhaseData((prev) => {
      const current = prev[phaseId].questions;
      const next = current.includes(question)
        ? current.filter((q) => q !== question)
        : [...current, question];
      return { ...prev, [phaseId]: { ...prev[phaseId], questions: next } };
    });
  };

  const setNote = (phaseId: string, note: string) => {
    setPhaseData((prev) => ({ ...prev, [phaseId]: { ...prev[phaseId], note } }));
  };

  const finishCall = async () => {
    setTimerActive(false);
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/prequalification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidat,
          poste,
          entreprise,
          secteur,
          notes: phaseData,
          duree: formatTime(timer),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setSynthesis(result.data);
      setStep("synthesis");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setTimerActive(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!synthesis) return;
    const text = `SYNTHÈSE DE PRÉQUALIFICATION — ${candidat}
Poste : ${poste} | Entreprise : ${entreprise}
Durée : ${formatTime(timer)} | Date : ${new Date().toLocaleDateString("fr-FR")}

DÉCISION : ${synthesis.decision}
Niveau de motivation : ${synthesis.score_motivation}/10

RÉSUMÉ
${synthesis.resume}

POINTS FORTS
${synthesis.points_forts.map((p) => `• ${p}`).join("\n")}

POINTS DE VIGILANCE
${synthesis.points_vigilance.map((p) => `• ${p}`).join("\n")}

PROFIL
Situation : ${synthesis.profil.situation}
Motivations : ${synthesis.profil.motivations}
Compétences : ${synthesis.profil.competences}
Conditions : ${synthesis.profil.conditions}

PROCHAINES ÉTAPES
${synthesis.prochaines_etapes}

NOTE INTERNE
${synthesis.note_interne}`;
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

  const phase = PHASES[currentPhase];

  /* ── SETUP ─────────────────────────────────────── */
  if (step === "setup") {
    return (
      <main className="min-h-screen bg-[#f0ebe3]">
        <header className="bg-[#081F34]">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
            <Link href="/" className="text-[#B5E467] hover:text-white transition-colors text-sm font-medium flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
              Retour
            </Link>
            <div className="h-5 w-px bg-gray-600" />
            <h1 className="text-lg font-bold text-white">
              Préqualification <span className="text-[#B5E467]">IA</span>
            </h1>
          </div>
        </header>

        <section className="bg-[#034B5C] text-white">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <h2 className="text-2xl font-extrabold mb-1">
              Assistant de <span className="text-[#B5E467]">préqualification téléphonique</span>
            </h2>
            <p className="text-white/60 text-sm">
              Guide structuré pour conduire vos entretiens de préqualification. L'IA génère ensuite une synthèse actionnable.
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="bg-white rounded-2xl p-8 space-y-6" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
            <div>
              <h3 className="font-bold text-[#081F34] text-base mb-1">Informations de l'entretien</h3>
              <p className="text-sm text-gray-400">Renseignez les informations avant de démarrer l'appel</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Nom du candidat *</label>
                <input
                  className={inputCls}
                  value={candidat}
                  onChange={(e) => setCandidat(e.target.value)}
                  placeholder="Prénom NOM"
                />
              </div>
              <div>
                <label className={labelCls}>Poste à pourvoir *</label>
                <input
                  className={inputCls}
                  value={poste}
                  onChange={(e) => setPoste(e.target.value)}
                  placeholder="Ex: Responsable RH"
                />
              </div>
              <div>
                <label className={labelCls}>Entreprise cliente</label>
                <input
                  className={inputCls}
                  value={entreprise}
                  onChange={(e) => setEntreprise(e.target.value)}
                  placeholder="Nom de l'entreprise"
                />
              </div>
              <div>
                <label className={labelCls}>Secteur</label>
                <input
                  className={inputCls}
                  value={secteur}
                  onChange={(e) => setSecteur(e.target.value)}
                  placeholder="Ex: Industrie, Santé..."
                />
              </div>
            </div>

            {/* Phase preview */}
            <div>
              <p className={labelCls}>Déroulé de l'entretien — {PHASES.reduce((acc, p) => {
                const [min] = p.duration.split(" ");
                return acc + parseInt(min);
              }, 0)} min estimées</p>
              <div className="flex flex-wrap gap-2">
                {PHASES.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#034B5C] bg-[#034B5C]/8 border border-[#034B5C]/15 px-3 py-1.5 rounded-full"
                  >
                    <span className="w-4 h-4 rounded-full bg-[#081F34] text-white flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    {p.title}
                    <span className="text-gray-400">· {p.duration}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={startCall}
              disabled={!candidat || !poste}
              className="w-full bg-[#B5E467] text-[#081F34] py-3.5 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-[#B5E467]/30 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
              Démarrer l'entretien de préqualification
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* ── CALL ───────────────────────────────────────── */
  if (step === "call") {
    return (
      <main className="min-h-screen bg-[#f0ebe3] flex flex-col">
        {/* Sticky call bar */}
        <div
          className="sticky top-0 z-30 text-white"
          style={{ background: "#081F34", boxShadow: "0 2px 16px rgba(0,0,0,0.25)" }}
        >
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
            {/* Left: candidate + job */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#B5E467] flex items-center justify-center flex-shrink-0">
                <span className="text-[#081F34] font-bold text-xs">
                  {candidat.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm truncate">{candidat}</p>
                <p className="text-white/50 text-xs truncate">{poste}{entreprise ? ` · ${entreprise}` : ""}</p>
              </div>
            </div>

            {/* Center: timer */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#B5E467] animate-pulse" />
              <span className="font-mono text-lg font-bold text-[#B5E467]">{formatTime(timer)}</span>
              <button
                onClick={() => setTimerActive((v) => !v)}
                className="text-white/40 hover:text-white transition-colors ml-1"
                title={timerActive ? "Pause" : "Reprendre"}
              >
                {timerActive ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>
            </div>

            {/* Right: finish */}
            <button
              onClick={finishCall}
              disabled={loading}
              className="flex items-center gap-2 bg-[#B5E467] text-[#081F34] px-4 py-2 rounded-full text-sm font-bold hover:bg-[#c6f070] transition-all disabled:opacity-50 flex-shrink-0"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-[#081F34] border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                </svg>
              )}
              {loading ? "Analyse IA..." : "Terminer & synthèse"}
            </button>
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-white/10">
            <div
              className="h-full bg-[#B5E467] transition-all duration-500"
              style={{ width: `${((currentPhase + 1) / PHASES.length) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="max-w-6xl mx-auto px-6 pt-4">
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">{error}</div>
          </div>
        )}

        <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-6 flex gap-6">
          {/* Sidebar – phases nav */}
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
              {PHASES.map((p, i) => {
                const done = i < currentPhase;
                const active = i === currentPhase;
                return (
                  <button
                    key={p.id}
                    onClick={() => setCurrentPhase(i)}
                    className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-all text-sm
                      ${active ? "bg-[#081F34] text-white" : done ? "text-[#034B5C]" : "text-gray-400 hover:bg-gray-50"}`}
                    style={{ borderBottom: "1px solid #f0ebe3" }}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                        ${active ? "bg-[#B5E467] text-[#081F34]" : done ? "bg-[#B5E467]/20 text-[#034B5C]" : "bg-gray-100 text-gray-400"}`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <div>
                      <p className="font-semibold leading-tight">{p.title}</p>
                      <p className={`text-[10px] mt-0.5 ${active ? "text-white/50" : "text-gray-300"}`}>{p.duration}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Phase header */}
            <div className="bg-[#081F34] text-white rounded-2xl px-6 py-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#B5E467] text-xs font-bold uppercase tracking-wider">
                    Phase {currentPhase + 1}/{PHASES.length}
                  </span>
                  <span className="text-white/30 text-xs">· {phase.duration}</span>
                </div>
                <h2 className="text-xl font-extrabold">{phase.title}</h2>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#B5E467]/15 text-[#B5E467] flex items-center justify-center">
                {phase.icon}
              </div>
            </div>

            {/* Questions checklist */}
            <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
              <p className="text-xs font-bold text-[#081F34] uppercase tracking-wide mb-4">
                Questions à aborder
              </p>
              <div className="space-y-3">
                {phase.questions.map((q) => {
                  const checked = phaseData[phase.id]?.questions.includes(q) ?? false;
                  return (
                    <label
                      key={q}
                      className="flex items-start gap-3 cursor-pointer group"
                    >
                      <div
                        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                          ${checked
                            ? "bg-[#B5E467] border-[#B5E467]"
                            : "border-[#e8e2d8] group-hover:border-[#034B5C]"
                          }`}
                        onClick={() => toggleQuestion(phase.id, q)}
                      >
                        {checked && (
                          <svg className="w-3 h-3 text-[#081F34]" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`text-sm leading-relaxed transition-colors ${checked ? "text-gray-400 line-through" : "text-[#081F34]"}`}
                        onClick={() => toggleQuestion(phase.id, q)}
                      >
                        {q}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Notes textarea */}
            <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
              <label className="block text-xs font-bold text-[#081F34] uppercase tracking-wide mb-3">
                Notes — {phase.title}
              </label>
              <textarea
                className="w-full border border-[#e8e2d8] rounded-xl px-4 py-3 text-sm text-[#081F34] focus:outline-none focus:ring-2 focus:ring-[#B5E467] placeholder:text-gray-300 bg-white resize-none"
                rows={5}
                placeholder={`Notez ici les réponses et observations du candidat sur ${phase.title.toLowerCase()}…`}
                value={phaseData[phase.id]?.note ?? ""}
                onChange={(e) => setNote(phase.id, e.target.value)}
              />
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              {currentPhase > 0 && (
                <button
                  onClick={() => setCurrentPhase((p) => p - 1)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#e8e2d8] text-sm font-bold text-[#081F34] hover:bg-white transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
                  Précédent
                </button>
              )}
              {currentPhase < PHASES.length - 1 ? (
                <button
                  onClick={() => setCurrentPhase((p) => p + 1)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#081F34] text-white py-2.5 rounded-full text-sm font-bold hover:bg-[#034B5C] transition-all"
                >
                  Phase suivante : {PHASES[currentPhase + 1].title}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={finishCall}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#B5E467] text-[#081F34] py-2.5 rounded-full text-sm font-bold hover:shadow-lg hover:shadow-[#B5E467]/30 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-[#081F34] border-t-transparent rounded-full animate-spin" />Analyse en cours…</>
                  ) : (
                    <>Terminer &amp; générer la synthèse IA</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ── SYNTHESIS ──────────────────────────────────── */
  return (
    <main className="min-h-screen bg-[#f0ebe3]">
      <header className="bg-[#081F34]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => { setStep("setup"); setSynthesis(null); setTimer(0); setPhaseData(Object.fromEntries(PHASES.map((p) => [p.id, { questions: [], note: "" }]))); }}
            className="text-[#B5E467] hover:text-white transition-colors text-sm font-medium flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
            Nouvel entretien
          </button>
          <div className="h-5 w-px bg-gray-600" />
          <h1 className="text-lg font-bold text-white">
            Synthèse <span className="text-[#B5E467]">IA</span>
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-sm font-bold text-[#B5E467] hover:text-white transition-colors"
            >
              {copied ? (
                <><svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>Copié !</>
              ) : (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" /></svg>Copier</>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-5">
        {synthesis && (
          <>
            {/* Header card */}
            <div className="bg-[#081F34] text-white rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-extrabold mb-0.5">{candidat}</h2>
                  <p className="text-white/50 text-sm">{poste}{entreprise ? ` · ${entreprise}` : ""}</p>
                  <p className="text-white/30 text-xs mt-1">Durée : {formatTime(timer)} · {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <DecisionBadge decision={synthesis.decision} />
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ background: i < synthesis.score_motivation ? "#B5E467" : "rgba(255,255,255,0.15)" }}
                      />
                    ))}
                    <span className="text-[#B5E467] text-xs font-bold ml-1">{synthesis.score_motivation}/10</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-white/10 pt-4">
                <p className="text-white/80 text-sm leading-relaxed">{synthesis.resume}</p>
              </div>
            </div>

            {/* Points forts + vigilance */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
                <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Points forts
                </h4>
                <ul className="space-y-2">
                  {synthesis.points_forts.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
                <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                  Points de vigilance
                </h4>
                <ul className="space-y-2">
                  {synthesis.points_vigilance.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-amber-500 font-bold mt-0.5 flex-shrink-0">⚠</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Profil détaillé */}
            <div className="bg-white rounded-2xl p-5 space-y-4" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
              <h4 className="text-xs font-bold text-[#034B5C] uppercase tracking-wider">Profil détaillé</h4>
              {[
                { label: "Situation", value: synthesis.profil.situation },
                { label: "Motivations", value: synthesis.profil.motivations },
                { label: "Compétences", value: synthesis.profil.competences },
                { label: "Conditions", value: synthesis.profil.conditions },
              ].map((item) => (
                <div key={item.label} className="border-l-2 border-[#B5E467] pl-3">
                  <p className="text-xs font-bold text-[#081F34] mb-0.5">{item.label}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Prochaines étapes */}
            <div className="bg-[#034B5C] text-white rounded-2xl p-5">
              <h4 className="text-xs font-bold text-[#B5E467] uppercase tracking-wider mb-2">Prochaines étapes recommandées</h4>
              <p className="text-white/85 text-sm leading-relaxed">{synthesis.prochaines_etapes}</p>
            </div>

            {/* Note interne */}
            <div className="rounded-2xl p-5 border border-dashed border-[#e8e2d8] bg-[#faf8f5]">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                Note interne confidentielle
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed italic">{synthesis.note_interne}</p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

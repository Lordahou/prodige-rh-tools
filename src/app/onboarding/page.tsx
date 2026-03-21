"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

/* ── Types ─────────────────────────────────────────── */
interface Onboarding {
  id: string;
  candidat: { nom: string; prenom: string; email: string };
  poste: string;
  entreprise: string;
  contact_client: { nom: string; prenom: string; email: string };
  date_embauche: string; // YYYY-MM-DD
  dates: { j2: string; j21: string; j30: string };
  reminders: {
    j2: { sent: boolean; sent_at?: string };
    j21_candidat: { sent: boolean; sent_at?: string };
    j21_client: { sent: boolean; sent_at?: string };
    j30: { sent: boolean; sent_at?: string };
  };
  notes: string;
  statut: "actif" | "termine";
  createdAt: string;
}

interface Templates {
  j2: { subject: string; body: string };
  j21_candidat: { subject: string; body: string };
  j21_client: { subject: string; body: string };
  j30: { subject: string; body: string };
}

/* ── Helpers ─────────────────────────────────────── */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function daysFromNow(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

type ReminderStatus = "sent" | "overdue" | "due_soon" | "upcoming";

function getReminderStatus(dueDate: string, sent: boolean): ReminderStatus {
  if (sent) return "sent";
  const d = daysFromNow(dueDate);
  if (d < 0) return "overdue";
  if (d <= 2) return "due_soon";
  return "upcoming";
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

/* ── Default templates ───────────────────────────── */
const DEFAULT_TEMPLATES: Templates = {
  j2: {
    subject: "Bienvenue chez {{entreprise}} — On pense à vous !",
    body: `Bonjour {{prenom_candidat}},

J'espère que ces deux premiers jours chez {{entreprise}} se passent bien et que vous vous sentez bien accueilli(e) !

Je voulais juste prendre de vos nouvelles et m'assurer que tout se passe comme prévu pour votre poste de {{poste}}.

N'hésitez pas à me contacter si vous avez des questions ou si vous avez besoin de quoi que ce soit.

Très belle suite dans cette nouvelle aventure !

Bien cordialement,
Delphine Pilorge
Prodige RH`,
  },
  j21_candidat: {
    subject: "Comment se passe votre intégration chez {{entreprise}} ?",
    body: `Bonjour {{prenom_candidat}},

Cela fait maintenant 3 semaines que vous avez rejoint {{entreprise}} en tant que {{poste}}.

J'aurais beaucoup de plaisir à avoir de vos nouvelles : comment se passe votre intégration ? Avez-vous des questions ou des points à aborder ?

Je reste disponible pour vous accompagner.

Bien cordialement,
Delphine Pilorge
Prodige RH`,
  },
  j21_client: {
    subject: "Suivi intégration {{prenom_candidat}} — {{poste}}",
    body: `Bonjour {{prenom_client}},

Je me permets de vous contacter 3 semaines après l'arrivée de {{prenom_candidat}} au sein de vos équipes pour le poste de {{poste}}.

Comment se déroule son intégration ? Y a-t-il des points à aborder ensemble ?

Je reste à votre disposition.

Bien cordialement,
Delphine Pilorge
Prodige RH`,
  },
  j30: {
    subject: "Bilan d'intégration 1 mois — {{prenom_candidat}} chez {{entreprise}}",
    body: `Bonjour {{prenom_candidat}},

Un mois déjà ! J'espère que vous êtes pleinement intégré(e) dans votre nouveau poste de {{poste}} chez {{entreprise}}.

Je vous propose un rapide bilan téléphonique pour faire le point sur cette première période. Quand êtes-vous disponible ?

À bientôt,
Delphine Pilorge
Prodige RH`,
  },
};

/* ── Form initial state ───────────────────────────── */
const EMPTY_FORM = {
  candidat_nom: "",
  candidat_prenom: "",
  candidat_email: "",
  poste: "",
  entreprise: "",
  client_nom: "",
  client_prenom: "",
  client_email: "",
  date_embauche: "",
  notes: "",
};

/* ── Reminder Label ───────────────────────────────── */
function ReminderBadge({ status, dueDate }: { status: ReminderStatus; dueDate: string }) {
  const d = daysFromNow(dueDate);
  if (status === "sent")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
        style={{ background: "rgba(181,228,103,0.1)", color: "#B5E467", border: "1px solid rgba(181,228,103,0.2)" }}>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
        Envoyé
      </span>
    );
  if (status === "overdue")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
        style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
        En retard · {Math.abs(d)}j
      </span>
    );
  if (status === "due_soon")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
        style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>
        {d === 0 ? "Aujourd'hui" : `Dans ${d}j`}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
      Dans {d}j
    </span>
  );
}

/* ── Page ────────────────────────────────────────── */
export default function OnboardingPage() {
  const [tab, setTab] = useState<"suivis" | "nouveau" | "templates">("suivis");
  const [entries, setEntries] = useState<Onboarding[]>([]);
  const [templates, setTemplates] = useState<Templates>(DEFAULT_TEMPLATES);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<keyof Templates | null>(null);
  const [templateDraft, setTemplateDraft] = useState({ subject: "", body: "" });
  const [filterStatut, setFilterStatut] = useState<"actif" | "termine" | "all">("actif");

  /* Load from localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("prodige_onboarding");
      if (raw) setEntries(JSON.parse(raw));
    } catch {}
    try {
      const rawT = localStorage.getItem("prodige_onboarding_templates");
      if (rawT) setTemplates(JSON.parse(rawT));
    } catch {}
  }, []);

  const saveEntries = useCallback((updated: Onboarding[]) => {
    setEntries(updated);
    try { localStorage.setItem("prodige_onboarding", JSON.stringify(updated)); } catch {}
  }, []);

  const saveTemplates = useCallback((updated: Templates) => {
    setTemplates(updated);
    try { localStorage.setItem("prodige_onboarding_templates", JSON.stringify(updated)); } catch {}
  }, []);

  /* Mark reminder as sent */
  const markSent = (id: string, key: keyof Onboarding["reminders"]) => {
    const updated = entries.map((e) =>
      e.id === id
        ? { ...e, reminders: { ...e.reminders, [key]: { sent: true, sent_at: new Date().toISOString() } } }
        : e
    );
    saveEntries(updated);
  };

  /* Mark entry as terminé */
  const markTermine = (id: string) => {
    const updated = entries.map((e) => (e.id === id ? { ...e, statut: "termine" as const } : e));
    saveEntries(updated);
  };

  /* Delete entry */
  const deleteEntry = (id: string) => {
    saveEntries(entries.filter((e) => e.id !== id));
  };

  /* Build mailto link */
  const buildMailto = (entry: Onboarding, tplKey: keyof Templates, toEmail: string) => {
    const vars = {
      candidat: `${entry.candidat.prenom} ${entry.candidat.nom}`,
      prenom_candidat: entry.candidat.prenom,
      entreprise: entry.entreprise,
      poste: entry.poste,
      prenom_client: entry.contact_client.prenom,
    };
    const tpl = templates[tplKey];
    const subject = encodeURIComponent(interpolate(tpl.subject, vars));
    const body = encodeURIComponent(interpolate(tpl.body, vars));
    return `mailto:${toEmail}?subject=${subject}&body=${body}`;
  };

  /* Send + mark */
  const sendReminder = (entry: Onboarding, tplKey: keyof Templates, reminderKey: keyof Onboarding["reminders"], toEmail: string) => {
    window.location.href = buildMailto(entry, tplKey, toEmail);
    setTimeout(() => markSent(entry.id, reminderKey), 500);
  };

  /* Create new onboarding */
  const handleCreate = () => {
    if (!form.candidat_nom.trim() || !form.candidat_prenom.trim() || !form.poste.trim() || !form.entreprise.trim() || !form.date_embauche) {
      setFormError("Veuillez remplir tous les champs obligatoires (*)");
      return;
    }
    const id = `ob_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const entry: Onboarding = {
      id,
      candidat: { nom: form.candidat_nom.trim(), prenom: form.candidat_prenom.trim(), email: form.candidat_email.trim() },
      poste: form.poste.trim(),
      entreprise: form.entreprise.trim(),
      contact_client: { nom: form.client_nom.trim(), prenom: form.client_prenom.trim(), email: form.client_email.trim() },
      date_embauche: form.date_embauche,
      dates: {
        j2: addDays(form.date_embauche, 2),
        j21: addDays(form.date_embauche, 21),
        j30: addDays(form.date_embauche, 30),
      },
      reminders: {
        j2: { sent: false },
        j21_candidat: { sent: false },
        j21_client: { sent: false },
        j30: { sent: false },
      },
      notes: form.notes.trim(),
      statut: "actif",
      createdAt: new Date().toISOString(),
    };
    saveEntries([entry, ...entries]);
    setForm(EMPTY_FORM);
    setFormError("");
    setFormSuccess(true);
    setTimeout(() => { setFormSuccess(false); setTab("suivis"); }, 1800);
  };

  /* Filtered entries */
  const filtered = entries.filter((e) =>
    filterStatut === "all" ? true : e.statut === filterStatut
  );

  /* Count alerts */
  const alertCount = entries.filter((e) => {
    if (e.statut !== "actif") return false;
    const r = e.reminders;
    return (
      (!r.j2.sent && daysFromNow(e.dates.j2) < 0) ||
      (!r.j21_candidat.sent && daysFromNow(e.dates.j21) < 0) ||
      (!r.j21_client.sent && daysFromNow(e.dates.j21) < 0) ||
      (!r.j30.sent && daysFromNow(e.dates.j30) < 0)
    );
  }).length;

  /* Edit template */
  const startEditTemplate = (key: keyof Templates) => {
    setEditingTemplate(key);
    setTemplateDraft({ ...templates[key] });
  };

  const saveTemplate = () => {
    if (!editingTemplate) return;
    saveTemplates({ ...templates, [editingTemplate]: templateDraft });
    setEditingTemplate(null);
  };

  const TEMPLATE_LABELS: Record<keyof Templates, string> = {
    j2: "J+2 — Candidat",
    j21_candidat: "J+21 — Candidat",
    j21_client: "J+21 — Client",
    j30: "J+30 — Bilan candidat",
  };

  const TEMPLATE_VARS = ["{{prenom_candidat}}", "{{candidat}}", "{{poste}}", "{{entreprise}}", "{{prenom_client}}"];

  return (
    <main
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #060e1a 0%, #071525 60%, #060e1a 100%)" }}
    >
      {/* ── Bg blobs ── */}
      <div className="fixed inset-0 pointer-events-none dot-grid" />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute anim-float-a" style={{ top: "-20%", right: "-8%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(3,75,92,0.3) 0%, transparent 68%)" }} />
        <div className="absolute anim-float-b" style={{ bottom: "-20%", left: "-12%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(181,228,103,0.06) 0%, transparent 68%)" }} />
      </div>

      {/* ── Header ── */}
      <header className="relative z-20 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:bg-white/5" style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(181,228,103,0.10)", border: "1px solid rgba(181,228,103,0.20)", color: "#B5E467" }}>
              <svg className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white text-[15px] font-bold leading-tight" style={{ fontFamily: "Syne, sans-serif" }}>
                Onboarding Candidats
              </h1>
              <p className="text-white/30 text-[11px]">Suivi post-recrutement &amp; relances automatiques</p>
            </div>
          </div>
          {alertCount > 0 && (
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 anim-pulse-lime" />
              <span className="text-red-400 text-[11px] font-bold">{alertCount} relance{alertCount > 1 ? "s" : ""} en retard</span>
            </div>
          )}
        </div>
      </header>

      {/* ── Tabs ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-8">
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {[
            { key: "suivis", label: "Suivis actifs" },
            { key: "nouveau", label: "Nouveau suivi" },
            { key: "templates", label: "Templates email" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={
                tab === t.key
                  ? { background: "#B5E467", color: "#060e1a" }
                  : { color: "rgba(255,255,255,0.35)", background: "transparent" }
              }
            >
              {t.label}
              {t.key === "suivis" && alertCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold" style={{ background: "rgba(239,68,68,0.8)", color: "white" }}>
                  {alertCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab: Suivis ── */}
      {tab === "suivis" && (
        <section className="relative z-10 max-w-5xl mx-auto px-6 py-8">
          {/* Filter */}
          <div className="flex items-center gap-2 mb-6">
            {(["actif", "termine", "all"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatut(s)}
                className="px-3 py-1 rounded-lg text-[11px] font-semibold transition-all"
                style={
                  filterStatut === s
                    ? { background: "rgba(181,228,103,0.15)", color: "#B5E467", border: "1px solid rgba(181,228,103,0.25)" }
                    : { background: "transparent", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" }
                }
              >
                {s === "actif" ? "En cours" : s === "termine" ? "Terminés" : "Tous"}
              </button>
            ))}
            <span className="ml-auto text-white/20 text-[11px]">{filtered.length} suivi{filtered.length > 1 ? "s" : ""}</span>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(181,228,103,0.06)", border: "1px solid rgba(181,228,103,0.12)", color: "rgba(255,255,255,0.2)" }}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
              </div>
              <p className="text-white/30 text-sm mb-1">Aucun suivi d&apos;onboarding</p>
              <p className="text-white/15 text-xs mb-5">Créez votre premier suivi quand un candidat est recruté</p>
              <button
                onClick={() => setTab("nouveau")}
                className="px-5 py-2.5 rounded-xl text-sm font-bold btn-lime"
              >
                Créer un suivi
              </button>
            </div>
          )}

          <div className="space-y-4">
            {filtered.map((entry) => {
              const j2Status = getReminderStatus(entry.dates.j2, entry.reminders.j2.sent);
              const j21cStatus = getReminderStatus(entry.dates.j21, entry.reminders.j21_candidat.sent);
              const j21clStatus = getReminderStatus(entry.dates.j21, entry.reminders.j21_client.sent);
              const j30Status = getReminderStatus(entry.dates.j30, entry.reminders.j30.sent);

              const hasOverdue = [j2Status, j21cStatus, j21clStatus, j30Status].includes("overdue");
              const hasDueSoon = [j2Status, j21cStatus, j21clStatus, j30Status].includes("due_soon");

              return (
                <div
                  key={entry.id}
                  className="rounded-2xl p-5 anim-fade-up"
                  style={{
                    background: hasOverdue ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.04)",
                    border: hasOverdue
                      ? "1px solid rgba(239,68,68,0.15)"
                      : hasDueSoon
                      ? "1px solid rgba(251,191,36,0.15)"
                      : "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  {/* Entry header */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-bold text-[15px]" style={{ fontFamily: "Syne, sans-serif" }}>
                          {entry.candidat.prenom} {entry.candidat.nom}
                        </h3>
                        {entry.statut === "termine" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "rgba(181,228,103,0.1)", color: "#B5E467", border: "1px solid rgba(181,228,103,0.2)" }}>
                            Terminé
                          </span>
                        )}
                      </div>
                      <p className="text-white/40 text-sm">
                        <span style={{ color: "#B5E467" }}>{entry.poste}</span>
                        <span className="mx-1.5 text-white/20">·</span>
                        {entry.entreprise}
                      </p>
                      <p className="text-white/25 text-xs mt-1">
                        Embauche le {formatDate(entry.date_embauche)}
                        {entry.contact_client.prenom && (
                          <> · Contact client : {entry.contact_client.prenom} {entry.contact_client.nom}</>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {entry.statut === "actif" && (
                        <button
                          onClick={() => markTermine(entry.id)}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                          style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)", background: "transparent" }}
                          title="Marquer comme terminé"
                        >
                          Clôturer
                        </button>
                      )}
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-red-500/10"
                        style={{ color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.06)" }}
                        title="Supprimer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Reminder timeline */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* J+2 Candidat */}
                    <ReminderCard
                      label="J+2 — Candidat"
                      date={entry.dates.j2}
                      status={j2Status}
                      sentAt={entry.reminders.j2.sent_at}
                      email={entry.candidat.email}
                      onSend={() => sendReminder(entry, "j2", "j2", entry.candidat.email)}
                      onMark={() => markSent(entry.id, "j2")}
                      disabled={entry.statut === "termine"}
                    />
                    {/* J+21 Candidat */}
                    <ReminderCard
                      label="J+21 — Candidat"
                      date={entry.dates.j21}
                      status={j21cStatus}
                      sentAt={entry.reminders.j21_candidat.sent_at}
                      email={entry.candidat.email}
                      onSend={() => sendReminder(entry, "j21_candidat", "j21_candidat", entry.candidat.email)}
                      onMark={() => markSent(entry.id, "j21_candidat")}
                      disabled={entry.statut === "termine"}
                    />
                    {/* J+21 Client */}
                    <ReminderCard
                      label="J+21 — Client"
                      date={entry.dates.j21}
                      status={j21clStatus}
                      sentAt={entry.reminders.j21_client.sent_at}
                      email={entry.contact_client.email}
                      onSend={() => sendReminder(entry, "j21_client", "j21_client", entry.contact_client.email)}
                      onMark={() => markSent(entry.id, "j21_client")}
                      disabled={entry.statut === "termine"}
                    />
                    {/* J+30 */}
                    <ReminderCard
                      label="J+30 — Bilan"
                      date={entry.dates.j30}
                      status={j30Status}
                      sentAt={entry.reminders.j30.sent_at}
                      email={entry.candidat.email}
                      onSend={() => sendReminder(entry, "j30", "j30", entry.candidat.email)}
                      onMark={() => markSent(entry.id, "j30")}
                      disabled={entry.statut === "termine"}
                    />
                  </div>

                  {/* Notes */}
                  {entry.notes && (
                    <div className="mt-4 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest mb-1">Notes</p>
                      <p className="text-white/40 text-xs leading-relaxed">{entry.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Tab: Nouveau suivi ── */}
      {tab === "nouveau" && (
        <section className="relative z-10 max-w-2xl mx-auto px-6 py-8">
          <div
            className="rounded-2xl p-6 anim-fade-up"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <h2 className="text-white font-bold text-lg mb-6" style={{ fontFamily: "Syne, sans-serif" }}>
              Nouveau suivi d&apos;onboarding
            </h2>

            <div className="space-y-5">
              {/* Candidat */}
              <FieldGroup label="Candidat recruté" required>
                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    label="Prénom *"
                    value={form.candidat_prenom}
                    onChange={(v) => setForm({ ...form, candidat_prenom: v })}
                    placeholder="Ex : Marie"
                  />
                  <FormInput
                    label="Nom *"
                    value={form.candidat_nom}
                    onChange={(v) => setForm({ ...form, candidat_nom: v })}
                    placeholder="Ex : Dupont"
                  />
                </div>
                <FormInput
                  label="Email candidat"
                  type="email"
                  value={form.candidat_email}
                  onChange={(v) => setForm({ ...form, candidat_email: v })}
                  placeholder="marie.dupont@email.com"
                />
              </FieldGroup>

              {/* Mission */}
              <FieldGroup label="Mission">
                <FormInput
                  label="Intitulé du poste *"
                  value={form.poste}
                  onChange={(v) => setForm({ ...form, poste: v })}
                  placeholder="Ex : Responsable comptable"
                />
                <FormInput
                  label="Entreprise *"
                  value={form.entreprise}
                  onChange={(v) => setForm({ ...form, entreprise: v })}
                  placeholder="Ex : Société ABC"
                />
              </FieldGroup>

              {/* Contact client */}
              <FieldGroup label="Contact client (pour la relance J+21)">
                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    label="Prénom contact"
                    value={form.client_prenom}
                    onChange={(v) => setForm({ ...form, client_prenom: v })}
                    placeholder="Ex : Jean"
                  />
                  <FormInput
                    label="Nom contact"
                    value={form.client_nom}
                    onChange={(v) => setForm({ ...form, client_nom: v })}
                    placeholder="Ex : Martin"
                  />
                </div>
                <FormInput
                  label="Email contact client"
                  type="email"
                  value={form.client_email}
                  onChange={(v) => setForm({ ...form, client_email: v })}
                  placeholder="jean.martin@entreprise.com"
                />
              </FieldGroup>

              {/* Date embauche */}
              <div>
                <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">
                  Date d&apos;embauche *
                </label>
                <input
                  type="date"
                  value={form.date_embauche}
                  onChange={(e) => setForm({ ...form, date_embauche: e.target.value })}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#B5E467]/40"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    colorScheme: "dark",
                  }}
                />
                {form.date_embauche && (
                  <p className="text-white/25 text-xs mt-2">
                    Relances prévues : J+2 le {formatDate(addDays(form.date_embauche, 2))},
                    J+21 le {formatDate(addDays(form.date_embauche, 21))},
                    J+30 le {formatDate(addDays(form.date_embauche, 30))}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  placeholder="Informations utiles pour le suivi (salaire négocié, points d'attention…)"
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#B5E467]/40 resize-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                />
              </div>
            </div>

            {formError && (
              <p className="mt-4 text-red-400 text-sm">{formError}</p>
            )}

            {formSuccess && (
              <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: "rgba(181,228,103,0.08)", border: "1px solid rgba(181,228,103,0.2)" }}>
                <svg className="w-4 h-4 flex-shrink-0" style={{ color: "#B5E467" }} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span className="text-sm font-semibold" style={{ color: "#B5E467" }}>
                  Suivi créé ! Redirection vers le tableau de bord…
                </span>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setTab("suivis")}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.4)", background: "transparent" }}
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 py-2.5 rounded-xl text-sm btn-lime font-bold"
              >
                Créer le suivi
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Tab: Templates ── */}
      {tab === "templates" && (
        <section className="relative z-10 max-w-3xl mx-auto px-6 py-8">
          {editingTemplate ? (
            <div className="anim-fade-up">
              <button
                onClick={() => setEditingTemplate(null)}
                className="flex items-center gap-2 text-white/30 text-sm mb-6 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Retour aux templates
              </button>

              <div
                className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <h2 className="text-white font-bold text-base mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
                  {TEMPLATE_LABELS[editingTemplate]}
                </h2>

                {/* Variable helper */}
                <div className="flex flex-wrap gap-2 mb-5 mt-3">
                  {TEMPLATE_VARS.map((v) => (
                    <button
                      key={v}
                      onClick={() => {
                        const el = document.getElementById("tpl-body") as HTMLTextAreaElement;
                        if (el) {
                          const start = el.selectionStart;
                          const end = el.selectionEnd;
                          const val = templateDraft.body;
                          setTemplateDraft({
                            ...templateDraft,
                            body: val.slice(0, start) + v + val.slice(end),
                          });
                          setTimeout(() => el.setSelectionRange(start + v.length, start + v.length), 0);
                        }
                      }}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold transition-all hover:opacity-80"
                      style={{ background: "rgba(181,228,103,0.1)", color: "#B5E467", border: "1px solid rgba(181,228,103,0.2)" }}
                    >
                      {v}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Objet</label>
                    <input
                      type="text"
                      value={templateDraft.subject}
                      onChange={(e) => setTemplateDraft({ ...templateDraft, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#B5E467]/40"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Corps de l&apos;email</label>
                    <textarea
                      id="tpl-body"
                      value={templateDraft.body}
                      onChange={(e) => setTemplateDraft({ ...templateDraft, body: e.target.value })}
                      rows={14}
                      className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#B5E467]/40 resize-none font-mono"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => {
                      setTemplateDraft({ ...DEFAULT_TEMPLATES[editingTemplate] });
                    }}
                    className="px-4 py-2.5 rounded-xl text-[11px] font-semibold transition-all"
                    style={{ border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.3)", background: "transparent" }}
                  >
                    Réinitialiser
                  </button>
                  <button
                    onClick={() => setEditingTemplate(null)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.4)", background: "transparent" }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={saveTemplate}
                    className="flex-1 py-2.5 rounded-xl text-sm btn-lime font-bold"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 anim-fade-up">
              <p className="text-white/25 text-sm mb-6 leading-relaxed">
                Personnalisez vos modèles d&apos;emails de suivi. Les variables entre <code className="text-[#B5E467] text-xs">{"{{  }}"}</code> sont remplacées automatiquement lors de l&apos;envoi.
              </p>
              {(Object.entries(TEMPLATE_LABELS) as [keyof Templates, string][]).map(([key, label]) => (
                <div
                  key={key}
                  className="rounded-2xl p-5 cursor-pointer transition-all hover:border-[rgba(181,228,103,0.2)]"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  onClick={() => startEditTemplate(key)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-[13px] mb-1" style={{ fontFamily: "Syne, sans-serif" }}>{label}</h3>
                      <p className="text-white/30 text-xs truncate">{templates[key].subject}</p>
                      <p className="text-white/20 text-xs mt-1 line-clamp-2 leading-relaxed">{templates[key].body.slice(0, 100)}…</p>
                    </div>
                    <div className="ml-4 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="relative z-10 mt-auto" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-white/20 text-[11px]">Prodige RH — Laval (53)</p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B5E467] anim-pulse-lime" />
            <span className="text-white/20 text-[11px]">Suivi onboarding</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ── Reminder Card ────────────────────────────────── */
function ReminderCard({
  label, date, status, sentAt, email, onSend, onMark, disabled,
}: {
  label: string;
  date: string;
  status: ReminderStatus;
  sentAt?: string;
  email: string;
  onSend: () => void;
  onMark: () => void;
  disabled: boolean;
}) {
  return (
    <div
      className="rounded-xl p-3 flex flex-col gap-2"
      style={{
        background: status === "overdue"
          ? "rgba(239,68,68,0.06)"
          : status === "due_soon"
          ? "rgba(251,191,36,0.06)"
          : status === "sent"
          ? "rgba(181,228,103,0.04)"
          : "rgba(255,255,255,0.03)",
        border: status === "overdue"
          ? "1px solid rgba(239,68,68,0.18)"
          : status === "due_soon"
          ? "1px solid rgba(251,191,36,0.18)"
          : status === "sent"
          ? "1px solid rgba(181,228,103,0.15)"
          : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div>
        <p className="text-white/60 text-[11px] font-semibold mb-0.5">{label}</p>
        <p className="text-white/25 text-[10px]">{formatDate(date)}</p>
      </div>
      <ReminderBadge status={status} dueDate={date} />
      {sentAt && (
        <p className="text-white/20 text-[10px]">
          {new Date(sentAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
        </p>
      )}
      {!disabled && status !== "sent" && (
        <div className="flex flex-col gap-1.5 mt-1">
          {email ? (
            <button
              onClick={onSend}
              className="w-full px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all"
              style={
                status === "overdue"
                  ? { background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }
                  : { background: "rgba(181,228,103,0.10)", color: "#B5E467", border: "1px solid rgba(181,228,103,0.2)" }
              }
            >
              Envoyer email
            </button>
          ) : null}
          <button
            onClick={onMark}
            className="w-full px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
            style={{ background: "transparent", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Marquer envoyé
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Form helpers ─────────────────────────────────── */
function FieldGroup({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3">
        {label}
        {required && <span className="text-[#B5E467] ml-1">*</span>}
      </p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function FormInput({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-white/30 text-[10px] font-semibold mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#B5E467]/40"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
      />
    </div>
  );
}

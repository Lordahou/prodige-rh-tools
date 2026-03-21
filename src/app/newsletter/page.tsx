"use client";

import { useState, useEffect } from "react";
import ModuleLayout from "@/components/ModuleLayout";

interface ClientRow {
  nom: string;
  ville?: string;
  factureeTTC?: number;
  factureeHT?: number;
  encaisse?: number;
  encours?: number;
  statut?: string;
}

interface GeneratedEmail {
  sujet: string;
  corps: string;
}

function CopyButton({ text, label = "Copier" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handle}
      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all"
      style={{
        background: copied ? "rgba(181,228,103,0.15)" : "rgba(8,31,52,0.06)",
        color: copied ? "#3d6b0f" : "#034B5C",
        border: `1px solid ${copied ? "rgba(181,228,103,0.3)" : "rgba(3,75,92,0.15)"}`,
      }}
    >
      {copied
        ? <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>Copié !</>
        : <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" /></svg>{label}</>
      }
    </button>
  );
}

const ANGLES = [
  { value: "insight", label: "Insight RH du moment", desc: "Partage une tendance locale utile pour leur recrutement", icon: "💡" },
  { value: "mission", label: "Proposition nouvelle mission", desc: "Suggère d'ouvrir un nouveau recrutement", icon: "🎯" },
  { value: "relance", label: "Relance douce encours", desc: "Rappel bienveillant d'un paiement en attente", icon: "💬" },
  { value: "suivi", label: "Suivi post-recrutement", desc: "Prise de nouvelles et fidélisation", icon: "🤝" },
];

function fmt(n: number) {
  return Math.round(n).toLocaleString("fr-FR") + " €";
}

function ClientCard({
  client,
  selected,
  onSelect,
  email,
  loading,
  angle,
}: {
  client: ClientRow;
  selected: boolean;
  onSelect: () => void;
  email: GeneratedEmail | null;
  loading: boolean;
  angle: string;
}) {
  const encours = Number(client.encours ?? 0);
  const factureeTTC = Number(client.factureeTTC ?? 0);
  const encaisse = Number(client.encaisse ?? 0);
  const tauxEncaissement = factureeTTC > 0 ? Math.round((encaisse / factureeTTC) * 100) : 0;
  const enRetard = String(client.statut ?? "").toLowerCase().includes("retard");

  return (
    <div
      className={`rounded-2xl transition-all cursor-pointer ${selected ? "ring-2 ring-[#B5E467]" : "hover:shadow-md"}`}
      style={{
        background: selected ? "rgba(181,228,103,0.06)" : "white",
        boxShadow: selected ? "0 0 0 2px #B5E467" : "0 2px 8px rgba(8,31,52,0.06)",
      }}
    >
      {/* Client header */}
      <div className="p-5" onClick={onSelect}>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-bold text-[#081F34] text-base">{client.nom}</h3>
            {client.ville && <p className="text-xs text-gray-400 mt-0.5">{client.ville}</p>}
          </div>
          <div className="flex items-center gap-2">
            {enRetard && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-bold shrink-0">En retard</span>
            )}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? "border-[#B5E467] bg-[#B5E467]" : "border-[#e8e2d8]"}`}>
              {selected && <svg className="w-3 h-3 text-[#081F34]" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>}
            </div>
          </div>
        </div>

        {/* KPIs */}
        {factureeTTC > 0 && (
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#faf8f5] rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-gray-400 font-medium mb-0.5">CA facturé</p>
              <p className="text-sm font-bold text-[#081F34]">{fmt(factureeTTC)}</p>
            </div>
            <div className="bg-[#faf8f5] rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-gray-400 font-medium mb-0.5">Encaissé</p>
              <p className={`text-sm font-bold ${tauxEncaissement >= 80 ? "text-[#3d6b0f]" : tauxEncaissement >= 50 ? "text-orange-600" : "text-red-600"}`}>
                {tauxEncaissement}%
              </p>
            </div>
            <div className={`rounded-xl p-2.5 text-center ${encours > 0 ? (enRetard ? "bg-red-50" : "bg-orange-50") : "bg-[#faf8f5]"}`}>
              <p className="text-[10px] text-gray-400 font-medium mb-0.5">Encours</p>
              <p className={`text-sm font-bold ${encours > 0 ? (enRetard ? "text-red-600" : "text-orange-600") : "text-gray-400"}`}>
                {encours > 0 ? fmt(encours) : "—"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Email result */}
      {selected && (
        <div className="border-t border-[#e8e2d8] px-5 pb-5 pt-4">
          {loading ? (
            <div className="flex items-center gap-2 py-3">
              <span className="animate-spin w-4 h-4 border-2 border-[#034B5C] border-t-transparent rounded-full flex-shrink-0" />
              <p className="text-sm text-[#034B5C]">Rédaction en cours...</p>
            </div>
          ) : email ? (
            <div className="space-y-3">
              {/* Sujet */}
              <div className="bg-[#034B5C] rounded-xl p-3 text-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/40 text-[10px] font-bold uppercase tracking-wide">Objet</span>
                  <CopyButton text={email.sujet} />
                </div>
                <p className="text-white font-semibold text-sm">{email.sujet}</p>
              </div>
              {/* Corps */}
              <div className="bg-[#faf8f5] rounded-xl p-4 border border-[#e8e2d8]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Corps de l&apos;email</span>
                  <div className="flex items-center gap-2">
                    <CopyButton text={`Objet : ${email.sujet}\n\n${email.corps}`} label="Tout copier" />
                    <CopyButton text={email.corps} label="Corps seul" />
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{email.corps}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 py-2">
              <span className="text-[10px] text-gray-400">Sélectionnez un angle puis cliquez sur &quot;Générer les emails&quot;</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function NewsletterPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [snapshotDate, setSnapshotDate] = useState<string | null>(null);
  const [loadingClients, setLoadingClients] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [angle, setAngle] = useState("insight");
  const [emails, setEmails] = useState<Record<string, GeneratedEmail>>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [globalLoading, setGlobalLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/newsletter");
        if (res.ok) {
          const json = await res.json();
          setClients(json.clients ?? []);
          setSnapshotDate(json.snapshot_date ?? null);
          // Auto-select top 5
          const top5 = (json.clients ?? []).slice(0, 5).map((c: ClientRow) => c.nom);
          setSelectedIds(new Set(top5));
        }
      } catch {
        // no snapshot
      } finally {
        setLoadingClients(false);
      }
    };
    load();
  }, []);

  const toggleClient = (nom: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nom)) next.delete(nom);
      else next.add(nom);
      return next;
    });
  };

  const generateForClient = async (client: ClientRow): Promise<GeneratedEmail | null> => {
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client, angle }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return result.data as GeneratedEmail;
    } catch {
      return null;
    }
  };

  const handleGenerate = async () => {
    setGlobalLoading(true);
    setError("");
    const selectedClients = clients.filter((c) => selectedIds.has(c.nom));
    if (selectedClients.length === 0) {
      setError("Sélectionnez au moins un client.");
      setGlobalLoading(false);
      return;
    }

    // Generate sequentially to avoid rate limits
    for (const client of selectedClients) {
      setLoadingIds((prev) => new Set(prev).add(client.nom));
      const result = await generateForClient(client);
      if (result) {
        setEmails((prev) => ({ ...prev, [client.nom]: result }));
      }
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(client.nom);
        return next;
      });
    }
    setGlobalLoading(false);
  };

  const selectedCount = selectedIds.size;
  const generatedCount = Object.keys(emails).filter((k) => selectedIds.has(k)).length;

  return (
    <ModuleLayout
      title="Emails Clients"
      subtitle="Générez des emails personnalisés pour vos clients clés, basés sur leur situation réelle et la veille RH."
      badge={true}
      icon="envelope"
    >
      <div className="max-w-5xl mx-auto px-6 pt-6 pb-10">

        {/* No snapshot */}
        {!loadingClients && clients.length === 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center mb-6">
            <p className="font-bold text-orange-800 mb-1">Tableau de bord non chargé</p>
            <p className="text-sm text-orange-600">
              Importez vos exports Tiime dans le{" "}
              <a href="/dashboard" className="underline font-medium">Tableau de Bord</a>{" "}
              pour charger la liste de vos clients.
            </p>
          </div>
        )}

        {/* Snapshot info */}
        {snapshotDate && (
          <div className="flex items-center gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium bg-[#e8f5d0] text-[#3d6b0f]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3d6b0f]" />
              {clients.length} clients — données du {new Date(snapshotDate).toLocaleDateString("fr-FR")}
            </span>
          </div>
        )}

        {clients.length > 0 && (
          <>
            {/* Angle selector */}
            <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
              <h3 className="font-bold text-[#081F34] text-sm mb-3">Angle de l&apos;email</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {ANGLES.map((a) => (
                  <button
                    key={a.value}
                    onClick={() => setAngle(a.value)}
                    className={`text-left px-4 py-3 rounded-xl border transition-all ${
                      angle === a.value
                        ? "border-[#B5E467] bg-[#B5E467]/8"
                        : "border-[#e8e2d8] hover:border-[#034B5C]/20"
                    }`}
                    style={angle === a.value ? { background: "rgba(181,228,103,0.08)" } : {}}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{a.icon}</span>
                      <div>
                        <p className={`text-sm font-bold ${angle === a.value ? "text-[#3d6b0f]" : "text-[#081F34]"}`}>{a.label}</p>
                        <p className="text-[11px] text-gray-400">{a.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions bar */}
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-500">
                  <span className="font-bold text-[#081F34]">{selectedCount}</span> client{selectedCount > 1 ? "s" : ""} sélectionné{selectedCount > 1 ? "s" : ""}
                  {generatedCount > 0 && <span className="text-[#3d6b0f] ml-2">· {generatedCount} email{generatedCount > 1 ? "s" : ""} généré{generatedCount > 1 ? "s" : ""}</span>}
                </p>
                <button
                  onClick={() => setSelectedIds(new Set(clients.map((c) => c.nom)))}
                  className="text-xs text-[#034B5C] hover:underline"
                >
                  Tout sélectionner
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="text-xs text-gray-400 hover:underline"
                >
                  Désélectionner
                </button>
              </div>
              <button
                onClick={handleGenerate}
                disabled={globalLoading || selectedCount === 0}
                className="bg-[#B5E467] text-[#081F34] px-6 py-2.5 rounded-full font-bold text-sm hover:shadow-lg hover:shadow-[#B5E467]/30 transition-all disabled:opacity-40 flex items-center gap-2"
              >
                {globalLoading ? (
                  <><span className="animate-spin w-4 h-4 border-2 border-[#081F34] border-t-transparent rounded-full inline-block" />Génération en cours...</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg>Générer les emails ({selectedCount})</>
                )}
              </button>
            </div>

            {error && <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>}

            {/* Client list */}
            <div className="space-y-3">
              {clients.map((client) => (
                <ClientCard
                  key={client.nom}
                  client={client}
                  selected={selectedIds.has(client.nom)}
                  onSelect={() => toggleClient(client.nom)}
                  email={emails[client.nom] ?? null}
                  loading={loadingIds.has(client.nom)}
                  angle={angle}
                />
              ))}
            </div>
          </>
        )}

        {/* Loading skeleton */}
        {loadingClients && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse" style={{ boxShadow: "0 2px 8px rgba(8,31,52,0.06)" }}>
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((j) => <div key={j} className="h-12 bg-gray-50 rounded-xl" />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}

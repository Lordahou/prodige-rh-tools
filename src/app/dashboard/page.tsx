"use client";

import { useState, useMemo } from "react";
import ModuleLayout from "@/components/ModuleLayout";
import * as XLSX from "xlsx";

interface ClientData {
  nom: string;
  factureeTTC: number;
  factureeHT: number;
  encaisse: number;
  encours: number;
  statut: string;
  ville: string;
}

interface FactureData {
  date: string;
  numero: string;
  statut: string;
  client: string;
  montantTTC: number;
  montantHT: number;
}

interface ActionPlan {
  rang: number;
  titre: string;
  description: string;
  impact: string;
  urgence: "haute" | "moyenne" | "faible";
}

function parseClientsFile(workbook: XLSX.WorkBook): ClientData[] {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  return json.map((row) => {
    const get = (key: string) => {
      if (row[key] !== undefined) return row[key];
      const k = Object.keys(row).find((c) => c.trim().toLowerCase() === key.trim().toLowerCase());
      return k ? row[k] : undefined;
    };
    return {
      nom: String(
        get("nom du client") || get("nom") || get("client") ||
        get("raison sociale") || get("raison_sociale") || ""
      ).trim(),
      factureeTTC: Number(get("facturé ttc") ?? get("facture ttc") ?? get("total ttc") ?? 0),
      factureeHT: Number(get("facturé ht") ?? get("facture ht") ?? get("total ht") ?? 0),
      encaisse: Number(get("encaissé") ?? get("encaisse") ?? 0),
      encours: Number(get("encours") ?? 0),
      statut: String(get("statut") || "").trim(),
      ville: String(get("ville") || "").trim(),
    };
  }).filter((c) => c.nom);
}

function parseFacturesFile(workbook: XLSX.WorkBook): FactureData[] {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  return json.map((row) => {
    // Normalize keys: trim spaces for lookup
    const get = (key: string) => {
      if (row[key] !== undefined) return row[key];
      // Try trimmed match (handles trailing spaces in Tiime exports)
      const trimmedKey = Object.keys(row).find((k) => k.trim().toLowerCase() === key.trim().toLowerCase());
      return trimmedKey ? row[trimmedKey] : undefined;
    };

    const dateRaw = get("date de facture");
    let dateStr = "";
    if (typeof dateRaw === "number") {
      const d = XLSX.SSF.parse_date_code(dateRaw);
      dateStr = `${String(d.d).padStart(2, "0")}/${String(d.m).padStart(2, "0")}/${d.y}`;
    } else if (dateRaw) {
      dateStr = String(dateRaw);
    }

    const numRaw = get("numéro de facture");
    const numero = numRaw && !isNaN(Number(numRaw))
      ? `#${Math.round(Number(numRaw))}`
      : "Brouillon";

    return {
      date: dateStr,
      numero,
      statut: String(get("statut de la facture") || ""),
      client: String(get("nom du client") || get("client") || get("nom") || "").trim(),
      montantTTC: Number(get("montant TTC") ?? 0),
      montantHT: Number(get("montant HT") ?? 0),
    };
  }).filter((f) => f.client);
}

export default function DashboardPage() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [factures, setFactures] = useState<FactureData[]>([]);
  const [clientsFileName, setClientsFileName] = useState("");
  const [facturesFileName, setFacturesFileName] = useState("");
  const [objectifCA, setObjectifCA] = useState(300000);
  const [joursProd, setJoursProd] = useState(120);
  const [aiPlan, setAiPlan] = useState<ActionPlan[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiError, setAiError] = useState("");

  const handleUpload = (type: "clients" | "factures") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: "array" });
        if (type === "clients") {
          setClients(parseClientsFile(wb));
          setClientsFileName(file.name);
        } else {
          setFactures(parseFacturesFile(wb));
          setFacturesFileName(file.name);
        }
      } catch (err) {
        alert(`Erreur lecture fichier ${type}`);
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const kpis = useMemo(() => {
    if (clients.length === 0) return null;

    const totalFactureTTC = clients.reduce((s, c) => s + c.factureeTTC, 0);
    const totalFactureHT = clients.reduce((s, c) => s + c.factureeHT, 0);
    const totalEncaisse = clients.reduce((s, c) => s + c.encaisse, 0);
    const totalEncours = clients.reduce((s, c) => s + c.encours, 0);
    const tauxEncaissement = totalFactureTTC > 0 ? totalEncaisse / totalFactureTTC : 0;
    const nbClients = clients.length;
    const nbClientsEnRetard = clients.filter((c) => c.statut.toLowerCase().includes("retard")).length;
    const nbClientsAJour = clients.filter((c) => c.statut.toLowerCase().includes("jour")).length;
    const clientsEnRetard = clients.filter((c) => c.statut.toLowerCase().includes("retard"));
    const topClients = [...clients].sort((a, b) => b.factureeTTC - a.factureeTTC).slice(0, 5);

    const facturesActives = factures.filter((f) => f.statut !== "Brouillon" && f.statut !== "brouillon");
    const nbFactures = facturesActives.length;
    const montantMoyen = nbFactures > 0 ? facturesActives.reduce((s, f) => s + f.montantHT, 0) / nbFactures : 0;
    const nbAvoirs = factures.filter((f) => f.montantTTC < 0).length;
    const statutCounts = {
      payee: facturesActives.filter((f) => f.statut.toLowerCase().includes("pay")).length,
      envoyee: facturesActives.filter((f) => f.statut.toLowerCase().includes("envoy")).length,
      facturee: facturesActives.filter((f) => f.statut.toLowerCase() === "facturée" || f.statut.toLowerCase() === "facturee").length,
    };

    const parMoisMap = new Map<string, { facture: number; paye: number }>();
    facturesActives.forEach((f) => {
      const parts = f.date.split("/");
      if (parts.length >= 3) {
        const key = `${parts[1]}/${parts[2]}`;
        const curr = parMoisMap.get(key) || { facture: 0, paye: 0 };
        curr.facture += f.montantHT;
        if (f.statut.toLowerCase().includes("pay")) curr.paye += f.montantHT;
        parMoisMap.set(key, curr);
      }
    });
    const parMois = Array.from(parMoisMap.entries()).sort();

    const moisEcoules = new Date().getMonth() + 1;
    const objectifMensuel = objectifCA / 12;
    const cibleCumul = objectifMensuel * moisEcoules;
    const retardObjectif = cibleCumul - totalFactureTTC;
    const tjmActuel = joursProd > 0 && moisEcoules > 0
      ? totalFactureHT / (joursProd * (moisEcoules / 12))
      : 0;
    const tjmObjectif = joursProd > 0 ? objectifCA / joursProd : 0;
    const resteAFacturer = Math.max(0, objectifCA - totalFactureTTC);
    const moisRestants = 12 - moisEcoules;
    const joursProdRestants = joursProd * (moisRestants / 12);
    const tjmNecessaire = joursProdRestants > 0 ? resteAFacturer / joursProdRestants : 0;

    const exerciceYear = parMoisMap.size > 0
      ? (Array.from(parMoisMap.keys()).sort().at(-1)?.split("/")?.[1] ?? String(new Date().getFullYear()))
      : String(new Date().getFullYear());
    const MOIS_KEYS = ["01","02","03","04","05","06","07","08","09","10","11","12"];
    let cumulCA = 0;
    const caRealCumulatif = MOIS_KEYS.map((m) => {
      const d = parMoisMap.get(`${m}/${exerciceYear}`);
      cumulCA += d?.facture ?? 0;
      return cumulCA;
    });

    return {
      totalFactureTTC, totalFactureHT, totalEncaisse, totalEncours,
      tauxEncaissement, nbClients, nbClientsEnRetard, nbClientsAJour,
      clientsEnRetard, topClients, nbFactures, montantMoyen, nbAvoirs,
      statutCounts, parMois, moisEcoules, retardObjectif,
      tjmActuel, tjmObjectif, tjmNecessaire, resteAFacturer, cibleCumul,
      caRealCumulatif, exerciceYear,
    };
  }, [clients, factures, objectifCA, joursProd]);

  const handleAnalyze = async () => {
    if (!kpis) return;
    setAnalyzing(true);
    setAiError("");
    setAiPlan([]);
    try {
      const res = await fetch("/api/analyze-tiime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kpis, context: { objectifCA, joursProd } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAiPlan(data.actions || []);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setAnalyzing(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  const pct = (v: number, t: number) => (t > 0 ? Math.round((v / t) * 100) : 0);

  const inputClass = "w-full border border-[#d5cec0] bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B5E467] focus:border-transparent";

  const urgenceStyle: Record<string, string> = {
    haute: "bg-red-100 text-red-700",
    moyenne: "bg-orange-100 text-orange-700",
    faible: "bg-[#e8f5d0] text-[#3d6b0f]",
  };

  return (
    <ModuleLayout
      title="Tableau de Bord"
      subtitle="Importez vos exports Tiime et pilotez votre activité : CA, pipeline, recouvrement, TJM."
      badge={true}
      icon="chart"
    >
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Config + Import */}
        <div className="bg-white rounded-2xl p-6 mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <h2 className="text-sm font-bold text-[#081F34] uppercase tracking-wider mb-4">Configuration & Import Tiime</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Config */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#081F34] mb-1.5">Objectif CA annuel (€)</label>
                  <input type="number" value={objectifCA} onChange={(e) => setObjectifCA(Number(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#081F34] mb-1.5">Jours de prod / an</label>
                  <input type="number" value={joursProd} onChange={(e) => setJoursProd(Number(e.target.value))} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Import */}
            <div className="grid grid-cols-2 gap-3">
              {(["clients", "factures"] as const).map((type) => {
                const fileName = type === "clients" ? clientsFileName : facturesFileName;
                const isLoaded = type === "clients" ? clients.length > 0 : factures.length > 0;
                const count = type === "clients" ? clients.length : factures.length;
                return (
                  <label key={type} className={`flex flex-col gap-1.5 cursor-pointer border-2 rounded-xl p-3 transition-all ${
                    isLoaded ? "border-[#B5E467] bg-[#e8f5d0]" : "border-dashed border-[#d5cec0] hover:border-[#034B5C]"
                  }`}>
                    <span className="text-xs font-bold text-[#081F34] capitalize">
                      Export {type === "clients" ? "Clients" : "Factures"}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {type === "clients" ? "modele_clients_tiime.xlsx" : "modele_factures_tiime.xlsx"}
                    </span>
                    {isLoaded ? (
                      <div>
                        <p className="text-xs text-[#3d6b0f] font-medium truncate">{fileName}</p>
                        <p className="text-[10px] text-[#3d6b0f]">{count} {type === "clients" ? "clients" : "factures"}</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[#034B5C]">
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                        <span className="text-xs font-medium">Importer</span>
                      </div>
                    )}
                    <input type="file" accept=".xlsx,.xls,.csv" onChange={handleUpload(type)} className="hidden" />
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {kpis ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "CA Facturé TTC", value: fmt(kpis.totalFactureTTC), sub: `${pct(kpis.totalFactureTTC, objectifCA)}% de l'objectif`, color: "bg-[#034B5C]", text: "text-white" },
                { label: "CA Encaissé", value: fmt(kpis.totalEncaisse), sub: `Taux : ${(kpis.tauxEncaissement * 100).toFixed(0)}%`, color: "bg-[#B5E467]", text: "text-[#081F34]" },
                { label: "Encours (impayés)", value: fmt(kpis.totalEncours), sub: kpis.nbClientsEnRetard > 0 ? `${kpis.nbClientsEnRetard} client(s) en retard` : "Recouvrement OK", color: "bg-white", text: kpis.totalEncours > 0 ? "text-red-500" : "text-green-600" },
                { label: "Panier moyen", value: fmt(kpis.totalFactureTTC / kpis.nbClients), sub: `${kpis.nbClients} clients actifs`, color: "bg-white", text: "text-[#081F34]" },
              ].map((kpi) => (
                <div key={kpi.label} className={`${kpi.color} rounded-2xl p-5`} style={{ boxShadow: "var(--shadow-card)" }}>
                  <p className={`text-xs uppercase tracking-wider font-semibold mb-1 ${kpi.color === "bg-white" ? "text-gray-500" : kpi.text === "text-white" ? "text-white/70" : "text-[#081F34]/60"}`}>{kpi.label}</p>
                  <p className={`text-2xl font-extrabold ${kpi.text}`}>{kpi.value}</p>
                  {kpi.sub && <p className={`text-xs mt-1 ${kpi.color === "bg-white" ? "text-gray-400" : kpi.text === "text-white" ? "text-white/50" : "text-[#081F34]/40"}`}>{kpi.sub}</p>}
                </div>
              ))}
            </div>

            {/* Courbe CA Réel vs Objectif */}
            <div className="bg-white rounded-2xl p-6 mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-lg font-bold text-[#081F34]">
                    CA Réel vs Objectif
                    <span className="text-gray-400 text-sm font-normal ml-2">{kpis.exerciceYear}</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Cumul facturé HT mensuel — Jan → Déc</p>
                </div>
                <div className="flex items-center gap-5 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <svg width="28" height="12" className="shrink-0"><line x1="0" y1="6" x2="28" y2="6" stroke="#B5E467" strokeWidth="2.5" strokeLinecap="round" /></svg>
                    CA Réel cumulé
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg width="28" height="12" className="shrink-0"><line x1="0" y1="6" x2="28" y2="6" stroke="#034B5C" strokeWidth="2" strokeDasharray="5,3" /></svg>
                    Objectif linéaire
                  </span>
                </div>
              </div>
              {(() => {
                const LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
                const VW = 800, VH = 200, PL = 60, PT = 16, PR = 20, PB = 32;
                const cW = VW - PL - PR, cH = VH - PT - PB;
                const maxY = objectifCA * 1.08;
                const xAt = (i: number) => PL + (i / 11) * cW;
                const yAt = (v: number) => PT + cH - Math.max(0, Math.min(1, v / maxY)) * cH;
                const objPts = Array.from({ length: 12 }, (_, i) =>
                  `${xAt(i)},${yAt((objectifCA / 12) * (i + 1))}`
                ).join(" ");
                const n = kpis.moisEcoules;
                const realArr = kpis.caRealCumulatif.slice(0, n);
                const realPts = realArr.map((v, i) => `${xAt(i)},${yAt(v)}`);
                const areaPts = n > 0
                  ? [`${xAt(0)},${PT + cH}`, ...realPts, `${xAt(n - 1)},${PT + cH}`].join(" ")
                  : "";
                const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({
                  y: yAt(objectifCA * f),
                  label: f === 0 ? "0" : `${Math.round(objectifCA * f / 1000)}k`,
                }));
                return (
                  <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full" style={{ height: 200, display: "block" }}>
                    {yTicks.map(({ y, label }) => (
                      <g key={label}>
                        <line x1={PL} x2={VW - PR} y1={y} y2={y} stroke="#f0ebe3" strokeWidth="1" />
                        <text x={PL - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{label}</text>
                      </g>
                    ))}
                    {LABELS.map((l, i) => (
                      <text key={l} x={xAt(i)} y={VH - 6} textAnchor="middle" fontSize="10"
                        fill={i < n ? "#6b7280" : "#d1d5db"}>{l}</text>
                    ))}
                    {n > 0 && <polygon points={areaPts} fill="#B5E467" fillOpacity="0.12" />}
                    <polyline points={objPts} fill="none" stroke="#034B5C" strokeWidth="1.5"
                      strokeDasharray="6,4" opacity="0.7" />
                    {n > 0 && (
                      <polyline points={realPts.join(" ")} fill="none" stroke="#B5E467"
                        strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                    )}
                    {realArr.map((v, i) => (
                      <g key={i}>
                        <circle cx={xAt(i)} cy={yAt(v)} r="4" fill="#B5E467" stroke="white" strokeWidth="2" />
                        {i === n - 1 && (
                          <text x={xAt(i)} y={yAt(v) - 10} textAnchor="middle" fontSize="10"
                            fill="#4d7c0f" fontWeight="bold">{Math.round(v / 1000)}k€</text>
                        )}
                      </g>
                    ))}
                    <text x={xAt(11)} y={yAt(objectifCA) - 8} textAnchor="end"
                      fontSize="10" fill="#034B5C" fontWeight="bold"
                    >{Math.round(objectifCA / 1000)}k€</text>
                  </svg>
                );
              })()}
            </div>

            {/* Progression + TJM */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Progression objectif */}
              <div className="md:col-span-2 bg-white rounded-2xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                <h2 className="text-lg font-bold text-[#081F34] mb-4">Progression vs objectif</h2>
                <div className="relative h-8 bg-[#e8e2d8] rounded-full overflow-hidden mb-3">
                  <div className="absolute inset-y-0 left-0 bg-[#034B5C] rounded-full transition-all"
                    style={{ width: `${Math.min(pct(kpis.totalFactureTTC, objectifCA), 100)}%` }} />
                  <div className="absolute inset-y-0 left-0 bg-[#B5E467] rounded-full transition-all"
                    style={{ width: `${Math.min(pct(kpis.totalEncaisse, objectifCA), 100)}%` }} />
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white mix-blend-difference">
                    {fmt(kpis.totalFactureTTC)} / {fmt(objectifCA)}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  {[
                    { label: "Cible cumulée", value: fmt(kpis.cibleCumul) },
                    { label: "Reste à facturer", value: fmt(kpis.resteAFacturer) },
                    { label: kpis.retardObjectif > 0 ? "Retard/objectif" : "Avance/objectif", value: fmt(Math.abs(kpis.retardObjectif)), danger: kpis.retardObjectif > 0 },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#faf8f5] rounded-xl p-3 border border-[#e8e2d8]">
                      <span className="text-gray-500 text-xs">{item.label}</span>
                      <p className={`font-bold text-sm ${item.danger ? "text-red-500" : "text-[#081F34]"}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* TJM */}
              <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                <h2 className="text-lg font-bold text-[#081F34] mb-4">Indicateurs TJM</h2>
                <div className="space-y-3">
                  {[
                    { label: "TJM actuel", value: fmt(kpis.tjmActuel), bg: "bg-[#034B5C]", text: "text-white" },
                    { label: "TJM objectif", value: fmt(kpis.tjmObjectif), bg: "bg-[#B5E467]", text: "text-[#081F34]" },
                    { label: "TJM rattrapage", value: fmt(kpis.tjmNecessaire), bg: kpis.tjmNecessaire > kpis.tjmObjectif ? "bg-red-500" : "bg-green-500", text: "text-white" },
                  ].map((item) => (
                    <div key={item.label} className={`flex items-center justify-between px-4 py-3 rounded-xl ${item.bg}`}>
                      <span className={`text-xs font-semibold ${item.text}/80`}>{item.label}</span>
                      <span className={`font-extrabold ${item.text}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Statuts factures + Clients en retard */}
            {factures.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Funnel factures */}
                <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                  <h2 className="text-lg font-bold text-[#081F34] mb-4">Statut des factures</h2>
                  <div className="space-y-3">
                    {[
                      { label: "Payées", count: kpis.statutCounts.payee, color: "bg-[#B5E467]", text: "text-[#3d6b0f]" },
                      { label: "Envoyées (en attente)", count: kpis.statutCounts.envoyee, color: "bg-orange-200", text: "text-orange-700" },
                      { label: "Émises (non envoyées)", count: kpis.statutCounts.facturee, color: "bg-gray-200", text: "text-gray-700" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center font-bold text-sm ${item.text}`}>{item.count}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-[#081F34]">{item.label}</span>
                            <span className="text-xs text-gray-500">{pct(item.count, kpis.nbFactures)}%</span>
                          </div>
                          <div className="h-2 bg-[#f0ebe3] rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct(item.count, kpis.nbFactures)}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-[#e8e2d8] flex items-center justify-between text-xs text-gray-500">
                      <span>{kpis.nbFactures} factures au total</span>
                      {kpis.nbAvoirs > 0 && <span className="text-orange-500">{kpis.nbAvoirs} avoir(s)</span>}
                      {kpis.montantMoyen > 0 && <span>Moy : {fmt(kpis.montantMoyen)}</span>}
                    </div>
                  </div>
                </div>

                {/* Clients en retard */}
                <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                  <h2 className="text-lg font-bold text-[#081F34] mb-4">
                    Recouvrement
                    {kpis.nbClientsEnRetard > 0 && (
                      <span className="ml-2 text-sm text-red-500 font-normal">{kpis.nbClientsEnRetard} en retard</span>
                    )}
                  </h2>
                  {kpis.clientsEnRetard.length === 0 ? (
                    <div className="flex items-center gap-3 py-4">
                      <div className="w-10 h-10 rounded-full bg-[#e8f5d0] flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#3d6b0f]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                      </div>
                      <p className="text-sm text-green-700 font-medium">Tous les clients sont à jour</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {kpis.clientsEnRetard.map((c) => (
                        <div key={c.nom} className="flex items-center justify-between border-l-4 border-red-400 pl-3 py-1">
                          <div>
                            <p className="text-sm font-semibold text-[#081F34]">{c.nom}</p>
                            <p className="text-xs text-gray-400">{c.ville}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-500">{fmt(c.encours)}</p>
                            <p className="text-xs text-gray-400">encours</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 pt-3 border-t border-[#e8e2d8] flex justify-between text-xs text-gray-500">
                    <span>{kpis.nbClientsAJour} clients à jour</span>
                    <span>Taux encaissement : <strong className="text-[#081F34]">{(kpis.tauxEncaissement * 100).toFixed(0)}%</strong></span>
                  </div>
                </div>
              </div>
            )}

            {/* Top 5 clients + CA mensuel */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                <h2 className="text-lg font-bold text-[#081F34] mb-4">Top 5 clients</h2>
                <div className="space-y-3">
                  {kpis.topClients.map((c, idx) => (
                    <div key={c.nom} className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-[#034B5C] text-[#B5E467] text-xs flex items-center justify-center font-bold shrink-0">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-medium text-[#081F34] min-w-0 truncate">{c.nom}</span>
                          <span className="font-bold text-[#081F34] ml-2 shrink-0">{fmt(c.factureeTTC)}</span>
                        </div>
                        <div className="h-1.5 bg-[#f0ebe3] rounded-full overflow-hidden">
                          <div className="h-full bg-[#B5E467] rounded-full" style={{ width: `${pct(c.factureeTTC, kpis.topClients[0].factureeTTC)}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {kpis.parMois.length > 0 ? (
                <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                  <h2 className="text-lg font-bold text-[#081F34] mb-4">CA mensuel HT</h2>
                  <div className="flex items-end gap-2 h-44">
                    {kpis.parMois.map(([mois, data]) => {
                      const maxCA = Math.max(...kpis.parMois.map(([, d]) => d.facture));
                      const hF = maxCA > 0 ? (data.facture / maxCA) * 100 : 0;
                      const hP = maxCA > 0 ? (data.paye / maxCA) * 100 : 0;
                      return (
                        <div key={mois} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[10px] font-bold text-[#081F34]">{fmt(data.facture)}</span>
                          <div className="w-full relative flex items-end" style={{ height: "100px" }}>
                            <div className="w-full bg-[#034B5C]/20 rounded-t-lg" style={{ height: `${hF}%` }} />
                            <div className="absolute bottom-0 left-0 right-0 bg-[#B5E467] rounded-t-lg transition-all" style={{ height: `${hP}%` }} />
                          </div>
                          <span className="text-[10px] text-gray-500 font-medium">{mois}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#034B5C]/20 inline-block" />Facturé</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#B5E467] inline-block" />Encaissé</span>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 flex items-center justify-center" style={{ boxShadow: "var(--shadow-card)" }}>
                  <p className="text-sm text-gray-400 text-center">Importez le fichier Factures<br />pour voir le CA mensuel</p>
                </div>
              )}
            </div>

            {/* Détail factures */}
            {factures.length > 0 && (
              <div className="bg-white rounded-2xl p-6 mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
                <h2 className="text-lg font-bold text-[#081F34] mb-4">Détail des factures ({factures.filter(f => f.statut !== "Brouillon").length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-[#e8e2d8]">
                        {["N°", "Client", "Date", "Montant HT", "Montant TTC", "Statut"].map((h) => (
                          <th key={h} className={`py-3 px-2 text-xs uppercase tracking-wider text-gray-500 font-semibold ${h === "Montant HT" || h === "Montant TTC" ? "text-right" : h === "Statut" ? "text-center" : "text-left"}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {factures.filter(f => f.statut !== "Brouillon").map((f, i) => (
                        <tr key={i} className="border-b border-[#f0ebe3] hover:bg-[#faf8f5]">
                          <td className="py-3 px-2 font-medium text-gray-500">{f.numero}</td>
                          <td className="py-3 px-2 font-medium text-[#081F34]">{f.client}</td>
                          <td className="py-3 px-2 text-gray-500">{f.date}</td>
                          <td className={`py-3 px-2 text-right font-bold ${f.montantHT < 0 ? "text-red-500" : "text-[#081F34]"}`}>{fmt(f.montantHT)}</td>
                          <td className={`py-3 px-2 text-right ${f.montantTTC < 0 ? "text-red-400" : "text-gray-600"}`}>{fmt(f.montantTTC)}</td>
                          <td className="py-3 px-2 text-center">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                              f.statut.toLowerCase().includes("pay") ? "bg-[#e8f5d0] text-[#3d6b0f]" :
                              f.statut.toLowerCase().includes("envoy") ? "bg-orange-100 text-orange-600" :
                              f.montantTTC < 0 ? "bg-red-100 text-red-600" :
                              "bg-gray-100 text-gray-600"
                            }`}>{f.statut}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* IA Plan d'action */}
            <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-[#081F34]">
                    Top 5 plan d'action <span className="text-[#034B5C]">IA</span>
                  </h2>
                  <p className="text-sm text-gray-400">Analyse vos KPIs et propose les 5 actions prioritaires</p>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="bg-[#081F34] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[#034B5C] transition-all disabled:opacity-40 flex items-center gap-2 shrink-0"
                >
                  {analyzing ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" />
                      Analyse...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" /></svg>
                      Analyser avec l'IA
                    </>
                  )}
                </button>
              </div>

              {aiError && (
                <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 mb-4">{aiError}</div>
              )}

              {aiPlan.length > 0 ? (
                <div className="space-y-4">
                  {aiPlan.map((action) => (
                    <div key={action.rang} className="flex gap-4 p-4 rounded-2xl border border-[#e8e2d8] hover:border-[#B5E467] transition-colors bg-[#faf8f5]">
                      <div className="w-10 h-10 rounded-xl bg-[#081F34] text-[#B5E467] flex items-center justify-center font-extrabold text-lg shrink-0">
                        {action.rang}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <h3 className="font-bold text-[#081F34]">{action.titre}</h3>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${urgenceStyle[action.urgence] || urgenceStyle.faible}`}>
                              {action.urgence}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#034B5C]">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg>
                          {action.impact}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !analyzing && (
                <div className="text-center py-8 text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" /></svg>
                  <p className="text-sm">Cliquez sur "Analyser avec l'IA" pour générer votre plan d'action</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl p-14 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="w-20 h-20 rounded-2xl bg-[#034B5C] text-[#B5E467] flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#081F34] mb-2">
              Importez vos exports <span className="text-[#034B5C]">Tiime</span>
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">
              Exportez vos données depuis Tiime et importez les deux fichiers ci-dessus pour accéder à vos KPIs et au plan d'action IA.
            </p>
            <div className="grid md:grid-cols-2 gap-4 max-w-lg mx-auto text-left text-sm">
              {[
                { title: "modele_clients_tiime.xlsx", items: ["CA facturé / encaissé par client", "Encours et statuts de paiement"] },
                { title: "modele_factures_tiime.xlsx", items: ["Détail de chaque facture", "Répartition mensuelle du CA"] },
              ].map((f) => (
                <div key={f.title} className="bg-[#faf8f5] rounded-xl p-4 border border-[#e8e2d8]">
                  <p className="font-bold text-[#081F34] mb-2 text-xs">{f.title}</p>
                  {f.items.map((i) => (
                    <div key={i} className="flex items-start gap-2 text-gray-500 text-xs mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B5E467] mt-1 shrink-0" />
                      {i}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}

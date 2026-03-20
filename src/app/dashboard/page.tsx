"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";

interface Invoice {
  numero: string;
  client: string;
  date: string;
  montantHT: number;
  statut: string;
  type: string;
}

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [objectifCA, setObjectifCA] = useState(300000);
  const [joursOuvres, setJoursOuvres] = useState(220);
  const [joursProd, setJoursProd] = useState(120);
  const [fileName, setFileName] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

        const parsed: Invoice[] = json.map((row) => {
          const montantRaw = row["Montant HT"] || row["montant_ht"] || row["Total HT"] || row["Montant"] || 0;
          let montant = 0;
          if (typeof montantRaw === "number") {
            montant = montantRaw;
          } else if (typeof montantRaw === "string") {
            montant = parseFloat(montantRaw.replace(/[^\d.,-]/g, "").replace(",", ".")) || 0;
          }

          const statutRaw = String(row["Statut"] || row["statut"] || row["État"] || "");
          let statut = "En attente";
          const sl = statutRaw.toLowerCase();
          if (sl.includes("pay") || sl.includes("réglé") || sl.includes("encaiss")) {
            statut = "Payé";
          } else if (sl.includes("envoy") || sl.includes("émis")) {
            statut = "Envoyé";
          } else if (sl.includes("retard") || sl.includes("impay") || sl.includes("relance")) {
            statut = "En retard";
          } else if (sl.includes("brouillon")) {
            statut = "Brouillon";
          }

          const dateRaw = row["Date"] || row["date"] || row["Date d'émission"] || "";
          let dateStr = "";
          if (typeof dateRaw === "number") {
            const d = XLSX.SSF.parse_date_code(dateRaw);
            dateStr = `${String(d.d).padStart(2, "0")}/${String(d.m).padStart(2, "0")}/${d.y}`;
          } else {
            dateStr = String(dateRaw);
          }

          return {
            numero: String(row["Numéro"] || row["numero"] || row["N°"] || row["Référence"] || ""),
            client: String(row["Client"] || row["client"] || row["Nom"] || ""),
            date: dateStr,
            montantHT: montant,
            statut,
            type: String(row["Type"] || row["type"] || "Facture"),
          };
        }).filter((inv) => inv.statut !== "Brouillon");

        setInvoices(parsed);
      } catch (err) {
        alert("Erreur lors de la lecture du fichier. Verifiez le format.");
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const stats = useMemo(() => {
    if (invoices.length === 0) return null;

    const totalFacture = invoices.reduce((s, i) => s + i.montantHT, 0);
    const totalPaye = invoices.filter((i) => i.statut === "Payé").reduce((s, i) => s + i.montantHT, 0);
    const totalEnCours = invoices.filter((i) => i.statut === "Envoyé").reduce((s, i) => s + i.montantHT, 0);
    const totalRetard = invoices.filter((i) => i.statut === "En retard").reduce((s, i) => s + i.montantHT, 0);
    const nbClients = new Set(invoices.map((i) => i.client)).size;
    const panierMoyen = totalFacture / invoices.length;

    const moisEcoules = new Date().getMonth() + 1;
    const objectifMensuel = objectifCA / 12;
    const cibleCumul = objectifMensuel * moisEcoules;
    const retardObjectif = cibleCumul - totalFacture;

    const tjmActuel = totalFacture / (joursProd * (moisEcoules / 12));
    const tjmObjectif = objectifCA / joursProd;
    const resteAFacturer = objectifCA - totalFacture;
    const moisRestants = 12 - moisEcoules;
    const joursProdRestants = joursProd * (moisRestants / 12);
    const tjmNecessaire = joursProdRestants > 0 ? resteAFacturer / joursProdRestants : 0;

    const clientMap = new Map<string, number>();
    invoices.forEach((i) => {
      clientMap.set(i.client, (clientMap.get(i.client) || 0) + i.montantHT);
    });
    const topClients = Array.from(clientMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const alertes = invoices
      .filter((i) => i.statut === "En retard" || i.statut === "Envoyé")
      .sort((a, b) => b.montantHT - a.montantHT)
      .slice(0, 5);

    const parMois = new Map<string, number>();
    invoices.forEach((i) => {
      const parts = i.date.split("/");
      const moisKey = parts.length >= 2 ? `${parts[1]}/${parts[2] || "2026"}` : "Autre";
      parMois.set(moisKey, (parMois.get(moisKey) || 0) + i.montantHT);
    });

    return {
      totalFacture, totalPaye, totalEnCours, totalRetard,
      nbClients, panierMoyen, retardObjectif,
      tjmActuel, tjmObjectif, tjmNecessaire,
      topClients, alertes,
      parMois: Array.from(parMois.entries()).sort(),
      moisEcoules, resteAFacturer,
    };
  }, [invoices, objectifCA, joursProd]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  const pct = (value: number, total: number) =>
    total > 0 ? Math.round((value / total) * 100) : 0;

  const inputClass = "w-full border border-[#d5cec0] bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B5E467] focus:border-transparent";

  return (
    <main className="min-h-screen bg-[#f0ebe3]">
      <header className="bg-[#081F34]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-[#B5E467] hover:text-white transition-colors text-sm font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
            Retour
          </Link>
          <div className="h-5 w-px bg-gray-600" />
          <h1 className="text-lg font-bold text-white">
            Tableau de <span className="text-[#B5E467]">Bord</span>
          </h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Config + Import */}
        <div className="bg-white rounded-2xl p-6 mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-[#081F34] mb-1.5">Objectif CA annuel</label>
              <input type="number" value={objectifCA} onChange={(e) => setObjectifCA(Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#081F34] mb-1.5">Jours ouvres / an</label>
              <input type="number" value={joursOuvres} onChange={(e) => setJoursOuvres(Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#081F34] mb-1.5">Jours prod / an</label>
              <input type="number" value={joursProd} onChange={(e) => setJoursProd(Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#081F34] mb-1.5">Import Tiime (CSV/XLSX)</label>
              <label className="flex items-center gap-2 bg-[#034B5C] text-white px-4 py-2.5 rounded-xl cursor-pointer hover:bg-[#023a48] transition-colors text-sm font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                Importer
                <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
          {fileName && <p className="text-sm text-gray-500">Fichier : <strong>{fileName}</strong> — {invoices.length} factures importees</p>}
        </div>

        {stats ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "CA Facture", value: fmt(stats.totalFacture), sub: `${pct(stats.totalFacture, objectifCA)}% de l'objectif`, color: "bg-[#034B5C]", text: "text-white" },
                { label: "CA Encaisse", value: fmt(stats.totalPaye), sub: `${pct(stats.totalPaye, stats.totalFacture)}% du facture`, color: "bg-[#B5E467]", text: "text-[#081F34]" },
                { label: "En attente", value: fmt(stats.totalEnCours), color: "bg-white", text: "text-orange-500" },
                { label: "En retard", value: fmt(stats.totalRetard), sub: stats.totalRetard > 0 ? "Recouvrement urgent" : undefined, color: "bg-white", text: "text-red-500" },
              ].map((kpi) => (
                <div key={kpi.label} className={`${kpi.color} rounded-2xl p-5`} style={{ boxShadow: "var(--shadow-card)" }}>
                  <p className={`text-xs uppercase tracking-wider font-semibold mb-1 ${kpi.color === "bg-white" ? "text-gray-500" : kpi.text === "text-white" ? "text-white/70" : "text-[#081F34]/60"}`}>{kpi.label}</p>
                  <p className={`text-2xl font-extrabold ${kpi.text}`}>{kpi.value}</p>
                  {kpi.sub && <p className={`text-xs mt-1 ${kpi.color === "bg-white" ? "text-gray-400" : kpi.text === "text-white" ? "text-white/50" : "text-[#081F34]/40"}`}>{kpi.sub}</p>}
                </div>
              ))}
            </div>

            {/* Progression Objectif */}
            <div className="bg-white rounded-2xl p-6 mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <h2 className="text-lg font-bold text-[#081F34] mb-4">Progression vers l'objectif</h2>
              <div className="relative h-8 bg-[#e8e2d8] rounded-full overflow-hidden mb-4">
                <div className="absolute inset-y-0 left-0 bg-[#034B5C] rounded-full transition-all"
                  style={{ width: `${Math.min(pct(stats.totalFacture, objectifCA), 100)}%` }} />
                <div className="absolute inset-y-0 left-0 bg-[#B5E467] rounded-full transition-all"
                  style={{ width: `${Math.min(pct(stats.totalPaye, objectifCA), 100)}%` }} />
                <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#081F34]">
                  {fmt(stats.totalFacture)} / {fmt(objectifCA)}
                </div>
              </div>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                {[
                  { label: "Panier moyen", value: fmt(stats.panierMoyen) },
                  { label: "Nb clients", value: String(stats.nbClients) },
                  { label: "Reste a facturer", value: fmt(Math.max(0, stats.resteAFacturer)) },
                  { label: stats.retardObjectif > 0 ? "Retard" : "Avance", value: fmt(Math.abs(stats.retardObjectif)), danger: stats.retardObjectif > 0 },
                ].map((item) => (
                  <div key={item.label} className="bg-[#faf8f5] rounded-xl p-3 border border-[#e8e2d8]">
                    <span className="text-gray-500 text-xs">{item.label}</span>
                    <p className={`font-bold ${item.danger ? "text-red-500" : "text-[#081F34]"}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* TJM */}
            <div className="bg-white rounded-2xl p-6 mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <h2 className="text-lg font-bold text-[#081F34] mb-4">Indicateurs TJM</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: "TJM Actuel", value: fmt(stats.tjmActuel), bg: "bg-[#034B5C]", text: "text-white" },
                  { label: "TJM Objectif", value: fmt(stats.tjmObjectif), bg: "bg-[#B5E467]", text: "text-[#081F34]" },
                  { label: "TJM Rattrapage", value: fmt(stats.tjmNecessaire), bg: stats.tjmNecessaire > stats.tjmObjectif ? "bg-red-500" : "bg-green-500", text: "text-white" },
                ].map((item) => (
                  <div key={item.label} className={`text-center p-5 ${item.bg} rounded-2xl`}>
                    <p className={`text-xs uppercase tracking-wider font-semibold mb-1 ${item.text}/70`}>{item.label}</p>
                    <p className={`text-3xl font-extrabold ${item.text}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Clients & Alertes */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                <h2 className="text-lg font-bold text-[#081F34] mb-4">Top 5 Clients</h2>
                <div className="space-y-3">
                  {stats.topClients.map(([client, ca], idx) => (
                    <div key={client} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-[#034B5C] text-[#B5E467] text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-medium">{client}</span>
                      </div>
                      <span className="font-bold text-[#081F34]">{fmt(ca)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                <h2 className="text-lg font-bold text-[#081F34] mb-4">Alertes Recouvrement</h2>
                {stats.alertes.length === 0 ? (
                  <p className="text-sm text-green-600 font-medium">Aucune alerte</p>
                ) : (
                  <div className="space-y-3">
                    {stats.alertes.map((inv) => (
                      <div key={inv.numero} className="flex items-center justify-between border-l-4 border-red-400 pl-3 py-1">
                        <div>
                          <p className="text-sm font-semibold">{inv.client}</p>
                          <p className="text-xs text-gray-400">{inv.numero} — {inv.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-500">{fmt(inv.montantHT)}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            inv.statut === "En retard" ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                          }`}>{inv.statut}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CA par mois */}
            <div className="bg-white rounded-2xl p-6 mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <h2 className="text-lg font-bold text-[#081F34] mb-4">CA par mois</h2>
              <div className="flex items-end gap-3 h-52">
                {stats.parMois.map(([mois, ca]) => {
                  const maxCA = Math.max(...stats.parMois.map(([, v]) => v));
                  const heightPct = maxCA > 0 ? (ca / maxCA) * 100 : 0;
                  return (
                    <div key={mois} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-[#081F34]">{fmt(ca)}</span>
                      <div className="w-full bg-[#034B5C] rounded-t-lg transition-all hover:bg-[#B5E467]" style={{ height: `${heightPct}%` }} />
                      <span className="text-xs text-gray-500 font-medium">{mois}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detail factures */}
            <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <h2 className="text-lg font-bold text-[#081F34] mb-4">Detail des factures ({invoices.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-[#e8e2d8]">
                      <th className="text-left py-3 px-2 text-xs uppercase tracking-wider text-gray-500 font-semibold">N.</th>
                      <th className="text-left py-3 px-2 text-xs uppercase tracking-wider text-gray-500 font-semibold">Client</th>
                      <th className="text-left py-3 px-2 text-xs uppercase tracking-wider text-gray-500 font-semibold">Date</th>
                      <th className="text-right py-3 px-2 text-xs uppercase tracking-wider text-gray-500 font-semibold">Montant HT</th>
                      <th className="text-center py-3 px-2 text-xs uppercase tracking-wider text-gray-500 font-semibold">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv, i) => (
                      <tr key={i} className="border-b border-[#f0ebe3] hover:bg-[#faf8f5] transition-colors">
                        <td className="py-3 px-2 font-medium">{inv.numero}</td>
                        <td className="py-3 px-2">{inv.client}</td>
                        <td className="py-3 px-2 text-gray-500">{inv.date}</td>
                        <td className="py-3 px-2 text-right font-bold">{fmt(inv.montantHT)}</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            inv.statut === "Payé" ? "bg-[#e8f5d0] text-[#3d6b0f]" :
                            inv.statut === "En retard" ? "bg-red-100 text-red-600" :
                            inv.statut === "Envoyé" ? "bg-orange-100 text-orange-600" :
                            "bg-gray-100 text-gray-600"
                          }`}>{inv.statut}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              Importez vos donnees <span className="text-[#034B5C]">Tiime</span>
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Exportez votre liste de factures depuis Tiime (CSV ou XLSX) et importez-la ci-dessus.
            </p>
            <div className="bg-[#faf8f5] rounded-xl p-5 text-left text-sm text-gray-600 max-w-md mx-auto border border-[#e8e2d8]">
              <p className="font-bold text-[#081F34] mb-2">Colonnes attendues :</p>
              <ul className="space-y-1.5">
                {["Numero — Reference facture", "Client — Nom du client", "Date — Date d'emission", "Montant HT — Montant hors taxes", "Statut — Paye, Envoye, En retard..."].map((c) => (
                  <li key={c} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B5E467] mt-1.5 shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <footer className="bg-[#B5E467] mt-8">
        <div className="max-w-6xl mx-auto px-6 py-4 text-center text-sm font-semibold text-[#081F34]">
          Prodige RH — 27 rue Jules Ferry, 53 000 Laval
        </div>
      </footer>
    </main>
  );
}

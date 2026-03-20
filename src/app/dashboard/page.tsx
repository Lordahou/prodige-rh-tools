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
        alert("Erreur lors de la lecture du fichier. Vérifiez le format.");
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

    // Progression vers objectif
    const moisEcoules = new Date().getMonth() + 1;
    const objectifMensuel = objectifCA / 12;
    const cibleCumul = objectifMensuel * moisEcoules;
    const retardObjectif = cibleCumul - totalFacture;

    // TJM
    const tjmActuel = totalFacture / (joursProd * (moisEcoules / 12));
    const tjmObjectif = objectifCA / joursProd;
    const resteAFacturer = objectifCA - totalFacture;
    const moisRestants = 12 - moisEcoules;
    const joursProdRestants = joursProd * (moisRestants / 12);
    const tjmNecessaire = joursProdRestants > 0 ? resteAFacturer / joursProdRestants : 0;

    // Top clients
    const clientMap = new Map<string, number>();
    invoices.forEach((i) => {
      clientMap.set(i.client, (clientMap.get(i.client) || 0) + i.montantHT);
    });
    const topClients = Array.from(clientMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Alertes recouvrement
    const alertes = invoices
      .filter((i) => i.statut === "En retard" || i.statut === "Envoyé")
      .sort((a, b) => b.montantHT - a.montantHT)
      .slice(0, 5);

    // Répartition par mois
    const parMois = new Map<string, number>();
    invoices.forEach((i) => {
      const parts = i.date.split("/");
      const moisKey = parts.length >= 2 ? `${parts[1]}/${parts[2] || "2026"}` : "Autre";
      parMois.set(moisKey, (parMois.get(moisKey) || 0) + i.montantHT);
    });

    return {
      totalFacture,
      totalPaye,
      totalEnCours,
      totalRetard,
      nbClients,
      panierMoyen,
      retardObjectif,
      tjmActuel,
      tjmObjectif,
      tjmNecessaire,
      topClients,
      alertes,
      parMois: Array.from(parMois.entries()).sort(),
      moisEcoules,
      resteAFacturer,
    };
  }, [invoices, objectifCA, joursProd]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  const pct = (value: number, total: number) =>
    total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <main className="min-h-screen bg-[#f8fafb]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-[#034B5C] hover:text-[#B5E467]">← Retour</Link>
          <h1 className="text-xl font-bold text-[#034B5C]">Tableau de Bord — Pilotage Commercial</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Config + Import */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[#034B5C] mb-1">Objectif CA annuel</label>
              <input type="number" value={objectifCA} onChange={(e) => setObjectifCA(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#034B5C] mb-1">Jours ouvrés / an</label>
              <input type="number" value={joursOuvres} onChange={(e) => setJoursOuvres(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#034B5C] mb-1">Jours prod / an</label>
              <input type="number" value={joursProd} onChange={(e) => setJoursProd(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#034B5C] mb-1">Import Tiime (CSV/XLSX)</label>
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload}
                className="w-full text-sm file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#034B5C] file:text-white file:cursor-pointer" />
            </div>
          </div>
          {fileName && <p className="text-sm text-gray-500">Fichier chargé : {fileName} — {invoices.length} factures importées</p>}
        </div>

        {stats ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-[#034B5C]">
                <p className="text-xs text-gray-500 uppercase tracking-wide">CA Facturé</p>
                <p className="text-2xl font-bold text-[#034B5C]">{fmt(stats.totalFacture)}</p>
                <p className="text-xs text-gray-400 mt-1">{pct(stats.totalFacture, objectifCA)}% de l'objectif</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
                <p className="text-xs text-gray-500 uppercase tracking-wide">CA Encaissé</p>
                <p className="text-2xl font-bold text-green-600">{fmt(stats.totalPaye)}</p>
                <p className="text-xs text-gray-400 mt-1">{pct(stats.totalPaye, stats.totalFacture)}% du facturé</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-orange-400">
                <p className="text-xs text-gray-500 uppercase tracking-wide">En attente</p>
                <p className="text-2xl font-bold text-orange-500">{fmt(stats.totalEnCours)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-red-500">
                <p className="text-xs text-gray-500 uppercase tracking-wide">En retard</p>
                <p className="text-2xl font-bold text-red-500">{fmt(stats.totalRetard)}</p>
                {stats.totalRetard > 0 && <p className="text-xs text-red-400 mt-1">Recouvrement urgent</p>}
              </div>
            </div>

            {/* Progression Objectif */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-[#034B5C] mb-4">Progression vers l'objectif annuel</h2>
              <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div className="absolute inset-y-0 left-0 bg-[#034B5C] rounded-full transition-all"
                  style={{ width: `${Math.min(pct(stats.totalFacture, objectifCA), 100)}%` }} />
                <div className="absolute inset-y-0 left-0 bg-[#B5E467] rounded-full transition-all opacity-80"
                  style={{ width: `${Math.min(pct(stats.totalPaye, objectifCA), 100)}%` }} />
                <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                  {fmt(stats.totalFacture)} / {fmt(objectifCA)}
                </div>
              </div>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Panier moyen</span>
                  <p className="font-bold text-[#034B5C]">{fmt(stats.panierMoyen)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Nb clients</span>
                  <p className="font-bold text-[#034B5C]">{stats.nbClients}</p>
                </div>
                <div>
                  <span className="text-gray-500">Reste à facturer</span>
                  <p className="font-bold text-[#034B5C]">{fmt(Math.max(0, stats.resteAFacturer))}</p>
                </div>
                <div>
                  <span className="text-gray-500">{stats.retardObjectif > 0 ? "Retard" : "Avance"} sur objectif</span>
                  <p className={`font-bold ${stats.retardObjectif > 0 ? "text-red-500" : "text-green-600"}`}>
                    {fmt(Math.abs(stats.retardObjectif))}
                  </p>
                </div>
              </div>
            </div>

            {/* TJM Indicators */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-[#034B5C] mb-4">Indicateurs TJM</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase mb-1">TJM Actuel</p>
                  <p className="text-3xl font-bold text-[#034B5C]">{fmt(stats.tjmActuel)}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase mb-1">TJM Objectif</p>
                  <p className="text-3xl font-bold text-[#B5E467]">{fmt(stats.tjmObjectif)}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase mb-1">TJM Nécessaire (rattrapage)</p>
                  <p className={`text-3xl font-bold ${stats.tjmNecessaire > stats.tjmObjectif ? "text-red-500" : "text-green-600"}`}>
                    {fmt(stats.tjmNecessaire)}
                  </p>
                </div>
              </div>
            </div>

            {/* Top Clients & Alertes */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-[#034B5C] mb-4">Top 5 Clients</h2>
                <div className="space-y-3">
                  {stats.topClients.map(([client, ca], idx) => (
                    <div key={client} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#034B5C] text-white text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-sm">{client}</span>
                      </div>
                      <span className="font-semibold text-[#034B5C]">{fmt(ca)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-[#034B5C] mb-4">Alertes Recouvrement</h2>
                {stats.alertes.length === 0 ? (
                  <p className="text-sm text-green-600">Aucune alerte</p>
                ) : (
                  <div className="space-y-3">
                    {stats.alertes.map((inv) => (
                      <div key={inv.numero} className="flex items-center justify-between border-l-4 border-red-400 pl-3">
                        <div>
                          <p className="text-sm font-medium">{inv.client}</p>
                          <p className="text-xs text-gray-400">{inv.numero} — {inv.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-500">{fmt(inv.montantHT)}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
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
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-[#034B5C] mb-4">CA par mois</h2>
              <div className="flex items-end gap-2 h-48">
                {stats.parMois.map(([mois, ca]) => {
                  const maxCA = Math.max(...stats.parMois.map(([, v]) => v));
                  const heightPct = maxCA > 0 ? (ca / maxCA) * 100 : 0;
                  return (
                    <div key={mois} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-medium text-[#034B5C]">{fmt(ca)}</span>
                      <div className="w-full bg-[#034B5C] rounded-t-md transition-all" style={{ height: `${heightPct}%` }} />
                      <span className="text-xs text-gray-500">{mois}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Détail factures */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-[#034B5C] mb-4">Détail des factures ({invoices.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-2 text-gray-500 font-medium">N°</th>
                      <th className="text-left py-2 px-2 text-gray-500 font-medium">Client</th>
                      <th className="text-left py-2 px-2 text-gray-500 font-medium">Date</th>
                      <th className="text-right py-2 px-2 text-gray-500 font-medium">Montant HT</th>
                      <th className="text-center py-2 px-2 text-gray-500 font-medium">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 px-2">{inv.numero}</td>
                        <td className="py-2 px-2">{inv.client}</td>
                        <td className="py-2 px-2">{inv.date}</td>
                        <td className="py-2 px-2 text-right font-medium">{fmt(inv.montantHT)}</td>
                        <td className="py-2 px-2 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            inv.statut === "Payé" ? "bg-green-100 text-green-600" :
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
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-[#034B5C] mb-2">
              Importez vos données Tiime
            </h2>
            <p className="text-gray-500 mb-4">
              Exportez votre liste de factures depuis Tiime (format CSV ou XLSX) et importez-la ci-dessus pour visualiser vos KPIs.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left text-sm text-gray-600 max-w-md mx-auto">
              <p className="font-medium mb-2">Colonnes attendues :</p>
              <ul className="space-y-1">
                <li>• <strong>Numéro</strong> — Référence facture</li>
                <li>• <strong>Client</strong> — Nom du client</li>
                <li>• <strong>Date</strong> — Date d'émission</li>
                <li>• <strong>Montant HT</strong> — Montant hors taxes</li>
                <li>• <strong>Statut</strong> — Payé, Envoyé, En retard...</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

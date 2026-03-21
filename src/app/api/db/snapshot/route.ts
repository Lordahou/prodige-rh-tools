import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-api";
import { getSnapshot, upsertSnapshot, upsertHistoriqueMonth } from "@/lib/db-queries";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const year =
      Number(new URL(request.url).searchParams.get("year")) ||
      new Date().getFullYear();
    const snapshot = await getSnapshot(auth.email, year);
    return NextResponse.json({ snapshot });
  } catch {
    return NextResponse.json({ snapshot: null });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { exercice_year, clients, factures, objectif_ca, jours_prod } =
      await request.json();

    await upsertSnapshot(
      auth.email,
      Number(exercice_year),
      clients,
      factures,
      Number(objectif_ca),
      Number(jours_prod)
    );

    // Side-effect: save monthly aggregated KPIs to historique_financier
    if (Array.isArray(factures) && factures.length > 0) {
      const parMois = new Map<string, { ca: number; encaisse: number }>();
      for (const f of factures) {
        const parts = String(f.date ?? "").split("/");
        if (parts.length >= 3) {
          const key = `${parts[1]}-${parts[0]}`; // "2026-03"
          const curr = parMois.get(key) ?? { ca: 0, encaisse: 0 };
          const isPaye = String(f.statut ?? "").toLowerCase().includes("pay");
          curr.ca += Number(f.montantHT ?? 0);
          if (isPaye) curr.encaisse += Number(f.montantHT ?? 0);
          parMois.set(key, curr);
        }
      }

      const totalEncours = Array.isArray(clients)
        ? clients.reduce((s: number, c: Record<string, unknown>) => s + Number(c.encours ?? 0), 0)
        : 0;
      const nbClients = Array.isArray(clients) ? clients.length : 0;

      for (const [key, data] of parMois) {
        const [anneeStr, moisStr] = key.split("-");
        await upsertHistoriqueMonth(
          auth.email,
          Number(anneeStr),
          Number(moisStr),
          {
            ca_facture_ttc: data.ca * 1.2, // approximation TTC if needed
            ca_encaisse: data.encaisse,
            encours: totalEncours,
            nb_clients: nbClients,
            objectif_ca: Number(objectif_ca),
          }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Snapshot save error:", err);
    return NextResponse.json({ error: "Erreur sauvegarde snapshot" }, { status: 500 });
  }
}

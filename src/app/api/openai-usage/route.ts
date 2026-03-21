import { NextRequest, NextResponse } from "next/server";
import { requireAuth, safeErrorMessage } from "@/lib/auth-api";
import { sql } from "@/lib/db";

// Simple in-memory cache — 1 heure de TTL
let _cache: {
  cost_eur: number;
  cost_usd: number;
  total_tokens: number;
  period: string;
  ts: number;
} | null = null;
const TTL_MS = 60 * 60 * 1000; // 1h

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  // Retourner le cache si encore frais
  if (_cache && Date.now() - _cache.ts < TTL_MS) {
    return NextResponse.json({ ..._cache, fromCache: true });
  }

  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const startDate = `${year}-${month}-01`;
    // L'API billing OpenAI utilise une date de fin exclusive : on ajoute 1 jour
    const endDay = String(now.getDate() + 1).padStart(2, "0");
    const endDate = `${year}-${month}-${endDay}`;

    // Appel à l'API billing OpenAI
    const billingRes = await fetch(
      `https://api.openai.com/dashboard/billing/usage?start_date=${startDate}&end_date=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        // Pas de cache navigateur — on gère le TTL nous-mêmes
        cache: "no-store",
      }
    );

    if (!billingRes.ok) {
      throw new Error(`OpenAI billing API: ${billingRes.status} ${billingRes.statusText}`);
    }

    const billing = await billingRes.json();

    // total_usage est en centimes USD (ex: 365 = $3.65)
    const cost_usd = (billing.total_usage ?? 0) / 100;
    // Taux EUR/USD approx (peut être affiné)
    const EUR_RATE = 0.92;
    const cost_eur = cost_usd * EUR_RATE;

    const period = `${startDate} → ${year}-${month}-${day}`;

    // Tokens depuis notre DB (logs depuis le début du mois)
    let total_tokens = 0;
    if (sql) {
      try {
        const rows = await sql`
          SELECT COALESCE(SUM(tokens_utilises), 0) AS total
          FROM documents_generes
          WHERE created_at >= ${startDate + "T00:00:00Z"}
        `;
        total_tokens = Number(rows[0]?.total ?? 0);
      } catch {
        // DB indisponible — on continue sans tokens
      }
    }

    _cache = { cost_eur, cost_usd, total_tokens, period, ts: Date.now() };
    return NextResponse.json({ ..._cache, fromCache: false });
  } catch (err) {
    return NextResponse.json({ error: safeErrorMessage(err) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, safeErrorMessage } from "@/lib/auth-api";
import { sql } from "@/lib/db";

// Simple in-memory cache — 1 heure de TTL
let _cache: {
  cost_eur: number | null;
  cost_usd: number | null;
  total_tokens: number;
  period: string;
  billing_ok: boolean;
  ts: number;
} | null = null;
const TTL_MS = 60 * 60 * 1000; // 1h

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  if (_cache && Date.now() - _cache.ts < TTL_MS) {
    return NextResponse.json({ ..._cache, fromCache: true });
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const startDate = `${year}-${month}-01`;
  const period = `${startDate} → ${year}-${month}-${day}`;

  // ── 1. Coût depuis l'API billing OpenAI (best-effort) ──
  let cost_usd: number | null = null;
  let cost_eur: number | null = null;
  let billing_ok = false;

  try {
    // Date de fin exclusive : on utilise le lendemain
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

    // Utilise OPENAI_BILLING_KEY si disponible (clé avec permission billing:read)
    // Sinon tente avec OPENAI_API_KEY (peut échouer selon les permissions)
    const billingKey = process.env.OPENAI_BILLING_KEY ?? process.env.OPENAI_API_KEY;

    const billingRes = await fetch(
      `https://api.openai.com/dashboard/billing/usage?start_date=${startDate}&end_date=${endDate}`,
      {
        headers: { Authorization: `Bearer ${billingKey}` },
        cache: "no-store",
      }
    );

    if (billingRes.ok) {
      const billing = await billingRes.json();
      // total_usage est en centimes USD
      cost_usd = (billing.total_usage ?? 0) / 100;
      cost_eur = cost_usd * 0.92;
      billing_ok = true;
    } else {
      // Clé sans accès billing — on continue sans coût
      console.warn(`OpenAI billing API: ${billingRes.status} — coût non disponible`);
    }
  } catch (err) {
    console.warn("OpenAI billing API indisponible:", safeErrorMessage(err));
  }

  // ── 2. Tokens depuis notre DB ──
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
      // DB indisponible
    }
  }

  _cache = { cost_eur, cost_usd, total_tokens, period, billing_ok, ts: Date.now() };
  return NextResponse.json({ ..._cache, fromCache: false });
}

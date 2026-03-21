import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-api";
import { getPreferences, upsertPreferences } from "@/lib/db-queries";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const prefs = await getPreferences(auth.email);
    return NextResponse.json(prefs);
  } catch {
    return NextResponse.json({ objectif_ca: 300000, jours_prod: 120 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { objectif_ca, jours_prod } = await request.json();
    await upsertPreferences(auth.email, Number(objectif_ca), Number(jours_prod));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur sauvegarde" }, { status: 500 });
  }
}

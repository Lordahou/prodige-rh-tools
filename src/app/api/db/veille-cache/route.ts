import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-api";
import { getLatestVeille, saveVeilleRapport } from "@/lib/db-queries";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const rapport = await getLatestVeille(auth.email);
    if (!rapport) return NextResponse.json({ data: null });
    return NextResponse.json({
      data: rapport.rapport_json,
      created_at: rapport.created_at,
      focus: rapport.focus,
    });
  } catch {
    return NextResponse.json({ data: null });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { rapport, annotations, focus, tokens } = await request.json();
    await saveVeilleRapport(auth.email, focus ?? null, rapport, annotations ?? [], tokens ?? null);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur cache veille" }, { status: 500 });
  }
}

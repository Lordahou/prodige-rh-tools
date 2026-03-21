import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";

/**
 * Vérifie que la requête API est authentifiée.
 * Retourne { email } si OK, ou une NextResponse 401 à renvoyer immédiatement.
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ email: string } | NextResponse> {
  const token = request.cookies.get("prodige_session")?.value;
  const email = token ? await verifySession(token) : null;

  if (!email) {
    return NextResponse.json(
      { error: "Authentification requise" },
      { status: 401 }
    );
  }

  return { email };
}

/**
 * Masque les messages d'erreur internes en production.
 */
export function safeErrorMessage(err: unknown): string {
  if (process.env.NODE_ENV !== "production") {
    return err instanceof Error ? err.message : "Erreur inconnue";
  }
  return "Une erreur est survenue. Veuillez réessayer.";
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, safeErrorMessage } from "@/lib/auth-api";
import { logDocument, getSnapshot, getLatestVeille } from "@/lib/db-queries";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type ClientRow = {
  nom?: string;
  ville?: string;
  factureeTTC?: number;
  factureeHT?: number;
  encaisse?: number;
  encours?: number;
  statut?: string;
};

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { client, angle } = await request.json();
    if (!client) return NextResponse.json({ error: "Client requis" }, { status: 400 });

    const now = new Date();
    const today = now.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

    // ── Veille cache ──────────────────────────────────────────────────────────
    const veille = await getLatestVeille(auth.email);
    let veilleContext = "";
    if (veille) {
      type VeilleData = {
        resume_executif?: string;
        tendances_locales?: { titre: string; description: string; action_prodige: string }[];
        profils_penuriques?: { profil: string; secteur: string; conseil?: string }[];
        marche_emploi?: { mayenne?: string };
      };
      const v = veille.rapport_json as VeilleData;
      const tendances = (v.tendances_locales ?? []).slice(0, 2).map((t) => `• ${t.titre} : ${t.description}`).join("\n");
      const profils = (v.profils_penuriques ?? []).slice(0, 2).map((p) => `• ${p.profil} (${p.secteur})`).join("\n");
      veilleContext = `VEILLE RH LOCALE (${new Date(veille.created_at).toLocaleDateString("fr-FR")}) :
Marché Mayenne : ${v.marche_emploi?.mayenne ?? ""}
Tendances : \n${tendances}
Profils en tension : \n${profils}`;
    }

    // ── Angle label ───────────────────────────────────────────────────────────
    const angleLabels: Record<string, string> = {
      insight: "partage d'un insight RH pertinent pour son activité",
      mission: "proposition d'une nouvelle mission de recrutement",
      relance: "relance douce et bienveillante sur un encours de paiement",
      suivi: "prise de nouvelles post-recrutement et fidélisation",
    };
    const angleLabel = angleLabels[angle] || angleLabels.insight;

    // ── Build situation financière ────────────────────────────────────────────
    const encours = Number(client.encours ?? 0);
    const encaisse = Number(client.encaisse ?? 0);
    const factureeTTC = Number(client.factureeTTC ?? 0);
    const tauxEncaissement = factureeTTC > 0 ? Math.round((encaisse / factureeTTC) * 100) : 0;
    const statut = String(client.statut ?? "");
    const enRetard = statut.toLowerCase().includes("retard");

    const situationFinanciere = factureeTTC > 0
      ? `CA facturé : ${Math.round(factureeTTC).toLocaleString("fr-FR")} € TTC | Encaissé : ${tauxEncaissement}% | Encours : ${Math.round(encours).toLocaleString("fr-FR")} €${enRetard ? " (⚠️ paiement en retard)" : ""}`
      : "Pas encore de facturation enregistrée";

    const prompt = `Tu es Delphine Pilorge, gérante de Prodige RH, cabinet de recrutement "Positiv' Recrutement" à Laval (53), Mayenne. Tu rédiges un email commercial personnalisé pour un client.

DATE : ${today}

CLIENT :
- Nom : ${client.nom}
- Ville : ${client.ville || "Mayenne"}
- Situation : ${situationFinanciere}

OBJECTIF DE L'EMAIL : ${angleLabel}

${veilleContext ? `\n${veilleContext}\n` : ""}

INSTRUCTIONS :
- Ton chaleureux, professionnel, proximité — voix de Delphine (1ère personne)
- 150-200 mots maximum (email court et impactant)
- Personnalisé au maximum pour ${client.nom}
- Mentionne 1 élément de veille RH pertinent pour leur contexte si disponible
- Termine par une invitation à échanger (appel, RDV, réponse)
- Signe "Delphine Pilorge — Prodige RH · Laval (53) · prodige-rh.fr"
${angle === "relance" && enRetard ? "- Pour la relance : ton bienveillant, jamais agressif, rappel naturel de la situation" : ""}
${angle === "relance" && !enRetard && encours > 0 ? `- Mention naturelle de l'encours de ${Math.round(encours).toLocaleString("fr-FR")} €` : ""}

Réponds UNIQUEMENT avec ce JSON :
{
  "sujet": "Objet email (40-55 car, personnalisé avec le nom client si naturel)",
  "corps": "Corps de l'email complet, prêt à envoyer"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 600,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Réponse vide");

    void logDocument(auth.email, "newsletter-client", client.nom, completion.usage?.total_tokens);
    return NextResponse.json({
      data: JSON.parse(content),
      usage: { total_tokens: completion.usage?.total_tokens },
    });
  } catch (err) {
    return NextResponse.json({ error: safeErrorMessage(err) }, { status: 500 });
  }
}

// ── GET : retourne le top clients depuis le snapshot ──────────────────────────
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const year = new Date().getFullYear();
    const snapshot = await getSnapshot(auth.email, year);
    if (!snapshot || !Array.isArray(snapshot.clients_json) || snapshot.clients_json.length === 0) {
      return NextResponse.json({ clients: [], snapshot_date: null });
    }

    const clients = (snapshot.clients_json as ClientRow[])
      .filter((c) => c.nom)
      .sort((a, b) => (b.factureeTTC ?? 0) - (a.factureeTTC ?? 0))
      .slice(0, 10);

    return NextResponse.json({
      clients,
      snapshot_date: snapshot.updated_at,
    });
  } catch (err) {
    return NextResponse.json({ error: safeErrorMessage(err) }, { status: 500 });
  }
}

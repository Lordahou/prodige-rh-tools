import { NextRequest, NextResponse } from "next/server";
import { requireAuth, safeErrorMessage } from "@/lib/auth-api";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `Tu es un expert en recrutement pour Prodige RH, cabinet de recrutement à Laval (53).
Tu génères des comptes-rendus de réunion client professionnels, structurés et actionnables.

Retourne UNIQUEMENT un JSON valide avec cette structure :

{
  "titre": "Compte-rendu de réunion — [Objet] — [Date]",
  "meta": {
    "date": "Date de la réunion",
    "participants": "Liste des participants",
    "objet": "Objet de la réunion",
    "duree": "Durée estimée si mentionnée"
  },
  "resume_executif": "Synthèse en 3-4 phrases des points essentiels de la réunion",
  "points_abordes": [
    {
      "theme": "Thème abordé",
      "contenu": "Détail des échanges sur ce thème (2-4 phrases)",
      "decisions": ["Décision prise 1", "Décision prise 2"]
    }
  ],
  "actions": [
    {
      "action": "Description de l'action à mener",
      "responsable": "Qui doit agir",
      "echeance": "Délai ou date si mentionné"
    }
  ],
  "prochaines_etapes": "Description des prochaines étapes et du suivi prévu (2-3 phrases)",
  "prochain_rdv": "Date et modalités du prochain rendez-vous si mentionné"
}

RÈGLES :
- Ton professionnel mais humain, dans l'esprit Prodige RH
- Sois factuel et précis — restitue ce qui a été dit, pas ce que tu penses
- Si une information n'est pas disponible dans le transcript, mets ""
- Priorise les actions concrètes et les décisions prises
- Retourne UNIQUEMENT le JSON`;

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { transcript, objet, participants, date } = await request.json();

    if (!transcript || transcript.trim().length < 50) {
      return NextResponse.json({ error: "Transcript trop court" }, { status: 400 });
    }

    const userPrompt = `Génère un compte-rendu structuré à partir de ce transcript de réunion.

${date ? `Date : ${date}` : ""}
${participants ? `Participants : ${participants}` : ""}
${objet ? `Objet : ${objet}` : ""}

Transcript :
${transcript}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Réponse vide");

    return NextResponse.json({
      data: JSON.parse(content),
      usage: { total_tokens: completion.usage?.total_tokens },
    });
  } catch (err) {
    return NextResponse.json({ error: safeErrorMessage(err) }, { status: 500 });
  }
}

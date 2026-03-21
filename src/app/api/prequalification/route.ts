import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `Tu es Delphine Pilorge, gérante de Prodige RH, cabinet de recrutement spécialisé dans le "Positiv' Recrutement" à Laval (53).
Tu analyses les notes d'un entretien de préqualification téléphonique pour évaluer un candidat.

Génère une synthèse de préqualification complète au format JSON :

{
  "decision": "Go" | "No-go" | "À approfondir",
  "score_motivation": 1-10,
  "resume": "Synthèse exécutive en 3-4 phrases percutantes du candidat et de son adéquation au poste",
  "points_forts": ["Point fort 1", "Point fort 2", "Point fort 3"],
  "points_vigilance": ["Point de vigilance 1", "Point de vigilance 2"],
  "profil": {
    "situation": "Résumé de la situation actuelle du candidat",
    "motivations": "Résumé des motivations et aspirations",
    "competences": "Résumé des compétences et expériences clés",
    "conditions": "Résumé des conditions : salaire, dispo, mobilité"
  },
  "prochaines_etapes": "Recommandation concrète sur la suite à donner (entretien, informations complémentaires, mise en veille...)",
  "note_interne": "Note confidentielle pour Delphine : observations informelles, feeling général, points à creuser en entretien"
}

RÈGLES :
- Sois factuel et précis, base-toi uniquement sur les notes fournies
- La décision "Go" = profil correspondant, à faire avancer. "No-go" = profil inadapté. "À approfondir" = doutes ou infos manquantes
- Identifie les signaux faibles et les incohérences
- Retourne UNIQUEMENT le JSON`;

export async function POST(request: NextRequest) {
  try {
    const { candidat, poste, entreprise, secteur, notes, duree } = await request.json();

    if (!candidat || !poste || !notes) {
      return NextResponse.json({ error: "Données incomplètes" }, { status: 400 });
    }

    const userPrompt = `Analyse cet entretien de préqualification et génère la synthèse.

Candidat : ${candidat}
Poste : ${poste}
Entreprise : ${entreprise || "Non précisée"}
Secteur : ${secteur || "Non précisé"}
Durée de l'entretien : ${duree || "Non précisée"}

Notes par phase :

${Object.entries(notes as Record<string, { questions: string[]; note: string }>)
  .map(([phase, data]) => `=== ${phase.toUpperCase()} ===
Questions abordées : ${data.questions.filter(Boolean).join(", ") || "Aucune cochée"}
Notes : ${data.note || "Aucune note"}`)
  .join("\n\n")}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Réponse vide");

    return NextResponse.json({
      data: JSON.parse(content),
      usage: { total_tokens: completion.usage?.total_tokens },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

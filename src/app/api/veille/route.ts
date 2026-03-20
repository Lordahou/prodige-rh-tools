import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const { focus } = await request.json();

    const today = new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const focusInstruction = focus
      ? `\n\nFocus supplementaire demande par l'utilisateur : "${focus}". Integre ce sujet dans ta veille.`
      : "";

    const systemPrompt = `Tu es un expert RH et recrutement, specialise sur le bassin d'emploi de Laval (53), le departement de la Mayenne et la region Pays de la Loire. Tu travailles pour Prodige RH, cabinet de recrutement base a Laval, specialise dans le "Positiv' Recrutement" de cadres, dirigeants et managers.

Nous sommes le ${today}.

Genere un rapport de veille tendances complet et actionnable au format JSON avec cette structure exacte :

{
  "date": "${today}",
  "resume_executif": "3-4 phrases de synthese globale des tendances cles",
  "tendances_locales": [
    {
      "titre": "Titre de la tendance",
      "description": "Description detaillee (3-4 phrases)",
      "impact": "fort | moyen | faible",
      "action_prodige": "Ce que Prodige RH peut faire concretement"
    }
  ],
  "marche_emploi": {
    "mayenne": "Analyse du marche de l'emploi en Mayenne (3-4 phrases avec chiffres/tendances)",
    "pays_de_la_loire": "Analyse regionale (3-4 phrases)",
    "national": "Grandes tendances nationales (3-4 phrases)"
  },
  "profils_penuriques": [
    {
      "profil": "Intitule du profil",
      "secteur": "Secteur concerne",
      "tension": "critique | elevee | moderee",
      "conseil": "Conseil pour recruter ce profil"
    }
  ],
  "reglementation": [
    {
      "titre": "Evolution reglementaire",
      "description": "Description et impact (2-3 phrases)",
      "date_effet": "Date d'application si connue",
      "impact_recrutement": "Impact sur le recrutement"
    }
  ],
  "idees_linkedin": [
    {
      "sujet": "Sujet du post",
      "angle": "Angle editorial propose",
      "accroche": "Proposition d'accroche LinkedIn"
    }
  ],
  "chiffres_cles": [
    {
      "chiffre": "Le chiffre ou la stat",
      "source": "Source",
      "commentaire": "Analyse en 1 phrase"
    }
  ]
}

Regles :
- Genere 4-6 tendances locales
- Genere 5-8 profils penuriques pertinents pour Laval/Mayenne/Pays de la Loire
- Genere 2-3 evolutions reglementaires recentes ou a venir
- Genere 3 idees de posts LinkedIn pour Prodige RH
- Genere 4-6 chiffres cles
- Sois factuel, concret et actionnable
- Ancre tes analyses dans le tissu economique local (agroalimentaire, industrie, services, collectivites, sante)
- Reponds UNIQUEMENT avec le JSON, sans texte avant ou apres${focusInstruction}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.4,
      max_tokens: 4000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Genere le rapport de veille tendances pour cette semaine." },
      ],
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("Reponse vide de l'IA");

    const data = JSON.parse(content);

    return NextResponse.json({
      data,
      usage: completion.usage,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

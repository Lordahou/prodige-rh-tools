import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `Tu es un expert en recrutement pour Prodige RH, cabinet de recrutement à Laval (53) spécialisé dans le "Positiv' Recrutement" de cadres, dirigeants et managers.

Le Positiv' Recrutement de Prodige RH c'est :
- Un ton chaleureux, humain et engageant (pas corporate froid)
- Des formulations positives et motivantes (ce que le candidat va APPORTER, pas ce qu'il doit AVOIR)
- Une mise en avant de l'environnement de travail, de la culture d'entreprise, des perspectives
- Des formulations inclusives (H/F/X) et non discriminatoires
- Un focus sur le sens du poste et l'impact du rôle

Génère une fiche de poste complète au format JSON strictement valide :

{
  "titre": "Intitulé du poste H/F",
  "accroche": "Accroche d'introduction de 2-3 phrases percutantes et positives sur l'entreprise et l'opportunité",
  "entreprise": {
    "presentation": "Présentation de l'entreprise en 3-4 phrases (culture, valeurs, ambiance)",
    "chiffres": "Chiffres clés si fournis (CA, effectif, implantations...)"
  },
  "poste": {
    "contexte": "Contexte et enjeux du poste en 2-3 phrases",
    "missions": ["Mission 1", "Mission 2", "Mission 3", "Mission 4", "Mission 5"],
    "environnement": "Description de l'environnement de travail, équipe, moyens"
  },
  "profil": {
    "formation": "Formation recherchée (formulée positivement)",
    "experience": "Expérience attendue (formulée positivement)",
    "competences": ["Compétence clé 1", "Compétence clé 2", "Compétence clé 3"],
    "qualites": ["Qualité 1", "Qualité 2", "Qualité 3"]
  },
  "conditions": {
    "contrat": "Type de contrat",
    "lieu": "Lieu + informations télétravail",
    "remuneration": "Fourchette salariale ou 'selon profil'",
    "avantages": ["Avantage 1", "Avantage 2"]
  },
  "call_to_action": "Phrase d'invitation à postuler chaleureuse et motivante (mentionner Prodige RH)"
}

RÈGLES IMPORTANTES :
- Ton chaleureux, positif, humain — jamais corporate ou froid
- Utilise "vous rejoindrez", "vous contribuerez", "votre mission sera de" plutôt que "le candidat devra"
- Mets en valeur les opportunités d'évolution et l'impact du rôle
- Inclus toujours la mention H/F dans le titre
- Retourne UNIQUEMENT le JSON, sans texte avant ou après`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const userPrompt = `Génère une fiche de poste pour les informations suivantes :

Intitulé du poste : ${body.poste}
Entreprise : ${body.entreprise}
Secteur : ${body.secteur || "Non précisé"}
Lieu : ${body.lieu}
Type de contrat : ${body.contrat || "CDI"}
Rémunération : ${body.remuneration || "Selon profil"}
Télétravail : ${body.teletravail || "Non précisé"}
Missions principales : ${body.missions}
Profil recherché : ${body.profil}
Avantages / Points forts : ${body.avantages || "Non précisé"}
Contexte / Informations complémentaires : ${body.contexte || "Non précisé"}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Réponse vide de l'IA");

    return NextResponse.json({
      data: JSON.parse(content),
      usage: { total_tokens: completion.usage?.total_tokens },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, safeErrorMessage } from "@/lib/auth-api";
import { logDocument } from "@/lib/db-queries";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const now = new Date();
    const today = now.toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateLimit = thirtyDaysAgo.toLocaleDateString("fr-FR", {
      day: "numeric", month: "long", year: "numeric",
    });

    const prompt = `Tu es un expert en intelligence concurrentielle pour Prodige RH, cabinet de recrutement spécialisé "Positiv' Recrutement" à Laval (53), Mayenne.

Nous sommes le ${today}.

Effectue une recherche web approfondie pour identifier et analyser les cabinets de recrutement concurrents de Prodige RH dans la zone Laval, Mayenne, Sarthe et Pays de la Loire.

PÉRIMÈTRE DE RECHERCHE :
- Cabinets de recrutement (généralistes et spécialisés) basés à Laval, Le Mans, Angers, Saint-Brieuc, Rennes ou rayonnant sur la Mayenne/Sarthe
- Agences d'emploi (Adecco, Manpower, Randstad, etc.) implantées localement
- Cabinets de chasse de têtes actifs sur la zone
- Plateformes digitales de recrutement très actives sur ce bassin

CONTRAINTE : Sources publiées après le ${dateLimit} uniquement.

Génère un rapport JSON avec cette structure exacte :

{
  "date": "${today}",
  "resume": "Synthèse en 3-4 phrases de l'état de la concurrence locale actuelle",
  "concurrents": [
    {
      "nom": "Nom du cabinet",
      "type": "cabinet indépendant | agence nationale | digital | chasseur de têtes",
      "localisation": "Ville(s)",
      "specialites": ["Spécialité 1", "Spécialité 2"],
      "activite_recente": "Ce qu'ils font en ce moment : offres publiées, posts LinkedIn, événements, nouveaux services (basé sur recherche web récente)",
      "positionnement": "Comment ils se positionnent vs Prodige RH",
      "niveau_menace": "forte | moderee | faible",
      "url": "https://leur-site.fr",
      "source_url": "https://url-source-de-l-info.fr"
    }
  ],
  "opportunites": [
    {
      "titre": "Titre de l'opportunité",
      "description": "Description précise (2-3 phrases)",
      "action_prodige": "Ce que Prodige RH peut faire concrètement pour en profiter"
    }
  ],
  "menaces": [
    {
      "titre": "Titre de la menace",
      "description": "Description précise (2-3 phrases)",
      "reponse_prodige": "Comment Prodige RH peut contrer ou se différencier"
    }
  ],
  "avantages_concurrentiels_prodige": [
    "Avantage différenciant de Prodige RH vs les concurrents identifiés"
  ],
  "recommandations": [
    {
      "priorite": "haute | moyenne",
      "action": "Action concrète recommandée pour Prodige RH",
      "contexte": "Pourquoi maintenant"
    }
  ]
}

RÈGLES :
- EXACTEMENT 5 concurrents (les plus pertinents sur la zone)
- EXACTEMENT 3 opportunités
- EXACTEMENT 3 menaces
- EXACTEMENT 3 avantages concurrentiels
- EXACTEMENT 3 recommandations
- Sources RÉCENTES (après le ${dateLimit}) pour les activités récentes
- Réponds UNIQUEMENT avec le JSON valide`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completion = await (openai.chat.completions.create as any)({
      model: "gpt-4o-search-preview",
      web_search_options: {
        search_context_size: "medium",
      },
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const rawContent = completion.choices[0].message.content;
    if (!rawContent) throw new Error("Réponse vide de l'IA");

    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Format JSON non trouvé");

    const data = JSON.parse(jsonMatch[0]);
    const annotations = completion.choices[0].message.annotations || [];

    void logDocument(auth.email, "veille-concurrentielle", null, completion.usage?.total_tokens);
    return NextResponse.json({ data, annotations, usage: completion.usage });
  } catch (err) {
    return NextResponse.json({ error: safeErrorMessage(err) }, { status: 500 });
  }
}

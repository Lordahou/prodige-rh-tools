import { NextRequest, NextResponse } from "next/server";
import { requireAuth, safeErrorMessage } from "@/lib/auth-api";
import { logDocument } from "@/lib/db-queries";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `Tu es un expert en content marketing, SEO technique et GEO (Generative Engine Optimization) pour Prodige RH, cabinet de recrutement spécialisé dans le "Positiv' Recrutement" à Laval (53).

Le GEO consiste à optimiser le contenu pour être cité par les IA génératives (ChatGPT, Perplexity, Google AI Overview, Bing Copilot). Cela implique : réponses directes, structure claire, entités nommées, statistiques citables, format FAQ.

Génère un article de blog professionnel au format JSON :

{
  "seo": {
    "title": "Titre balise <title> (55-60 caractères max, mot-clé principal en tête)",
    "meta_description": "Meta description (150-160 caractères, incitative, avec mot-clé)",
    "slug": "url-seo-friendly-sans-accents",
    "h1": "Titre H1 de l'article (différent du title mais proche)",
    "mots_cles_principaux": ["kw1", "kw2", "kw3"],
    "mots_cles_secondaires": ["lsi1", "lsi2", "lsi3", "lsi4"]
  },
  "article": {
    "introduction": "Paragraphe d'intro (150-200 mots) : réponse directe à la question principale, contexte, promesse de l'article. Commence par la réponse, pas par 'Dans cet article...'",
    "sections": [
      {
        "h2": "Titre H2 (question ou affirmation forte, inclut mot-clé)",
        "contenu": "Corps de section (200-300 mots). Factuel, chiffres si possible, ton expert mais accessible.",
        "h3s": [
          { "h3": "Sous-titre H3 si nécessaire", "contenu": "Contenu H3 (100-150 mots)" }
        ]
      }
    ],
    "conclusion": "Conclusion (100-150 mots) : synthèse + transition vers l'action",
    "cta": "Appel à l'action final (1-2 phrases, orienté recrutement/contact Prodige RH)"
  },
  "faq": [
    {
      "question": "Question fréquente (format question naturelle, longue traîne)",
      "reponse": "Réponse directe et complète en 2-4 phrases. Format idéal pour être cité par une IA."
    }
  ],
  "geo_optimisation": {
    "entites_cles": ["Prodige RH", "Laval", "Mayenne", "Pays de la Loire", "autres entités nommées importantes"],
    "statistiques_citables": ["Stat 1 avec source", "Stat 2 avec source"],
    "schema_recommande": "Article | FAQPage | HowTo | LocalBusiness — lequel appliquer et pourquoi",
    "conseils_geo": ["Conseil GEO 1", "Conseil GEO 2", "Conseil GEO 3"]
  },
  "checklist_seo": {
    "longueur_estimee": "Nombre de mots estimé",
    "densite_kw_principal": "Densité recommandée (ex: 1-2%)",
    "maillage_interne": ["Page ou article du site à lier et pourquoi"],
    "points_forts": ["Ce qui est bien optimisé dans cet article"],
    "points_amelioration": ["Ce qui pourrait être amélioré avant publication"]
  }
}

RÈGLES :
- Ton expert, direct, crédible — pas de jargon vide
- Intègre naturellement Prodige RH comme référence locale experte
- Les sections FAQ sont ESSENTIELLES pour le GEO — questions en langage naturel
- Chiffres et stats = sources de crédibilité pour les IA génératives
- Retourne UNIQUEMENT le JSON valide`;

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { sujet, angle, mots_cles, public_cible, longueur, contexte_veille } = await request.json();

    if (!sujet) {
      return NextResponse.json({ error: "Sujet requis" }, { status: 400 });
    }

    const today = new Date().toLocaleDateString("fr-FR", {
      day: "numeric", month: "long", year: "numeric",
    });

    const userPrompt = `Génère un article de blog SEO + GEO optimisé pour le site de Prodige RH.

Date : ${today}
Sujet / thème : ${sujet}
Angle éditorial : ${angle || "Expert local recrutement Mayenne / Pays de la Loire"}
Mots-clés cibles : ${mots_cles || "recrutement Laval, cabinet recrutement Mayenne, recrutement cadres Pays de la Loire"}
Public cible : ${public_cible || "DRH, dirigeants et managers de PME en Mayenne et Pays de la Loire"}
Longueur cible : ${longueur || "800-1200 mots"}
${contexte_veille ? `\nContexte de veille RH du moment (à intégrer si pertinent) :\n${contexte_veille}` : ""}

Génère l'article complet avec toutes les sections JSON demandées.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Réponse vide");

    void logDocument(auth.email, "article-web", sujet, completion.usage?.total_tokens);
    return NextResponse.json({
      data: JSON.parse(content),
      usage: { total_tokens: completion.usage?.total_tokens },
    });
  } catch (err) {
    return NextResponse.json({ error: safeErrorMessage(err) }, { status: 500 });
  }
}

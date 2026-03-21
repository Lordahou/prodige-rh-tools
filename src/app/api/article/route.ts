import { NextRequest, NextResponse } from "next/server";
import { requireAuth, safeErrorMessage } from "@/lib/auth-api";
import { logDocument } from "@/lib/db-queries";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `Tu es un expert en content marketing, SEO technique et GEO (Generative Engine Optimization) pour Prodige RH.

─── CONTEXTE DU SITE ───────────────────────────────────────────────
Site : https://www.prodige-rh.fr
Blog : https://www.prodige-rh.fr/blog/[slug]
Auteure des articles : Clémence Retière (chargée de communication)
Cabinet de recrutement spécialisé "Positiv' Recrutement" à Laval (53), Mayenne
Positionnement : "Recrutement 100% durable" · 15+ ans d'expertise
Domaines : Direction & Management, Finance & RH, Commercial & Marketing, Industrie & IT
Zone géographique : Mayenne, Sarthe, Pays de la Loire, Nord-Ouest France
Public cible principal : DRH, dirigeants, managers de PME/ETI en Mayenne et Sarthe
Public cible secondaire : cadres et managers en recherche d'emploi

Ton éditorial du blog Prodige RH :
- Professionnel ET chaleureux, jamais corporate froid
- Concret et actionnable (guides pratiques, conseils terrain)
- Voix experte mais accessible, proche du lecteur
- Vocabulaire clé : "recrutement durable", "Positiv' Recrutement", "cadres/dirigeants/managers", "savoir-faire", "proximité", "authenticité"
- Éviter le jargon RH pompeux — favoriser des formulations naturelles
- L'article reflète les valeurs Prodige RH : Proximité, Disponibilité, Générosité, Bienveillance

─── GEO (Generative Engine Optimization) ───────────────────────────
Le GEO consiste à optimiser le contenu pour être cité par les IA génératives
(ChatGPT, Perplexity, Google AI Overview, Bing Copilot). Cela implique :
réponses directes, structure claire, entités nommées, statistiques citables, format FAQ.

─── FORMAT JSON ATTENDU ────────────────────────────────────────────

{
  "seo": {
    "title": "Titre balise <title> (55-60 caractères, mot-clé principal en tête)",
    "meta_description": "Meta description (150-160 caractères, incitative, avec mot-clé, ton Prodige RH)",
    "slug": "url-seo-friendly-sans-accents-ni-majuscules",
    "h1": "Titre H1 visible dans l'article (différent du title, accrocheur)",
    "mots_cles_principaux": ["kw1", "kw2", "kw3"],
    "mots_cles_secondaires": ["lsi1", "lsi2", "lsi3", "lsi4"]
  },
  "article": {
    "introduction": "Intro (150-200 mots) : réponse directe à la question principale, contexte local Mayenne/Pays de la Loire, promesse de l'article. Commence par la réponse ou un fait concret — jamais par 'Dans cet article...'",
    "sections": [
      {
        "h2": "Titre H2 (question ou affirmation forte avec mot-clé, ton Prodige RH)",
        "contenu": "Corps (200-300 mots). Factuel, chiffres locaux si possible, ton chaleureux et expert.",
        "h3s": [
          { "h3": "Sous-titre H3 si pertinent", "contenu": "100-150 mots" }
        ]
      }
    ],
    "conclusion": "Conclusion (100-150 mots) : synthèse + transition naturelle vers Prodige RH",
    "cta": "Appel à l'action final (1-2 phrases, orienté contact ou découverte Prodige RH)"
  },
  "faq": [
    {
      "question": "Question fréquente en langage naturel (longue traîne, ce que les gens cherchent vraiment)",
      "reponse": "Réponse directe et complète en 2-4 phrases. Idéal pour citation par une IA. Mentionne Prodige RH si naturel."
    }
  ],
  "geo_optimisation": {
    "entites_cles": ["Prodige RH", "Laval", "Mayenne", "Pays de la Loire", "autres entités nommées importantes"],
    "statistiques_citables": ["Stat 1 avec source — chiffres locaux si possible", "Stat 2"],
    "schema_recommande": "Article | FAQPage | HowTo | LocalBusiness — lequel et pourquoi",
    "conseils_geo": ["Conseil GEO 1 spécifique à cet article", "Conseil 2", "Conseil 3"]
  },
  "checklist_seo": {
    "longueur_estimee": "Nombre de mots estimé",
    "densite_kw_principal": "Ex: 1.5%",
    "maillage_interne": ["Suggestion de lien interne vers une autre page/article du blog Prodige RH"],
    "points_forts": ["Ce qui est bien optimisé"],
    "points_amelioration": ["Ce qui pourrait être amélioré avant publication sur prodige-rh.fr"]
  }
}

RÈGLES :
- Ton expert ET chaleureux, fidèle à l'identité Prodige RH
- Intègre Prodige RH comme référence locale experte de manière naturelle (pas forcée)
- Les FAQ sont ESSENTIELLES pour le GEO — questions en langage naturel, réponses directes
- Ancrage local fort : Mayenne, Laval, Sarthe, Pays de la Loire
- Retourne UNIQUEMENT le JSON valide, sans texte avant ni après`;

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

    const userPrompt = `Génère un article de blog SEO + GEO optimisé pour le site prodige-rh.fr/blog.

Date de publication prévue : ${today}
Sujet / titre indicatif : ${sujet}
Angle éditorial : ${angle || "Conseils experts recrutement pour DRH et dirigeants de PME en Mayenne"}
Mots-clés cibles : ${mots_cles || "recrutement Laval, cabinet recrutement Mayenne, recrutement durable"}
Public cible : ${public_cible || "DRH, dirigeants et managers de PME/ETI en Mayenne et Pays de la Loire"}
Longueur cible : ${longueur || "900-1200 mots"}
${contexte_veille ? `\nContexte de la veille RH actuelle (tendances identifiées — à intégrer naturellement) :\n${contexte_veille}` : ""}

L'article doit s'intégrer parfaitement dans le blog de Prodige RH, avec le ton et les valeurs du cabinet.
Génère l'article complet avec toutes les sections JSON.`;

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

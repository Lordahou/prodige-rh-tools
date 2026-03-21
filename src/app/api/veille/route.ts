import { NextRequest, NextResponse } from "next/server";
import { requireAuth, safeErrorMessage } from "@/lib/auth-api";
import { logDocument, saveVeilleRapport } from "@/lib/db-queries";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { focus } = await request.json();

    const now = new Date();

    const today = now.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Date limite : sources publiées dans les 30 derniers jours uniquement
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateLimit = thirtyDaysAgo.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const focusInstruction = focus
      ? `\n\nFocus supplementaire demande : "${focus}". Integre ce sujet dans ta veille.`
      : "";

    const structureJson = `{
  "date": "${today}",
  "resume_executif": "3-4 phrases de synthese basee sur des donnees actuelles",
  "tendances_locales": [
    {
      "titre": "Titre de la tendance",
      "description": "Description detaillee avec chiffres actuels (3-4 phrases)",
      "impact": "fort | moyen | faible",
      "action_prodige": "Ce que Prodige RH peut faire concretement",
      "source": "Nom de la source",
      "url": "https://url-de-la-source.fr"
    }
  ],
  "marche_emploi": {
    "mayenne": "Analyse du marche Mayenne avec chiffres recents",
    "pays_de_la_loire": "Analyse regionale avec chiffres recents",
    "national": "Grandes tendances nationales actuelles",
    "sources": [
      {"nom": "Nom source", "url": "https://..."}
    ]
  },
  "profils_penuriques": [
    {
      "profil": "Intitule du profil",
      "secteur": "Secteur",
      "tension": "critique | elevee | moderee",
      "conseil": "Conseil pour recruter ce profil",
      "source": "Nom source",
      "url": "https://url-source.fr"
    }
  ],
  "reglementation": [
    {
      "titre": "Evolution reglementaire",
      "description": "Description et impact (2-3 phrases)",
      "date_effet": "Date d'application",
      "impact_recrutement": "Impact sur le recrutement",
      "url": "https://legifrance.gouv.fr ou autre source officielle"
    }
  ],
  "idees_linkedin": [
    {
      "sujet": "Sujet du post",
      "angle": "Angle editorial",
      "accroche": "Accroche LinkedIn"
    }
  ],
  "chiffres_cles": [
    {
      "chiffre": "Le chiffre ou la stat",
      "source": "Source precise",
      "url": "https://url-de-la-source.fr",
      "commentaire": "Analyse en 1 phrase"
    }
  ]
}`;

    const prompt = `Tu es un expert RH et recrutement specialise sur Laval (53), la Mayenne et les Pays de la Loire. Tu travailles pour Prodige RH, cabinet de recrutement base a Laval.

Nous sommes le ${today}. Effectue une recherche web pour trouver des informations RECENTES et ACTUELLES sur le marche de l'emploi en France, en Pays de la Loire et en Mayenne.

CONTRAINTE ABSOLUE SUR LA FRAICHEUR DES SOURCES :
- Toutes les informations doivent etre issues de sources publiees APRES le ${dateLimit}
- Les sources anterieures au ${dateLimit} sont STRICTEMENT INTERDITES — ne les utilise pas
- Si une information recente n'est pas disponible, indique clairement "Donnee non disponible pour cette periode" plutot que de citer une source ancienne
- Verifie la date de publication de chaque source avant de l'inclure dans le rapport
- Privilege les communiques de presse, articles de presse, donnees INSEE/DARES/France Travail publiees ce mois-ci ou le mois precedent
- Pour les evolutions reglementaires, tu peux citer les textes de loi officiels mais uniquement si leur application ou discussion est RECENTE (< 30 jours)

Genere un rapport JSON avec cette structure exacte. Inclus OBLIGATOIREMENT des URLs de sources verifiables et RECENTES (publiees apres le ${dateLimit}) pour chaque element important :

${structureJson}

Regles :
- EXACTEMENT 3 tendances locales (pas plus)
- EXACTEMENT 4 profils penuriques (pas plus)
- EXACTEMENT 2 evolutions reglementaires (pas plus)
- EXACTEMENT 3 idees LinkedIn (pas plus)
- EXACTEMENT 3 chiffres cles (pas plus)
- Descriptions courtes : 2 phrases maximum par champ
- URLs REELLES et RECENTES issues de ta recherche web (France Travail, INSEE, DARES, Laval Mayenne Tech, prefecture, presse locale...)
- Reponds UNIQUEMENT avec le JSON valide et complet, sans texte avant ou apres${focusInstruction}`;

    // gpt-4o-search-preview effectue une vraie recherche web
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completion = await (openai.chat.completions.create as any)({
      model: "gpt-4o-search-preview",
      web_search_options: {
        search_context_size: "medium",
      },
      max_tokens: 3500,
      messages: [
        { role: "user", content: prompt },
      ],
    });

    const rawContent = completion.choices[0].message.content;
    if (!rawContent) throw new Error("Reponse vide de l'IA");

    // Extraire le JSON de la réponse (le modèle peut ajouter du texte autour)
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Format JSON non trouve dans la reponse");

    const data = JSON.parse(jsonMatch[0]);

    // Ajouter les annotations (URLs citées par le modèle) si disponibles
    const annotations = completion.choices[0].message.annotations || [];

    void logDocument(auth.email, "veille", null, completion.usage?.total_tokens);
    void saveVeilleRapport(auth.email, focus ?? null, data, annotations, completion.usage?.total_tokens);
    return NextResponse.json({
      data,
      annotations,
      usage: completion.usage,
    });
  } catch (err) {
    return NextResponse.json({ error: safeErrorMessage(err) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, safeErrorMessage } from "@/lib/auth-api";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { veille } = await request.json();
    if (!veille) return NextResponse.json({ error: "Données veille manquantes" }, { status: 400 });

    const prompt = `Tu es expert en content marketing SEO pour Prodige RH, cabinet de recrutement à Laval (53) spécialisé "Positiv' Recrutement" et "Recrutement 100% durable". Le blog est sur prodige-rh.fr/blog, l'auteure est Clémence Retière.

Voici la veille RH du jour (${veille.date}) :

RÉSUMÉ : ${veille.resume_executif}

TENDANCES LOCALES :
${veille.tendances_locales.map((t: { titre: string; description: string; impact: string; action_prodige: string }) => `- [Impact ${t.impact}] ${t.titre} : ${t.description} → Action Prodige : ${t.action_prodige}`).join("\n")}

MARCHÉ EMPLOI :
- Mayenne : ${veille.marche_emploi.mayenne}
- Pays de la Loire : ${veille.marche_emploi.pays_de_la_loire}

PROFILS PÉNURIQUES : ${veille.profils_penuriques.map((p: { profil: string; secteur: string; tension: string }) => `${p.profil} (${p.secteur}, tension ${p.tension})`).join(", ")}

CHIFFRES CLÉS : ${veille.chiffres_cles.map((c: { chiffre: string; commentaire: string }) => `${c.chiffre} — ${c.commentaire}`).join(" | ")}

En analysant TOUTES ces données, identifie le sujet d'article le plus pertinent et stratégique pour Prodige RH aujourd'hui. Critères de sélection :
1. Forte actualité locale (Mayenne/Pays de la Loire)
2. Valeur ajoutée réelle pour les DRH et dirigeants de PME
3. Potentiel SEO (volume de recherche, longue traîne, question fréquente)
4. Différenciant vs contenu générique — angle que Prodige RH peut traiter avec son expertise terrain

Réponds UNIQUEMENT avec ce JSON :
{
  "sujet": "Titre d'article accrocheur, SEO-friendly, 8-12 mots max. Formulation question ou affirmation forte.",
  "angle": "Angle éditorial précis en 1 phrase — ce qui rend cet article unique, le point de vue de Prodige RH.",
  "mots_cles": "5-6 mots-clés séparés par virgule, mix mots-clés principaux + longue traîne locale",
  "justification": "Pourquoi CE sujet maintenant — 2 phrases max, données chiffrées de la veille si possible."
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 400,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Réponse vide");

    return NextResponse.json(JSON.parse(content));
  } catch (err) {
    return NextResponse.json({ error: safeErrorMessage(err) }, { status: 500 });
  }
}

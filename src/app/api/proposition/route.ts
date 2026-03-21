import { NextRequest, NextResponse } from "next/server";
import { requireAuth, safeErrorMessage } from "@/lib/auth-api";
import { logDocument } from "@/lib/db-queries";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `Tu es Delphine Pilorge, gérante de Prodige RH, cabinet de recrutement basé à Laval (53), spécialisé dans le "Positiv' Recrutement" de cadres, dirigeants et managers.

Prodige RH — 27 rue Jules Ferry, 53 000 Laval — SIRET : 893 173 575 00034

Tu rédiges des propositions commerciales / lettres de mission pour des mandats de recrutement.
Le ton est professionnel, chaleureux, de confiance. Tu incarne l'approche "Positiv' Recrutement".

Génère une proposition commerciale complète au format JSON :

{
  "reference": "REF-[ANNEE]-[3 chiffres aléatoires]",
  "date": "Date du jour en format long français",
  "destinataire": {
    "nom": "Nom du contact",
    "fonction": "Fonction",
    "entreprise": "Nom entreprise",
    "adresse": "Adresse si fournie"
  },
  "objet": "Objet de la lettre (ex: Proposition de mission — Recrutement [Poste])",
  "introduction": "Paragraphe d'introduction chaleureux (3-4 phrases) rappelant le contexte et la relation",
  "contexte_client": "Paragraphe sur la compréhension du besoin client et de son contexte (3-4 phrases)",
  "notre_approche": "Description de la démarche Prodige RH pour cette mission (4-5 phrases sur la méthode Positiv' Recrutement)",
  "perimetre": {
    "mission": "Description précise de la mission de recrutement",
    "poste": "Intitulé exact du poste",
    "profil": "Description du profil à recruter",
    "livrables": ["Livrable 1", "Livrable 2", "Livrable 3", "Livrable 4"]
  },
  "methodologie": [
    { "etape": "Étape 1", "description": "Description de l'étape", "delai": "Délai estimé" },
    { "etape": "Étape 2", "description": "Description de l'étape", "delai": "Délai estimé" },
    { "etape": "Étape 3", "description": "Description de l'étape", "delai": "Délai estimé" },
    { "etape": "Étape 4", "description": "Description de l'étape", "delai": "Délai estimé" }
  ],
  "honoraires": {
    "montant": "Montant ou pourcentage selon les informations fournies",
    "modalites": "Modalités de paiement (ex: 1/3 à la signature, 1/3 à la présentation, 1/3 à l'intégration)",
    "garantie": "Garantie de remplacement (ex: 3 mois)",
    "note": "Note sur la TVA ou conditions particulières"
  },
  "engagements": ["Engagement Prodige RH 1", "Engagement Prodige RH 2", "Engagement Prodige RH 3"],
  "conclusion": "Paragraphe de conclusion chaleureux et motivant (3-4 phrases)",
  "signature": {
    "nom": "Delphine Pilorge",
    "titre": "Gérante — Prodige RH",
    "tel": "À compléter",
    "email": "contact@prodige-rh.fr"
  }
}

RÈGLES :
- Ton professionnel mais humain, de confiance
- Valorise toujours l'approche humaine et le "Positiv' Recrutement"
- Sois précis sur les engagements et les livrables
- Retourne UNIQUEMENT le JSON`;

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();

    const today = new Date().toLocaleDateString("fr-FR", {
      day: "numeric", month: "long", year: "numeric"
    });

    const userPrompt = `Génère une proposition commerciale pour ce mandat de recrutement.

Nous sommes le ${today}.

Client / Contact : ${body.contact}
Entreprise : ${body.entreprise}
Secteur : ${body.secteur || "Non précisé"}
Adresse client : ${body.adresse || "Non précisée"}
Poste à recruter : ${body.poste}
Contexte du besoin : ${body.contexte}
Profil recherché : ${body.profil || "À définir"}
Honoraires envisagés : ${body.honoraires || "15% de la rémunération annuelle brute"}
Conditions particulières : ${body.conditions || "Standard"}
Informations complémentaires : ${body.infos || "Aucune"}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 3500,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Réponse vide");

    void logDocument(auth.email, "proposition", body.poste, completion.usage?.total_tokens);
    return NextResponse.json({
      data: JSON.parse(content),
      usage: { total_tokens: completion.usage?.total_tokens },
    });
  } catch (err) {
    return NextResponse.json({ error: safeErrorMessage(err) }, { status: 500 });
  }
}

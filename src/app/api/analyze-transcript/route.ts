import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Tu es un expert en recrutement travaillant pour Prodige RH, cabinet de recrutement à Laval.
Tu analyses des transcriptions d'entretiens de recrutement et tu extrais les informations structurées pour remplir une synthèse de candidature.

Tu dois retourner un JSON strictement valide avec la structure suivante. Remplis chaque champ au mieux à partir de la transcription. Si une information n'est pas disponible, mets une chaîne vide "" ou un tableau vide [].

{
  "nom": "Prénom Nom du candidat",
  "poste": "Intitulé du poste visé (H/F)",
  "structure": "Nom de l'entreprise/structure qui recrute",
  "dateEntretien": "Date(s) d'entretien - ex: Entretien mené le 15/03/2026",
  "contexte": "Contexte de la recherche d'emploi en 2-3 phrases",
  "salaireValide": "Prétentions salariales validées ou mentionnées",
  "disponibilite": "Disponibilité du candidat",
  "souhaits": ["Souhait 1", "Souhait 2"],
  "motivations": ["Motivation 1", "Motivation 2"],
  "positionNonSelection": "Position du candidat en cas de non-sélection",
  "experiences": [
    {
      "titre": "Titre du poste - Entreprise",
      "periode": "Année début - Année fin ou aujourd'hui",
      "introduction": "Phrase d'introduction contextuelle sur cette expérience",
      "role": "Description du rôle et responsabilités en 2-3 phrases",
      "missions": ["Mission 1", "Mission 2", "Mission 3"],
      "realisations": "Réalisations spécifiques marquantes en 2-3 phrases",
      "ressenti": "Ressenti du candidat sur cette expérience en 2-3 phrases",
      "raisonsChangement": "Raisons du départ ou du changement en 1-2 phrases"
    }
  ],
  "stylePersonnel": "Style de personnalité si mentionné (ex: Initiateur, Fédérateur...)",
  "styleDescription": "Description du style de personnalité",
  "pointsForts": [
    {"categorie": "Dans sa relation avec les autres", "items": ["Point fort 1", "Point fort 2"]},
    {"categorie": "Dans sa manière de travailler", "items": ["Point fort 1", "Point fort 2"]},
    {"categorie": "Dans sa gestion des émotions", "items": ["Point fort 1", "Point fort 2"]}
  ],
  "ameliorations": ["Axe d'amélioration 1", "Axe d'amélioration 2"],
  "activitesPrivilegiees": [
    {"pct": "75%", "titre": "COORDONNER", "description": "Description..."}
  ],
  "gestionEnergie": "Description de la gestion de l'énergie",
  "comportementTravail": "Description du comportement au travail",
  "priseDecision": "Style de prise de décision (ex: raisonnée, intuitive...)",
  "styleApprentissage": "Style d'apprentissage (ex: Innover, Observer...)",
  "compatibiliteManageriale": {
    "tachesConfier": ["Tâche 1", "Tâche 2"],
    "tachesEviter": ["Tâche 1", "Tâche 2"],
    "objectifsAdherer": ["Conseil 1", "Conseil 2"],
    "objectifsEchouer": ["Erreur 1", "Erreur 2"],
    "managementAttendu": ["Style attendu 1", "Style attendu 2"],
    "managementEviter": ["À éviter 1", "À éviter 2"],
    "reconnaissanceMeilleure": ["Forme de reconnaissance 1"],
    "reconnaissanceMoinsSensible": ["Forme moins efficace 1"]
  },
  "competencesOperationnelles": ["Compétence 1", "Compétence 2"],
  "qualitesManageriales": ["Qualité 1", "Qualité 2"],
  "pointsVigilance": ["Point de vigilance 1", "Point de vigilance 2"],
  "recommandation": "Recommandation finale et actions complémentaires proposées en 2-3 phrases"
}

IMPORTANT :
- Écris à la 3e personne en utilisant le prénom du candidat
- Sois factuel et professionnel
- Base-toi uniquement sur ce qui est dit dans la transcription
- Pour les données AssessFirst (pointsForts, ameliorations, activitesPrivilegiees, compatibiliteManageriale), remplis-les si elles sont mentionnées dans la transcription, sinon laisse des tableaux vides
- Retourne UNIQUEMENT le JSON, sans texte avant ou après`;

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (!transcript || transcript.trim().length < 50) {
      return NextResponse.json(
        { error: "La transcription est trop courte. Collez le texte complet de l'entretien." },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Voici la transcription de l'entretien de recrutement à analyser :\n\n${transcript}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 8000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "Pas de réponse de l'IA" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(content);

    return NextResponse.json({
      data: parsed,
      usage: {
        prompt_tokens: completion.usage?.prompt_tokens,
        completion_tokens: completion.usage?.completion_tokens,
        total_tokens: completion.usage?.total_tokens,
      },
    });
  } catch (error: unknown) {
    console.error("Erreur analyse transcript:", error);
    const message =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

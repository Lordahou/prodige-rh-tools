import { NextRequest, NextResponse } from "next/server";
import { requireAuth, safeErrorMessage } from "@/lib/auth-api";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `Tu es un expert en recrutement travaillant pour Prodige RH.
Tu analyses des rapports AssessFirst (SWIPE, DRIVE, BRAIN, Compatibilité managériale) et tu extrais les données structurées.

Retourne UNIQUEMENT un JSON valide avec cette structure exacte. Mets "" ou [] si l'info n'est pas dans les documents fournis.

{
  "stylePersonnel": "Style personnel (ex: Réalisateur, Initiateur...)",
  "styleDescription": "Description complète du style (2-4 phrases, 3e personne avec prénom)",
  "pfRelation": ["Point fort relation 1", "Point fort relation 2", "Point fort relation 3"],
  "pfTravail": ["Point fort travail 1", "Point fort travail 2", "Point fort travail 3"],
  "pfEmotions": ["Point fort émotions 1", "Point fort émotions 2", "Point fort émotions 3"],
  "ameliorations": ["Axe d'amélioration 1", "Axe d'amélioration 2", "Axe d'amélioration 3"],
  "activitesPrivilegiees": [
    {"pct": "100%", "titre": "SOUTENIR", "description": "Description 1-2 phrases"},
    {"pct": "75%", "titre": "CONCEVOIR", "description": "Description 1-2 phrases"}
  ],
  "gestionEnergie": "Description de la gestion de l'énergie (2-3 phrases, 3e personne)",
  "comportementTravail": "Description du comportement au travail (2-3 phrases, 3e personne)",
  "priseDecision": "Style de prise de décision (ex: prudente, raisonnée, intuitive)",
  "priseDecisionDesc": "Description complète de la prise de décision (2-3 phrases, 3e personne)",
  "styleApprentissage": "Style d'apprentissage (ex: Innover, Observer, Modéliser)",
  "styleApprentissageDesc": "Description complète du style d'apprentissage (2-3 phrases, 3e personne)",
  "tachesConfier": ["Tâche à confier 1", "Tâche à confier 2", "Tâche à confier 3"],
  "tachesEviter": ["Tâche à éviter 1", "Tâche à éviter 2", "Tâche à éviter 3"],
  "objectifsAdherer": ["Pour faire adhérer 1", "Pour faire adhérer 2", "Pour faire adhérer 3"],
  "objectifsEchouer": ["Ce qui échouera 1", "Ce qui échouera 2", "Ce qui échouera 3"],
  "managementAttendu": ["Management attendu 1", "Management attendu 2", "Management attendu 3"],
  "managementEviter": ["Management à éviter 1", "Management à éviter 2", "Management à éviter 3"],
  "reconnaissanceMeilleure": ["Reconnaissance efficace 1", "Reconnaissance efficace 2"],
  "reconnaissanceMoinsSensible": ["Reconnaissance moins efficace 1", "Reconnaissance moins efficace 2"]
}

RÈGLES :
- Utilise le prénom du candidat (3e personne)
- Reprends les formulations exactes des rapports, en les reformulant légèrement si nécessaire
- Les points forts doivent être des phrases courtes (5-10 mots)
- Les tâches/management/reconnaissance doivent être des phrases actionables courtes`;

async function extractPdfText(buffer: Buffer): Promise<string> {
  // Import from lib directly to avoid pdf-parse v1 test file loading bug
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
  const pdfParse: any = require("pdf-parse/lib/pdf-parse");
  const data = await pdfParse(buffer);
  return data.text as string;
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await request.formData();

    const docLabels: Record<string, string> = {
      swipe: "SWIPE (Style personnel, points forts, axes d'amélioration)",
      drive: "DRIVE (Activités privilégiées, gestion énergie)",
      brain: "BRAIN (Comportement travail, prise de décision, style apprentissage)",
      compatibilite: "Compatibilité managériale (tâches, objectifs, management, reconnaissance)",
    };

    const texts: string[] = [];

    for (const [key, label] of Object.entries(docLabels)) {
      const file = formData.get(key) as File | null;
      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const text = await extractPdfText(buffer);
        texts.push(`=== ${label} ===\n${text.trim()}`);
      }
    }

    if (texts.length === 0) {
      return NextResponse.json(
        { error: "Aucun PDF fourni." },
        { status: 400 }
      );
    }

    const combinedText = texts.join("\n\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Voici les rapports AssessFirst à analyser :\n\n${combinedText}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Pas de réponse de l'IA" }, { status: 500 });
    }

    const parsed = JSON.parse(content);

    return NextResponse.json({
      data: parsed,
      usage: {
        total_tokens: completion.usage?.total_tokens,
      },
    });
  } catch (error: unknown) {
    console.error("Erreur parse-assessfirst:", error);
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

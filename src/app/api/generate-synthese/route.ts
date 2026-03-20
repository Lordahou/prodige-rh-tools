import { NextRequest, NextResponse } from "next/server";
import { generateSyntheseDocx } from "@/lib/generate-docx";
import type { CandidateData } from "@/lib/generate-docx";

interface LegacyPayload {
  nom: string;
  poste: string;
  structure: string;
  dateEntretien: string;
  contexte: string;
  salaireValide: string;
  disponibilite: string;
  positionNonSelection: string;
  souhaits: string[];
  motivations: string[];
  experiences: {
    titre: string;
    periode: string;
    introduction: string;
    role: string;
    missions: string[];
    realisations: string;
    ressenti: string;
    raisonsChangement: string;
  }[];
  stylePersonnel: string;
  styleDescription: string;
  pointsForts?: { categorie: string; items: string[] }[];
  pfRelation?: string[];
  pfTravail?: string[];
  pfEmotions?: string[];
  ameliorations: string[];
  activitesPrivilegiees?: { pct: string; titre: string; description: string }[];
  activites?: { actTitre: string; actDescription: string }[];
  gestionEnergie: string;
  comportementTravail: string;
  priseDecision: string;
  priseDecisionDesc?: string;
  styleApprentissage: string;
  styleApprentissageDesc?: string;
  compatibiliteManageriale?: {
    tachesConfier: string[];
    tachesEviter: string[];
    objectifsAdherer: string[];
    objectifsEchouer: string[];
    managementAttendu: string[];
    managementEviter: string[];
    reconnaissanceMeilleure: string[];
    reconnaissanceMoinsSensible: string[];
  };
  tachesConfier?: string[];
  tachesEviter?: string[];
  objectifsAdherer?: string[];
  objectifsEchouer?: string[];
  managementAttendu?: string[];
  managementEviter?: string[];
  reconnaissanceMeilleure?: string[];
  reconnaissanceMoinsSensible?: string[];
  competencesOperationnelles?: string[];
  qualitesManageriales?: string[];
  pointsVigilance?: string[];
  competences?: string[];
  qualites?: string[];
  vigilance?: string[];
  recommandation: string;
}

function transformPayload(raw: LegacyPayload): CandidateData {
  const cm = raw.compatibiliteManageriale;
  const pf = raw.pointsForts || [];

  return {
    nom: raw.nom,
    poste: raw.poste,
    structure: raw.structure,
    dateEntretien: raw.dateEntretien,
    contexte: raw.contexte,
    salaireValide: raw.salaireValide,
    disponibilite: raw.disponibilite,
    positionNonSelection: raw.positionNonSelection,
    souhaits: raw.souhaits || [],
    motivations: raw.motivations || [],
    experiences: raw.experiences || [],
    stylePersonnel: raw.stylePersonnel,
    styleDescription: raw.styleDescription,
    pfRelation: raw.pfRelation || (pf[0]?.items ?? []),
    pfTravail: raw.pfTravail || (pf[1]?.items ?? []),
    pfEmotions: raw.pfEmotions || (pf[2]?.items ?? []),
    ameliorations: raw.ameliorations || [],
    activites: raw.activites ||
      (raw.activitesPrivilegiees || []).map((a) => ({
        actTitre: `${a.pct} ${a.titre}`.trim(),
        actDescription: a.description,
      })),
    gestionEnergie: raw.gestionEnergie,
    comportementTravail: raw.comportementTravail,
    priseDecision: raw.priseDecision,
    priseDecisionDesc: raw.priseDecisionDesc || "",
    styleApprentissage: raw.styleApprentissage,
    styleApprentissageDesc: raw.styleApprentissageDesc || "",
    tachesConfier: raw.tachesConfier || cm?.tachesConfier || [],
    tachesEviter: raw.tachesEviter || cm?.tachesEviter || [],
    objectifsAdherer: raw.objectifsAdherer || cm?.objectifsAdherer || [],
    objectifsEchouer: raw.objectifsEchouer || cm?.objectifsEchouer || [],
    managementAttendu: raw.managementAttendu || cm?.managementAttendu || [],
    managementEviter: raw.managementEviter || cm?.managementEviter || [],
    reconnaissanceMeilleure: raw.reconnaissanceMeilleure || cm?.reconnaissanceMeilleure || [],
    reconnaissanceMoinsSensible: raw.reconnaissanceMoinsSensible || cm?.reconnaissanceMoinsSensible || [],
    competences: raw.competences || raw.competencesOperationnelles || [],
    qualites: raw.qualites || raw.qualitesManageriales || [],
    vigilance: raw.vigilance || raw.pointsVigilance || [],
    recommandation: raw.recommandation,
  };
}

export async function POST(request: NextRequest) {
  try {
    const raw: LegacyPayload = await request.json();
    const data: CandidateData = transformPayload(raw);

    const buffer = await generateSyntheseDocx(data);

    const filename = `Synthese_${data.nom.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.docx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Erreur génération synthèse:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du document" },
      { status: 500 }
    );
  }
}

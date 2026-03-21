import createReport from "docx-templates";
import fs from "fs";
import path from "path";

export interface CandidateData {
  nom: string;
  poste: string;
  structure: string;
  dateEntretien: string;
  contexte: string;
  salaireValide: string;
  disponibilite: string;
  souhaits: string[];
  motivations: string[];
  positionNonSelection: string;
  experiences: ExperienceData[];
  stylePersonnel: string;
  styleDescription: string;
  pfRelation: string[];
  pfTravail: string[];
  pfEmotions: string[];
  ameliorations: string[];
  activites: { actTitre: string; actDescription: string }[];
  gestionEnergie: string;
  comportementTravail: string;
  priseDecision: string;
  priseDecisionDesc: string;
  styleApprentissage: string;
  styleApprentissageDesc: string;
  tachesConfier: string[];
  tachesEviter: string[];
  objectifsAdherer: string[];
  objectifsEchouer: string[];
  managementAttendu: string[];
  managementEviter: string[];
  reconnaissanceMeilleure: string[];
  reconnaissanceMoinsSensible: string[];
  competences: string[];
  qualites: string[];
  vigilance: string[];
  recommandation: string;
}

export interface ExperienceData {
  titre: string;
  periode: string;
  introduction: string;
  role: string;
  missions: string[];
  realisations: string;
  ressenti: string;
  raisonsChangement: string;
}

// Legacy interface kept for backward compatibility
export interface CompatibiliteData {
  tachesConfier: string[];
  tachesEviter: string[];
  objectifsAdherer: string[];
  objectifsEchouer: string[];
  managementAttendu: string[];
  managementEviter: string[];
  reconnaissanceMeilleure: string[];
  reconnaissanceMoinsSensible: string[];
}

export async function generateSyntheseDocx(data: CandidateData): Promise<Buffer> {
  const templatePath = path.join(process.cwd(), "public", "modele_template.docx");
  const template = fs.readFileSync(templatePath);

  const buffer = await createReport({
    template,
    data: {
      candidatNom: data.nom,
      poste: data.poste,
      structure: data.structure,
      dateEntretien: data.dateEntretien,
      contexte: data.contexte,
      salaireValide: data.salaireValide,
      disponibilite: data.disponibilite,
      positionNonSelection: data.positionNonSelection,
      souhaits: data.souhaits || [],
      motivations: data.motivations || [],
      experiences: (data.experiences || []).map((exp) => ({
        titre: exp.titre,
        periode: exp.periode,
        introduction: exp.introduction,
        role: exp.role,
        missions: exp.missions || [],
        realisations: exp.realisations,
        ressenti: exp.ressenti,
        raisonsChangement: exp.raisonsChangement,
      })),
      stylePersonnel: data.stylePersonnel,
      styleDescription: data.styleDescription,
      pfRelation: data.pfRelation || [],
      pfTravail: data.pfTravail || [],
      pfEmotions: data.pfEmotions || [],
      ameliorations: data.ameliorations || [],
      activites: (data.activites || []).map((a) => ({
        actTitre: a.actTitre,
        actDescription: a.actDescription,
      })),
      gestionEnergie: data.gestionEnergie,
      comportementTravail: data.comportementTravail,
      priseDecision: data.priseDecision,
      priseDecisionDesc: data.priseDecisionDesc,
      styleApprentissage: data.styleApprentissage,
      styleApprentissageDesc: data.styleApprentissageDesc,
      tachesConfier: data.tachesConfier || [],
      tachesEviter: data.tachesEviter || [],
      objectifsAdherer: data.objectifsAdherer || [],
      objectifsEchouer: data.objectifsEchouer || [],
      managementAttendu: data.managementAttendu || [],
      managementEviter: data.managementEviter || [],
      reconnaissanceMeilleure: data.reconnaissanceMeilleure || [],
      reconnaissanceMoinsSensible: data.reconnaissanceMoinsSensible || [],
      competences: data.competences || [],
      qualites: data.qualites || [],
      vigilance: data.vigilance || [],
      recommandation: data.recommandation,
    },
    cmdDelimiter: ["{{", "}}"],
  });

  return Buffer.from(buffer);
}

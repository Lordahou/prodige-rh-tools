import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  PageNumber,
  HeadingLevel,
  LevelFormat,
  ImageRun,
} from "docx";

// Charte graphique Prodige RH
const COLORS = {
  dark: "034B5C",
  green: "B5E467",
  navy: "081F34",
  gray: "111827",
  white: "FFFFFF",
  lightGray: "F3F4F6",
};

const FONT = "Poppins";
const FONT_FALLBACK = "Calibri";

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
  pointsForts: { categorie: string; items: string[] }[];
  ameliorations: string[];
  activitesPrivilegiees: { pct: string; titre: string; description: string }[];
  gestionEnergie: string;
  comportementTravail: string;
  priseDecision: string;
  styleApprentissage: string;
  compatibiliteManageriale: CompatibiliteData;
  competencesOperationnelles: string[];
  qualitesManageriales: string[];
  pointsVigilance: string[];
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

function sectionBanner(title: string): Table {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: COLORS.dark, type: ShadingType.CLEAR },
            width: { size: 9360, type: WidthType.DXA },
            borders: {
              top: { style: BorderStyle.NONE, size: 0 },
              bottom: { style: BorderStyle.NONE, size: 0 },
              left: { style: BorderStyle.NONE, size: 0 },
              right: { style: BorderStyle.NONE, size: 0 },
            },
            margins: { top: 100, bottom: 100, left: 200, right: 200 },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: title,
                    font: FONT,
                    size: 26,
                    bold: true,
                    color: COLORS.white,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function labelValue(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({
        text: `${label} : `,
        bold: true,
        color: COLORS.navy,
        font: FONT,
        size: 21,
      }),
      new TextRun({
        text: value,
        color: COLORS.navy,
        font: FONT,
        size: 21,
      }),
    ],
  });
}

function boldParagraph(text: string, color = COLORS.gray): Paragraph {
  return new Paragraph({
    spacing: { before: 120, after: 80 },
    children: [
      new TextRun({
        text,
        bold: true,
        color,
        font: FONT,
        size: 21,
      }),
    ],
  });
}

function normalParagraph(text: string, color = COLORS.gray): Paragraph {
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({
        text,
        color,
        font: FONT,
        size: 21,
      }),
    ],
  });
}

function bulletItem(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 40 },
    children: [
      new TextRun({
        text: `• ${text}`,
        color: COLORS.gray,
        font: FONT,
        size: 21,
      }),
    ],
    indent: { left: 360 },
  });
}

function experienceBlock(exp: ExperienceData): Paragraph[] {
  const items: Paragraph[] = [
    new Paragraph({
      spacing: { before: 200, after: 40 },
      children: [
        new TextRun({ text: "✅ ", font: "Arial Unicode MS", bold: true, color: COLORS.gray }),
        new TextRun({ text: exp.titre, bold: true, color: COLORS.gray, font: FONT, size: 21 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: `Période : ${exp.periode}`, italics: true, color: COLORS.gray, font: FONT, size: 21 }),
      ],
    }),
  ];

  if (exp.introduction) items.push(normalParagraph(exp.introduction));
  if (exp.role) {
    items.push(boldParagraph("Rôle et responsabilités :"));
    items.push(normalParagraph(exp.role));
  }
  if (exp.missions.length > 0) {
    items.push(boldParagraph("Missions quotidiennes :"));
    exp.missions.forEach((m) => items.push(bulletItem(m)));
  }
  if (exp.realisations) {
    items.push(boldParagraph("Réalisations spécifiques :"));
    items.push(normalParagraph(exp.realisations));
  }
  if (exp.ressenti) {
    items.push(boldParagraph("Ressenti :"));
    items.push(normalParagraph(exp.ressenti));
  }
  if (exp.raisonsChangement) {
    items.push(boldParagraph("Raisons du changement :"));
    items.push(normalParagraph(exp.raisonsChangement));
  }

  return items;
}

function compatSection(title: string, items: string[], avoid: string, avoidItems: string[]): Paragraph[] {
  const result: Paragraph[] = [boldParagraph(title)];
  result.push(boldParagraph("Confiez-lui ce type de tâches :"));
  items.forEach((i) => result.push(bulletItem(i)));
  result.push(boldParagraph(avoid));
  avoidItems.forEach((i) => result.push(bulletItem(i)));
  return result;
}

export async function generateSyntheseDocx(data: CandidateData): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  // Page de titre
  children.push(new Paragraph({ spacing: { before: 2000 } }));
  children.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Synthèse de candidature",
          font: FONT,
          size: 52,
          color: COLORS.dark,
          bold: true,
        }),
      ],
    })
  );
  children.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: data.nom,
          font: FONT,
          size: 36,
          color: COLORS.gray,
        }),
      ],
    })
  );

  // Poste et Structure
  children.push(
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: "Poste  ", font: FONT, size: 24, color: COLORS.dark }),
        new TextRun({ text: data.poste, font: FONT, size: 24, bold: true, italics: true, color: COLORS.green }),
      ],
    })
  );
  children.push(
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({ text: "Structure  ", font: FONT, size: 24, color: COLORS.dark }),
        new TextRun({ text: data.structure, font: FONT, size: 24, bold: true, italics: true, color: COLORS.green }),
      ],
    })
  );

  // Date entretien
  children.push(
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [9360],
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 9360, type: WidthType.DXA },
              borders: {
                top: { style: BorderStyle.NONE, size: 0 },
                bottom: { style: BorderStyle.NONE, size: 0 },
                left: { style: BorderStyle.NONE, size: 0 },
                right: { style: BorderStyle.NONE, size: 0 },
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: data.dateEntretien,
                      font: FONT,
                      size: 20,
                      italics: true,
                      color: COLORS.gray,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  // === SECTION: Motivations professionnelles ===
  children.push(new Paragraph({ spacing: { before: 400 } }));
  children.push(sectionBanner("Motivations professionnelles"));
  children.push(new Paragraph({ spacing: { after: 100 } }));

  children.push(labelValue("Contexte de la recherche d'emploi", data.contexte));
  children.push(labelValue("Salaire validé", data.salaireValide));
  children.push(labelValue("Disponibilité", data.disponibilite));

  children.push(boldParagraph("Ses souhaits particuliers :", COLORS.navy));
  data.souhaits.forEach((s) => children.push(bulletItem(s)));

  children.push(boldParagraph("Motivations clés :", COLORS.navy));
  data.motivations.forEach((m) => children.push(bulletItem(m)));

  children.push(labelValue("Position en cas de non-sélection", data.positionNonSelection));

  // === SECTION: Parcours professionnel ===
  children.push(new Paragraph({ spacing: { before: 400 } }));
  children.push(sectionBanner("Parcours professionnel"));
  children.push(new Paragraph({ spacing: { after: 100 } }));

  data.experiences.forEach((exp) => {
    experienceBlock(exp).forEach((p) => children.push(p));
  });

  // === SECTION: Adéquation de personnalité - AssessFirst ===
  children.push(new Paragraph({ spacing: { before: 400 } }));
  children.push(sectionBanner("Adéquation de personnalité - AssessFirst"));
  children.push(new Paragraph({ spacing: { after: 100 } }));

  children.push(boldParagraph(`Style personnel : ${data.stylePersonnel}`));
  children.push(normalParagraph(data.styleDescription));

  children.push(boldParagraph("Ses points forts"));
  data.pointsForts.forEach((cat) => {
    children.push(boldParagraph(cat.categorie));
    cat.items.forEach((i) => children.push(bulletItem(i)));
  });

  children.push(boldParagraph("Domaines d'amélioration"));
  data.ameliorations.forEach((a) => children.push(bulletItem(a)));

  children.push(boldParagraph("Les activités qu'il privilégie"));
  data.activitesPrivilegiees.forEach((a) => {
    children.push(boldParagraph(`${a.pct} ${a.titre}`));
    children.push(normalParagraph(a.description));
  });

  children.push(boldParagraph("La façon dont il gère son énergie"));
  children.push(normalParagraph(data.gestionEnergie));

  children.push(boldParagraph("Comportement au travail"));
  children.push(normalParagraph(data.comportementTravail));

  children.push(boldParagraph(`Prise de décision : ${data.priseDecision}`));
  children.push(boldParagraph(`Style d'apprentissage : ${data.styleApprentissage}`));

  // Compatibilité managériale
  children.push(boldParagraph("Compatibilité managériale"));

  const cm = data.compatibiliteManageriale;
  children.push(boldParagraph("Tâches"));
  children.push(boldParagraph("Confiez-lui ce type de tâches :"));
  cm.tachesConfier.forEach((t) => children.push(bulletItem(t)));
  children.push(boldParagraph("Évitez de lui confier ça :"));
  cm.tachesEviter.forEach((t) => children.push(bulletItem(t)));

  children.push(boldParagraph("Objectifs"));
  children.push(boldParagraph("Si vous voulez le faire adhérer :"));
  cm.objectifsAdherer.forEach((t) => children.push(bulletItem(t)));
  children.push(boldParagraph("Ce qui échouera sûrement :"));
  cm.objectifsEchouer.forEach((t) => children.push(bulletItem(t)));

  children.push(boldParagraph("Style de management"));
  children.push(boldParagraph("L'encadrement qu'il attend :"));
  cm.managementAttendu.forEach((t) => children.push(bulletItem(t)));
  children.push(boldParagraph("Inutile d'essayer ça :"));
  cm.managementEviter.forEach((t) => children.push(bulletItem(t)));

  children.push(boldParagraph("Reconnaissance"));
  children.push(boldParagraph("La meilleure façon de reconnaître son travail :"));
  cm.reconnaissanceMeilleure.forEach((t) => children.push(bulletItem(t)));
  children.push(boldParagraph("Ce à quoi elle sera moins sensible :"));
  cm.reconnaissanceMoinsSensible.forEach((t) => children.push(bulletItem(t)));

  // === SECTION: Thématiques abordées en entretien ===
  children.push(new Paragraph({ spacing: { before: 400 } }));
  children.push(sectionBanner("Thématiques abordées en entretien"));
  children.push(new Paragraph({ spacing: { after: 100 } }));

  children.push(boldParagraph("Compétences opérationnelles"));
  data.competencesOperationnelles.forEach((c) => children.push(bulletItem(c)));

  children.push(boldParagraph("Qualités managériales"));
  data.qualitesManageriales.forEach((q) => children.push(bulletItem(q)));

  children.push(boldParagraph("Points de vigilance"));
  data.pointsVigilance.forEach((p) => children.push(bulletItem(p)));

  // === SECTION: Actions complémentaires proposées ===
  children.push(new Paragraph({ spacing: { before: 400 } }));
  children.push(sectionBanner("Actions complémentaires proposées"));
  children.push(new Paragraph({ spacing: { after: 100 } }));

  children.push(normalParagraph(data.recommandation));

  // Document
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT,
            size: 21,
            color: COLORS.gray,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [new Paragraph({ children: [] })],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 40 },
                children: [
                  new TextRun({
                    text: "Synthèse de candidature - Page ",
                    font: FONT,
                    size: 16,
                    color: "999999",
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: FONT,
                    size: 16,
                    color: "999999",
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Prodige RH - 27 rue Jules Ferry, 53 000 Laval - SIRET : 893 173 575 00034",
                    font: FONT,
                    size: 14,
                    color: "BBBBBB",
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer as Buffer;
}

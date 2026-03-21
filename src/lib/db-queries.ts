import { sql } from "./db";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserPreferences {
  objectif_ca: number;
  jours_prod: number;
}

export interface TiimeSnapshot {
  exercice_year: number;
  clients_json: unknown[];
  factures_json: unknown[];
  objectif_ca: number;
  jours_prod: number;
  updated_at: string;
}

export interface DocumentLog {
  type_document: string;
  intitule_poste: string | null;
  tokens_utilises: number | null;
  created_at: string;
}

export interface HistoriqueRow {
  annee: number;
  mois: number;
  ca_facture_ttc: number;
  ca_encaisse: number;
  encours: number;
  nb_clients: number;
  objectif_ca_annuel: number;
}

export interface VeilleRapport {
  rapport_json: unknown;
  annotations: unknown[];
  focus: string | null;
  created_at: string;
}

// ─── Preferences ─────────────────────────────────────────────────────────────

export async function getPreferences(email: string): Promise<UserPreferences> {
  if (!sql) return { objectif_ca: 300000, jours_prod: 120 };
  const rows = await sql`
    SELECT objectif_ca, jours_prod FROM user_preferences WHERE user_email = ${email}
  `;
  if (rows.length === 0) return { objectif_ca: 300000, jours_prod: 120 };
  return {
    objectif_ca: Number(rows[0].objectif_ca),
    jours_prod: Number(rows[0].jours_prod),
  };
}

export async function upsertPreferences(
  email: string,
  objectifCA: number,
  joursProd: number
): Promise<void> {
  if (!sql) return;
  await sql`
    INSERT INTO user_preferences (user_email, objectif_ca, jours_prod, updated_at)
    VALUES (${email}, ${objectifCA}, ${joursProd}, NOW())
    ON CONFLICT (user_email) DO UPDATE
      SET objectif_ca = ${objectifCA},
          jours_prod  = ${joursProd},
          updated_at  = NOW()
  `;
}

// ─── Tiime Snapshot ───────────────────────────────────────────────────────────

export async function getSnapshot(
  email: string,
  year: number
): Promise<TiimeSnapshot | null> {
  if (!sql) return null;
  const rows = await sql`
    SELECT exercice_year, clients_json, factures_json, objectif_ca, jours_prod, updated_at
    FROM tiime_snapshots
    WHERE user_email = ${email} AND exercice_year = ${year}
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    exercice_year: Number(r.exercice_year),
    clients_json: r.clients_json as unknown[],
    factures_json: r.factures_json as unknown[],
    objectif_ca: Number(r.objectif_ca),
    jours_prod: Number(r.jours_prod),
    updated_at: String(r.updated_at),
  };
}

export async function upsertSnapshot(
  email: string,
  year: number,
  clients: unknown[],
  factures: unknown[],
  objectifCA: number,
  joursProd: number
): Promise<void> {
  if (!sql) return;
  await sql`
    INSERT INTO tiime_snapshots
      (user_email, exercice_year, clients_json, factures_json, objectif_ca, jours_prod, updated_at)
    VALUES
      (${email}, ${year}, ${JSON.stringify(clients)}, ${JSON.stringify(factures)}, ${objectifCA}, ${joursProd}, NOW())
    ON CONFLICT (user_email, exercice_year) DO UPDATE
      SET clients_json  = ${JSON.stringify(clients)},
          factures_json = ${JSON.stringify(factures)},
          objectif_ca   = ${objectifCA},
          jours_prod    = ${joursProd},
          updated_at    = NOW()
  `;
}

// ─── Documents générés ────────────────────────────────────────────────────────

export async function logDocument(
  email: string,
  type: string,
  intitulePoste?: string | null,
  tokens?: number | null
): Promise<void> {
  if (!sql) return;
  try {
    await sql`
      INSERT INTO documents_generes (user_email, type_document, intitule_poste, tokens_utilises)
      VALUES (${email}, ${type}, ${intitulePoste ?? null}, ${tokens ?? null})
    `;
  } catch {
    // fire-and-forget — never block the main response
  }
}

export async function getDocumentsHistory(
  email: string,
  limit = 50
): Promise<DocumentLog[]> {
  if (!sql) return [];
  const rows = await sql`
    SELECT type_document, intitule_poste, tokens_utilises, created_at
    FROM documents_generes
    WHERE user_email = ${email}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    type_document: String(r.type_document),
    intitule_poste: r.intitule_poste ? String(r.intitule_poste) : null,
    tokens_utilises: r.tokens_utilises ? Number(r.tokens_utilises) : null,
    created_at: String(r.created_at),
  }));
}

// ─── Historique financier ─────────────────────────────────────────────────────

export async function upsertHistoriqueMonth(
  email: string,
  annee: number,
  mois: number,
  kpis: {
    ca_facture_ttc: number;
    ca_encaisse: number;
    encours: number;
    nb_clients: number;
    objectif_ca: number;
  }
): Promise<void> {
  if (!sql) return;
  await sql`
    INSERT INTO historique_financier
      (user_email, annee, mois, ca_facture_ttc, ca_encaisse, encours, nb_clients, objectif_ca_annuel)
    VALUES
      (${email}, ${annee}, ${mois}, ${kpis.ca_facture_ttc}, ${kpis.ca_encaisse},
       ${kpis.encours}, ${kpis.nb_clients}, ${kpis.objectif_ca})
    ON CONFLICT (user_email, annee, mois) DO UPDATE
      SET ca_facture_ttc   = ${kpis.ca_facture_ttc},
          ca_encaisse      = ${kpis.ca_encaisse},
          encours          = ${kpis.encours},
          nb_clients       = ${kpis.nb_clients},
          objectif_ca_annuel = ${kpis.objectif_ca}
  `;
}

export async function getHistorique(
  email: string,
  annee: number
): Promise<HistoriqueRow[]> {
  if (!sql) return [];
  const rows = await sql`
    SELECT annee, mois, ca_facture_ttc, ca_encaisse, encours, nb_clients, objectif_ca_annuel
    FROM historique_financier
    WHERE user_email = ${email} AND annee = ${annee}
    ORDER BY mois ASC
  `;
  return rows.map((r) => ({
    annee: Number(r.annee),
    mois: Number(r.mois),
    ca_facture_ttc: Number(r.ca_facture_ttc),
    ca_encaisse: Number(r.ca_encaisse),
    encours: Number(r.encours),
    nb_clients: Number(r.nb_clients),
    objectif_ca_annuel: Number(r.objectif_ca_annuel),
  }));
}

// ─── Veille cache ─────────────────────────────────────────────────────────────

const VEILLE_TTL_DAYS = 7;

export async function getLatestVeille(
  email: string
): Promise<VeilleRapport | null> {
  if (!sql) return null;
  const rows = await sql`
    SELECT rapport_json, annotations, focus, created_at
    FROM veille_rapports
    WHERE user_email = ${email}
    ORDER BY created_at DESC
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  const age =
    (Date.now() - new Date(String(r.created_at)).getTime()) /
    (1000 * 60 * 60 * 24);
  if (age > VEILLE_TTL_DAYS) return null; // expired
  return {
    rapport_json: r.rapport_json,
    annotations: r.annotations as unknown[],
    focus: r.focus ? String(r.focus) : null,
    created_at: String(r.created_at),
  };
}

export async function saveVeilleRapport(
  email: string,
  focus: string | null,
  rapport: unknown,
  annotations: unknown[],
  tokens?: number | null
): Promise<void> {
  if (!sql) return;
  await sql`
    INSERT INTO veille_rapports (user_email, focus, rapport_json, annotations, tokens_utilises)
    VALUES (${email}, ${focus ?? null}, ${JSON.stringify(rapport)}, ${JSON.stringify(annotations)}, ${tokens ?? null})
  `;
}

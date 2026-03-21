import { readFileSync } from "fs";
import { neon } from "@neondatabase/serverless";

// Load .env.local manually
const envFile = readFileSync(".env.local", "utf-8");
const env = {};
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, "");
}

const url = env.DATABASE_URL_UNPOOLED || env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL not found in .env.local");

console.log("Connecting to Neon...");
const sql = neon(url);

const tables = [
  ["user_preferences", `
    CREATE TABLE IF NOT EXISTS user_preferences (
      user_email    TEXT          PRIMARY KEY,
      objectif_ca   NUMERIC(12,2) NOT NULL DEFAULT 300000,
      jours_prod    SMALLINT      NOT NULL DEFAULT 120,
      updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    )
  `],
  ["tiime_snapshots", `
    CREATE TABLE IF NOT EXISTS tiime_snapshots (
      id              SERIAL PRIMARY KEY,
      user_email      TEXT        NOT NULL,
      exercice_year   SMALLINT    NOT NULL,
      clients_json    JSONB       NOT NULL DEFAULT '[]',
      factures_json   JSONB       NOT NULL DEFAULT '[]',
      objectif_ca     NUMERIC(12,2),
      jours_prod      SMALLINT,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_email, exercice_year)
    )
  `],
  ["documents_generes", `
    CREATE TABLE IF NOT EXISTS documents_generes (
      id              SERIAL PRIMARY KEY,
      user_email      TEXT        NOT NULL,
      type_document   TEXT        NOT NULL,
      intitule_poste  TEXT,
      tokens_utilises INTEGER,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `],
  ["historique_financier", `
    CREATE TABLE IF NOT EXISTS historique_financier (
      id                  SERIAL PRIMARY KEY,
      user_email          TEXT        NOT NULL,
      annee               SMALLINT    NOT NULL,
      mois                SMALLINT    NOT NULL,
      ca_facture_ttc      NUMERIC(12,2),
      ca_encaisse         NUMERIC(12,2),
      encours             NUMERIC(12,2),
      nb_clients          SMALLINT,
      objectif_ca_annuel  NUMERIC(12,2),
      created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_email, annee, mois)
    )
  `],
  ["veille_rapports", `
    CREATE TABLE IF NOT EXISTS veille_rapports (
      id              SERIAL PRIMARY KEY,
      user_email      TEXT        NOT NULL,
      focus           TEXT,
      rapport_json    JSONB       NOT NULL,
      annotations     JSONB       NOT NULL DEFAULT '[]',
      tokens_utilises INTEGER,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `],
  ["clients_entreprises", `
    CREATE TABLE IF NOT EXISTS clients_entreprises (
      id          SERIAL PRIMARY KEY,
      user_email  TEXT NOT NULL,
      nom         TEXT NOT NULL,
      secteur     TEXT,
      ville       TEXT,
      notes       TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `],
  ["mandats", `
    CREATE TABLE IF NOT EXISTS mandats (
      id                      SERIAL PRIMARY KEY,
      client_entreprise_id    INTEGER REFERENCES clients_entreprises(id) ON DELETE SET NULL,
      user_email              TEXT NOT NULL,
      intitule_poste          TEXT NOT NULL,
      statut                  TEXT NOT NULL DEFAULT 'ouvert',
      date_ouverture          DATE,
      date_cloture            DATE,
      honoraires_pct          NUMERIC(5,2),
      notes                   TEXT,
      created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `],
  ["candidats", `
    CREATE TABLE IF NOT EXISTS candidats (
      id                SERIAL PRIMARY KEY,
      user_email        TEXT NOT NULL,
      prenom            TEXT NOT NULL,
      nom               TEXT NOT NULL,
      email_candidat    TEXT,
      telephone         TEXT,
      linkedin_url      TEXT,
      notes             TEXT,
      consentement_date TIMESTAMPTZ,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `],
  ["candidatures", `
    CREATE TABLE IF NOT EXISTS candidatures (
      id           SERIAL PRIMARY KEY,
      mandat_id    INTEGER REFERENCES mandats(id) ON DELETE CASCADE,
      candidat_id  INTEGER REFERENCES candidats(id) ON DELETE CASCADE,
      statut       TEXT NOT NULL DEFAULT 'sourced',
      date_statut  DATE,
      notes        TEXT,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `],
  ["onboarding_suivi", `
    CREATE TABLE IF NOT EXISTS onboarding_suivi (
      id              SERIAL PRIMARY KEY,
      user_email      TEXT NOT NULL,
      code_candidat   TEXT NOT NULL,
      intitule_poste  TEXT,
      etapes          JSONB NOT NULL DEFAULT '{}',
      statut          TEXT NOT NULL DEFAULT 'en_cours',
      date_debut      DATE,
      date_fin        DATE,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_email, code_candidat)
    )
  `],
];

for (const [name, ddl] of tables) {
  try {
    await sql.query(ddl);
    console.log(`✅ ${name}`);
  } catch (err) {
    console.error(`❌ ${name}:`, err.message);
  }
}

console.log("\nMigration terminée ✓");

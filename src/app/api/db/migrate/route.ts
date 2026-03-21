import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-api";
import { sqlUnpooled } from "@/lib/db";

const ADMIN_EMAILS = ["delphine@prodige-rh.fr", "arnaud@prodige-rh.fr"];

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  if (!ADMIN_EMAILS.includes(auth.email)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  if (!sqlUnpooled) {
    return NextResponse.json({ error: "DATABASE_URL_UNPOOLED non configuré" }, { status: 500 });
  }

  try {
    await sqlUnpooled`
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_email    TEXT          PRIMARY KEY,
        objectif_ca   NUMERIC(12,2) NOT NULL DEFAULT 300000,
        jours_prod    SMALLINT      NOT NULL DEFAULT 120,
        updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
      )
    `;

    await sqlUnpooled`
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
    `;

    await sqlUnpooled`
      CREATE INDEX IF NOT EXISTS idx_tiime_snapshots_user ON tiime_snapshots(user_email)
    `;

    await sqlUnpooled`
      CREATE TABLE IF NOT EXISTS documents_generes (
        id              SERIAL PRIMARY KEY,
        user_email      TEXT        NOT NULL,
        type_document   TEXT        NOT NULL,
        intitule_poste  TEXT,
        tokens_utilises INTEGER,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sqlUnpooled`
      CREATE INDEX IF NOT EXISTS idx_docs_user_date ON documents_generes(user_email, created_at DESC)
    `;

    await sqlUnpooled`
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
    `;

    await sqlUnpooled`
      CREATE INDEX IF NOT EXISTS idx_histo_user ON historique_financier(user_email, annee DESC, mois DESC)
    `;

    await sqlUnpooled`
      CREATE TABLE IF NOT EXISTS veille_rapports (
        id              SERIAL PRIMARY KEY,
        user_email      TEXT        NOT NULL,
        focus           TEXT,
        rapport_json    JSONB       NOT NULL,
        annotations     JSONB       NOT NULL DEFAULT '[]',
        tokens_utilises INTEGER,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sqlUnpooled`
      CREATE INDEX IF NOT EXISTS idx_veille_user_date ON veille_rapports(user_email, created_at DESC)
    `;

    // Phase 2 — Pipeline recrutement (schema uniquement)
    await sqlUnpooled`
      CREATE TABLE IF NOT EXISTS clients_entreprises (
        id          SERIAL PRIMARY KEY,
        user_email  TEXT NOT NULL,
        nom         TEXT NOT NULL,
        secteur     TEXT,
        ville       TEXT,
        notes       TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sqlUnpooled`
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
    `;

    await sqlUnpooled`
      CREATE TABLE IF NOT EXISTS candidats (
        id              SERIAL PRIMARY KEY,
        user_email      TEXT NOT NULL,
        prenom          TEXT NOT NULL,
        nom             TEXT NOT NULL,
        email_candidat  TEXT,
        telephone       TEXT,
        linkedin_url    TEXT,
        notes           TEXT,
        consentement_date TIMESTAMPTZ,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sqlUnpooled`
      CREATE TABLE IF NOT EXISTS candidatures (
        id           SERIAL PRIMARY KEY,
        mandat_id    INTEGER REFERENCES mandats(id) ON DELETE CASCADE,
        candidat_id  INTEGER REFERENCES candidats(id) ON DELETE CASCADE,
        statut       TEXT NOT NULL DEFAULT 'sourced',
        date_statut  DATE,
        notes        TEXT,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sqlUnpooled`
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
    `;

    return NextResponse.json({
      ok: true,
      tables: [
        "user_preferences",
        "tiime_snapshots",
        "documents_generes",
        "historique_financier",
        "veille_rapports",
        "clients_entreprises",
        "mandats",
        "candidats",
        "candidatures",
        "onboarding_suivi",
      ],
    });
  } catch (err) {
    console.error("Migration error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur migration" },
      { status: 500 }
    );
  }
}

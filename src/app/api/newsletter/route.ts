import { NextRequest, NextResponse } from "next/server";
import { requireAuth, safeErrorMessage } from "@/lib/auth-api";
import { logDocument, getSnapshot, getLatestVeille } from "@/lib/db-queries";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { mois, annee, ton, message_delphine } = await request.json();

    const now = new Date();
    const targetYear = annee ?? now.getFullYear();
    const targetMonth = mois ?? now.getMonth() + 1;

    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const moisAnnee = `${monthNames[targetMonth - 1]} ${targetYear}`;

    // ── Fetch dashboard snapshot ──────────────────────────────────────────────
    const snapshot = await getSnapshot(auth.email, targetYear);
    let dashboardContext = "Données tableau de bord : non disponibles (importez vos fichiers Tiime).";
    if (snapshot && Array.isArray(snapshot.clients_json) && snapshot.clients_json.length > 0) {
      type ClientRow = { nom?: string; ville?: string; factureeTTC?: number; encours?: number; statut?: string };
      const clients = snapshot.clients_json as ClientRow[];
      const nbClients = clients.length;
      const villes = [...new Set(clients.map((c) => c.ville).filter(Boolean))].slice(0, 8);
      const totalCA = clients.reduce((s, c) => s + (c.factureeTTC ?? 0), 0);
      const totalEncours = clients.reduce((s, c) => s + (c.encours ?? 0), 0);
      const nbEnRetard = clients.filter((c) => c.statut?.toLowerCase().includes("retard")).length;

      dashboardContext = `DONNÉES TABLEAU DE BORD (${moisAnnee}) :
- Nombre d'entreprises clientes actives : ${nbClients}
- Zones géographiques couvertes : ${villes.join(", ") || "Mayenne"}
- CA facturé total (exercice) : ${Math.round(totalCA).toLocaleString("fr-FR")} €
- En-cours de recouvrement : ${Math.round(totalEncours).toLocaleString("fr-FR")} €
- Clients avec paiement en retard : ${nbEnRetard}
Note : utilise ces données de façon agrégée et anonymisée dans la newsletter — ne citer aucun nom de client.`;
    }

    // ── Fetch veille cache ────────────────────────────────────────────────────
    const veille = await getLatestVeille(auth.email);
    let veilleContext = "Veille RH : non disponible (générez une veille depuis le module Veille Tendances).";
    if (veille) {
      type VeilleData = {
        resume_executif?: string;
        tendances_locales?: { titre: string; description: string; impact: string; action_prodige: string }[];
        marche_emploi?: { mayenne?: string; pays_de_la_loire?: string };
        profils_penuriques?: { profil: string; secteur: string; conseil?: string }[];
        chiffres_cles?: { chiffre: string; commentaire: string }[];
      };
      const v = veille.rapport_json as VeilleData;
      const topTendances = (v.tendances_locales ?? []).slice(0, 3);
      const topProfils = (v.profils_penuriques ?? []).slice(0, 3);
      const topChiffres = (v.chiffres_cles ?? []).slice(0, 3);

      veilleContext = `VEILLE RH (${veille.created_at ? new Date(veille.created_at).toLocaleDateString("fr-FR") : "récente"}) :
RÉSUMÉ : ${v.resume_executif ?? ""}
MARCHÉ EMPLOI MAYENNE : ${v.marche_emploi?.mayenne ?? ""}
MARCHÉ PAYS DE LA LOIRE : ${v.marche_emploi?.pays_de_la_loire ?? ""}
TENDANCES LOCALES :
${topTendances.map((t) => `- [Impact ${t.impact}] ${t.titre} : ${t.description} → ${t.action_prodige}`).join("\n")}
PROFILS EN TENSION :
${topProfils.map((p) => `- ${p.profil} (${p.secteur}) : ${p.conseil ?? ""}`).join("\n")}
CHIFFRES CLÉS :
${topChiffres.map((c) => `- ${c.chiffre} — ${c.commentaire}`).join("\n")}`;
    }

    // ── Build prompt ──────────────────────────────────────────────────────────
    const tonLabel = ton === "expert" ? "expert et analytique" : ton === "chaleureux" ? "chaleureux et bienveillant" : "informatif et actionnable";

    const prompt = `Tu es expert en communication RH pour Prodige RH, cabinet de recrutement "Positiv' Recrutement" à Laval (53), Mayenne. Auteure : Delphine Pilorge (gérante).

Tu génères la Newsletter RH mensuelle de Prodige RH, envoyée aux DRH, dirigeants et managers de PME/ETI de Mayenne et Pays de la Loire.

NEWSLETTER : ${moisAnnee}
TON ÉDITORIAL : ${tonLabel} · Valeurs Prodige RH : Proximité, Disponibilité, Générosité, Bienveillance

${dashboardContext}

${veilleContext}

${message_delphine ? `MESSAGE PERSONNALISÉ DE DELPHINE À INTÉGRER DANS L'ÉDITO : "${message_delphine}"` : ""}

Génère la newsletter complète au format JSON suivant :

{
  "sujet": "Objet email accrocheur, 50-60 car, avec le mois et une promesse concrète",
  "preheader": "Texte de prévisualisation email, 85-100 car, complète le sujet",
  "mois_annee": "${moisAnnee}",
  "edito": "Mot de Delphine — 100-130 mots, ton personnel, chaleureux, ancré dans l'actualité locale du mois. Mentionne 1-2 faits concrets de la veille. Signe 'Delphine Pilorge, Prodige RH'.",
  "marche_local": {
    "titre": "Titre accrocheur H2 sur le marché emploi local",
    "contenu": "80-100 mots sur le marché emploi Mayenne/Pays de la Loire ce mois-ci. Chiffres concrets si dispo. Ton expert."
  },
  "tendance_cle": {
    "titre": "Titre H2 : LA tendance RH du mois pour les DRH locaux",
    "contenu": "80-100 mots. Contexte + implications pour les recruteurs locaux.",
    "action_drh": "1 conseil pratique actionnable (1-2 phrases max) pour les DRH clients"
  },
  "profils_en_tension": [
    {
      "profil": "Intitulé du profil",
      "secteur": "Secteur",
      "conseil": "1 phrase courte : pourquoi c'est difficile et quoi faire"
    }
  ],
  "activite_prodige": {
    "accroche": "Phrase d'intro type 'Ce mois-ci, Prodige RH accompagne...' basée sur les données dashboard (agrégées, anonymisées). 1-2 phrases.",
    "point_fort": "1 fait marquant ou anecdote positive (inventé si pas de données) sur l'activité cabinet ce mois-ci"
  },
  "conseil_rh": {
    "titre": "Titre H2 : Le conseil RH du mois pour mieux recruter",
    "contenu": "80-100 mots. Conseil pratique, actionnable, lié aux tendances du mois.",
    "cta": "1-2 phrases d'appel à l'action vers Prodige RH : contact, échange, mission"
  }
}

RÈGLES :
- 2-3 profils en tension max
- Ancrage local fort : Mayenne, Laval, Sarthe, Pays de la Loire
- Ne jamais citer de nom de client
- Réponds UNIQUEMENT avec le JSON valide`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.55,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Réponse vide");

    void logDocument(auth.email, "newsletter-rh", moisAnnee, completion.usage?.total_tokens);
    return NextResponse.json({
      data: JSON.parse(content),
      sources: { hasSnapshot: !!snapshot, hasVeille: !!veille },
      usage: { total_tokens: completion.usage?.total_tokens },
    });
  } catch (err) {
    return NextResponse.json({ error: safeErrorMessage(err) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { kpis, context } = await request.json();

    const prompt = `Tu es un consultant en stratégie et finance travaillant pour Prodige RH, cabinet de recrutement à Laval (53).

Voici les KPIs financiers extraits des exports Tiime (logiciel de facturation) :

## Données globales
- CA facturé TTC : ${kpis.totalFactureTTC.toFixed(0)} €
- CA facturé HT : ${kpis.totalFactureHT.toFixed(0)} €
- CA encaissé : ${kpis.totalEncaisse.toFixed(0)} €
- Encours (impayés) : ${kpis.totalEncours.toFixed(0)} €
- Taux d'encaissement : ${(kpis.tauxEncaissement * 100).toFixed(1)} %
- Objectif CA annuel : ${context.objectifCA.toFixed(0)} €
- Progression vs objectif : ${((kpis.totalFactureTTC / context.objectifCA) * 100).toFixed(1)} %
- Jours de production prévus : ${context.joursProd}

## Clients
- Nombre total de clients actifs : ${kpis.nbClients}
- Clients à jour : ${kpis.nbClientsAJour}
- Clients en retard de paiement : ${kpis.nbClientsEnRetard}
- Panier moyen par client : ${(kpis.totalFactureTTC / kpis.nbClients).toFixed(0)} €

## Top 5 clients par CA facturé
${kpis.topClients.map((c: {nom: string; factureeTTC: number}, i: number) => `${i + 1}. ${c.nom} : ${c.factureeTTC.toFixed(0)} €`).join("\n")}

## Clients en retard
${kpis.clientsEnRetard.length > 0 ? kpis.clientsEnRetard.map((c: {nom: string; encours: number}) => `- ${c.nom} : ${c.encours.toFixed(0)} € d'encours`).join("\n") : "Aucun"}

## Factures (hors brouillons)
- Nombre total de factures : ${kpis.nbFactures}
- Montant moyen par facture : ${kpis.montantMoyen.toFixed(0)} € HT
- Factures payées : ${kpis.statutCounts.payee}
- Factures envoyées (en attente) : ${kpis.statutCounts.envoyee}
- Factures émises (non envoyées) : ${kpis.statutCounts.facturee}
- Avoirs / notes de crédit : ${kpis.nbAvoirs}

## CA mensuel HT
${kpis.parMois.map(([mois, data]: [string, {facture: number; paye: number}]) => `- ${mois} : ${data.facture.toFixed(0)} € facturé, ${data.paye.toFixed(0)} € encaissé`).join("\n")}

---

Sur la base de ces données, propose exactement **5 actions prioritaires et concrètes** pour optimiser la performance commerciale et financière du cabinet.

Chaque action doit :
- Être directement actionnable (pas de vague conseil)
- Citer les données qui justifient l'action
- Avoir un impact mesurable sur le CA ou la trésorerie
- Être réaliste pour un cabinet de recrutement RH de taille humaine

Réponds en JSON strict avec ce format :
{
  "actions": [
    {
      "rang": 1,
      "titre": "Titre court (5-8 mots)",
      "description": "Description actionnable en 2-3 phrases avec les chiffres clés",
      "impact": "Ex: +X€ de trésorerie ou +X% de CA",
      "urgence": "haute | moyenne | faible"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Pas de réponse IA");

    const parsed = JSON.parse(content);
    return NextResponse.json({ ...parsed, usage: { total_tokens: completion.usage?.total_tokens } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

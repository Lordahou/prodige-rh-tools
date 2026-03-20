"use client";

import { useState } from "react";
import Link from "next/link";

interface PostIdea {
  id: number;
  titre: string;
  format: string;
  accroche: string;
  cible: string;
  status: "idee" | "redaction" | "planifie" | "publie";
  date?: string;
  reseau: "LinkedIn" | "Site web" | "Les deux";
}

const POST_IDEAS_INITIAL: PostIdea[] = [
  {
    id: 1,
    titre: "Coulisses d'un recrutement réussi",
    format: "Carrousel LinkedIn (4-5 slides)",
    accroche: "\"On pense que recruter, c'est publier une annonce. En réalité, c'est 47 jours d'un travail invisible.\"",
    cible: "DRH / Dirigeants PME",
    status: "idee",
    reseau: "LinkedIn",
  },
  {
    id: 2,
    titre: "Les 5 erreurs qui font fuir les bons candidats",
    format: "Post texte + image",
    accroche: "\"J'ai perdu un candidat exceptionnel à cause d'un délai de réponse de 10 jours. Voici ce que j'ai changé.\"",
    cible: "Recruteurs / RH",
    status: "idee",
    reseau: "LinkedIn",
  },
  {
    id: 3,
    titre: "Témoignage client : recrutement d'un DGA",
    format: "Post storytelling + photo",
    accroche: "\"Quand une collectivité nous a confié le recrutement de son DGA, on savait que le plus important n'était pas le CV.\"",
    cible: "Collectivités / Secteur public",
    status: "idee",
    reseau: "LinkedIn",
  },
  {
    id: 4,
    titre: "Le Positiv' Recrutement expliqué en 2 minutes",
    format: "Vidéo courte / Reel",
    accroche: "\"Pourquoi nos candidats restent en poste 3x plus longtemps ? Parce qu'on recrute des humains, pas des CV.\"",
    cible: "Grand public / Candidats",
    status: "idee",
    reseau: "Les deux",
  },
  {
    id: 5,
    titre: "Marché de l'emploi en Mayenne : bilan Q1 2026",
    format: "Article blog + infographie",
    accroche: "\"Les profils pénuriques ont changé. Ce qui était rare il y a 2 ans ne l'est plus. Voici la nouvelle carte.\"",
    cible: "Dirigeants / RH Pays de la Loire",
    status: "idee",
    reseau: "Les deux",
  },
  {
    id: 6,
    titre: "Personal branding Delphine : semi-marathon",
    format: "Post personnel + photo",
    accroche: "\"Ce que le semi-marathon m'a appris sur le recrutement : la persévérance paie toujours.\"",
    cible: "Réseau personnel",
    status: "idee",
    reseau: "LinkedIn",
  },
  {
    id: 7,
    titre: "Comment bien préparer son entretien d'embauche",
    format: "Carrousel LinkedIn (6 slides)",
    accroche: "\"En 15 ans de recrutement, j'ai vu 3 000 candidats. Voici les 6 choses qui font vraiment la différence.\"",
    cible: "Candidats",
    status: "idee",
    reseau: "Les deux",
  },
  {
    id: 8,
    titre: "Pourquoi externaliser son recrutement en PME",
    format: "Article blog",
    accroche: "\"Vous pensez que recruter en interne coûte moins cher ? Calculons ensemble le vrai coût d'un recrutement raté.\"",
    cible: "Dirigeants PME",
    status: "idee",
    reseau: "Site web",
  },
  {
    id: 9,
    titre: "Nos valeurs : l'humain au centre du recrutement",
    format: "Post vidéo / Interview",
    accroche: "\"Chez Prodige RH, on ne cherche pas le candidat parfait. On cherche le candidat qui va s'épanouir.\"",
    cible: "Candidats & Clients",
    status: "idee",
    reseau: "LinkedIn",
  },
  {
    id: 10,
    titre: "AssessFirst : notre outil de matching personnalité",
    format: "Post éducatif + visuel",
    accroche: "\"Le CV dit ce que vous avez fait. AssessFirst dit qui vous êtes. C'est pour ça qu'on l'utilise systématiquement.\"",
    cible: "Candidats & RH",
    status: "idee",
    reseau: "LinkedIn",
  },
];

const PROMPTS = [
  {
    titre: "Accroche LinkedIn",
    prompt: `Tu es le community manager de Prodige RH, cabinet de recrutement à Laval spécialisé dans le "Positiv' recrutement". Écris une accroche LinkedIn percutante pour un post sur le sujet suivant : [SUJET]. L'accroche doit : faire 2-3 lignes max, commencer par une phrase choc ou une question, refléter l'approche humaine de Prodige RH, donner envie de lire la suite. Propose 3 variantes.`,
    categorie: "LinkedIn",
  },
  {
    titre: "Article de blog SEO",
    prompt: `Rédige un article de blog de 800 mots pour le site prodigerh.fr sur le sujet : [SUJET]. Structure : titre H1 accrocheur, introduction avec le problème, 3-4 sous-parties H2 avec conseils concrets, conclusion avec CTA vers Prodige RH. Ton : expert mais accessible. Intègre les mots-clés : cabinet recrutement Laval, recrutement durable, [MOT-CLÉ ADDITIONNEL]. Ancrage local Pays de la Loire.`,
    categorie: "Blog",
  },
  {
    titre: "Offre d'emploi attractive",
    prompt: `Rédige une offre d'emploi attractive pour le poste de [INTITULÉ] chez [ENTREPRISE]. L'annonce doit refléter la philosophie Prodige RH "Positiv' recrutement" : mettre en avant l'environnement de travail et les perspectives, pas juste les exigences. Structure : accroche qui donne envie, présentation de l'entreprise (3 lignes), missions clés (5-6 bullets), profil recherché (compétences + savoir-être), ce que l'entreprise offre (4-5 points). Ton engageant et authentique.`,
    categorie: "Recrutement",
  },
  {
    titre: "Synthèse d'entretien (prompt Noota/Jarvi)",
    prompt: `À partir de cette transcription d'entretien, génère une synthèse de candidature structurée pour le poste de [POSTE] chez [ENTREPRISE]. Structure exacte :
1. Contexte de la recherche d'emploi (2-3 lignes)
2. Salaire validé et disponibilité
3. Souhaits particuliers (liste à puces)
4. Motivations clés (liste à puces)
5. Pour chaque expérience : titre, période, rôle, missions quotidiennes (bullets), réalisations, ressenti, raisons du changement
6. Compétences opérationnelles identifiées
7. Points de vigilance
8. Recommandation

Ton professionnel, factuel, à la 3e personne. Utilise le prénom du candidat.`,
    categorie: "Recrutement",
  },
  {
    titre: "Email de prospection commerciale",
    prompt: `Rédige un email de prospection pour Prodige RH, cabinet de recrutement à Laval. Cible : [TYPE DE CIBLE - ex: DRH PME industrielle]. Accroche personnalisée basée sur [ÉLÉMENT DE CONTEXTE]. L'email doit : faire max 8 lignes, proposer un échange de 15 min, mentionner notre approche "Positiv' recrutement", inclure un fait/chiffre du marché local. Ton : professionnel mais chaleureux. Pas de jargon.`,
    categorie: "Commercial",
  },
  {
    titre: "Veille RH hebdomadaire",
    prompt: `Fais-moi un résumé de veille RH/recrutement pour la semaine en cours. Sujets à couvrir : tendances du marché de l'emploi en France et Pays de la Loire, évolutions réglementaires RH, nouvelles pratiques de recrutement, études/chiffres clés. Format : 5-7 bullets avec source et une phrase d'analyse. Identifie 2 sujets qui pourraient faire un bon post LinkedIn pour un cabinet de recrutement positionné sur l'humain.`,
    categorie: "Veille",
  },
];

const STATUS_CONFIG = {
  idee: { label: "Idée", color: "bg-gray-100 text-gray-600" },
  redaction: { label: "En rédaction", color: "bg-blue-100 text-blue-600" },
  planifie: { label: "Planifié", color: "bg-orange-100 text-orange-600" },
  publie: { label: "Publié", color: "bg-green-100 text-green-600" },
};

export default function CommunicationPage() {
  const [activeTab, setActiveTab] = useState<"calendrier" | "prompts">("calendrier");
  const [posts, setPosts] = useState<PostIdea[]>(POST_IDEAS_INITIAL);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const updateStatus = (id: number, status: PostIdea["status"]) => {
    setPosts(posts.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const updateDate = (id: number, date: string) => {
    setPosts(posts.map((p) => (p.id === id ? { ...p, date } : p)));
  };

  const addPost = () => {
    const newId = Math.max(...posts.map((p) => p.id)) + 1;
    setPosts([
      ...posts,
      {
        id: newId,
        titre: "",
        format: "",
        accroche: "",
        cible: "",
        status: "idee",
        reseau: "LinkedIn",
      },
    ]);
  };

  const updatePost = (id: number, field: keyof PostIdea, value: string) => {
    setPosts(posts.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const copyPrompt = (idx: number, prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const filteredPosts = filterStatus === "all" ? posts : posts.filter((p) => p.status === filterStatus);

  return (
    <main className="min-h-screen bg-[#f8fafb]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-[#034B5C] hover:text-[#B5E467]">← Retour</Link>
          <h1 className="text-xl font-bold text-[#034B5C]">Kit Communication</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("calendrier")}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === "calendrier" ? "bg-[#034B5C] text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Calendrier éditorial
          </button>
          <button
            onClick={() => setActiveTab("prompts")}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === "prompts" ? "bg-[#034B5C] text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Bibliothèque de prompts
          </button>
        </div>

        {activeTab === "calendrier" && (
          <>
            {/* Filters */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                {["all", "idee", "redaction", "planifie", "publie"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      filterStatus === s ? "bg-[#034B5C] text-white" : "bg-white text-gray-500 border border-gray-200"
                    }`}
                  >
                    {s === "all" ? "Tous" : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG].label}
                    {s !== "all" && ` (${posts.filter((p) => p.status === s).length})`}
                  </button>
                ))}
              </div>
              <button onClick={addPost} className="bg-[#B5E467] text-[#034B5C] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#a5d455]">
                + Nouvelle idée
              </button>
            </div>

            {/* Post Cards */}
            <div className="space-y-3">
              {filteredPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-[#034B5C] hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_CONFIG[post.status].color}`}>
                          {STATUS_CONFIG[post.status].label}
                        </span>
                        <span className="text-xs text-gray-400">{post.reseau}</span>
                        {post.format && <span className="text-xs text-gray-400">• {post.format}</span>}
                      </div>

                      <input
                        className="w-full font-semibold text-[#034B5C] bg-transparent border-none outline-none text-base"
                        value={post.titre}
                        onChange={(e) => updatePost(post.id, "titre", e.target.value)}
                        placeholder="Titre du post..."
                      />

                      {post.accroche && (
                        <p className="text-sm text-gray-500 mt-1 italic line-clamp-2">
                          {post.accroche}
                        </p>
                      )}

                      {post.cible && (
                        <p className="text-xs text-gray-400 mt-1">Cible : {post.cible}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="date"
                        value={post.date || ""}
                        onChange={(e) => updateDate(post.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded px-2 py-1"
                      />
                      <select
                        value={post.status}
                        onChange={(e) => updateStatus(post.id, e.target.value as PostIdea["status"])}
                        className="text-xs border border-gray-200 rounded px-2 py-1"
                      >
                        <option value="idee">Idée</option>
                        <option value="redaction">En rédaction</option>
                        <option value="planifie">Planifié</option>
                        <option value="publie">Publié</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cadence recommandée */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
              <h2 className="text-lg font-semibold text-[#034B5C] mb-4">Cadence éditoriale recommandée</h2>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="font-semibold text-[#034B5C]">LinkedIn Page Prodige RH</p>
                  <p className="text-gray-600 mt-1">2 posts / semaine</p>
                  <p className="text-xs text-gray-400 mt-1">Offres d'emploi, actualités cabinet, articles</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="font-semibold text-[#034B5C]">LinkedIn Delphine (personal)</p>
                  <p className="text-gray-600 mt-1">1 post / semaine</p>
                  <p className="text-xs text-gray-400 mt-1">Storytelling, convictions, retours d'expérience</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="font-semibold text-[#034B5C]">Blog prodigerh.fr</p>
                  <p className="text-gray-600 mt-1">1 article / mois</p>
                  <p className="text-xs text-gray-400 mt-1">SEO, expertise, marché local</p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "prompts" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              Cliquez sur un prompt pour le copier et le coller dans ChatGPT, Gemini ou Claude. Remplacez les [CROCHETS] par vos données.
            </p>

            {PROMPTS.map((p, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-[#034B5C]">{p.titre}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{p.categorie}</span>
                    </div>
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans leading-relaxed bg-gray-50 rounded-lg p-3">
                      {p.prompt}
                    </pre>
                  </div>
                  <button
                    onClick={() => copyPrompt(idx, p.prompt)}
                    className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      copiedIdx === idx
                        ? "bg-green-100 text-green-600"
                        : "bg-[#034B5C] text-white hover:bg-[#023a48]"
                    }`}
                  >
                    {copiedIdx === idx ? "Copié !" : "Copier"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

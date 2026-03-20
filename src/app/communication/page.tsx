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
  { id: 1, titre: "Coulisses d'un recrutement reussi", format: "Carrousel LinkedIn (4-5 slides)", accroche: "\"On pense que recruter, c'est publier une annonce. En realite, c'est 47 jours d'un travail invisible.\"", cible: "DRH / Dirigeants PME", status: "idee", reseau: "LinkedIn" },
  { id: 2, titre: "Les 5 erreurs qui font fuir les bons candidats", format: "Post texte + image", accroche: "\"J'ai perdu un candidat exceptionnel a cause d'un delai de reponse de 10 jours. Voici ce que j'ai change.\"", cible: "Recruteurs / RH", status: "idee", reseau: "LinkedIn" },
  { id: 3, titre: "Temoignage client : recrutement d'un DGA", format: "Post storytelling + photo", accroche: "\"Quand une collectivite nous a confie le recrutement de son DGA, on savait que le plus important n'etait pas le CV.\"", cible: "Collectivites / Secteur public", status: "idee", reseau: "LinkedIn" },
  { id: 4, titre: "Le Positiv' Recrutement explique en 2 minutes", format: "Video courte / Reel", accroche: "\"Pourquoi nos candidats restent en poste 3x plus longtemps ? Parce qu'on recrute des humains, pas des CV.\"", cible: "Grand public / Candidats", status: "idee", reseau: "Les deux" },
  { id: 5, titre: "Marche de l'emploi en Mayenne : bilan Q1 2026", format: "Article blog + infographie", accroche: "\"Les profils penuriques ont change. Ce qui etait rare il y a 2 ans ne l'est plus. Voici la nouvelle carte.\"", cible: "Dirigeants / RH Pays de la Loire", status: "idee", reseau: "Les deux" },
  { id: 6, titre: "Personal branding Delphine : semi-marathon", format: "Post personnel + photo", accroche: "\"Ce que le semi-marathon m'a appris sur le recrutement : la perseverance paie toujours.\"", cible: "Reseau personnel", status: "idee", reseau: "LinkedIn" },
  { id: 7, titre: "Comment bien preparer son entretien d'embauche", format: "Carrousel LinkedIn (6 slides)", accroche: "\"En 15 ans de recrutement, j'ai vu 3 000 candidats. Voici les 6 choses qui font vraiment la difference.\"", cible: "Candidats", status: "idee", reseau: "Les deux" },
  { id: 8, titre: "Pourquoi externaliser son recrutement en PME", format: "Article blog", accroche: "\"Vous pensez que recruter en interne coute moins cher ? Calculons ensemble le vrai cout d'un recrutement rate.\"", cible: "Dirigeants PME", status: "idee", reseau: "Site web" },
  { id: 9, titre: "Nos valeurs : l'humain au centre du recrutement", format: "Post video / Interview", accroche: "\"Chez Prodige RH, on ne cherche pas le candidat parfait. On cherche le candidat qui va s'epanouir.\"", cible: "Candidats & Clients", status: "idee", reseau: "LinkedIn" },
  { id: 10, titre: "AssessFirst : notre outil de matching personnalite", format: "Post educatif + visuel", accroche: "\"Le CV dit ce que vous avez fait. AssessFirst dit qui vous etes. C'est pour ca qu'on l'utilise systematiquement.\"", cible: "Candidats & RH", status: "idee", reseau: "LinkedIn" },
];

const PROMPTS = [
  { titre: "Accroche LinkedIn", prompt: `Tu es le community manager de Prodige RH, cabinet de recrutement a Laval specialise dans le "Positiv' recrutement". Ecris une accroche LinkedIn percutante pour un post sur le sujet suivant : [SUJET]. L'accroche doit : faire 2-3 lignes max, commencer par une phrase choc ou une question, refleter l'approche humaine de Prodige RH, donner envie de lire la suite. Propose 3 variantes.`, categorie: "LinkedIn" },
  { titre: "Article de blog SEO", prompt: `Redige un article de blog de 800 mots pour le site prodigerh.fr sur le sujet : [SUJET]. Structure : titre H1 accrocheur, introduction avec le probleme, 3-4 sous-parties H2 avec conseils concrets, conclusion avec CTA vers Prodige RH. Ton : expert mais accessible. Integre les mots-cles : cabinet recrutement Laval, recrutement durable, [MOT-CLE ADDITIONNEL]. Ancrage local Pays de la Loire.`, categorie: "Blog" },
  { titre: "Offre d'emploi attractive", prompt: `Redige une offre d'emploi attractive pour le poste de [INTITULE] chez [ENTREPRISE]. L'annonce doit refleter la philosophie Prodige RH "Positiv' recrutement" : mettre en avant l'environnement de travail et les perspectives, pas juste les exigences. Structure : accroche qui donne envie, presentation de l'entreprise (3 lignes), missions cles (5-6 bullets), profil recherche (competences + savoir-etre), ce que l'entreprise offre (4-5 points). Ton engageant et authentique.`, categorie: "Recrutement" },
  { titre: "Synthese d'entretien (prompt Noota/Jarvi)", prompt: `A partir de cette transcription d'entretien, genere une synthese de candidature structuree pour le poste de [POSTE] chez [ENTREPRISE]. Structure exacte :\n1. Contexte de la recherche d'emploi (2-3 lignes)\n2. Salaire valide et disponibilite\n3. Souhaits particuliers (liste a puces)\n4. Motivations cles (liste a puces)\n5. Pour chaque experience : titre, periode, role, missions quotidiennes (bullets), realisations, ressenti, raisons du changement\n6. Competences operationnelles identifiees\n7. Points de vigilance\n8. Recommandation\n\nTon professionnel, factuel, a la 3e personne. Utilise le prenom du candidat.`, categorie: "Recrutement" },
  { titre: "Email de prospection commerciale", prompt: `Redige un email de prospection pour Prodige RH, cabinet de recrutement a Laval. Cible : [TYPE DE CIBLE - ex: DRH PME industrielle]. Accroche personnalisee basee sur [ELEMENT DE CONTEXTE]. L'email doit : faire max 8 lignes, proposer un echange de 15 min, mentionner notre approche "Positiv' recrutement", inclure un fait/chiffre du marche local. Ton : professionnel mais chaleureux. Pas de jargon.`, categorie: "Commercial" },
  { titre: "Veille RH hebdomadaire", prompt: `Fais-moi un resume de veille RH/recrutement pour la semaine en cours. Sujets a couvrir : tendances du marche de l'emploi en France et Pays de la Loire, evolutions reglementaires RH, nouvelles pratiques de recrutement, etudes/chiffres cles. Format : 5-7 bullets avec source et une phrase d'analyse. Identifie 2 sujets qui pourraient faire un bon post LinkedIn pour un cabinet de recrutement positionne sur l'humain.`, categorie: "Veille" },
];

const STATUS_CONFIG = {
  idee: { label: "Idee", color: "bg-[#e8e2d8] text-[#081F34]" },
  redaction: { label: "En redaction", color: "bg-[#034B5C]/10 text-[#034B5C]" },
  planifie: { label: "Planifie", color: "bg-orange-100 text-orange-700" },
  publie: { label: "Publie", color: "bg-[#e8f5d0] text-[#3d6b0f]" },
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
    setPosts([...posts, { id: newId, titre: "", format: "", accroche: "", cible: "", status: "idee", reseau: "LinkedIn" }]);
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
    <main className="min-h-screen bg-[#f0ebe3]">
      <header className="bg-[#081F34]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-[#B5E467] hover:text-white transition-colors text-sm font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
            Retour
          </Link>
          <div className="h-5 w-px bg-gray-600" />
          <h1 className="text-lg font-bold text-white">
            Kit <span className="text-[#B5E467]">Communication</span>
          </h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-3 mb-8">
          {[
            { key: "calendrier" as const, label: "Calendrier editorial", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg> },
            { key: "prompts" as const, label: "Bibliotheque de prompts", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" /></svg> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all ${
                activeTab === tab.key
                  ? "bg-[#081F34] text-white shadow-lg shadow-[#081F34]/20"
                  : "bg-white text-[#081F34] hover:bg-[#e8e2d8]"
              }`}
              style={activeTab !== tab.key ? { boxShadow: "var(--shadow-card)" } : undefined}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "calendrier" && (
          <>
            {/* Filters */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex gap-2">
                {["all", "idee", "redaction", "planifie", "publie"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      filterStatus === s ? "bg-[#034B5C] text-white" : "bg-white text-gray-500 hover:bg-[#e8e2d8]"
                    }`}
                  >
                    {s === "all" ? "Tous" : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG].label}
                    {s !== "all" && ` (${posts.filter((p) => p.status === s).length})`}
                  </button>
                ))}
              </div>
              <button onClick={addPost} className="bg-[#B5E467] text-[#081F34] px-5 py-2 rounded-full text-sm font-bold hover:shadow-lg hover:shadow-[#B5E467]/30 transition-all flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Nouvelle idee
              </button>
            </div>

            {/* Post Cards */}
            <div className="space-y-3">
              {filteredPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl p-5 hover:shadow-lg transition-all" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${STATUS_CONFIG[post.status].color}`}>
                          {STATUS_CONFIG[post.status].label}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">{post.reseau}</span>
                        {post.format && <span className="text-xs text-gray-400">- {post.format}</span>}
                      </div>

                      <input
                        className="w-full font-bold text-[#081F34] bg-transparent border-none outline-none text-base placeholder:text-gray-300"
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
                        <p className="text-xs text-gray-400 mt-2 font-medium">Cible : {post.cible}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="date"
                        value={post.date || ""}
                        onChange={(e) => updateDate(post.id, e.target.value)}
                        className="text-xs border border-[#e8e2d8] rounded-lg px-2 py-1.5 bg-[#faf8f5]"
                      />
                      <select
                        value={post.status}
                        onChange={(e) => updateStatus(post.id, e.target.value as PostIdea["status"])}
                        className="text-xs border border-[#e8e2d8] rounded-lg px-2 py-1.5 bg-[#faf8f5] font-medium"
                      >
                        <option value="idee">Idee</option>
                        <option value="redaction">En redaction</option>
                        <option value="planifie">Planifie</option>
                        <option value="publie">Publie</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cadence */}
            <div className="bg-[#034B5C] rounded-2xl p-6 mt-8 text-white">
              <h2 className="text-lg font-bold mb-4">Cadence editoriale recommandee</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { canal: "LinkedIn Page Prodige RH", freq: "2 posts / semaine", desc: "Offres d'emploi, actualites cabinet, articles" },
                  { canal: "LinkedIn Delphine (personal)", freq: "1 post / semaine", desc: "Storytelling, convictions, retours d'experience" },
                  { canal: "Blog prodigerh.fr", freq: "1 article / mois", desc: "SEO, expertise, marche local" },
                ].map((c) => (
                  <div key={c.canal} className="bg-white/10 backdrop-blur rounded-xl p-4">
                    <p className="font-bold text-[#B5E467] text-sm">{c.canal}</p>
                    <p className="text-white/90 mt-1 text-sm">{c.freq}</p>
                    <p className="text-white/50 mt-1 text-xs">{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "prompts" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              Cliquez pour copier un prompt et le coller dans ChatGPT, Gemini ou Claude. Remplacez les [CROCHETS] par vos donnees.
            </p>

            {PROMPTS.map((p, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="font-bold text-[#081F34]">{p.titre}</h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#e8e2d8] text-[#081F34] font-bold">{p.categorie}</span>
                    </div>
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans leading-relaxed bg-[#faf8f5] rounded-xl p-4 border border-[#e8e2d8]">
                      {p.prompt}
                    </pre>
                  </div>
                  <button
                    onClick={() => copyPrompt(idx, p.prompt)}
                    className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                      copiedIdx === idx
                        ? "bg-[#e8f5d0] text-[#3d6b0f]"
                        : "bg-[#081F34] text-white hover:bg-[#034B5C]"
                    }`}
                  >
                    {copiedIdx === idx ? "Copie !" : "Copier"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="bg-[#B5E467] mt-8">
        <div className="max-w-6xl mx-auto px-6 py-4 text-center text-sm font-semibold text-[#081F34]">
          Prodige RH — 27 rue Jules Ferry, 53 000 Laval
        </div>
      </footer>
    </main>
  );
}

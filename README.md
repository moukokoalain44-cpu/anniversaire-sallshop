# Sall Shop — Espace invité

Une expérience privée en français pour l’anniversaire de Sall Shop, le 28 octobre 2026 à partir de 14h30 GMT à Ouakam, Dakar. L’accueil éditorial présente l’événement, les inspirations vestimentaires et les partenaires Jiji Tattoo et WEBMAJ. Le code commun débloque les détails du programme et une invitation nominative au format PDF.

## Technologies

TanStack Start, React, TypeScript, Vite, Tailwind CSS, Radix Dialog et Lucide. Les fonctions Netlify valident les codes côté serveur. Netlify Database et Drizzle conservent les invitations et les sessions ; pdf-lib et qrcode produisent les PDF. Les images statiques passent par Netlify Image CDN.

## Lancement local

Avec Node 22.13+ et pnpm, installer les dépendances avec `pnpm install`, lier le projet Netlify, puis utiliser `netlify dev --port 8889`. Les fonctions et la base nécessitent le contexte Netlify. Définir la variable secrète `SALL_INVITATION_CODE` dans la configuration d’environnement Netlify, avec accès aux Functions, pour ouvrir les connexions. Aucun code par défaut n’est livré : sans cette configuration, le service refuse les connexions et explique que les accès ne sont pas encore ouverts. Ne jamais enregistrer la valeur dans le dépôt.

Le pipeline applique automatiquement la migration présente dans `netlify/database/migrations`. Ne pas appliquer le schéma manuellement. `db/schema.ts` est la source du schéma.

## Fonctionnement

L’invité saisit son nom et le code commun. Une invitation unique est enregistrée, avec une session de sept jours dans un cookie HttpOnly, Secure et SameSite Strict. Le jeton n’est enregistré qu’après hachage. Les tentatives sont limitées à douze par adresse IP et par tranche de quinze minutes, sans stocker l’adresse en clair. Seuls les détails de programme servis par l’API et le PDF nécessitent une session. L’aperçu de l’événement reste public.

Le QR code contient une référence aléatoire vers la page de vérification. Il ne contient ni le nom, ni le code commun, ni un jeton de connexion. La vérification confirme uniquement l’existence du pass, sans publier les informations personnelles. Elle ne constitue pas un système de pointage ni de contrôle d’identité ; un pass copié reste scannable. Une reconnexion crée une nouvelle invitation ; le cookie existant permet de retrouver le pass pendant sept jours. La liste publique présente uniquement les noms et pseudos saisis lors de la génération du PDF, comme demandé par le propriétaire. Les sessions et références d’invitation ne sont jamais exposées dans cette liste.

Le calendrier télécharge un fichier ICS avec l’heure GMT exacte et sans heure de fin inventée. L’itinéraire ouvre une recherche Google Maps, car aucun point GPS n’a été fourni. Le programme suit l’ordre fourni, sans horaires intermédiaires inventés. Le dress code noir et or est une suggestion d’inspiration. Aucun numéro de téléphone ni parking réservé n’a été inventé.

L’accueil, le dress code et les séquences éditoriales utilisent désormais les photographies fournies par le propriétaire. Le visuel d’illustration généré et les détails dorés restent disponibles parmi les ressources historiques. Les fichiers sont conservés dans `public/img`. Le script `scripts/generate-image.mjs` sert uniquement à la création statique du visuel, sans fonctionnalité IA exposée aux invités.

## Carte d’invitation éditoriale

Après un clic sur « Voir mon invitation » ou un bouton d’invitation, puis validation du code si nécessaire, une fenêtre dédiée présente le composant `src/components/invitation-card.tsx` : une composition polaroïd (40 %) et papier blanc texturé (60 %) sur grand écran, empilée sur mobile. La photo noir et blanc et le logo fournis sont conservés dans `public/img/sall-editorial.png` et `public/img/sall-logo.png` et servis par Netlify Image CDN. Le modèle fourni a guidé la typographie serif et les espaces généreux. Le cadre QR de cet aperçu reste volontairement vide ; le PDF personnel avec son QR unique reste accessible par le parcours sécurisé existant. La carte est masquée à l’arrivée et lors de la déconnexion. Elle ne modifie pas la mise en page du PDF.

Les informations pratiques proposent un lien téléphonique vers le +221 78 582 84 17 et un lien vers le compte Instagram fourni, @sall_shop24. La FAQ reprend ces coordonnées.

## Galerie, animations et liste des invités

Les photos fournies ont été réparties dans l’accueil, le dress code et deux compositions éditoriales. Le logo fourni apparaît aussi dans l’en-tête et le pied de page. Les sections se révèlent au défilement ; les images de galerie suivent un léger effet de parallaxe. L’arrivée sur la page et l’ouverture de l’invitation bénéficient de transitions plus marquées. Les animations sont désactivées si le visiteur préfère réduire les mouvements.

Avant de télécharger le PDF, l’invité complète son nom et son pseudo ; un message indique leur publication dans la liste des invités. La requête authentifiée `POST /api/invitation/pdf` valide ces champs, prépare le PDF, puis enregistre une ligne par invitation dans `invitation_downloads`. Un téléchargement répété actualise cette ligne. La liste publique `GET /api/invitation/guests` ne retourne que les noms et pseudos, en supprimant les paires identiques, et se rafraîchit toutes les quinze secondes quand la page est visible, ainsi qu’après un téléchargement local. L’enregistrement confirme la préparation du PDF, sans pouvoir confirmer que le navigateur l’a sauvegardé. Les invitations anciennes ne sont pas publiées rétroactivement.

La nouvelle migration est livrée pour application automatique par la plateforme ; aucune migration existante n’a été modifiée. Le code commun reste exclusivement une configuration secrète Netlify, à définir dans `SALL_INVITATION_CODE` avec accès aux Functions ; il n’est jamais inscrit dans le dépôt.

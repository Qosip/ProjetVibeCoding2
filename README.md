# Project Analytics - Review Complet du Projet

🚀 **Application d'analyse complète de projets Git avec des visualisations futuristes et minimalistes**

## ✨ Fonctionnalités

### 📊 Analyse Complète
- **Historique complet** : Analyse de TOUT l'historique Git depuis le début du projet
- **Statistiques précises** : Pas de données inventées, tout est basé sur les vrais commits
- **Multi-auteurs** : Détection et analyse de tous les contributeurs

### 🎨 12 Slides de Présentation
1. **Intro** - Page de garde avec le nom du repository
2. **Âge du Projet** - Durée de vie du projet avec dates clés
3. **Commits Totaux** - Nombre total de commits avec moyenne par jour
4. **Contributeurs** - Top contributeur et liste complète
5. **Jour le Plus Actif** - Journée record de commits
6. **Plus Longue Série** - Streak de jours consécutifs
7. **Mots Clés** - Top 10 des mots les plus utilisés dans les messages
8. **Scores de Qualité** - Productivité, Consistance, Qualité (0-100)
9. **Patterns d'Activité** - Graphiques par jour de la semaine et heure de journée
10. **Activité Mensuelle** - Timeline des 12 derniers mois
11. **Timeline Vivante** - Visualisation animée des 50 derniers commits
12. **Résumé** - Vue d'ensemble avec les métriques clés

### 🎭 Design Futuriste Minimaliste
- **Particules animées** : Arrière-plan avec effet WebGL/Canvas
- **Animations fluides** : Transitions et apparitions progressives
- **Glassmorphism** : Effet de verre dépoli moderne
- **Gradients dynamiques** : Couleurs purple/pink avec animations
- **Timeline qui se construit** : Les commits apparaissent un par un

### 📈 Métriques Analysées
- Nombre total de commits
- Durée de vie du projet
- Contributeurs et répartition
- Jour/heure d'activité
- Patterns de commits (fixes, features, refactors, tests, docs, WIP, merges)
- Longueur moyenne des messages
- Mots les plus fréquents
- Plus longue série de jours consécutifs
- Activité mensuelle

## 🚀 Utilisation

### Mode GitHub
1. Cliquez sur "🔗 URL GitHub"
2. Entrez l'URL du repository (ex: `owner/repo` ou `https://github.com/owner/repo`)
3. Cliquez sur "Analyser le Projet 🚀"
4. L'application récupère automatiquement les commits (jusqu'à 1000)

### Mode Manuel  
1. Cliquez sur "📝 Git Log"
2. Dans votre terminal, exécutez :
   ```bash
   git log --all --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso
   ```
3. Copiez-collez le résultat dans le champ
4. Cliquez sur "Analyser le Projet 🚀" ou utilisez "Charger un exemple"

## 🛠️ Technologies

- **Next.js 14** : Framework React avec App Router
- **Framer Motion** : Animations fluides
- **TypeScript** : Typage statique pour la fiabilité
- **TailwindCSS** : Styles utilitaires
- **Canvas API** : Background animé avec particules

## 📦 Installation

```bash
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:3000` ou `http://localhost:3001`

## 🎯 Navigation

- **Flèches** : Boutons "Précédent" / "Suivant"
- **Dots de navigation** : Cliquez sur les points pour aller à un slide spécifique
- **Barre de progression** : En haut de l'écran
- **Bouton Retour** : En haut à gauche pour revenir à l'accueil

## ⚡ Performances

- **Pagination GitHub** : Récupère jusqu'à 1000 commits (10 pages)
- **Optimisation Timeline** : Affiche uniquement les 50 derniers commits
- **Animations optimisées** : Utilise Framer Motion avec GPU
- **Lazy loading** : Les slides ne s'animent que quand ils sont visibles

## 🎨 Personnalisation

Les couleurs principales sont personnalisables via TailwindCSS :
- Purple : `#a855f7`, `#8b5cf6`
- Pink : `#ec4899`, `#d946ef`

## 📝 Format des Données

### Format Avancé (Recommandé)
```
hash|author|email|date|message
```

Exemple :
```
a1b2c3d|John Doe|john@example.com|2024-01-15 10:30:00 +0100|Initial commit
```

### Format Simple (Supporté)
```
hash date message
```

## 🐛 Troubleshooting

### Build Error (Suspense Boundary)
Si vous avez une erreur "useSearchParams should be wrapped in suspense boundary":
- Le fichier `app/review/page.tsx` doit être un wrapper Suspense
- Le contenu principal doit être dans `ReviewPageContent.tsx`

### GitHub Rate Limit
- L'API GitHub publique a une limite de 60 requêtes/heure sans authentification
- Utilisez le mode manuel si vous dépassez la limite

## 🌟 Points Forts

✅ **Données réelles** : Pas de statistiques inventées  
✅ **Design premium** : Animations et effets visuels de qualité  
✅ **Performance** : Optimisé pour gérer de gros projets  
✅ **Responsive** : Fonctionne sur desktop et mobile  
✅ **Type-safe** : 100% TypeScript  

## 📄 Licence

Ce projet est une démonstration de capacités d'analyse Git avec un design moderne.

---

**Créé avec ❤️ par Antigravity**

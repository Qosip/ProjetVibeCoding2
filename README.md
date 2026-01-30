# 🔥 Code Roast Wrapped

**Spotify Wrapped** mais pour tes commits Git. Connecte-toi à n'importe quel repo GitHub public et découvre ton roast personnalisé.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000)

## 📋 Comment utiliser

### Option 1 : URL GitHub (Recommandé)
1. Entre l'URL d'un repo GitHub public (ex: `vercel/next.js` ou `https://github.com/vercel/next.js`)
2. L'app récupère automatiquement les commits
3. Profite de ton roast 🔥

### Option 2 : Git Log manuel
1. Va dans ton repo Git
2. Lance : `git log --oneline --date=short`
3. Colle le résultat dans l'app
4. Profite de ton roast 🔥

## ✨ Features

- 🔗 **Connexion GitHub** - Récupère les commits depuis n'importe quel repo public
- ✨ **Parsing automatique** du git log
- 🎨 **Slideshow animé** style Spotify Wrapped (6 slides)
- 📈 **Timeline animée** qui se construit progressivement
- 🔥 **20+ règles de roast** personnalisées et drôles
- 📊 **Stats détaillées** (commits, streaks, mots favoris, jour le plus actif)
- 📥 **Export PNG** de ta carte roast
- 🌙 **Dark mode** avec glassmorphism premium
- 📱 **Responsive design** mobile-first
- ⚡ **Animations fluides** avec Framer Motion

## 🛠️ Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Framer Motion**
- **html2canvas**

## 📁 Structure

```
app/
  page.tsx            # Landing page
  wrapped/page.tsx    # Slideshow wrapped
components/
  Slide.tsx          # Composant slide animé
  RoastCard.tsx      # Carte roast finale
  Timeline.tsx       # Timeline des commits
lib/
  parser.ts          # Parser git log
  roastEngine.ts     # Moteur de roast (20+ règles)
  export.ts          # Export PNG
```

## 🎯 Format Git Log

Format attendu :
```
hash date message
a1b2c3d 2024-01-15 fix bug
e4f5g6h 2024-01-15 add feature
```

Générer avec :
```bash
git log --oneline --date=short
```

## 📝 License

MIT

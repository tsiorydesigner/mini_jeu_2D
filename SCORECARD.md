# Scorecard - Fonctionnalité de Partage Social

## 📋 Description

La fonctionnalité **Scorecard** permet aux joueurs de générer automatiquement une belle image de leur score à la fin d'une partie et de la partager directement sur Twitter/X ou Discord.

## ✨ Caractéristiques

### 🎨 Génération d'Image
- **Format professionnel** : Image PNG 1200x630 (format Open Graph)
- **Données affichées** :
  - Score total
  - Niveau atteint
  - Temps de jeu
  - Personnage joué
  - Difficulté
- **Design** : Gradient bleu/noir avec bordure dorée, style gaming
- **QR Code** : Code QR intégré pointant vers le jeu

### 📱 Partage Rapide
1. **Twitter/X** : Un clic pour tweeter avec le score, lien du jeu et hashtags
2. **Discord** : Copie du texte formaté au presse-papiers pour coller dans Discord
3. **Téléchargement** : Télécharger l'image en PNG haute résolution

### 🎯 Déclenchement Automatique
- Affichage lors du **Game Over**
- Affichage lors de la **Victoire** (fin du dernier niveau)
- Mise à jour données lors de chaque **Niveau complété**

## 📁 Fichiers Ajoutés

```
JS/
├── scorecard.js          # Générateur d'image (classe ScorecardGenerator)
└── scorecard_ui.js       # Manager UI (classe ScorecardUIManager)

CSS/
└── scorecard.css         # Styles du panneau scorecard

HTML
└── game.html (modifié)   # Ajout du panneau scorecard
```

## 🔧 Intégration

### Librairie QR Code
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
```

### Utilisation en JavaScript

```javascript
// Mettre à jour les données
scorecardUI.updateScoreData(
    score,           // nombre
    level,           // nombre
    timeMs,          // milliseconds
    character,       // 'runner', 'ninja', 'robot', 'mage'
    difficulty       // 'easy', 'normal', 'hard'
);

// Afficher le panneau
scorecardUI.show();

// Cacher le panneau
scorecardUI.hide();

// Générer l'image
const imageUrl = await scorecardGenerator.generateScorecardImage(
    score, level, timeMs, character, difficulty
);
```

## 🎮 Flux Utilisateur

### Fin de Partie
1. Le joueur perd toutes ses vies
2. Apparition du message "Game Over"
3. **Affichage automatique du panneau Scorecard** ✨
4. Le joueur peut :
   - Voir son image de score
   - Partager sur Twitter
   - Copier le texte pour Discord
   - Télécharger l'image

### Fin de Jeu
1. Le joueur bat le boss final
2. Apparition du message "Victoire"
3. **Affichage automatique du panneau Scorecard** ✨
4. Options de partage disponibles

## 📊 Format de l'Image

Dimensions : **1200×630px** (Standard Open Graph)

Éléments :
- Titre principal
- Score formaté
- Niveau atteint
- Temps de jeu
- Personnage et difficulté
- QR Code (120×120px)
- URL du site

## 🐦 Twitter/X Partage

**Format du tweet** :
```
🎮 J'ai atteint le score de X au niveau Y avec Character dans Mod Runner! Peux-tu faire mieux? 🚀

URL: https://modrunner.nosytech.com
Hashtags: #ModRunner #2DPlatformer #GameDev #Gaming
```

## 💬 Discord Partage

**Format texte** :
```
🎮 **Mod Runner** - Nouveau record!
**Score:** X
**Niveau:** Y
**Personnage:** Character
Joue maintenant: https://modrunner.nosytech.com
```

## 🎨 Personnalisation

Pour modifier le design :

### Couleurs (scorecard.js)
```javascript
// Gradient
gradient.addColorStop(0, '#1a1a2e');  // Couleur 1
gradient.addColorStop(0.5, '#0f3460');  // Couleur 2
gradient.addColorStop(1, '#16213e');  // Couleur 3

// Texte
ctx.fillStyle = '#FFD700';  // Or
ctx.fillStyle = '#FFFFFF';  // Blanc
```

### Taille de l'image
```javascript
this.cardWidth = 1200;   // Largeur
this.cardHeight = 630;   // Hauteur
this.qrSize = 150;       // Taille QR Code
```

### Styles du panneau (scorecard.css)
Modifier les variables de couleur et les animations selon les besoins.

## 🔗 URLs Générées

- **QR Code** : `https://modrunner.nosytech.com`
- **Partage Twitter** : `https://twitter.com/intent/tweet?...`

## ✅ Compatibilité

- ✅ Desktop (PC, Mac, Linux)
- ✅ Mobile (iOS, Android)
- ✅ Responsive (s'adapte aux petits écrans)
- ✅ Navigateurs modernes (Chrome, Firefox, Safari, Edge)

## 🐛 Dépannage

### Le QR Code ne s'affiche pas
- Vérifier que la CDN de qrcode.js est accessible
- Console.log pour voir les erreurs

### L'image ne se télécharge pas
- Vérifier les permissions du navigateur
- Essayer un autre navigateur

### Partage Twitter n'ouvre pas
- Vérifier la connexion internet
- Popup bloquée ? Vérifier les paramètres du navigateur

## 📈 Améliorations Futures

- [ ] Thème sombre/clair du scorecard
- [ ] Statistiques additionnelles
- [ ] Partage via QR code directement
- [ ] Classement en ligne
- [ ] Animations lors de la génération
- [ ] Cachés de récompenses par niveau

## 📝 Notes de Développement

- La génération d'image utilise le Canvas API
- QR Code généré via `qrcode.js` (CDN)
- Stockage des données en localStorage
- Partage via URLs standards (Twitter API, Discord UX)

---

**Version**: 1.0  
**Dernière mise à jour**: Avril 2026  
**Auteur**: Mod Runner Dev Team

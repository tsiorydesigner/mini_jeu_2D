# Guide de Test - Fonctionnalité Scorecard

## 🎯 Résumé de la Fonctionnalité

La fonctionnalité **Scorecard** génère automatiquement une belle image de score à la fin d'une partie et permet :
- 🎨 **Générer une image** avec les stats du joueur + QR code
- 🐦 **Partager sur Twitter/X** en un clic
- 💬 **Partager sur Discord** avec copie au presse-papiers
- ⬇️ **Télécharger l'image** en PNG haute résolution

## 📦 Fichiers Ajoutés/Modifiés

### Fichiers Créés
```
✅ JS/scorecard.js         - Générateur d'image Canvas
✅ JS/scorecard_ui.js      - Manager UI et interactions
✅ CSS/scorecard.css       - Styles du panneau
✅ SCORECARD.md            - Documentation complète
```

### Fichiers Modifiés
```
✅ game.html               - Ajout CSS, scripts, HTML panneau
✅ JS/game.js              - Intégration aux états GAME_OVER, WIN, LEVEL_CLEAR
```

## 🧪 Cas de Test

### Test 1 : Affichage au Game Over
**Étapes** :
1. Lancer le jeu
2. Laisser le joueur perdre toutes ses vies
3. ✓ Vérifier que le panneau scorecard s'affiche automatiquement

**Attendu** :
- Panneau scorecard visible avec animation
- Stats correctes affichées (score, niveau, temps, perso)
- Image preview visible
- Boutons Twitter/Discord/Télécharger actifs

---

### Test 2 : Affichage à la Victoire
**Étapes** :
1. Lancer le jeu
2. Aller jusqu'au niveau 10 et battre le boss
3. ✓ Vérifier que le panneau scorecard s'affiche automatiquement

**Attendu** :
- Panneau affiche "Victoire"
- Stats finales correctes
- Image de score générée
- QR code visible

---

### Test 3 : Partage Twitter
**Étapes** :
1. Causer un Game Over
2. Cliquer sur le bouton "𝕏 Twitter/X"
3. ✓ Vérifier que Twitter s'ouvre dans une popup

**Attendu** :
- Nouvelle fenêtre Twitter s'ouvre
- Tweet pré-rempli avec :
  - Score du joueur
  - Niveau atteint
  - Personnage joué
  - Hashtags (#ModRunner, #GameDev, etc.)
  - Lien du jeu

**Texte attendu** :
```
🎮 J'ai atteint le score de X au niveau Y avec Character dans Mod Runner! Peux-tu faire mieux? 🚀
```

---

### Test 4 : Partage Discord
**Étapes** :
1. Causer un Game Over
2. Cliquer sur "💬 Discord"
3. ✓ Notification "Texte copié"
4. Ouvrir Discord et coller

**Attendu** :
- Message d'alerte "Texte Discord copié au presse-papiers!"
- Texte formaté collable :
  ```
  🎮 **Mod Runner** - Nouveau record!
  **Score:** X
  **Niveau:** Y
  **Personnage:** Character
  Joue maintenant: https://modrunner.nosytech.com
  ```

---

### Test 5 : Téléchargement Image
**Étapes** :
1. Causer un Game Over
2. Cliquer sur "⬇️ Télécharger"
3. ✓ Vérifier le fichier téléchargé

**Attendu** :
- Fichier PNG téléchargé : `modrunner-score-SCORE-TIMESTAMP.png`
- Dimensions : 1200×630px
- Contient l'image du scorecard avec le QR code

---

### Test 6 : QR Code
**Étapes** :
1. Causer un Game Over
2. Observer le QR code dans le panneau
3. Scanner avec un téléphone
4. ✓ Vérifier qu'il redirige vers le site

**Attendu** :
- QR code visible dans le panneau (coin bas droit)
- Scanner = redirection vers `https://modrunner.nosytech.com`

---

### Test 7 : Fermeture du Panneau
**Étapes** :
1. Afficher le scorecard (Game Over)
2. Cliquer sur le bouton "×" ou sur l'overlay
3. ✓ Vérifier que le panneau se ferme

**Attendu** :
- Panneau disparaît avec animation
- Retour au menu Game Over
- Overlay disparaît

---

### Test 8 : Responsive Mobile
**Étapes** :
1. Ouvrir le jeu sur mobile (DevTools ou téléphone réel)
2. Causer un Game Over
3. ✓ Vérifier l'affichage du panneau

**Attendu** :
- Panneau s'adapte à la taille d'écran
- Texte lisible sur petit écran
- Boutons cliquables
- Image redimensionnée (max 90vw)

---

### Test 9 : Mise à Jour Stats Niveau Complété
**Étapes** :
1. Terminer un niveau sans être Game Over
2. Observer que les stats se mettent à jour

**Attendu** :
- Données scorecard mises à jour
- Pas d'affichage du panneau (non Game Over)
- Données prêtes si Game Over après

---

### Test 10 : Formats Correctement Affichés
**Étapes** :
1. Causer Game Over avec score > 1000
2. Vérifier l'affichage du score
3. Observer le temps de jeu

**Attendu** :
- **Score** : formaté avec séparateurs (ex: "1 234 567")
- **Temps** : au format MM:SS ou HH:MM:SS
- **Personnage** : première lettre en majuscule
- **Difficulté** : label français correct

---

## ⚙️ Configuration à Tester

### Personnages
```javascript
✓ 'runner'
✓ 'ninja'
✓ 'robot'
✓ 'mage'
```

### Difficultés
```javascript
✓ 'easy'   → "Facile"
✓ 'normal' → "Normal"
✓ 'hard'   → "Difficile"
```

---

## 🔍 Vérifications Techniques

### Console (F12)
```javascript
// Vérifier que les objets existent
window.scorecardGenerator    // Doit être défini
window.scorecardUI           // Doit être défini
```

### Erreurs à Surveiller
```
❌ "scorecardGenerator is not defined"
❌ "QRCode is not defined"
❌ "Cannot read property 'getElementById'"
❌ "Failed to load CSS"
```

### Network (DevTools)
```
✓ scorecard.js - 200 OK
✓ scorecard_ui.js - 200 OK
✓ scorecard.css - 200 OK
✓ qrcode.min.js (CDN) - 200 OK
```

---

## 📱 Tests de Compatibilité Navigateur

| Navigateur | Desktop | Mobile | QR | Partage |
|-----------|---------|--------|----|----|
| Chrome | ✓ | ✓ | ✓ | ✓ |
| Firefox | ✓ | ✓ | ✓ | ✓ |
| Safari | ✓ | ✓ | ✓ | ✓ |
| Edge | ✓ | ✓ | ✓ | ✓ |

---

## 🐛 Débogage

### Si le panneau ne s'affiche pas
1. Ouvrir Console (F12)
2. Chercher les erreurs
3. Vérifier : `console.log(window.scorecardUI)`
4. Vérifier que `game.js` est chargé en dernier

### Si l'image ne se génère pas
1. Vérifier la console
2. Tester avec des valeurs simples : `scorecardGenerator.generateScorecardImage(100, 1, 0, 'runner', 'normal')`
3. Vérifier que Canvas 2D est supporté

### Si le QR ne s'affiche pas
1. Vérifier que `qrcode.min.js` est chargé (Network tab)
2. Tester manuellement : `window.QRCode`
3. Si undefined, CDN est bloquée

### Si le partage Twitter ne fonctionne pas
1. Vérifier la popup n'est pas bloquée
2. Vérifier l'URL Twitter (doit contenir `intent/tweet`)
3. Tester manuellement l'URL générée

---

## ✅ Checklist Complète

- [ ] Fichiers `.js` et `.css` présents dans les répertoires
- [ ] `game.html` contient les imports et le panneau
- [ ] `game.js` contient les appels `scorecardUI.updateScoreData()` et `.show()`
- [ ] Console sans erreurs au chargement
- [ ] Game Over affiche le panneau
- [ ] Victoire affiche le panneau
- [ ] Twitter partage fonctionne
- [ ] Discord copie fonctionne
- [ ] Téléchargement crée un fichier PNG
- [ ] QR code visible et fonctionnel
- [ ] Responsive OK sur mobile
- [ ] Fermeture du panneau OK

---

## 🚀 Prochaines Étapes (Optionnel)

- [ ] Ajouter animation lors de la génération d'image
- [ ] Permettre de customiser le design du scorecard
- [ ] Intégrer un système de classement
- [ ] Ajouter des effets sonores au partage
- [ ] Créer des variantes du scorecard par thème
- [ ] Ajouter d'autres plateformes de partage (Facebook, Reddit)

---

## 📞 Support

Si vous rencontrez un problème :
1. Vérifier la console (F12)
2. Vérifier les fichiers sont présents
3. Vérifier le chargement des scripts dans Network tab
4. Relancer le navigateur (Ctrl+F5)

**Version** : 1.0  
**Date** : Avril 2026

# 🚀 DÉMARRAGE RAPIDE - SCORECARD

## ⚡ 30 Secondes pour Comprendre

```
Joueur perd     → Panneau Scorecard ✨
        ↓
   [Voir Image]
        ↓
   [Twitter] [Discord] [Télécharger]
        ↓
    Partage ! 🎉
```

## 📦 Ce qui a été livré

✅ Code source (3 fichiers JS/CSS)  
✅ Documentation (6 fichiers)  
✅ Tests (10 cas documentés)  
✅ Intégration (complète et testée)  

## 🎯 3 Actions Principales

### 1. Vérifier l'Installation
```bash
# Vérifier que les fichiers existent
ls -la JS/scorecard.js        ✅
ls -la JS/scorecard_ui.js     ✅
ls -la CSS/scorecard.css      ✅
```

### 2. Tester le Jeu
```bash
# Ouvrir game.html dans un navigateur
open game.html

# OU démarrer serveur local
python -m http.server 8000
# → http://localhost:8000/game.html
```

### 3. Causer un Game Over
```
1. Lancer le jeu
2. Laisser mourir le joueur (perdre toutes les vies)
3. Voir le panneau scorecard apparaître ✨
4. Tester les boutons Twitter/Discord/Télécharger
```

## 📚 Documentation

| Fichier | Lire si... | Temps |
|---|---|---|
| README_SCORECARD.md | Vous voulez une overview | 5 min |
| TEST_SCORECARD.md | Vous faites des tests | 20 min |
| SCORECARD.md | Vous devez modifier le code | 20 min |
| VERIFICATION_SCORECARD.md | Vous déployez en production | 10 min |

## 🎮 Guide Test Rapide

### Cas 1 : Affichage
```
✓ Lancer jeu
✓ Perdre toutes vies
✓ Vérifier panneau s'affiche
✓ Vérifier image visible
✓ Vérifier stats correctes
```

### Cas 2 : Partage Twitter
```
✓ Dans panneau, cliquer Twitter
✓ Nouvelle fenêtre Twitter s'ouvre
✓ Tweet pré-rempli visible
✓ Lien du jeu présent
✓ Hashtags présents
```

### Cas 3 : Partage Discord
```
✓ Dans panneau, cliquer Discord
✓ Message "Texte copié"
✓ Ouvrir Discord
✓ Coller (Ctrl+V)
✓ Vérifier texte formaté
```

### Cas 4 : Téléchargement
```
✓ Dans panneau, cliquer Télécharger
✓ Fichier PNG téléchargé
✓ Vérifier nom : modrunner-score-SCORE-TIMESTAMP.png
✓ Vérifier taille : 80-150 KB
✓ Vérifier image s'affiche
```

## 🔍 Vérification Rapide

Ouvrir Console (F12) et tester :

```javascript
// Vérifier que les objets existent
console.log(window.scorecardGenerator);  // Doit afficher la classe
console.log(window.scorecardUI);         // Doit afficher la classe
console.log(window.QRCode);              // Doit afficher la librairie

// Tester la génération d'image
await scorecardGenerator.generateScorecardImage(1000, 5, 300000, 'runner', 'normal');
// Doit retourner une data URL PNG
```

## 📊 Résumé Installation

```
AVANT                          APRÈS
─────────────────────────────────────────
No scorecard                   ✅ Scorecard généré
No image sharing               ✅ Partage social
No mobile QR                   ✅ QR code intégré
No Twitter integration         ✅ Tweet en 1 clic
No Discord sharing             ✅ Texte formaté
```

## ⚙️ Configuration

**Aucune configuration requise !** 🎉

Tout fonctionne out-of-the-box :
- ✅ Bouton partage déjà dans menu
- ✅ Scorecard s'affiche automatique
- ✅ Images générées localement
- ✅ Partages utilisent URLs standards

## 🆘 Dépannage Rapide

### Panneau ne s'affiche pas
```javascript
// Vérifier dans console
scorecardUI.show();  // Force l'affichage
```

### Image ne génère pas
```javascript
// Tester manuellement
await scorecardGenerator.generateScorecardImage(100, 1, 0, 'runner', 'normal');
```

### QR code ne s'affiche pas
```javascript
// Vérifier qrcode.js chargé
console.log(window.QRCode);  // Doit être défini
```

## 🎯 Checklist Déploiement

- [ ] Copier `JS/scorecard.js`
- [ ] Copier `JS/scorecard_ui.js`
- [ ] Copier `CSS/scorecard.css`
- [ ] game.html contient les imports
- [ ] QR code CDN accessible
- [ ] Tester Game Over
- [ ] Tester partages Twitter/Discord
- [ ] Tester téléchargement

## 📱 Mobile Testing

```bash
# Sur Android/iOS, scanner le QR code du scorecard
# → Doit rediriger vers https://modrunner.nosytech.com

# Ou tester responsive sur DevTools
# F12 → Toggle device toolbar → Tester sur mobile
```

## 🚀 Next Steps

1. **Vérifier** → Voir fichiers présents
2. **Tester** → Causer un Game Over
3. **Déployer** → Copier sur serveur
4. **Monitor** → Vérifier console sans erreurs

## 📞 Support

```
Q: Où commencer ?
A: Lire README_SCORECARD.md (5 min)

Q: Comment ça marche ?
A: Lire SCORECARD.md (20 min)

Q: Comment tester ?
A: Lire TEST_SCORECARD.md (suivre 10 cas)

Q: Comment déployer ?
A: Lire VERIFICATION_SCORECARD.md

Q: Problème ?
A: Vérifier console (F12) pour erreurs
```

## 🎉 Vous êtes Prêt !

```
✅ Fichiers installés
✅ Code intégré
✅ Tests prêts
✅ Documentation complète

→ Lancer le jeu !
→ Profiter du scorecard ! 🚀
```

---

## 🔗 Fichiers Importants

```
📌 Installation      → VERIFICATION_SCORECARD.md
📌 Utilisation       → README_SCORECARD.md
📌 Tests             → TEST_SCORECARD.md
📌 Architecture      → ARCHITECTURE_SCORECARD.md
📌 Source code       → JS/scorecard.js & scorecard_ui.js
```

---

**Status** : ✅ COMPLET ET PRÊT  
**Version** : 1.0  
**Date** : Avril 2026

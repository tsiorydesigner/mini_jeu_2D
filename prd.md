# Product Requirements Document (PRD) - Mod Runner

## Vue d'ensemble
**Mod Runner** est un jeu de plateforme 2D developpe en HTML5 Canvas avec JavaScript vanilla. Le joueur contrôle un personnage qui doit collecter des pièces, eviter les ennemis et les pièges pour terminer les niveaux.

---

## Informations du Projet

| Attribut | Valeur |
|----------|--------|
| **Nom** | Mod Runner |
| **Type** | Jeu de plateforme 2D |
| **Technologie** | HTML5, CSS3, JavaScript Vanilla |
| **Canvas** | 800x480 pixels |
| **Tile Size** | 32 pixels |
| **Nombre de niveaux** | 10 |
| **Difficultes** | Facile, Normal, Difficile |
| **Personnages** | Runner, Ninja, Robot |

---

## Architecture Technique

### Structure des Fichiers
```
mini_jeu_2D/
├── index.html           # Page d'accueil
├── game.html           # Page de jeu
├── CSS/
│   ├── home.css        # Styles page d'accueil
│   ├── style.css       # Styles du jeu
│   └── skills.css      # Styles systeme de competences
├── JS/
│   ├── game.js         # Logique principale du jeu
│   ├── skills.js       # Systeme de competences
│   └── skills_ui.js    # Interface competences
├── generate_levels.py  # Generateur de niveaux Python
└── skills.sh           # Script d'installation competences
```

### Technologies Utilisees
- **HTML5 Canvas** pour le rendu graphique
- **Web Audio API** pour la musique et les effets sonores
- **localStorage** pour la sauvegarde des donnees
- **CSS3** pour les animations et effets visuels

---

## Mecaniques de Jeu

### Contrôles
| Touche | Action |
|--------|--------|
| `←` `→` | Deplacement gauche/droite |
| `↑` ou `Espace` | Saut / Double saut |
| `Shift` | Dash rapide |
| `P` | Pause |
| `S` | Ouvrir/Fermer panneau competences |
| `1-9` | Charger niveau (mode libre) |
| `0` | Charger niveau 10 (mode libre) |

### Physique du Joueur
- **Gravite**: 0.55 (ajustable par difficulte)
- **Frottement**: 0.84
- **Acceleration**: 4.6
- **Force de saut**: -11.3
- **Vitesse de chute max**: 13
- **Coyote time**: 7 frames
- **Jump buffer**: 7 frames
- **Dash**: Vitesse 11, cooldown 50 frames

### Systeme de Vie
- **Vies de base**: 3 (2 en mode difficile)
- **Invincibilite apres degat**: 80 frames
- **Bouclier power-up**: 1 utilisation

---

## Elements de Gameplay

### Types de Blocs
| Symbole | Element | Description |
|---------|---------|-------------|
| `.` | Vide | Espace libre |
| `#` | Plateforme | Surface solide |
| `C` | Piece | +50 points |
| `S` | Pique | Mort instantanee |
| `P` | Power-up | Bouclier + Dash |
| `K` | Checkpoint | Point de reapparition |
| `E` | Ennemi (Walker) | Patrouille horizontale |
| `J` | Ennemi (Jumper) | Saute periodiquement |
| `F` | Ennemi (Flyer) | Vole en vague |

### Types d'Ennemis
1. **Walker (E)**
   - Patrouille horizontale entre deux points
   - Vitesse: 1.2 + (niveau * 0.1)
   - Points: +120 (si ecrase)

2. **Jumper (J)**
   - Saute toutes les 90 frames
   - Deplacement lateral reduit (0.6×)
   - Apparaît niveau 5+

3. **Flyer (F)**
   - Mouvement sinusoidal vertical
   - Vitesse: 0.8×
   - Apparaît niveau 7+

### Boss Final (Niveau 10)
- **Position**: Fin du niveau
- **Taille**: 80×72 pixels
- **HP**: 12 points
- **Comportement**: Patrouille horizontale
- **Attaque**: Spawne des walkers toutes les 80 frames
- **Recompense**: +1000 points

---

## Systeme de Niveaux

### Generation Procedurale
Les niveaux sont generes a partir d'une carte de base avec:
- **Dimensions**: 46×18 tiles (1472×576 pixels)
- **Generation**: Script Python `generate_levels.py`
- **Parametres ajustables**: width, height, levels, seed

### Elements par Niveau
| Element | Formule |
|---------|---------|
| Plateformes | 8 + (niveau * 2) |
| Pieces | 14 + (niveau * 2) |
| Ennemis | 4 + niveau |
| Piques | 3 + (niveau / 2) |

### Themes Visuels (10 themes)
1. Foret (vert)
2. Desert (orange)
3. Glace (bleu clair)
4. Lave (rouge sombre)
5. Jungle (vert fonce)
6. Ruines (marron)
7. Neon (violet/bleu)
8. Nuit (bleu nuit)
9. Steam (gris/bronze)
10. Cosmos (violet profond)

---

## Systeme de Competences (Skills)

### Architecture
- **Fichier**: `JS/skills.js` + `JS/skills_ui.js`
- **CSS**: `CSS/skills.css`
- **Points**: 1 point par niveau complete
- **Deblocage**: Automatique par niveau atteint

### Liste des Competences

| Competence | Niveau | Description | Effet |
|------------|--------|-------------|-------|
| **Double Jump Pro** | 2 | Triple saut avec rotation aerienne | 3 sauts max, controle aerien ameliore |
| **Dash Eclair** | 3 | Deplacement rapide invincible | Vitesse 15, 200ms, cooldown 1s |
| **Wall Jump Master** | 4 | Saut murais et adherence | Glissade lente, rebond sur parois |
| **Collectionneur Power-Ups** | 5 | Magnetisme des pieces | Portee 80px, multiplicateur x2 |
| **Bouclier Energetique** | 6 | Protection contre degats | 3 HP bouclier, reduction 50% |
| **Controle du Temps** | 7 | Ralentissement temporel | Slow-motion 0.3x, 3s duree |
| **Vitesse Supreme** | 8 | Vitesse deplacement x2.5 | Multiplicateur 2.5x, effet trail |
| **Controle Gravitationnel** | 9 | Inversion gravite | Gravite reduite, flottaison |
| **Maitre des Combos** | 10 | Combos enchaines | Multiplicateur max x5, fenetre 2s |
| **Pouvoir Ultime** | 10 | Mode surpuissant | Toutes competences actives, 10s duree |

### Interface Utilisateur
- **Bouton**: "Competences" dans le menu principal
- **Raccourci**: Touche `S`
- **Affichage**: Grille de cartes avec etats (verrouille/debloque/actif)
- **Points**: Compteur visuel des points disponibles

---

## Systeme Audio

### Musique Procedurale
- **Generation**: Web Audio API en temps reel
- **Tempo**: 170ms par pas (environ 353 BPM)
- **Instruments**: Sine (lead), Triangle (niveau 7+), Sawtooth (bass), Square (hihat)
- **Echelle**: Base 96Hz + niveau * 4

### Effets Sonores
| Evenement | Frequence | Duree |
|-----------|-----------|-------|
| Saut | 520Hz | 0.05s |
| Dash | 220Hz | 0.05s |
| Piece | 800Hz | 0.03s |
| Ennemi tue | 620Hz | 0.04s |
| Degat boss | 240-440Hz | 0.06s |

### Parametres
- **Volume**: 0-100% (slider dans options)
- **Gain musique**: volume * 0.024
- **Gain SFX**: volume * 0.03

---

## Sauvegarde et Progression

### Donnees Sauvegardees (localStorage)
- **Cle**: `mod_runner_save_v3`
- **Niveau debloque**: 1-10
- **Meilleurs temps**: Par niveau en secondes
- **Options**: Mode libre, difficulte, volume, personnage

### Format JSON
```json
{
  "unlockedLevel": 5,
  "bestTimes": { "1": 45, "2": 62, ... },
  "options": {
    "freeMode": true,
    "difficulty": "normal",
    "volume": 0.7,
    "selectedCharacter": "runner"
  }
}
```

---

## Etats du Jeu

```javascript
STATE = {
  MENU: 0,         // Ecran titre/options
  PLAYING: 1,      // Jeu en cours
  GAME_OVER: 2,    // Partie perdue
  LEVEL_CLEAR: 3,  // Niveau termine
  WIN: 4,          // Victoire finale
  PAUSED: 5        // Pause
}
```

---

## Rendu Graphique

### Systeme de Camera
- **Type**: Camera fluide avec lissage (0.1 factor)
- **Cible**: Centre du joueur
- **Limites**: Bloquee aux bords du niveau

### Effets Visuels
- **Particules**: Explosions lors collisions/morts
- **Bobbing**: Animation des pieces (sinusoidal)
- **Invincibilite**: Clignotement du joueur

### HUD (Heads-Up Display)
- **Score**: Points cumules
- **Vies**: Coeurs restants
- **Niveau**: Actuel / Total

---

## Generateur de Niveaux Python

### Utilisation
```bash
python generate_levels.py --levels 10 --width 46 --height 18 --seed 42
```

### Fonctionnalites
- Generation procedurale des cartes
- Placement intelligent des elements
- Zone de spawn protegee
- Export JSON compatible

### Algorithmes
1. Creation grille vide
2. Placement du sol
3. Generation plateformes aleatoires
4. Placement objects (pieces, ennemis, piques)
5. Verification zone spawn

---

## Modes de Jeu

### Mode Libre (Free Mode)
- **Acces**: Tous niveaux des le debut
- **Activation**: Checkbox dans options
- **Shortcut**: Touches 0-9 pour changer niveau

### Systeme de Difficulte
| Difficulte | Multiplicateur | Vies | Description |
|------------|---------------|------|-------------|
| Facile | 0.82 | 3 | Gravite reduite |
| Normal | 1.0 | 3 | Standard |
| Difficile | 1.25 | 2 | Gravite augmentee |

---

## Roadmap et Evolutions Futures

### Fonctionnalites Implementees
- [x] 10 niveaux avec themes uniques
- [x] Systeme de competences avec 10 skills
- [x] Generateur de niveaux Python
- [x] Musique procedurale
- [x] 3 types d'ennemis + boss
- [x] Sauvegarde localStorage
- [x] 3 personnages jouables

### Evolutions Potentielles
- [ ] Mode multijoueur local
- [ ] Editeur de niveaux integre
- [ ] Leaderboards en ligne
- [ ] Achievements system
- [ ] Skins deblocables
- [ ] Mode survie infini
- [ ] Portage mobile (touch controls)

---

## Notes de Developpement

### Conventions de Code
- **JavaScript**: ES6+ avec fonctions globales
- **Variables**: camelCase
- **Constantes**: UPPER_SNAKE_CASE
- **Fichiers**: Lowercase avec underscores

### Performance
- **FPS Cible**: 60
- **Optimisation**: Culling des elements hors ecran
- **Memoire**: Reutilisation des tableaux de particules

### Compatibilite
- **Navigateurs**: Chrome, Firefox, Safari, Edge (moderne)
- **Mobile**: Non optimise (controls clavier requis)
- **Audio**: Requiert interaction utilisateur pour demarrer

---

## Credits et License

**Projet**: Mod Runner - Mini jeu 2D Canvas
**Developpeur**: [Votre Nom]
**Version**: 1.0.0
**Date**: 2026

*Document PRD genere automatiquement pour personnalisation future.*

# 🎯 Système de Courbe de Difficulté Progressive

## 📋 Vue d'ensemble

Implémentation d'une **courbe de difficulté graduée** pour éviter que les joueurs quittent par frustration. Chaque niveau enseigne un concept nouveau avant d'augmenter la complexité.

---

## 🎮 Architecture de Difficulté

### Niveau 1-2 : TUTORIEL (Très Facile)
```javascript
// Objectif: Apprendre les contrôles de base
configuration = {
    enemies: 0,           // Aucun ennemi
    platforms: "large",   // Plateformes larges
    obstacles: 0,         // Pas de pièges
    coins: 5,             // Peu de pièces
    timeLimit: "infini",
    goal: "Apprentissage des mouvements"
}

// Concepts:
// - Touche gauche/droite = mouvement
// - Haut/Espace = saut
// - Atteindre la fin = victoire
```

### Niveau 3-5 : INTRODUCTION MÉCANIQUE (Facile)
```javascript
// Objectif: Maîtriser le double-saut et les pièces
configuration = {
    enemies: 1-2,         // Ennemis faciles
    platforms: "moyen",   // Taille normale
    obstacles: "spikes",  // Pièges basiques
    coins: 10-15,         // Plus de pièces à collecter
    difficulty: "normal",
    goal: "Maîtriser double-saut et esquive"
}

// Concepts:
// - Double-saut = atteindre des zones hautes
// - Pièges à éviter = attention au déplacement
// - Collecte pièces = bonus exploration
```

### Niveau 6-8 : CHALLENGE MODÉRÉ (Moyen)
```javascript
// Objectif: Combiner les mécaniques
configuration = {
    enemies: 3-5,         // Ennemis multiples
    platforms: "petit",   // Plateformes plus petites
    obstacles: "mix",     // Pièges variés (spikes, puits)
    coins: 20+,           // Exploration récompensée
    boss: false,
    difficulty: "hard",
    goal: "Presicion + Timing"
}

// Concepts:
// - Timing des sauts = critique
// - Esquiver ennemis = chalenge
// - Path-finding optimal = bonnes récompenses
```

### Niveau 9-10 : BOSS / EXPERT (Très Difficile)
```javascript
// Objectif: Maîtrise complète
configuration = {
    enemies: 5+,          // Boss + sbires
    platforms: "tiny",    // Plateforme minimales
    obstacles: "extrême", // Combos pièges complexes
    boss: true,           // Boss final
    timeLimit: "strict",
    difficulty: "hardcore",
    goal: "Démonstration de skill"
}

// Concepts:
// - Anticipation mouvement ennemi
// - Timing frame-perfect
// - Gestion ressource (vies)
```

---

## 💻 Implémentation Proposée

### 1. Classe DifficultyManager
```javascript
class DifficultyManager {
    constructor() {
        this.levelConfigs = this.generateProgression();
    }

    generateProgression() {
        return {
            1: { difficulty: 'easy',    enemies: 0,  obstacles: 0,   coins: 5 },
            2: { difficulty: 'easy',    enemies: 1,  obstacles: 0,   coins: 5 },
            3: { difficulty: 'easy',    enemies: 1,  obstacles: 'low', coins: 10 },
            4: { difficulty: 'normal',  enemies: 2,  obstacles: 'low', coins: 12 },
            5: { difficulty: 'normal',  enemies: 2,  obstacles: 'mid', coins: 15 },
            6: { difficulty: 'normal',  enemies: 3,  obstacles: 'mid', coins: 18 },
            7: { difficulty: 'hard',    enemies: 4,  obstacles: 'mid', coins: 20 },
            8: { difficulty: 'hard',    enemies: 4,  obstacles: 'high', coins: 25 },
            9: { difficulty: 'hard',    enemies: 5,  obstacles: 'high', coins: 30, boss: true },
            10: { difficulty: 'extreme', enemies: 6,  obstacles: 'extreme', coins: 50, boss: true }
        };
    }

    getConfig(levelNum) {
        return this.levelConfigs[levelNum] || this.levelConfigs[10];
    }

    getNextConcept(levelNum) {
        // Retourne le concept clé du niveau
        const concepts = [
            "Apprendre à bouger",
            "Apprendre à sauter",
            "Double-saut",
            "Esquiver",
            "Timing",
            "Ennemis multiples",
            "Pièges complexes",
            "Précision",
            "Boss Phase 1",
            "Boss Final"
        ];
        return concepts[levelNum - 1];
    }
}
```

### 2. Intégration à game.js
```javascript
// Au démarrage
const difficultyManager = new DifficultyManager();

function startLevel(levelNum) {
    const config = difficultyManager.getConfig(levelNum);
    const concept = difficultyManager.getNextConcept(levelNum);
    
    // Afficher objectif
    showLevelObjective(concept);
    
    // Charger configuration
    applyDifficultyConfig(config);
    
    // Générer le niveau
    generateLevel(levelNum, config);
}

function applyDifficultyConfig(config) {
    // Appliquer les paramètres de difficulté
    enemyCount = config.enemies;
    obstacleLevel = config.obstacles;
    coinReward = config.coins;
    difficulty = config.difficulty;
    
    if (config.boss) {
        generateBoss();
    }
}
```

### 3. Feedback Visuel
```html
<!-- Écran avant le niveau -->
<div id="levelIntro" class="hidden">
    <h2>Niveau {{ levelNum }}</h2>
    <p class="concept">📚 Concept: {{ concept }}</p>
    <p class="goal">🎯 Objectif: {{ objective }}</p>
    <div class="difficulty-bar">
        <div class="difficulty-fill" style="width: {{ difficultyPercent }}%"></div>
    </div>
    <button onclick="startLevel()">Commencer</button>
</div>
```

---

## 📊 Progression de Difficulté

```
Difficulté
    ^
10  |                                   ╱╲
    |                                 ╱    ╲
 8  |                         ╱╲____╱      ╲
    |                       ╱    ╲          
 6  |               ╱╲____╱       ╲____
    |             ╱    ╲               ╲
 4  |     ╱╲____╱       ╲               ╲
    |   ╱    ╲            ╲               ╲
 2  | ╱       ╲            ╲               ╲
    |_________________________________________
    1  2  3  4  5  6  7  8  9  10
    
    Tuto Easy  Moy   Hard  Expert
    
→ Courbe lisse, pas de pic brutal
→ Chaque palier = 1 nouveau concept
```

---

## 🎓 Concepts par Niveau

| Niveau | Titre | Concept Principal | Nombre de Morts Acceptable |
|--------|-------|---|---|
| 1-2 | Tutorial | Mouvement de base | 0-2 |
| 3 | Explorateur | Double-saut | 2-5 |
| 4 | Collecteur | Collection pièces | 3-6 |
| 5 | Chasseur | Ennemi unique | 5-10 |
| 6 | Funambule | Précision | 8-15 |
| 7 | Acrobate | Pièges complexes | 10-20 |
| 8 | Guerrier | Multiples ennemis | 15-30 |
| 9 | Duelliste | Phase 1 du boss | 20-40 |
| 10 | Champion | Boss Final | 30-100 |

---

## ⚙️ Mécanismes d'Aide Progressive

### Niveau 1-2
```
✓ Afficher les touches à l'écran
✓ Pas de limite de temps
✓ Les ennemis "avertissent" avant d'attaquer
✓ Vies infinies (ou limite très haute)
```

### Niveau 3-5
```
✓ Indicateurs visuels (flèches pour plateformes)
✓ Limite de temps généreux
✓ Bonus de vies
✓ Sons de feedback positif
```

### Niveau 6-8
```
✓ Limit de temps normal
✓ Vies limités (3)
✓ Checkpoints stratégiques
✓ Difficulty ajustable (easy/hard)
```

### Niveau 9-10
```
✗ Pas d'aide
✗ Vies limitées strictement
✗ Checkpoint rares
✓ Mais leçons des niveaux 1-8 maîtrisées
```

---

## 🎯 Avantages de Cette Approche

| Bénéfice | Résultat |
|----------|----------|
| Progression graduée | 📈 Moins d'abandons précoces |
| Un concept par niveau | 🧠 Apprentissage clair |
| Feedback progressif | 😊 Joueur se sent progresser |
| Challenge approprié | 🎮 Engagement maximal |
| Replay-ability | 🔄 Possibilité de "speedrun" |

---

## 🚀 Plan d'Implémentation

### Phase 1 : Fondations
```
□ Créer DifficultyManager
□ Définir configurations par niveau
□ Intégrer à loadLevel()
□ Tester courbe
```

### Phase 2 : Feedback
```
□ Écran d'introduction niveau
□ Indicateurs visuels difficulté
□ Messages de concept
□ Sons de progression
```

### Phase 3 : Polish
```
□ Ajuster nombres ennemis/obstacles
□ Balance difficultés (A/B testing)
□ Aider tooltips au démarrage
□ Optionnel: Mode "custom difficulty"
```

---

## 📈 Métriques de Succès

```
✓ Taux de complétion niveau 1-2 : > 90%
✓ Taux de complétion niveau 5   : > 50%
✓ Taux de complétion niveau 10  : > 10%
✓ Moyenne morts par niveau      : < 20
✓ Abandon avant niveau 3        : < 5%
```

---

## 💡 Astuces d'Équilibrage

```javascript
// Ajuster en temps réel selon performance
if (deathCount > 30) {
    // Réduire difficulté
    enemyCount--;
    platformSize++;
}

if (deathCount < 3) {
    // Augmenter difficulté
    enemyCount++;
    obstacleVariety++;
}
```

---

**Cette approche garantit que le joueur apprend progressivement sans jamais être frustré ! 🎉**

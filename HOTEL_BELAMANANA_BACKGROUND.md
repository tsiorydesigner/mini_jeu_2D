# Fond Hôtel de Ville Belamanana - Niveaux 1-5

## Description

Ajout d'un fond thématique **Hôtel de Ville Belamanana** pour les niveaux 1 à 5 du jeu Mod Runner.

## Modifications Apportées

### 1. **Mise à jour des thèmes (JS/game.js - lignes 116-127)**

Ajout de deux propriétés à chaque thème pour les niveaux 1-5:
- `backgroundImage`: chemin de l'image du fond (`'img/hotel_belamanana.png'`)
- `backgroundTitle`: titre affiché au-dessus du fond (`'Hotel de ville Belamanana'`)

```javascript
{ 
    name: 'Foret', 
    skyTop: '#79c267', 
    skyBottom: '#bfe8a2', 
    // ... autres propriétés ...
    backgroundImage: 'img/hotel_belamanana.png',          // Nouveau
    backgroundTitle: 'Hotel de ville Belamanana'         // Nouveau
}
```

Les thèmes des niveaux 6-10 (Ruines, Neon, Nuit, Steam, Cosmos) n'ont pas de fond personnalisé.

### 2. **Système de cache d'images (JS/game.js - lignes 103-119)**

Création d'un système de chargement et mise en cache des images de fond:

```javascript
const backgroundImageCache = {};

function loadBackgroundImage(imagePath) {
    if (!imagePath) return null;
    if (backgroundImageCache[imagePath]) {
        return backgroundImageCache[imagePath];
    }
    
    const img = new Image();
    img.onload = function() {
        backgroundImageCache[imagePath] = img;
    };
    img.onerror = function() {
        console.warn(`Impossible de charger l'image de fond: ${imagePath}`);
        backgroundImageCache[imagePath] = null;
    };
    img.src = imagePath;
    return null;
}
```

**Avantages:**
- Charge l'image une seule fois
- Réutilise l'image en cache pour les accès suivants
- Gère les erreurs de chargement gracieusement

### 3. **Fonction drawBackground() modifiée (JS/game.js - lignes 760-800)**

La fonction dessine maintenant:
1. Le gradient de ciel de base
2. L'image de fond (si disponible) avec 30% de transparence
3. Le titre du niveau (si disponible) avec effet d'ombre

```javascript
function drawBackground() {
    // 1. Gradient de base
    const g = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    g.addColorStop(0, currentTheme.skyTop);
    g.addColorStop(1, currentTheme.skyBottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    
    // 2. Image de fond
    if (currentTheme.backgroundImage) {
        if (!backgroundImageCache[currentTheme.backgroundImage]) {
            loadBackgroundImage(currentTheme.backgroundImage);
        }
        
        if (backgroundImageCache[currentTheme.backgroundImage]) {
            const img = backgroundImageCache[currentTheme.backgroundImage];
            const scale = Math.max(CANVAS_W / img.width, CANVAS_H / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (CANVAS_W - w) / 2;
            const y = (CANVAS_H - h) / 2;
            ctx.globalAlpha = 0.3;  // Transparence
            ctx.drawImage(img, x, y, w, h);
            ctx.globalAlpha = 1.0;
        }
    }
    
    // 3. Titre du niveau
    if (currentTheme.backgroundTitle) {
        ctx.save();
        ctx.font = 'bold 48px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 8;
        ctx.fillText(currentTheme.backgroundTitle, CANVAS_W / 2, 20);
        ctx.restore();
    }
}
```

### 4. **Création de l'image PNG**

**Fichier:** `img/hotel_belamanana.png`
- **Dimensions:** 1024x768 pixels
- **Format:** PNG
- **Contenu:** Illustration 2D d'un Hôtel de Ville coloré

#### Éléments de l'image:
- ☀️ Soleil en haut à gauche
- ☁️ Nuages blancs
- 🏛️ Bâtiment principal (couleur terracotta)
- 🪟 Fenêtres bleues (3 rangées × 7 colonnes)
- 🚪 Porte principale avec poignée dorée
- 🏠 Toit rouge triangulaire
- 🔔 Clocher avec cloche dorée et drapeau rouge
- 🌿 Herbe verte
- 🪜 Colonnes de support grises
- 📝 Marches d'accès
- **Titre:** "Hôtel de Ville Belamanana" en bas

### 5. **Fichiers Utilitaires Créés**

#### `generate_hotel_image.py`
Script Python qui génère l'image PNG automatiquement.

**Usage:**
```bash
python generate_hotel_image.py
```

**Dépendances:** `Pillow` (PIL)

#### `generate_hotel_image.html`
Page HTML interactive pour générer et télécharger l'image via le navigateur.

**Usage:** Ouvrir le fichier dans un navigateur, cliquer sur "Générer Image", puis "Télécharger PNG"

## Comportement en Jeu

### Niveaux 1-5
- **Niveau 1 (Forêt):** Fond + titre "Hotel de ville Belamanana" + gradient ciel vert
- **Niveau 2 (Désert):** Fond + titre "Hotel de ville Belamanana" + gradient ciel doré
- **Niveau 3 (Glace):** Fond + titre "Hotel de ville Belamanana" + gradient ciel bleu clair
- **Niveau 4 (Lave):** Fond + titre "Hotel de ville Belamanana" + gradient ciel rouge/noir
- **Niveau 5 (Jungle):** Fond + titre "Hotel de ville Belamanana" + gradient ciel vert foncé

### Niveaux 6-10
- Affichent uniquement le gradient de ciel thématique (pas de fond personnalisé)

## Performance

- **Chargement:** L'image est chargée une seule fois en cache
- **Transparence:** 30% pour ne pas masquer les éléments du jeu
- **Redimensionnement:** Automatique selon la résolution du canvas
- **Compatibilité:** Fonctionne sur tous les navigateurs modernes

## Fichiers Modifiés

| Fichier | Ligne | Modification |
|---------|-------|--------------|
| `JS/game.js` | 116-127 | Ajout propriétés `backgroundImage` et `backgroundTitle` aux thèmes 1-5 |
| `JS/game.js` | 103-119 | Ajout système de cache `backgroundImageCache` et fonction `loadBackgroundImage()` |
| `JS/game.js` | 760-800 | Modification `drawBackground()` pour afficher image et titre |

## Fichiers Créés

| Fichier | Description |
|---------|-------------|
| `img/hotel_belamanana.png` | Image PNG de l'Hôtel de Ville (1024×768px) |
| `generate_hotel_image.py` | Script Python pour générer l'image |
| `generate_hotel_image.html` | Page HTML pour générer/télécharger l'image |

## Intégration

L'intégration est **automatique** et n'a pas requis de modifications dans `loadLevel()`.
La fonction `drawBackground()` vérifie et charge automatiquement l'image du thème actuel.

## Test

Pour tester:
1. Lancer le jeu
2. Naviguer vers le niveau 1, 2, 3, 4 ou 5
3. Observer le fond "Hôtel de Ville Belamanana" s'afficher
4. Vérifier que le titre "Hotel de ville Belamanana" s'affiche en haut en blanc
5. Vérifier que la transparence permet de voir les éléments du jeu
6. Tester les niveaux 6-10 pour confirmer qu'ils n'ont pas de fond personnalisé

## Notes Techniques

- Le fond est re-dessiné à chaque frame, mais l'image est en cache
- La transparence (30%) laisse visibles les plateformes, ennemis, pièces, etc.
- Le titre utilise une ombre noire pour la lisibilité sur tous les dégradés
- La mise à l'échelle est relative à la résolution du canvas

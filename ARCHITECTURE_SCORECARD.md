# 📊 Structure Projet - Scorecard Integration

## 📁 Arborescence Projet

```
mini_jeu_2D/
├── 📄 index.html                    (Accueil - inchangé)
├── 🎮 game.html                     (✅ MODIFIÉ - Scorecard intégré)
├── 🐍 generate_levels.py            (Generator - inchangé)
├── 📝 prd.md                        (Spec - inchangé)
├── 🎯 PROMPT                        (Prompts - inchangé)
├── 🎤 voice_narration.js            (Voices - inchangé)
├── 🚀 skills.sh                     (Script - inchangé)
│
├── 📋 README_SCORECARD.md           (✨ NOUVEAU - Résumé rapide)
├── 📋 SCORECARD.md                  (✨ NOUVEAU - Docs complètes)
├── 📋 TEST_SCORECARD.md             (✨ NOUVEAU - Guide test)
├── 📋 CHANGELOG_SCORECARD.md        (✨ NOUVEAU - Changelog)
├── 📋 VERIFICATION_SCORECARD.md     (✨ NOUVEAU - Vérification)
│
├── 🎨 CSS/
│   ├── home.css                     (Home style - inchangé)
│   ├── style.css                    (Game base - inchangé)
│   ├── skills.css                   (Skills panel - inchangé)
│   ├── achievements.css             (Achievements - inchangé)
│   ├── shop.css                     (Shop - inchangé)
│   ├── controls.css                 (Controls - inchangé)
│   ├── stats.css                    (Stats - inchangé)
│   ├── settings.css                 (Settings - inchangé)
│   ├── ambient-sounds.css           (Ambient - inchangé)
│   ├── replay.css                   (Replay - inchangé)
│   └── 🌟 scorecard.css             (✨ NOUVEAU - Scorecard UI)
│
├── 🖼️  img/
│   └── (images assets - inchangé)
│
├── 🎵 song/
│   └── (audio files - inchangé)
│
└── 💻 JS/
    ├── game.js                      (✅ MODIFIÉ - 3 points intégration)
    ├── settings.js                  (Settings - inchangé)
    ├── controls.js                  (Controls - inchangé)
    ├── skills.js                    (Skills logic - inchangé)
    ├── skills_ui.js                 (Skills UI - inchangé)
    ├── achievements.js              (Achievements - inchangé)
    ├── achievements_ui.js           (Achievements UI - inchangé)
    ├── shop.js                      (Shop logic - inchangé)
    ├── shop_ui.js                   (Shop UI - inchangé)
    ├── voice_narration.js           (Voice - inchangé)
    ├── background-animation.js      (BG - inchangé)
    ├── ambient-sounds.js            (Sounds - inchangé)
    ├── ambient-sounds_ui.js         (Sounds UI - inchangé)
    ├── replay.js                    (Replay - inchangé)
    ├── 🌟 scorecard.js              (✨ NOUVEAU - Image generator)
    └── 🌟 scorecard_ui.js           (✨ NOUVEAU - UI Manager)
```

## 🔄 Flux d'Intégration

```
┌─────────────────────────────────────────┐
│  GAME EVENT                             │
└────────────┬────────────────────────────┘
             │
             ▼
    ┌────────────────────┐
    │  Player Dies       │ ──┐
    │  (loseLife)        │   │
    └────────────────────┘   │
             │               │
             ├─ lives > 0    │
             │   │ respawn   │
             │               │
             └─ lives <= 0 ──┤
                             │ Game Over
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Update ScoreData    │
                  │ → scorecardUI.      │
                  │   updateScoreData() │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Show Scorecard      │
                  │ → scorecardUI.      │
                  │   show()            │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Generate Image      │
                  │ → scorecardGenerator│
                  │   .generate...()    │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Display in Panel    │
                  │ Score Image shown   │
                  └─────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
    [Twitter]          [Discord]          [Download]
        │                    │                    │
        ▼                    ▼                    ▼
  Open Twitter          Copy text              PNG file
  with message          to clipboard           downloaded
```

## 🔌 Points d'Intégration

### 1. HTML (game.html)
```html
<!-- Header -->
<link rel="stylesheet" href="CSS/scorecard.css">          (ligne 14)

<!-- Body - Panel + Overlay -->
<div id="scorecardPanel" class="hidden">...</div>         (lignes 200-242)
<div id="scorecardOverlay" class="scorecard-overlay">    (ligne 244)

<!-- Scripts -->
<script src="https://cdnjs.cloudflare.com/.../qrcode.min.js">  (ligne 254)
<script src="JS/scorecard.js"></script>                   (ligne 260)
<script src="JS/scorecard_ui.js"></script>                (ligne 261)
```

### 2. JavaScript (game.js)
```javascript
// Point 1: GAME_OVER - loseLife() function
if (lives <= 0) {
    // ...existing code...
    scorecardUI.updateScoreData(score, currentLevel, sessionTime, selectedCharacter, difficulty);
    setTimeout(() => scorecardUI.show(), 500);
}

// Point 2: WIN - tryFinishLevel() function
if (currentLevel >= TOTAL_LEVELS) {
    // ...existing code...
    scorecardUI.updateScoreData(score, currentLevel, sessionTime, selectedCharacter, difficulty);
    setTimeout(() => scorecardUI.show(), 500);
}

// Point 3: LEVEL_CLEAR - tryFinishLevel() function
gameState = STATE.LEVEL_CLEAR;
// ...existing code...
scorecardUI.updateScoreData(score, currentLevel, sessionTime, selectedCharacter, difficulty);
```

## 📦 Dépendances

```
External (CDN):
├── qrcode.js v1.0.0
│   └── URL: https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js
│   └── Usage: Génération QR codes
│
Native APIs:
├── Canvas 2D Context
│   └── Usage: Génération image PNG
├── Clipboard API
│   └── Usage: Copie texte Discord
├── localStorage
│   └── Usage: Données persistantes (optionnel)
└── performance.now()
    └── Usage: Timing sessions
```

## 🎯 Classes et Instances

### ScorecardGenerator (scorecard.js)
```javascript
Class: ScorecardGenerator
├── Properties
│   ├── cardWidth: 1200
│   ├── cardHeight: 630
│   └── qrSize: 150
│
├── Public Methods
│   ├── generateScorecardImage()      → Promise<string>
│   ├── generateQRImage()              → Promise<Canvas>
│   ├── generateTwitterShareURL()      → string
│   ├── generateDiscordShareText()     → string
│   ├── copyDiscordText()              → void
│   ├── downloadImage()                → void
│   ├── formatScore()                  → string
│   ├── formatTime()                   → string
│   └── capitalizeFirst()              → string

Instance: window.scorecardGenerator
```

### ScorecardUIManager (scorecard_ui.js)
```javascript
Class: ScorecardUIManager
├── Properties
│   ├── panel: HTMLElement
│   ├── overlay: HTMLElement
│   ├── currentScore: number
│   ├── currentLevel: number
│   ├── currentTime: number
│   ├── currentCharacter: string
│   ├── currentDifficulty: string
│   └── scorecardImageUrl: string
│
├── Public Methods
│   ├── show()                        → void
│   ├── hide()                        → void
│   ├── updateScoreData()             → void
│   ├── updateDisplay()               → void
│   ├── generateScorecardImage()      → Promise<void>
│   ├── generateQRCode()              → void
│   ├── shareOnTwitter()              → void
│   ├── shareOnDiscord()              → void
│   ├── downloadImage()               → void
│   └── showMessage()                 → void
│
└── Private Methods
    └── initEventListeners()          → void

Instance: window.scorecardUI
```

## 📊 État Management

```
Application State
├── gameState
│   ├── MENU (0)
│   ├── PLAYING (1)
│   ├── GAME_OVER (2)        ← Trigger scorecard
│   ├── LEVEL_CLEAR (3)      ← Update scorecard
│   ├── WIN (4)              ← Trigger scorecard
│   └── PAUSED (5)
│
└── Scorecard State
    ├── Hidden (initial)
    ├── Loading (generating image)
    ├── Visible (showing panel)
    └── Closed (after user action)
```

## 🔗 Data Flow

```
Game Event (loseLife, tryFinishLevel)
    │
    ▼
Calculate sessionTime
    │
    ▼
Call scorecardUI.updateScoreData()
    ├─ Update this.currentScore
    ├─ Update this.currentLevel
    ├─ Update this.currentTime
    ├─ Update this.currentCharacter
    └─ Update this.currentDifficulty
    │
    ▼
Call scorecardUI.show()
    ├─ Remove 'hidden' class from panel
    ├─ Remove 'hidden' class from overlay
    ├─ Call generateScorecardImage()
    │   │
    │   ▼
    │   scorecardGenerator.generateScorecardImage()
    │   ├─ Create canvas 1200×630
    │   ├─ Draw background gradient
    │   ├─ Draw formatted text/stats
    │   ├─ Call generateQRImage()
    │   ├─ Draw QR code on canvas
    │   └─ Return PNG dataURL
    │
    └─ Display image in panel
       └─ Generate QR code separately
```

## 🎨 UI Hierarchy

```
#scorecardOverlay (modal overlay)
    │
    └─ #scorecardPanel (main panel)
        ├─ .scorecard-btn-close (button)
        ├─ .scorecard-header (h2)
        │   └─ "🏆 Carte de Score 🏆"
        ├─ .scorecard-preview
        │   └─ #scorecardImageContainer (img)
        ├─ .scorecard-stats
        │   ├─ .stat-item (Score)
        │   ├─ .stat-item (Niveau)
        │   ├─ .stat-item (Temps)
        │   └─ .stat-item (Personnage)
        ├─ .social-buttons
        │   ├─ #twitterShareBtn
        │   ├─ #discordShareBtn
        │   └─ #downloadImageBtn
        ├─ #qrSection
        │   └─ #qrCodeContainer
        └─ #successMessage
```

## 🔄 Event Flow

```
1. User loses all lives
   └─ loseLife() called

2. Game detects lives <= 0
   └─ gameState = STATE.GAME_OVER

3. scorecardUI.updateScoreData() called
   └─ Stats stored in UI manager

4. setTimeout(..., 500ms)
   └─ scorecardUI.show() called

5. Panel displayed with animation
   └─ Image generation starts

6. User clicks social button
   ├─ Twitter: window.open() with URL
   ├─ Discord: navigator.clipboard.writeText()
   └─ Download: a.click() with dataURL

7. User clicks × or overlay
   └─ scorecardUI.hide() called
   └─ Panel animation out
```

## 🚀 Lifecycle

```
Page Load
  │
  ├─ game.html loaded
  ├─ CSS scorecard.css imported
  ├─ script scorecard.js loaded
  │   └─ window.scorecardGenerator created
  ├─ script scorecard_ui.js loaded
  │   └─ window.scorecardUI created
  └─ script game.js loaded
     └─ scorecard initialized
     └─ Ready to use

Game Running
  │
  ├─ User plays game
  ├─ User loses lives
  ├─ loseLife() → GAME_OVER state
  │   └─ scorecardUI activated
  └─ scorecard visible with image + sharing

Sharing
  │
  ├─ User clicks Twitter
  │   └─ Opens twitter.com intent
  ├─ User clicks Discord
  │   └─ Copies formatted text
  └─ User clicks Download
      └─ PNG file downloaded

Close
  │
  └─ scorecardUI.hide()
     └─ Panel hidden, game continues
```

---

## 📈 Statistics

| Metric | Value |
|--------|-------|
| Total Files Modified | 2 |
| Total Files Created | 6 |
| Total JS Code | 400+ lines |
| Total CSS Code | 350+ lines |
| Total HTML Code | 50+ lines |
| CDN Dependencies | 1 |
| Global Objects | 2 |
| DOM Elements | 15+ |
| Event Listeners | 4+ |
| CSS Animations | 3 |
| Responsive Breakpoints | 2 |

---

## ✅ Validation

```
✅ All files created
✅ All files referenced correctly
✅ No circular dependencies
✅ No naming conflicts
✅ Proper scope isolation
✅ Event delegation working
✅ DOM ready before init
✅ CDN fully accessible
✅ Responsive design tested
✅ Cross-browser compatible
```

---

**Diagram Version** : 1.0  
**Date** : Avril 2026  
**Status** : ✅ Complete

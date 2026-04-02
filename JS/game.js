const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const livesDisplay = document.getElementById('livesDisplay');
const levelDisplay = document.getElementById('levelDisplay');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');
const startBtn = document.getElementById('startBtn');
const levelSelectBtn = document.getElementById('levelSelectBtn');
const resetProgressBtn = document.getElementById('resetProgressBtn');
const freeModeToggle = document.getElementById('freeModeToggle');
const difficultySelect = document.getElementById('difficultySelect');
const levelGrid = document.getElementById('level-grid');
const characterButtons = document.querySelectorAll('.character-btn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');

const CANVAS_W = canvas.width;
const CANVAS_H = canvas.height;
const TILE = 32;
const GRAVITY = 0.55;
const FRICTION = 0.84;
const PLAYER_ACCEL = 4.6;
const JUMP_FORCE = -11.3;
const MAX_FALL = 13;
const COIN_SIZE = 14;
const TOTAL_LEVELS = 10;
const SAVE_KEY = 'mod_runner_save_v3';

const STATE = { MENU: 0, PLAYING: 1, GAME_OVER: 2, LEVEL_CLEAR: 3, WIN: 4, PAUSED: 5 };
let gameState = STATE.MENU;
const keys = {};
let score = 0;
let lives = 3;
let frame = 0;
let currentLevel = 1;
let unlockedLevel = 1;
let freeMode = true;
let difficulty = 'normal';
let volume = 0.7;
let selectedCharacter = 'runner';
const bestTimes = {};
let levelStartMs = 0;
let currentTheme = null;
let checkpoint = null;

const player = {
    x: TILE, y: TILE, w: 28, h: 36, vx: 0, vy: 0, onGround: false, facingRight: true, invincible: 0,
    jumpsLeft: 2, hasDash: true, dashCd: 0, powerShield: 0, coyote: 0, jumpBuffer: 0,
};
const camera = { x: 0, y: 0 };
let LEVEL_W = 0;
let LEVEL_H = 0;

let platforms = [];
let coins = [];
let enemies = [];
let spikes = [];
let powerups = [];
let checkpoints = [];
let particles = [];
let boss = null;

const themes = [
    { name: 'Foret', skyTop: '#79c267', skyBottom: '#bfe8a2', platformMain: '#4f8a3d', platformTop: '#7acb52', platformBorder: '#2c5b24', coin: '#ffd54f', enemy: '#8e3b2f' },
    { name: 'Desert', skyTop: '#f7b267', skyBottom: '#fceabb', platformMain: '#d39a55', platformTop: '#e7bd79', platformBorder: '#8a5b2d', coin: '#ffcf66', enemy: '#b85c38' },
    { name: 'Glace', skyTop: '#9ed8ff', skyBottom: '#e5f6ff', platformMain: '#8fd1ea', platformTop: '#d0f3ff', platformBorder: '#4b8ea8', coin: '#d7f8ff', enemy: '#5fa8d3' },
    { name: 'Lave', skyTop: '#3a0d0d', skyBottom: '#a62c14', platformMain: '#6f2520', platformTop: '#df5a2f', platformBorder: '#34110d', coin: '#ff9f45', enemy: '#ff5f3f' },
    { name: 'Jungle', skyTop: '#2e7d32', skyBottom: '#7cb342', platformMain: '#3e6b2a', platformTop: '#6fab3c', platformBorder: '#213c17', coin: '#ffe066', enemy: '#a53f2b' },
    { name: 'Ruines', skyTop: '#5f4b3e', skyBottom: '#bda27f', platformMain: '#8b715a', platformTop: '#b79875', platformBorder: '#4a3a2d', coin: '#f9d27d', enemy: '#7f3d2d' },
    { name: 'Neon', skyTop: '#111133', skyBottom: '#251a5a', platformMain: '#2b256e', platformTop: '#6c5ce7', platformBorder: '#17133d', coin: '#ff7edb', enemy: '#ff3fa4' },
    { name: 'Nuit', skyTop: '#050a1c', skyBottom: '#1a2a4a', platformMain: '#2b3f68', platformTop: '#4a6fb0', platformBorder: '#17233f', coin: '#f1f5ff', enemy: '#6e4ec5' },
    { name: 'Steam', skyTop: '#2b2b2b', skyBottom: '#555555', platformMain: '#6b5b53', platformTop: '#b08b62', platformBorder: '#3b322d', coin: '#ffc857', enemy: '#b84f3a' },
    { name: 'Cosmos', skyTop: '#120022', skyBottom: '#34004d', platformMain: '#4e2a7a', platformTop: '#8f5bde', platformBorder: '#2a1542', coin: '#9be7ff', enemy: '#ff6ad5' },
];

const BASE_MAP = [
    '..............................................',
    '..............................................',
    '..C...........P......................C........',
    '..###..............C...............#####......',
    '..............................................',
    '......S.................J.....................',
    '....#####..........C.........#####............',
    '.........................................C....',
    '................E......................###....',
    '......................K.......................',
    '.....C........####.............F..............',
    '...######..............C.............#####....',
    '..............................................',
    '...........S....................E.............',
    '####...####...####...####...####...####...#####',
    '####...####...####...####...####...####...#####',
    '####...####...####...####...####...####...#####',
    '..............................................',
];

function levelMapFor(level) {
    const grid = BASE_MAP.map((r) => r.split(''));
    for (let i = 0; i < level + 1; i++) {
        const col = 4 + ((i * 7 + level * 3) % 34);
        const row = 3 + ((i * 5 + level) % 9);
        if (grid[row][col] === '.') grid[row][col] = i % 2 ? 'C' : 'E';
    }
    if (level > 4) grid[6][33] = 'S';
    if (level > 6) grid[10][26] = 'J';
    if (level > 8) grid[8][14] = 'F';
    return grid.map((r) => r.join(''));
}

function overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
function difficultyScale() { return difficulty === 'easy' ? 0.82 : difficulty === 'hard' ? 1.25 : 1; }

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}
function lightenColor(hex, amount) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHex(r + amount, g + amount, b + amount);
}
function darkenColor(hex, amount) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHex(r - amount, g - amount, b - amount);
}

function saveGame() {
    const data = { unlockedLevel, bestTimes, options: { freeMode, difficulty, volume, selectedCharacter } };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}
function loadSave() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    try {
        const data = JSON.parse(raw);
        unlockedLevel = Math.max(1, Math.min(TOTAL_LEVELS, data.unlockedLevel || 1));
        Object.assign(bestTimes, data.bestTimes || {});
        freeMode = data.options?.freeMode ?? true;
        difficulty = data.options?.difficulty || 'normal';
        volume = data.options?.volume ?? 0.7;
        selectedCharacter = data.options?.selectedCharacter || 'runner';
    } catch {
        unlockedLevel = 1;
    }
}

function applyCharacterTraits() {
    // Définit des modificateurs de joueur selon `selectedCharacter`
    // Valeurs par défaut
    player.accelMult = 1;
    player.jumpMult = 1;
    player.maxJumps = 2;
    player.hasDash = true;
    player.dashPower = 11;
    player.extraLifeOnStart = 0;

    if (selectedCharacter === 'runner') {
        player.accelMult = 1.15;
        player.jumpMult = 1.0;
        player.maxJumps = 2;
        player.hasDash = true;
        player.dashPower = 11;
    } else if (selectedCharacter === 'ninja') {
        player.accelMult = 1.0;
        player.jumpMult = 1.12;
        player.maxJumps = 3;
        player.hasDash = true;
        player.dashPower = 13;
    } else if (selectedCharacter === 'robot') {
        player.accelMult = 0.92;
        player.jumpMult = 0.95;
        player.maxJumps = 2;
        player.hasDash = false;
        player.dashPower = 0;
        player.extraLifeOnStart = 1;
    }
}

const bgMusic = document.getElementById('bgMusic');
bgMusic.volume = 0.5;

function stopThemeMusic() {
    bgMusic.pause();
    bgMusic.currentTime = 0;
}
function startThemeMusic() {
    bgMusic.play().catch(() => {});
}
function beep(freq = 300, dur = 0.07) {}

function renderLevelButtons() {
    levelGrid.innerHTML = '';
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        btn.textContent = String(i);
        const locked = !freeMode && i > unlockedLevel;
        if (locked) btn.classList.add('locked');
        btn.disabled = locked;
        btn.addEventListener('click', () => {
            if (locked) return;
            loadLevel(i);
            gameState = STATE.PLAYING;
            startThemeMusic();
            hideOverlay();
        });
        levelGrid.appendChild(btn);
    }
}

function parseLevel(levelMap) {
    platforms = []; coins = []; enemies = []; spikes = []; powerups = []; checkpoints = []; particles = [];
    checkpoint = null; boss = null;
    LEVEL_H = levelMap.length * TILE;
    LEVEL_W = levelMap[0].length * TILE;
    const speed = (1.2 + currentLevel * 0.1) * difficultyScale();
    for (let r = 0; r < levelMap.length; r++) {
        for (let c = 0; c < levelMap[r].length; c++) {
            const ch = levelMap[r][c];
            const x = c * TILE;
            const y = r * TILE;
            if (ch === '#') platforms.push({ x, y, w: TILE, h: TILE });
            if (ch === 'C') coins.push({ x: x + 9, y: y + 9, w: COIN_SIZE, h: COIN_SIZE, collected: false, phase: Math.random() * 8 });
            if (ch === 'S') spikes.push({ x, y: y + 20, w: TILE, h: 12 });
            if (ch === 'P') powerups.push({ x: x + 8, y: y + 8, w: 16, h: 16, taken: false });
            if (ch === 'K') checkpoints.push({ x: x + 8, y: y + 4, w: 16, h: 28, active: false });
            if (ch === 'E' || ch === 'J' || ch === 'F') {
                enemies.push({ x, y, w: 28, h: 28, type: ch === 'E' ? 'walker' : ch === 'J' ? 'jumper' : 'flyer', vx: speed, vy: 0, alive: true, left: x - TILE * 4, right: x + TILE * 4, t: 0 });
            }
        }
    }
    if (currentLevel === TOTAL_LEVELS) {
        boss = { x: LEVEL_W - TILE * 10, y: LEVEL_H - TILE * 6, w: 80, h: 72, vx: -2.2 * difficultyScale(), hp: 12, maxHp: 12, alive: true, t: 0 };
    }
}

function respawn() {
    const spawn = checkpoint || { x: TILE, y: TILE };
    player.x = spawn.x; player.y = spawn.y; player.vx = 0; player.vy = 0; player.onGround = false;
    player.jumpsLeft = player.maxJumps || 2; player.invincible = 80;
}
function loadLevel(level) {
    currentLevel = level;
    currentTheme = themes[level - 1];
    parseLevel(levelMapFor(level));
    
    // Ajouter les vies supplémentaires du magasin
    if (typeof shopManager !== 'undefined') {
        const extraLives = shopManager.extraLives;
        if (extraLives > 0) {
            lives += extraLives;
            shopManager.extraLives = 0;
            shopManager.saveProgress();
        }
    }
    
    respawn();
    camera.x = 0; camera.y = 0;
    levelStartMs = performance.now();
    updateHUD();
    
    // Notifier le système d'accomplissements du début du niveau
    if (typeof achievementManager !== 'undefined') {
        achievementManager.onLevelStart();
    }
}

function addParticle(x, y, color, n = 10) {
    // Utiliser les particules équipées du magasin
    let particleColors = [color];
    if (typeof shopManager !== 'undefined' && shopManager.equipped.particle !== 'default') {
        const particleEffect = shopManager.items.get(shopManager.equipped.particle);
        if (particleEffect && particleEffect.colors) {
            particleColors = particleEffect.colors;
        }
    }
    
    for (let i = 0; i < n; i++) {
        const selectedColor = particleColors[Math.floor(Math.random() * particleColors.length)];
        particles.push({ x, y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 26, color: selectedColor });
    }
}
function loseLife() {
    if (player.invincible > 0) return;
    if (player.powerShield > 0) { player.powerShield--; player.invincible = 40; return; }
    
    // Utiliser une vie supplémentaire du magasin si disponible
    if (typeof shopManager !== 'undefined' && shopManager.extraLives > 0) {
        shopManager.extraLives--;
        shopManager.saveProgress();
        player.invincible = 80;
        addParticle(player.x + 10, player.y + 10, '#00ff00', 20);
        beep(440, 0.1);
        updateHUD();
        return;
    }
    
    lives--;
    updateHUD();
    addParticle(player.x + 10, player.y + 10, '#ff5555', 18);
    voiceNarrator.playDamageTaken();
    
    // Notifier le système d'accomplissements des dégâts
    if (typeof achievementManager !== 'undefined') {
        achievementManager.onDamageTaken();
    }
    
    if (lives <= 0) { 
        gameState = STATE.GAME_OVER; 
        voiceNarrator.playGameOver();
        stopThemeMusic(); 
        showOverlay('Game Over', `Score: ${score}`, 'Rejouer'); 
        return; 
    }
    respawn();
}
function playerJumpPressed() { 
    return window.controlsManager ? 
        window.controlsManager.isActionActive('jump') : 
        (keys['ArrowUp'] || keys[' ']); 
}

function updatePlayer() {
    const accelFactor = (difficulty === 'hard' ? 0.28 : 0.3) * (player.accelMult || 1);
    
    // Use controls manager if available, fallback to keyboard
    if (window.controlsManager) {
        if (window.controlsManager.isActionActive('moveLeft')) { 
            player.vx -= PLAYER_ACCEL * accelFactor; 
            player.facingRight = false; 
        }
        if (window.controlsManager.isActionActive('moveRight')) { 
            player.vx += PLAYER_ACCEL * accelFactor; 
            player.facingRight = true; 
        }
    } else {
        if (keys.ArrowLeft) { player.vx -= PLAYER_ACCEL * accelFactor; player.facingRight = false; }
        if (keys.ArrowRight) { player.vx += PLAYER_ACCEL * accelFactor; player.facingRight = true; }
    }
    
    player.vx *= FRICTION;
    if (Math.abs(player.vx) < 0.08) player.vx = 0;
    player.vx = Math.max(-PLAYER_ACCEL, Math.min(PLAYER_ACCEL, player.vx));
    player.jumpBuffer = playerJumpPressed() ? 7 : Math.max(0, player.jumpBuffer - 1);
    player.coyote = player.onGround ? 7 : Math.max(0, player.coyote - 1);
    if (player.jumpBuffer > 0 && (player.coyote > 0 || player.jumpsLeft > 0)) {
        player.vy = JUMP_FORCE * (player.jumpMult || 1);
        if (player.coyote <= 0) player.jumpsLeft--;
        player.onGround = false;
        player.jumpBuffer = 0;
        beep(520, 0.05);
    }
    
    // Dash input
    const dashPressed = window.controlsManager ? 
        window.controlsManager.isActionActive('dash') : 
        keys.Shift;
    
    if (dashPressed && player.hasDash && player.dashCd <= 0) {
        player.vx = player.facingRight ? (player.dashPower || 11) : -(player.dashPower || 11);
        player.dashCd = 50;
        beep(220, 0.05);
    }
    if (player.dashCd > 0) player.dashCd--;
    player.vy += GRAVITY * difficultyScale();
    if (player.vy > MAX_FALL) player.vy = MAX_FALL;

    player.x += player.vx;
    for (const p of platforms) {
        if (!overlap(player, p)) continue;
        if (player.vx > 0) player.x = p.x - player.w;
        else if (player.vx < 0) player.x = p.x + p.w;
        player.vx = 0;
    }
    player.y += player.vy;
    player.onGround = false;
    for (const p of platforms) {
        if (!overlap(player, p)) continue;
        if (player.vy > 0) { player.y = p.y - player.h; player.vy = 0; player.onGround = true; player.jumpsLeft = 1; }
        else if (player.vy < 0) { player.y = p.y + p.h; player.vy = 0; }
    }
    if (player.y > LEVEL_H + 80) loseLife();
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > LEVEL_W) player.x = LEVEL_W - player.w;
    if (player.invincible > 0) player.invincible--;
}

function updateEnemies() {
    for (const e of enemies) {
        if (!e.alive) continue;
        e.t++;
        if (e.type === 'walker') {
            e.x += e.vx;
            if (e.x <= e.left || e.x + e.w >= e.right) e.vx = -e.vx;
            e.vy += GRAVITY; e.y += e.vy;
        } else if (e.type === 'jumper') {
            e.x += e.vx * 0.6;
            if (e.t % 90 === 0) e.vy = -9;
            e.vy += GRAVITY; e.y += e.vy;
            if (e.x <= e.left || e.x + e.w >= e.right) e.vx = -e.vx;
        } else {
            e.x += e.vx * 0.8;
            e.y += Math.sin(e.t * 0.08) * 1.4;
            if (e.x <= e.left || e.x + e.w >= e.right) e.vx = -e.vx;
        }
        for (const p of platforms) {
            if (overlap(e, p) && e.vy > 0) { e.y = p.y - e.h; e.vy = 0; }
        }
        if (player.invincible <= 0 && overlap(player, e)) {
            const prevBottom = player.y + player.h - player.vy;
            if (player.vy > 0 && prevBottom <= e.y + 10) {
                e.alive = false;
                player.vy = -6;
                score += 120;
                addParticle(e.x + 10, e.y + 10, '#ff7b7b', 14);
                beep(620, 0.04);
                updateHUD();
                voiceNarrator.playEnemyKilled();
                
                // Accomplissement: ennemi tué
                if (typeof achievementManager !== 'undefined') {
                    achievementManager.onEnemyKilled();
                }
            } else loseLife();
        }
    }
}

function updateBoss() {
    if (!boss || !boss.alive) return;
    boss.t++;
    boss.x += boss.vx;
    if (boss.x <= LEVEL_W - TILE * 16 || boss.x + boss.w >= LEVEL_W - TILE * 2) boss.vx = -boss.vx;
    if (boss.t % 80 === 0) {
        enemies.push({ x: boss.x + boss.w / 2, y: boss.y + boss.h - 28, w: 26, h: 26, type: 'walker', vx: boss.vx > 0 ? 2 : -2, vy: 0, alive: true, left: boss.x - TILE * 5, right: boss.x + TILE * 5, t: 0 });
    }
    if (player.invincible <= 0 && overlap(player, boss)) {
        const prevBottom = player.y + player.h - player.vy;
        if (player.vy > 0 && prevBottom <= boss.y + 12) {
            boss.hp--;
            player.vy = -8;
            addParticle(boss.x + boss.w / 2, boss.y + 12, '#ff9adf', 20);
            beep(240 + boss.hp * 20, 0.06);
            if (boss.hp <= 0) {
                boss.alive = false;
                score += 1000;
                addParticle(boss.x + boss.w / 2, boss.y + boss.h / 2, '#ffd166', 40);
                updateHUD();
            }
        } else loseLife();
    }
}

function updateInteractions() {
    for (const c of coins) {
        if (c.collected || !overlap(player, c)) continue;
        c.collected = true;
        score += 50;
        addParticle(c.x + 7, c.y + 7, currentTheme.coin, 8);
        beep(800, 0.03);
        voiceNarrator.playCoinComment();
        updateHUD();
        
        // Accomplissement: pièce collectée
        if (typeof achievementManager !== 'undefined') {
            achievementManager.onCoinCollected();
        }
        
        // Magasin: ajouter pièce
        if (typeof shopManager !== 'undefined') {
            shopManager.coins++;
            shopManager.saveProgress();
        }
    }
    for (const s of spikes) if (overlap(player, s)) loseLife();
    for (const p of powerups) {
        if (p.taken || !overlap(player, p)) continue;
        p.taken = true; player.powerShield = 1; player.hasDash = true; score += 100;
        addParticle(p.x, p.y, '#6df0ff', 12);
        updateHUD();
        voiceNarrator.playPowerupComment();
    }
    for (const k of checkpoints) {
        if (!overlap(player, k)) continue;
        k.active = true;
        checkpoint = { x: k.x, y: k.y - 8 };
        
        // Accomplissement: checkpoint atteint
        if (typeof achievementManager !== 'undefined') {
            achievementManager.onCheckpointReached();
        }
    }
}

function tryFinishLevel() {
    const atExit = player.x + player.w >= LEVEL_W - 10 && player.onGround;
    if (!atExit) return;
    if (!freeMode && coins.some((c) => !c.collected)) return;
    if (currentLevel === TOTAL_LEVELS && boss && boss.alive) return;

    const sec = Math.floor((performance.now() - levelStartMs) / 1000);
    const prev = bestTimes[currentLevel];
    if (!prev || sec < prev) bestTimes[currentLevel] = sec;
    if (currentLevel >= TOTAL_LEVELS) {
        gameState = STATE.WIN;
        unlockedLevel = TOTAL_LEVELS;
        saveGame();
        stopThemeMusic();
        showOverlay('Victoire', `Score final ${score} | Boss vaincu`, 'Rejouer');
        voiceNarrator.playWin();
        return;
    }
    unlockedLevel = Math.max(unlockedLevel, currentLevel + 1);
    saveGame();
    
    // Gagner un niveau et débloquer des compétences et accomplissements
    if (typeof onPlayerLevelUp === 'function') {
        onPlayerLevelUp();
    }
    
    // Accomplissement: niveau complété
    if (typeof achievementManager !== 'undefined') {
        achievementManager.onLevelComplete(currentLevel);
    }
    
    gameState = STATE.LEVEL_CLEAR;
    voiceNarrator.playLevelComplete();
    showOverlay('Niveau termine', `Niveau ${currentLevel + 1} debloque`, 'Suivant');
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
}
function updateCamera() {
    let tx = player.x - CANVAS_W / 2 + player.w / 2;
    let ty = player.y - CANVAS_H / 2 + player.h / 2;
    tx = Math.max(0, Math.min(tx, LEVEL_W - CANVAS_W));
    ty = Math.max(0, Math.min(ty, LEVEL_H - CANVAS_H));
    camera.x += (tx - camera.x) * 0.1;
    camera.y += (ty - camera.y) * 0.1;
}

function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    g.addColorStop(0, currentTheme.skyTop);
    g.addColorStop(1, currentTheme.skyBottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}
function drawPlatforms() {
    for (const p of platforms) {
        const sx = p.x - camera.x, sy = p.y - camera.y;
        if (sx + TILE < 0 || sx > CANVAS_W || sy + TILE < 0 || sy > CANVAS_H) continue;
        ctx.fillStyle = currentTheme.platformMain; ctx.fillRect(sx, sy, p.w, p.h);
        ctx.fillStyle = currentTheme.platformTop; ctx.fillRect(sx, sy, p.w, 5);
        ctx.strokeStyle = currentTheme.platformBorder; ctx.strokeRect(sx + 0.5, sy + 0.5, p.w - 1, p.h - 1);
    }
}
function drawCoins() {
    for (const c of coins) {
        if (c.collected) continue;
        const bob = Math.sin(frame * 0.07 + c.phase) * 3;
        const sx = c.x - camera.x, sy = c.y + bob - camera.y;
        ctx.fillStyle = currentTheme.coin;
        ctx.beginPath(); ctx.arc(sx + 7, sy + 7, 7, 0, Math.PI * 2); ctx.fill();
    }
}
function drawSpikes() {
    ctx.fillStyle = '#d5dbe2';
    for (const s of spikes) {
        const sx = s.x - camera.x, sy = s.y - camera.y;
        ctx.beginPath();
        ctx.moveTo(sx, sy + s.h); ctx.lineTo(sx + s.w / 2, sy); ctx.lineTo(sx + s.w, sy + s.h);
        ctx.closePath(); ctx.fill();
    }
}
function drawPowerups() {
    for (const p of powerups) {
        if (p.taken) continue;
        ctx.fillStyle = '#56e8ff';
        ctx.fillRect(p.x - camera.x, p.y - camera.y, p.w, p.h);
    }
}
function drawCheckpoints() {
    for (const k of checkpoints) {
        const sx = k.x - camera.x, sy = k.y - camera.y;
        ctx.fillStyle = '#ddd'; ctx.fillRect(sx, sy, 3, 28);
        ctx.fillStyle = k.active ? '#00ff7f' : '#ffaa00';
        ctx.fillRect(sx + 3, sy + 2, 12, 8);
    }
}
function drawEnemies() {
    for (const e of enemies) {
        if (!e.alive) continue;
        ctx.fillStyle = currentTheme.enemy;
        ctx.fillRect(e.x - camera.x, e.y - camera.y, e.w, e.h);
    }
}
function drawBoss() {
    if (!boss || !boss.alive) return;
    const sx = boss.x - camera.x, sy = boss.y - camera.y;
    ctx.fillStyle = '#7d2ae8'; ctx.fillRect(sx, sy, boss.w, boss.h);
    ctx.fillStyle = '#f8f9fa'; ctx.fillRect(sx + 14, sy + 18, 12, 12); ctx.fillRect(sx + 52, sy + 18, 12, 12);
    ctx.fillStyle = '#212529'; ctx.fillRect(sx + 18, sy + 22, 6, 6); ctx.fillRect(sx + 56, sy + 22, 6, 6);
    const bw = 160; const ratio = boss.hp / boss.maxHp;
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(CANVAS_W / 2 - bw / 2, 18, bw, 12);
    ctx.fillStyle = '#ff4d6d'; ctx.fillRect(CANVAS_W / 2 - bw / 2, 18, bw * ratio, 12);
    ctx.strokeStyle = '#fff'; ctx.strokeRect(CANVAS_W / 2 - bw / 2, 18, bw, 12);
}
function drawPlayer() {
    if (player.invincible > 0 && Math.floor(frame / 4) % 2 === 0) return;
    const sx = player.x - camera.x, sy = player.y - camera.y;
    
    // Utiliser le skin équipé du magasin
    let bodyColor, headColor, legsColor;
    if (typeof shopManager !== 'undefined' && shopManager.equipped.skin !== 'default') {
        const skin = shopManager.items.get(shopManager.equipped.skin);
        if (skin) {
            if (skin.color === 'rainbow') {
                const hue = (frame * 2) % 360;
                bodyColor = `hsl(${hue}, 100%, 50%)`;
                headColor = `hsl(${(hue + 30) % 360}, 100%, 70%)`;
                legsColor = `hsl(${(hue + 60) % 360}, 100%, 40%)`;
            } else {
                const c = skin.color;
                bodyColor = c;
                headColor = lightenColor(c, 40);
                legsColor = darkenColor(c, 40);
            }
        }
    } else {
        // Palette par défaut selon le personnage
        const palette = {
            runner: { body: '#3498db', head: '#e8b4b4', legs: '#2c3e50' },
            ninja: { body: '#2d3436', head: '#b8b8b8', legs: '#1a1a2e' },
            robot: { body: '#636e72', head: '#dfe6e9', legs: '#2d3436' },
            mage: { body: '#9b59b6', head: '#e8b4b4', legs: '#8e44ad' },
            knight: { body: '#95a5a6', head: '#ecf0f1', legs: '#7f8c8d' },
            alien: { body: '#27ae60', head: '#2ecc71', legs: '#1e8449' },
            pirate: { body: '#8B4513', head: '#e8b4b4', legs: '#2c3e50' },
            samurai: { body: '#c0392b', head: '#e8b4b4', legs: '#641E16' },
            cyborg: { body: '#1abc9c', head: '#bdc3c7', legs: '#16a085' },
        }[selectedCharacter] || { body: '#3498db', head: '#e8b4b4', legs: '#2c3e50' };
        bodyColor = palette.body;
        headColor = palette.head;
        legsColor = palette.legs;
    }
    
    ctx.fillStyle = bodyColor; ctx.fillRect(sx, sy + 14, player.w, 14);
    ctx.fillStyle = headColor; ctx.fillRect(sx + 4, sy + 2, 20, 14);
    ctx.fillStyle = legsColor; ctx.fillRect(sx + 5, sy + 28, 7, 8); ctx.fillRect(sx + 16, sy + 28, 7, 8);
    if (player.powerShield > 0) {
        ctx.strokeStyle = '#56e8ff';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(sx + 14, sy + 18, 22, 0, Math.PI * 2); ctx.stroke();
    }
}
function drawExit() {
    const x = LEVEL_W - 24 - camera.x;
    const y = LEVEL_H - TILE * 4 - camera.y;
    ctx.fillStyle = '#ffffff80'; ctx.fillRect(x, y, 5, 96);
    ctx.fillStyle = currentTheme.coin;
    ctx.beginPath(); ctx.moveTo(x + 5, y + 4); ctx.lineTo(x + 26, y + 12); ctx.lineTo(x + 5, y + 20); ctx.fill();
}
function drawParticles() {
    for (const p of particles) {
        ctx.globalAlpha = p.life / 26;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - camera.x, p.y - camera.y, 3, 3);
    }
    ctx.globalAlpha = 1;
}

function updateHUD() {
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
    const bt = bestTimes[currentLevel] ? ` • best ${bestTimes[currentLevel]}s` : '';
    const bossTag = boss && boss.alive ? ' • BOSS' : '';
    levelDisplay.textContent = `${currentLevel}/${TOTAL_LEVELS} ${themes[currentLevel - 1].name}${bt}${bossTag}`;
    
    // Mettre à jour le porte-monnaie du magasin si l'UI est ouverte
    if (typeof shopUI !== 'undefined' && shopUI.walletAmount) {
        shopUI.updateWallet();
    }
}
function showOverlay(title, message, btnText) {
    overlayTitle.textContent = title;
    overlayMessage.textContent = message;
    startBtn.textContent = btnText;
    overlay.classList.add('overlay-visible');
}
function hideOverlay() { overlay.classList.remove('overlay-visible'); }

function updatePauseButtons() {
    if (gameState === STATE.PLAYING) {
        pauseBtn.classList.remove('hidden');
        resumeBtn.classList.add('hidden');
    } else if (gameState === STATE.PAUSED) {
        pauseBtn.classList.add('hidden');
        resumeBtn.classList.remove('hidden');
    } else {
        pauseBtn.classList.remove('hidden');
        resumeBtn.classList.add('hidden');
    }
}

function initGame() {
    score = 0;
    lives = difficulty === 'hard' ? 2 : 3;
    // Appliquer les traits du personnage choisi avant de démarrer
    applyCharacterTraits();
    lives += player.extraLifeOnStart || 0;
    loadLevel(1);
    
    voiceNarrator.init(); // Initialize voice narrator
    // Initialiser le système de compétences
    initializeSkillsSystem();
    updateHUD();
}
function startGame() {
    if (gameState === STATE.LEVEL_CLEAR) loadLevel(currentLevel + 1);
    else initGame();
    gameState = STATE.PLAYING;
    startThemeMusic();
    hideOverlay();
    updatePauseButtons();
}
function togglePause() {
    if (gameState === STATE.PLAYING) {
        gameState = STATE.PAUSED;
        bgMusic.pause();
        showOverlay('Pause', 'P pour reprendre', 'Reprendre');
    } else if (gameState === STATE.PAUSED) {
        gameState = STATE.PLAYING;
        bgMusic.play().catch(() => {});
        hideOverlay();
    }
    updatePauseButtons();
}

function gameLoop() {
    frame++;
    if (gameState === STATE.PLAYING) {
        updatePlayer();
        updateEnemies();
        updateBoss();
        updateInteractions();
        tryFinishLevel();
        updateParticles();
        updateCamera();
    } else updateParticles();

    if (currentTheme) drawBackground();
    if (gameState !== STATE.MENU) {
        drawPlatforms();
        drawSpikes();
        drawCoins();
        drawPowerups();
        drawCheckpoints();
        drawEnemies();
        drawBoss();
        drawExit();
        drawPlayer();
        drawParticles();
    }
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Check for pause using controls manager
    const pausePressed = window.controlsManager ? 
        window.controlsManager.isActionActive('pause') : 
        (e.key.toLowerCase() === 'p' || e.key === 'Escape');
    
    if (pausePressed) {
        e.preventDefault();
        togglePause();
    }
    
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Shift'].includes(e.key)) e.preventDefault();
    if (e.key === 'Enter' && [STATE.MENU, STATE.GAME_OVER, STATE.LEVEL_CLEAR, STATE.WIN, STATE.PAUSED].includes(gameState)) startBtn.click();
    if (freeMode) {
        if (e.key >= '1' && e.key <= '9') { loadLevel(Number(e.key)); gameState = STATE.PLAYING; startThemeMusic(); hideOverlay(); }
        if (e.key === '0') { loadLevel(10); gameState = STATE.PLAYING; startThemeMusic(); hideOverlay(); }
    }
});
document.addEventListener('keyup', (e) => { keys[e.key] = false; });

// Make game object globally available for controls manager
window.game = {
    handleInput: function(action, isPressed, inputType, value = 1) {
        // This function is called by the controls manager
        // The actual input handling is done in updatePlayer() and other game functions
        // through the isActionActive() method
    }
};

startBtn.addEventListener('click', () => {
    if (gameState === STATE.PAUSED) { togglePause(); return; }
    if ([STATE.MENU, STATE.GAME_OVER, STATE.LEVEL_CLEAR, STATE.WIN].includes(gameState)) startGame();
});
pauseBtn.addEventListener('click', () => {
    if (gameState === STATE.PLAYING) togglePause();
});
resumeBtn.addEventListener('click', () => {
    if (gameState === STATE.PAUSED) togglePause();
});
levelSelectBtn.addEventListener('click', () => {
    levelGrid.classList.toggle('hidden');
    renderLevelButtons();
});
resetProgressBtn.addEventListener('click', () => {
    unlockedLevel = 1;
    Object.keys(bestTimes).forEach((k) => delete bestTimes[k]);
    saveGame();
    renderLevelButtons();
});
freeModeToggle.addEventListener('change', () => {
    freeMode = freeModeToggle.checked;
    saveGame();
    renderLevelButtons();
});
difficultySelect.addEventListener('change', () => { difficulty = difficultySelect.value; saveGame(); });
characterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        characterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        selectedCharacter = btn.dataset.character;
        saveGame();
        applyCharacterTraits();
        updateHUD();
    });
});

loadSave();
applyCharacterTraits();
freeModeToggle.checked = freeMode;
difficultySelect.value = difficulty;
characterButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.character === selectedCharacter));
renderLevelButtons();
showOverlay('Mod Runner V3', 'Nouveau: personnage selectable, musique de theme et boss final niveau 10.', 'Demarrer');
loadLevel(1);
updatePauseButtons();

// Responsive canvas scaling
function resizeCanvas() {
    const container = document.getElementById('game-container');
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const aspect = CANVAS_W / CANVAS_H;
    let w, h;
    if (cw / ch > aspect) {
        h = ch;
        w = h * aspect;
    } else {
        w = cw;
        h = w / aspect;
    }
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Touch controls are handled by InputManager in controls.js

// Volume control
const volumeSlider = document.getElementById('volumeSlider');
const volumeLabel = document.getElementById('volumeLabel');
const muteBtn = document.getElementById('muteBtn');
let previousVolume = 0.5;
let isMuted = false;

volumeSlider.addEventListener('input', () => {
    const val = Number(volumeSlider.value) / 100;
    bgMusic.volume = val;
    volumeLabel.textContent = volumeSlider.value + '%';
    if (val > 0) {
        isMuted = false;
        previousVolume = val;
        muteBtn.innerHTML = '&#128266;';
    } else {
        isMuted = true;
        muteBtn.innerHTML = '&#128263;';
    }
});

muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    if (isMuted) {
        previousVolume = bgMusic.volume;
        bgMusic.volume = 0;
        volumeSlider.value = 0;
        volumeLabel.textContent = '0%';
        muteBtn.innerHTML = '&#128263;';
    } else {
        bgMusic.volume = previousVolume || 0.5;
        volumeSlider.value = Math.round(bgMusic.volume * 100);
        volumeLabel.textContent = volumeSlider.value + '%';
        muteBtn.innerHTML = '&#128266;';
    }
});

gameLoop();

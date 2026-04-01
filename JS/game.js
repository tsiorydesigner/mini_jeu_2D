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
const volumeSlider = document.getElementById('volumeSlider');
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

let audioCtx = null;
let musicGain = null;
let musicTimer = null;
let musicStep = 0;

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

function stopThemeMusic() {
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = null;
}
function startThemeMusic() {
    stopThemeMusic();
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (!musicGain) {
        musicGain = audioCtx.createGain();
        musicGain.connect(audioCtx.destination);
    }
    musicGain.gain.value = Math.max(0, volume * 0.024);

    const base = 96 + currentLevel * 4;
    const leadScale = [0, 3, 7, 10, 12, 10, 7, 3, 5, 3, 2, 0];
    const bassScale = [0, 0, -5, -5, -7, -7, -5, -5, -2, -2, -5, -5];

    function playTone(freq, type, dur, gainValue) {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = Math.max(45, freq);
        g.gain.value = gainValue;
        osc.connect(g);
        g.connect(musicGain);
        osc.start();
        osc.stop(audioCtx.currentTime + dur);
    }

    musicStep = 0;
    musicTimer = setInterval(() => {
        if (![STATE.PLAYING, STATE.MENU, STATE.PAUSED].includes(gameState)) return;
        const i = musicStep % leadScale.length;

        // Lead "orbital" arpeggio
        playTone(base * 2 + leadScale[i] * 12, currentLevel >= 7 ? 'triangle' : 'sine', 0.18, 0.11);

        // Soft pad layer
        if (musicStep % 2 === 0) {
            playTone(base * 1.5 + leadScale[(i + 3) % leadScale.length] * 7, 'sine', 0.28, 0.05);
        }

        // Bass pulse
        if (musicStep % 2 === 0) {
            playTone(base + bassScale[i] * 3.2, 'sawtooth', 0.16, 0.08);
        }

        // Tiny hi-hat click (noise-ish high pulse)
        if (musicStep % 4 !== 0) {
            playTone(2200 + (musicStep % 3) * 120, 'square', 0.03, 0.03);
        }

        musicStep++;
    }, 170);
}
function beep(freq = 300, dur = 0.07) {
    if (volume <= 0) return;
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.frequency.value = freq;
    g.gain.value = volume * 0.03;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + dur);
}

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
    player.jumpsLeft = 2; player.invincible = 80;
}
function loadLevel(level) {
    currentLevel = level;
    currentTheme = themes[level - 1];
    parseLevel(levelMapFor(level));
    respawn();
    camera.x = 0; camera.y = 0;
    levelStartMs = performance.now();
    updateHUD();
}

function addParticle(x, y, color, n = 10) {
    for (let i = 0; i < n; i++) particles.push({ x, y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 26, color });
}
function loseLife() {
    if (player.invincible > 0) return;
    if (player.powerShield > 0) { player.powerShield--; player.invincible = 40; return; }
    lives--;
    updateHUD();
    addParticle(player.x + 10, player.y + 10, '#ff5555', 18);
    if (lives <= 0) { gameState = STATE.GAME_OVER; stopThemeMusic(); showOverlay('Game Over', `Score: ${score}`, 'Rejouer'); return; }
    respawn();
}
function playerJumpPressed() { return keys['ArrowUp'] || keys[' ']; }

function updatePlayer() {
    if (keys.ArrowLeft) { player.vx -= PLAYER_ACCEL * (difficulty === 'hard' ? 0.28 : 0.3); player.facingRight = false; }
    if (keys.ArrowRight) { player.vx += PLAYER_ACCEL * (difficulty === 'hard' ? 0.28 : 0.3); player.facingRight = true; }
    player.vx *= FRICTION;
    if (Math.abs(player.vx) < 0.08) player.vx = 0;
    player.vx = Math.max(-PLAYER_ACCEL, Math.min(PLAYER_ACCEL, player.vx));
    player.jumpBuffer = playerJumpPressed() ? 7 : Math.max(0, player.jumpBuffer - 1);
    player.coyote = player.onGround ? 7 : Math.max(0, player.coyote - 1);
    if (player.jumpBuffer > 0 && (player.coyote > 0 || player.jumpsLeft > 0)) {
        player.vy = JUMP_FORCE;
        if (player.coyote <= 0) player.jumpsLeft--;
        player.onGround = false;
        player.jumpBuffer = 0;
        beep(520, 0.05);
    }
    if (keys.Shift && player.hasDash && player.dashCd <= 0) {
        player.vx = player.facingRight ? 11 : -11;
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
        updateHUD();
    }
    for (const s of spikes) if (overlap(player, s)) loseLife();
    for (const p of powerups) {
        if (p.taken || !overlap(player, p)) continue;
        p.taken = true; player.powerShield = 1; player.hasDash = true; score += 100;
        addParticle(p.x, p.y, '#6df0ff', 12);
        updateHUD();
    }
    for (const k of checkpoints) {
        if (!overlap(player, k)) continue;
        k.active = true;
        checkpoint = { x: k.x, y: k.y - 8 };
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
        return;
    }
    unlockedLevel = Math.max(unlockedLevel, currentLevel + 1);
    saveGame();
    gameState = STATE.LEVEL_CLEAR;
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
    const palette = {
        runner: { body: '#3498db', head: '#f5cba7', legs: '#2c3e50' },
        ninja: { body: '#1f2937', head: '#f1c27d', legs: '#111827' },
        robot: { body: '#6c757d', head: '#ced4da', legs: '#495057' },
    }[selectedCharacter];
    ctx.fillStyle = palette.body; ctx.fillRect(sx, sy + 14, player.w, 14);
    ctx.fillStyle = palette.head; ctx.fillRect(sx + 4, sy + 2, 20, 14);
    ctx.fillStyle = palette.legs; ctx.fillRect(sx + 5, sy + 28, 7, 8); ctx.fillRect(sx + 16, sy + 28, 7, 8);
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
    loadLevel(1);
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
    if (gameState === STATE.PLAYING) { gameState = STATE.PAUSED; showOverlay('Pause', 'P pour reprendre', 'Reprendre'); }
    else if (gameState === STATE.PAUSED) { gameState = STATE.PLAYING; hideOverlay(); }
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
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Shift'].includes(e.key)) e.preventDefault();
    if (e.key.toLowerCase() === 'p') togglePause();
    if (e.key === 'Enter' && [STATE.MENU, STATE.GAME_OVER, STATE.LEVEL_CLEAR, STATE.WIN, STATE.PAUSED].includes(gameState)) startBtn.click();
    if (freeMode) {
        if (e.key >= '1' && e.key <= '9') { loadLevel(Number(e.key)); gameState = STATE.PLAYING; startThemeMusic(); hideOverlay(); }
        if (e.key === '0') { loadLevel(10); gameState = STATE.PLAYING; startThemeMusic(); hideOverlay(); }
    }
});
document.addEventListener('keyup', (e) => { keys[e.key] = false; });

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
volumeSlider.addEventListener('input', () => {
    volume = Number(volumeSlider.value) / 100;
    if (musicGain) musicGain.gain.value = Math.max(0, volume * 0.018);
    saveGame();
});
characterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        characterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        selectedCharacter = btn.dataset.character;
        saveGame();
    });
});

loadSave();
freeModeToggle.checked = freeMode;
difficultySelect.value = difficulty;
volumeSlider.value = String(Math.floor(volume * 100));
characterButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.character === selectedCharacter));
renderLevelButtons();
showOverlay('Mod Runner V3', 'Nouveau: personnage selectable, musique de theme et boss final niveau 10.', 'Demarrer');
loadLevel(1);
updatePauseButtons();
gameLoop();

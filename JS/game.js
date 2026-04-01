// Sky Runner V2 - 10 maps with unique themes
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreDisplay = document.getElementById('scoreDisplay');
const livesDisplay = document.getElementById('livesDisplay');
const levelDisplay = document.getElementById('levelDisplay');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');
const startBtn = document.getElementById('startBtn');

const CANVAS_W = canvas.width;
const CANVAS_H = canvas.height;
const TILE = 32;
const GRAVITY = 0.55;
const FRICTION = 0.85;
const PLAYER_ACCEL = 4.5;
const JUMP_FORCE = -11.5;
const MAX_FALL = 12;
const BASE_ENEMY_SPEED = 1.3;
const COIN_SIZE = 14;
const INVINCIBLE_FRAMES = 90;
const TOTAL_LEVELS = 10;

const STATE = { MENU: 0, PLAYING: 1, GAME_OVER: 2, LEVEL_CLEAR: 3, WIN: 4 };
let gameState = STATE.MENU;
let score = 0;
let lives = 3;
let frame = 0;
let currentLevel = 1;
let levelCoinGoal = 0;
let levelCoinsCollected = 0;
let currentTheme = null;

const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
});
document.addEventListener('keyup', (e) => { keys[e.key] = false; });

const player = {
    x: 0, y: 0, w: 28, h: 36, vx: 0, vy: 0,
    onGround: false, facingRight: true, animFrame: 0, animTimer: 0, invincible: 0,
};
const camera = { x: 0, y: 0 };

let platforms = [];
let coins = [];
let enemies = [];
let particles = [];
let currentLevelMap = [];
let LEVEL_COLS = 0;
let LEVEL_ROWS = 0;
let LEVEL_W = 0;
let LEVEL_H = 0;

function mapFrom(blocks) { return blocks; }

const LEVELS = [
    { name: 'Foret', coinGoal: 5, enemySpeed: BASE_ENEMY_SPEED + 0.0, map: mapFrom([
        '..............................................',
        '..............................................',
        '.............C................................',
        '...........#####.............C................',
        '..............................................',
        '......C...................#####...............',
        '....#####.....................................',
        '.................................C............',
        '....................E.........######..........',
        '..............................................',
        '........C......####....................C......',
        '.....######...............####........#####...',
        '.................................E............',
        '..............................................',
        '####...####...####...####...####...####...#####',
        '####...####...####...####...####...####...#####',
        '####...####...####...####...####...####...#####',
        '..............................................',
    ]), theme: { skyTop: '#79c267', skyBottom: '#bfe8a2', cloud: 'rgba(230,255,230,0.5)', platformMain: '#4f8a3d', platformTop: '#7acb52', platformBorder: '#2c5b24', coinOuter: '#ffd54f', coinInner: '#fff0a0', coinGlow: 'rgba(255,225,120,0.25)', enemyMain: '#8e3b2f', enemyBottom: '#5f251c', enemyMouth: '#34130f' } },
    { name: 'Desert', coinGoal: 6, enemySpeed: BASE_ENEMY_SPEED + 0.1, map: mapFrom([
        '..............................................',
        '..............................................',
        '....................C.........................',
        '..........#####....................C..........',
        '..............................................',
        '....C.....................#######.............',
        '...#####......................................',
        '.................................C............',
        '...................E..........#######.........',
        '..............................................',
        '...........C......####..................C.....',
        '.....######................####........#####...',
        '.................................E............',
        '..............................................',
        '####...####...####...####...####...####...#####',
        '####...####...####...####...####...####...#####',
        '####...####...####...####...####...####...#####',
        '..............................................',
    ]), theme: { skyTop: '#f7b267', skyBottom: '#fceabb', cloud: 'rgba(255,245,210,0.4)', platformMain: '#d39a55', platformTop: '#e7bd79', platformBorder: '#8a5b2d', coinOuter: '#ffcf66', coinInner: '#fff4b0', coinGlow: 'rgba(255,215,140,0.25)', enemyMain: '#b85c38', enemyBottom: '#7d3d24', enemyMouth: '#4a1f11' } },
    { name: 'Glace', coinGoal: 7, enemySpeed: BASE_ENEMY_SPEED + 0.15, map: mapFrom([
        '..............................................',
        '..............................................',
        '.................C............................',
        '...........#####.............#####............',
        '..............................................',
        '....C.........................................',
        '...#####.................C....................',
        '...............................######.........',
        '....................E.........................',
        '...........................C..................',
        '...........####.................####..........',
        '.....C...............####..............C......',
        '.....#####.........................E..........',
        '..............................................',
        '####...####...####...####...####...####...#####',
        '####...####...####...####...####...####...#####',
        '####...####...####...####...####...####...#####',
        '..............................................',
    ]), theme: { skyTop: '#9ed8ff', skyBottom: '#e5f6ff', cloud: 'rgba(240,250,255,0.65)', platformMain: '#8fd1ea', platformTop: '#d0f3ff', platformBorder: '#4b8ea8', coinOuter: '#d7f8ff', coinInner: '#ffffff', coinGlow: 'rgba(215,245,255,0.32)', enemyMain: '#5fa8d3', enemyBottom: '#3b7396', enemyMouth: '#23485f' } },
    { name: 'Lave', coinGoal: 8, enemySpeed: BASE_ENEMY_SPEED + 0.25, map: mapFrom([
        '..............................................',
        '..............................................',
        '...............C..............................',
        '..........#####..............#####............',
        '..............................................',
        '.....C..............................C.........',
        '....#####...................######............',
        '..............................................',
        '.......................E..............####....',
        '..................C...........................',
        '.........####..............####...............',
        '....C...........####..................C.......',
        '....#####........................E............',
        '..............................................',
        '####...####...####...####...####...####...#####',
        '####...####...####...####...####...####...#####',
        '####...####...####...####...####...####...#####',
        '..............................................',
    ]), theme: { skyTop: '#3a0d0d', skyBottom: '#a62c14', cloud: 'rgba(255,120,80,0.18)', platformMain: '#6f2520', platformTop: '#df5a2f', platformBorder: '#34110d', coinOuter: '#ff9f45', coinInner: '#ffd18b', coinGlow: 'rgba(255,140,70,0.28)', enemyMain: '#ff5f3f', enemyBottom: '#a3301d', enemyMouth: '#5a140b' } },
    { name: 'Jungle', coinGoal: 8, enemySpeed: BASE_ENEMY_SPEED + 0.3, map: mapFrom([
        '..............................................',
        '..............................................',
        '..............C.............C.................',
        '.........#######................####..........',
        '..............................................',
        '....C.................C.......................',
        '...#####...........######.....................',
        '....................................####......',
        '................E.............................',
        '............................C.................',
        '......####............####...............C....',
        '.............####....................#####....',
        '....C...........................E.............',
        '..............................................',
        '####...####...####...####...####...####...#####',
        '####...####...####...####...####...####...#####',
        '####...####...####...####...####...####...#####',
        '..............................................',
    ]), theme: { skyTop: '#2e7d32', skyBottom: '#7cb342', cloud: 'rgba(220,255,220,0.35)', platformMain: '#3e6b2a', platformTop: '#6fab3c', platformBorder: '#213c17', coinOuter: '#ffe066', coinInner: '#fff4ad', coinGlow: 'rgba(255,230,100,0.22)', enemyMain: '#a53f2b', enemyBottom: '#6b281c', enemyMouth: '#3f130d' } },
    { name: 'Ruines', coinGoal: 9, enemySpeed: BASE_ENEMY_SPEED + 0.35, map: mapFrom([
        '..............................................',
        '..............................................',
        '...............C..............................',
        '.......####.............####...........C......',
        '..............................................',
        '....C.........................####............',
        '...#####.......C..............................',
        '.........................####.................',
        '..............E...............................',
        '...............................C..............',
        '......####...............####.................',
        '..........C....####.................C.........',
        '....#####..........................E..........',
        '..............................................',
        '####...####...####...####...####...####...#####',
        '####...####...####...####...####...####...#####',
        '####...####...####...####...####...####...#####',
        '..............................................',
    ]), theme: { skyTop: '#5f4b3e', skyBottom: '#bda27f', cloud: 'rgba(255,240,220,0.24)', platformMain: '#8b715a', platformTop: '#b79875', platformBorder: '#4a3a2d', coinOuter: '#f9d27d', coinInner: '#fff0bd', coinGlow: 'rgba(245,210,130,0.25)', enemyMain: '#7f3d2d', enemyBottom: '#4d241a', enemyMouth: '#2a130d' } },
    { name: 'Neon', coinGoal: 10, enemySpeed: BASE_ENEMY_SPEED + 0.45, map: mapFrom([
        '..............................................',
        '..............................................',
        '...........C....................C.............',
        '......######..............######..............',
        '..............................................',
        '....C................C.........................',
        '...#####...........####.......................',
        '.................................####.........',
        '.................E............................',
        '........................C.....................',
        '......####...................####.......C.....',
        '...............####..................#####....',
        '....C.............................E...........',
        '..............................................',
        '####...####...####...####...####...####...#####',
        '####...####...####...####...####...####...#####',
        '####...####...####...####...####...####...#####',
        '..............................................',
    ]), theme: { skyTop: '#111133', skyBottom: '#251a5a', cloud: 'rgba(180,160,255,0.2)', platformMain: '#2b256e', platformTop: '#6c5ce7', platformBorder: '#17133d', coinOuter: '#ff7edb', coinInner: '#ffd5f4', coinGlow: 'rgba(255,130,220,0.3)', enemyMain: '#ff3fa4', enemyBottom: '#9e1f64', enemyMouth: '#5a0f37' } },
    { name: 'Nuit', coinGoal: 11, enemySpeed: BASE_ENEMY_SPEED + 0.55, map: mapFrom([
        '..............................................',
        '..............................................',
        '.................C....................C.......',
        '.......#####..............#####...............',
        '..............................................',
        '....C............................####.........',
        '...#####..............C.......................',
        '.............................#####............',
        '...................E..........................',
        '.................................C............',
        '......####...............####.................',
        '..........C....####..................C........',
        '....#####..........................E..........',
        '..............................................',
        '####...####...####...####...####...####...#####',
        '####...####...####...####...####...####...#####',
        '####...####...####...####...####...####...#####',
        '..............................................',
    ]), theme: { skyTop: '#050a1c', skyBottom: '#1a2a4a', cloud: 'rgba(200,220,255,0.15)', platformMain: '#2b3f68', platformTop: '#4a6fb0', platformBorder: '#17233f', coinOuter: '#f1f5ff', coinInner: '#ffffff', coinGlow: 'rgba(220,235,255,0.28)', enemyMain: '#6e4ec5', enemyBottom: '#3f2c78', enemyMouth: '#231745' } },
    { name: 'Steam', coinGoal: 12, enemySpeed: BASE_ENEMY_SPEED + 0.65, map: mapFrom([
        '..............................................',
        '..............................................',
        '.............C.............................C..',
        '......######..................######..........',
        '..............................................',
        '....C....................C....................',
        '...#####.............####.....................',
        '...............................####...........',
        '...................E..........................',
        '..........................C...................',
        '......####...................####.........C...',
        '..........C....####...................#####...',
        '....#####............................E........',
        '..............................................',
        '####...####...####...####...####...####...#####',
        '####...####...####...####...####...####...#####',
        '####...####...####...####...####...####...#####',
        '..............................................',
    ]), theme: { skyTop: '#2b2b2b', skyBottom: '#555555', cloud: 'rgba(220,220,220,0.24)', platformMain: '#6b5b53', platformTop: '#b08b62', platformBorder: '#3b322d', coinOuter: '#ffc857', coinInner: '#ffe9a6', coinGlow: 'rgba(255,205,90,0.24)', enemyMain: '#b84f3a', enemyBottom: '#753224', enemyMouth: '#431c14' } },
    { name: 'Cosmos', coinGoal: 13, enemySpeed: BASE_ENEMY_SPEED + 0.8, map: mapFrom([
        '..............................................',
        '..............................................',
        '...............C....................C.........',
        '.....#######..............#######.............',
        '..............................................',
        '....C.........................C...............',
        '...#####.............####.....................',
        '...............................#####..........',
        '....................E.........................',
        '...........................C..................',
        '......####....................####........C...',
        '..........C....####...................#####...',
        '....#####...........................E.........',
        '..............................................',
        '####...####...####...####...####...####...#####',
        '####...####...####...####...####...####...#####',
        '####...####...####...####...####...####...#####',
        '..............................................',
    ]), theme: { skyTop: '#120022', skyBottom: '#34004d', cloud: 'rgba(220,170,255,0.12)', platformMain: '#4e2a7a', platformTop: '#8f5bde', platformBorder: '#2a1542', coinOuter: '#9be7ff', coinInner: '#e0faff', coinGlow: 'rgba(145,230,255,0.32)', enemyMain: '#ff6ad5', enemyBottom: '#9f3d87', enemyMouth: '#5b1f4c' } },
];

function parseLevel(levelMap, config) {
    platforms = [];
    coins = [];
    enemies = [];
    particles = [];
    levelCoinsCollected = 0;

    currentLevelMap = levelMap;
    LEVEL_ROWS = currentLevelMap.length;
    LEVEL_COLS = currentLevelMap[0].length;
    LEVEL_W = LEVEL_COLS * TILE;
    LEVEL_H = LEVEL_ROWS * TILE;

    for (let row = 0; row < LEVEL_ROWS; row++) {
        for (let col = 0; col < LEVEL_COLS; col++) {
            const ch = currentLevelMap[row][col];
            const px = col * TILE;
            const py = row * TILE;

            if (ch === '#') platforms.push({ x: px, y: py, w: TILE, h: TILE });
            if (ch === 'C') coins.push({
                x: px + (TILE - COIN_SIZE) / 2, y: py + (TILE - COIN_SIZE) / 2,
                w: COIN_SIZE, h: COIN_SIZE, collected: false, phase: Math.random() * Math.PI * 2,
            });
            if (ch === 'E') enemies.push({
                x: px, y: py, w: 30, h: 30, vx: config.enemySpeed, vy: 0, alive: true,
                leftBound: px - TILE * (3 + Math.floor(currentLevel / 2)),
                rightBound: px + TILE * (3 + Math.floor(currentLevel / 2)),
            });
        }
    }
    respawnPlayer();
}

function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5 - 2,
            life: 20 + Math.random() * 15,
            maxLife: 35,
            size: 2 + Math.random() * 3,
            color,
        });
    }
}
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
}
function drawParticles() {
    for (const p of particles) {
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - camera.x, p.y - camera.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
}

function updatePlayer() {
    if (keys['ArrowLeft']) { player.vx -= PLAYER_ACCEL * 0.3; player.facingRight = false; }
    if (keys['ArrowRight']) { player.vx += PLAYER_ACCEL * 0.3; player.facingRight = true; }
    player.vx *= FRICTION;
    if (Math.abs(player.vx) < 0.1) player.vx = 0;
    player.vx = Math.max(-PLAYER_ACCEL, Math.min(PLAYER_ACCEL, player.vx));
    if ((keys['ArrowUp'] || keys[' ']) && player.onGround) { player.vy = JUMP_FORCE; player.onGround = false; }
    player.vy += GRAVITY;
    if (player.vy > MAX_FALL) player.vy = MAX_FALL;

    player.x += player.vx;
    for (const p of platforms) {
        if (!overlaps(player, p)) continue;
        if (player.vx > 0) player.x = p.x - player.w;
        else if (player.vx < 0) player.x = p.x + p.w;
        player.vx = 0;
    }

    player.y += player.vy;
    player.onGround = false;
    for (const p of platforms) {
        if (!overlaps(player, p)) continue;
        if (player.vy > 0) { player.y = p.y - player.h; player.vy = 0; player.onGround = true; }
        else if (player.vy < 0) { player.y = p.y + p.h; player.vy = 0; }
    }

    if (player.x < 0) player.x = 0;
    if (player.x + player.w > LEVEL_W) player.x = LEVEL_W - player.w;
    if (player.y > LEVEL_H + 80) loseLife();
    if (player.invincible > 0) player.invincible--;

    player.animTimer++;
    if (player.animTimer > 6) { player.animTimer = 0; player.animFrame = (player.animFrame + 1) % 4; }
}

function updateEnemies() {
    for (const e of enemies) {
        if (!e.alive) continue;
        e.x += e.vx;
        if (e.x <= e.leftBound || e.x + e.w >= e.rightBound) e.vx = -e.vx;
        e.vy += GRAVITY; if (e.vy > MAX_FALL) e.vy = MAX_FALL; e.y += e.vy;
        for (const p of platforms) {
            if (overlaps(e, p) && e.vy > 0) { e.y = p.y - e.h; e.vy = 0; }
        }
        if (player.invincible <= 0 && overlaps(player, e)) {
            const playerBottom = player.y + player.h;
            const playerPrevBottom = playerBottom - player.vy;
            if (player.vy > 0 && playerPrevBottom <= e.y + 10) {
                e.alive = false;
                player.vy = JUMP_FORCE * 0.5;
                score += 100;
                spawnParticles(e.x + e.w / 2, e.y + e.h / 2, '#ff6b6b', 14);
                updateHUD();
            } else loseLife();
        }
    }
}

function updateCoins() {
    for (const c of coins) {
        if (c.collected) continue;
        if (!overlaps(player, c)) continue;
        c.collected = true;
        score += 50;
        levelCoinsCollected++;
        spawnParticles(c.x + c.w / 2, c.y + c.h / 2, currentTheme.coinOuter, 10);
        updateHUD();
    }
}

function tryCompleteLevel() {
    const reachedExit = player.x + player.w >= LEVEL_W - 8;
    if (!reachedExit || !player.onGround) return;
    if (levelCoinsCollected < levelCoinGoal) return;

    if (currentLevel >= TOTAL_LEVELS) {
        gameState = STATE.WIN;
        showOverlay('Victory!', `Score final: ${score} - 10 mondes termines.`, 'Rejouer');
        return;
    }
    gameState = STATE.LEVEL_CLEAR;
    showOverlay(`Niveau ${currentLevel} termine`, `Prochain: ${LEVELS[currentLevel].name} | Objectif: ${LEVELS[currentLevel].coinGoal} pieces`, 'Niveau Suivant');
}

function loseLife() {
    if (player.invincible > 0) return;
    lives--;
    updateHUD();
    spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#ff4444', 18);
    if (lives <= 0) {
        gameState = STATE.GAME_OVER;
        showOverlay('Game Over', `Final Score: ${score}`, 'Play Again');
    } else {
        respawnPlayer();
        player.invincible = INVINCIBLE_FRAMES;
    }
}

function respawnPlayer() {
    player.x = TILE; player.y = TILE; player.vx = 0; player.vy = 0; player.onGround = false;
}

function updateCamera() {
    let targetX = player.x - CANVAS_W / 2 + player.w / 2;
    let targetY = player.y - CANVAS_H / 2 + player.h / 2;
    targetX = Math.max(0, Math.min(targetX, LEVEL_W - CANVAS_W));
    targetY = Math.max(0, Math.min(targetY, LEVEL_H - CANVAS_H));
    camera.x += (targetX - camera.x) * 0.1;
    camera.y += (targetY - camera.y) * 0.1;
}

function drawBackground() {
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    grad.addColorStop(0, currentTheme.skyTop);
    grad.addColorStop(1, currentTheme.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.fillStyle = currentTheme.cloud;
    const clouds = [
        { x: 120, y: 50, rx: 50, ry: 18 }, { x: 400, y: 80, rx: 60, ry: 20 },
        { x: 700, y: 40, rx: 45, ry: 16 }, { x: 1050, y: 65, rx: 55, ry: 19 },
        { x: 1400, y: 45, rx: 48, ry: 17 },
    ];
    for (const c of clouds) {
        const cx = ((c.x - camera.x * 0.2) % (CANVAS_W + 250)) - 125;
        ctx.beginPath(); ctx.ellipse(cx, c.y, c.rx, c.ry, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx - c.rx * 0.5, c.y + 5, c.rx * 0.6, c.ry * 0.7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx + c.rx * 0.5, c.y + 5, c.rx * 0.6, c.ry * 0.7, 0, 0, Math.PI * 2); ctx.fill();
    }
}

function drawPlatforms() {
    for (const p of platforms) {
        const sx = p.x - camera.x;
        const sy = p.y - camera.y;
        if (sx + TILE < 0 || sx > CANVAS_W || sy + TILE < 0 || sy > CANVAS_H) continue;
        ctx.fillStyle = currentTheme.platformMain;
        ctx.fillRect(sx, sy, p.w, p.h);
        ctx.fillStyle = currentTheme.platformTop;
        ctx.fillRect(sx, sy, p.w, 5);
        ctx.strokeStyle = currentTheme.platformBorder;
        ctx.lineWidth = 1;
        ctx.strokeRect(sx + 0.5, sy + 0.5, p.w - 1, p.h - 1);
    }
}

function drawCoins() {
    for (const c of coins) {
        if (c.collected) continue;
        const bob = Math.sin(frame * 0.06 + c.phase) * 3;
        const sx = c.x - camera.x;
        const sy = c.y + bob - camera.y;
        if (sx + COIN_SIZE < 0 || sx > CANVAS_W || sy + COIN_SIZE < 0 || sy > CANVAS_H) continue;
        ctx.fillStyle = currentTheme.coinGlow;
        ctx.beginPath(); ctx.arc(sx + COIN_SIZE / 2, sy + COIN_SIZE / 2, COIN_SIZE * 0.9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = currentTheme.coinOuter;
        ctx.beginPath(); ctx.arc(sx + COIN_SIZE / 2, sy + COIN_SIZE / 2, COIN_SIZE / 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = currentTheme.coinInner;
        ctx.beginPath(); ctx.arc(sx + COIN_SIZE / 2, sy + COIN_SIZE / 2, COIN_SIZE / 3.2, 0, Math.PI * 2); ctx.fill();
    }
}

function drawEnemies() {
    for (const e of enemies) {
        if (!e.alive) continue;
        const sx = e.x - camera.x;
        const sy = e.y - camera.y;
        if (sx + e.w < 0 || sx > CANVAS_W) continue;
        ctx.fillStyle = currentTheme.enemyMain; ctx.fillRect(sx, sy, e.w, e.h);
        ctx.fillStyle = currentTheme.enemyBottom; ctx.fillRect(sx, sy + e.h - 5, e.w, 5);
        const dir = e.vx > 0 ? 1 : -1;
        ctx.fillStyle = '#fff'; ctx.fillRect(sx + 5, sy + 7, 8, 8); ctx.fillRect(sx + 17, sy + 7, 8, 8);
        ctx.fillStyle = '#222'; ctx.fillRect(sx + 7 + dir * 2, sy + 9, 4, 4); ctx.fillRect(sx + 19 + dir * 2, sy + 9, 4, 4);
        ctx.fillStyle = '#222'; ctx.fillRect(sx + 4, sy + 4, 10, 2); ctx.fillRect(sx + 16, sy + 4, 10, 2);
        ctx.fillStyle = currentTheme.enemyMouth; ctx.fillRect(sx + 8, sy + 20, 14, 4);
    }
}

function drawExitMarker() {
    const x = LEVEL_W - 24 - camera.x;
    const y = LEVEL_H - TILE * 4 - camera.y;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(x, y, 6, TILE * 3);
    ctx.fillStyle = currentTheme.coinOuter;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + 4);
    ctx.lineTo(x + 26, y + 12);
    ctx.lineTo(x + 6, y + 20);
    ctx.closePath();
    ctx.fill();
}

function drawPlayer() {
    if (player.invincible > 0 && Math.floor(frame / 4) % 2 === 0) return;
    const sx = player.x - camera.x;
    const sy = player.y - camera.y;
    ctx.fillStyle = '#3498db'; ctx.fillRect(sx, sy + 14, player.w, 14);
    ctx.fillStyle = '#f5cba7'; ctx.fillRect(sx + 4, sy + 2, 20, 14);
    ctx.fillStyle = '#6c3483'; ctx.fillRect(sx + 3, sy, 22, 5);
    ctx.fillStyle = '#222';
    if (player.facingRight) { ctx.fillRect(sx + 16, sy + 7, 4, 4); ctx.fillRect(sx + 22, sy + 7, 4, 4); }
    else { ctx.fillRect(sx + 4, sy + 7, 4, 4); ctx.fillRect(sx + 10, sy + 7, 4, 4); }
    ctx.fillStyle = '#2c3e50';
    const legSwing = player.onGround && Math.abs(player.vx) > 0.5 ? Math.sin(player.animFrame * Math.PI / 2) * 5 : 0;
    ctx.fillRect(sx + 4, sy + 28, 8, 8 + legSwing);
    ctx.fillRect(sx + 16, sy + 28, 8, 8 - legSwing);
    ctx.fillStyle = '#922b21';
    ctx.fillRect(sx + 2, sy + 34 + (legSwing > 0 ? legSwing : 0), 12, 4);
    ctx.fillRect(sx + 14, sy + 34 + (legSwing < 0 ? -legSwing : 0), 12, 4);
}

function updateHUD() {
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
    levelDisplay.textContent = `${currentLevel}/${TOTAL_LEVELS} ${LEVELS[currentLevel - 1].name}`;
}

function showOverlay(title, message, btnText) {
    overlayTitle.textContent = title;
    overlayMessage.textContent = message;
    startBtn.textContent = btnText;
    overlay.classList.add('overlay-visible');
}
function hideOverlay() { overlay.classList.remove('overlay-visible'); }

function loadLevel(levelNumber) {
    currentLevel = levelNumber;
    const data = LEVELS[currentLevel - 1];
    currentTheme = data.theme;
    levelCoinGoal = data.coinGoal;
    parseLevel(data.map, data);
    camera.x = 0;
    camera.y = 0;
    updateHUD();
}

function initGame() {
    score = 0;
    lives = 3;
    frame = 0;
    loadLevel(1);
}

function startGame() {
    if (gameState === STATE.LEVEL_CLEAR) loadLevel(currentLevel + 1);
    else initGame();
    gameState = STATE.PLAYING;
    hideOverlay();
}

function gameLoop() {
    frame++;
    if (gameState === STATE.PLAYING) {
        updatePlayer();
        updateEnemies();
        updateCoins();
        tryCompleteLevel();
        updateParticles();
        updateCamera();
    } else updateParticles();

    if (currentTheme) drawBackground();
    if (gameState !== STATE.MENU) {
        drawPlatforms();
        drawCoins();
        drawEnemies();
        drawExitMarker();
        drawPlayer();
        drawParticles();
    }
    requestAnimationFrame(gameLoop);
}

startBtn.addEventListener('click', () => {
    if (gameState === STATE.MENU || gameState === STATE.GAME_OVER || gameState === STATE.LEVEL_CLEAR || gameState === STATE.WIN) startGame();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (gameState === STATE.MENU || gameState === STATE.GAME_OVER || gameState === STATE.LEVEL_CLEAR || gameState === STATE.WIN)) startGame();
});

showOverlay('Sky Runner', 'Version 2: 10 maps et themes visuels differents.', 'Start Game');
loadLevel(1);
gameLoop();

// ============================================================
// Replay System for Mod Runner
// Features: Record runs, replay with free camera, share clips
// ============================================================

class ReplayManager {
    constructor() {
        this.isRecording = false;
        this.isPlaying = false;
        this.frames = [];
        this.recordingStartFrame = 0;
        this.playbackFrame = 0;
        this.playbackSpeed = 1;
        this.maxFrames = 60 * 60 * 5; // 5 minutes max at 60fps
        this.savedReplays = [];
        this.currentReplayData = null;

        // Free camera state
        this.freeCamera = { x: 0, y: 0, zoom: 1 };
        this.freeCameraMode = false;

        // Recording state
        this.recordingLevel = 1;
        this.recordingCharacter = 'runner';
        this.recordingDifficulty = 'normal';
        this.recordingScore = 0;
        this.recordingTheme = null;

        // UI elements (will be set after DOM ready)
        this.replayPanel = null;
        this.replayBtn = null;
        this.replayList = null;

        this.loadSavedReplays();
        this.initUI();
    }

    initUI() {
        this.replayPanel = document.getElementById('replayPanel');
        this.replayBtn = document.getElementById('replayBtn');
        this.replayList = document.getElementById('replayList');
        this.closeReplayBtn = document.getElementById('closeReplayBtn');
        this.recordBtn = document.getElementById('recordBtn');
        this.replayControls = document.getElementById('replayControls');
        this.replayTimeline = document.getElementById('replayTimeline');
        this.replayTimeDisplay = document.getElementById('replayTimeDisplay');

        if (this.replayBtn) {
            this.replayBtn.addEventListener('click', () => this.toggleReplayPanel());
        }
        if (this.closeReplayBtn) {
            this.closeReplayBtn.addEventListener('click', () => this.hideReplayPanel());
        }
        if (this.recordBtn) {
            this.recordBtn.addEventListener('click', () => this.toggleRecording());
        }

        // Replay playback controls
        const playPauseBtn = document.getElementById('replayPlayPauseBtn');
        const stopBtn = document.getElementById('replayStopBtn');
        const speedBtn = document.getElementById('replaySpeedBtn');
        const freeCamBtn = document.getElementById('replayFreeCamBtn');
        const exportBtn = document.getElementById('replayExportBtn');

        if (playPauseBtn) playPauseBtn.addEventListener('click', () => this.toggleReplayPlayback());
        if (stopBtn) stopBtn.addEventListener('click', () => this.stopReplay());
        if (speedBtn) speedBtn.addEventListener('click', () => this.cyclePlaybackSpeed());
        if (freeCamBtn) freeCamBtn.addEventListener('click', () => this.toggleFreeCamera());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportCurrentReplay());

        // Timeline scrubber
        if (this.replayTimeline) {
            this.replayTimeline.addEventListener('input', () => {
                if (this.isPlaying && this.currentReplayData) {
                    const ratio = this.replayTimeline.value / 100;
                    this.playbackFrame = Math.floor(ratio * (this.currentReplayData.frames.length - 1));
                }
            });
        }
    }

    toggleReplayPanel() {
        if (!this.replayPanel) return;
        if (this.replayPanel.classList.contains('hidden')) {
            this.showReplayPanel();
        } else {
            this.hideReplayPanel();
        }
    }

    showReplayPanel() {
        if (!this.replayPanel) return;
        this.replayPanel.classList.remove('hidden');
        this.renderReplayList();
    }

    hideReplayPanel() {
        if (!this.replayPanel) return;
        this.replayPanel.classList.add('hidden');
    }

    // --- Recording ---

    startRecording() {
        if (this.isRecording) return;
        this.isRecording = true;
        this.frames = [];
        this.recordingStartFrame = typeof frame !== 'undefined' ? frame : 0;
        this.recordingLevel = typeof currentLevel !== 'undefined' ? currentLevel : 1;
        this.recordingCharacter = typeof selectedCharacter !== 'undefined' ? selectedCharacter : 'runner';
        this.recordingDifficulty = typeof difficulty !== 'undefined' ? difficulty : 'normal';
        this.recordingTheme = typeof currentTheme !== 'undefined' ? { ...currentTheme } : null;
        if (this.recordBtn) this.recordBtn.textContent = 'Arreter Enreg.';
        if (this.recordBtn) this.recordBtn.classList.add('recording');
    }

    stopRecording() {
        if (!this.isRecording) return;
        this.isRecording = false;
        if (this.recordBtn) this.recordBtn.textContent = 'Enregistrer';
        if (this.recordBtn) this.recordBtn.classList.remove('recording');

        if (this.frames.length < 10) return; // Too short, discard

        const replay = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            date: new Date().toISOString(),
            level: this.recordingLevel,
            character: this.recordingCharacter,
            difficulty: this.recordingDifficulty,
            score: typeof score !== 'undefined' ? score : 0,
            duration: this.frames.length,
            theme: this.recordingTheme,
            frames: this.frames.slice() // Copy
        };

        this.savedReplays.unshift(replay);
        // Keep max 10 replays
        if (this.savedReplays.length > 10) this.savedReplays.length = 10;
        this.saveReplays();
        this.renderReplayList();
    }

    toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    captureFrame() {
        if (!this.isRecording) return;
        if (this.frames.length >= this.maxFrames) {
            this.stopRecording();
            return;
        }

        const frameData = {
            px: player.x,
            py: player.y,
            pvx: player.vx,
            pvy: player.vy,
            pf: player.facingRight,
            pg: player.onGround,
            pi: player.invincible > 0,
            ps: player.powerShield > 0,
            en: enemies.map(e => ({ x: e.x, y: e.y, a: e.alive ? 1 : 0 })),
            co: coins.map(c => c.collected ? 1 : 0),
            pa: particles.length > 0 ? particles.slice(0, 20).map(p => ({ x: p.x, y: p.y, c: p.color })) : [],
            bo: boss ? { x: boss.x, y: boss.y, hp: boss.hp, a: boss.alive ? 1 : 0 } : null,
            s: typeof score !== 'undefined' ? score : 0,
            l: typeof lives !== 'undefined' ? lives : 3
        };

        this.frames.push(frameData);
    }

    // --- Playback ---

    startReplay(replayData) {
        if (!replayData || replayData.frames.length === 0) return;

        this.currentReplayData = replayData;
        this.isPlaying = true;
        this.playbackFrame = 0;
        this.playbackSpeed = 1;
        this.freeCameraMode = false;
        this.freeCamera = { x: 0, y: 0, zoom: 1 };

        // Set up the level for replay
        if (typeof currentLevel !== 'undefined') {
            currentLevel = replayData.level;
        }
        if (typeof currentTheme !== 'undefined' && replayData.theme) {
            currentTheme = { ...replayData.theme };
        }
        if (typeof parseLevel === 'function' && typeof levelMapFor === 'function') {
            parseLevel(levelMapFor(replayData.level));
        }

        if (typeof gameState !== 'undefined' && typeof STATE !== 'undefined') {
            gameState = STATE.PLAYING;
        }

        // Stop music during replay
        if (typeof stopThemeMusic === 'function') stopThemeMusic();

        // Hide overlay
        if (typeof hideOverlay === 'function') hideOverlay();

        // Show replay controls
        if (this.replayControls) this.replayControls.classList.remove('hidden');

        this.hideReplayPanel();
    }

    stopReplay() {
        this.isPlaying = false;
        this.currentReplayData = null;
        this.freeCameraMode = false;
        if (this.replayControls) this.replayControls.classList.add('hidden');

        // Return to menu
        if (typeof gameState !== 'undefined' && typeof STATE !== 'undefined') {
            gameState = STATE.MENU;
        }
        if (typeof showOverlay === 'function') {
            showOverlay('Mod Runner V3', 'Nouveau: personnage selectable, musique de theme et boss final niveau 10.', 'Demarrer');
        }
    }

    toggleReplayPlayback() {
        if (!this.isPlaying) return;
        // For simplicity, playback is always advancing; this could pause
        const btn = document.getElementById('replayPlayPauseBtn');
        if (btn) {
            btn.textContent = btn.textContent === 'Pause' ? 'Reprendre' : 'Pause';
        }
    }

    cyclePlaybackSpeed() {
        const speeds = [0.25, 0.5, 1, 2, 4];
        const idx = speeds.indexOf(this.playbackSpeed);
        this.playbackSpeed = speeds[(idx + 1) % speeds.length];
        const btn = document.getElementById('replaySpeedBtn');
        if (btn) btn.textContent = this.playbackSpeed + 'x';
    }

    toggleFreeCamera() {
        this.freeCameraMode = !this.freeCameraMode;
        const btn = document.getElementById('replayFreeCamBtn');
        if (btn) btn.textContent = this.freeCameraMode ? 'Camera Auto' : 'Camera Libre';
        if (!this.freeCameraMode) {
            this.freeCamera.zoom = 1;
        }
    }

    applyReplayFrame() {
        if (!this.isPlaying || !this.currentReplayData) return;

        const frames = this.currentReplayData.frames;
        if (this.playbackFrame >= frames.length) {
            this.stopReplay();
            return;
        }

        const f = frames[this.playbackFrame];

        // Apply player state
        player.x = f.px;
        player.y = f.py;
        player.vx = f.pvx;
        player.vy = f.pvy;
        player.facingRight = f.pf;
        player.onGround = f.pg;
        player.invincible = f.pi ? 4 : 0;
        player.powerShield = f.ps ? 1 : 0;

        // Apply enemies
        if (f.en) {
            for (let i = 0; i < f.en.length && i < enemies.length; i++) {
                enemies[i].x = f.en[i].x;
                enemies[i].y = f.en[i].y;
                enemies[i].alive = f.en[i].a === 1;
            }
        }

        // Apply coins
        if (f.co) {
            for (let i = 0; i < f.co.length && i < coins.length; i++) {
                coins[i].collected = f.co[i] === 1;
            }
        }

        // Apply particles
        particles.length = 0;
        if (f.pa && f.pa.length > 0) {
            for (const pd of f.pa) {
                particles.push({ x: pd.x, y: pd.y, vx: 0, vy: 0, life: 10, color: pd.c });
            }
        }

        // Apply boss
        if (f.bo && boss) {
            boss.x = f.bo.x;
            boss.y = f.bo.y;
            boss.hp = f.bo.hp;
            boss.alive = f.bo.a === 1;
        }

        // Update HUD
        score = f.s;
        lives = f.l;
        if (typeof updateHUD === 'function') updateHUD();

        // Update camera
        if (!this.freeCameraMode) {
            let tx = player.x - CANVAS_W / 2 + player.w / 2;
            let ty = player.y - CANVAS_H / 2 + player.h / 2;
            tx = Math.max(0, Math.min(tx, LEVEL_W - CANVAS_W));
            ty = Math.max(0, Math.min(ty, LEVEL_H - CANVAS_H));
            camera.x += (tx - camera.x) * 0.1;
            camera.y += (ty - camera.y) * 0.1;
        } else {
            // Free camera: allow WASD/arrows to pan
            const camSpeed = 8;
            if (typeof keys !== 'undefined') {
                if (keys['ArrowLeft'] || keys['a']) this.freeCamera.x -= camSpeed;
                if (keys['ArrowRight'] || keys['d']) this.freeCamera.x += camSpeed;
                if (keys['ArrowUp'] || keys['w']) this.freeCamera.y -= camSpeed;
                if (keys['ArrowDown'] || keys['s']) this.freeCamera.y += camSpeed;
            }
            camera.x = this.freeCamera.x;
            camera.y = this.freeCamera.y;
        }

        // Advance frame
        for (let i = 0; i < this.playbackSpeed; i++) {
            if (this.playbackFrame < frames.length - 1) {
                this.playbackFrame++;
            }
        }

        // Update timeline
        if (this.replayTimeline) {
            this.replayTimeline.value = (this.playbackFrame / (frames.length - 1)) * 100;
        }

        // Update time display
        if (this.replayTimeDisplay) {
            const sec = Math.floor(this.playbackFrame / 60);
            const totalSec = Math.floor(frames.length / 60);
            this.replayTimeDisplay.textContent = `${sec}s / ${totalSec}s`;
        }
    }

    // --- Save / Load ---

    saveReplays() {
        try {
            // Only save metadata + compressed frame data to avoid localStorage overflow
            const toSave = this.savedReplays.map(r => ({
                id: r.id,
                date: r.date,
                level: r.level,
                character: r.character,
                difficulty: r.difficulty,
                score: r.score,
                duration: r.duration,
                theme: r.theme,
                // Downsample frames for storage: keep every 2nd frame
                frames: r.frames.filter((_, i) => i % 2 === 0).slice(0, 60 * 60 * 2) // Max 2 min stored
            }));
            localStorage.setItem('mod_runner_replays', JSON.stringify(toSave));
        } catch (e) {
            console.warn('Could not save replays:', e);
        }
    }

    loadSavedReplays() {
        try {
            const raw = localStorage.getItem('mod_runner_replays');
            if (raw) {
                this.savedReplays = JSON.parse(raw);
            }
        } catch (e) {
            this.savedReplays = [];
        }
    }

    deleteReplay(id) {
        this.savedReplays = this.savedReplays.filter(r => r.id !== id);
        this.saveReplays();
        this.renderReplayList();
    }

    // --- UI ---

    renderReplayList() {
        if (!this.replayList) return;
        this.replayList.innerHTML = '';

        if (this.savedReplays.length === 0) {
            this.replayList.innerHTML = '<p style="color:#888;font-size:0.85em;">Aucun replay enregistre.</p>';
            return;
        }

        this.savedReplays.forEach(replay => {
            const card = document.createElement('div');
            card.className = 'replay-card';

            const date = new Date(replay.date);
            const dateStr = date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            const durSec = Math.floor(replay.duration / 60);

            card.innerHTML = `
                <div class="replay-info">
                    <span class="replay-level">Niveau ${replay.level}</span>
                    <span class="replay-score">Score: ${replay.score}</span>
                    <span class="replay-duration">${durSec}s</span>
                    <span class="replay-date">${dateStr}</span>
                    <span class="replay-char">${replay.character}</span>
                </div>
                <div class="replay-actions">
                    <button class="replay-play-btn" data-id="${replay.id}">Lire</button>
                    <button class="replay-delete-btn" data-id="${replay.id}">X</button>
                </div>
            `;

            card.querySelector('.replay-play-btn').addEventListener('click', () => {
                this.startReplay(replay);
            });
            card.querySelector('.replay-delete-btn').addEventListener('click', () => {
                this.deleteReplay(replay.id);
            });

            this.replayList.appendChild(card);
        });
    }

    // --- Export / Share ---

    exportCurrentReplay() {
        if (!this.currentReplayData && this.savedReplays.length > 0) {
            this.currentReplayData = this.savedReplays[0];
        }
        if (!this.currentReplayData) return;

        // Export as JSON for sharing
        const dataStr = JSON.stringify({
            version: 1,
            level: this.currentReplayData.level,
            character: this.currentReplayData.character,
            score: this.currentReplayData.score,
            frames: this.currentReplayData.frames.filter((_, i) => i % 3 === 0) // Downsample
        });

        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `replay_niveau${this.currentReplayData.level}_${this.currentReplayData.score}pts.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async exportAsWebM() {
        if (!this.isPlaying || !this.currentReplayData) return;

        const canvasEl = document.getElementById('gameCanvas');
        if (!canvasEl) return;

        try {
            const stream = canvasEl.captureStream(30);
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
                    ? 'video/webm;codecs=vp9'
                    : 'video/webm'
            });
            const chunks = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `replay_niveau${this.currentReplayData.level}.webm`;
                a.click();
                URL.revokeObjectURL(url);
            };

            mediaRecorder.start();

            // Record for the duration of the replay or max 30 seconds
            const maxRecordMs = 30000;
            setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            }, maxRecordMs);

            // Store recorder reference so we can stop it early
            this._activeRecorder = mediaRecorder;
        } catch (e) {
            console.warn('WebM export not supported:', e);
        }
    }

    stopWebMExport() {
        if (this._activeRecorder && this._activeRecorder.state === 'recording') {
            this._activeRecorder.stop();
        }
    }
}

// Global instance
const replayManager = new ReplayManager();

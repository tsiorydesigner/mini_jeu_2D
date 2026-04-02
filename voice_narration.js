// JS/voice_narration.js
class VoiceNarrator {
    constructor() {
        this.audioContext = null;
        this.voiceGain = null;
        this.isInitialized = false;
        this.voices = {
            gameOver: 'Game Over!',
            levelComplete: 'Level Complete!',
            win: 'Victory!',
            levelStart: (level) => `Starting Level ${level}!`,
            coinCollected: 'Coin collected!',
            powerupObtained: 'Power-up!',
            damageTaken: 'Ouch!',
            enemyKilled: 'Enemy down!'
            // Add more character comments here
        };
        this.queue = [];
        this.isPlaying = false;
    }

    init() {
        if (this.isInitialized) return;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.voiceGain = this.audioContext.createGain();
            this.voiceGain.gain.value = 0.8; // Default voice volume
            this.voiceGain.connect(this.audioContext.destination);
            this.isInitialized = true;
            console.log("VoiceNarrator initialized.");
        } catch (e) {
            console.warn("Web Audio API not supported for VoiceNarrator:", e);
            this.isInitialized = false;
        }
    }

    // Placeholder for playing actual audio files
    // In a real scenario, this would load and play an AudioBuffer
    _playAudio(text, freq = 440, duration = 0.5) {
        console.log(`[Voice] ${text}`); // Log the narration text

        if (!this.isInitialized || !this.audioContext) {
            console.warn("VoiceNarrator not initialized or AudioContext not available.");
            return;
        }

        // Simple beep sound to simulate voice if no actual audio files are loaded
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime); // Lower volume for beep
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.voiceGain);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    _addToQueue(func, ...args) {
        this.queue.push({ func, args });
        if (!this.isPlaying) {
            this._processQueue();
        }
    }

    _processQueue() {
        if (this.queue.length === 0) {
            this.isPlaying = false;
            return;
        }

        this.isPlaying = true;
        const { func, args } = this.queue.shift();
        func(...args);

        // Simulate audio duration before playing next item in queue
        // This would be replaced by actual audio playback completion callback
        setTimeout(() => this._processQueue(), 600); // Adjust based on average voice clip duration
    }

    playGameOver() {
        this._addToQueue(this._playAudio.bind(this), this.voices.gameOver, 150, 1.0);
    }

    playLevelComplete() {
        this._addToQueue(this._playAudio.bind(this), this.voices.levelComplete, 600, 0.8);
    }

    playWin() {
        this._addToQueue(this._playAudio.bind(this), this.voices.win, 800, 1.2);
    }

    playLevelStartComment(level) {
        this._addToQueue(this._playAudio.bind(this), this.voices.levelStart(level), 500, 0.7);
    }

    playCoinComment() {
        if (Math.random() < 0.2) { // 20% chance to avoid spam
            this._addToQueue(this._playAudio.bind(this), this.voices.coinCollected, 700, 0.4);
        }
    }

    playPowerupComment() {
        this._addToQueue(this._playAudio.bind(this), this.voices.powerupObtained, 900, 0.6);
    }

    playDamageTaken() {
        this._addToQueue(this._playAudio.bind(this), this.voices.damageTaken, 200, 0.5);
    }

    playEnemyKilled() {
        if (Math.random() < 0.3) { // 30% chance to avoid spam
            this._addToQueue(this._playAudio.bind(this), this.voices.enemyKilled, 650, 0.5);
        }
    }

    // Call this on user interaction to enable audio playback
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

const voiceNarrator = new VoiceNarrator();

// Initialize on first user interaction to comply with browser autoplay policies
document.addEventListener('click', () => voiceNarrator.resumeAudioContext(), { once: true });
document.addEventListener('keydown', () => voiceNarrator.resumeAudioContext(), { once: true });
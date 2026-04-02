// Système de gestion des paramètres pour Mod Runner
class SettingsManager {
    constructor() {
        this.settings = {
            particlesEnabled: true,
            retroMode: false,
            retroBlur: 0.5,
            fpsCap: 60,
            masterVolume: 0.7,
            musicVolume: 0.4,
            sfxVolume: 0.5
        };
        this.loadSettings();
        this.initUI();
    }

    loadSettings() {
        const saved = localStorage.getItem('mod_runner_settings');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.settings = { ...this.settings, ...data };
            } catch (e) {
                console.error("Erreur lors du chargement des paramètres:", e);
            }
        }
        this.applySettings();
    }

    saveSettings() {
        localStorage.setItem('mod_runner_settings', JSON.stringify(this.settings));
        this.applySettings();
    }

    applySettings() {
        // Mode Rétro : Application d'une classe CSS sur le canvas ou son conteneur
        const gameContainer = document.getElementById('game-container') || document.querySelector('canvas');
        if (gameContainer) {
            if (this.settings.retroMode) {
                gameContainer.classList.add('retro-mode');
                // Appliquer l'intensité du flou via la variable CSS
                gameContainer.style.setProperty('--retro-blur', `${this.settings.retroBlur}px`);
            } else {
                gameContainer.classList.remove('retro-mode');
                gameContainer.style.removeProperty('--retro-blur');
            }
        }

        // Application des volumes à l'AudioManager
        if (window.audioManager) {
            audioManager.setVolume(this.settings.masterVolume);
            // Note: Les gains individuels peuvent être ajustés ici si exposés
        }
    }

    initUI() {
        // Lier les éléments HTML aux paramètres
        document.addEventListener('DOMContentLoaded', () => {
            const particlesCheck = document.getElementById('setting-particles');
            const retroCheck = document.getElementById('setting-retro');
            const fpsSelect = document.getElementById('setting-fps');
            const retroBlurSlider = document.getElementById('setting-retro-blur');

            if (particlesCheck) {
                particlesCheck.checked = this.settings.particlesEnabled;
                particlesCheck.addEventListener('change', (e) => {
                    this.toggleParticles(e.target.checked);
                });
            }

            if (retroCheck) {
                retroCheck.checked = this.settings.retroMode;
                retroCheck.addEventListener('change', (e) => {
                    this.settings.retroMode = e.target.checked;
                    this.saveSettings();
                });
            }

            if (fpsSelect) {
                fpsSelect.value = this.settings.fpsCap;
                fpsSelect.addEventListener('change', (e) => {
                    this.setFPS(e.target.value);
                });
            }

            if (retroBlurSlider) {
                retroBlurSlider.value = this.settings.retroBlur;
                retroBlurSlider.addEventListener('input', (e) => {
                    this.settings.retroBlur = parseFloat(e.target.value);
                    this.saveSettings();
                });
            }
        });
    }

    updateUI() {
        const particlesCheck = document.getElementById('setting-particles');
        const retroCheck = document.getElementById('setting-retro');
        const fpsSelect = document.getElementById('setting-fps');
        const retroBlurSlider = document.getElementById('setting-retro-blur');

        if (particlesCheck) particlesCheck.checked = this.settings.particlesEnabled;
        if (retroCheck) retroCheck.checked = this.settings.retroMode;
        if (fpsSelect) fpsSelect.value = this.settings.fpsCap;
        if (retroBlurSlider) retroBlurSlider.value = this.settings.retroBlur;
    }

    setFPS(value) {
        this.settings.fpsCap = parseInt(value) || 60;
        this.saveSettings();
    }

    toggleParticles(enabled) {
        this.settings.particlesEnabled = enabled;
        this.saveSettings();
    }
}

// Instance globale
window.settingsManager = new SettingsManager();
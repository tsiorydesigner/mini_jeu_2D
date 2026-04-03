/**
 * Scorecard UI Manager - Gère l'interface de partage et génération de scorecard
 */
class ScorecardUIManager {
    constructor() {
        this.panel = document.getElementById('scorecardPanel');
        this.overlay = document.getElementById('scorecardOverlay');
        this.closeBtn = document.getElementById('closeScorecardBtn');
        this.shareScoreBtn = document.getElementById('shareScoreBtn');
        
        this.twitterBtn = document.getElementById('twitterShareBtn');
        this.discordBtn = document.getElementById('discordShareBtn');
        this.downloadBtn = document.getElementById('downloadImageBtn');
        
        this.successMessage = document.getElementById('successMessage');
        
        this.currentScore = 0;
        this.currentLevel = 0;
        this.currentTime = 0;
        this.currentCharacter = 'runner';
        this.currentDifficulty = 'normal';
        this.scorecardImageUrl = null;

        this.initEventListeners();
    }

    initEventListeners() {
        if (this.shareScoreBtn) {
            this.shareScoreBtn.addEventListener('click', () => this.show());
        }
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.hide());
        }
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.hide());
        }
        if (this.twitterBtn) {
            this.twitterBtn.addEventListener('click', () => this.shareOnTwitter());
        }
        if (this.discordBtn) {
            this.discordBtn.addEventListener('click', () => this.shareOnDiscord());
        }
        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', () => this.downloadImage());
        }
    }

    /**
     * Affiche le panneau de scorecard
     */
    async show() {
        if (this.panel) {
            this.panel.classList.remove('hidden');
            this.overlay.classList.remove('hidden');
            
            // Générer l'image de scorecard
            await this.generateScorecardImage();
        }
    }

    /**
     * Cache le panneau de scorecard
     */
    hide() {
        if (this.panel) {
            this.panel.classList.add('hidden');
            this.overlay.classList.add('hidden');
        }
    }

    /**
     * Met à jour les données du scorecard
     */
    updateScoreData(score, level, timeMs, character = 'runner', difficulty = 'normal') {
        this.currentScore = score;
        this.currentLevel = level;
        this.currentTime = timeMs;
        this.currentCharacter = character;
        this.currentDifficulty = difficulty;

        // Mettre à jour l'affichage dans le panneau
        this.updateDisplay();
    }

    /**
     * Met à jour l'affichage du panneau
     */
    updateDisplay() {
        const scoreEl = document.getElementById('scorecard-score');
        const levelEl = document.getElementById('scorecard-level');
        const timeEl = document.getElementById('scorecard-time');
        const charEl = document.getElementById('scorecard-character');

        if (scoreEl) scoreEl.textContent = scorecardGenerator.formatScore(this.currentScore);
        if (levelEl) levelEl.textContent = this.currentLevel;
        if (timeEl) timeEl.textContent = scorecardGenerator.formatTime(this.currentTime);
        if (charEl) charEl.textContent = scorecardGenerator.capitalizeFirst(this.currentCharacter);
    }

    /**
     * Génère l'image de scorecard
     */
    async generateScorecardImage() {
        try {
            const imageUrl = await scorecardGenerator.generateScorecardImage(
                this.currentScore,
                this.currentLevel,
                this.currentTime,
                this.currentCharacter,
                this.currentDifficulty
            );
            
            this.scorecardImageUrl = imageUrl;
            
            // Afficher l'image dans le conteneur
            const container = document.getElementById('scorecardImageContainer');
            if (container) {
                container.innerHTML = `<img src="${imageUrl}" alt="Score Card" style="max-width: 100%; border-radius: 8px;">`;
            }

            // Générer le QR code
            this.generateQRCode();
        } catch (error) {
            console.error('Erreur lors de la génération du scorecard:', error);
            this.showMessage('Erreur lors de la génération du scorecard', 'error');
        }
    }

    /**
     * Génère un QR code
     */
    generateQRCode() {
        const container = document.getElementById('qrCodeContainer');
        if (!container) return;

        container.innerHTML = '';

        if (window.QRCode) {
            try {
                const qrCanvas = document.createElement('canvas');
                QRCode.toCanvas(qrCanvas, 'https://modrunner.nosytech.com', {
                    width: 120,
                    margin: 1,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                }, (err) => {
                    if (!err) {
                        container.appendChild(qrCanvas);
                    }
                });
            } catch (error) {
                console.error('Erreur génération QR:', error);
            }
        }
    }

    /**
     * Partage sur Twitter
     */
    shareOnTwitter() {
        const url = scorecardGenerator.generateTwitterShareURL(
            this.currentScore,
            this.currentLevel,
            this.currentCharacter
        );
        window.open(url, 'twitter-share', 'width=550,height=420');
        this.showMessage('✅ Redirection vers Twitter!', 'success');
    }

    /**
     * Partage sur Discord
     */
    shareOnDiscord() {
        scorecardGenerator.copyDiscordText(
            this.currentScore,
            this.currentLevel,
            this.currentCharacter
        );
        this.showMessage('✅ Texte Discord copié au presse-papiers!', 'success');
    }

    /**
     * Télécharge l'image du scorecard
     */
    downloadImage() {
        if (this.scorecardImageUrl) {
            scorecardGenerator.downloadImage(this.scorecardImageUrl, this.currentScore);
            this.showMessage('✅ Téléchargement de l\'image lancé!', 'success');
        }
    }

    /**
     * Affiche un message temporaire
     */
    showMessage(message, type = 'info') {
        const msgEl = document.getElementById('successMessage');
        if (msgEl) {
            msgEl.textContent = message;
            msgEl.className = 'success-message';
            if (type === 'error') {
                msgEl.style.background = 'rgba(244, 67, 54, 0.2)';
                msgEl.style.color = '#f44336';
                msgEl.style.borderColor = '#f44336';
            }
            msgEl.classList.remove('hidden');

            setTimeout(() => {
                msgEl.classList.add('hidden');
            }, 3000);
        }
    }
}

// Instance globale
const scorecardUI = new ScorecardUIManager();

// Vérifier que scorecard.js est chargé
window.addEventListener('DOMContentLoaded', () => {
    if (typeof scorecardGenerator === 'undefined') {
        console.warn('scorecard.js n\'a pas pu être chargé. Assurez-vous que le fichier existe.');
    }
});

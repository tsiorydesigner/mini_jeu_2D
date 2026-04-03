/**
 * ScoreCard Generator - Génère une image de score avec QR code pour partage social
 */
class ScorecardGenerator {
    constructor() {
        this.cardWidth = 1200;
        this.cardHeight = 630;
        this.qrSize = 150;
    }

    /**
     * Génère une image de scorecard en tant qu'URL data
     * @param {number} score - Le score du joueur
     * @param {number} level - Le niveau atteint
     * @param {number} time - Temps de jeu en millisecondes
     * @param {string} character - Personnage joué
     * @param {string} difficulty - Difficulté
     * @returns {Promise<string>} URL data de l'image PNG
     */
    async generateScorecardImage(score, level, time, character = 'runner', difficulty = 'normal') {
        const canvas = document.createElement('canvas');
        canvas.width = this.cardWidth;
        canvas.height = this.cardHeight;
        const ctx = canvas.getContext('2d');

        // Fond dégradé
        const gradient = ctx.createLinearGradient(0, 0, this.cardWidth, this.cardHeight);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#0f3460');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.cardWidth, this.cardHeight);

        // Bordure dorée
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 8;
        ctx.strokeRect(8, 8, this.cardWidth - 16, this.cardHeight - 16);

        // Titre
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 64px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎮 MOD RUNNER 🎮', this.cardWidth / 2, 80);

        // Ligne de séparation
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50, 110);
        ctx.lineTo(this.cardWidth - 50, 110);
        ctx.stroke();

        // Infos de performance (gauche)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial, sans-serif';
        ctx.textAlign = 'left';
        const leftX = 80;
        const statsY = 200;

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 28px Arial, sans-serif';
        ctx.fillText('SCORE', leftX, statsY);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 48px Arial, sans-serif';
        ctx.fillText(this.formatScore(score), leftX, statsY + 60);

        // Niveau
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 28px Arial, sans-serif';
        ctx.fillText('NIVEAU', leftX, statsY + 140);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 48px Arial, sans-serif';
        ctx.fillText(level, leftX, statsY + 200);

        // Temps
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 28px Arial, sans-serif';
        ctx.fillText('TEMPS', leftX, statsY + 280);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px Arial, sans-serif';
        const formattedTime = this.formatTime(time);
        ctx.fillText(formattedTime, leftX, statsY + 340);

        // Détails (droite)
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.textAlign = 'right';
        const rightX = this.cardWidth - 80;
        const detailsY = 200;

        ctx.fillText('Personnage', rightX, detailsY);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '20px Arial, sans-serif';
        ctx.fillText(this.capitalizeFirst(character), rightX, detailsY + 35);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.fillText('Difficulté', rightX, detailsY + 100);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '20px Arial, sans-serif';
        const difficultyLabel = difficulty === 'easy' ? 'Facile' : difficulty === 'hard' ? 'Difficile' : 'Normal';
        ctx.fillText(difficultyLabel, rightX, detailsY + 135);

        // Message de partage
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Partage sur Twitter / Discord', this.cardWidth / 2, this.cardHeight - 60);

        // QR Code - généré séparément, on ajoute un placeholder si dispo
        const qrImg = await this.generateQRImage();
        if (qrImg) {
            ctx.drawImage(qrImg, this.cardWidth - this.qrSize - 40, this.cardHeight - this.qrSize - 40, this.qrSize, this.qrSize);
        }

        // Lien du site
        ctx.fillStyle = '#AAAAAA';
        ctx.font = '16px Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('modrunner.nosytech.com', 40, this.cardHeight - 40);

        return canvas.toDataURL('image/png');
    }

    /**
     * Génère une image QR code
     * @returns {Promise<HTMLCanvasElement>} Canvas contenant le QR code
     */
    async generateQRImage() {
        return new Promise((resolve) => {
            if (window.QRCode) {
                try {
                    const qrCanvas = document.createElement('canvas');
                    QRCode.toCanvas(qrCanvas, 'https://modrunner.nosytech.com', {
                        width: this.qrSize,
                        margin: 1,
                        color: {
                            dark: '#000000',
                            light: '#FFFFFF'
                        }
                    }, (err) => {
                        if (err) {
                            console.error('Erreur génération QR:', err);
                            resolve(null);
                        } else {
                            resolve(qrCanvas);
                        }
                    });
                } catch (error) {
                    console.error('Erreur QR Code:', error);
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        });
    }

    /**
     * Génère une URL de partage Twitter
     * @param {number} score - Score atteint
     * @param {number} level - Niveau atteint
     * @param {string} character - Personnage joué
     * @returns {string} URL pour partage Twitter
     */
    generateTwitterShareURL(score, level, character) {
        const text = `🎮 J'ai atteint le score de ${this.formatScore(score)} au niveau ${level} avec ${this.capitalizeFirst(character)} dans Mod Runner! Peux-tu faire mieux? 🚀`;
        const url = 'https://modrunner.nosytech.com';
        const hashtags = 'ModRunner,2DPlatformer,GameDev,Gaming';
        
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtags}`;
    }

    /**
     * Génère une URL de partage Discord (invite serveur)
     * @param {number} score - Score atteint
     * @param {number} level - Niveau atteint
     * @param {string} character - Personnage joué
     * @returns {string} Texte de partage Discord
     */
    generateDiscordShareText(score, level, character) {
        return `🎮 **Mod Runner** - Nouveau record!\n` +
               `**Score:** ${this.formatScore(score)}\n` +
               `**Niveau:** ${level}\n` +
               `**Personnage:** ${this.capitalizeFirst(character)}\n` +
               `Joue maintenant: https://modrunner.nosytech.com`;
    }

    /**
     * Copie le texte de partage Discord
     * @param {number} score - Score
     * @param {number} level - Niveau
     * @param {string} character - Personnage
     */
    copyDiscordText(score, level, character) {
        const text = this.generateDiscordShareText(score, level, character);
        navigator.clipboard.writeText(text).then(() => {
            console.log('Texte Discord copié!');
        }).catch((err) => {
            console.error('Erreur lors de la copie:', err);
        });
    }

    /**
     * Télécharge l'image scorecard
     * @param {string} dataUrl - URL data de l'image
     * @param {number} score - Score du joueur
     */
    downloadImage(dataUrl, score) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `modrunner-score-${score}-${new Date().getTime()}.png`;
        link.click();
    }

    /**
     * Formate le score avec séparateurs de milliers
     * @param {number} score - Score brut
     * @returns {string} Score formaté
     */
    formatScore(score) {
        return score.toLocaleString('fr-FR');
    }

    /**
     * Formate le temps en MM:SS ou HH:MM:SS
     * @param {number} timeMs - Temps en millisecondes
     * @returns {string} Temps formaté
     */
    formatTime(timeMs) {
        const totalSeconds = Math.floor(timeMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    /**
     * Capitalise la première lettre
     * @param {string} str - Chaîne
     * @returns {string} Chaîne capitalisée
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Instance globale
const scorecardGenerator = new ScorecardGenerator();


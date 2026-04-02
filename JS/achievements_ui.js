// Interface utilisateur pour le système d'accomplissements

class AchievementsUI {
    constructor() {
        this.achievementsPanel = document.getElementById('achievementsPanel');
        this.achievementsBtn = document.getElementById('achievementsBtn');
        this.closeAchievementsBtn = document.getElementById('closeAchievementsBtn');
        this.resetAchievementsBtn = document.getElementById('resetAchievementsBtn');
        this.achievementsGrid = document.getElementById('achievementsGrid');
        this.progressText = document.getElementById('achievementsProgressText');
        this.progressFill = document.getElementById('achievementsProgressFill');
        
        if (this.achievementsBtn) this.initEventListeners();
    }

    initEventListeners() {
        // Bouton pour ouvrir le panneau
        if (this.achievementsBtn) this.achievementsBtn.addEventListener('click', () => {
            this.showAchievementsPanel();
        });

        // Bouton pour fermer
        if (this.closeAchievementsBtn) this.closeAchievementsBtn.addEventListener('click', () => {
            this.hideAchievementsPanel();
        });

        // Bouton pour réinitialiser
        if (this.resetAchievementsBtn) this.resetAchievementsBtn.addEventListener('click', () => {
            if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les accomplissements ?')) {
                achievementManager.reset();
                this.renderAchievements();
            }
        });

        // Touche A pour ouvrir/fermer (seulement hors jeu)
        document.addEventListener('keydown', (e) => {
            if ((e.key === 'a' || e.key === 'A') && typeof gameState !== 'undefined' && gameState !== 1) {
                if (this.achievementsPanel && this.achievementsPanel.classList.contains('hidden')) {
                    this.showAchievementsPanel();
                } else if (this.achievementsPanel) {
                    this.hideAchievementsPanel();
                }
            }
        });
    }

    showAchievementsPanel() {
        if (!this.achievementsPanel) return;
        this.achievementsPanel.classList.remove('hidden');
        this.renderAchievements();
    }

    hideAchievementsPanel() {
        if (!this.achievementsPanel) return;
        this.achievementsPanel.classList.add('hidden');
    }

    renderAchievements() {
        const achievements = achievementManager.getAllAchievements();
        const progress = achievementManager.getProgress();
        
        // Mettre à jour la barre de progression
        this.progressText.textContent = `${progress.unlocked}/${progress.total}`;
        this.progressFill.style.width = `${progress.percentage}%`;
        
        // Vider la grille
        this.achievementsGrid.innerHTML = '';
        
        // Créer les cartes d'accomplissements
        achievements.forEach(achievement => {
            const card = this.createAchievementCard(achievement);
            this.achievementsGrid.appendChild(card);
        });
    }

    createAchievementCard(achievement) {
        const card = document.createElement('div');
        card.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;
        
        card.innerHTML = `
            <span class="status">${achievement.unlocked ? '✓' : '🔒'}</span>
            <span class="icon">${achievement.icon}</span>
            <div class="name">${achievement.name}</div>
            <div class="description">${achievement.description}</div>
        `;
        
        return card;
    }
}

// Initialiser l'interface des accomplissements
document.addEventListener('DOMContentLoaded', () => {
    window.achievementsUI = new AchievementsUI();
});

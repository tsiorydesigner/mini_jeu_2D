// Système d'Accomplissements (Achievements) pour Mod Runner

class AchievementManager {
    constructor() {
        this.achievements = new Map();
        this.unlockedAchievements = new Set();
        this.stats = {
            enemiesKilled: 0,
            coinsCollected: 0,
            levelsCompleted: new Set(),
            noDamageLevels: new Set(),
            bestTimes: {}
        };
        this.currentRunStats = {
            levelStartTime: 0,
            damageTaken: false,
            enemiesKilledInLevel: 0
        };
        
        this.initAchievements();
        this.loadProgress();
    }

    // Initialisation des accomplissements disponibles
    initAchievements() {
        this.achievements.set('first_blood', {
            id: 'first_blood',
            name: 'Premier Sang',
            description: 'Tuer votre premier ennemi',
            icon: '⚔️',
            condition: () => this.stats.enemiesKilled >= 1,
            unlocked: false
        });

        this.achievements.set('collector', {
            id: 'collector',
            name: 'Collectionneur',
            description: 'Collecter 100 pièces au total',
            icon: '💰',
            condition: () => this.stats.coinsCollected >= 100,
            unlocked: false
        });

        this.achievements.set('speedrunner', {
            id: 'speedrunner',
            name: 'Speedrunner',
            description: 'Terminer un niveau en moins de 30 secondes',
            icon: '⚡',
            condition: () => {
                for (const [level, time] of Object.entries(this.stats.bestTimes)) {
                    if (time < 30) return true;
                }
                return false;
            },
            unlocked: false
        });

        this.achievements.set('no_damage', {
            id: 'no_damage',
            name: 'Sans Dégâts',
            description: 'Terminer un niveau sans toucher un ennemi',
            icon: '🛡️',
            condition: () => this.stats.noDamageLevels.size >= 1,
            unlocked: false
        });

        this.achievements.set('master', {
            id: 'master',
            name: 'Maître du Jeu',
            description: 'Terminer tous les niveaux',
            icon: '👑',
            condition: () => this.stats.levelsCompleted.size >= 10,
            unlocked: false
        });

        this.achievements.set('coin_hoarder', {
            id: 'coin_hoarder',
            name: 'Accro aux Pièces',
            description: 'Collecter 500 pièces au total',
            icon: '🏆',
            condition: () => this.stats.coinsCollected >= 500,
            unlocked: false
        });

        this.achievements.set('enemy_slayer', {
            id: 'enemy_slayer',
            name: 'Tueur d\'Ennemis',
            description: 'Tuer 50 ennemis au total',
            icon: '💀',
            condition: () => this.stats.enemiesKilled >= 50,
            unlocked: false
        });

        this.achievements.set('checkpoint_master', {
            id: 'checkpoint_master',
            name: 'Checkpoint Master',
            description: 'Atteindre 10 checkpoints',
            icon: '🚩',
            condition: () => this.stats.checkpointsReached >= 10,
            unlocked: false
        });
    }

    // Charger la progression depuis localStorage
    loadProgress() {
        const saved = localStorage.getItem('mod_runner_achievements');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.stats = { ...this.stats, ...data.stats };
                this.unlockedAchievements = new Set(data.unlocked || []);
                
                // Restaurer les Sets
                if (data.stats?.levelsCompleted) {
                    this.stats.levelsCompleted = new Set(data.stats.levelsCompleted);
                }
                if (data.stats?.noDamageLevels) {
                    this.stats.noDamageLevels = new Set(data.stats.noDamageLevels);
                }
                
                // Marquer les accomplissements comme débloqués
                for (const id of this.unlockedAchievements) {
                    const ach = this.achievements.get(id);
                    if (ach) ach.unlocked = true;
                }
            } catch (e) {
                console.warn('Erreur chargement accomplissements:', e);
            }
        }
    }

    // Sauvegarder la progression
    saveProgress() {
        const data = {
            stats: {
                ...this.stats,
                levelsCompleted: Array.from(this.stats.levelsCompleted),
                noDamageLevels: Array.from(this.stats.noDamageLevels)
            },
            unlocked: Array.from(this.unlockedAchievements)
        };
        localStorage.setItem('mod_runner_achievements', JSON.stringify(data));
    }

    // Vérifier et débloquer les accomplissements
    checkAchievements() {
        let newUnlocks = [];
        
        for (const [id, achievement] of this.achievements) {
            if (!achievement.unlocked && achievement.condition()) {
                achievement.unlocked = true;
                this.unlockedAchievements.add(id);
                newUnlocks.push(achievement);
            }
        }

        if (newUnlocks.length > 0) {
            this.saveProgress();
            newUnlocks.forEach(ach => this.showUnlockNotification(ach));
        }

        return newUnlocks;
    }

    // Notification de déblocage
    showUnlockNotification(achievement) {
        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-title">Accomplissement Débloqué!</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animation d'entrée
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Suppression après 4 secondes
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    }

    // Événements de tracking
    onEnemyKilled() {
        this.stats.enemiesKilled++;
        this.currentRunStats.enemiesKilledInLevel++;
        this.checkAchievements();
    }

    onCoinCollected() {
        this.stats.coinsCollected++;
        this.checkAchievements();
    }

    onLevelStart() {
        this.currentRunStats.levelStartTime = performance.now();
        this.currentRunStats.damageTaken = false;
        this.currentRunStats.enemiesKilledInLevel = 0;
    }

    onLevelComplete(level) {
        const time = Math.floor((performance.now() - this.currentRunStats.levelStartTime) / 1000);
        
        // Sauvegarder le meilleur temps
        if (!this.stats.bestTimes[level] || time < this.stats.bestTimes[level]) {
            this.stats.bestTimes[level] = time;
        }

        // Marquer niveau comme complété
        this.stats.levelsCompleted.add(level);

        // Sans dégâts?
        if (!this.currentRunStats.damageTaken) {
            this.stats.noDamageLevels.add(level);
        }

        this.checkAchievements();
    }

    onDamageTaken() {
        this.currentRunStats.damageTaken = true;
    }

    onCheckpointReached() {
        this.stats.checkpointsReached = (this.stats.checkpointsReached || 0) + 1;
        this.checkAchievements();
    }

    // Obtenir tous les accomplissements pour l'UI
    getAllAchievements() {
        return Array.from(this.achievements.values());
    }

    // Obtenir la progression globale
    getProgress() {
        const total = this.achievements.size;
        const unlocked = this.unlockedAchievements.size;
        return {
            unlocked,
            total,
            percentage: Math.round((unlocked / total) * 100)
        };
    }

    // Réinitialiser (pour debug/testing)
    reset() {
        this.stats = {
            enemiesKilled: 0,
            coinsCollected: 0,
            levelsCompleted: new Set(),
            noDamageLevels: new Set(),
            bestTimes: {},
            checkpointsReached: 0
        };
        this.unlockedAchievements.clear();
        for (const ach of this.achievements.values()) {
            ach.unlocked = false;
        }
        this.saveProgress();
    }
}

// Instance globale
const achievementManager = new AchievementManager();

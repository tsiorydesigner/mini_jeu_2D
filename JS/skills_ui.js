// Interface utilisateur pour le système de compétences
class SkillsUI {
    constructor() {
        this.skillsPanel = document.getElementById('skillsPanel');
        this.skillsBtn = document.getElementById('skillsBtn');
        this.closeSkillsBtn = document.getElementById('closeSkillsBtn');
        this.skillGrid = document.getElementById('skillGrid');
        this.skillPointsDisplay = document.getElementById('skillPointsDisplay');
        
        this.initEventListeners();
        this.updateSkillPointsDisplay();
    }

    initEventListeners() {
        // Bouton pour ouvrir le panneau des compétences
        this.skillsBtn.addEventListener('click', () => {
            this.showSkillsPanel();
        });

        // Bouton pour fermer le panneau
        this.closeSkillsBtn.addEventListener('click', () => {
            this.hideSkillsPanel();
        });

        // Touche S pour ouvrir les compétences
        document.addEventListener('keydown', (e) => {
            if (e.key === 's' || e.key === 'S') {
                if (this.skillsPanel.classList.contains('hidden')) {
                    this.showSkillsPanel();
                } else {
                    this.hideSkillsPanel();
                }
            }
        });
    }

    showSkillsPanel() {
        this.skillsPanel.classList.remove('hidden');
        this.renderSkills();
        this.updateSkillPointsDisplay();
    }

    hideSkillsPanel() {
        this.skillsPanel.classList.add('hidden');
    }

    renderSkills() {
        this.skillGrid.innerHTML = '';
        
        // Afficher toutes les compétences dans l'ordre
        const skillOrder = ['doubleJump', 'dash', 'wallJump', 'powerup', 'shield', 'time', 'speed', 'gravity', 'combo', 'ultimate'];
        
        skillOrder.forEach(skillId => {
            const skill = skillSystem.skills.get(skillId);
            if (skill) {
                const skillCard = this.createSkillCard(skillId, skill);
                this.skillGrid.appendChild(skillCard);
            }
        });
    }

    createSkillCard(skillId, skill) {
        const card = document.createElement('div');
        card.className = 'skill-card';
        
        // Déterminer l'état de la compétence
        const isUnlocked = skillSystem.unlockedSkills.has(skillId);
        const isActive = skillSystem.activeSkills.has(skillId);
        
        if (isUnlocked) {
            card.classList.add('unlocked');
        } else {
            card.classList.add('locked');
        }
        
        if (isActive) {
            card.classList.add('active');
        }

        // Contenu de la carte
        card.innerHTML = `
            <div class="skill-name">${skill.name}</div>
            <div class="skill-description">${skill.description}</div>
            <div class="skill-level">Niveau ${skill.unlockLevel}</div>
            ${isUnlocked ? `
                <div class="skill-status">
                    ${isActive ? '<span style="color: #4CAF50;">✓ Actif</span>' : '<span style="color: #888;">Inactif</span>'}
                </div>
            ` : '<div class="skill-status"><span style="color: #888;">🔒 Verrouillé</span></div>'}
        `;

        // Gérer le clic sur la carte
        if (isUnlocked) {
            card.addEventListener('click', () => {
                this.toggleSkill(skillId);
            });
        }

        return card;
    }

    toggleSkill(skillId) {
        if (skillSystem.activeSkills.has(skillId)) {
            // Désactiver la compétence
            if (skillSystem.deactivateSkill(skillId)) {
                this.renderSkills();
                this.updateSkillPointsDisplay();
                console.log(`Compétence désactivée: ${skillSystem.skills.get(skillId).name}`);
            }
        } else {
            // Activer la compétence
            if (skillSystem.activateSkill(skillId)) {
                this.renderSkills();
                this.updateSkillPointsDisplay();
                console.log(`Compétence activée: ${skillSystem.skills.get(skillId).name}`);
            } else {
                console.log('Pas assez de points de compétence!');
            }
        }
    }

    updateSkillPointsDisplay() {
        this.skillPointsDisplay.textContent = skillSystem.skillPoints;
    }

    // Appelé quand le joueur gagne un niveau
    onLevelUp() {
        skillSystem.levelUp();
        this.updateSkillPointsDisplay();
        
        // Afficher une notification pour les nouvelles compétences débloquées
        const newlyUnlocked = this.getNewlyUnlockedSkills();
        if (newlyUnlocked.length > 0) {
            this.showUnlockNotification(newlyUnlocked);
        }
    }

    getNewlyUnlockedSkills() {
        const unlocked = [];
        for (const [skillId, skill] of skillSystem.skills) {
            if (skillSystem.unlockedSkills.has(skillId) && skill.unlockLevel === skillSystem.playerLevel) {
                unlocked.push(skill);
            }
        }
        return unlocked;
    }

    showUnlockNotification(skills) {
        // Créer une notification temporaire
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 2000;
            font-weight: bold;
            animation: slideIn 0.5s ease;
        `;
        
        notification.innerHTML = `
            <div>🎉 Nouvelle compétence débloquée!</div>
            ${skills.map(skill => `<div style="font-size: 0.9em; margin-top: 5px;">• ${skill.name}</div>`).join('')}
        `;
        
        document.body.appendChild(notification);
        
        // Supprimer après 3 secondes
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialiser l'interface des compétences
let skillsUI;

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    skillsUI = new SkillsUI();
});

// Fonctions globales pour le jeu
function initializeSkillsSystem() {
    // Initialiser le système avec le niveau actuel du joueur
    skillSystem.playerLevel = currentLevel || 1;
    skillSystem.skillPoints = Math.max(0, skillSystem.playerLevel - 1); // 1 point par niveau après le premier
    skillSystem.checkSkillUnlocks();
    
    if (skillsUI) {
        skillsUI.updateSkillPointsDisplay();
    }
}

function applySkillEffects() {
    // Appliquer les effets des compétences actives au joueur
    const activeSkills = skillSystem.getActiveSkills();
    
    activeSkills.forEach(skill => {
        switch(skill.name) {
            case "Double Jump Pro":
                // Augmenter le nombre de sauts
                player.maxJumps = skill.maxJumps;
                player.airControl = skill.airControl;
                break;
                
            case "Dash Éclair":
                // Activer la capacité de dash
                player.canDash = true;
                player.dashSpeed = skill.dashSpeed;
                player.dashCooldown = skill.cooldown;
                break;
                
            case "Vitesse Suprême":
                // Augmenter la vitesse de déplacement
                player.speedMultiplier = skill.speedMultiplier;
                break;
                
            case "Bouclier Énergétique":
                // Activer le bouclier
                player.shield = skill.shieldHealth;
                player.damageReduction = skill.damageReduction;
                break;
                
            // ... autres compétences
        }
    });
}

// Appeler cette fonction quand le joueur gagne un niveau
function onPlayerLevelUp() {
    if (skillsUI) {
        skillsUI.onLevelUp();
    }
    applySkillEffects();
}

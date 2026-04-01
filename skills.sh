#!/bin/bash

# Skills idéales pour Mod Runner - Jeu de plateforme 2D
# Installation des compétences et fonctionnalités avancées

echo "Installation des compétences pour Mod Runner..."

# 1. SKILL: Double Jump Enhanced
install_double_jump_enhanced() {
    echo "→ Installation: Double Jump Amélioré"
    cat << 'EOF' >> JS/game.js

// Double Jump Enhanced Skill
const doubleJumpSkill = {
    name: "Double Jump Pro",
    description: "Triple saut avec rotation aérienne",
    maxJumps: 3,
    jumpRotation: 0.15,
    airControl: 0.8,
    unlockLevel: 2
};

EOF
}

# 2. SKILL: Dash Ability
install_dash_ability() {
    echo "→ Installation: Dash Ability"
    cat << 'EOF' >> JS/game.js

// Dash Ability Skill
const dashSkill = {
    name: "Dash Éclair",
    description: "Déplacement rapide avec invincibilité temporaire",
    dashSpeed: 15,
    dashDuration: 200,
    cooldown: 1000,
    invincibilityFrames: 150,
    unlockLevel: 3
};

EOF
}

# 3. SKILL: Wall Jump
install_wall_jump() {
    echo "→ Installation: Wall Jump"
    cat << 'EOF' >> JS/game.js

// Wall Jump Skill
const wallJumpSkill = {
    name: "Wall Jump Master",
    description: "Saut murais et adhérence aux parois",
    wallSlideSpeed: 2,
    wallJumpForce: { x: 8, y: -10 },
    wallGrabDuration: 500,
    unlockLevel: 4
};

EOF
}

# 4. SKILL: Power-Up Collector
install_powerup_collector() {
    echo "→ Installation: Power-Up Collector"
    cat << 'EOF' >> JS/game.js

// Power-Up Collector Skill
const powerupSkill = {
    name: "Collectionneur de Power-Ups",
    description: "Magnétisme des pièces et bonus temporaires",
    coinMagnetRange: 80,
    powerupDuration: 5000,
    scoreMultiplier: 2,
    unlockLevel: 5
};

EOF
}

# 5. SKILL: Time Manipulation
install_time_manipulation() {
    echo "→ Installation: Time Manipulation"
    cat << 'EOF' >> JS/game.js

// Time Manipulation Skill
const timeSkill = {
    name: "Contrôle du Temps",
    description: "Ralentissement du temps et mode bullet-time",
    slowMotionFactor: 0.3,
    slowMotionDuration: 3000,
    energyCost: 20,
    unlockLevel: 7
};

EOF
}

# 6. SKILL: Shield Protection
install_shield_protection() {
    echo "→ Installation: Shield Protection"
    cat << 'EOF' >> JS/game.js

// Shield Protection Skill
const shieldSkill = {
    name: "Bouclier Énergétique",
    description: "Protection contre les dégâts et les pièges",
    shieldHealth: 3,
    regenRate: 0.01,
    damageReduction: 0.5,
    unlockLevel: 6
};

EOF
}

# 7. SKILL: Super Speed
install_super_speed() {
    echo "→ Installation: Super Speed"
    cat << 'EOF' >> JS/game.js

// Super Speed Skill
const speedSkill = {
    name: "Vitesse Suprême",
    description: "Vitesse de déplacement augmentée et trail visuel",
    speedMultiplier: 2.5,
    trailEffect: true,
    energyDrain: 0.5,
    unlockLevel: 8
};

EOF
}

# 8. SKILL: Gravity Control
install_gravity_control() {
    echo "→ Installation: Gravity Control"
    cat << 'EOF' >> JS/game.js

// Gravity Control Skill
const gravitySkill = {
    name: "Contrôle Gravitationnel",
    description: "Inversion de la gravité et flottaison",
    gravityReverse: true,
    floatDuration: 2000,
    gravityStrength: 0.3,
    unlockLevel: 9
};

EOF
}

# 9. SKILL: Combo Master
install_combo_master() {
    echo "→ Installation: Combo Master"
    cat << 'EOF' >> JS/game.js

// Combo Master Skill
const comboSkill = {
    name: "Maître des Combos",
    description: "Combos enchaînés et bonus multiplicateurs",
    comboTimeWindow: 2000,
    maxComboMultiplier: 5,
    comboResetOnHit: false,
    unlockLevel: 10
};

EOF
}

# 10. SKILL: Ultimate Ability
install_ultimate_ability() {
    echo "→ Installation: Ultimate Ability"
    cat << 'EOF' >> JS/game.js

// Ultimate Ability Skill
const ultimateSkill = {
    name: "Pouvoir Ultime",
    description: "Mode surpuissant avec toutes les compétences activées",
    duration: 10000,
    cooldown: 30000,
    allSkillsActive: true,
    unlockLevel: 10,
    requiresMaxLevel: true
};

EOF
}

# Installation de toutes les compétences
install_all_skills() {
    echo "Installation de toutes les compétences..."
    install_double_jump_enhanced
    install_dash_ability
    install_wall_jump
    install_powerup_collector
    install_time_manipulation
    install_shield_protection
    install_super_speed
    install_gravity_control
    install_combo_master
    install_ultimate_ability
}

# Création du système de gestion des compétences
create_skill_system() {
    echo "→ Création du système de gestion des compétences"
    cat << 'EOF' > JS/skills.js

// Système de gestion des compétences pour Mod Runner
class SkillSystem {
    constructor() {
        this.skills = new Map();
        this.activeSkills = new Set();
        this.playerLevel = 1;
        this.skillPoints = 0;
        this.unlockedSkills = new Set();
    }

    registerSkill(skillId, skillData) {
        this.skills.set(skillId, skillData);
    }

    unlockSkill(skillId) {
        const skill = this.skills.get(skillId);
        if (skill && this.playerLevel >= skill.unlockLevel) {
            this.unlockedSkills.add(skillId);
            return true;
        }
        return false;
    }

    activateSkill(skillId) {
        if (this.unlockedSkills.has(skillId) && this.skillPoints > 0) {
            this.activeSkills.add(skillId);
            this.skillPoints--;
            return true;
        }
        return false;
    }

    deactivateSkill(skillId) {
        if (this.activeSkills.has(skillId)) {
            this.activeSkills.delete(skillId);
            this.skillPoints++;
            return true;
        }
        return false;
    }

    getActiveSkills() {
        return Array.from(this.activeSkills).map(id => this.skills.get(id));
    }

    levelUp() {
        this.playerLevel++;
        this.skillPoints++;
        this.checkSkillUnlocks();
    }

    checkSkillUnlocks() {
        for (const [skillId, skill] of this.skills) {
            if (this.playerLevel >= skill.unlockLevel && !this.unlockedSkills.has(skillId)) {
                this.unlockSkill(skillId);
                console.log(`Compétence débloquée: ${skill.name}`);
            }
        }
    }
}

// Instance globale du système de compétences
const skillSystem = new SkillSystem();

EOF
}

# Création de l'interface utilisateur pour les compétences
create_skill_ui() {
    echo "→ Création de l'interface utilisateur pour les compétences"
    cat << 'EOF' > CSS/skills.css

/* Styles pour l'interface des compétences */
.skill-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
}

.skill-panel h2 {
    color: white;
    text-align: center;
    margin-bottom: 20px;
    font-size: 2em;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.skill-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
}

.skill-card {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 15px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
}

.skill-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
}

.skill-card.unlocked {
    background: rgba(76, 175, 80, 0.3);
    border-color: #4CAF50;
}

.skill-card.active {
    background: rgba(255, 193, 7, 0.3);
    border-color: #FFC107;
    box-shadow: 0 0 20px rgba(255, 193, 7, 0.5);
}

.skill-card.locked {
    opacity: 0.6;
    cursor: not-allowed;
}

.skill-name {
    color: white;
    font-weight: bold;
    font-size: 1.2em;
    margin-bottom: 8px;
}

.skill-description {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9em;
    margin-bottom: 10px;
}

.skill-level {
    color: #FFC107;
    font-size: 0.8em;
    font-weight: bold;
}

.skill-points {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    padding: 10px;
    text-align: center;
    color: white;
    font-weight: bold;
    margin-bottom: 15px;
}

.skill-controls {
    display: flex;
    gap: 10px;
    justify-content: center;
}

.skill-btn {
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 10px 20px;
    border-radius: 25px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s ease;
}

.skill-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
}

.skill-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

EOF
}

# Installation principale
main() {
    echo "🎮 Démarrage de l'installation des compétences pour Mod Runner"
    echo "=========================================================="
    
    # Vérification de l'environnement
    if [ ! -d "JS" ]; then
        echo "❌ Erreur: Dossier JS non trouvé. Exécutez ce script depuis la racine du projet."
        exit 1
    fi
    
    # Installation des compétences
    install_all_skills
    create_skill_system
    create_skill_ui
    
    # Ajout du CSS au HTML principal
    echo "→ Intégration des styles CSS"
    sed -i 's|<link rel="stylesheet" href="CSS/style.css">|<link rel="stylesheet" href="CSS/style.css">\n    <link rel="stylesheet" href="CSS/skills.css">|' game.html
    
    # Ajout du script des compétences au HTML
    echo "→ Intégration du script des compétences"
    sed -i 's|<script src="JS/game.js"></script>|<script src="JS/skills.js"></script>\n    <script src="JS/game.js"></script>|' game.html
    
    echo ""
    echo "✅ Installation terminée avec succès!"
    echo ""
    echo "🎯 Compétences installées:"
    echo "   • Double Jump Pro (Niveau 2)"
    echo "   • Dash Éclair (Niveau 3)"
    echo "   • Wall Jump Master (Niveau 4)"
    echo "   • Collectionneur de Power-Ups (Niveau 5)"
    echo "   • Bouclier Énergétique (Niveau 6)"
    echo "   • Contrôle du Temps (Niveau 7)"
    echo "   • Vitesse Suprême (Niveau 8)"
    echo "   • Contrôle Gravitationnel (Niveau 9)"
    echo "   • Maître des Combos (Niveau 10)"
    echo "   • Pouvoir Ultime (Niveau 10)"
    echo ""
    echo "🚀 Pour utiliser les compétences:"
    echo "   1. Lancez le jeu"
    echo "   2. Les compétences se débloquent automatiquement avec les niveaux"
    echo "   3. Utilisez les points de compétence pour activer les compétences"
    echo ""
    echo "Bon jeu! 🎮"
}

# Exécution de l'installation
main "$@"

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

// Double Jump Enhanced Skill
const doubleJumpSkill = {
    name: "Double Jump Pro",
    description: "Triple saut avec rotation aérienne",
    maxJumps: 3,
    jumpRotation: 0.15,
    airControl: 0.8,
    unlockLevel: 2
};

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

// Wall Jump Skill
const wallJumpSkill = {
    name: "Wall Jump Master",
    description: "Saut murais et adhérence aux parois",
    wallSlideSpeed: 2,
    wallJumpForce: { x: 8, y: -10 },
    wallGrabDuration: 500,
    unlockLevel: 4
};

// Power-Up Collector Skill
const powerupSkill = {
    name: "Collectionneur de Power-Ups",
    description: "Magnétisme des pièces et bonus temporaires",
    coinMagnetRange: 80,
    powerupDuration: 5000,
    scoreMultiplier: 2,
    unlockLevel: 5
};

// Time Manipulation Skill
const timeSkill = {
    name: "Contrôle du Temps",
    description: "Ralentissement du temps et mode bullet-time",
    slowMotionFactor: 0.3,
    slowMotionDuration: 3000,
    energyCost: 20,
    unlockLevel: 7
};

// Shield Protection Skill
const shieldSkill = {
    name: "Bouclier Énergétique",
    description: "Protection contre les dégâts et les pièges",
    shieldHealth: 3,
    regenRate: 0.01,
    damageReduction: 0.5,
    unlockLevel: 6
};

// Super Speed Skill
const speedSkill = {
    name: "Vitesse Suprême",
    description: "Vitesse de déplacement augmentée et trail visuel",
    speedMultiplier: 2.5,
    trailEffect: true,
    energyDrain: 0.5,
    unlockLevel: 8
};

// Gravity Control Skill
const gravitySkill = {
    name: "Contrôle Gravitationnel",
    description: "Inversion de la gravité et flottaison",
    gravityReverse: true,
    floatDuration: 2000,
    gravityStrength: 0.3,
    unlockLevel: 9
};

// Combo Master Skill
const comboSkill = {
    name: "Maître des Combos",
    description: "Combos enchaînés et bonus multiplicateurs",
    comboTimeWindow: 2000,
    maxComboMultiplier: 5,
    comboResetOnHit: false,
    unlockLevel: 10
};

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

// Enregistrement des compétences
skillSystem.registerSkill('doubleJump', doubleJumpSkill);
skillSystem.registerSkill('dash', dashSkill);
skillSystem.registerSkill('wallJump', wallJumpSkill);
skillSystem.registerSkill('powerup', powerupSkill);
skillSystem.registerSkill('shield', shieldSkill);
skillSystem.registerSkill('time', timeSkill);
skillSystem.registerSkill('speed', speedSkill);
skillSystem.registerSkill('gravity', gravitySkill);
skillSystem.registerSkill('combo', comboSkill);
skillSystem.registerSkill('ultimate', ultimateSkill);

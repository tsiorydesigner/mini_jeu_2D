// Système de Magasin/Boutique pour Mod Runner
// Acheter des skins, effets de particules et vies avec les pièces collectées

class ShopManager {
    constructor() {
        this.coins = 2000;
        this.inventory = new Set();
        this.equipped = {
            skin: 'default',
            particle: 'default'
        };
        this.extraLives = 0;
        
        this.initShopItems();
        this.loadProgress();
    }

    // Initialisation des articles du magasin
    initShopItems() {
        this.items = new Map();
        
        // === SKINS DE PERSONNAGE ===
        this.items.set('skin_gold', {
            id: 'skin_gold',
            name: 'Skin Doré',
            description: 'Un personnage brillant en or pur',
            icon: '🟡',
            type: 'skin',
            price: 500,
            color: '#FFD700',
            rarity: 'rare'
        });
        
        this.items.set('skin_ninja', {
            id: 'skin_ninja',
            name: 'Skin Ninja',
            description: 'Tenue de ninja furtive',
            icon: '⚫',
            type: 'skin',
            price: 750,
            color: '#2C3E50',
            rarity: 'epic'
        });
        
        this.items.set('skin_rainbow', {
            id: 'skin_rainbow',
            name: 'Skin Arc-en-ciel',
            description: 'Change de couleur en permanence',
            icon: '🌈',
            type: 'skin',
            price: 1000,
            color: 'rainbow',
            rarity: 'legendary'
        });
        
        this.items.set('skin_cyber', {
            id: 'skin_cyber',
            name: 'Skin Cyberpunk',
            description: 'Style futuriste néon',
            icon: '💜',
            type: 'skin',
            price: 800,
            color: '#9D4EDD',
            rarity: 'epic'
        });
        
        this.items.set('skin_zombie', {
            id: 'skin_zombie',
            name: 'Skin Zombie',
            description: 'Un mort-vivant vert',
            icon: '🧟',
            type: 'skin',
            price: 600,
            color: '#7CB342',
            rarity: 'rare'
        });
        
        // === EFFETS DE PARTICULES ===
        this.items.set('particles_fire', {
            id: 'particles_fire',
            name: 'Particules Feu',
            description: 'Effet de feu flamboyant',
            icon: '🔥',
            type: 'particle',
            price: 400,
            colors: ['#FF4500', '#FF6347', '#FFD700'],
            rarity: 'rare'
        });
        
        this.items.set('particles_ice', {
            id: 'particles_ice',
            name: 'Particules Glace',
            description: 'Effet givré cristallin',
            icon: '❄️',
            type: 'particle',
            price: 400,
            colors: ['#00FFFF', '#87CEEB', '#E0FFFF'],
            rarity: 'rare'
        });
        
        this.items.set('particles_magic', {
            id: 'particles_magic',
            name: 'Particules Magie',
            description: 'Poussière d\'étoile magique',
            icon: '✨',
            type: 'particle',
            price: 600,
            colors: ['#FF69B4', '#DA70D6', '#EE82EE'],
            rarity: 'epic'
        });
        
        this.items.set('particles_bubbles', {
            id: 'particles_bubbles',
            name: 'Particules Bulles',
            description: 'Bulle sous-marines légères',
            icon: '🫧',
            type: 'particle',
            price: 350,
            colors: ['#87CEFA', '#ADD8E6', '#B0E0E6'],
            rarity: 'common'
        });
        
        this.items.set('particles_confetti', {
            id: 'particles_confetti',
            name: 'Particules Confetti',
            description: 'Effet festif coloré',
            icon: '🎊',
            type: 'particle',
            price: 450,
            colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
            rarity: 'rare'
        });
        
        // === VIES SUPPLÉMENTAIRES ===
        this.items.set('extra_life', {
            id: 'extra_life',
            name: 'Vie Supplémentaire',
            description: '+1 vie pour le prochain niveau',
            icon: '❤️',
            type: 'consumable',
            price: 200,
            effect: 'addLife',
            rarity: 'common'
        });
    }
    
    // Charger la progression depuis localStorage
    loadProgress() {
        const saved = localStorage.getItem('mod_runner_shop');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.coins = data.coins || 0;
                this.inventory = new Set(data.inventory || []);
                this.equipped = data.equipped || { skin: 'default', particle: 'default' };
                this.extraLives = data.extraLives || 0;
            } catch (e) {
                console.warn('Erreur chargement magasin:', e);
            }
        }
    }
    
    // Sauvegarder la progression
    saveProgress() {
        const data = {
            coins: this.coins,
            inventory: Array.from(this.inventory),
            equipped: this.equipped,
            extraLives: this.extraLives
        };
        localStorage.setItem('mod_runner_shop', JSON.stringify(data));
    }
    
    // Ajouter des pièces
    addCoins(amount) {
        this.coins += amount;
        this.saveProgress();
        return this.coins;
    }
    
    // Acheter un article
    buyItem(itemId) {
        const item = this.items.get(itemId);
        
        if (!item) {
            return { success: false, message: 'Article introuvable' };
        }
        
        if (this.inventory.has(itemId)) {
            return { success: false, message: 'Vous possédez déjà cet article' };
        }
        
        if (this.coins < item.price) {
            return { 
                success: false, 
                message: `Pas assez de pièces (${this.coins}/${item.price})` 
            };
        }
        
        // Déduire les pièces et ajouter à l'inventaire
        this.coins -= item.price;
        this.inventory.add(itemId);
        
        // Équiper automatiquement si c'est un skin ou des particules
        if (item.type === 'skin' || item.type === 'particle') {
            this.equipItem(itemId);
        }
        
        // Effet immédiat pour les consommables
        if (item.type === 'consumable' && item.effect === 'addLife') {
            this.extraLives++;
        }
        
        this.saveProgress();
        
        return { 
            success: true, 
            message: `${item.name} acheté !`,
            item: item
        };
    }
    
    // Équiper un article
    equipItem(itemId) {
        if (!this.inventory.has(itemId)) {
            return { success: false, message: 'Article non possédé' };
        }
        
        const item = this.items.get(itemId);
        if (!item) {
            return { success: false, message: 'Article introuvable' };
        }
        
        if (item.type === 'skin') {
            this.equipped.skin = itemId;
        } else if (item.type === 'particle') {
            this.equipped.particle = itemId;
        }
        
        this.saveProgress();
        return { success: true, message: `${item.name} équipé !` };
    }
    
    // Déséquiper (revenir à défaut)
    unequipType(type) {
        if (type === 'skin' || type === 'particle') {
            this.equipped[type] = 'default';
            this.saveProgress();
        }
    }
    
    // Utiliser une vie supplémentaire
    useExtraLife() {
        if (this.extraLives > 0) {
            this.extraLives--;
            this.saveProgress();
            return true;
        }
        return false;
    }
    
    // Obtenir les informations d'un article équipé
    getEquippedSkin() {
        if (this.equipped.skin === 'default') {
            return { color: '#5DADE2', isRainbow: false }; // Couleur par défaut bleue
        }
        const skin = this.items.get(this.equipped.skin);
        return {
            color: skin?.color || '#5DADE2',
            isRainbow: skin?.color === 'rainbow'
        };
    }
    
    getEquippedParticles() {
        if (this.equipped.particle === 'default') {
            return { colors: ['#FFD700'], isDefault: true };
        }
        const particle = this.items.get(this.equipped.particle);
        return {
            colors: particle?.colors || ['#FFD700'],
            isDefault: false
        };
    }
    
    // Obtenir tous les articles par catégorie
    getItemsByCategory(category) {
        const items = [];
        for (const [id, item] of this.items) {
            if (item.type === category) {
                items.push({
                    ...item,
                    owned: this.inventory.has(id),
                    equipped: this.equipped[category] === id
                });
            }
        }
        return items;
    }
    
    // Obtenir le solde de pièces
    getBalance() {
        return this.coins;
    }
    
    // Obtenir le nombre de vies supplémentaires
    getExtraLives() {
        return this.extraLives;
    }
    
    // Vérifier si un article est possédé
    owns(itemId) {
        return this.inventory.has(itemId);
    }
    
    // Réinitialiser le magasin (pour debug)
    reset() {
        this.coins = 0;
        this.inventory.clear();
        this.equipped = { skin: 'default', particle: 'default' };
        this.extraLives = 0;
        this.saveProgress();
    }
}

// Instance globale
const shopManager = new ShopManager();

// Fonction utilitaire pour obtenir la couleur arc-en-ciel
function getRainbowColor(time) {
    const hue = (time * 0.1) % 360;
    return `hsl(${hue}, 100%, 50%)`;
}

// Interface utilisateur pour le Magasin/Boutique

class ShopUI {
    constructor() {
        this.shopPanel = document.getElementById('shopPanel');
        this.shopBtn = document.getElementById('shopBtn');
        this.closeShopBtn = document.getElementById('closeShopBtn');
        this.shopGrid = document.getElementById('shopGrid');
        this.walletAmount = document.getElementById('walletAmount');
        this.extraLivesDisplay = document.getElementById('extraLivesDisplay');
        this.currentCategory = 'skin';
        
        this.tabs = {
            skin: document.getElementById('tabSkins'),
            particle: document.getElementById('tabParticles'),
            consumable: document.getElementById('tabConsumables')
        };
        
        if (this.shopBtn) this.initEventListeners();
    }

    initEventListeners() {
        // Bouton pour ouvrir le magasin
        if (this.shopBtn) this.shopBtn.addEventListener('click', () => {
            this.showShopPanel();
        });

        // Bouton pour fermer
        if (this.closeShopBtn) this.closeShopBtn.addEventListener('click', () => {
            this.hideShopPanel();
        });

        // Onglets
        if (this.tabs.skin) this.tabs.skin.addEventListener('click', () => this.switchCategory('skin'));
        if (this.tabs.particle) this.tabs.particle.addEventListener('click', () => this.switchCategory('particle'));
        if (this.tabs.consumable) this.tabs.consumable.addEventListener('click', () => this.switchCategory('consumable'));

        // Touche M pour ouvrir/fermer le magasin (seulement hors jeu)
        document.addEventListener('keydown', (e) => {
            if ((e.key === 'm' || e.key === 'M') && typeof gameState !== 'undefined' && gameState !== 1) {
                if (this.shopPanel && this.shopPanel.classList.contains('hidden')) {
                    this.showShopPanel();
                } else if (this.shopPanel) {
                    this.hideShopPanel();
                }
            }
        });
    }

    showShopPanel() {
        if (!this.shopPanel) return;
        this.shopPanel.classList.remove('hidden');
        this.updateWallet();
        this.updateExtraLives();
        this.renderItems();
    }

    hideShopPanel() {
        if (!this.shopPanel) return;
        this.shopPanel.classList.add('hidden');
    }

    switchCategory(category) {
        this.currentCategory = category;
        
        // Mettre à jour les onglets actifs
        Object.keys(this.tabs).forEach(key => {
            if (this.tabs[key]) this.tabs[key].classList.toggle('active', key === category);
        });
        
        this.renderItems();
    }

    updateWallet() {
        this.walletAmount.textContent = shopManager.getBalance();
    }

    updateExtraLives() {
        if (this.extraLivesDisplay) {
            this.extraLivesDisplay.textContent = shopManager.getExtraLives();
        }
    }

    renderItems() {
        const items = shopManager.getItemsByCategory(this.currentCategory);
        this.shopGrid.innerHTML = '';
        
        items.forEach(item => {
            const card = this.createItemCard(item);
            this.shopGrid.appendChild(card);
        });
    }

    createItemCard(item) {
        const card = document.createElement('div');
        card.className = `shop-item ${item.owned ? 'owned' : ''} ${item.equipped ? 'equipped' : ''}`;
        
        // Badge de rareté
        const rarityClass = `rarity-${item.rarity}`;
        
        // Icon avec animation rainbow si c'est le skin rainbow
        const iconClass = item.color === 'rainbow' ? 'rainbow' : '';
        
        // Déterminer le bouton d'action
        let actionButton = '';
        if (item.owned) {
            if (item.type === 'consumable') {
                actionButton = `<button class="shop-btn shop-btn-equipped" disabled>✓ Possédé</button>`;
            } else if (item.equipped) {
                actionButton = `<button class="shop-btn shop-btn-equipped" disabled>✓ Équipé</button>`;
            } else {
                actionButton = `<button class="shop-btn shop-btn-equip" data-item="${item.id}">Équiper</button>`;
            }
        } else {
            const canAfford = shopManager.getBalance() >= item.price;
            actionButton = `<button class="shop-btn shop-btn-buy ${!canAfford ? 'disabled' : ''}" data-item="${item.id}" ${!canAfford ? 'disabled' : ''}>Acheter</button>`;
        }
        
        // Afficher le prix uniquement si pas possédé
        const priceDisplay = item.owned ? '' : `<div class="price">${item.price}</div>`;
        
        card.innerHTML = `
            <span class="rarity-badge ${rarityClass}">${item.rarity}</span>
            <span class="icon ${iconClass}">${item.icon}</span>
            <div class="name">${item.name}</div>
            <div class="description">${item.description}</div>
            ${priceDisplay}
            <div class="shop-item-actions">
                ${actionButton}
            </div>
        `;
        
        // Ajouter les event listeners
        const buyBtn = card.querySelector('.shop-btn-buy');
        if (buyBtn) {
            buyBtn.addEventListener('click', () => this.buyItem(item.id));
        }
        
        const equipBtn = card.querySelector('.shop-btn-equip');
        if (equipBtn) {
            equipBtn.addEventListener('click', () => this.equipItem(item.id));
        }
        
        return card;
    }

    buyItem(itemId) {
        const result = shopManager.buyItem(itemId);
        
        if (result.success) {
            this.showNotification('✅', result.message);
            this.updateWallet();
            this.updateExtraLives();
            this.renderItems();
        } else {
            this.showNotification('❌', result.message, true);
        }
    }

    equipItem(itemId) {
        const result = shopManager.equipItem(itemId);
        
        if (result.success) {
            this.showNotification('✅', result.message);
            this.renderItems();
        }
    }

    showNotification(icon, message, isError = false) {
        const notification = document.createElement('div');
        notification.className = `shop-notification ${isError ? 'error' : ''}`;
        notification.innerHTML = `
            <span class="shop-notification-icon">${icon}</span>
            <span class="shop-notification-text">${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Animation d'entrée
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Suppression après 3 secondes
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
}

// Initialiser l'interface du magasin
document.addEventListener('DOMContentLoaded', () => {
    window.shopUI = new ShopUI();
});

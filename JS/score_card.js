// Score Card Generator - Génère une image de carte de score partageable
// Utilise html2canvas pour la capture et qrcode.js pour le QR code

(function() {
    'use strict';

    window.scoreCardGenerator = {
        _qrCodeUrl: null,
        _imageDataUrl: null,

        init: function() {
            this._loadExternalLibraries();
        },

        _loadExternalLibraries: function() {
            if (typeof html2canvas === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                script.onload = () => this._checkQRCodeLib();
                document.head.appendChild(script);
            } else {
                this._checkQRCodeLib();
            }
        },

        _checkQRCodeLib: function() {
            if (typeof QRCode === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
                script.onload = () => console.log('QR code library loaded');
                document.head.appendChild(script);
            }
        },

        generateCard: async function(score, level, theme) {
            const cardContainer = document.createElement('div');
            cardContainer.id = 'scoreCardTemp';
            cardContainer.style.cssText = `
                position: fixed;
                left: -9999px;
                top: 0;
                width: 600px;
                height: 800px;
                background: linear-gradient(135deg, ${this._getThemeColor(theme, 'top')} 0%, ${this._getThemeColor(theme, 'bottom')} 100%);
                font-family: 'Segoe UI', Arial, sans-serif;
                padding: 40px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            `;

            const themeName = themes[level - 1]?.name || 'Inconnu';

            cardContainer.innerHTML = `
                <div style="
                    background: rgba(0,0,0,0.3);
                    border-radius: 20px;
                    padding: 40px;
                    width: 100%;
                    text-align: center;
                    border: 3px solid rgba(255,255,255,0.5);
                ">
                    <h1 style="
                        color: #fff;
                        font-size: 48px;
                        margin: 0 0 20px 0;
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                        font-weight: 800;
                    ">MOD RUNNER</h1>
                    
                    <div style="
                        background: rgba(255,255,255,0.95);
                        border-radius: 15px;
                        padding: 30px;
                        margin: 20px 0;
                    ">
                        <div style="font-size: 24px; color: #666; margin-bottom: 10px;">NIVEAU ${level}</div>
                        <div style="font-size: 20px; color: #888; margin-bottom: 15px;">${themeName}</div>
                        <div style="
                            font-size: 72px;
                            font-weight: bold;
                            color: #2c3e50;
                            margin: 20px 0;
                            text-shadow: 2px 2px 0px rgba(0,0,0,0.1);
                        ">${score.toLocaleString()}</div>
                        <div style="font-size: 24px; color: #f39c12; font-weight: 600;">POINTS</div>
                    </div>

                    <div style="
                        display: flex;
                        justify-content: center;
                        gap: 20px;
                        margin-top: 20px;
                    ">
                        <div style="
                            background: rgba(255,255,255,0.9);
                            border-radius: 10px;
                            padding: 15px 25px;
                        ">
                            <div style="font-size: 14px; color: #888;">PERSONNAGE</div>
                            <div style="font-size: 18px; color: #333; font-weight: 600; text-transform: capitalize;">${selectedCharacter}</div>
                        </div>
                        <div style="
                            background: rgba(255,255,255,0.9);
                            border-radius: 10px;
                            padding: 15px 25px;
                        ">
                            <div style="font-size: 14px; color: #888;">DIFFICULTÉ</div>
                            <div style="font-size: 18px; color: #333; font-weight: 600; text-transform: capitalize;">${difficulty}</div>
                        </div>
                    </div>

                    <div id="qrcode-container" style="
                        margin-top: 30px;
                        display: flex;
                        justify-content: center;
                    "></div>

                    <div style="
                        margin-top: 20px;
                        color: rgba(255,255,255,0.8);
                        font-size: 14px;
                    ">Joue à Mod Runner et bats mon score!</div>
                </div>
            `;

            document.body.appendChild(cardContainer);

            await this._generateQRCode(cardContainer);
            
            try {
                const canvas = await html2canvas(cardContainer, {
                    scale: 2,
                    backgroundColor: null,
                    useCORS: true
                });
                this._imageDataUrl = canvas.toDataURL('image/png');
            } catch (e) {
                console.error('Error generating score card:', e);
            }

            document.body.removeChild(cardContainer);
            return this._imageDataUrl;
        },

        _getThemeColor: function(themeIndex, type) {
            const defaultColors = {
                top: '#3498db',
                bottom: '#2980b9'
            };
            if (!themeIndex || !themes[themeIndex - 1]) return defaultColors[type];
            const theme = themes[themeIndex - 1];
            return type === 'top' ? theme.skyTop : theme.skyBottom;
        },

        _generateQRCode: function(container) {
            return new Promise((resolve) => {
                const qrContainer = container.querySelector('#qrcode-container');
                if (!qrContainer || typeof QRCode === 'undefined') {
                    resolve();
                    return;
                }
                
                const gameUrl = window.location.href.split('?')[0];
                qrContainer.innerHTML = '';
                
                try {
                    new QRCode(qrContainer, {
                        text: gameUrl,
                        width: 128,
                        height: 128,
                        colorDark: '#000000',
                        colorLight: '#ffffff',
                        correctLevel: QRCode.CorrectLevel.H
                    });
                } catch (e) {
                    console.warn('QR Code generation failed:', e);
                }
                
                setTimeout(resolve, 100);
            });
        },

        shareToTwitter: async function() {
            if (!this._imageDataUrl) {
                await this.generateCard(score, currentLevel, currentTheme);
            }
            
            const text = `J'ai scored ${score.toLocaleString()} points dans Mod Runner - Niveau ${currentLevel}! 🎮`;
            const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
            
            window.open(url, '_blank', 'width=550,height=420');
        },

        shareToDiscord: async function() {
            if (!this._imageDataUrl) {
                await this.generateCard(score, currentLevel, currentTheme);
            }
            
            const text = `J'ai scored ${score.toLocaleString()} points dans Mod Runner - Niveau ${currentLevel}! 🎮`;
            
            const discordUrl = `https://discord.com/channels/@me`;
            
            if (navigator.clipboard && navigator.clipboard.writeText) {
                try {
                    await navigator.clipboard.writeText(`${text}\n\nJeu: ${window.location.href}`);
                    this._showNotification('Score copié! Colle-le dans Discord');
                } catch (e) {
                    this._copyToClipboardFallback(text);
                }
            } else {
                this._copyToClipboardFallback(text);
            }
        },

        _copyToClipboardFallback: function(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                this._showNotification('Score copié! Colle-le dans Discord');
            } catch (e) {
                this._showNotification('Impossible de copier');
            }
            document.body.removeChild(textarea);
        },

        _showNotification: function(message) {
            const existing = document.querySelector('.share-notification');
            if (existing) existing.remove();
            
            const notif = document.createElement('div');
            notif.className = 'share-notification';
            notif.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: #2ecc71;
                color: white;
                padding: 15px 30px;
                border-radius: 10px;
                font-size: 16px;
                font-weight: 600;
                z-index: 10000;
                animation: slideUp 0.3s ease-out;
            `;
            notif.textContent = message;
            document.body.appendChild(notif);
            
            setTimeout(() => notif.remove(), 3000);
        },

        downloadCard: async function() {
            if (!this._imageDataUrl) {
                await this.generateCard(score, currentLevel, currentTheme);
            }
            
            const link = document.createElement('a');
            link.download = `mod-runner-score-${Date.now()}.png`;
            link.href = this._imageDataUrl;
            link.click();
        },

        showShareModal: async function() {
            await this.generateCard(score, currentLevel, currentTheme);
            
            const modal = document.createElement('div');
            modal.id = 'shareModal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            `;
            
            modal.innerHTML = `
                <div style="
                    background: white;
                    border-radius: 20px;
                    padding: 30px;
                    max-width: 90%;
                    max-height: 90%;
                    overflow: auto;
                    text-align: center;
                ">
                    <h2 style="margin: 0 0 20px 0; color: #2c3e50;">Partage ton Score!</h2>
                    
                    <img src="${this._imageDataUrl}" style="
                        max-width: 100%;
                        height: auto;
                        border-radius: 10px;
                        margin-bottom: 20px;
                    " />
                    
                    <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                        <button id="shareTwitter" style="
                            background: #1da1f2;
                            color: white;
                            border: none;
                            padding: 15px 25px;
                            border-radius: 10px;
                            font-size: 16px;
                            font-weight: 600;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        ">🐦 Twitter</button>
                        
                        <button id="shareDiscord" style="
                            background: #5865f2;
                            color: white;
                            border: none;
                            padding: 15px 25px;
                            border-radius: 10px;
                            font-size: 16px;
                            font-weight: 600;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        ">💬 Discord</button>
                        
                        <button id="downloadCard" style="
                            background: #27ae60;
                            color: white;
                            border: none;
                            padding: 15px 25px;
                            border-radius: 10px;
                            font-size: 16px;
                            font-weight: 600;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        ">💾 Télécharger</button>
                    </div>
                    
                    <button id="closeShareModal" style="
                        margin-top: 20px;
                        background: transparent;
                        border: 2px solid #ccc;
                        padding: 10px 30px;
                        border-radius: 10px;
                        font-size: 14px;
                        cursor: pointer;
                    ">Fermer</button>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.querySelector('#shareTwitter').onclick = () => this.shareToTwitter();
            modal.querySelector('#shareDiscord').onclick = () => this.shareToDiscord();
            modal.querySelector('#downloadCard').onclick = () => this.downloadCard();
            modal.querySelector('#closeShareModal').onclick = () => modal.remove();
            
            modal.onclick = (e) => {
                if (e.target === modal) modal.remove();
            };
        }
    };

    window.scoreCardGenerator.init();
})();

// Interface utilisateur pour le système de Sons Ambiants

class AudioUI {
    constructor() {
        this.audioPanel = document.getElementById('audioPanel');
        this.audioBtn = document.getElementById('audioBtn');
        this.closeAudioBtn = document.getElementById('closeAudioBtn');
        this.muteBtn = document.getElementById('muteAudioBtn');
        this.volumeSlider = document.getElementById('volumeSlider');
        
        this.ambientName = document.getElementById('ambientName');
        this.intensityName = document.getElementById('intensityName');
        this.volumeValue = document.getElementById('volumeValue');
        this.musicStyleName = document.getElementById('musicStyleName');
        
        this.initEventListeners();
    }

    initEventListeners() {
        // Bouton pour ouvrir le panneau audio
        this.audioBtn.addEventListener('click', () => {
            this.showAudioPanel();
        });

        // Bouton pour fermer
        this.closeAudioBtn.addEventListener('click', () => {
            this.hideAudioPanel();
        });

        // Bouton mute
        this.muteBtn.addEventListener('click', () => {
            const isMuted = audioManager.toggleMute();
            this.muteBtn.textContent = isMuted ? '🔇 Activé' : '🔊 Muet';
            this.muteBtn.classList.toggle('muted', isMuted);
        });

        // Slider de volume
        this.volumeSlider.addEventListener('input', (e) => {
            const value = e.target.value / 100;
            audioManager.setVolume(value);
            this.volumeValue.textContent = Math.round(value * 100) + '%';
        });

        // Sélecteur de style musical
        document.querySelectorAll('.music-style-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const style = btn.dataset.style;
                document.querySelectorAll('.music-style-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                audioManager.setMusicStyle(style);
                this.updateStatus();
            });
        });

        // Touche V pour ouvrir/fermer le panneau audio
        document.addEventListener('keydown', (e) => {
            if (e.key === 'v' || e.key === 'V') {
                if (this.audioPanel.classList.contains('hidden')) {
                    this.showAudioPanel();
                } else {
                    this.hideAudioPanel();
                }
            }
        });
    }

    showAudioPanel() {
        this.audioPanel.classList.remove('hidden');
        this.updateStatus();
        
        // Synchroniser avec le volume actuel
        this.volumeSlider.value = Math.round(audioManager.globalVolume * 100);
        this.volumeValue.textContent = Math.round(audioManager.globalVolume * 100) + '%';
        
        // Synchroniser le bouton mute
        if (audioManager.isMuted) {
            this.muteBtn.textContent = '🔇 Activé';
            this.muteBtn.classList.add('muted');
        } else {
            this.muteBtn.textContent = '🔊 Muet';
            this.muteBtn.classList.remove('muted');
        }

        // Synchroniser le style musical actif
        document.querySelectorAll('.music-style-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.style === audioManager.musicStyle);
        });
    }

    hideAudioPanel() {
        this.audioPanel.classList.add('hidden');
    }

    updateStatus() {
        if (this.ambientName) {
            this.ambientName.textContent = audioManager.getCurrentAmbientName();
        }
        if (this.intensityName) {
            this.intensityName.textContent = audioManager.getIntensityName();
        }
        if (this.musicStyleName) {
            this.musicStyleName.textContent = audioManager.getMusicStyleName();
        }
    }
}

// Initialiser l'interface audio
document.addEventListener('DOMContentLoaded', () => {
    window.audioUI = new AudioUI();
});

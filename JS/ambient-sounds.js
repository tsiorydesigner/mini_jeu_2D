// Système de Sons Ambiants pour Mod Runner
// Bruitages environnementaux par thème (vent, lave, etc.)
// Variations musicales selon l'intensité

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.ambientGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        
        this.currentAmbient = null;
        this.currentMusic = null;
        this.intensityLevel = 'normal'; // 'calm', 'normal', 'intense', 'boss'
        this.musicStyle = 'default'; // 'default', 'orbia'
        
        this.isMuted = false;
        this.globalVolume = 0.7;
        
        this.ambientOscillators = [];
        this.musicOscillators = [];
        this.orbiaIntervals = [];
        
        // Configuration des sons par thème
        this.themeSounds = {
            forest: {
                ambient: 'wind_leaves',
                baseFreq: [200, 300],
                modulation: 0.5,
                description: 'Vent dans les feuilles'
            },
            cave: {
                ambient: 'deep_rumble',
                baseFreq: [80, 150],
                modulation: 0.2,
                description: 'Grottes profondes'
            },
            lava: {
                ambient: 'fire_crackle',
                baseFreq: [100, 200],
                modulation: 0.8,
                description: 'Feu et magma'
            },
            ice: {
                ambient: 'cold_wind',
                baseFreq: [300, 500],
                modulation: 0.3,
                description: 'Vent glacial'
            },
            city: {
                ambient: 'urban_hum',
                baseFreq: [150, 250],
                modulation: 0.6,
                description: 'Rumeur urbaine'
            },
            space: {
                ambient: 'space_drone',
                baseFreq: [50, 100],
                modulation: 0.1,
                description: 'Espace profond'
            },
            desert: {
                ambient: 'desert_wind',
                baseFreq: [180, 220],
                modulation: 0.4,
                description: 'Vent sec et chaud'
            },
            jungle: {
                ambient: 'jungle_birds',
                baseFreq: [250, 350],
                modulation: 0.7,
                description: 'Échos de la jungle'
            },
            ruins: {
                ambient: 'echoing_stones',
                baseFreq: [120, 180],
                modulation: 0.15,
                description: 'Ruines anciennes'
            },
            neon: {
                ambient: 'electric_hum',
                baseFreq: [60, 120],
                modulation: 0.9,
                description: 'Énergie néon'
            },
            night: {
                ambient: 'crickets',
                baseFreq: [400, 600],
                modulation: 0.05,
                description: 'Calme nocturne'
            },
            steam: {
                ambient: 'industrial_hiss',
                baseFreq: [100, 300],
                modulation: 0.6,
                description: 'Vapeur et pistons'
            }
        };
        
        this.initAudio();
    }
    
    // Initialiser le contexte audio
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Créer les nœuds de gain pour le mixage
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.globalVolume;
            this.masterGain.connect(this.audioContext.destination);
            
            this.ambientGain = this.audioContext.createGain();
            this.ambientGain.gain.value = 0.3;
            this.ambientGain.connect(this.masterGain);
            
            this.musicGain = this.audioContext.createGain();
            this.musicGain.gain.value = 0.4;
            this.musicGain.connect(this.masterGain);
            
            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.gain.value = 0.5;
            this.sfxGain.connect(this.masterGain);
            
            // Compressor pour éviter la distorsion
            const compressor = this.audioContext.createDynamicsCompressor();
            compressor.threshold.value = -24;
            compressor.knee.value = 30;
            compressor.ratio.value = 12;
            compressor.attack.value = 0.003;
            compressor.release.value = 0.25;
            
            this.masterGain.disconnect();
            this.masterGain.connect(compressor);
            compressor.connect(this.audioContext.destination);
            
        } catch (e) {
            console.warn('Web Audio API non supportée:', e);
        }
    }
    
    // Résumé du contexte audio (nécessaire après interaction utilisateur)
    resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    // Démarrer les sons ambients pour un thème
    startAmbient(themeName) {
        this.resumeContext();
        this.stopAmbient();
        
        const theme = this.themeSounds[themeName];
        if (!theme || !this.audioContext) return;
        
        this.currentAmbient = themeName;
        
        // Créer des oscillateurs pour l'ambiance
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Configurer les fréquences de base
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.value = theme.baseFreq[0];
        osc2.frequency.value = theme.baseFreq[1];
        
        // Ajouter de la modulation pour un effet organique
        const lfo = this.audioContext.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = theme.modulation;
        
        const lfoGain = this.audioContext.createGain();
        lfoGain.gain.value = 20;
        
        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfoGain.connect(osc2.frequency);
        
        // Connecter au gain d'ambiance
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(this.ambientGain);
        
        // Enveloppe douce
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 2);
        
        // Démarrer
        osc1.start();
        osc2.start();
        lfo.start();
        
        this.ambientOscillators = [osc1, osc2, lfo, gainNode];
    }
    
    // Arrêter les sons ambients
    stopAmbient() {
        if (this.ambientOscillators.length === 0) return;
        
        const now = this.audioContext ? this.audioContext.currentTime : 0;
        
        this.ambientOscillators.forEach(node => {
            if (node.gain) {
                // C'est un gain node, faire un fade out
                try {
                    node.gain.linearRampToValueAtTime(0, now + 1);
                    setTimeout(() => {
                        try { node.disconnect(); } catch(e) {}
                    }, 1000);
                } catch(e) {}
            } else if (node.stop) {
                // C'est un oscillator
                try {
                    node.stop(now + 1);
                    setTimeout(() => {
                        try { node.disconnect(); } catch(e) {}
                    }, 1100);
                } catch(e) {}
            }
        });
        
        this.ambientOscillators = [];
        this.currentAmbient = null;
    }
    
    // Mettre à jour l'intensité musicale
    setIntensity(level) {
        if (this.intensityLevel === level) return;
        this.intensityLevel = level;
        
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        // Ajuster le gain musical selon l'intensité
        const gains = {
            calm: 0.2,
            normal: 0.4,
            intense: 0.6,
            boss: 0.8
        };
        
        this.musicGain.gain.linearRampToValueAtTime(gains[level] || 0.4, now + 0.5);
        
        // Ajuster la fréquence de modulation des oscillateurs
        this.musicOscillators.forEach(osc => {
            if (osc.frequency && osc.type !== 'sine') {
                const baseFreq = osc.baseFrequency || 440;
                const multipliers = {
                    calm: 0.8,
                    normal: 1.0,
                    intense: 1.3,
                    boss: 1.6
                };
                osc.frequency.linearRampToValueAtTime(baseFreq * (multipliers[level] || 1), now + 0.5);
            }
        });
    }
    
    // Démarrer la musique de fond (style par défaut)
    startMusic() {
        if (this.musicStyle === 'orbia') {
            this.startOrbiaMusic();
        } else {
            this.startBackgroundMusic();
        }
    }

    startBackgroundMusic() {
        this.resumeContext();
        if (!this.audioContext || this.musicOscillators.length > 0) return;
        
        // Créer une progression d'accords simple
        const chords = [
            [261.63, 329.63, 392.00], // Do majeur
            [293.66, 349.23, 440.00], // Ré mineur
            [329.63, 392.00, 493.88], // Mi mineur
            [349.23, 440.00, 523.25]  // Fa majeur
        ];
        
        const chordIndex = Math.floor(Date.now() / 4000) % chords.length;
        const currentChord = chords[chordIndex];
        
        currentChord.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = i === 0 ? 'sine' : 'triangle';
            osc.frequency.value = freq;
            osc.baseFrequency = freq; // Sauvegarder pour les variations d'intensité
            
            gain.gain.value = 0.05;
            
            osc.connect(gain);
            gain.connect(this.musicGain);
            
            osc.start();
            
            this.musicOscillators.push(osc, gain);
        });
    }
    
    // Arrêter la musique
    stopMusic() {
        this.musicOscillators.forEach(node => {
            try {
                if (node.stop) node.stop();
                node.disconnect();
            } catch(e) {}
        });
        this.musicOscillators = [];
        this.stopOrbiaMusic();
    }

    // --- Style Orbia: musique atmosphérique relaxante ---
    startOrbiaMusic() {
        this.resumeContext();
        if (!this.audioContext) return;
        this.stopOrbiaMusic();

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Accords Orbia: progressions douces et atmosphériques
        const orbiaChords = [
            [261.63, 329.63, 392.00, 523.25],  // Cmaj7
            [293.66, 349.23, 440.00, 523.25],  // Dm7
            [246.94, 311.13, 369.99, 466.16],  // Bbmaj7
            [220.00, 277.18, 329.63, 440.00],  // Am7
            [261.63, 311.13, 392.00, 466.16],  // Cm7
            [246.94, 293.66, 369.99, 440.00],  // Bm7b5
        ];

        // Notes pentatoniques pour la mélodie flottante
        const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66];

        // Pad d'accords avec attaque lente
        const padGain = ctx.createGain();
        padGain.gain.value = 0;
        padGain.connect(this.musicGain);

        const padFilter = ctx.createBiquadFilter();
        padFilter.type = 'lowpass';
        padFilter.frequency.value = 800;
        padFilter.Q.value = 1;
        padFilter.connect(padGain);

        // LFO sur le filtre pour effet de respiration
        const filterLfo = ctx.createOscillator();
        const filterLfoGain = ctx.createGain();
        filterLfo.type = 'sine';
        filterLfo.frequency.value = 0.08;
        filterLfoGain.gain.value = 300;
        filterLfo.connect(filterLfoGain);
        filterLfoGain.connect(padFilter.frequency);
        filterLfo.start(now);

        // Fade in du pad
        padGain.gain.setValueAtTime(0, now);
        padGain.gain.linearRampToValueAtTime(0.06, now + 4);

        this.musicOscillators.push(padGain, padFilter, filterLfo, filterLfoGain);

        // Jouer les accords en boucle avec crossfade
        let chordIndex = 0;
        const playChord = () => {
            if (this.musicStyle !== 'orbia' || !this.audioContext) return;
            const ctx2 = this.audioContext;
            const t = ctx2.currentTime;
            const chord = orbiaChords[chordIndex % orbiaChords.length];

            chord.forEach((freq, i) => {
                const osc = ctx2.createOscillator();
                const g = ctx2.createGain();
                osc.type = i % 2 === 0 ? 'sine' : 'triangle';
                osc.frequency.value = freq;

                // Léger désaccordage pour richesse
                osc.detune.value = (Math.random() - 0.5) * 8;

                g.gain.setValueAtTime(0, t);
                g.gain.linearRampToValueAtTime(0.035, t + 2.5);
                g.gain.linearRampToValueAtTime(0.035, t + 5.5);
                g.gain.linearRampToValueAtTime(0, t + 8);

                osc.connect(padFilter);
                osc.connect(g);
                g.connect(this.musicGain);

                osc.start(t);
                osc.stop(t + 8.5);
                this.musicOscillators.push(osc, g);
            });

            chordIndex++;
        };

        // Jouer un accord toutes les 8 secondes
        playChord();
        const chordInterval = setInterval(playChord, 8000);
        this.orbiaIntervals.push(chordInterval);

        // Mélodie flottante: notes aléatoires de la pentatonique
        const playMelodyNote = () => {
            if (this.musicStyle !== 'orbia' || !this.audioContext) return;
            const ctx2 = this.audioContext;
            const t = ctx2.currentTime;
            const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];
            const octShift = Math.random() > 0.5 ? 1 : 0.5;
            const finalFreq = freq * octShift;

            const osc = ctx2.createOscillator();
            const g = ctx2.createGain();
            const noteFilter = ctx2.createBiquadFilter();

            osc.type = 'sine';
            osc.frequency.value = finalFreq;

            // Vibrato doux
            const vibLfo = ctx2.createOscillator();
            const vibGain = ctx2.createGain();
            vibLfo.type = 'sine';
            vibLfo.frequency.value = 4 + Math.random() * 2;
            vibGain.gain.value = 3;
            vibLfo.connect(vibGain);
            vibGain.connect(osc.frequency);

            noteFilter.type = 'lowpass';
            noteFilter.frequency.value = 1200;
            noteFilter.Q.value = 0.5;

            const noteLen = 2 + Math.random() * 3;
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.04, t + 0.8);
            g.gain.linearRampToValueAtTime(0.025, t + noteLen * 0.7);
            g.gain.linearRampToValueAtTime(0, t + noteLen);

            osc.connect(noteFilter);
            noteFilter.connect(g);
            g.connect(this.musicGain);

            osc.start(t);
            osc.stop(t + noteLen + 0.1);
            vibLfo.start(t);
            vibLfo.stop(t + noteLen + 0.1);

            this.musicOscillators.push(osc, g, noteFilter, vibLfo, vibGain);
        };

        // Notes de mélodie espacées aléatoirement (2-4 secondes)
        const scheduleMelody = () => {
            if (this.musicStyle !== 'orbia') return;
            playMelodyNote();
            const delay = 2000 + Math.random() * 2000;
            const melInterval = setTimeout(scheduleMelody, delay);
            this.orbiaIntervals.push(melInterval);
        };
        setTimeout(scheduleMelody, 1000);

        // Drone de basse subtile
        const bassDrone = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassDrone.type = 'sine';
        bassDrone.frequency.value = 65.41; // C2
        bassGain.gain.setValueAtTime(0, now);
        bassGain.gain.linearRampToValueAtTime(0.025, now + 5);
        bassDrone.connect(bassGain);
        bassGain.connect(this.musicGain);
        bassDrone.start(now);
        this.musicOscillators.push(bassDrone, bassGain);
    }

    stopOrbiaMusic() {
        this.orbiaIntervals.forEach(id => {
            clearInterval(id);
            clearTimeout(id);
        });
        this.orbiaIntervals = [];
    }

    // Changer le style de musique
    setMusicStyle(style) {
        if (this.musicStyle === style) return;
        this.musicStyle = style;
        this.stopMusic();
        if (style === 'orbia') {
            this.startOrbiaMusic();
        } else {
            this.startBackgroundMusic();
        }
    }

    getMusicStyleName() {
        const names = {
            default: 'Classique',
            orbia: 'Orbia'
        };
        return names[this.musicStyle] || 'Classique';
    }

    // Jouer un effet sonore
    playSfx(type) {
        this.resumeContext();
        if (!this.audioContext) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        const now = this.audioContext.currentTime;
        
        switch(type) {
            case 'jump':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                break;
            case 'coin':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                break;
            case 'damage':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                break;
            case 'powerup':
                osc.type = 'square';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                break;
        }
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start(now);
        osc.stop(now + 0.5);
    }
    
    // Définir le volume global
    setVolume(value) {
        this.globalVolume = Math.max(0, Math.min(1, value));
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(this.globalVolume, this.audioContext.currentTime);
        }
    }
    
    // Muter/Démuter
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            const targetGain = this.isMuted ? 0 : this.globalVolume;
            this.masterGain.gain.setValueAtTime(targetGain, this.audioContext.currentTime);
        }
        return this.isMuted;
    }
    
    // Obtenir le nom du thème actuel
    getCurrentAmbientName() {
        if (!this.currentAmbient) return 'Aucun';
        return this.themeSounds[this.currentAmbient]?.description || this.currentAmbient;
    }
    
    // Obtenir l'intensité actuelle
    getIntensityName() {
        const names = {
            calm: 'Calme',
            normal: 'Normal',
            intense: 'Intense',
            boss: 'Boss'
        };
        return names[this.intensityLevel] || 'Normal';
    }
}

// Instance globale
const audioManager = new AudioManager();

/**
 * InputManager - Gère le Clavier, la Manette et le Tactile
 * Supporte le remappage des touches et la persistance locale.
 */
class InputManager {
    constructor() {
        // État actuel des touches (utilisé par la boucle de jeu)
        this.keys = {
            left: false,
            right: false,
            jump: false,
            dash: false,
            pause: false
        };

        // Bindings par défaut
        this.bindings = {
            left: 'ArrowLeft',
            right: 'ArrowRight',
            jump: ' ',
            dash: 'Shift',
            pause: 'p'
        };

        this.remappingAction = null;
        this.loadSettings();
        this.initKeyboard();
        this.initTouch();
        this.initUI();
        this.updateRebindButtons();
    }

    loadSettings() {
        const saved = localStorage.getItem('mod_runner_controls_v1');
        if (saved) {
            try {
                this.bindings = { ...this.bindings, ...JSON.parse(saved) };
            } catch (e) { console.error("Erreur chargement contrôles", e); }
        }
    }

    saveSettings() {
        localStorage.setItem('mod_runner_controls_v1', JSON.stringify(this.bindings));
    }

    initKeyboard() {
        window.addEventListener('keydown', (e) => {
            // Logique de remappage
            if (this.remappingAction) {
                this.bindings[this.remappingAction] = e.key;
                this.remappingAction = null;
                this.saveSettings();
                this.updateRebindButtons();
                e.preventDefault();
                return;
            }

            // Entrée normale
            for (const [action, key] of Object.entries(this.bindings)) {
                if (e.key === key) {
                    this.keys[action] = true;
                    // Empêcher le défilement de la page
                    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            for (const [action, key] of Object.entries(this.bindings)) {
                if (e.key === key) this.keys[action] = false;
            }
        });
    }

    initTouch() {
        const touchMap = { 'touchLeft': 'left', 'touchRight': 'right', 'touchJump': 'jump', 'touchDash': 'dash' };
        Object.entries(touchMap).forEach(([id, action]) => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys[action] = true; }, { passive: false });
                el.addEventListener('touchend', (e) => { e.preventDefault(); this.keys[action] = false; }, { passive: false });
            }
        });
    }

    initUI() {
        const btn = document.getElementById('controlsBtn');
        const panel = document.getElementById('controls-ui');
        const close = document.getElementById('closeControlsBtn');

        if (btn && panel) btn.addEventListener('click', () => panel.classList.toggle('hidden'));
        if (close && panel) close.addEventListener('click', () => panel.classList.add('hidden'));

        ['left', 'right', 'jump', 'dash'].forEach(action => {
            const rebindBtn = document.getElementById(`rebind-${action}`);
            if (rebindBtn) {
                rebindBtn.addEventListener('click', () => {
                    this.remappingAction = action;
                    rebindBtn.textContent = 'Pressez une touche...';
                });
            }
        });
    }

    updateRebindButtons() {
        ['left', 'right', 'jump', 'dash'].forEach(action => {
            const btn = document.getElementById(`rebind-${action}`);
            if (btn) btn.textContent = this.bindings[action] === ' ' ? 'Espace' : this.bindings[action];
        });
    }

    // À appeler dans la boucle principale du jeu (game.js)
    update() {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        const gp = gamepads[0]; // On prend la première manette détectée
        if (gp) {
            this.keys.left = gp.axes[0] < -0.3 || gp.buttons[14].pressed;
            this.keys.right = gp.axes[0] > 0.3 || gp.buttons[15].pressed;
            this.keys.jump = gp.buttons[0].pressed || gp.buttons[1].pressed; // A ou B
            this.keys.dash = gp.buttons[2].pressed; // X
            this.keys.pause = gp.buttons[9].pressed; // Start
        }
    }
}

const input = new InputManager();
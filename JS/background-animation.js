/* ──────────────────────────────────────────────
   Cinematic Background Animation
   Inspired by WindLand – atmospheric & immersive
   ────────────────────────────────────────────── */

class BackgroundAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.time = 0;
        this.scrollY = 0;

        // Collections
        this.stars = [];
        this.nebulaClouds = [];
        this.auroraLayers = [];
        this.orbs = [];
        this.trailParticles = [];
        this.geometrics = [];
        this.shootingStars = [];

        // Mouse
        this.mouse = { x: null, y: null, smoothX: null, smoothY: null };
        this.mouseTrail = [];
        this.ripples = [];

        this.palette = [
            { r: 64, g: 145, b: 215 },   // blue
            { r: 39, g: 174, b: 96 },     // green
            { r: 142, g: 68, b: 173 },    // purple
            { r: 22, g: 160, b: 133 },    // teal
            { r: 211, g: 84, b: 0 },      // ember
        ];

        this.resize();
        this.build();
        this.bindEvents();
        this.loop();
    }

    /* ── Sizing ── */
    resize() {
        this.W = window.innerWidth;
        this.H = window.innerHeight;
        this.canvas.width = this.W * this.dpr;
        this.canvas.height = this.H * this.dpr;
        this.canvas.style.width = this.W + 'px';
        this.canvas.style.height = this.H + 'px';
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    /* ── Build all layers ── */
    build() {
        this.buildStars();
        this.buildNebula();
        this.buildAurora();
        this.buildOrbs();
        this.buildTrailParticles();
        this.buildGeometrics();
    }

    /* ── Stars ── */
    buildStars() {
        this.stars = [];
        const n = Math.floor((this.W * this.H) / 2200);
        for (let i = 0; i < n; i++) {
            const layer = Math.random();
            this.stars.push({
                x: Math.random() * this.W,
                y: Math.random() * this.H,
                r: layer < 0.6 ? Math.random() * 0.7 + 0.3 : Math.random() * 1.4 + 0.6,
                twinkleSpeed: Math.random() * 0.03 + 0.008,
                twinklePhase: Math.random() * Math.PI * 2,
                brightness: Math.random() * 0.5 + 0.3,
                layer, // 0-0.6 far, 0.6-1 near (parallax)
                color: this.palette[Math.floor(Math.random() * 3)],
            });
        }
    }

    drawStars() {
        const parallax = this.scrollY * 0.15;
        this.stars.forEach(s => {
            s.twinklePhase += s.twinkleSpeed;
            const twinkle = 0.4 + Math.sin(s.twinklePhase) * 0.6;
            const alpha = s.brightness * twinkle;
            const py = ((s.y - parallax * (s.layer + 0.3)) % this.H + this.H) % this.H;

            this.ctx.beginPath();
            this.ctx.arc(s.x, py, s.r, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${s.color.r},${s.color.g},${s.color.b},${alpha})`;
            this.ctx.fill();

            if (s.r > 1.2 && alpha > 0.6) {
                this.ctx.shadowBlur = 6;
                this.ctx.shadowColor = `rgba(${s.color.r},${s.color.g},${s.color.b},${alpha * 0.5})`;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
        });
    }

    /* ── Nebula clouds ── */
    buildNebula() {
        this.nebulaClouds = [];
        const n = Math.max(3, Math.floor(this.W / 400));
        for (let i = 0; i < n; i++) {
            const c = this.palette[Math.floor(Math.random() * this.palette.length)];
            this.nebulaClouds.push({
                x: Math.random() * this.W,
                y: Math.random() * this.H * 0.8,
                rx: Math.random() * 200 + 120,
                ry: Math.random() * 120 + 60,
                color: c,
                opacity: Math.random() * 0.025 + 0.01,
                vx: (Math.random() - 0.5) * 0.12,
                vy: (Math.random() - 0.5) * 0.06,
                pulsePhase: Math.random() * Math.PI * 2,
                rotation: Math.random() * Math.PI,
            });
        }
    }

    drawNebula() {
        this.nebulaClouds.forEach(n => {
            n.pulsePhase += 0.003;
            n.x += n.vx;
            n.y += n.vy;
            n.rotation += 0.0003;

            if (n.x < -n.rx) n.x = this.W + n.rx;
            if (n.x > this.W + n.rx) n.x = -n.rx;
            if (n.y < -n.ry) n.y = this.H * 0.8;
            if (n.y > this.H * 0.8) n.y = -n.ry;

            const pulse = 1 + Math.sin(n.pulsePhase) * 0.2;

            this.ctx.save();
            this.ctx.translate(n.x, n.y);
            this.ctx.rotate(n.rotation);

            const grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, n.rx * pulse);
            grad.addColorStop(0, `rgba(${n.color.r},${n.color.g},${n.color.b},${n.opacity * 1.5})`);
            grad.addColorStop(0.5, `rgba(${n.color.r},${n.color.g},${n.color.b},${n.opacity * 0.5})`);
            grad.addColorStop(1, `rgba(${n.color.r},${n.color.g},${n.color.b},0)`);

            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, n.rx * pulse, n.ry * pulse, 0, 0, Math.PI * 2);
            this.ctx.fillStyle = grad;
            this.ctx.filter = 'blur(40px)';
            this.ctx.fill();
            this.ctx.filter = 'none';
            this.ctx.restore();
        });
    }

    /* ── Aurora borealis ── */
    buildAurora() {
        this.auroraLayers = [];
        const colors = [
            this.palette[0], // blue
            this.palette[2], // purple
            this.palette[3], // teal
            this.palette[1], // green
        ];
        for (let i = 0; i < 5; i++) {
            this.auroraLayers.push({
                baseY: this.H * (0.08 + i * 0.09),
                amplitude: 25 + Math.random() * 35,
                freq: 0.0015 + Math.random() * 0.002,
                speed: 0.006 + Math.random() * 0.006,
                phase: Math.random() * Math.PI * 2,
                opacity: 0.02 + Math.random() * 0.025,
                thickness: 50 + Math.random() * 70,
                colorA: colors[i % colors.length],
                colorB: colors[(i + 1) % colors.length],
            });
        }
    }

    drawAurora() {
        this.auroraLayers.forEach(w => {
            w.phase += w.speed * 0.4;
            const pts = [];
            for (let x = -10; x <= this.W + 10; x += 6) {
                const y = w.baseY
                    + Math.sin(x * w.freq + w.phase) * w.amplitude
                    + Math.sin(x * w.freq * 0.4 + w.phase * 1.7) * w.amplitude * 0.45
                    + Math.cos(x * w.freq * 0.7 + w.phase * 0.6) * w.amplitude * 0.25;
                pts.push({ x, y });
            }

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.moveTo(pts[0].x, pts[0].y - w.thickness);
            pts.forEach(p => this.ctx.lineTo(p.x, p.y - w.thickness * 0.5));
            for (let i = pts.length - 1; i >= 0; i--) {
                this.ctx.lineTo(pts[i].x, pts[i].y + w.thickness * 0.5);
            }
            this.ctx.closePath();

            const grad = this.ctx.createLinearGradient(0, w.baseY - w.thickness, 0, w.baseY + w.thickness);
            grad.addColorStop(0, `rgba(${w.colorA.r},${w.colorA.g},${w.colorA.b},0)`);
            grad.addColorStop(0.3, `rgba(${w.colorA.r},${w.colorA.g},${w.colorA.b},${w.opacity})`);
            grad.addColorStop(0.6, `rgba(${w.colorB.r},${w.colorB.g},${w.colorB.b},${w.opacity * 0.7})`);
            grad.addColorStop(1, `rgba(${w.colorB.r},${w.colorB.g},${w.colorB.b},0)`);

            this.ctx.fillStyle = grad;
            this.ctx.filter = 'blur(18px)';
            this.ctx.fill();
            this.ctx.filter = 'none';
            this.ctx.restore();
        });
    }

    /* ── Floating orbs with trail tails ── */
    buildOrbs() {
        this.orbs = [];
        const n = Math.max(3, Math.floor(this.W / 300));
        for (let i = 0; i < n; i++) {
            const c = this.palette[Math.floor(Math.random() * this.palette.length)];
            this.orbs.push({
                x: Math.random() * this.W,
                y: Math.random() * this.H * 0.75,
                r: Math.random() * 5 + 3,
                glowR: Math.random() * 60 + 30,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.4,
                color: c,
                trail: [],
                maxTrail: 30,
                pulsePhase: Math.random() * Math.PI * 2,
            });
        }
    }

    drawOrbs() {
        this.orbs.forEach(o => {
            o.pulsePhase += 0.02;
            o.x += o.vx;
            o.y += o.vy;

            // Bounce softly
            if (o.x < -50) o.vx = Math.abs(o.vx);
            if (o.x > this.W + 50) o.vx = -Math.abs(o.vx);
            if (o.y < -50) o.vy = Math.abs(o.vy);
            if (o.y > this.H * 0.8) o.vy = -Math.abs(o.vy);

            // Mouse repulsion
            if (this.mouse.smoothX !== null) {
                const dx = o.x - this.mouse.smoothX;
                const dy = o.y - this.mouse.smoothY;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < 180 && d > 0) {
                    const f = (180 - d) / 180 * 0.15;
                    o.vx += (dx / d) * f;
                    o.vy += (dy / d) * f;
                }
            }

            // Speed limit
            const spd = Math.sqrt(o.vx * o.vx + o.vy * o.vy);
            if (spd > 1.2) { o.vx *= 1.2 / spd; o.vy *= 1.2 / spd; }

            // Trail
            o.trail.push({ x: o.x, y: o.y });
            if (o.trail.length > o.maxTrail) o.trail.shift();

            // Draw trail
            for (let i = 1; i < o.trail.length; i++) {
                const alpha = (i / o.trail.length) * 0.15;
                const w = (i / o.trail.length) * o.r * 0.8;
                this.ctx.beginPath();
                this.ctx.moveTo(o.trail[i - 1].x, o.trail[i - 1].y);
                this.ctx.lineTo(o.trail[i].x, o.trail[i].y);
                this.ctx.strokeStyle = `rgba(${o.color.r},${o.color.g},${o.color.b},${alpha})`;
                this.ctx.lineWidth = w;
                this.ctx.lineCap = 'round';
                this.ctx.stroke();
            }

            // Glow
            const pulse = 1 + Math.sin(o.pulsePhase) * 0.25;
            const grad = this.ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.glowR * pulse);
            grad.addColorStop(0, `rgba(${o.color.r},${o.color.g},${o.color.b},0.12)`);
            grad.addColorStop(0.4, `rgba(${o.color.r},${o.color.g},${o.color.b},0.04)`);
            grad.addColorStop(1, `rgba(${o.color.r},${o.color.g},${o.color.b},0)`);
            this.ctx.beginPath();
            this.ctx.arc(o.x, o.y, o.glowR * pulse, 0, Math.PI * 2);
            this.ctx.fillStyle = grad;
            this.ctx.fill();

            // Core
            this.ctx.beginPath();
            this.ctx.arc(o.x, o.y, o.r * pulse, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${o.color.r},${o.color.g},${o.color.b},0.9)`;
            this.ctx.shadowBlur = 16;
            this.ctx.shadowColor = `rgba(${o.color.r},${o.color.g},${o.color.b},0.6)`;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
    }

    /* ── Trail particles (dust floating upward) ── */
    buildTrailParticles() {
        this.trailParticles = [];
        const n = Math.floor((this.W * this.H) / 12000);
        for (let i = 0; i < n; i++) {
            this.trailParticles.push({
                x: Math.random() * this.W,
                y: Math.random() * this.H,
                vy: -(Math.random() * 0.3 + 0.1),
                vx: (Math.random() - 0.5) * 0.15,
                r: Math.random() * 1.2 + 0.3,
                opacity: Math.random() * 0.3 + 0.1,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: Math.random() * 0.02 + 0.005,
            });
        }
    }

    drawTrailParticles() {
        this.trailParticles.forEach(p => {
            p.wobble += p.wobbleSpeed;
            p.x += p.vx + Math.sin(p.wobble) * 0.2;
            p.y += p.vy;

            if (p.y < -10) { p.y = this.H + 10; p.x = Math.random() * this.W; }
            if (p.x < -10) p.x = this.W + 10;
            if (p.x > this.W + 10) p.x = -10;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(180,210,240,${p.opacity})`;
            this.ctx.fill();
        });
    }

    /* ── Geometric wireframes ── */
    buildGeometrics() {
        this.geometrics = [];
        const n = Math.max(4, Math.floor(this.W / 280));
        for (let i = 0; i < n; i++) {
            const c = this.palette[Math.floor(Math.random() * this.palette.length)];
            this.geometrics.push({
                x: Math.random() * this.W,
                y: Math.random() * this.H,
                size: Math.random() * 22 + 12,
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.006,
                vx: (Math.random() - 0.5) * 0.18,
                vy: (Math.random() - 0.5) * 0.12,
                type: Math.floor(Math.random() * 4),
                opacity: Math.random() * 0.12 + 0.04,
                color: c,
                pulsePhase: Math.random() * Math.PI * 2,
            });
        }
    }

    drawGeometrics() {
        this.geometrics.forEach(g => {
            g.x += g.vx;
            g.y += g.vy;
            g.rot += g.rotSpeed;
            g.pulsePhase += 0.012;

            if (g.x < -g.size * 3) g.x = this.W + g.size;
            if (g.x > this.W + g.size * 3) g.x = -g.size;
            if (g.y < -g.size * 3) g.y = this.H + g.size;
            if (g.y > this.H + g.size * 3) g.y = -g.size;

            const pulse = 0.6 + Math.sin(g.pulsePhase) * 0.4;
            const alpha = g.opacity * pulse;

            this.ctx.save();
            this.ctx.translate(g.x, g.y);
            this.ctx.rotate(g.rot);
            this.ctx.strokeStyle = `rgba(${g.color.r},${g.color.g},${g.color.b},${alpha})`;
            this.ctx.lineWidth = 0.8;

            const s = g.size;
            if (g.type === 0) { // hexagon
                this.ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const a = (Math.PI / 3) * i - Math.PI / 6;
                    i === 0 ? this.ctx.moveTo(Math.cos(a) * s, Math.sin(a) * s)
                            : this.ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s);
                }
                this.ctx.closePath();
                this.ctx.stroke();
            } else if (g.type === 1) { // triangle
                this.ctx.beginPath();
                for (let i = 0; i < 3; i++) {
                    const a = (Math.PI * 2 / 3) * i - Math.PI / 2;
                    i === 0 ? this.ctx.moveTo(Math.cos(a) * s, Math.sin(a) * s)
                            : this.ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s);
                }
                this.ctx.closePath();
                this.ctx.stroke();
            } else if (g.type === 2) { // diamond
                this.ctx.beginPath();
                this.ctx.moveTo(0, -s);
                this.ctx.lineTo(s * 0.6, 0);
                this.ctx.lineTo(0, s);
                this.ctx.lineTo(-s * 0.6, 0);
                this.ctx.closePath();
                this.ctx.stroke();
            } else { // circle ring
                this.ctx.beginPath();
                this.ctx.arc(0, 0, s, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2);
                this.ctx.stroke();
            }

            this.ctx.restore();
        });
    }

    /* ── Shooting stars ── */
    maybeSpawnShootingStar() {
        if (Math.random() > 0.003) return;
        const startX = Math.random() * this.W;
        const startY = Math.random() * this.H * 0.4;
        const angle = Math.PI * 0.15 + Math.random() * 0.3;
        const speed = 4 + Math.random() * 4;
        this.shootingStars.push({
            x: startX, y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            decay: 0.015 + Math.random() * 0.01,
            length: 60 + Math.random() * 80,
        });
    }

    drawShootingStars() {
        this.shootingStars = this.shootingStars.filter(s => s.life > 0);
        this.shootingStars.forEach(s => {
            s.x += s.vx;
            s.y += s.vy;
            s.life -= s.decay;

            const tailX = s.x - s.vx * s.length / 5;
            const tailY = s.y - s.vy * s.length / 5;

            const grad = this.ctx.createLinearGradient(tailX, tailY, s.x, s.y);
            grad.addColorStop(0, `rgba(200,220,255,0)`);
            grad.addColorStop(1, `rgba(200,220,255,${s.life * 0.7})`);

            this.ctx.beginPath();
            this.ctx.moveTo(tailX, tailY);
            this.ctx.lineTo(s.x, s.y);
            this.ctx.strokeStyle = grad;
            this.ctx.lineWidth = 1.5;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();

            // Head glow
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(220,240,255,${s.life * 0.8})`;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = `rgba(200,220,255,${s.life * 0.5})`;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
    }

    /* ── Particle connections (mesh network) ── */
    drawConnections() {
        const maxD = 120;
        const mouseR = 220;
        const ps = this.trailParticles;

        for (let i = 0; i < ps.length; i++) {
            for (let j = i + 1; j < ps.length; j++) {
                const dx = ps[i].x - ps[j].x;
                const dy = ps[i].y - ps[j].y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < maxD) {
                    const alpha = (1 - d / maxD) * 0.12;
                    this.ctx.beginPath();
                    this.ctx.moveTo(ps[i].x, ps[i].y);
                    this.ctx.lineTo(ps[j].x, ps[j].y);
                    this.ctx.strokeStyle = `rgba(140,180,220,${alpha})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }

            // Mouse connections
            if (this.mouse.smoothX !== null) {
                const dx = this.mouse.smoothX - ps[i].x;
                const dy = this.mouse.smoothY - ps[i].y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < mouseR) {
                    const alpha = (1 - d / mouseR) * 0.25;
                    this.ctx.beginPath();
                    this.ctx.moveTo(ps[i].x, ps[i].y);
                    this.ctx.lineTo(this.mouse.smoothX, this.mouse.smoothY);
                    this.ctx.strokeStyle = `rgba(200,230,255,${alpha})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }
    }

    /* ── Mouse trail ── */
    drawMouseTrail() {
        if (this.mouse.smoothX === null) return;

        this.mouseTrail.push({ x: this.mouse.smoothX, y: this.mouse.smoothY, life: 1 });
        if (this.mouseTrail.length > 20) this.mouseTrail.shift();

        for (let i = 1; i < this.mouseTrail.length; i++) {
            const p = this.mouseTrail[i];
            p.life -= 0.05;
            if (p.life <= 0) continue;
            const prev = this.mouseTrail[i - 1];
            this.ctx.beginPath();
            this.ctx.moveTo(prev.x, prev.y);
            this.ctx.lineTo(p.x, p.y);
            this.ctx.strokeStyle = `rgba(93,173,226,${p.life * 0.15})`;
            this.ctx.lineWidth = p.life * 3;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();
        }
        this.mouseTrail = this.mouseTrail.filter(p => p.life > 0);
    }

    /* ── Mouse glow spotlight ── */
    drawMouseGlow() {
        if (this.mouse.smoothX === null) return;

        // Main spotlight
        const grad = this.ctx.createRadialGradient(
            this.mouse.smoothX, this.mouse.smoothY, 0,
            this.mouse.smoothX, this.mouse.smoothY, 250
        );
        grad.addColorStop(0, 'rgba(93,173,226,0.07)');
        grad.addColorStop(0.25, 'rgba(142,68,173,0.04)');
        grad.addColorStop(0.6, 'rgba(22,160,133,0.02)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        this.ctx.beginPath();
        this.ctx.arc(this.mouse.smoothX, this.mouse.smoothY, 250, 0, Math.PI * 2);
        this.ctx.fillStyle = grad;
        this.ctx.fill();

        // Inner bright core
        const inner = this.ctx.createRadialGradient(
            this.mouse.smoothX, this.mouse.smoothY, 0,
            this.mouse.smoothX, this.mouse.smoothY, 40
        );
        inner.addColorStop(0, 'rgba(200,230,255,0.06)');
        inner.addColorStop(1, 'rgba(200,230,255,0)');
        this.ctx.beginPath();
        this.ctx.arc(this.mouse.smoothX, this.mouse.smoothY, 40, 0, Math.PI * 2);
        this.ctx.fillStyle = inner;
        this.ctx.fill();
    }

    /* ── Ripples on click ── */
    drawRipples() {
        this.ripples = this.ripples.filter(r => r.life > 0);
        this.ripples.forEach(r => {
            r.radius += 2.5;
            r.life -= 0.018;
            this.ctx.beginPath();
            this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(93,173,226,${r.life * 0.3})`;
            this.ctx.lineWidth = 1.5 * r.life;
            this.ctx.stroke();
        });
    }

    /* ── Vignette + scanlines ── */
    drawAtmosphere() {
        // Vignette
        const vg = this.ctx.createRadialGradient(
            this.W / 2, this.H / 2, this.H * 0.25,
            this.W / 2, this.H / 2, this.H * 0.95
        );
        vg.addColorStop(0, 'rgba(0,0,0,0)');
        vg.addColorStop(1, 'rgba(4,4,12,0.55)');
        this.ctx.fillStyle = vg;
        this.ctx.fillRect(0, 0, this.W, this.H);

        // Subtle scanlines
        this.ctx.fillStyle = 'rgba(0,0,0,0.03)';
        for (let y = 0; y < this.H; y += 3) {
            this.ctx.fillRect(0, y, this.W, 1);
        }

        // Top/bottom color wash
        const topGrad = this.ctx.createLinearGradient(0, 0, 0, this.H * 0.35);
        topGrad.addColorStop(0, 'rgba(6,6,18,0.4)');
        topGrad.addColorStop(1, 'rgba(6,6,18,0)');
        this.ctx.fillStyle = topGrad;
        this.ctx.fillRect(0, 0, this.W, this.H * 0.35);

        const botGrad = this.ctx.createLinearGradient(0, this.H * 0.7, 0, this.H);
        botGrad.addColorStop(0, 'rgba(6,6,18,0)');
        botGrad.addColorStop(1, 'rgba(6,6,18,0.5)');
        this.ctx.fillStyle = botGrad;
        this.ctx.fillRect(0, this.H * 0.7, this.W, this.H * 0.3);
    }

    /* ── Main loop ── */
    loop() {
        this.time++;

        // Smooth mouse
        if (this.mouse.x !== null) {
            if (this.mouse.smoothX === null) {
                this.mouse.smoothX = this.mouse.x;
                this.mouse.smoothY = this.mouse.y;
            } else {
                this.mouse.smoothX += (this.mouse.x - this.mouse.smoothX) * 0.06;
                this.mouse.smoothY += (this.mouse.y - this.mouse.smoothY) * 0.06;
            }
        }

        this.ctx.clearRect(0, 0, this.W, this.H);

        // Draw layers back-to-front
        this.drawStars();
        this.drawNebula();
        this.drawAurora();
        this.drawTrailParticles();
        this.drawConnections();
        this.drawGeometrics();
        this.drawOrbs();
        this.maybeSpawnShootingStar();
        this.drawShootingStars();
        this.drawMouseGlow();
        this.drawMouseTrail();
        this.drawRipples();
        this.drawAtmosphere();

        requestAnimationFrame(() => this.loop());
    }

    /* ── Events ── */
    bindEvents() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.resize();
                this.build();
            }, 200);
        });

        window.addEventListener('mousemove', e => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        window.addEventListener('click', e => {
            this.ripples.push({ x: e.clientX, y: e.clientY, radius: 5, life: 1 });
        });

        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY;
        }, { passive: true });

        window.addEventListener('touchmove', e => {
            if (e.touches.length) {
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
            }
        }, { passive: true });
        window.addEventListener('touchend', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('pageLoader');
    new BackgroundAnimation('bgCanvas');

    if (loader) {
        setTimeout(() => {
            loader.classList.add('fade-out');
            setTimeout(() => loader.remove(), 800);
        }, 1400);
    }
});

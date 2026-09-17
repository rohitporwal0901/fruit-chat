import { Injectable } from '@angular/core';

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: 'rect' | 'circle' | 'star';
  rotation: number;
  rotSpeed: number;
  tilt: number;
  tiltSpeed: number;
  opacity: number;
  decay: number;
  gravity: number;
  drag: number;
}

@Injectable({ providedIn: 'root' })
export class ConfettiService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: ConfettiParticle[] = [];
  private animationFrameId: number | null = null;

  private colors = [
    '#22c55e', '#16a34a', '#4ade80', // Fresh Greens
    '#f59e0b', '#fbbf24', '#fde047', // Gold / Warm Sun
    '#ff1493', '#f43f5e', '#fb7185', // Berry / Strawberry Pink
    '#ff6d00', '#ff9e40',             // Citrus Orange
    '#00e5ff', '#38bdf8',             // Electric Cyan
    '#ffffff'                         // Sparkling White
  ];

  private ensureCanvas(): boolean {
    if (typeof document === 'undefined') return false;

    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'fc-confetti-canvas';
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100vw';
      this.canvas.style.height = '100vh';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '999999';
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (this.canvas.width !== width * dpr || this.canvas.height !== height * dpr) {
      this.canvas.width = width * dpr;
      this.canvas.height = height * dpr;
      this.ctx?.scale(dpr, dpr);
    }

    return !!this.ctx;
  }

  /**
   * Launch a grand celebratory confetti burst
   * @param origin Optional normalized origin (x: 0..1, y: 0..1)
   */
  launch(origin?: { x: number; y: number }): void {
    if (!this.ensureCanvas()) return;

    // Trigger slight haptic feedback on devices that support it
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 20, 60]);
      } catch (_) {}
    }

    const w = window.innerWidth;
    const h = window.innerHeight;

    const centerX = origin ? origin.x * w : w * 0.5;
    const centerY = origin ? origin.y * h : h * 0.45;

    // 1. Central explosion from the target point
    this.createBlast(centerX, centerY, 80, {
      angleMin: 0,
      angleMax: 360,
      speedMin: 12,
      speedMax: 26,
      gravity: 0.38
    });

    // 2. Left upward cannon blast
    this.createBlast(w * 0.1, h * 0.85, 45, {
      angleMin: -75,
      angleMax: -25,
      speedMin: 16,
      speedMax: 28,
      gravity: 0.35
    });

    // 3. Right upward cannon blast
    this.createBlast(w * 0.9, h * 0.85, 45, {
      angleMin: -155,
      angleMax: -105,
      speedMin: 16,
      speedMax: 28,
      gravity: 0.35
    });

    if (!this.animationFrameId) {
      this.loop();
    }
  }

  private createBlast(
    x: number,
    y: number,
    count: number,
    opts: { angleMin: number; angleMax: number; speedMin: number; speedMax: number; gravity: number }
  ): void {
    const shapes: ('rect' | 'circle' | 'star')[] = ['rect', 'rect', 'rect', 'circle', 'star'];

    for (let i = 0; i < count; i++) {
      const angle = (opts.angleMin + Math.random() * (opts.angleMax - opts.angleMin)) * (Math.PI / 180);
      const speed = opts.speedMin + Math.random() * (opts.speedMax - opts.speedMin);
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];

      this.particles.push({
        x: x + (Math.random() * 20 - 10),
        y: y + (Math.random() * 20 - 10),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: shape === 'star' ? 9 + Math.random() * 7 : (shape === 'circle' ? 5 + Math.random() * 5 : 8 + Math.random() * 8),
        color,
        shape,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() * 12 - 6),
        tilt: Math.random() * 10,
        tiltSpeed: 0.08 + Math.random() * 0.08,
        opacity: 1,
        decay: 0.007 + Math.random() * 0.006,
        gravity: opts.gravity,
        drag: 0.978
      });
    }
  }

  private loop = (): void => {
    if (!this.ctx || !this.canvas) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    this.ctx.clearRect(0, 0, w, h);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;

      p.rotation += p.rotSpeed;
      p.tilt += p.tiltSpeed;
      p.opacity -= p.decay;

      if (p.opacity <= 0 || p.y > h + 40) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.opacity);
      this.ctx.fillStyle = p.color;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);

      // 3D perspective flip effect using tilt
      const xFlip = Math.cos(p.tilt);

      if (p.shape === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.shape === 'star') {
        this.drawStar(this.ctx, 0, 0, 5, p.size * 0.6, p.size * 0.3);
      } else {
        // Rectangle ribbon fluttering in 3D
        this.ctx.scale(xFlip, 1);
        this.ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 1.5);
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationFrameId = requestAnimationFrame(this.loop);
    } else {
      this.animationFrameId = null;
      if (this.canvas) {
        this.ctx.clearRect(0, 0, w, h);
      }
    }
  };

  private drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ): void {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }
}

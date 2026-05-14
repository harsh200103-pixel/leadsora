"use client";
import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  color: string;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const COLORS = ['rgba(255,189,46,', 'rgba(255,255,255,', 'rgba(79,172,254,'];
    const COUNT = Math.min(80, Math.floor((W * H) / 14000));
    const FOV = 900;
    const MAX_DIST = 170;

    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - W / 2) / W;
      mouseY = (e.clientY - H / 2) / H;
    };
    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);

    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * W * 1.4,
      y: (Math.random() - 0.5) * H * 1.4,
      z: (Math.random() - 0.5) * 800,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      vz: (Math.random() - 0.5) * 0.28,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    let rotY = 0, rotX = 0, radarAngle = 0;
    let animId: number;

    const project = (x: number, y: number, z: number) => {
      const scale = FOV / (FOV + z);
      return { px: x * scale + W / 2, py: y * scale + H / 2, scale };
    };

    const animate = () => {
      ctx.clearRect(0, 0, W, H);

      rotY += 0.0014 + mouseX * 0.002;
      rotX += 0.0004 + mouseY * 0.001;
      radarAngle += 0.011;

      const cx = W / 2, cy = H / 2;
      const radarR = Math.min(W, H) * 0.20;

      // Faint radar rings
      for (let r = 1; r <= 3; r++) {
        ctx.beginPath();
        ctx.arc(cx, cy, radarR * (r / 3), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,189,46,${0.035 * r})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Radar sweep (manual arc fill)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(radarAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radarR, -0.55, 0.55);
      ctx.closePath();
      const sweepGrad = ctx.createLinearGradient(0, 0, radarR, 0);
      sweepGrad.addColorStop(0, 'rgba(255,189,46,0.14)');
      sweepGrad.addColorStop(1, 'rgba(255,189,46,0)');
      ctx.fillStyle = sweepGrad;
      ctx.fill();
      ctx.restore();

      // Cross-hairs
      ctx.save();
      ctx.strokeStyle = 'rgba(255,189,46,0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - radarR, cy); ctx.lineTo(cx + radarR, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - radarR); ctx.lineTo(cx, cy + radarR); ctx.stroke();
      ctx.restore();

      // 3D transform + project particles
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

      const projected = particles.map((p) => {
        p.x += p.vx; p.y += p.vy; p.z += p.vz;
        if (Math.abs(p.x) > W * 0.8) p.vx *= -1;
        if (Math.abs(p.y) > H * 0.8) p.vy *= -1;
        if (Math.abs(p.z) > 500) p.vz *= -1;

        const rx = p.x * cosY - p.z * sinY;
        const rz0 = p.x * sinY + p.z * cosY;
        const ry = p.y * cosX - rz0 * sinX;
        const rz = p.y * sinX + rz0 * cosX;

        return { ...project(rx, ry, rz), color: p.color };
      });

      // Connections
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const a = projected[i], b = projected[j];
          const dx = a.px - b.px, dy = a.py - b.py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            ctx.beginPath();
            ctx.moveTo(a.px, a.py);
            ctx.lineTo(b.px, b.py);
            ctx.strokeStyle = `rgba(255,255,255,${(1 - dist / MAX_DIST) * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Particles + glow
      projected.forEach(({ px, py, scale, color }) => {
        const r = Math.max(1, scale * 2.5);
        const alpha = Math.min(0.85, scale * 0.9);
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${alpha})`;
        ctx.fill();
        if (scale > 0.85) {
          const glow = ctx.createRadialGradient(px, py, 0, px, py, r * 5);
          glow.addColorStop(0, `${color}${alpha * 0.25})`);
          glow.addColorStop(1, `${color}0)`);
          ctx.beginPath();
          ctx.arc(px, py, r * 5, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }
      });

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        zIndex: 0, pointerEvents: 'none', opacity: 0.7,
      }}
    />
  );
}

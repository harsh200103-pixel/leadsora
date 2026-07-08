"use client";
import { useEffect, useRef } from 'react';
import { useTheme } from '../app/context/ThemeContext';

interface Particle {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  color: string;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    // Theme-aware colors
    const isDark = theme === 'dark';
    const COLORS = isDark
      ? ['rgba(255,189,46,', 'rgba(255,255,255,', 'rgba(0,212,255,']
      : ['rgba(0,14,57,', 'rgba(0,174,239,', 'rgba(0,212,255,'];
    const lineColor = isDark ? 'rgba(255,255,255,' : 'rgba(0,174,239,';
    const radarColor = isDark ? 'rgba(255,189,46,' : 'rgba(0,174,239,';
    const particleOpacity = isDark ? 0.7 : 0.35;
    const connectionOpacity = isDark ? 0.15 : 0.08;

    const COUNT = Math.min(60, Math.floor((W * H) / 16000));
    const FOV = 900;
    const MAX_DIST = 160;

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
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      vz: (Math.random() - 0.5) * 0.22,
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

      rotY += 0.0012 + mouseX * 0.002;
      rotX += 0.0003 + mouseY * 0.001;
      radarAngle += 0.009;

      const cx = W / 2, cy = H / 2;
      const radarR = Math.min(W, H) * 0.18;

      // Radar rings
      for (let r = 1; r <= 3; r++) {
        ctx.beginPath();
        ctx.arc(cx, cy, radarR * (r / 3), 0, Math.PI * 2);
        ctx.strokeStyle = `${radarColor}${0.04 * r})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Radar sweep
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(radarAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radarR, -0.5, 0.5);
      ctx.closePath();
      const sweepGrad = ctx.createLinearGradient(0, 0, radarR, 0);
      sweepGrad.addColorStop(0, `${radarColor}0.12)`);
      sweepGrad.addColorStop(1, `${radarColor}0)`);
      ctx.fillStyle = sweepGrad;
      ctx.fill();
      ctx.restore();

      // Cross-hairs
      ctx.save();
      ctx.strokeStyle = `${radarColor}0.04)`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - radarR, cy); ctx.lineTo(cx + radarR, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - radarR); ctx.lineTo(cx, cy + radarR); ctx.stroke();
      ctx.restore();

      // 3D transform + project
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
            ctx.strokeStyle = `${lineColor}${(1 - dist / MAX_DIST) * connectionOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Particles
      projected.forEach(({ px, py, scale, color }) => {
        const r = Math.max(1, scale * 2.2);
        const alpha = Math.min(particleOpacity, scale * 0.8);
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = `${color}${alpha})`;
        ctx.fill();
        if (scale > 0.85) {
          const glow = ctx.createRadialGradient(px, py, 0, px, py, r * 4);
          glow.addColorStop(0, `${color}${alpha * 0.2})`);
          glow.addColorStop(1, `${color}0)`);
          ctx.beginPath();
          ctx.arc(px, py, r * 4, 0, Math.PI * 2);
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
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        zIndex: 0, pointerEvents: 'none',
        opacity: theme === 'dark' ? 0.7 : 0.5,
      }}
    />
  );
}

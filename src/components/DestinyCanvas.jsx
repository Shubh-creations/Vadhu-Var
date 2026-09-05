import React, { useEffect, useRef } from 'react';

/**
 * DestinyCanvas - Generative WebGL/Canvas Spatial Field
 * Features undulating golden ribbons ("Bandhan / Threads of Destiny")
 * with interactive golden motes reacting to cursor velocity.
 */
export const DestinyCanvas = ({ className = '' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Responsive particle count (throttled on mobile for guaranteed 60 FPS)
    const isMobile = width < 768;
    const particleCount = isMobile ? 320 : 650;

    // Interactive mouse state
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      radius: isMobile ? 80 : 140,
      active: false
    };

    // Particle Array
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        size: Math.random() * 1.8 + 0.5,
        alpha: Math.random() * 0.5 + 0.15,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: (Math.random() - 0.5) * 0.35,
        color: i % 4 === 0 ? '#E11D48' : i % 3 === 0 ? '#D4AF37' : '#F59E0B'
      });
    }

    // Undulating Ribbon Waves configuration
    let waveTime = 0;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const render = () => {
      waveTime += 0.008;

      // Smooth mouse spring interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Sacred Undulating Golden & Crimson Ribbons (Bandhan Waves)
      const ribbonCount = 3;
      for (let r = 0; r < ribbonCount; r++) {
        ctx.beginPath();
        const offset = r * (Math.PI / 2.5);
        const baseY = height * (0.35 + r * 0.18);

        ctx.moveTo(0, baseY);
        for (let x = 0; x <= width; x += 15) {
          const wave1 = Math.sin(x * 0.0025 + waveTime + offset) * 45;
          const wave2 = Math.cos(x * 0.004 - waveTime * 0.8) * 25;
          const y = baseY + wave1 + wave2;
          ctx.lineTo(x, y);
        }

        ctx.lineWidth = r === 0 ? 1.5 : 1.0;
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        if (r === 0) {
          gradient.addColorStop(0, 'rgba(212, 175, 55, 0.0)');
          gradient.addColorStop(0.3, 'rgba(245, 158, 11, 0.14)');
          gradient.addColorStop(0.7, 'rgba(225, 29, 72, 0.12)');
          gradient.addColorStop(1, 'rgba(212, 175, 55, 0.0)');
        } else if (r === 1) {
          gradient.addColorStop(0, 'rgba(225, 29, 72, 0.0)');
          gradient.addColorStop(0.5, 'rgba(244, 63, 94, 0.12)');
          gradient.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
        } else {
          gradient.addColorStop(0, 'rgba(245, 158, 11, 0.0)');
          gradient.addColorStop(0.5, 'rgba(212, 175, 55, 0.10)');
          gradient.addColorStop(1, 'rgba(225, 29, 72, 0.0)');
        }

        ctx.strokeStyle = gradient;
        ctx.stroke();
      }

      // 2. Draw Interactive Golden Particle Motes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around screen boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse Velocity Repulsion Physics
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const force = (1 - dist / mouse.radius) * 3.5;
            const angle = Math.atan2(dy, dx);
            p.x += Math.cos(angle) * force;
            p.y += Math.sin(angle) * force;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity: 0.85 }}
    />
  );
};

export default DestinyCanvas;

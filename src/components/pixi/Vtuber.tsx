'use client';

import { useEffect, useRef, useState } from 'react';

const VtuberCanvas = ({ width = 400, height = 400 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Random blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, Math.random() * 3000 + 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Drawing function
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const draw = () => {
      timeRef.current += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate head tilt based on mouse position
      const tiltX = (mousePos.x - centerX) * 0.03;
      const tiltY = (mousePos.y - centerY) * 0.03;

      // Breathing animation
      const breathe = Math.sin(timeRef.current * 2) * 3;

      ctx.save();
      ctx.translate(centerX, centerY + breathe);
      ctx.rotate(tiltX * 0.01);

      // Head shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.beginPath();
      ctx.ellipse(0, 80, 60, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Neck
      ctx.fillStyle = '#ffd4a3';
      ctx.fillRect(-20, 50, 40, 30);

      // Head
      ctx.fillStyle = '#ffd4a3';
      ctx.beginPath();
      ctx.ellipse(0, 0, 70, 85, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hair back
      ctx.fillStyle = '#4a3728';
      ctx.beginPath();
      ctx.ellipse(-10, -20, 80, 95, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Ears
      ctx.fillStyle = '#ffd4a3';
      ctx.beginPath();
      ctx.ellipse(-65, 0, 12, 18, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(65, 0, 12, 18, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      const eyeOffsetX = tiltX * 0.5;
      const eyeOffsetY = tiltY * 0.5;

      if (isBlinking) {
        // Closed eyes
        ctx.strokeStyle = '#2c1810';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-30 + eyeOffsetX, -10 + eyeOffsetY);
        ctx.lineTo(-15 + eyeOffsetX, -10 + eyeOffsetY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(15 + eyeOffsetX, -10 + eyeOffsetY);
        ctx.lineTo(30 + eyeOffsetX, -10 + eyeOffsetY);
        ctx.stroke();
      } else {
        // Left eye
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(-25 + eyeOffsetX, -10 + eyeOffsetY, 12, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3d2817';
        ctx.beginPath();
        ctx.ellipse(-25 + eyeOffsetX, -8 + eyeOffsetY, 7, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(-25 + eyeOffsetX, -6 + eyeOffsetY, 5, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        // Highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(-27 + eyeOffsetX, -10 + eyeOffsetY, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Right eye
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(25 + eyeOffsetX, -10 + eyeOffsetY, 12, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3d2817';
        ctx.beginPath();
        ctx.ellipse(25 + eyeOffsetX, -8 + eyeOffsetY, 7, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(25 + eyeOffsetX, -6 + eyeOffsetY, 5, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        // Highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(23 + eyeOffsetX, -10 + eyeOffsetY, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Eyebrows
      ctx.strokeStyle = '#2c1810';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-35, -35);
      ctx.quadraticCurveTo(-25, -38, -15, -35);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(15, -35);
      ctx.quadraticCurveTo(25, -38, 35, -35);
      ctx.stroke();

      // Nose
      ctx.strokeStyle = '#e6b894';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(5, 10);
      ctx.stroke();

      // Mouth
      const mouthOpen = isSpeaking ? Math.abs(Math.sin(timeRef.current * 10)) * 15 : 0;
      ctx.fillStyle = '#8b4545';
      ctx.beginPath();
      if (isSpeaking && mouthOpen > 5) {
        ctx.ellipse(0, 25, 15, mouthOpen, 0, 0, Math.PI * 2);
        ctx.fill();
        // Tongue
        ctx.fillStyle = '#d97979';
        ctx.beginPath();
        ctx.ellipse(0, 28, 10, mouthOpen * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.arc(0, 25, 12, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }

      // Blush
      ctx.fillStyle = 'rgba(255, 150, 150, 0.3)';
      ctx.beginPath();
      ctx.ellipse(-45, 10, 15, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(45, 10, 15, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hair front
      ctx.fillStyle = '#4a3728';
      ctx.beginPath();
      ctx.moveTo(-70, -30);
      ctx.quadraticCurveTo(-60, -80, -40, -70);
      ctx.quadraticCurveTo(-20, -90, 0, -85);
      ctx.quadraticCurveTo(20, -90, 40, -70);
      ctx.quadraticCurveTo(60, -80, 70, -30);
      ctx.quadraticCurveTo(50, -50, 30, -45);
      ctx.quadraticCurveTo(0, -60, -30, -45);
      ctx.quadraticCurveTo(-50, -50, -70, -30);
      ctx.fill();

      ctx.restore();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mousePos, isBlinking, isSpeaking]);

  const handleClick = () => {
    setIsSpeaking(!isSpeaking);
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={handleClick}
      style={{ display: 'block', cursor: 'pointer' }}
    />
  );
};

export default VtuberCanvas;

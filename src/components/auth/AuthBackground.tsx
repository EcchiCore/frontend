'use client';

import React, { useEffect, useState } from 'react';

export const AuthBackground: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <style>{`
        /* ===== Aurora Animations ===== */
        .auth-aurora-1 {
          background: radial-gradient(circle, rgba(139,123,245,0.45) 0%, transparent 70%);
          animation: auroraMove1 8s ease-in-out infinite;
        }
        .auth-aurora-2 {
          background: radial-gradient(circle, rgba(99,82,210,0.4) 0%, transparent 70%);
          animation: auroraMove2 10s ease-in-out infinite;
        }
        .auth-aurora-3 {
          background: radial-gradient(circle, rgba(168,155,255,0.3) 0%, transparent 70%);
          animation: auroraMove3 12s ease-in-out infinite;
        }
        @keyframes auroraMove1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-80px, 50px) scale(1.2); }
          50% { transform: translate(-40px, 100px) scale(0.9); }
          75% { transform: translate(50px, 30px) scale(1.1); }
        }
        @keyframes auroraMove2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(60px, -50px) scale(1.15); }
          66% { transform: translate(-30px, -70px) scale(0.95); }
        }
        @keyframes auroraMove3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.35; }
          50% { transform: translate(50px, -40px) scale(1.3); opacity: 0.55; }
        }

        /* ===== Star Twinkle ===== */
        .auth-star {
          animation: starTwinkle 3s ease-in-out infinite;
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.05; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.5); }
        }

        /* ===== Floating Rings ===== */
        .auth-ring-1 { animation: ringFloat1 6s ease-in-out infinite; }
        .auth-ring-2 { animation: ringFloat2 8s ease-in-out infinite; }
        .auth-ring-3 { animation: ringFloat3 7s ease-in-out infinite; }
        @keyframes ringFloat1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(15deg); }
        }
        @keyframes ringFloat2 {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          50% { transform: translateY(20px) rotate(-10deg) scale(1.1); }
        }
        @keyframes ringFloat3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-15px, -20px); }
        }

        /* ===== Floating Hexagons ===== */
        .auth-hex-1 { animation: hexFloat1 9s ease-in-out infinite; }
        .auth-hex-2 { animation: hexFloat2 11s ease-in-out infinite; }
        @keyframes hexFloat1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(30deg); }
        }
        @keyframes hexFloat2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(25px) rotate(-20deg); }
        }

        /* ===== Light Beam ===== */
        @keyframes beamSweep {
          0%, 100% { transform: translateX(-100px) rotate(-8deg); opacity: 0; }
          50% { transform: translateX(100px) rotate(8deg); opacity: 1; }
        }

        /* ===== Background Particles ===== */
        .auth-bg-particle {
          position: absolute;
          border-radius: 50%;
          background: rgba(139,123,245,0.2);
          animation: particleFloat linear infinite;
        }
        @keyframes particleFloat {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-10vh) scale(1); opacity: 0; }
        }
      `}</style>

      {/* Aurora Blobs */}
      <div className="auth-aurora-1 absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.15] top-[-10%] right-[-5%]" />
      <div className="auth-aurora-2 absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-[0.12] bottom-[-5%] left-[-5%]" />
      <div className="auth-aurora-3 absolute w-[400px] h-[400px] rounded-full blur-[110px] opacity-[0.10] top-[40%] left-[30%]" />

      {/* Star Field */}
      {mounted &&
        Array.from({ length: 40 }).map((_, i) => (
          <div
            key={`star-${i}`}
            className="auth-star absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2.5 + 0.5,
              height: Math.random() * 2.5 + 0.5,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 4}s`,
            }}
          />
        ))}

      {/* Particles */}
      {mounted &&
        Array.from({ length: 12 }).map((_, i) => (
          <div
            key={`particle-${i}`}
            className="auth-bg-particle"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              left: `${Math.random() * 100}%`,
              animationDuration: `${8 + Math.random() * 14}s`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}

      {/* Floating Rings */}
      <div className="auth-ring-1 absolute top-[15%] right-[12%] w-[140px] h-[140px] rounded-full border border-white/[0.04]" />
      <div className="auth-ring-2 absolute bottom-[18%] left-[8%] w-[100px] h-[100px] rounded-full border border-primary/[0.12]" />
      <div className="auth-ring-3 absolute top-[60%] right-[30%] w-[60px] h-[60px] rounded-full border border-white/[0.03]" />

      {/* Floating Hexagons */}
      <svg className="auth-hex-1 absolute top-[22%] left-[15%] w-12 h-12 opacity-[0.04]" viewBox="0 0 100 100">
        <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="white" strokeWidth="2" />
      </svg>
      <svg className="auth-hex-2 absolute bottom-[25%] right-[18%] w-8 h-8 opacity-[0.06]" viewBox="0 0 100 100">
        <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="currentColor" className="text-primary" strokeWidth="3" />
      </svg>

      {/* Light Beam */}
      <div
        className="absolute top-0 left-1/2 w-[2px] h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent"
        style={{ animation: 'beamSweep 7s ease-in-out infinite' }}
      />
    </div>
  );
};

'use client';

import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <style>{`
        /* ===== Aurora Animations ===== */
        .auth-aurora-1 {
          background: radial-gradient(circle, rgba(139,123,245,0.5) 0%, transparent 70%);
          animation: auroraMove1 8s ease-in-out infinite;
        }
        .auth-aurora-2 {
          background: radial-gradient(circle, rgba(99,82,210,0.45) 0%, transparent 70%);
          animation: auroraMove2 10s ease-in-out infinite;
        }
        .auth-aurora-3 {
          background: radial-gradient(circle, rgba(168,155,255,0.35) 0%, transparent 70%);
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

        /* ===== Pulse Dot ===== */
        .auth-pulse-dot {
          animation: pulseDot 2s ease-in-out infinite;
          box-shadow: 0 0 6px rgba(139,123,245,0.5);
        }
        @keyframes pulseDot {
          0%, 100% { box-shadow: 0 0 4px rgba(139,123,245,0.3); transform: scale(1); }
          50% { box-shadow: 0 0 12px rgba(139,123,245,0.7); transform: scale(1.2); }
        }

        /* ===== Card Border Glow ===== */
        .auth-card-glow { position: relative; }
        .auth-card-glow::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 1.25rem;
          padding: 1px;
          background: linear-gradient(
            var(--auth-glow-angle, 0deg),
            transparent 20%,
            rgba(139,123,245,0.35) 50%,
            transparent 80%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: glowRotate 4s linear infinite;
          pointer-events: none;
        }
        @keyframes glowRotate { to { --auth-glow-angle: 360deg; } }
        @property --auth-glow-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        /* ===== Form Entrance ===== */
        .auth-form-enter {
          animation: formFadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes formFadeIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ===== Input Glow Focus ===== */
        .auth-input-glow {
          transition: box-shadow 0.3s ease, border-color 0.3s ease, background-color 0.3s ease;
        }
        .auth-input-glow:focus-within {
          box-shadow: 0 0 0 3px rgba(139,123,245,0.12), 0 0 24px -4px rgba(139,123,245,0.2);
        }

        /* ===== Button Shine ===== */
        .auth-btn-shine { position: relative; overflow: hidden; }
        .auth-btn-shine::after {
          content: '';
          position: absolute;
          top: -50%; left: -60%;
          width: 30%; height: 200%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transform: rotate(25deg);
          animation: btnShine 4s ease-in-out infinite;
        }
        @keyframes btnShine {
          0%, 100% { left: -60%; }
          50% { left: 130%; }
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

      <div className="w-full min-h-screen bg-[#06060a] flex items-center justify-center p-4 font-[system-ui,-apple-system,'Segoe_UI',Inter,sans-serif] relative overflow-hidden">

        {/* ===== FULL-SCREEN BACKGROUND EFFECTS ===== */}

        {/* Aurora blobs */}
        <div className="auth-aurora-1 absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.15] top-[-10%] right-[-5%] pointer-events-none" />
        <div className="auth-aurora-2 absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-[0.12] bottom-[-5%] left-[-5%] pointer-events-none" />
        <div className="auth-aurora-3 absolute w-[400px] h-[400px] rounded-full blur-[110px] opacity-[0.10] top-[40%] left-[30%] pointer-events-none" />

        {/* Star field */}
        {mounted && Array.from({ length: 50 }).map((_, i) => (
          <div
            key={`star-${i}`}
            className="auth-star absolute rounded-full bg-white pointer-events-none"
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

        {/* Rising particles */}
        {mounted && Array.from({ length: 15 }).map((_, i) => (
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

        {/* Floating rings */}
        <div className="auth-ring-1 absolute top-[15%] right-[12%] w-[140px] h-[140px] rounded-full border border-white/[0.04] pointer-events-none" />
        <div className="auth-ring-2 absolute bottom-[18%] left-[8%] w-[100px] h-[100px] rounded-full border border-[#8b7bf5]/[0.08] pointer-events-none" />
        <div className="auth-ring-3 absolute top-[60%] right-[30%] w-[60px] h-[60px] rounded-full border border-white/[0.03] pointer-events-none" />

        {/* Floating hexagons */}
        <svg className="auth-hex-1 absolute top-[22%] left-[15%] w-12 h-12 opacity-[0.04] pointer-events-none" viewBox="0 0 100 100">
          <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="white" strokeWidth="2"/>
        </svg>
        <svg className="auth-hex-2 absolute bottom-[25%] right-[18%] w-8 h-8 opacity-[0.05] pointer-events-none" viewBox="0 0 100 100">
          <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke="#8b7bf5" strokeWidth="3"/>
        </svg>

        {/* Light beam */}
        <div
          className="absolute top-0 left-1/2 w-[2px] h-full bg-gradient-to-b from-transparent via-[#8b7bf5]/10 to-transparent pointer-events-none"
          style={{ animation: 'beamSweep 7s ease-in-out infinite' }}
        />

        {/* Perspective grid floor */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[40%] opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139,123,245,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139,123,245,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transform: 'perspective(500px) rotateX(45deg)',
            transformOrigin: 'center bottom',
            maskImage: 'linear-gradient(to top, white 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, white 0%, transparent 100%)',
          }}
        />

        {/* ===== FORM CARD ===== */}
        <main className="auth-card-glow auth-form-enter relative z-10 w-full max-w-[420px] bg-[#0c0c14]/80 rounded-2xl overflow-hidden shadow-[0_0_80px_-12px_rgba(139,123,245,0.12),0_30px_60px_-15px_rgba(0,0,0,0.6)] border border-white/[0.06] backdrop-blur-xl">
          <div className="p-8 sm:p-10 flex flex-col">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#8b7bf5] to-[#6a5cd4] flex items-center justify-center shadow-[0_4px_20px_rgba(139,123,245,0.4)]">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#8b7bf5] to-[#6a5cd4] animate-pulse opacity-40 blur-sm" />
                <svg className="relative z-10" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fillOpacity="0.9"/>
                  <path d="M2 17L12 22L22 17" stroke="white" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="white" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-[15px] font-bold text-white/90 tracking-tight">ChanomHub</span>
            </div>

            {children}
          </div>
        </main>
      </div>
    </>
  );
};

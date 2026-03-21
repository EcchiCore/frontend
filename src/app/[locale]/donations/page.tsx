import { getTranslations } from "next-intl/server";
import { generatePageMetadata } from "@/utils/metadataUtils";
import { locales } from "@/app/[locale]/lib/navigation";
import { Heart, Trophy, CreditCard, Sparkles, Star, Zap } from "lucide-react";

export async function generateMetadata({ params }: { params: { locale?: string } }) {
  const locale = (params?.locale || "th") as (typeof locales)[number];
  return generatePageMetadata({
    locale,
    title: "สนับสนุนเรา | ChanomHub",
    description: "ร่วมสนับสนุน ChanomHub เพื่อช่วยให้เราพัฒนาชุมชนและเซิร์ฟเวอร์ต่อไป",
    contentPath: "donations",
  });
}

export default async function DonationsPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');

        .donations-page {
          font-family: 'Noto Sans Thai', sans-serif;
          background: #0a0a0f;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        /* ─── Background aurora mesh ─── */
        .aurora-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .aurora-bg::before {
          content: '';
          position: absolute;
          top: -30%;
          left: -20%;
          width: 70%;
          height: 70%;
          background: radial-gradient(ellipse, rgba(234,179,8,0.08) 0%, transparent 60%);
          animation: aurora-drift 14s ease-in-out infinite alternate;
        }
        .aurora-bg::after {
          content: '';
          position: absolute;
          bottom: -20%;
          right: -10%;
          width: 60%;
          height: 60%;
          background: radial-gradient(ellipse, rgba(249,115,22,0.07) 0%, transparent 60%);
          animation: aurora-drift 18s ease-in-out infinite alternate-reverse;
        }
        @keyframes aurora-drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(5%, 8%) scale(1.12); }
        }

        /* Grid overlay */
        .grid-overlay {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
        }

        .page-content {
          position: relative;
          z-index: 1;
        }

        /* ─── Hero section ─── */
        .hero {
          text-align: center;
          padding: 72px 0 56px;
          animation: fade-up 0.7s ease both;
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 18px;
          border-radius: 999px;
          border: 1px solid rgba(234,179,8,0.35);
          background: rgba(234,179,8,0.08);
          color: #fbbf24;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.05em;
          margin-bottom: 28px;
          backdrop-filter: blur(8px);
        }

        .hero-icon-ring {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          margin-bottom: 28px;
        }
        .hero-icon-ring::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, #f59e0b, #f97316, #ef4444, #f59e0b);
          animation: spin 4s linear infinite;
          z-index: 0;
        }
        .hero-icon-ring::after {
          content: '';
          position: absolute;
          inset: 2px;
          border-radius: 50%;
          background: #0a0a0f;
          z-index: 1;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .hero-icon-inner {
          position: relative;
          z-index: 2;
          color: #f59e0b;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-title {
          font-family: 'Playfair Display', 'Noto Sans Thai', serif;
          font-size: clamp(2.2rem, 5vw, 3.4rem);
          font-weight: 800;
          color: #f8f8f2;
          line-height: 1.15;
          margin-bottom: 18px;
          letter-spacing: -0.01em;
        }
        .hero-title .brand {
          background: linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-desc {
          color: #a1a1aa;
          max-width: 580px;
          margin: 0 auto;
          font-size: 16px;
          line-height: 1.7;
          font-weight: 400;
        }

        /* ─── Feature cards ─── */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
          margin-bottom: 52px;
          animation: fade-up 0.7s 0.15s ease both;
        }

        .feature-card {
          position: relative;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 28px 24px;
          text-align: center;
          overflow: hidden;
          transition: transform 0.3s ease, border-color 0.3s ease, background 0.3s ease;
          backdrop-filter: blur(12px);
        }
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(234,179,8,0.5), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-6px);
          border-color: rgba(234,179,8,0.25);
          background: rgba(234,179,8,0.04);
        }
        .feature-card:hover::before { opacity: 1; }

        .feature-card:nth-child(2) { transition-delay: 0.05s; }
        .feature-card:nth-child(3) { transition-delay: 0.1s; }

        .card-icon-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: 14px;
          margin-bottom: 16px;
        }
        .card-icon-wrap.gold   { background: rgba(234,179,8,0.12);  color: #fbbf24; }
        .card-icon-wrap.orange { background: rgba(249,115,22,0.12); color: #fb923c; }
        .card-icon-wrap.rose   { background: rgba(239,68,68,0.12);  color: #f87171; }

        .card-title {
          font-size: 15px;
          font-weight: 700;
          color: #e4e4e7;
          margin-bottom: 8px;
        }
        .card-desc {
          font-size: 13.5px;
          color: #71717a;
          line-height: 1.65;
        }

        /* ─── Leaderboard section ─── */
        .leaderboard-wrap {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          overflow: hidden;
          animation: fade-up 0.7s 0.25s ease both;
        }

        .leaderboard-header {
          padding: 22px 28px;
          background: rgba(234,179,8,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .leaderboard-header-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(234,179,8,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fbbf24;
          flex-shrink: 0;
        }
        .leaderboard-title {
          font-size: 18px;
          font-weight: 700;
          color: #f4f4f5;
        }
        .leaderboard-subtitle {
          font-size: 13px;
          color: #71717a;
          margin-top: 1px;
        }
        .live-dot {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-left: auto;
          font-size: 12px;
          color: #4ade80;
          font-weight: 600;
        }
        .live-dot span {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #4ade80;
          animation: pulse-dot 1.6s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(74,222,128,0.5); }
          50%       { opacity: 0.7; box-shadow: 0 0 0 5px rgba(74,222,128,0); }
        }

        .iframe-container {
          background: #fff;
        }
        :global(.dark) .iframe-container,
        .iframe-container {
          background: white;
        }

        /* ─── CTA section ─── */
        .cta-section {
          margin-top: 48px;
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          padding: 56px 32px;
          text-align: center;
          animation: fade-up 0.7s 0.35s ease both;
        }
        .cta-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(234,179,8,0.08) 0%, rgba(249,115,22,0.06) 50%, rgba(239,68,68,0.04) 100%);
        }
        .cta-section::after {
          content: '';
          position: absolute;
          inset: 0;
          border: 1px solid;
          border-image: linear-gradient(135deg, rgba(234,179,8,0.3), rgba(249,115,22,0.2), rgba(234,179,8,0.1)) 1;
          border-radius: 24px;
        }
        .cta-inner {
          position: relative;
          z-index: 1;
        }
        .cta-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #f59e0b;
          margin-bottom: 16px;
        }
        .cta-title {
          font-family: 'Playfair Display', 'Noto Sans Thai', serif;
          font-size: clamp(1.5rem, 3.5vw, 2.2rem);
          font-weight: 800;
          color: #f8f8f2;
          margin-bottom: 14px;
        }
        .cta-desc {
          color: #a1a1aa;
          font-size: 15px;
          margin-bottom: 32px;
          line-height: 1.65;
        }

        .cta-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          height: 52px;
          padding: 0 36px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Noto Sans Thai', sans-serif;
          color: #0a0a0f;
          background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          box-shadow: 0 4px 24px rgba(245,158,11,0.35), 0 0 0 0 rgba(245,158,11,0);
          overflow: hidden;
        }
        .cta-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%);
          border-radius: inherit;
        }
        .cta-btn:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 8px 36px rgba(245,158,11,0.5), 0 0 0 4px rgba(245,158,11,0.1);
        }
        .cta-btn:active { transform: translateY(-1px) scale(1.01); }

        .cta-note {
          margin-top: 16px;
          font-size: 12.5px;
          color: #52525b;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        /* ─── Floating particles ─── */
        .particles {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: rgba(234,179,8,0.6);
          animation: float-up linear infinite;
        }
        .particle:nth-child(1)  { left: 10%; animation-duration: 12s; animation-delay: 0s;   width: 3px; height: 3px; }
        .particle:nth-child(2)  { left: 20%; animation-duration: 16s; animation-delay: 2s;   }
        .particle:nth-child(3)  { left: 35%; animation-duration: 11s; animation-delay: 5s;   background: rgba(249,115,22,0.5); }
        .particle:nth-child(4)  { left: 50%; animation-duration: 18s; animation-delay: 1s;   width: 3px; height: 3px; }
        .particle:nth-child(5)  { left: 65%; animation-duration: 13s; animation-delay: 7s;   background: rgba(239,68,68,0.4); }
        .particle:nth-child(6)  { left: 75%; animation-duration: 15s; animation-delay: 4s;   }
        .particle:nth-child(7)  { left: 85%; animation-duration: 10s; animation-delay: 3s;   background: rgba(249,115,22,0.6); }
        .particle:nth-child(8)  { left: 92%; animation-duration: 20s; animation-delay: 9s;   width: 3px; height: 3px; }
        @keyframes float-up {
          0%   { transform: translateY(100vh) scale(0); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(-10vh) scale(1); opacity: 0; }
        }

        /* ─── Utility ─── */
        .container {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .mb-12 { margin-bottom: 48px; }
        .mt-12 { margin-top: 48px; }
      `}</style>


      <div className="donations-page">
        {/* Background layers */}
        <div className="aurora-bg" />
        <div className="grid-overlay" />
        <div className="particles">
          {[...Array(8)].map((_, i) => <div key={i} className="particle" />)}
        </div>

        <div className="page-content">
          {/* ── CTA ── */}
          <div className="cta-section">
            <div className="cta-inner">
              <div className="cta-eyebrow">
                <Zap size={13} />
                ร่วมเป็นส่วนหนึ่งของเรา
              </div>
              <h2 className="cta-title">ต้องการสนับสนุนเราตอนนี้?</h2>
              <p className="cta-desc">
                คลิกปุ่มด้านล่างเพื่อไปยังหน้าชำระเงินของ EasyDonate<br />
                ทุกการสนับสนุนมีความหมายสำหรับเรา 🙏
              </p>

              <a
                href="https://ezdn.app/crypticday"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-btn"
              >
                <Heart size={17} fill="currentColor" />
                ไปที่หน้าโดเนท
              </a>

              <div className="cta-note">
                <Star size={12} fill="currentColor" style={{ color: '#f59e0b' }} />
                ปลอดภัย · ผ่าน EasyDonate · ทุกช่องทางชำระเงิน
              </div>
            </div>
          </div>

          <main className="container">

            {/* ── Hero ── */}
            <section className="hero">
              <div className="hero-badge">
                <Sparkles size={13} />
                ร่วมสนับสนุนชุมชน ChanomHub
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
                <div className="hero-icon-ring">
                  <div className="hero-icon-inner">
                    <Heart size={30} fill="currentColor" />
                  </div>
                </div>
              </div>

              <h1 className="hero-title">
                สนับสนุน Chanom<span className="brand">Hub</span>
              </h1>
              <p className="hero-desc">
                การสนับสนุนของคุณช่วยให้เราสามารถรักษาเซิร์ฟเวอร์ พัฒนาฟีเจอร์ใหม่ๆ
                และสร้างชุมชนที่ดีขึ้นสำหรับทุกคน ขอบคุณที่ร่วมเป็นส่วนหนึ่งของเรา
              </p>
            </section>

            {/* ── Feature cards ── */}
            <div className="cards-grid">
              <div className="feature-card">
                <div className="card-icon-wrap gold">
                  <CreditCard size={22} />
                </div>
                <div className="card-title">ช่องทางสะดวก</div>
                <div className="card-desc">รองรับ TrueMoney, PromptPay และโอนเงินผ่านธนาคารทุกแห่ง</div>
              </div>

              <div className="feature-card">
                <div className="card-icon-wrap orange">
                  <Trophy size={22} />
                </div>
                <div className="card-title">ขึ้นบอร์ดจัดอันดับ</div>
                <div className="card-desc">ชื่อของคุณจะปรากฏบนบอร์ดผู้สนับสนุนในหน้านี้และหน้าแรก</div>
              </div>

              <div className="feature-card">
                <div className="card-icon-wrap rose">
                  <Heart size={22} />
                </div>
                <div className="card-title">สนับสนุนชุมชน</div>
                <div className="card-desc">ทุกบาทนำไปใช้เพื่อค่าเช่าเซิร์ฟเวอร์และการพัฒนาเว็บไซต์</div>
              </div>
            </div>

            {/* ── Leaderboard ── */}
            <div className="leaderboard-wrap mb-12">
              <div className="leaderboard-header">
                <div className="leaderboard-header-icon">
                  <Trophy size={18} />
                </div>
                <div>
                  <div className="leaderboard-title">อันดับผู้สนับสนุนสูงสุด</div>
                  <div className="leaderboard-subtitle">ขอบคุณทุกท่านที่ร่วมสนับสนุน</div>
                </div>
                <div className="live-dot">
                  <span />
                  Live
                </div>
              </div>

              <div className="iframe-container">
                <iframe
                  src="/api/donation-proxy?w=leaderboard&u=c140txkndfjhrrdjh4vea8yi&t=30a1b480ba003411401c9271cc4983c4"
                  width="100%"
                  height="1000"
                  style={{ border: 'none', display: 'block' }}
                  allow="transparency"
                />
              </div>
            </div>



            <div style={{ height: '64px' }} />
          </main>
        </div>
      </div>
    </>
  );
}
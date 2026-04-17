'use client';

import { useEffect, useRef } from 'react';

export default function Footer() {
    const yearRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (yearRef.current) {
            yearRef.current.textContent = String(new Date().getFullYear());
        }
    }, []);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;1,9..40,300&display=swap');

                .ch-footer {
                    --red: #C8102E;
                    --red-dim: #7a0a1b;
                    --cream: #F2EDE6;
                    --ink: #0e0d0b;
                    --muted: rgba(242,237,230,0.38);
                    --border: rgba(242,237,230,0.12);
                    background: var(--ink);
                    color: var(--cream);
                    font-family: 'DM Sans', sans-serif;
                    position: relative;
                    overflow: hidden;
                }

                .ch-footer__slash {
                    position: absolute;
                    top: -60px;
                    right: -40px;
                    width: 420px;
                    height: 420px;
                    border: 1px solid var(--border);
                    border-radius: 50%;
                    pointer-events: none;
                }
                .ch-footer__slash::before {
                    content: '';
                    position: absolute;
                    inset: 40px;
                    border: 1px solid var(--border);
                    border-radius: 50%;
                }

                .ch-footer__top {
                    border-bottom: 1px solid var(--border);
                    padding: 3rem 2.5rem 0;
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 0;
                }

                @media (max-width: 768px) {
                    .ch-footer__top {
                        grid-template-columns: 1fr;
                        padding: 2rem 1.5rem 0;
                    }
                }

                .ch-footer__brand {
                    border-right: 1px solid var(--border);
                    padding-right: 2.5rem;
                    padding-bottom: 3rem;
                }

                @media (max-width: 768px) {
                    .ch-footer__brand {
                        border-right: none;
                        border-bottom: 1px solid var(--border);
                        padding-right: 0;
                        padding-bottom: 2rem;
                        margin-bottom: 2rem;
                    }
                }

                .ch-footer__logo {
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: clamp(3rem, 6vw, 5rem);
                    line-height: 0.9;
                    letter-spacing: 0.02em;
                    color: var(--cream);
                    display: block;
                    margin-bottom: 1rem;
                }

                .ch-footer__logo span {
                    color: var(--red);
                }

                .ch-footer__tagline {
                    font-size: 0.75rem;
                    letter-spacing: 0.16em;
                    text-transform: uppercase;
                    color: var(--muted);
                    font-weight: 300;
                    margin-bottom: 1.75rem;
                }

                .ch-footer__desc {
                    font-size: 0.8125rem;
                    line-height: 1.7;
                    color: var(--muted);
                    font-weight: 300;
                    font-style: italic;
                    max-width: 28ch;
                }

                .ch-footer__badge-row {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 1.75rem;
                    flex-wrap: wrap;
                }

                .ch-footer__badge {
                    font-size: 0.65rem;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    padding: 0.3rem 0.65rem;
                    border: 1px solid var(--border);
                    color: var(--muted);
                    font-weight: 300;
                }

                .ch-footer__badge--live {
                    border-color: var(--red-dim);
                    color: var(--red);
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                }

                .ch-footer__badge--live::before {
                    content: '';
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background: var(--red);
                    animation: pulse 2s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }

                .ch-footer__nav-col {
                    padding: 0 2.5rem 3rem;
                    border-right: 1px solid var(--border);
                }

                .ch-footer__nav-col:last-child {
                    border-right: none;
                    padding-right: 0;
                }

                @media (max-width: 768px) {
                    .ch-footer__nav-col {
                        border-right: none;
                        border-bottom: 1px solid var(--border);
                        padding: 1.5rem 0;
                    }
                    .ch-footer__nav-col:last-child {
                        border-bottom: none;
                    }
                }

                .ch-footer__nav-label {
                    font-size: 0.65rem;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: var(--red);
                    font-weight: 400;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                }

                .ch-footer__nav-label::before {
                    content: '';
                    width: 18px;
                    height: 1px;
                    background: var(--red);
                    display: block;
                }

                .ch-footer__nav-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                }

                .ch-footer__nav-list li {
                    border-bottom: 1px solid var(--border);
                }

                .ch-footer__nav-list li:last-child {
                    border-bottom: none;
                }

                .ch-footer__nav-list a {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem 0;
                    font-size: 0.875rem;
                    color: var(--cream);
                    text-decoration: none;
                    font-weight: 300;
                    transition: color 0.2s, padding-left 0.2s;
                    letter-spacing: 0.01em;
                }

                .ch-footer__nav-list a:hover {
                    color: var(--red);
                    padding-left: 0.4rem;
                }

                .ch-footer__nav-list a .arrow {
                    font-size: 0.7rem;
                    opacity: 0;
                    transform: translateX(-4px);
                    transition: opacity 0.2s, transform 0.2s;
                    color: var(--red);
                }

                .ch-footer__nav-list a:hover .arrow {
                    opacity: 1;
                    transform: translateX(0);
                }

                .ch-footer__nav-list a .ext-icon {
                    font-size: 0.65rem;
                    opacity: 0.4;
                    color: var(--cream);
                }

                .ch-footer__bottom {
                    padding: 1.25rem 2.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                @media (max-width: 768px) {
                    .ch-footer__bottom {
                        padding: 1.25rem 1.5rem;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.75rem;
                    }
                }

                .ch-footer__copy {
                    font-size: 0.72rem;
                    color: var(--muted);
                    font-weight: 300;
                    letter-spacing: 0.04em;
                }

                .ch-footer__copy strong {
                    font-weight: 400;
                    color: var(--cream);
                }

                .ch-footer__right {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .ch-footer__age-gate {
                    font-family: 'Bebas Neue', sans-serif;
                    font-size: 1.1rem;
                    letter-spacing: 0.08em;
                    color: var(--red);
                    border: 1px solid var(--red-dim);
                    padding: 0.15rem 0.55rem;
                    line-height: 1;
                }

                .ch-footer__dmca {
                    opacity: 0.45;
                    transition: opacity 0.2s;
                    display: block;
                }

                .ch-footer__dmca:hover {
                    opacity: 0.85;
                }

                .ch-footer__dmca img {
                    height: 28px;
                    width: auto;
                    display: block;
                    filter: grayscale(1) brightness(1.8);
                }
            `}</style>

            <footer className="ch-footer">
                <div className="ch-footer__slash" aria-hidden="true" />

                <div className="ch-footer__top">
                    {/* Brand */}
                    <div className="ch-footer__brand">
                        <span className="ch-footer__logo">
                            Chanom<span>Hub</span>
                        </span>
                        <p className="ch-footer__tagline">H-Games &amp; Adult Gaming Community</p>
                        <p className="ch-footer__desc">
                            ชุมชนเกม H และเกมผู้ใหญ่ 18+ ครบครันที่สุด — ดาวน์โหลด, รีวิว, แปลไทย อัปเดตทุกวัน
                        </p>
                        <div className="ch-footer__badge-row">
                            <span className="ch-footer__badge ch-footer__badge--live">Daily Updates</span>
                            <span className="ch-footer__badge">18+</span>
                            <span className="ch-footer__badge">Members Only</span>
                        </div>
                    </div>

                    {/* Column 1 */}
                    <nav className="ch-footer__nav-col" aria-label="เกี่ยวกับเรา">
                        <p className="ch-footer__nav-label">เกี่ยวกับเรา</p>
                        <ul className="ch-footer__nav-list">
                            <li>
                                <a href="/privacy-policy">
                                    <span>นโยบายความเป็นส่วนตัว</span>
                                    <span className="arrow">→</span>
                                </a>
                            </li>
                            <li>
                                <a href="https://docs.chanomhub.com">
                                    <span>เอกสารต่างๆ</span>
                                    <span className="arrow">→</span>
                                </a>
                            </li>
                            <li>
                                <a href="#">
                                    <span>ติดต่อ</span>
                                    <span className="arrow">→</span>
                                </a>
                            </li>
                        </ul>
                    </nav>

                    {/* Column 2 */}
                    <nav className="ch-footer__nav-col" aria-label="Quick Links">
                        <p className="ch-footer__nav-label">Quick Links</p>
                        <ul className="ch-footer__nav-list">
                            <li>
                                <a href="/games">
                                    <span>Latest Games</span>
                                    <span className="arrow">→</span>
                                </a>
                            </li>
                            <li>
                                <a href="https://linktr.ee/CrypticDay">
                                    <span>Community</span>
                                    <span className="arrow">→</span>
                                </a>
                            </li>
                            <li>
                                <a href="#">
                                    <span>Support (Closed)</span>
                                    <span className="arrow">→</span>
                                </a>
                            </li>
                            <li>
                                <a href="https://theporndude.com/th" target="_blank" rel="nofollow noopener noreferrer">
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <img
                                            src="https://www.google.com/s2/favicons?domain=theporndude.com&sz=32"
                                            alt=""
                                            aria-hidden="true"
                                            width={14}
                                            height={14}
                                            style={{ borderRadius: '2px', opacity: 0.7, transition: 'opacity 0.2s' }}
                                        />
                                        ThePornDude
                                    </span>
                                    <span className="ext-icon">↗</span>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>

                {/* Bottom bar */}
                <div className="ch-footer__bottom">
                    <p className="ch-footer__copy">
                        &copy; <span ref={yearRef} /> <strong>ChanomHub</strong>. All rights reserved. — สงวนลิขสิทธิ์
                    </p>
                    <div className="ch-footer__right">
                        <span className="ch-footer__age-gate">18+</span>
                        <a
                            href="https://www.dmca.com/compliance/chanomhub.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ch-footer__dmca"
                            title="DMCA Compliance"
                        >
                            <img
                                src="https://www.dmca.com/img/dmca-compliant-grayscale.png"
                                alt="DMCA compliant"
                                width={100}
                                height={28}
                            />
                        </a>
                    </div>
                </div>
            </footer>
        </>
    );
}
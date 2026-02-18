// Server Component — no client interactivity needed
import { Sparkles, Heart, Star, Zap } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="relative mt-0 border-t border-border/40 bg-background backdrop-blur-xl overflow-hidden">
            {/* Enhanced Ambient Background Effects */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-pulse"></div>

            {/* Floating orbs with animation */}
            <div className="absolute -top-[150px] left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none animate-pulse"></div>
            <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-0 left-1/2 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none"></div>

            <div className="container mx-auto px-4 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    {/* Enhanced Brand Section */}
                    <div className="col-span-1 md:col-span-5 space-y-6">
                        {/* Logo with glow effect */}
                        <div className="inline-flex items-center gap-3 group cursor-pointer">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                                <h2 className="relative text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                                    ChanomHub
                                </h2>
                            </div>
                            <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                        </div>

                        {/* Subtitle with icon */}
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-primary animate-pulse" />
                            <h3 className="text-sm font-semibold text-foreground/90 tracking-wide">
                                ชุมชนเกม H และเกมผู้ใหญ่ 18+
                            </h3>
                        </div>

                        {/* Enhanced description with backdrop */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="relative text-sm text-muted-foreground leading-relaxed max-w-md p-4 rounded-xl bg-card/30 backdrop-blur-sm border border-border/20 hover:border-border/40 transition-all">
                                ChanomHub คือศูนย์รวมเกม H (H-Games) และเกมผู้ใหญ่ (Adult Games) ที่ครบครันที่สุด
                                เราให้บริการพื้นที่สำหรับดาวน์โหลดเกม H แปลไทย แลกเปลี่ยนบทสรุป รีวิวเกม 18+
                                และพูดคุยเกี่ยวกับ Visual Novel, RPG Maker และเกมโป๊หลากหลายแนว
                                อัปเดตเกมใหม่ทุกวัน พร้อมระบบสมาชิกที่ปลอดภัยและเป็นส่วนตัว
                            </p>
                        </div>

                        {/* Stats or badges */}
                        <div className="flex items-center gap-4 pt-2">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                                <Heart className="w-3.5 h-3.5 text-primary animate-pulse" />
                                <span className="text-xs font-medium text-primary">Active Community</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 backdrop-blur-sm">
                                <Zap className="w-3.5 h-3.5 text-accent" />
                                <span className="text-xs font-medium text-accent">Daily Updates</span>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Navigation Section */}
                    <div className="col-span-1 md:col-span-7 flex flex-col md:flex-row justify-end gap-12 md:gap-16">
                        <div className="space-y-5">
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded blur-md"></div>
                                <h4 className="relative text-sm font-bold text-foreground tracking-wider uppercase flex items-center gap-2">
                                    <span className="w-1 h-4 bg-gradient-to-b from-primary to-accent rounded-full"></span>
                                    เกี่ยวกับเรา
                                </h4>
                            </div>
                            <ul className="space-y-3.5 text-sm">
                                <li>
                                    <a href="#" className="group flex items-center gap-3 text-muted-foreground hover:text-primary transition-all">
                                        <span className="relative flex items-center justify-center w-6 h-6">
                                            <span className="absolute w-full h-full rounded-full bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all"></span>
                                            <span className="relative w-2 h-2 rounded-full bg-primary/30 group-hover:bg-primary transition-colors"></span>
                                        </span>
                                        <span className="group-hover:translate-x-0.5 transition-transform">นโยบายความเป็นส่วนตัว</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="group flex items-center gap-3 text-muted-foreground hover:text-primary transition-all">
                                        <span className="relative flex items-center justify-center w-6 h-6">
                                            <span className="absolute w-full h-full rounded-full bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all"></span>
                                            <span className="relative w-2 h-2 rounded-full bg-primary/30 group-hover:bg-primary transition-colors"></span>
                                        </span>
                                        <span className="group-hover:translate-x-0.5 transition-transform">เงื่อนไขการใช้งาน</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="group flex items-center gap-3 text-muted-foreground hover:text-primary transition-all">
                                        <span className="relative flex items-center justify-center w-6 h-6">
                                            <span className="absolute w-full h-full rounded-full bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all"></span>
                                            <span className="relative w-2 h-2 rounded-full bg-primary/30 group-hover:bg-primary transition-colors"></span>
                                        </span>
                                        <span className="group-hover:translate-x-0.5 transition-transform">ติดต่อลงโฆษณา</span>
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Additional Section - Social or Quick Links */}
                        <div className="space-y-5">
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent rounded blur-md"></div>
                                <h4 className="relative text-sm font-bold text-foreground tracking-wider uppercase flex items-center gap-2">
                                    <span className="w-1 h-4 bg-gradient-to-b from-accent to-primary rounded-full"></span>
                                    Quick Links
                                </h4>
                            </div>
                            <ul className="space-y-3.5 text-sm">
                                <li>
                                    <a href="#" className="group flex items-center gap-3 text-muted-foreground hover:text-accent transition-all">
                                        <span className="relative flex items-center justify-center w-6 h-6">
                                            <span className="absolute w-full h-full rounded-full bg-accent/10 group-hover:bg-accent/20 group-hover:scale-110 transition-all"></span>
                                            <span className="relative w-2 h-2 rounded-full bg-accent/30 group-hover:bg-accent transition-colors"></span>
                                        </span>
                                        <span className="group-hover:translate-x-0.5 transition-transform">Latest Games</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="group flex items-center gap-3 text-muted-foreground hover:text-accent transition-all">
                                        <span className="relative flex items-center justify-center w-6 h-6">
                                            <span className="absolute w-full h-full rounded-full bg-accent/10 group-hover:bg-accent/20 group-hover:scale-110 transition-all"></span>
                                            <span className="relative w-2 h-2 rounded-full bg-accent/30 group-hover:bg-accent transition-colors"></span>
                                        </span>
                                        <span className="group-hover:translate-x-0.5 transition-transform">Community</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="group flex items-center gap-3 text-muted-foreground hover:text-accent transition-all">
                                        <span className="relative flex items-center justify-center w-6 h-6">
                                            <span className="absolute w-full h-full rounded-full bg-accent/10 group-hover:bg-accent/20 group-hover:scale-110 transition-all"></span>
                                            <span className="relative w-2 h-2 rounded-full bg-accent/30 group-hover:bg-accent transition-colors"></span>
                                        </span>
                                        <span className="group-hover:translate-x-0.5 transition-transform">Support</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Enhanced Footer Bottom */}
                <div className="mt-16 pt-8 border-t border-border/40 relative">
                    {/* Decorative line with gradient */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex flex-col items-center md:items-start gap-2">
                            <p className="text-xs text-muted-foreground text-center md:text-left">
                                &copy; {new Date().getFullYear()} <span className="text-foreground font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ChanomHub</span>. All rights reserved.
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                                Made with <Heart className="w-3 h-3 inline-block text-primary animate-pulse" /> for the community
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <a
                                href="https://www.dmca.com/compliance/chanomhub.com"
                                title="DMCA Compliance information for chanomhub.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <img
                                    src="https://www.dmca.com/img/dmca-compliant-grayscale.png"
                                    alt="DMCA compliant image"
                                    width={100}
                                    height={50}
                                    className="relative opacity-60 group-hover:opacity-100 transition-all duration-300 grayscale group-hover:grayscale-0 group-hover:scale-105"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animated gradient line at bottom */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary via-accent to-primary animate-gradient bg-[length:200%_auto] opacity-30"></div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient {
                    animation: gradient 8s linear infinite;
                }
            `}} />
        </footer>
    );
}
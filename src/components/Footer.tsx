import { siteUrl } from '@/utils/localeUtils';
import Script from 'next/script';

export default function Footer() {
    return (
        <footer className="bg-muted/30 border-t border-border py-4 mt-8">
            <div className="container mx-auto px-2">
                {/* SEO Content */}
                <div className="mb-4 pb-4 border-b border-border/50">
                    <h2 className="text-sm font-semibold text-primary mb-2">ChanomHub - ชุมชนเกม H และเกมผู้ใหญ่ 18+</h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        ChanomHub คือศูนย์รวมเกม H (H-Games) และเกมผู้ใหญ่ (Adult Games) ที่ครบครันที่สุด
                        เราให้บริการพื้นที่สำหรับดาวน์โหลดเกม H แปลไทย แลกเปลี่ยนบทสรุป รีวิวเกม 18+
                        และพูดคุยเกี่ยวกับ Visual Novel, RPG Maker และเกมโป๊หลากหลายแนว
                        อัปเดตเกมใหม่ทุกวัน พร้อมระบบสมาชิกที่ปลอดภัยและเป็นส่วนตัว
                    </p>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-2">
                        <p>
                            &copy; {new Date().getFullYear()} <span className="text-primary font-semibold">ChanomHub</span>
                        </p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <a href="#" className="hover:text-primary transition-colors">นโยบาย</a>
                        <a href="#" className="hover:text-primary transition-colors">เงื่อนไข</a>
                        <a href="#" className="hover:text-primary transition-colors">ติดต่อ</a>

                        <div className="flex items-center">
                            <a
                                href="https://www.dmca.com/compliance/chanomhub.com"
                                title="DMCA Compliance information for chanomhub.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="dmca-badge"
                            >
                                <img
                                    src="https://www.dmca.com/img/dmca-compliant-grayscale.png"
                                    alt="DMCA compliant image"
                                    width={100}
                                    height={50}
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

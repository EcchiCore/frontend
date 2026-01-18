
import Link from 'next/link';
import { ArrowRight, Zap, Ghost, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PromotionsWidget() {
    return (
        <div className="space-y-4">

            {/* Title */}
            <div className="text-xs font-semibold px-1 flex items-center space-x-2 text-foreground">
                <div className="w-0.5 h-4 bg-primary"></div>
                <span>แนะนำจากทีมงาน</span>
            </div>

            {/* ChanoX2 Banner */}
            <Link href="/chanox2" className="block group relative overflow-hidden rounded-xl border border-indigo-500/20 bg-slate-900 transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-purple-900/20 to-slate-950/80 z-0" />
                <div className="relative z-10 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
                            <Layers className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                            Desktop
                        </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                        ChanoX2
                    </h3>
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                        โปรแกรมจัดการเกม H บน ChanoHub รองรับ Linux, MacOS, Windows
                    </p>
                    <div className="flex items-center text-xs text-indigo-300 font-medium group-hover:translate-x-1 transition-transform">
                        Learn more <ArrowRight className="w-3 h-3 ml-1" />
                    </div>
                </div>
            </Link>

            {/* ChanoLite Banner */}
            <Link href="/chanolite" className="block group relative overflow-hidden rounded-xl border border-emerald-500/20 bg-slate-900 transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-teal-900/20 to-slate-950/80 z-0" />
                <div className="relative z-10 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                            <Zap className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            Mobile
                        </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
                        ChanoLite
                    </h3>
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                        โปรแกรมจัดการเกม H บน ChanoHub รองรับ IOS, Android
                    </p>
                    <div className="flex items-center text-xs text-emerald-300 font-medium group-hover:translate-x-1 transition-transform">
                        Get it free <ArrowRight className="w-3 h-3 ml-1" />
                    </div>
                </div>
            </Link>

            {/* NST-Ghost Banner */}
            <Link href="/nst" className="block group relative overflow-hidden rounded-xl border border-orange-500/20 bg-slate-900 transition-all hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-900/30 via-red-900/10 to-slate-950/80 z-0" />
                <div className="relative z-10 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-300">
                            <Ghost className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                            Translate
                        </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1 group-hover:text-orange-300 transition-colors">
                        NST Ghost
                    </h3>
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                        โปรแกรมแปลเกมแบบครบวงจรพัฒนาโดย Chanomhub Community
                    </p>
                    <div className="flex items-center text-xs text-orange-300 font-medium group-hover:translate-x-1 transition-transform">
                        Download <ArrowRight className="w-3 h-3 ml-1" />
                    </div>
                </div>
            </Link>

        </div>
    );
}

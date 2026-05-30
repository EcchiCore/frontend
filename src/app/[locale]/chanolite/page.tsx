import { Link } from "@/i18n/navigation";
import { Github, Sparkles, Feather, Gauge } from 'lucide-react'
import DownloadSection from './DownloadSection'
import { getTranslations } from 'next-intl/server'

async function getReleases() {
    try {
        const res = await fetch('https://api.github.com/repos/Chanomhub/ChanoLite/releases', {
            next: { revalidate: 3600 }
        })
        if (!res.ok) throw new Error('Failed to fetch releases')
        return res.json()
    } catch (error) {
        console.error(error)
        return []
    }
}

export default async function ChanoLitePage() {
    const releases = await getReleases()
    const t = await getTranslations('ChanoLite')

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-emerald-500/20 overflow-x-hidden relative font-sans">
            
            {/* Minimal Subtle Center Top Gradient for shadcn touch */}
            <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-zinc-950/0 to-zinc-950/0 pointer-events-none" />
            
            <div className="container mx-auto px-6 relative z-10 pt-24 md:pt-32 pb-24">

                {/* --- THE MAIN DOWNLOAD DASHBOARD CONTROLS (INCLUDES STEAM-STYLE HERO SPLIT) --- */}
                <div className="mb-24">
                    <DownloadSection releases={releases} />
                </div>

                {/* --- FEATURE SHOWCASE SECTION --- */}
                <section className="max-w-5xl mx-auto border-t border-zinc-800/80 pt-20 mb-12">
                    <div className="flex flex-col items-center text-center space-y-3 mb-12">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800 text-xs font-medium font-sans">
                            <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                            Lite Edition Highlights
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-zinc-50 tracking-tight animate-fade-in">
                            {t('whyChoose')}
                        </h2>
                        <p className="text-xs text-zinc-400 max-w-md font-sans">
                            {t('whyChooseDesc')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Feature 1: Streamlined UI */}
                        <div className="p-6 rounded-xl bg-zinc-900/10 border border-zinc-800/80 hover:bg-zinc-900/20 transition-all duration-200 flex flex-col justify-between shadow-sm group">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                        <Feather className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-zinc-100 text-sm">{t('featureStreamlined')}</h3>
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed font-sans font-normal">
                                    {t('featureStreamlinedDesc')}
                                </p>
                                
                                {/* Inner screenshot mockup */}
                                <div className="relative mt-4 w-full rounded-lg overflow-hidden border border-zinc-800/80 bg-zinc-950 aspect-[16/10]">
                                    <img
                                        src="/ChanoLite/20251220_103641.png"
                                        alt="Streamlined UI screenshot"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium font-sans">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                Clean & lightweight layout
                            </div>
                        </div>

                        {/* Feature 2: High Performance */}
                        <div className="p-6 rounded-xl bg-zinc-900/10 border border-zinc-800/80 hover:bg-zinc-900/20 transition-all duration-200 flex flex-col justify-between shadow-sm group">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                                        <Gauge className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-zinc-100 text-sm">{t('featureEfficiency')}</h3>
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed font-sans font-normal">
                                    {t('featureEfficiencyDesc')}
                                </p>

                                {/* Inner screenshot mockup */}
                                <div className="relative mt-4 w-full rounded-lg overflow-hidden border border-zinc-800/80 bg-zinc-950 aspect-[16/10]">
                                    <img
                                        src="/ChanoLite/20251220_103644.png"
                                        alt="High efficiency screenshot"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium font-sans">
                                <Sparkles className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                                Optimized background resources
                            </div>
                        </div>

                    </div>
                </section>

                {/* --- FOOTER / COMMUNITY --- */}
                <section className="py-12 border-t border-zinc-900 bg-transparent text-center max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-500 font-medium">
                        <div className="flex items-center gap-1.5 font-sans">
                            <span>ChanoLite © {new Date().getFullYear()} • MIT Licensed Open Source</span>
                        </div>
                        <div className="flex items-center gap-4 font-sans font-medium">
                            <Link href="/chanox2" className="hover:text-zinc-200 transition-colors flex items-center gap-1">
                                <span>{t('goToChanoX2')}</span>
                            </Link>
                            <span>•</span>
                            <Link href="https://discord.gg/chanomhub" target="_blank" className="hover:text-zinc-200 transition-colors flex items-center gap-1">
                                <span>Discord</span>
                            </Link>
                            <span>•</span>
                            <Link href="https://github.com/Chanomhub/ChanoLite" target="_blank" className="hover:text-zinc-200 transition-colors flex items-center gap-1">
                                <Github className="w-3.5 h-3.5 text-zinc-600 hover:text-zinc-400 shrink-0" />
                                <span>GitHub</span>
                            </Link>
                        </div>
                    </div>
                </section>

            </div>

        </div>
    )
}

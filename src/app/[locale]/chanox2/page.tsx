import { Link } from "@/i18n/navigation";
import { Github, HelpCircle, Sparkles } from 'lucide-react'
import DownloadSection from './DownloadSection'
import { getTranslations } from 'next-intl/server'

// Custom Clean SVGs for Setup Guide Headers
const WindowsIcon = ({ className = "w-5 h-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.1zM10.95 1.95L24 0v11.55H10.95V1.95zM10.95 12.45H24v11.55l-13.05-1.95v-9.6z"/>
    </svg>
)

const AppleIcon = ({ className = "w-5 h-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39z"/>
    </svg>
)

const LinuxIcon = ({ className = "w-5 h-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.1-.19.161-.403.161-.624V17.5c-3.14-.645-3.83-1.88-3.83-1.88-.514-1.3-1.255-1.65-1.255-1.65-1.025-.7.078-.686.078-.686 1.134.08 1.73 1.16 1.73 1.16.826 1.414 2.167 1.005 2.695.77.084-.6.324-1.005.589-1.235-2.507-.285-5.14-1.255-5.14-5.58 0-1.23.44-2.24 1.16-3.03-.117-.285-.503-1.43.11-2.985 0 0 .947-.305 3.1 1.155.9-.25 1.86-.375 2.81-.38.95.005 1.91.13 2.81.38 2.153-1.46 3.1-1.155 3.1-1.155.615 1.555.228 2.7.111 2.985.723.79 1.16 1.799 1.16 3.03 0 4.335-2.637 5.29-5.15 5.57.405.35.765 1.04.765 2.1v3.12c0 .223.061.436.163.626C19.138 20.167 22 16.42 22 12c0-5.523-4.477-10-10-10z"/>
    </svg>
)

async function getReleases() {
    try {
        const res = await fetch('https://api.github.com/repos/Chanomhub/ChanoX2/releases', {
            next: { revalidate: 3600 }
        })
        if (!res.ok) throw new Error('Failed to fetch releases')
        return res.json()
    } catch (error) {
        console.error(error)
        return []
    }
}

export default async function ChanoX2Page() {
    const releases = await getReleases()
    const t = await getTranslations('ChanoX2')

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-zinc-800 overflow-x-hidden relative font-sans">
            
            {/* Minimal Subtle Center Top Gradient for shadcn touch */}
            <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950/0 to-zinc-950/0 pointer-events-none" />
            
            <div className="container mx-auto px-6 relative z-10 pt-24 md:pt-32 pb-24">

                {/* --- THE MAIN DOWNLOAD DASHBOARD CONTROLS (INCLUDES STEAM-STYLE HERO SPLIT) --- */}
                <div className="mb-24">
                    <DownloadSection releases={releases} />
                </div>

                {/* --- PLATFORM SETUP FAQ GUIDES --- */}
                <section className="max-w-5xl mx-auto border-t border-zinc-800/80 pt-20 mb-12">
                    <div className="flex flex-col items-center text-center space-y-3 mb-12">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800 text-xs font-medium font-sans">
                            <HelpCircle className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                            Getting Started FAQ
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-zinc-50 tracking-tight">
                            {t('platformGuides')}
                        </h2>
                        <p className="text-xs text-zinc-400 max-w-md font-sans">
                            {t('platformGuidesDesc')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        {/* Windows Setup FAQ */}
                        <div className="p-6 rounded-xl bg-zinc-900/10 border border-zinc-800/80 hover:bg-zinc-900/20 transition-all duration-200 flex flex-col justify-between shadow-sm">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <WindowsIcon className="w-4 h-4 text-zinc-300" />
                                    <h3 className="font-bold text-zinc-100 text-sm">{t('windowsGuideTitle')}</h3>
                                </div>
                                <ul className="text-xs text-zinc-400 space-y-3 pl-1 leading-relaxed font-sans font-normal">
                                    <li className="flex items-start gap-2.5 font-normal">
                                        <span className="font-bold text-zinc-400 font-mono">01</span>
                                        <span>{t('windowsGuideStep1')}</span>
                                    </li>
                                    <li className="flex items-start gap-2.5 font-normal">
                                        <span className="font-bold text-zinc-400 font-mono">02</span>
                                        <span>{t('windowsGuideStep2')}</span>
                                    </li>
                                    <li className="flex items-start gap-2.5 font-normal">
                                        <span className="font-bold text-zinc-400 font-mono">03</span>
                                        <span>{t('windowsGuideStep3')}</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium font-sans">
                                <Sparkles className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                Supports Windows 10 & 11
                            </div>
                        </div>

                        {/* macOS Setup FAQ */}
                        <div className="p-6 rounded-xl bg-zinc-900/10 border border-zinc-800/80 hover:bg-zinc-900/20 transition-all duration-200 flex flex-col justify-between shadow-sm">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <AppleIcon className="w-4 h-4 text-zinc-300" />
                                    <h3 className="font-bold text-zinc-100 text-sm">{t('macGuideTitle')}</h3>
                                </div>
                                <ul className="text-xs text-zinc-400 space-y-3 pl-1 leading-relaxed font-sans font-normal">
                                    <li className="flex items-start gap-2.5 font-normal">
                                        <span className="font-bold text-zinc-400 font-mono">01</span>
                                        <span>{t('macGuideStep1')}</span>
                                    </li>
                                    <li className="flex items-start gap-2.5 font-normal">
                                        <span className="font-bold text-zinc-400 font-mono">02</span>
                                        <span>{t('macGuideStep2')}</span>
                                    </li>
                                    <li className="flex items-start gap-2.5 font-normal">
                                        <span className="font-bold text-zinc-400 font-mono">03</span>
                                        <span>{t('macGuideStep3')}</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium font-sans">
                                <Sparkles className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                Apple Silicon Native (ARM64)
                            </div>
                        </div>

                        {/* Linux Setup FAQ */}
                        <div className="p-6 rounded-xl bg-zinc-900/10 border border-zinc-800/80 hover:bg-zinc-900/20 transition-all duration-200 flex flex-col justify-between shadow-sm">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <LinuxIcon className="w-4 h-4 text-zinc-300" />
                                    <h3 className="font-bold text-zinc-100 text-sm">{t('linuxGuideTitle')}</h3>
                                </div>
                                <ul className="text-xs text-zinc-400 space-y-3 pl-1 leading-relaxed font-sans font-normal">
                                    <li className="flex items-start gap-2.5 font-normal">
                                        <span className="font-bold text-zinc-400 font-mono">01</span>
                                        <span>{t('linuxGuideStep1')}</span>
                                    </li>
                                    <li className="flex items-start gap-2.5 font-normal">
                                        <span className="font-bold text-zinc-400 font-mono">02</span>
                                        <span>{t('linuxGuideStep2')}</span>
                                    </li>
                                    <li className="flex items-start gap-2.5 font-normal">
                                        <span className="font-bold text-zinc-400 font-mono">03</span>
                                        <span>{t('linuxGuideStep3')}</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium font-sans">
                                <Sparkles className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                AppImage, deb, rpm & flatpak support
                            </div>
                        </div>

                    </div>
                </section>

                {/* --- FOOTER / COMMUNITY --- */}
                <section className="py-12 border-t border-zinc-900 bg-transparent text-center max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-500 font-medium">
                        <div className="flex items-center gap-1.5 font-sans">
                            <span>ChanoX2 © {new Date().getFullYear()} • MIT Licensed Open Source</span>
                        </div>
                        <div className="flex items-center gap-4 font-sans">
                            <Link href="https://discord.gg/chanomhub" target="_blank" className="hover:text-zinc-200 transition-colors flex items-center gap-1">
                                <span>Discord</span>
                            </Link>
                            <span>•</span>
                            <Link href="https://github.com/Chanomhub/ChanoX2" target="_blank" className="hover:text-zinc-200 transition-colors flex items-center gap-1">
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


import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Zap, Shield, Globe, Star, Cpu, Layout, Github, MessageCircle, Feather, Gauge, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import DownloadSection from './DownloadSection'

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

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-emerald-500/30 overflow-x-hidden">

            {/* --- Hero Section --- */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Dynamic Background - Green/Slate for "Lite" */}
                <div className="absolute top-0 inset-x-0 h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-slate-950/0 to-slate-950/0 pointer-events-none" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-10">

                        {/* Pill Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-700/50 text-slate-300 text-sm font-medium backdrop-blur-md shadow-2xl animate-in slide-in-from-top-8 duration-700 fade-in">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            ChanoLite Edition
                        </div>

                        {/* Heading */}
                        <div className="space-y-6 max-w-4xl animate-in slide-in-from-bottom-8 duration-1000 delay-100 fade-in fill-mode-both">
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
                                <span className="text-white">Essential</span><br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 animate-gradient-xy">
                                    Game Management
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
                                The lightweight, distraction-free version of ChanoX2.
                                <span className="text-emerald-500/80 block mt-2 font-mono text-lg">Pure Performance. Zero Bloat.</span>
                            </p>
                        </div>

                        {/* Hero Image */}
                        <div className="relative mt-12 w-full max-w-4xl group perspective-2000 animate-in zoom-in-50 duration-1000 delay-300 fade-in fill-mode-both">
                            <div className="relative transform transition-all duration-700 ease-out group-hover:rotate-x-2 group-hover:scale-[1.02]">
                                <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition duration-700" />
                                <div className="relative rounded-3xl overflow-hidden border border-slate-700/50 bg-slate-900/80 shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)] backdrop-blur-sm">
                                    <div className="h-10 border-b border-slate-700/50 bg-[#0F172A] flex items-center px-4 gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                                    </div>
                                    <Image
                                        src="/ChanoLite/20251220_103615.png"
                                        alt="ChanoLite Main Window"
                                        width={1200}
                                        height={800}
                                        className="w-full h-auto"
                                        priority
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Features Showcase Section --- */}
            <section className="py-24 bg-slate-950 relative border-t border-slate-900/50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
                            Why Choose Lite?
                        </h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            For users who prefer simplicity and speed over extensive features.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
                        {/* Feature 1 */}
                        <div className="space-y-6">
                            <div className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
                                <Image
                                    src="/ChanoLite/20251220_103641.png"
                                    alt="Minimalist Interface"
                                    width={800}
                                    height={500}
                                    className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                            <div className="px-2">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                        <Feather className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">Streamlined Interface</h3>
                                </div>
                                <p className="text-slate-400 leading-relaxed">
                                    A clean, no-nonsense interface that gets out of your way. Focus on your games, not the launcher.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="space-y-6">
                            <div className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
                                <Image
                                    src="/ChanoLite/20251220_103644.png"
                                    alt="Core Performance"
                                    width={800}
                                    height={500}
                                    className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                            <div className="px-2">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                                        <Gauge className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">Maximum Efficiency</h3>
                                </div>
                                <p className="text-slate-400 leading-relaxed">
                                    Optimized for lower-end hardware or minimalists. Uses significantly less RAM and CPU in the background.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Download Section --- */}
            <section className="py-24 relative overflow-hidden bg-[#020617]">
                <div className="container mx-auto px-6 relative z-10">

                    {/* Panel Header */}
                    <div className="max-w-5xl mx-auto mb-10 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">Get ChanoLite</h2>
                            <p className="text-slate-400">Lightweight builds directly from GitHub</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Stable Release
                        </div>
                    </div>

                    <DownloadSection releases={releases} />

                </div>
            </section>

            {/* --- Footer --- */}
            <section className="py-16 border-t border-slate-900 bg-[#0B1121] text-center">
                <div className="container mx-auto px-6">
                    <p className="text-slate-500 mb-8">Looking for the full experience?</p>
                    <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800" asChild>
                        <Link href="/chanox2">
                            Go to ChanoX2 Pro
                        </Link>
                    </Button>
                </div>
            </section>

        </div>
    )
}

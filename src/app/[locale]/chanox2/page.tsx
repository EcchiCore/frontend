
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Zap, Shield, Globe, Star, Cpu, Layout, Github, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import DownloadSection from './DownloadSection'

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

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-cyan-500/30 overflow-x-hidden">

            {/* --- Hero Section --- */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Dynamic Background */}
                <div className="absolute top-0 inset-x-0 h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950/0 to-slate-950/0 pointer-events-none" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-10">

                        {/* Pill Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-700/50 text-slate-300 text-sm font-medium backdrop-blur-md shadow-2xl animate-in slide-in-from-top-8 duration-700 fade-in">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                            Legacy Reforged
                        </div>

                        {/* Heading */}
                        <div className="space-y-6 max-w-4xl animate-in slide-in-from-bottom-8 duration-1000 delay-100 fade-in fill-mode-both">
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
                                <span className="text-white">Master Your</span><br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient-xy">
                                    Game Library
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
                                The intelligent identifier and launcher for every game engine.
                                <span className="text-slate-200 block mt-2">Built for speed. Designed for control.</span>
                            </p>
                        </div>

                        {/* 3D Image Showcase */}
                        <div className="relative mt-12 w-full max-w-5xl group perspective-2000 animate-in zoom-in-50 duration-1000 delay-300 fade-in fill-mode-both">
                            <div className="relative transform transition-all duration-700 ease-out group-hover:rotate-x-2 group-hover:scale-[1.02]">
                                {/* Glow Effect */}
                                <div className="absolute -inset-1 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition duration-700" />

                                {/* Image Container */}
                                <div className="relative rounded-3xl overflow-hidden border border-slate-700/50 bg-slate-900/80 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-sm">
                                    <div className="h-12 border-b border-slate-700/50 bg-[#0F172A] flex items-center px-6 gap-2">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                                        </div>
                                        <div className="mx-auto text-xs text-slate-500 font-mono">ChanoX2 - Main Window</div>
                                    </div>
                                    <Image
                                        src="/chanox2/20251220_100948.png"
                                        alt="ChanoX2 Dashboard"
                                        width={1600}
                                        height={1000}
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
            <section className="py-24 bg-slate-950 relative">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                        {/* Feature Image */}
                        <div className="flex-1 w-full lg:order-2">
                            <div className="relative group rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-50 z-10" />
                                <Image
                                    src="/chanox2/20251220_100959.png"
                                    alt="ChanoX2 Feature View"
                                    width={1200}
                                    height={800}
                                    className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                        </div>

                        {/* Feature List */}
                        <div className="flex-1 space-y-8 lg:order-1 text-left">
                            <h2 className="text-4xl md:text-5xl font-bold text-white">
                                Organize without <br />
                                <span className="text-cyan-400">Complexity</span>
                            </h2>
                            <p className="text-lg text-slate-400 leading-relaxed">
                                Identify game engines automatically. Sort your collection by technology, size, or playtime.
                                ChanoX2 gives you the granular control you've been missing.
                            </p>

                            <div className="space-y-6">
                                <FeatureItem
                                    icon={<Cpu className="w-6 h-6 text-purple-400" />}
                                    title="Engine Detection"
                                    desc="Instantly identifies Unity, Unreal, Godot, Ren'Py and more."
                                />
                                <FeatureItem
                                    icon={<Layout className="w-6 h-6 text-blue-400" />}
                                    title="Smart Library"
                                    desc="Auto-import your games and keep them organized with tags."
                                />
                                <FeatureItem
                                    icon={<Zap className="w-6 h-6 text-yellow-400" />}
                                    title="Performance Mode"
                                    desc="Zero-overhead launcher that closes itself when game starts."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Download Section (Redesigned) --- */}
            <section className="py-24 relative overflow-hidden bg-[#020617]">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                <div className="container mx-auto px-6 relative z-10">

                    {/* Panel Header */}
                    <div className="max-w-5xl mx-auto mb-10 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">Release Channels</h2>
                            <p className="text-slate-400">Stable builds and assets from GitHub</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-mono">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            System Operational
                        </div>
                    </div>

                    <DownloadSection releases={releases} />

                </div>
            </section>

            {/* --- Community & Footer --- */}
            <section className="py-24 border-t border-slate-900 bg-[#0B1121] text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-cyan-900/10 blur-[100px] pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <h2 className="text-3xl font-bold text-white mb-6">Join the Community</h2>
                    <p className="text-slate-400 max-w-xl mx-auto mb-10 text-lg">
                        ChanoX2 is open source and community-driven. Report bugs, feature requests, or just come say hi.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
                        <div className="group relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-500" />
                            <Button size="lg" className="relative h-14 px-8 text-lg rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white border-0" asChild>
                                <Link href="https://discord.gg/chanomhub" target="_blank">
                                    <MessageCircle className="mr-2 w-5 h-5 fill-current" />
                                    Join Discord
                                </Link>
                            </Button>
                        </div>
                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-xl border-slate-700 hover:bg-white hover:text-black transition-all bg-transparent" asChild>
                            <Link href="https://github.com/Chanomhub/ChanoX2" target="_blank">
                                <Github className="mr-2 w-5 h-5" />
                                Star on GitHub
                            </Link>
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-slate-500 text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" /> Open Source MIT
                        </div>
                        <div className="flex items-center gap-2">
                            <Layout className="w-4 h-4" /> Cross Platform
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Secure & Private
                        </div>
                    </div>
                </div>
            </section>

        </div>
    )
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-900/50 transition-colors border border-transparent hover:border-slate-800">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 shadow-lg">
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
                <p className="text-sm text-slate-400">{desc}</p>
            </div>
        </div>
    )
}

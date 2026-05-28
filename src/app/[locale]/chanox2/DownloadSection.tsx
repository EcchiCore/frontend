'use client'

import { Link } from "@/i18n/navigation";
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'
import { 
    ChevronDown, ChevronUp, FileText, FileDown, 
    ArrowRight, ShieldAlert, Sparkles, HelpCircle, CheckCircle, ExternalLink, Image as ImageIcon
} from 'lucide-react'
import { format } from 'date-fns'

type Asset = {
    name: string
    browser_download_url: string
    size: number
    download_count: number
    content_type: string
}

type Release = {
    id: number
    name: string
    tag_name: string
    published_at: string
    html_url: string
    body: string
    assets: Asset[]
    prerelease: boolean
}

type OS = 'windows' | 'mac' | 'linux' | 'unknown'

// Custom Clean SVGs for Brands matching shadcn minimal design
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

export default function DownloadSection({ releases }: { releases: Release[] }) {
    const t = useTranslations('ChanoX2')
    
    // 1. Core States
    const [mounted, setMounted] = useState(false)
    const [detectedOS, setDetectedOS] = useState<OS>('unknown')
    const [expandedReleases, setExpandedReleases] = useState<Record<number, boolean>>({})
    
    // Screenshot Showcase Tab state (default: 'library')
    const [activeScreenshotTab, setActiveScreenshotTab] = useState<'library' | 'settings'>('library')

    useEffect(() => {
        setMounted(true)
        const userAgent = window.navigator.userAgent.toLowerCase()
        if (userAgent.includes('win')) setDetectedOS('windows')
        else if (userAgent.includes('mac')) setDetectedOS('mac')
        else if (userAgent.includes('linux')) setDetectedOS('linux')

        // Initialize accordion state: expand first release
        if (releases.length > 0) {
            setExpandedReleases({ [releases[0].id]: true })
        }
    }, [releases])

    const latestRelease = releases.length > 0 ? releases[0] : null

    // Toggle release accordion
    const toggleRelease = (id: number) => {
        setExpandedReleases(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    // Helper: Dynamic Asset Metadata Parser (Kind, OS, Arch)
    const parseAsset = (assetName: string) => {
        const name = assetName.toLowerCase()
        let kind = "Binary"
        let os = "Other"
        let arch = "x86-64"

        // Determine OS
        if (name.includes("win") || name.endsWith(".exe") || name.endsWith(".msi")) {
            os = "Windows"
        } else if (name.includes("mac") || name.includes("darwin") || name.includes("osx") || name.endsWith(".dmg") || name.endsWith(".pkg") || (name.endsWith(".blockmap") && name.includes("mac")) || name.endsWith(".yml") && name.includes("mac")) {
            os = "macOS"
        } else if (name.includes("linux") || name.includes("ubuntu") || name.endsWith(".appimage") || name.endsWith(".deb") || name.endsWith(".rpm") || name.endsWith(".flatpak") || name.endsWith(".blockmap") && name.includes("linux") || name.endsWith(".yml") && name.includes("linux")) {
            os = "Linux"
        }

        // Determine Kind
        if (name.endsWith(".exe") || name.endsWith(".msi")) {
            kind = "Installer"
        } else if (name.endsWith(".dmg") || name.endsWith(".pkg")) {
            kind = "Installer (macOS)"
        } else if (name.endsWith(".zip") || name.endsWith(".tar.gz") || name.endsWith(".tgz") || name.endsWith(".7z")) {
            kind = "Archive"
        } else if (name.endsWith(".deb") || name.endsWith(".rpm") || name.endsWith(".flatpak")) {
            kind = "Package"
        } else if (name.endsWith(".appimage")) {
            kind = "AppImage (Linux)"
        } else if (name.endsWith(".blockmap") || name.endsWith(".yml") || name.endsWith(".yaml")) {
            kind = "Metadata"
        }

        // Determine Arch (Check 64-bit first to avoid x86_64 matching x86 32-bit!)
        if (name.includes("arm64") || name.includes("aarch64") || name.includes("m1") || name.includes("m2")) {
            arch = "ARM64"
        } else if (name.includes("amd64") || name.includes("x64") || name.includes("x86_64") || name.includes("flatpak") || name.includes("appimage") || name.includes("deb") || name.includes("rpm")) {
            arch = "x86-64"
        } else if (name.includes("x86") || name.includes("386") || name.includes("i386")) {
            arch = "x86 (32-bit)"
        } else if (name.includes("universal")) {
            arch = "Universal"
        } else {
            // Default fallback based on OS
            if (os === "Windows" || os === "Linux") {
                arch = "x86-64"
            } else if (os === "macOS") {
                arch = "Universal"
            } else {
                arch = "All / Source"
            }
        }

        return { kind, os, arch }
    }

    // Helper: Find recommended stable asset of a platform
    const getFeaturedAsset = (platform: 'windows' | 'mac-arm' | 'mac-intel' | 'linux') => {
        if (!latestRelease) return null
        
        const cleanAssets = latestRelease.assets.filter(a => {
            const name = a.name.toLowerCase()
            return !name.endsWith('.blockmap') && !name.endsWith('.yml') && !name.endsWith('.yaml')
        })

        const sortedAssets = [...cleanAssets].sort((a, b) => {
            const aName = a.name.toLowerCase()
            const bName = b.name.toLowerCase()
            const aIsSetup = aName.includes('setup') || aName.includes('installer')
            const bIsSetup = bName.includes('setup') || bName.includes('installer')
            if (aIsSetup && !bIsSetup) return -1
            if (!aIsSetup && bIsSetup) return 1
            return b.download_count - a.download_count
        })

        return sortedAssets.find(a => {
            const name = a.name.toLowerCase()
            if (platform === 'windows') {
                return name.endsWith('.exe') || name.endsWith('.msi')
            }
            if (platform === 'mac-arm') {
                return (name.endsWith('.dmg') || name.endsWith('.pkg') || name.endsWith('.zip')) && 
                       (name.includes('arm64') || name.includes('m1') || name.includes('m2') || name.includes('universal'))
            }
            if (platform === 'mac-intel') {
                return (name.endsWith('.dmg') || name.endsWith('.pkg') || (name.endsWith('.zip') && name.includes('mac'))) && 
                       !name.includes('arm64') && !name.includes('m1') && !name.includes('m2') && !name.includes('universal')
            }
            if (platform === 'linux') {
                return name.endsWith('.appimage') || name.endsWith('.deb') || name.endsWith('.rpm') || name.endsWith('.flatpak')
            }
            return false
        }) || null
    }

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const windowsAsset = getFeaturedAsset('windows')
    const macArmAsset = getFeaturedAsset('mac-arm')
    const macIntelAsset = getFeaturedAsset('mac-intel')
    const linuxAsset = getFeaturedAsset('linux')

    // 2. Dynamic Featured Cards list (Omits platforms with no assets available)
    const featuredCards = [
        {
            id: 'windows',
            title: 'Microsoft Windows',
            icon: <WindowsIcon className="w-5 h-5 text-zinc-100" />,
            desc: 'Windows 10 or later, Intel/AMD 64-bit architecture',
            asset: windowsAsset,
            detected: detectedOS === 'windows'
        },
        {
            id: 'mac-arm',
            title: 'macOS (Apple Silicon)',
            icon: <AppleIcon className="w-5 h-5 text-zinc-100" />,
            desc: 'macOS 12 or later, Apple M1/M2/M3 chips (ARM64)',
            asset: macArmAsset,
            detected: detectedOS === 'mac'
        },
        {
            id: 'mac-intel',
            title: 'macOS (Intel Core)',
            icon: <AppleIcon className="w-5 h-5 text-zinc-100" />,
            desc: 'macOS 12 or later, Intel 64-bit processors (x86_64)',
            asset: macIntelAsset,
            detected: detectedOS === 'mac'
        },
        {
            id: 'linux',
            title: 'Linux Binaries',
            icon: <LinuxIcon className="w-5 h-5 text-zinc-100" />,
            desc: 'Linux 3.2 or later, AppImage / deb / rpm / flatpak',
            asset: linuxAsset,
            detected: detectedOS === 'linux'
        }
    ].filter(card => !!card.asset)

    // Determine default install file link based on client detected OS
    const getDefaultInstallLink = () => {
        if (detectedOS === 'windows' && windowsAsset) return windowsAsset.browser_download_url
        if (detectedOS === 'mac' && macArmAsset) return macArmAsset.browser_download_url
        if (detectedOS === 'linux' && linuxAsset) return linuxAsset.browser_download_url
        return '#featured-downloads'
    }

    return (
        <div className="w-full max-w-5xl mx-auto space-y-20">

            {/* ======================================================== */}
            {/* --- STEAM-STYLE SPLIT HERO SECTION (PREVIEW TOP SHOWCASE) --- */}
            {/* ======================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center pt-4">
                
                {/* Left side: branding, description, stats, and download button */}
                <div className="lg:col-span-5 space-y-6 text-left">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 p-2 flex items-center justify-center shadow-sm select-none">
                            <img src="/chanox2/icon.ico" alt="ChanoX2 Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-3xl font-extrabold tracking-tight text-zinc-50 font-mono">ChanoX2</span>
                    </div>

                    <p className="text-sm md:text-base text-zinc-400 leading-relaxed font-sans font-normal">
                        {t('heroDescription')}
                    </p>

                    {/* Massive installation action button */}
                    <div className="space-y-4 pt-2">
                        <Button size="lg" className="w-full sm:w-auto h-12 px-8 bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors text-sm shrink-0" asChild>
                            <a href={getDefaultInstallLink()}>
                                <FileDown className="w-5 h-5 shrink-0" />
                                <span>INSTALL CHANOX2</span>
                            </a>
                        </Button>
                        <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-medium font-sans">
                            <span>Also available on:</span>
                            <div className="flex items-center gap-1.5">
                                <WindowsIcon className="w-3.5 h-3.5 text-zinc-400" />
                                <AppleIcon className="w-3.5 h-3.5 text-zinc-400" />
                                <LinuxIcon className="w-3.5 h-3.5 text-zinc-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side: Mockup showing Screenshots/Videos side-by-side */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Header bar controls */}
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold font-sans">Interface Showcase</span>
                        
                        {/* shadcn Minimal Tabs Selector */}
                        <div className="inline-flex rounded-lg bg-zinc-900/50 p-0.5 border border-zinc-800/80 text-[10px] font-medium shrink-0 font-sans">
                            <button
                                onClick={() => setActiveScreenshotTab('library')}
                                className={`px-2.5 py-1 rounded transition-all ${activeScreenshotTab === 'library' ? 'bg-zinc-800 text-zinc-50 shadow-sm font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                {t('screenshotMain')}
                            </button>
                            <button
                                onClick={() => setActiveScreenshotTab('settings')}
                                className={`px-2.5 py-1 rounded transition-all ${activeScreenshotTab === 'settings' ? 'bg-zinc-800 text-zinc-50 shadow-sm font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                {t('screenshotSettings')}
                            </button>
                        </div>
                    </div>

                    {/* macOS-style Window Mockup containing ChanoX2 real assets */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-sm transition-all duration-300">
                        {/* Mockup Title bar */}
                        <div className="h-9 bg-zinc-900/50 border-b border-zinc-800 px-4 flex items-center justify-between select-none">
                            {/* macOS window dots */}
                            <div className="flex gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-zinc-800"></span>
                                <span className="h-2 w-2 rounded-full bg-zinc-800"></span>
                                <span className="h-2 w-2 rounded-full bg-zinc-800"></span>
                            </div>
                            {/* Address bar mockup */}
                            <div className="px-6 py-0.5 rounded bg-zinc-950 border border-zinc-900 text-[10px] text-zinc-500 font-mono">
                                {activeScreenshotTab === 'library' ? 'chanox2://library_view' : 'chanox2://settings_dashboard'}
                            </div>
                            <div className="w-10"></div>
                        </div>
                        
                        {/* Mockup Body: Currently displays beautiful screenshots, ready to accept HTML5 <video> */}
                        <div className="relative overflow-hidden bg-zinc-950 flex items-center justify-center aspect-[16/9]">
                            {/* =============================================================== */}
                            {/* NOTE FOR USER: Swapping to Video later                          */}
                            {/* You can easily uncomment and use this structure for video:       */}
                            {/* =============================================================== */}
                            {/* 
                            <video 
                                src="/chanox2/preview_video.mp4" 
                                controls 
                                autoPlay 
                                muted 
                                loop 
                                className="w-full h-full object-cover"
                            />
                            */}
                            
                            <img 
                                src={activeScreenshotTab === 'library' ? '/chanox2/20251220_100948.png' : '/chanox2/20251220_100959.png'} 
                                alt={activeScreenshotTab === 'library' ? 'ChanoX2 Library Screen' : 'ChanoX2 Settings Screen'}
                                className="w-full h-full object-cover rounded-b-lg transition-transform duration-500 hover:scale-[1.005]"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* ======================================================== */}
            {/* --- GO-STYLE FEATURED DOWNLOADS GRID (ANCHOR ELEMENT) --- */}
            {/* ======================================================== */}
            <div id="featured-downloads" className="space-y-6 pt-12 border-t border-zinc-900 scroll-mt-24">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-zinc-50 tracking-tight">Featured Downloads</h3>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${featuredCards.length} gap-6`}>
                    {featuredCards.map(card => (
                        <div 
                            key={card.id}
                            className={`relative group p-6 rounded-xl bg-zinc-900/30 border ${card.detected ? 'border-zinc-500/50 shadow-sm bg-zinc-900/50' : 'border-zinc-800/80'} hover:border-zinc-700 hover:bg-zinc-900/40 transition-all duration-200 flex flex-col justify-between`}
                        >
                            {card.detected && (
                                <span className="absolute top-3 right-3 bg-zinc-800 text-zinc-200 border border-zinc-700 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                                    Detected OS
                                </span>
                            )}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    {card.icon}
                                    <h4 className="font-bold text-zinc-100 text-sm">{card.title}</h4>
                                </div>
                                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans font-normal">{card.desc}</p>
                            </div>
                            <div className="pt-6 mt-6 border-t border-zinc-900">
                                {card.asset ? (
                                    <Link 
                                        href={card.asset.browser_download_url} 
                                        className="group/link text-xs font-bold text-zinc-200 hover:text-white transition-colors flex flex-col gap-1.5"
                                    >
                                        <span className="truncate underline font-mono text-[11px] font-medium" title={card.asset.name}>{card.asset.name}</span>
                                        <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-sans font-normal">
                                            <FileDown className="w-3.5 h-3.5 shrink-0" />
                                            <span>Size: {formatSize(card.asset.size)}</span>
                                        </span>
                                    </Link>
                                ) : (
                                    <span className="text-xs text-zinc-600 italic font-sans font-normal">Unavailable</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- SHADCN-STYLE ACCORDION RELEASES --- */}
            <div className="space-y-6 pt-6 border-t border-zinc-900">
                <div className="flex flex-col space-y-1.5">
                    <h3 className="text-lg font-bold text-zinc-50 tracking-tight">Stable & Archive Releases</h3>
                    <p className="text-xs text-zinc-400 font-sans">Click a release version below to view all available installation formats and source packages.</p>
                </div>

                <div className="space-y-4">
                    {releases.map((release) => {
                        const isExpanded = !!expandedReleases[release.id]
                        return (
                            <div 
                                key={release.id}
                                className="rounded-xl border border-zinc-800 bg-zinc-900/10 overflow-hidden shadow-sm"
                            >
                                {/* Accordion Header */}
                                <button
                                    onClick={() => toggleRelease(release.id)}
                                    className="w-full flex items-center justify-between p-5 bg-zinc-900/30 hover:bg-zinc-900/50 text-left text-sm font-semibold transition-colors focus:outline-none"
                                >
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="p-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </div>
                                        <span className="text-base font-extrabold text-zinc-100 font-mono">
                                            ChanoX2 {release.tag_name}
                                        </span>
                                        {release.prerelease ? (
                                            <Badge className="bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-bold px-2 py-0.5 rounded font-sans">
                                                Beta Build
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-zinc-100 text-zinc-900 border border-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded font-sans">
                                                Stable
                                            </Badge>
                                        )}
                                        <span className="text-xs text-zinc-500 font-mono font-medium">
                                            • {format(new Date(release.published_at), 'MMMM dd, yyyy')}
                                        </span>
                                    </div>

                                    {/* Action Links */}
                                    <div className="hidden sm:flex items-center gap-4 font-sans">
                                        <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded flex items-center gap-1.5" asChild onClick={(e) => e.stopPropagation()}>
                                            <Link href={release.html_url} target="_blank">
                                                <FileText className="w-3.5 h-3.5 text-zinc-500" />
                                                <span>{t('viewNotes')}</span>
                                            </Link>
                                        </Button>
                                    </div>
                                </button>

                                {/* Accordion Content (Detailed Table) */}
                                {isExpanded && (
                                    <div className="border-t border-zinc-800 bg-zinc-950/20 overflow-x-auto p-4 sm:p-6">
                                        <table className="min-w-full divide-y divide-zinc-900 text-left text-xs text-zinc-300">
                                            <thead className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-900/40">
                                                <tr>
                                                    <th scope="col" className="px-4 py-3 rounded-l font-sans">Filename</th>
                                                    <th scope="col" className="px-4 py-3 font-sans">Kind</th>
                                                    <th scope="col" className="px-4 py-3 font-sans">OS</th>
                                                    <th scope="col" className="px-4 py-3 font-sans">Arch</th>
                                                    <th scope="col" className="px-4 py-3 font-sans">Size</th>
                                                    <th scope="col" className="px-4 py-3 rounded-r font-sans">Downloads</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-900/40 bg-zinc-950/10 font-mono">
                                                {release.assets.map((asset) => {
                                                    const { kind, os, arch } = parseAsset(asset.name)
                                                    return (
                                                        <tr key={asset.name} className="hover:bg-zinc-900/30 transition-all">
                                                            <td className="px-4 py-3 font-semibold text-zinc-200 truncate max-w-[280px]">
                                                                <Link 
                                                                    href={asset.browser_download_url}
                                                                    className="underline hover:text-white flex items-center gap-2"
                                                                    title={asset.name}
                                                                >
                                                                    <FileDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                                                    <span>{asset.name}</span>
                                                                </Link>
                                                            </td>
                                                            <td className="px-4 py-3 text-zinc-400 font-sans">{kind}</td>
                                                            <td className="px-4 py-3 text-zinc-300 font-sans">{os}</td>
                                                            <td className="px-4 py-3 text-zinc-400">{arch}</td>
                                                            <td className="px-4 py-3 text-zinc-300 font-semibold">{formatSize(asset.size)}</td>
                                                            <td className="px-4 py-3 text-zinc-500 font-sans">
                                                                <Badge className="bg-zinc-900 text-zinc-400 border border-zinc-800 text-[10px] font-mono px-2 py-0.5 rounded font-normal">
                                                                    {asset.download_count.toLocaleString()} dl
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                                {release.assets.length === 0 && (
                                                    <tr>
                                                        <td colSpan={6} className="px-4 py-6 text-center text-zinc-500 italic font-sans font-normal">
                                                            No binary assets attached to this release.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

        </div>
    )
}

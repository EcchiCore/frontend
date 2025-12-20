'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, Monitor, Apple, Box, ChevronDown, Calendar, Hash, ExternalLink } from 'lucide-react'
import Link from 'next/link'
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

export default function DownloadSection({ releases }: { releases: Release[] }) {
    const [os, setOs] = useState<OS>('unknown')
    const [recommendedAsset, setRecommendedAsset] = useState<Asset | null>(null)
    const [latestRelease, setLatestRelease] = useState<Release | null>(null)

    useEffect(() => {
        // Detect OS
        const userAgent = window.navigator.userAgent.toLowerCase()
        let detectedOS: OS = 'unknown'

        if (userAgent.includes('win')) detectedOS = 'windows'
        else if (userAgent.includes('mac')) detectedOS = 'mac'
        else if (userAgent.includes('linux')) detectedOS = 'linux'

        setOs(detectedOS)

        if (releases.length > 0) {
            const latest = releases[0]
            setLatestRelease(latest)

            // Find recommended asset based on OS
            const asset = latest.assets.find(a => {
                const name = a.name.toLowerCase()
                if (detectedOS === 'windows') return name.endsWith('.exe') || name.endsWith('.msi')
                if (detectedOS === 'mac') return name.endsWith('.dmg') || name.endsWith('.pkg') || (name.endsWith('.zip') && name.includes('mac'))
                if (detectedOS === 'linux') return name.endsWith('.AppImage') || name.endsWith('.deb') || name.endsWith('.rpm')
                return false
            })
            setRecommendedAsset(asset || null)
        }
    }, [releases])

    const getOsIcon = (osName: OS) => {
        switch (osName) {
            case 'windows': return <Monitor className="w-5 h-5" />
            case 'mac': return <Apple className="w-5 h-5" />
            case 'linux': return <Box className="w-5 h-5" />
            default: return <Download className="w-5 h-5" />
        }
    }

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    if (!releases.length) return null

    return (
        <div className="w-full max-w-5xl mx-auto space-y-16">

            {/* Latest Release Hero Card */}
            {latestRelease && (
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-[2rem] blur opacity-40 group-hover:opacity-75 transition duration-1000" />
                    <Card className="relative bg-black/50 backdrop-blur-xl border-slate-700/50 p-6 md:p-10 rounded-[2rem]">
                        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-3 py-1 text-sm">Latest Release</Badge>
                                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{latestRelease.name || latestRelease.tag_name}</h2>
                                </div>
                                <div className="flex items-center gap-4 text-slate-400 text-sm">
                                    <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                                        <Hash className="w-4 h-4" /> {latestRelease.tag_name}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                                        <Calendar className="w-4 h-4" /> {format(new Date(latestRelease.published_at), 'MMMM dd, yyyy')}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                {recommendedAsset ? (
                                    <Button size="xl" className="h-20 px-8 text-xl rounded-2xl bg-white text-black hover:bg-cyan-50 hover:text-cyan-900 transition-all shadow-[0_0_30px_-5px_rgba(34,211,238,0.4)] group w-full sm:w-auto flex flex-col items-center justify-center gap-1" asChild>
                                        <Link href={recommendedAsset.browser_download_url}>
                                            <div className="flex items-center gap-2">
                                                {getOsIcon(os)}
                                                <span>Download for {os === 'windows' ? 'Windows' : os === 'mac' ? 'macOS' : os === 'linux' ? 'Linux' : 'Device'}</span>
                                            </div>
                                            <span className="text-xs font-normal opacity-60 font-mono">
                                                {recommendedAsset.name} • {formatSize(recommendedAsset.size)}
                                            </span>
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button size="xl" className="h-16 px-8 text-lg rounded-2xl bg-white text-black hover:bg-cyan-50 transition-all shadow-lg shadow-white/10 group w-full sm:w-auto" asChild>
                                        <Link href={latestRelease.html_url} target="_blank">
                                            <Download className="mr-2 h-5 w-5" />
                                            Download Latest
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Version List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Box className="w-6 h-6 text-slate-400" />
                        Complete Version History
                    </h3>
                </div>

                <div className="space-y-4">
                    {releases.map((release) => (
                        <div key={release.id} className="group relative bg-[#0B1121] border border-slate-800/60 rounded-xl p-4 md:p-6 transition-all hover:border-slate-700 hover:bg-[#0F172A] flex flex-col md:flex-row md:items-center justify-between gap-6">

                            {/* Left Info */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl font-mono font-bold text-white group-hover:text-cyan-400 transition-colors">
                                        {release.tag_name}
                                    </span>
                                    {release.prerelease ? (
                                        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-xs px-2 py-0.5 h-6">Pre-release</Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-slate-800/50 text-slate-400 border-slate-700/50 text-xs px-2 py-0.5 h-6 group-hover:bg-slate-700/50 group-hover:text-slate-300">Stable</Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <span>Released on {format(new Date(release.published_at), 'MMM dd, yyyy')}</span>
                                </div>
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <Button variant="outline" className="flex-1 md:flex-none border-slate-800 bg-[#0F172A] text-slate-300 hover:bg-slate-800 hover:text-white" asChild>
                                    <Link href={release.html_url} target="_blank">
                                        View Notes
                                    </Link>
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button className="flex-1 md:flex-none bg-green-600 hover:bg-green-500 text-white border-none shadow-lg shadow-green-900/20 gap-2 min-w-[140px]">
                                            Assets
                                            <span className="bg-black/20 px-1.5 py-0.5 rounded text-xs">({release.assets.length})</span>
                                            <ChevronDown className="w-4 h-4 opacity-70" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[300px] bg-[#0F172A] border-slate-700 text-slate-300 max-h-[300px] overflow-y-auto">
                                        {release.assets.map(asset => (
                                            <DropdownMenuItem key={asset.name} asChild>
                                                <Link href={asset.browser_download_url} className="flex items-center justify-between cursor-pointer focus:bg-slate-800 focus:text-white py-2">
                                                    <span className="truncate max-w-[200px]" title={asset.name}>{asset.name}</span>
                                                    <span className="text-xs text-slate-500 tabular-nums">{formatSize(asset.size)}</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

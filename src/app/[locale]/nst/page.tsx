import { Link } from "@/i18n/navigation";
import { getTranslations } from 'next-intl/server';
import { locales } from '@/app/[locale]/lib/navigation';
import { 
  TriangleAlert, Download, Calendar, FileArchive, ChevronDown, ChevronUp, Tag, 
  Sparkles, HelpCircle, FileText, FileDown, ExternalLink, Github, Zap, Clock, Gift
} from 'lucide-react';
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }) {
  const resolvedParams = await params;
  const locale = (resolvedParams?.locale || 'en') as (typeof locales)[number];
  const t = await getTranslations({ locale, namespace: 'NstPage' });
  return {
    title: t('title') + ' | ChanomHub',
    description: t('description'),
    icons: {
      icon: 'https://cdn.chanomhub.com/icon.png',
    },
  };
}

// Clean Monochromatic Brand Icons
const WindowsIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.1zM10.95 1.95L24 0v11.55H10.95V1.95zM10.95 12.45H24v11.55l-13.05-1.95v-9.6z"/>
  </svg>
);

const LinuxIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.1-.19.161-.403.161-.624V17.5c-3.14-.645-3.83-1.88-3.83-1.88-.514-1.3-1.255-1.65-1.255-1.65-1.025-.7.078-.686.078-.686 1.134.08 1.73 1.16 1.73 1.16.826 1.414 2.167 1.005 2.695.77.084-.6.324-1.005.589-1.235-2.507-.285-5.14-1.255-5.14-5.58 0-1.23.44-2.24 1.16-3.03-.117-.285-.503-1.43.11-2.985 0 0 .947-.305 3.1 1.155.9-.25 1.86-.375 2.81-.38.95.005 1.91.13 2.81.38 2.153-1.46 3.1-1.155 3.1-1.155.615 1.555.228 2.7.111 2.985.723.79 1.16 1.799 1.16 3.03 0 4.335-2.637 5.29-5.15 5.57.405.35.765 1.04.765 2.1v3.12c0 .223.061.436.163.626C19.138 20.167 22 16.42 22 12c0-5.523-4.477-10-10-10z"/>
  </svg>
);

interface GitHubAsset {
  name: string;
  browser_download_url: string;
  size: number;
  download_count: number;
  content_type: string;
}

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  html_url: string;
  assets: GitHubAsset[];
  published_at: string;
  body: string;
  prerelease: boolean;
  draft: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

async function getAllReleases(): Promise<GitHubRelease[]> {
  try {
    const res = await fetch('https://api.github.com/repos/NST-Ghost/NST-Ghost/releases', {
      next: { revalidate: 1800 },
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      }
    });

    if (!res.ok) return [];
    const releases = await res.json();
    return releases.filter((r: GitHubRelease) => !r.draft);
  } catch (error) {
    console.error('Failed to fetch releases:', error);
    return [];
  }
}

export default async function NstPromotionPage() {
  const t = await getTranslations('NstPage');
  const allReleases = await getAllReleases();
  const latestRelease = allReleases[0] || null;

  const totalDownloads = allReleases.reduce((sum, release) => {
    return sum + release.assets.reduce((assetSum, asset) => assetSum + asset.download_count, 0);
  }, 0);

  const getLatestLinuxAsset = () => {
    if (!latestRelease) return null;
    return latestRelease.assets.find(a =>
      (a.name.toLowerCase().includes('linux') || a.name.toLowerCase().includes('x86_64')) &&
      (a.name.endsWith('.tar.gz') || a.name.endsWith('.tar.xz') || a.name.endsWith('.appimage'))
    ) || latestRelease.assets[0];
  };

  const latestLinuxAsset = getLatestLinuxAsset();

  const features = [
    {
      name: t('builtForLinux'),
      description: t('builtForLinuxDesc'),
      icon: LinuxIcon,
    },
    {
      name: t('highPerformance'),
      description: t('highPerformanceDesc'),
      icon: Zap,
    },
    {
      name: t('realTimeTranslation'),
      description: t('realTimeTranslationDesc'),
      icon: Clock,
    },
    {
      name: t('freeAndEasy'),
      description: t('freeAndEasyDesc'),
      icon: Gift,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-indigo-500/20 overflow-x-hidden relative font-sans">
      {/* Minimal Top Radial Gradient matching ChanoX2 & ChanoLite */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/30 via-zinc-950/0 to-zinc-950/0 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 pt-24 md:pt-32 pb-24 max-w-5xl space-y-20">
        
        {/* --- STEAM-STYLE HERO SPLIT SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center pt-4">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 p-2 flex items-center justify-center shadow-sm shrink-0">
                <Image
                  src="/icon.webp"
                  alt="NST Icon"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div>
                <span className="text-3xl font-extrabold tracking-tight text-zinc-50 font-mono">NST-Ghost</span>
                <span className="block text-xs text-zinc-400 font-sans">{t('subtitle')}</span>
              </div>
            </div>

            <p className="text-sm md:text-base text-zinc-400 leading-relaxed font-sans font-normal">
              {t('description')}
            </p>

            {totalDownloads > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t('totalDownloads')}: <strong className="text-zinc-200 font-bold">{totalDownloads.toLocaleString()}</strong> {t('times')}</span>
              </div>
            )}

            {/* Install Action Button */}
            <div className="space-y-4 pt-2">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors text-sm shrink-0" asChild>
                <a href={latestLinuxAsset?.browser_download_url || 'https://github.com/NST-Ghost/NST-Ghost/releases'}>
                  <FileDown className="w-5 h-5 shrink-0" />
                  <span>INSTALL NST-GHOST ENGINE</span>
                </a>
              </Button>

              <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-medium font-sans">
                <span>Available on:</span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-zinc-400 font-mono"><LinuxIcon className="w-3.5 h-3.5" /> Linux</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-zinc-400 font-mono"><WindowsIcon className="w-3.5 h-3.5" /> Windows</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Window Mockup */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold font-sans">NST Real-Time Translator Mockup</span>
              <span className="text-[10px] font-mono text-zinc-500">v3.1 Stable</span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-sm">
              <div className="h-9 bg-zinc-900/50 border-b border-zinc-800 px-4 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-zinc-800" />
                  <span className="h-2 w-2 rounded-full bg-zinc-800" />
                  <span className="h-2 w-2 rounded-full bg-zinc-800" />
                </div>
                <div className="px-6 py-0.5 rounded bg-zinc-950 border border-zinc-900 text-[10px] text-zinc-500 font-mono">
                  nst-ghost://hook_translator
                </div>
                <div className="w-10" />
              </div>
              
              <div className="relative overflow-hidden bg-zinc-950 aspect-[16/9] flex items-center justify-center">
                <img
                  src="https://cdn.chanomhub.com/Screenshot_08-%E0%B8%81.%E0%B8%A2._15-15-36_10718.png"
                  alt="NST Engine Screenshot"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.005]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- KEY FEATURES SECTION (Matching ChanoX2 & ChanoLite Grid) --- */}
        <section className="border-t border-zinc-900 pt-16">
          <div className="flex flex-col items-center text-center space-y-3 mb-12">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800 text-xs font-medium font-sans">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Key Features
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-50 tracking-tight">
              {t('keyFeatures')}
            </h2>
            <p className="text-xs text-zinc-400 max-w-md font-sans">
              {t('keyFeaturesDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.name} className="p-6 rounded-xl bg-zinc-900/10 border border-zinc-800/80 hover:bg-zinc-900/20 transition-all duration-200 flex flex-col justify-between shadow-sm">
                <div className="space-y-3">
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 w-fit text-zinc-300">
                    <feature.icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="font-bold text-zinc-100 text-sm tracking-tight">{feature.name}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans font-normal">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- RELEASES & ASSETS TABLE SECTION --- */}
        <section className="border-t border-zinc-900 pt-12 space-y-6">
          <div className="flex flex-col space-y-1.5">
            <h3 className="text-lg font-bold text-zinc-50 tracking-tight">{t('allVersions')}</h3>
            <p className="text-xs text-zinc-400 font-sans">{t('allVersionsDesc')}</p>
          </div>

          <div className="space-y-4">
            {allReleases.map((release) => {
              return (
                <div key={release.id} className="rounded-xl border border-zinc-800 bg-zinc-900/10 overflow-hidden shadow-sm">
                  <div className="p-5 bg-zinc-900/30 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-extrabold text-zinc-100 font-mono">
                        NST {release.tag_name}
                      </span>
                      {release.prerelease ? (
                        <Badge className="bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-bold px-2 py-0.5 rounded font-sans">
                          Pre-release
                        </Badge>
                      ) : (
                        <Badge className="bg-zinc-100 text-zinc-900 border border-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded font-sans">
                          Stable
                        </Badge>
                      )}
                      <span className="text-xs text-zinc-500 font-mono">
                        • {formatDate(release.published_at)}
                      </span>
                    </div>

                    <a
                      href={release.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors inline-flex items-center gap-1.5 font-sans"
                    >
                      <FileText className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{t('viewDetails')}</span>
                    </a>
                  </div>

                  {/* Assets list table */}
                  {release.assets.length > 0 && (
                    <div className="border-t border-zinc-800 bg-zinc-950/20 overflow-x-auto p-4 sm:p-6">
                      <table className="min-w-full divide-y divide-zinc-900 text-left text-xs text-zinc-300">
                        <thead className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-900/40">
                          <tr>
                            <th scope="col" className="px-4 py-3 rounded-l font-sans">Filename</th>
                            <th scope="col" className="px-4 py-3 font-sans">Size</th>
                            <th scope="col" className="px-4 py-3 rounded-r font-sans">Downloads</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/40 bg-zinc-950/10 font-mono">
                          {release.assets.map((asset) => (
                            <tr key={asset.name} className="hover:bg-zinc-900/30 transition-all">
                              <td className="px-4 py-3 font-semibold text-zinc-200 truncate max-w-[300px]">
                                <a
                                  href={asset.browser_download_url}
                                  className="underline hover:text-white flex items-center gap-2"
                                  title={asset.name}
                                >
                                  <FileDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                  <span>{asset.name}</span>
                                </a>
                              </td>
                              <td className="px-4 py-3 text-zinc-300 font-semibold">{formatFileSize(asset.size)}</td>
                              <td className="px-4 py-3 text-zinc-500 font-sans">
                                <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 text-[10px] font-mono">
                                  {asset.download_count.toLocaleString()} dl
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* --- LEGACY RUST VERSION SECTION --- */}
        <section className="p-6 rounded-xl bg-zinc-900/10 border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-zinc-100 text-sm flex items-center gap-2 font-mono">
              <span>{t('legacyVersion')}</span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 text-amber-400 border border-zinc-800 text-[10px]">
                Rust Dev v0.3
              </span>
            </h3>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            {t('legacyVersionDesc')}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="https://nst.chanomhub.com/NST-Linux-Dev-0.3.7z"
              className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-mono inline-flex items-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Linux (v0.3.7z)</span>
            </a>
            <a
              href="https://nst.chanomhub.com/NST-Windows-Dev-0.3.7z"
              className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-mono inline-flex items-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Windows (v0.3.7z)</span>
            </a>
          </div>
        </section>

        {/* --- FOOTER & COMMUNITY --- */}
        <footer className="py-8 border-t border-zinc-900 text-center">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-medium">
            <span>NST Engine © {new Date().getFullYear()} • MIT Licensed Open Source</span>
            <div className="flex items-center gap-4 font-mono text-[11px]">
              <a href="https://github.com/NST-Ghost/NST-Ghost" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-200 transition-colors flex items-center gap-1">
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
              <span>•</span>
              <a href="https://github.com/NST-Ghost/NST-Ghost/issues" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-200 transition-colors flex items-center gap-1">
                <TriangleAlert className="w-3.5 h-3.5" />
                <span>Report Issue</span>
              </a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
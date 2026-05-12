"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Download, ShieldCheck, Lock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getFileIcon } from "@/utils/fileUtils";
import { DownloadFile } from "./Interfaces";
import { Article } from '@/types/article';
import { Link } from '@/i18n/navigation';

interface ArticleDownloadSectionProps {
  article: Article;
  downloads: DownloadFile[];
  isDarkMode: boolean;
}

const ArticleDownloadSection: React.FC<ArticleDownloadSectionProps> = ({
  article,
  downloads,
  isDarkMode,
}) => {
  const t = useTranslations('ArticleContent');
  const activeDownloads = downloads?.filter((d) => d.isActive) || [];
  const isUnlocked = article.isUnlocked || article.price === 0;

  if (activeDownloads.length === 0) return null;

  return (
    <div className="space-y-6 mt-12 mb-12">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Download className="w-6 h-6 text-primary" />
          {t('downloads.title') || 'Downloads'}
        </h2>
        <div className="hidden sm:flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Scanned with VirusTotal</span>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 shadow-xl overflow-hidden relative group">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-black">{t('openInChanoX2')}</h3>
            <p className="text-muted-foreground text-sm opacity-90 max-w-md">
              Fast, secure, and easy way to manage your game library and downloads.
            </p>
          </div>
          
          <a href={`chanox2://article/${article.slug}`} className="w-full md:w-auto">
            <Button size="lg" className="w-full md:w-auto h-12 px-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg transition-all hover:scale-105 active:scale-95">
              <Download className="w-5 h-5 mr-2" />
              Launch ChanoX2
            </Button>
          </a>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {activeDownloads.map((dl, i) => (
          <motion.div 
            key={dl.id} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/50 hover:bg-accent/5 transition-all shadow-sm"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                  {getFileIcon(dl.name)}
                </div>
                <h3 className="text-lg font-bold truncate group-hover:text-primary transition-colors">
                  {dl.name}
                </h3>
              </div>
              {dl.forVersion && (
                <div className="ml-11 text-xs text-muted-foreground font-medium">
                  Version: {dl.forVersion}
                </div>
              )}
            </div>

            {isUnlocked ? (
              <a href={dl.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                <Button className="w-full sm:w-auto h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all shadow-md">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </a>
            ) : (
              <Link href={`/articles/${article.slug}?purchase=true`} className="shrink-0">
                <Button className="w-full sm:w-auto h-11 px-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-500/20">
                  <Lock className="w-4 h-4 mr-2" />
                  Unlock Files
                </Button>
              </Link>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ArticleDownloadSection;

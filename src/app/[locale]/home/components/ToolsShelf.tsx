
import { Link } from "@/i18n/navigation";
import { ArrowRight, Zap, Ghost, Layers } from 'lucide-react';

import { useTranslations } from 'next-intl';

const getTools = (t: any) => [
  {
    href: '/chanox2',
    cardClass: 'border-indigo-500/25 from-indigo-950 via-purple-950 to-slate-950 hover:border-indigo-500/50',
    IconEl: Layers,
    iconClass: 'bg-indigo-500/20 text-indigo-400',
    tagClass: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/20',
    tag: 'DESKTOP',
    name: 'ChanoX2',
    desc: t('chanox2Desc'),
    linkClass: 'text-indigo-400',
    linkText: 'Learn more',
    hoverColor: 'group-hover:text-indigo-300',
  },
  {
    href: '/chanolite',
    cardClass: 'border-emerald-500/25 from-emerald-950 via-teal-950 to-slate-950 hover:border-emerald-500/50',
    IconEl: Zap,
    iconClass: 'bg-emerald-500/20 text-emerald-400',
    tagClass: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/20',
    tag: 'MOBILE',
    name: 'ChanoLite',
    desc: t('chanoliteDesc'),
    linkClass: 'text-emerald-400',
    linkText: 'Get it free',
    hoverColor: 'group-hover:text-emerald-300',
  },
  {
    href: '/nst',
    cardClass: 'border-orange-500/25 from-orange-950 via-red-950 to-slate-950 hover:border-orange-500/50',
    IconEl: Ghost,
    iconClass: 'bg-orange-500/20 text-orange-400',
    tagClass: 'text-orange-400 bg-orange-500/15 border-orange-500/20',
    tag: 'TRANSLATE',
    name: 'NST Ghost',
    desc: t('nstDesc'),
    linkClass: 'text-orange-400',
    linkText: 'Download',
    hoverColor: 'group-hover:text-orange-300',
  },
];

export default function ToolsShelf() {
  const t = useTranslations('homePage.ToolsShelf');
  const tools = getTools(t);

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3 px-0.5">
        <div className="w-0.5 h-4 bg-primary rounded-full" />
        <h2 className="text-sm font-bold text-foreground">{t('toolsFromStaff')}</h2>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {tools.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`group flex-shrink-0 w-[200px] relative overflow-hidden rounded-xl border bg-gradient-to-br transition-all duration-200 hover:-translate-y-0.5 ${t.cardClass}`}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-lg ${t.iconClass}`}>
                  <t.IconEl className="w-4 h-4" />
                </div>
                <span className={`text-[9px] font-extrabold uppercase tracking-wider border px-1.5 py-0.5 rounded ${t.tagClass}`}>
                  {t.tag}
                </span>
              </div>
              <h3 className={`text-sm font-bold text-white mb-1 transition-colors ${t.hoverColor}`}>
                {t.name}
              </h3>
              <p className="text-[10px] text-white/45 mb-3 line-clamp-2 leading-relaxed">
                {t.desc}
              </p>
              <div className={`flex items-center gap-1 text-[10px] font-semibold group-hover:translate-x-0.5 transition-transform ${t.linkClass}`}>
                {t.linkText} <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

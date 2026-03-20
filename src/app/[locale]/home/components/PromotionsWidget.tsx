import Link from 'next/link';
import { ArrowRight, Zap, Ghost, Layers } from 'lucide-react';

const promos = [
  {
    href: '/chanox2',
    wrapClass: 'border-indigo-500/25 from-indigo-950 via-purple-950 to-slate-950 hover:border-indigo-500/50',
    IconEl: Layers,
    iconClass: 'bg-indigo-500/20 text-indigo-400',
    tagClass: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/20',
    tag: 'DESKTOP',
    name: 'ChanoX2',
    desc: 'จัดการเกม H รองรับ Linux, macOS, Windows',
    linkClass: 'text-indigo-400',
    linkText: 'Learn more',
    titleHover: 'group-hover:text-indigo-300',
  },
  {
    href: '/chanolite',
    wrapClass: 'border-emerald-500/25 from-emerald-950 via-teal-950 to-slate-950 hover:border-emerald-500/50',
    IconEl: Zap,
    iconClass: 'bg-emerald-500/20 text-emerald-400',
    tagClass: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/20',
    tag: 'MOBILE',
    name: 'ChanoLite',
    desc: 'จัดการเกม H รองรับ iOS, Android',
    linkClass: 'text-emerald-400',
    linkText: 'Get it free',
    titleHover: 'group-hover:text-emerald-300',
  },
  {
    href: '/nst',
    wrapClass: 'border-orange-500/25 from-orange-950 via-red-950 to-slate-950 hover:border-orange-500/50',
    IconEl: Ghost,
    iconClass: 'bg-orange-500/20 text-orange-400',
    tagClass: 'text-orange-400 bg-orange-500/15 border-orange-500/20',
    tag: 'TRANSLATE',
    name: 'NST Ghost',
    desc: 'โปรแกรมแปลเกมครบวงจรพัฒนาโดย Chanomhub',
    linkClass: 'text-orange-400',
    linkText: 'Download',
    titleHover: 'group-hover:text-orange-300',
  },
];

export default function PromotionsWidget() {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <div className="text-xs font-bold p-2.5 px-3 border-b border-border flex items-center gap-2 text-foreground">
        <div className="w-0.5 h-4 bg-primary rounded-full" />
        <span>แนะนำจากทีมงาน</span>
      </div>

      {/* Mobile: horizontal scroll row | Desktop: vertical stack */}
      <div className="
        p-2
        flex flex-row gap-2 overflow-x-auto pb-2
        sm:flex-col sm:overflow-visible sm:pb-0
      ">
        {promos.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className={`
              group relative overflow-hidden rounded-lg border bg-gradient-to-br
              transition-all duration-200 hover:-translate-y-0.5
              flex-shrink-0 w-[180px] sm:w-auto
              ${p.wrapClass}
            `}
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className={`p-1 rounded-md ${p.iconClass}`}>
                  <p.IconEl className="w-3.5 h-3.5" />
                </div>
                <span className={`text-[9px] font-extrabold uppercase tracking-wider border px-1.5 py-0.5 rounded ${p.tagClass}`}>
                  {p.tag}
                </span>
              </div>
              <h3 className={`text-xs font-bold text-white mb-0.5 transition-colors ${p.titleHover}`}>
                {p.name}
              </h3>
              <p className="text-[10px] text-white/45 mb-2 line-clamp-1">
                {p.desc}
              </p>
              <div className={`flex items-center gap-1 text-[10px] font-semibold group-hover:translate-x-0.5 transition-transform ${p.linkClass}`}>
                {p.linkText} <ArrowRight className="w-2.5 h-2.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

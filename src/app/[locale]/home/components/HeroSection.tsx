import { JSX } from 'react';
import { useTranslations } from 'next-intl';
import { Users, MessageSquare, Hash, Activity } from 'lucide-react';
import ActiveUsersCounter from './ActiveUsersCounter';
import { Card, CardContent } from '@/components/ui/card';

interface ForumStats {
  icon: JSX.Element;
  number: string | JSX.Element;
  label: string;
}

interface HeroSectionProps {
  initialActiveUsers: number;
}

export default function HeroSection({ initialActiveUsers }: HeroSectionProps) {
  const t = useTranslations('homePage');
  
  const forumStats: ForumStats[] = [
    {
      icon: <Users className="w-7 h-7" />,
      number: '12.5K',
      label: t('forumStats.activeMembers')
    },
    {
      icon: <MessageSquare className="w-7 h-7" />,
      number: '45.2K',
      label: t('forumStats.totalPosts')
    },
    {
      icon: <Hash className="w-7 h-7" />,
      number: '234',
      label: t('forumStats.categories')
    },
    {
      icon: <Activity className="w-7 h-7" />,
      number: <ActiveUsersCounter initialCount={initialActiveUsers} />,
      label: t('forumStats.onlineNow')
    },
  ];

  return (
    <section className="relative py-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5"></div>
      <div className="container mx-auto px-4 relative">
        {/* Hero Content */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            {t('welcomeTo')}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{t('hub')}</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('heroDescription')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {forumStats.map((stat, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center group hover:bg-white hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 border border-white/20">
              <CardContent>
                <div className="flex items-center justify-center mb-4">
                  <div className="text-indigo-600 group-hover:scale-110 group-hover:text-purple-600 transition-all duration-300">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
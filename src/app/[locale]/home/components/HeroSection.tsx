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
      icon: <Users className="w-8 h-8 text-teal-400" />,
      number: '12.5K',
      label: t('forumStats.activeMembers'),
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-teal-400" />,
      number: '45.2K',
      label: t('forumStats.totalPosts'),
    },
    {
      icon: <Hash className="w-8 h-8 text-teal-400" />,
      number: '234',
      label: t('forumStats.categories'),
    },
    {
      icon: <Activity className="w-8 h-8 text-teal-400" />,
      number: <ActiveUsersCounter initialCount={initialActiveUsers} />,
      label: t('forumStats.onlineNow'),
    },
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/70 via-gray-900/70 to-teal-900/70 backdrop-blur-sm"></div>
      <div className="container mx-auto px-4 relative">
        {/* Hero Content */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-100 mb-6 tracking-tight">
            {t('welcomeTo')}
            <span className="bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
              {t('hub')}
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t('heroDescription')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {forumStats.map((stat, index) => (
            <Card
              key={index}
              className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 text-center group hover:bg-gray-700/90 hover:shadow-2xl hover:shadow-teal-500/20 transition-all duration-500 border border-gray-600"
            >
              <CardContent>
                <div className="flex items-center justify-center mb-4">
                  <div className="text-teal-400 group-hover:scale-110 group-hover:text-teal-300 transition-all duration-300">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-4xl font-extrabold text-gray-100 mb-3 group-hover:text-teal-300 transition-colors">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm font-medium tracking-wide">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
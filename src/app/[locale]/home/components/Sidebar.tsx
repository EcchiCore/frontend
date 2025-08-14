'use client';

import React from 'react';
import { Link } from "../../lib/navigation";
import { useTranslations } from 'next-intl';
import {
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  Hash,
  Activity,
  Globe,
  Shield,
  Heart,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { Card } from "@/components/ui/card";

interface RecentActivity {
  user: string;
  action: string;
  topic: string;
  time: string;
  actionColor: string;
}

export default function Sidebar() {
  const t = useTranslations('homePage');

  const recentActivity: RecentActivity[] = [
    {
      user: 'jane_doe',
      action: t('recentActivity.repliedTo'),
      topic: 'Advanced React Patterns & Best Practices',
      time: '5 min ago',
      actionColor: 'text-teal-400',
    },
    {
      user: 'mike_tech',
      action: t('recentActivity.created'),
      topic: 'Feature Request: Dark Mode Enhancement',
      time: '12 min ago',
      actionColor: 'text-indigo-400',
    },
    {
      user: 'sarah_dev',
      action: t('recentActivity.liked'),
      topic: 'Code Review Guidelines & Standards',
      time: '18 min ago',
      actionColor: 'text-pink-400',
    },
    {
      user: 'alex_admin',
      action: t('recentActivity.pinned'),
      topic: 'Community Guidelines - Important Update',
      time: '25 min ago',
      actionColor: 'text-purple-400',
    },
    {
      user: 'dev_mentor',
      action: t('recentActivity.answered'),
      topic: 'How to Structure Large Scale Applications',
      time: '32 min ago',
      actionColor: 'text-teal-400',
    },
  ];

  const quickLinks = [
    { name: t('quickLinks.latestPosts'), path: '/games', icon: <MessageSquare className="w-4 h-4" /> },
    { name: t('quickLinks.popularTopics'), path: '/popular', icon: <TrendingUp className="w-4 h-4" /> },
    { name: t('quickLinks.allCategories'), path: '/categories', icon: <Hash className="w-4 h-4" /> },
    { name: t('quickLinks.memberDirectory'), path: '/members', icon: <Users className="w-4 h-4" /> },
    { name: t('quickLinks.communityGuidelinesLink'), path: '/guidelines', icon: <Shield className="w-4 h-4" /> },
    { name: t('quickLinks.helpSupport'), path: '/help', icon: <Heart className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Recent Activity */}
      <Card className="bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-600 p-6">
        <h3 className="text-xl font-extrabold text-gray-100 mb-6 flex items-center tracking-tight">
          <Activity className="w-6 h-6 mr-2 text-teal-400" />
          {t('liveActivity')}
        </h3>

        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="text-sm group hover:bg-gray-700/50 p-3 rounded-lg transition-all duration-300">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-gray-200">{activity.user}</span>
                <span className={`font-medium ${activity.actionColor}`}>{activity.action}</span>
              </div>
              <div className="text-gray-200 hover:text-teal-300 cursor-pointer font-medium mb-2 line-clamp-2 transition-colors">
                {activity.topic}
              </div>
              <div className="text-gray-400 text-xs flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Links */}
      <Card className="bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-600 p-6">
        <h3 className="text-xl font-extrabold text-gray-100 mb-4 flex items-center tracking-tight">
          <Globe className="w-6 h-6 mr-2 text-teal-400" />
          {t('quickNavigation')}
        </h3>

        <div className="space-y-2">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              href={link.path}
              className="flex items-center px-4 py-3 rounded-xl text-gray-200 hover:bg-gradient-to-r hover:from-teal-600/30 hover:to-indigo-600/30 hover:text-teal-300 transition-all duration-300 group"
            >
              <span className="mr-3 text-teal-400 group-hover:text-teal-300 transition-colors">
                {link.icon}
              </span>
              {link.name}
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-teal-400" />
            </Link>
          ))}
        </div>
      </Card>

      {/* Community Guidelines */}
      <Card className="bg-gradient-to-br from-indigo-900/70 via-gray-800/90 to-teal-900/70 backdrop-blur-md rounded-2xl p-6 text-white relative overflow-hidden border border-gray-600">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full -ml-20 -mb-20"></div>

        <div className="relative">
          <h3 className="text-xl font-extrabold mb-3 flex items-center tracking-tight">
            <Shield className="w-6 h-6 mr-2 text-teal-400" />
            {t('communityGuidelines')}
          </h3>
          <p className="text-gray-200 mb-4 text-sm leading-relaxed">
            {t('communityGuidelinesDescription')}
          </p>
          <Link
            href="/guidelines"
            className="bg-teal-500/20 hover:bg-teal-500/30 backdrop-blur-sm px-4 py-2 rounded-lg font-semibold text-sm text-teal-300 hover:text-teal-200 transition-all duration-300 flex items-center"
          >
            {t('readGuidelines')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </Card>
    </div>
  );
}
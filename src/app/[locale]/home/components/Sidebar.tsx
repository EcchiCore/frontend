'use client';

import React from 'react';
import { Link } from "../../lib/navigation"; // ใช้ Link จาก next-intl
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
      actionColor: 'text-blue-600'
    },
    {
      user: 'mike_tech',
      action: t('recentActivity.created'),
      topic: 'Feature Request: Dark Mode Enhancement',
      time: '12 min ago',
      actionColor: 'text-green-600'
    },
    {
      user: 'sarah_dev',
      action: t('recentActivity.liked'),
      topic: 'Code Review Guidelines & Standards',
      time: '18 min ago',
      actionColor: 'text-pink-600'
    },
    {
      user: 'alex_admin',
      action: t('recentActivity.pinned'),
      topic: 'Community Guidelines - Important Update',
      time: '25 min ago',
      actionColor: 'text-purple-600'
    },
    {
      user: 'dev_mentor',
      action: t('recentActivity.answered'),
      topic: 'How to Structure Large Scale Applications',
      time: '32 min ago',
      actionColor: 'text-indigo-600'
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
      <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Activity className="w-6 h-6 mr-2 text-green-500" />
          {t('liveActivity')}
        </h3>

        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="text-sm group hover:bg-gray-50 p-3 rounded-lg transition-colors">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-gray-900">{activity.user}</span>
                <span className={`${activity.actionColor} font-medium`}>{activity.action}</span>
              </div>
              <div className="text-indigo-600 hover:text-indigo-800 cursor-pointer font-medium mb-2 line-clamp-2">
                {activity.topic}
              </div>
              <div className="text-gray-500 text-xs flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Links */}
      <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Globe className="w-6 h-6 mr-2 text-blue-500" />
          {t('quickNavigation')}
        </h3>

        <div className="space-y-2">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              href={link.path} // next-intl Link จะจัดการ locale อัตโนมัติ
              className="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 transition-all duration-200 group"
            >
              <span className="mr-3 text-gray-400 group-hover:text-indigo-500 transition-colors">
                {link.icon}
              </span>
              {link.name}
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </Card>

      {/* Community Guidelines */}
      <Card className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></div>

        <div className="relative">
          <h3 className="text-xl font-bold mb-3 flex items-center">
            <Shield className="w-6 h-6 mr-2" />
            {t('communityGuidelines')}
          </h3>
          <p className="text-white/90 mb-4 text-sm leading-relaxed">
            {t('communityGuidelinesDescription')}
          </p>
          <Link
            href="/guidelines" // next-intl Link จะจัดการ locale อัตโนมัติ
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center"
          >
            {t('readGuidelines')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </Card>
    </div>
  );
}
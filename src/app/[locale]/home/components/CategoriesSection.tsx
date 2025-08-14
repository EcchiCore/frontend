'use client';

import React from 'react';
import { Link } from "../../lib/navigation";
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Category {
  name: string;
  description: string;
  icon: string;
  isLocked?: boolean;
  customUrl: string;
}

const isExternalUrl = (url: string) => {
  return /^https?:\/\//.test(url);
};

type DynamicComponent = 'div' | 'a' | typeof Link;

type ComponentConfig = {
  component: DynamicComponent;
  props: Record<string, any>;
};

export default function ForumCategoriesSection() {
  const t = useTranslations('homePage');

  const categories: Category[] = [
    {
      name: t('categories.announcements.name'),
      description: t('categories.announcements.description'),
      icon: '📢',
      customUrl: 'https://github.com/yourrepo/announcements',
      isLocked: true,
    },
    {
      name: t('categories.generalDiscussion.name'),
      description: t('categories.generalDiscussion.description'),
      icon: '💬',
      customUrl: 'https://github.com/yourrepo/general-discussion',
      isLocked: true,
    },
    {
      name: t('categories.hGames.name'),
      description: t('categories.hGames.description'),
      icon: '🎮',
      customUrl: '/games',
    },
    {
      name: t('categories.tools.name'),
      description: t('categories.tools.description'),
      icon: '💻',
      customUrl: 'https://github.com/Chanomhub',
    },
    {
      name: t('categories.videos.name'),
      description: t('categories.videos.description'),
      icon: '🌟',
      customUrl: 'https://github.com/yourrepo/lifestyle',
      isLocked: true,
    },
    {
      name: t('categories.vipRoom.name'),
      description: t('categories.vipRoom.description'),
      icon: '🛍️',
      customUrl: 'https://github.com/yourrepo/marketplace',
      isLocked: true,
    },
  ];

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <Card className="bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-600 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-900 to-gray-800 px-6 py-5">
            <h2 className="text-3xl font-extrabold text-gray-100 tracking-tight">{t('forumCategoriesTitle')}</h2>
          </div>

          <div className="divide-y divide-gray-700">
            {categories.map((category, index) => {
              const isExternal = isExternalUrl(category.customUrl);

              let componentConfig: ComponentConfig;
              const baseClassName = `block transition-all duration-300 group ${
                category.isLocked
                  ? 'bg-gray-800/50 cursor-not-allowed opacity-70'
                  : 'hover:bg-gray-700/80 cursor-pointer'
              }`;

              if (category.isLocked) {
                componentConfig = {
                  component: 'div',
                  props: {
                    role: 'region',
                    'aria-disabled': 'true',
                    className: baseClassName,
                    onClick: (e: React.MouseEvent) => e.preventDefault(),
                  },
                };
              } else if (isExternal) {
                componentConfig = {
                  component: 'a',
                  props: {
                    href: category.customUrl,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    className: baseClassName,
                  },
                };
              } else {
                componentConfig = {
                  component: Link,
                  props: {
                    href: category.customUrl,
                    className: baseClassName,
                  },
                };
              }

              const Component = componentConfig.component;
              return React.createElement(
                Component as any,
                {
                  key: index,
                  ...componentConfig.props,
                },
                <Card className="px-6 py-5 flex items-center justify-between bg-transparent hover:bg-gray-700/50 transition-all duration-300">
                  <CardContent className="flex items-start space-x-4 flex-1 p-0">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-teal-500 rounded-xl flex items-center justify-center text-3xl shadow-lg transform group-hover:scale-105 transition-transform">
                        {category.icon}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3
                          className={`text-xl font-bold tracking-tight ${
                            category.isLocked
                              ? 'text-gray-400'
                              : 'text-gray-100 group-hover:text-teal-300'
                          }`}
                        >
                          {category.name}
                        </h3>
                        {category.isLocked && (
                          <span
                            className="text-gray-300 text-lg"
                            title={t('lockedCategoryTooltip')}
                            aria-label={t('lockedCategoryAriaLabel')}
                          >
                            🔒
                          </span>
                        )}
                        {!category.isLocked && isExternal && (
                          <span className="text-teal-400 text-sm" aria-hidden="true">
                            🔗
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm mt-2 leading-relaxed ${
                          category.isLocked ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-300'
                        }`}
                      >
                        {category.description}
                      </p>
                      {!category.isLocked && isExternal && (
                        <div className="text-xs mt-2 text-teal-400 truncate">{category.customUrl}</div>
                      )}
                      {category.isLocked && (
                        <div className="text-xs mt-2 text-gray-500">{t('lockedCategoryMessage')}</div>
                      )}
                    </div>
                  </CardContent>

                  <div className="flex-shrink-0 ml-4">
                    {!category.isLocked && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-teal-400 group-hover:text-teal-300 hover:bg-teal-500/20 transition-all duration-300"
                      >
                        <svg
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              isExternal
                                ? 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                                : 'M9 5l7 7-7 7'
                            }
                          />
                        </svg>
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="bg-gray-900/50 px-6 py-4 border-t border-gray-700">
            <div className="text-sm text-gray-400 text-center">
              <p>{t('externalLinkMessage')}</p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Palette, Globe, Monitor } from 'lucide-react';

interface Preferences {
  bgColor: string;
  language: string;
  theme: string;
}

interface WebsiteSettingsProps {
  preferences: Preferences;
  handlePreferenceChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const WebsiteSettings: React.FC<WebsiteSettingsProps> = ({
                                                           preferences,
                                                           handlePreferenceChange
                                                         }) => {
  const t = useTranslations('WebsiteSettings');

  const getContrastColor = (hexColor: string) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-base-100 rounded-2xl shadow-lg space-y-8">
      {/* Color Picker Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Palette className="text-primary" size={24} />
          <h3 className="text-xl font-semibold">{t('colorAndTheme')}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">
              <span className="label-text text-base font-medium">{t('backgroundColor')}</span>
            </label>
            <div className="flex gap-4 items-center">
              <input
                type="color"
                name="bgColor"
                value={preferences.bgColor}
                onChange={handlePreferenceChange}
                className="w-16 h-16 rounded-full cursor-pointer border-2 border-base-300"
              />
              <div>
                <div className="p-4 rounded-lg border border-base-300 mb-2"
                     style={{ backgroundColor: preferences.bgColor }}>
                  <span className="text-sm font-medium"
                        style={{ color: getContrastColor(preferences.bgColor) }}>
                    {t('bgColorPreview')}
                  </span>
                </div>
                <span className="text-xs text-base-content/70">
                  {t('currentBgColor', { color: preferences.bgColor })}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text text-base font-medium">{t('displayTheme')}</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="card bg-base-100 border border-base-300 rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={preferences.theme === 'light'}
                  onChange={handlePreferenceChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-16 rounded-lg bg-base-100 border border-base-300 flex items-center justify-center">
                    <span className="text-base-content">☀️</span>
                  </div>
                  <span className="text-sm font-medium">{t('lightMode')}</span>
                </div>
              </label>

              <label className="card bg-neutral border border-neutral-focus rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={preferences.theme === 'dark'}
                  onChange={handlePreferenceChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-16 rounded-lg bg-neutral border border-neutral-focus flex items-center justify-center">
                    <span className="text-neutral-content">🌙</span>
                  </div>
                  <span className="text-sm font-medium text-neutral-content">{t('darkMode')}</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Language Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Globe className="text-primary" size={24} />
          <h3 className="text-xl font-semibold">{t('languageSettings')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <select
              name="language"
              value={preferences.language}
              onChange={handlePreferenceChange}
              className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="th">{t('thai')}</option>
              <option value="en">English</option>
              <option value="zh">中文</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
            </select>
            <p className="text-sm text-base-content/70 mt-2">
              {t('selectLanguageDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Notification Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Monitor className="text-primary" size={24} />
          <h3 className="text-xl font-semibold">{t('notifications')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input type="checkbox" className="toggle toggle-primary" />
                <span className="label-text text-base font-medium">{t('emailNotifs')}</span>
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input type="checkbox" className="toggle toggle-primary" />
                <span className="label-text text-base font-medium">{t('websiteNotifs')}</span>
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input type="checkbox" className="toggle toggle-primary" />
                <span className="label-text text-base font-medium">{t('newActivity')}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteSettings;
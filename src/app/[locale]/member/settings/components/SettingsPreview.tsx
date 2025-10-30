'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import myImageLoader from '@/lib/imageLoader';

const PLACEHOLDER_IMAGE = '/placeholder-image.png';

interface FormData {
  username: string;
  email: string;
  bio: string;
  image: string;
  backgroundImage: string;
  password: string;
  shrtflyApiKey: string;
}

interface ThemeSettings {
  theme: string;
  fontSize: string;
}

interface LanguageSettings {
  language: string;
}

interface SettingsPreviewProps {
  activeTab: string;
  formData: FormData;
  themeSettings: ThemeSettings;
  languageSettings: LanguageSettings;
}

export default function SettingsPreview({
                                          activeTab,
                                          formData,
                                          themeSettings,
                                          languageSettings,
                                        }: SettingsPreviewProps) {
  // Define supported tabs with previews
  const supportedTabs = ['profile', 'theme', 'language'];

  // Define all supported languages with their native names
  const languageNames: { [key: string]: { name: string; nativeName: string } } = {
    en: { name: 'English', nativeName: 'English' },
    th: { name: 'Thai', nativeName: 'ไทย' },
    es: { name: 'Spanish', nativeName: 'Español' },
    zh: { name: 'Chinese', nativeName: '中文' },
    ja: { name: 'Japanese', nativeName: '日本語' },
    ko: { name: 'Korean', nativeName: '한국어' },
    fr: { name: 'French', nativeName: 'Français' },
    de: { name: 'German', nativeName: 'Deutsch' },
    ru: { name: 'Russian', nativeName: 'Русский' },
    ar: { name: 'Arabic', nativeName: 'العربية' },
  };

  // State to track dynamic language changes
  const [currentLanguage, setCurrentLanguage] = useState(languageSettings.language);

  // Update language when props change
  useEffect(() => {
    setCurrentLanguage(languageSettings.language);
  }, [languageSettings.language]);

  // Function to get cookie value
  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  // Sync with cookie on mount
  useEffect(() => {
    const cookieLanguage = getCookie('userLanguage');
    if (cookieLanguage) {
      setCurrentLanguage(cookieLanguage);
    }
  }, []);

  // Get language name with fallback
  const getLanguageInfo = (code: string) => {
    return languageNames[code] || { name: code, nativeName: code };
  };

  // UI translations based on selected language
  const translations: { [key: string]: { [key: string]: string } } = {
    en: {
      profilePreview: 'Profile Preview',
      themeInfo: 'Theme Information',
      languageInfo: 'Language Information',
      bio: 'Bio',
      noBio: 'No bio provided yet.',
      previewText: 'This is how your profile will appear to others after updating.',
    },
    th: {
      profilePreview: 'ตัวอย่างโปรไฟล์',
      themeInfo: 'ข้อมูลธีม',
      languageInfo: 'ข้อมูลภาษา',
      bio: 'ประวัติ',
      noBio: 'ยังไม่มีข้อมูลประวัติ',
      previewText: 'นี่คือรูปแบบที่โปรไฟล์ของคุณจะปรากฏต่อผู้อื่นหลังจากการอัปเดต',
    },
    es: {
      profilePreview: 'Vista previa del perfil',
      themeInfo: 'Información del tema',
      languageInfo: 'Información del idioma',
      bio: 'Biografía',
      noBio: 'Aún no se ha proporcionado biografía.',
      previewText: 'Así es como aparecerá tu perfil para los demás después de actualizar.',
    },
  };

  // Get translation with English fallback
  const t = (key: string): string => {
    const lang = currentLanguage in translations ? currentLanguage : 'en';
    return translations[lang]?.[key] || translations.en[key] || key;
  };

  // If the active tab doesn't have a preview, render nothing
  if (!supportedTabs.includes(activeTab)) {
    return null;
  }

  return (
    <div className="bg-base-200 p-6 rounded-box">
      {activeTab === 'profile' ? (
        <>
          <h2 className="text-xl font-bold mb-6">{t('profilePreview')}</h2>
          <div className="card bg-base-100 shadow-xl">
            {formData.backgroundImage && (
              <figure className="relative h-32 overflow-hidden">
                <Image
                  loader={myImageLoader}
                  src={formData.backgroundImage}
                  alt="Profile background"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="w-full"
                  onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
                />
              </figure>
            )}
            <div className="card-body">
              <div className="flex flex-col items-center mb-4">
                {formData.image ? (
                  <div className={`avatar ${formData.backgroundImage ? 'mt-[-48px]' : ''} mb-4`}>
                    <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                      <Image
                        loader={myImageLoader}
                        src={formData.image}
                        alt={formData.username || 'User'}
                        width={96}
                        height={96}
                        onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className={`avatar placeholder ${formData.backgroundImage ? 'mt-[-48px]' : ''} mb-4`}>
                    <div className="bg-neutral text-neutral-content rounded-full w-24">
                      <span className="text-2xl">
                        {formData.username ? formData.username.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                  </div>
                )}
                <h2 className="card-title">{formData.username || 'Username'}</h2>
                <p className="text-sm opacity-70">{formData.email || 'email@example.com'}</p>
              </div>
              <div className="divider">{t('bio')}</div>
              <p className="whitespace-pre-line">{formData.bio || t('noBio')}</p>
            </div>
          </div>
          <div className="text-center mt-6 text-sm opacity-70">
            <p>{t('previewText')}</p>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-6">
            {activeTab === 'theme' ? t('themeInfo') : t('languageInfo')}
          </h2>
          <div className="prose">
            {activeTab === 'theme' && (
              <>
                <h3>About DaisyUI Themes</h3>
                <p>
                  DaisyUI provides a collection of predefined themes that change the appearance of
                  your entire application. The selected theme will be applied site-wide for a
                  consistent experience.
                </p>
                <h3 className="mt-4">How it Works</h3>
                <p>
                  When you change the theme, we set the <code>data-theme</code> attribute on the HTML
                  tag, which changes all colors and styles throughout the site. Your theme preference
                  is saved in your browser localStorage, so it persists between visits.
                </p>
                <h3 className="mt-4">Font Size</h3>
                <p>
                  The font size setting adjusts text size throughout the application for better
                  readability. This setting is also saved in your browser for future visits.
                </p>
                <div className="mt-4">
                  <p><strong>Theme:</strong> {themeSettings.theme}</p>
                  <p><strong>Font Size:</strong> {themeSettings.fontSize}</p>
                </div>
              </>
            )}
            {activeTab === 'language' && (
              <>
                <h3>Language Settings</h3>
                <p>
                  The selected language determines the display language of the application. Your
                  language preference is saved in a cookie and persists across sessions.
                </p>
                <div className="mt-4 card bg-base-100 p-4 shadow-sm">
                  <p>
                    <strong>Current Language:</strong>{' '}
                    {getLanguageInfo(currentLanguage).name}{' '}
                    ({getLanguageInfo(currentLanguage).nativeName})
                  </p>

                  <div className="divider my-2"></div>

                  <p className="text-sm">
                    <strong>Sample Translations:</strong>
                  </p>
                  <ul className="mt-2 space-y-1">
                    <li><strong>Profile:</strong> {translations[currentLanguage]?.profilePreview || translations.en.profilePreview}</li>
                    <li><strong>Bio:</strong> {translations[currentLanguage]?.bio || translations.en.bio}</li>
                    <li><strong>Preview:</strong> {translations[currentLanguage]?.previewText || translations.en.previewText}</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
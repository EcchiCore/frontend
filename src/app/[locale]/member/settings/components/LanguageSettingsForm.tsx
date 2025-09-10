// src/app/member/settings/components/LanguageSettingsForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface LanguageSettingsFormProps {
  languageSettings: { language: string };
  setLanguageSettings: (settings: { language: string }) => void;
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  enabled: boolean;
}

export default function LanguageSettingsForm({
                                               languageSettings,
                                               setLanguageSettings,
                                               setError,
                                               setSuccessMessage,
                                             }: LanguageSettingsFormProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(languageSettings.language);
  const [isUpdating, setIsUpdating] = useState(false);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Define supported languages with their native names and enabled status
  const languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', enabled: true },
    { code: 'th', name: 'Thai', nativeName: 'ไทย', enabled: true },
    { code: 'es', name: 'Spanish', nativeName: 'Español', enabled: true },
    { code: 'zh', name: 'Chinese', nativeName: '中文', enabled: true },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', enabled: true },
    { code: 'ko', name: 'Korean', nativeName: '한국어', enabled: true },
    { code: 'fr', name: 'French', nativeName: 'Français', enabled: true },
    { code: 'de', name: 'German', nativeName: 'Deutsch', enabled: true },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', enabled: false },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', enabled: false },
  ];

  // Reset local states when props change
  useEffect(() => {
    setSelectedLanguage(languageSettings.language);
    setLocalSuccess(null);
    setLocalError(null);
  }, [languageSettings]);

  const setCookie = (name: string, value: string, days: number) => {
    try {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
      return true;
    } catch (error) {
      console.error('Error setting cookie:', error);
      return false;
    }
  };

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setSelectedLanguage(newLanguage);

    // Only update if the language actually changed
    if (newLanguage === languageSettings.language) return;

    setIsUpdating(true);
    setLocalSuccess(null);
    setLocalError(null);

    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));

      // Save language to cookie
      const cookieSet = setCookie('userLanguage', newLanguage, 365); // Store for 1 year

      if (!cookieSet) {
        throw new Error('Failed to set language cookie');
      }

      // Update parent state
      setLanguageSettings({ language: newLanguage });

      // Show success locales
      setLocalSuccess('Language updated successfully');
      setSuccessMessage('Language updated successfully');
      setError(null);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setLocalSuccess(null);
        setSuccessMessage(null);
      }, 3000);
    } catch  {
      const errorMessage = 'Failed to update language. Please try again.';
      setLocalError(errorMessage);
      setError(errorMessage);
      setSuccessMessage(null);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Language Settings</h2>
        <p className="text-sm opacity-70 mb-4">
          Choose your preferred language for the application interface.
          The selected language will be applied immediately and remembered for future visits.
        </p>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Display Language</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={selectedLanguage}
            onChange={handleLanguageChange}
            disabled={isUpdating}
          >
            {languages
              .filter(lang => lang.enabled)
              .map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.nativeName})
                </option>
              ))}
          </select>

          <label className="label">
            <span className="label-text-alt">
              Some languages may have incomplete translations.
            </span>
          </label>
        </div>

        {/* Local form status message */}
        {(localSuccess || localError) && (
          <div className={`alert ${localSuccess ? 'alert-success' : 'alert-error'} mt-4`}>
            {localSuccess ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span>{localSuccess || localError}</span>
          </div>
        )}

        {/* Loading indicator */}
        {isUpdating && (
          <div className="flex justify-center mt-4">
            <span className="loading loading-spinner loading-sm text-primary"></span>
            <span className="ml-2">Updating language...</span>
          </div>
        )}

        <div className="divider"></div>

        <div className="bg-base-200 p-4 rounded-lg mt-2">
          <h3 className="font-semibold mb-2">Coming Soon</h3>
          <p className="text-sm">
            The following languages will be available in future updates:
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {languages
              .filter(lang => !lang.enabled)
              .map(lang => (
                <div key={lang.code} className="badge badge-outline badge-neutral">
                  {lang.name}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
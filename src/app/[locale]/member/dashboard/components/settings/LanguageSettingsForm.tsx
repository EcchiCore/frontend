'use client';

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface LanguageSettingsFormProps {
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
}

export default function LanguageSettingsForm({ setError, setSuccessMessage }: LanguageSettingsFormProps) {
  const [language, setLanguage] = useState('en'); // Default to English
  const [isSaving, setIsSaving] = useState(false);

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() ?? null;
    return null;
  };

  const setCookie = (name: string, value: string, days: number) => {
    if (typeof document === 'undefined') return;
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
  };

  useEffect(() => {
    // Load language from cookie on mount
    if (typeof window !== 'undefined') {
      const savedLanguage = getCookie('userLanguage') || 'en';
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (typeof window !== 'undefined') {
        setCookie('userLanguage', language, 365); // Save for 1 year
        // In a real app, you might also trigger a language change in your i18n library here
      }
      setSuccessMessage('Language settings saved successfully!');
    } catch (e) {
      setError('Failed to save language settings.');
      console.error('Error saving language settings:', e);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccessMessage(null), 3000); // Clear success message after 3 seconds
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="language-select">Language</Label>
        <Select value={language} onValueChange={(value) => setLanguage(value)}>
          <SelectTrigger id="language-select" className="w-[180px]">
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="th">Thai</SelectItem>
            {/* Add more languages as needed */}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Language Settings'}
      </Button>
    </div>
  );
}

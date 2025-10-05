'use client';

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ThemeSettingsFormProps {
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
}

export default function ThemeSettingsForm({ setError, setSuccessMessage }: ThemeSettingsFormProps) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load settings from localStorage on mount
    if (typeof window !== 'undefined') {
      setTheme((localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system');
      setFontSize((localStorage.getItem('fontSize') as 'small' | 'medium' | 'large') || 'medium');
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', theme);
        localStorage.setItem('fontSize', fontSize);
        document.documentElement.setAttribute('data-theme', theme); // Apply theme to HTML element
        document.documentElement.style.fontSize = fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : '16px'; // Apply font size
      }
      setSuccessMessage('Theme settings saved successfully!');
    } catch (e) {
      setError('Failed to save theme settings.');
      console.error('Error saving theme settings:', e);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccessMessage(null), 3000); // Clear success message after 3 seconds
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="theme-select">Theme</Label>
        <Select value={theme} onValueChange={(value: 'light' | 'dark' | 'system') => setTheme(value)}>
          <SelectTrigger id="theme-select" className="w-[180px]">
            <SelectValue placeholder="Select a theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="font-size-select">Font Size</Label>
        <Select value={fontSize} onValueChange={(value: 'small' | 'medium' | 'large') => setFontSize(value)}>
          <SelectTrigger id="font-size-select" className="w-[180px]">
            <SelectValue placeholder="Select font size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Theme Settings'}
      </Button>
    </div>
  );
}

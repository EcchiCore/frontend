// src/app/member/settings/components/ThemeSettingsForm.tsx
import { useState, FormEvent } from 'react';
import Link from 'next/link';

// Available DaisyUI themes
const AVAILABLE_THEMES = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate', 'synthwave', 'retro',
  'cyberpunk', 'valentine', 'halloween', 'garden', 'forest', 'aqua', 'lofi', 'pastel',
  'fantasy', 'wireframe', 'black', 'luxury', 'dracula', 'cmyk', 'autumn', 'business',
  'acid', 'lemonade', 'night', 'coffee', 'winter',
];

interface ThemeSettingsFormProps {
  themeSettings: {
    theme: string;
    fontSize: string;
  };
  setThemeSettings: React.Dispatch<React.SetStateAction<{
    theme: string;
    fontSize: string;
  }>>;
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
}

export default function ThemeSettingsForm({
                                            themeSettings,
                                            setThemeSettings,
                                            setError,
                                            setSuccessMessage,
                                          }: ThemeSettingsFormProps) {
  const [isSaving, setIsSaving] = useState(false);

  const applyTheme = (theme: string) => {
    document.documentElement.setAttribute('data-theme', theme);
  };

  const applyFontSize = (size: string) => {
    let rootSize = '16px';
    switch (size) {
      case 'small':
        rootSize = '14px';
        break;
      case 'large':
        rootSize = '18px';
        break;
      case 'xlarge':
        rootSize = '20px';
        break;
    }
    document.documentElement.style.fontSize = rootSize;
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setThemeSettings(prev => ({ ...prev, [name]: value }));
    if (name === 'theme') {
      applyTheme(value);
    } else if (name === 'fontSize') {
      applyFontSize(value);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      localStorage.setItem('userTheme', themeSettings.theme);
      localStorage.setItem('userFontSize', themeSettings.fontSize);
      applyTheme(themeSettings.theme);
      applyFontSize(themeSettings.fontSize);
      setSuccessMessage('Theme settings saved successfully');
    } catch {
      setError('Failed to save theme settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-control mb-6">
        <label className="label" htmlFor="theme">
          <span className="label-text">Theme</span>
        </label>
        <select
          id="theme"
          name="theme"
          value={themeSettings.theme}
          onChange={handleThemeChange}
          className="select select-bordered w-full"
        >
          {AVAILABLE_THEMES.map((theme) => (
            <option key={theme} value={theme}>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </option>
          ))}
        </select>
        <div className="text-xs mt-2 opacity-70">
          Preview changes are applied immediately. Click Save to make them permanent.
        </div>
      </div>

      <div className="form-control mb-6">
        <label className="label" htmlFor="fontSize">
          <span className="label-text">Font Size</span>
        </label>
        <select
          id="fontSize"
          name="fontSize"
          value={themeSettings.fontSize}
          onChange={handleThemeChange}
          className="select select-bordered w-full"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="xlarge">Extra Large</option>
        </select>
      </div>

      <div className="card bg-base-200 p-4 mb-6">
        <h3 className="font-bold mb-2">Theme Preview</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-primary text-primary-content p-2 rounded text-center">Primary</div>
          <div className="bg-secondary text-secondary-content p-2 rounded text-center">Secondary</div>
          <div className="bg-accent text-accent-content p-2 rounded text-center">Accent</div>
          <div className="bg-neutral text-neutral-content p-2 rounded text-center">Neutral</div>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300 p-4 mb-6">
        <h3 className="font-bold mb-2">Elements Preview</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          <button type="button" className="btn btn-primary btn-sm">Button</button>
          <button type="button" className="btn btn-secondary btn-sm">Button</button>
          <button type="button" className="btn btn-accent btn-sm">Button</button>
          <button type="button" className="btn btn-ghost btn-sm">Button</button>
        </div>
        <div className="form-control w-full max-w-xs mb-2">
          <input type="text" placeholder="Input example" className="input input-bordered input-sm" />
        </div>
        <div className="badge">Badge</div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button type="submit" disabled={isSaving} className="btn btn-primary">
          {isSaving ? <span className="loading loading-spinner loading-xs"></span> : null}
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
        <Link href="/profile" className="btn btn-ghost">
          Cancel
        </Link>
      </div>
    </form>
  );
}
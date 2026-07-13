'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSdk } from '@/lib/sdk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Upload,
  Type,
  Trash2,
  FileCode,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowRight,
  Globe,
  Settings
} from 'lucide-react';

const ENGINES = [
  { value: 'unity', label: 'Unity' },
  { value: 'godot', label: 'Godot' },
  { value: 'unreal', label: 'Unreal Engine' },
  { value: 'renpy', label: 'Ren\'Py' },
  { value: 'other', label: 'Other Engine' },
];

const LANGUAGES = [
  { value: 'th', label: 'Thai (th)' },
  { value: 'en', label: 'English (en)' },
  { value: 'ja', label: 'Japanese (ja)' },
  { value: 'ko', label: 'Korean (ko)' },
  { value: 'zh', label: 'Chinese (zh)' },
  { value: 'vi', label: 'Vietnamese (vi)' },
  { value: 'id', label: 'Indonesia (id)' },
];

export default function FontUploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState('');
  const [engine, setEngine] = useState('');
  const [engineVersion, setEngineVersion] = useState('');
  const [language, setLanguage] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  // Processing states
  const [status, setStatus] = useState<'idle' | 'creating' | 'uploading' | 'submitting' | 'success'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadingFile, setCurrentUploadingFile] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // File Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const isValidExt = ['ttf', 'otf', 'woff', 'woff2', 'zip'].includes(ext || '');
      const isValidSize = file.size <= 20 * 1024 * 1024; // 20MB limit

      if (!isValidExt) {
        toast.error(`Invalid extension: ${file.name}. Only .ttf, .otf, .woff, .woff2, or .zip files are allowed.`);
      }
      if (!isValidSize) {
        toast.error(`File too large: ${file.name}. Maximum file size is 20MB.`);
      }

      return isValidExt && isValidSize;
    });

    setFiles(prev => {
      // Prevent duplicates by name
      const existingNames = new Set(prev.map(f => f.name));
      const filtered = validFiles.filter(f => !existingNames.has(f.name));
      return [...prev, ...filtered];
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !engine || !language || files.length === 0) {
      toast.error('Please fill in all required fields and select at least one file.');
      return;
    }

    setErrorMsg(null);
    setStatus('creating');
    setUploadProgress(0);

    try {
      const sdk = await getSdk();

      // Step 1: Create Font entry in NestJS
      const font = await sdk.fonts.createFont({
        name: name.trim(),
        engine,
        language,
        engineVersion: engineVersion.trim() || undefined,
      });

      if (!font) {
        throw new Error('Failed to register font metadata on backend.');
      }

      // Step 2: Upload each file to R2 via GOR2
      setStatus('uploading');
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentUploadingFile(file.name);
        setUploadProgress(Math.round((i / files.length) * 100));

        // Get Signed URL & credentials from backend
        const uploadInfo = await sdk.fonts.requestUploadInfo(font.id, file.name);
        if (!uploadInfo) {
          throw new Error(`Failed to retrieve upload configuration for ${file.name}`);
        }

        const { uploadUrl, token, method, fileKey } = uploadInfo;

        // Prepare FormData
        const bodyFormData = new FormData();
        bodyFormData.append(fileKey || 'file', file);

        // Upload directly to GOR2
        const uploadRes = await fetch(uploadUrl, {
          method: method || 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: bodyFormData,
        });

        if (!uploadRes.ok) {
          const resText = await uploadRes.text();
          throw new Error(`Failed to upload ${file.name} to storage: ${resText || uploadRes.statusText}`);
        }
      }

      // Step 3: Submit for Review (links assets in DB and flags PENDING)
      setStatus('submitting');
      const submittedFont = await sdk.fonts.submitForReview(font.id, 'Initial registration upload');
      if (!submittedFont) {
        throw new Error('Failed to submit font for verification review.');
      }

      setStatus('success');
      toast.success('Font uploaded and submitted for moderation review!');
    } catch (err: any) {
      console.error('Font upload process failed:', err);
      setErrorMsg(err.message || 'An unexpected error occurred during upload.');
      setStatus('idle');
    }
  };

  if (status === 'success') {
    return (
      <Card className="border-slate-800 bg-[#161616]/80 backdrop-blur-md shadow-2xl text-center py-12 px-6">
        <CardContent className="space-y-6 max-w-md mx-auto">
          <div className="flex justify-center">
            <div className="rounded-full bg-emerald-500/10 p-4 text-emerald-400 animate-bounce">
              <CheckCircle size={48} />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Upload Successful!</h2>
            <p className="text-slate-400 text-sm">
              Your font <strong>{name}</strong> has been successfully registered and uploaded.
            </p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-4 text-left space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submission Details</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Engine:</span>
                <span className="text-slate-300 font-semibold">{ENGINES.find(e => e.value === engine)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Language:</span>
                <span className="text-slate-300 font-semibold">{LANGUAGES.find(l => l.value === language)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Files Uploaded:</span>
                <span className="text-slate-300 font-semibold">{files.length} files</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  PENDING REVIEW
                </span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            A moderator will review your font files and details shortly. Once approved, it will be visible in the public font catalog.
          </p>
          <div className="pt-4 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-slate-700 hover:bg-slate-800"
              onClick={() => {
                setName('');
                setEngine('');
                setEngineVersion('');
                setLanguage('');
                setFiles([]);
                setStatus('idle');
              }}
            >
              Upload Another
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white gap-1.5"
              onClick={() => router.push('/member/dashboard#fonts')}
            >
              Go to Dashboard
              <ArrowRight size={14} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-800 bg-[#161616]/80 backdrop-blur-md shadow-2xl relative overflow-hidden">
      {/* Visual Accent Gradients */}
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-violet-600/15 p-2.5 rounded-xl text-violet-400">
            <Type size={22} />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-white">Font Registry Upload</CardTitle>
            <CardDescription className="text-slate-400">
              Submit your game engine compatible font files for localizations or mods
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Font Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. FC Crayon Regular"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={status !== 'idle'}
                className="bg-slate-900/60 border-slate-800 focus:border-violet-500/50 focus:ring-violet-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="engine" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Target Game Engine <span className="text-rose-500">*</span>
              </Label>
              <Select value={engine} onValueChange={setEngine} disabled={status !== 'idle'}>
                <SelectTrigger id="engine" className="bg-slate-900/60 border-slate-800">
                  <SelectValue placeholder="Select Engine" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-slate-800">
                  {ENGINES.map(eng => (
                    <SelectItem key={eng.value} value={eng.value} className="focus:bg-violet-600 focus:text-white">
                      {eng.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="engineVersion" className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Settings size={13} className="text-slate-500" /> Compatible Engine Version
              </Label>
              <Input
                id="engineVersion"
                placeholder="e.g. Unity 6+, Godot 4.x, or blank for all"
                value={engineVersion}
                onChange={(e) => setEngineVersion(e.target.value)}
                disabled={status !== 'idle'}
                className="bg-slate-900/60 border-slate-800 focus:border-violet-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language" className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe size={13} className="text-slate-500" /> Language <span className="text-rose-500">*</span>
              </Label>
              <Select value={language} onValueChange={setLanguage} disabled={status !== 'idle'}>
                <SelectTrigger id="language" className="bg-slate-900/60 border-slate-800">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-slate-800">
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.value} value={lang.value} className="focus:bg-violet-600">
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File Drag and Drop Zone */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Font Files <span className="text-rose-500">*</span>
            </Label>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={status === 'idle' ? triggerFileSelect : undefined}
              className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3 transition-all ${
                status === 'idle'
                  ? 'border-slate-800 bg-slate-900/10 hover:border-violet-500/50 hover:bg-violet-600/5 cursor-pointer'
                  : 'border-slate-800 bg-slate-900/5 opacity-55'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept=".ttf,.otf,.woff,.woff2,.zip"
                className="hidden"
                disabled={status !== 'idle'}
              />
              <div className="bg-violet-600/10 p-3 rounded-full text-violet-400">
                <Upload size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-200">Click or drag files here to upload</p>
                <p className="text-xs text-slate-500">
                  Supports .ttf, .otf, .woff, .woff2, or .zip archives (max 20MB per file)
                </p>
              </div>
            </div>
          </div>

          {/* Uploading Files Checklist */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Files Queue ({files.length})
              </Label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-900/40 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileCode size={16} className="text-violet-400 shrink-0" />
                      <span className="text-slate-300 truncate font-semibold">{file.name}</span>
                      <span className="text-slate-500 shrink-0 font-mono">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    {status === 'idle' && (
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-slate-500 hover:text-rose-500 transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress Bar */}
          {['creating', 'uploading', 'submitting'].includes(status) && (
            <div className="space-y-2 p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Loader2 size={13} className="animate-spin text-violet-400" />
                  {status === 'creating' && 'Registering font information...'}
                  {status === 'uploading' && `Uploading: ${currentUploadingFile}`}
                  {status === 'submitting' && 'Submitting font for moderation...'}
                </span>
                <span className="font-mono text-slate-300">{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={status !== 'idle' || files.length === 0}
            className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 hover:shadow-[0_4px_20px_rgba(139,123,245,0.4)]"
          >
            {status === 'idle' ? 'Register & Upload Font' : 'Processing Upload...'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

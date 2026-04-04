
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { platforms as allPlatforms } from '@/lib/gameData';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateFormData, DownloadEntry, AuthorizedSourceEntry } from '@/store/features/upload/uploadSlice';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  ShoppingCart,
  Trash2,
  Plus,
  Monitor,
  Smartphone,
  Globe,
  AlertCircle,
  ExternalLink,
  Upload,
  Loader2,
  FileCode
} from 'lucide-react';
import { getSdk } from '@/lib/sdk';

export const Step4_Downloads = () => {
  const dispatch = useAppDispatch();
  const formData = useAppSelector((state) => state.upload.formData);

  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadSubmitNote, setDownloadSubmitNote] = useState('');
  const [downloadIsActive, setDownloadIsActive] = useState(true);
  const [downloadVipOnly, setDownloadVipOnly] = useState(false);
  const [downloadUrlError, setDownloadUrlError] = useState('');
  const [downloadPlatforms, setDownloadPlatforms] = useState<string[]>([]);
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [purchaseName, setPurchaseName] = useState('');
  const [purchaseUrl, setPurchaseUrl] = useState('');
  const [purchaseSubmitNote, setPurchaseSubmitNote] = useState('');
  const [purchaseUrlError, setPurchaseUrlError] = useState('');
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);

  const isValidUrl = (url: string) => {
    if (url.startsWith('public/') || url.startsWith('premium/')) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getDomainName = (url: string) => {
    if (url.startsWith('public/') || url.startsWith('premium/')) return 'Storage';
    try {
      const hostname = new URL(url).hostname;
      const parts = hostname.split('.');
      const domain = parts.length > 2 ? parts[parts.length - 2] : parts[0];
      if (domain.includes('mega')) return 'Mega';
      if (domain.includes('google') && hostname.includes('drive')) return 'Google Drive';
      if (domain.includes('mediafire')) return 'Mediafire';
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch {
      return 'Link';
    }
  };

  const downloads: DownloadEntry[] = Array.isArray(formData.downloads) ? (formData.downloads as DownloadEntry[]) : [];
  const authorizedPurchaseSources: AuthorizedSourceEntry[] = Array.isArray(formData.authorizedPurchaseSources)
    ? (formData.authorizedPurchaseSources as AuthorizedSourceEntry[])
    : [];

  const isDownloadUrlValid = downloadUrl ? isValidUrl(downloadUrl) : false;
  const isPurchaseUrlValid = purchaseUrl ? isValidUrl(purchaseUrl) : false;
  const canAddDownload = isDownloadUrlValid && downloadPlatforms.length > 0;
  const canAddPurchase = purchaseName.trim().length > 0 && isPurchaseUrlValid;

  const selectedPlatforms = Array.isArray(formData.platforms) && formData.platforms.length > 0
    ? formData.platforms
    : allPlatforms;

  const handleAddDownload = () => {
    if (!canAddDownload) return;
    const newDownloads = [...downloads, {
      name: `[${downloadPlatforms.join('/')}] ${getDomainName(downloadUrl)}`,
      url: downloadUrl.trim(),
      submitNote: downloadSubmitNote.trim() || undefined,
      isActive: downloadIsActive,
      vipOnly: downloadVipOnly,
    }];
    dispatch(updateFormData({ downloads: newDownloads }));
    setDownloadUrl('');
    setIsDownloadDialogOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Critical: Ensure slug is reserved before allowing upload
    if (!formData.slug) {
      toast.error("URL reservation required. Please enter a Game Title first.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const sdk = await getSdk();
      const result = await sdk.storage.uploadMultipart(file, { 
        bucket: 'storage',
        path: formData.isPaid ? 'premium' : 'public',
        game: formData.slug, // Always use reserved slug
        onProgress: (percent) => setUploadProgress(percent)
      });
      if (result?.url) {
        setDownloadUrl(result.url);
        toast.success("File uploaded to storage!");
      }
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveDownload = (index: number) => {
    dispatch(updateFormData({ downloads: downloads.filter((_, i) => i !== index) }));
  };

  const getPlatformIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('win') || lowerName.includes('pc')) return <Monitor className="h-4 w-4" />;
    if (lowerName.includes('android') || lowerName.includes('ios')) return <Smartphone className="h-4 w-4" />;
    if (lowerName.includes('web')) return <Globe className="h-4 w-4" />;
    return <FileCode className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Downloads List */}
      <div className="space-y-1.5">
        {downloads.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {downloads.map((dl, i) => (
              <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 bg-[#171717] border border-[#222] rounded-[4px] group">
                <div className={`w-[6px] h-[6px] rounded-full shrink-0 ${dl.vipOnly ? 'bg-[#e8a000]' : 'bg-[#3d3d3d]'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[12px] text-[#aaa] truncate">
                    <span>{dl.name}</span>
                    {dl.vipOnly && <span className="text-[9px] text-[#e8a000] font-bold">VIP</span>}
                    {!dl.isActive && <span className="text-[9px] text-red-500/60 font-bold uppercase">Inactive</span>}
                  </div>
                  <div className="text-[10px] text-[#3d3d3d] mt-0.5 truncate font-mono">{dl.url}</div>
                </div>
                <button
                  className="text-[16px] text-[#333] hover:text-[#cc2f35] transition-all"
                  onClick={() => handleRemoveDownload(i)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Add Link Button (Dashed) */}
      <button 
        onClick={() => setIsDownloadDialogOpen(true)}
        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-dashed border-[#252525] rounded-[4px] bg-transparent text-[#3d3d3d] text-[11px] hover:border-[#3d3d3d] hover:text-[#666] transition-all"
      >
        <Plus className="h-3 w-3" />
        Add link or upload file
      </button>

      <Dialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-[14px]">Add Download Source</DialogTitle>
            <DialogDescription className="text-[11px] text-slate-400">
              Provide a URL or upload a file for your game builds.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Platforms</label>
              <div className="grid grid-cols-2 gap-2 p-3 rounded-md border border-slate-800 bg-slate-900/50">
                {selectedPlatforms.map((platform: string) => (
                  <div key={platform} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dl-${platform}`}
                      checked={downloadPlatforms.includes(platform)}
                      onCheckedChange={(checked) => {
                        setDownloadPlatforms(p => checked ? [...p, platform] : p.filter(x => x !== platform));
                      }}
                    />
                    <Label htmlFor={`dl-${platform}`} className="text-[12px] cursor-pointer text-slate-300">{platform}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Source File or Link</label>
              
              {!formData.slug && (
                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 mb-2">
                  <p className="text-[10px] text-amber-500 flex items-center gap-1.5 font-medium">
                    <AlertCircle className="h-3 w-3" /> Enter game title first to enable storage uploads.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/game.zip"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  className="bg-slate-900 border-slate-700 h-9 text-[13px]"
                />
                <div className="relative">
                  <Input 
                    type="file" 
                    id="dl-file" 
                    className="hidden" 
                    onChange={handleFileUpload} 
                    disabled={isUploading || !formData.slug} 
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => document.getElementById('dl-file')?.click()}
                    disabled={isUploading || !formData.slug}
                    className="h-9 px-3 bg-slate-800 hover:bg-slate-700 border-slate-700 disabled:opacity-30"
                    title={!formData.slug ? "Enter title first" : "Upload file"}
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {isUploading && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-blue-400">Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-6 pt-1">
              <div className="flex items-center gap-2">
                <Switch checked={downloadIsActive} onCheckedChange={setDownloadIsActive} />
                <Label className="text-[12px]">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={downloadVipOnly} onCheckedChange={setDownloadVipOnly} />
                <Label className="text-[12px]">VIP Only</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="bg-slate-900/50 p-4 -m-6 mt-6 rounded-b-lg border-t border-slate-800">
            <Button variant="ghost" onClick={() => setIsDownloadDialogOpen(false)} className="text-[12px] text-slate-400">Cancel</Button>
            <Button onClick={handleAddDownload} disabled={!canAddDownload} className="bg-red-600 hover:bg-red-500 text-[12px] px-6">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

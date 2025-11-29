'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { platforms as allPlatforms } from '@/lib/gameData';
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
} from 'lucide-react';

interface DownloadEntry {
  name: string;
  url: string;
  submitNote?: string;
  isActive?: boolean;
  vipOnly?: boolean;
}

interface AuthorizedSourceEntry {
  name: string;
  url: string;
  submitNote?: string;
}

interface Step4_DownloadsProps {
  formData: {
    downloads?: DownloadEntry[];
    authorizedPurchaseSources?: AuthorizedSourceEntry[];
    platforms?: string[];
    [key: string]: unknown;
  };
  setFormData: (data: Record<string, any>) => void;
}

export const Step4_Downloads = ({ formData, setFormData }: Step4_DownloadsProps) => {
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadSubmitNote, setDownloadSubmitNote] = useState('');
  const [downloadIsActive, setDownloadIsActive] = useState(true);
  const [downloadVipOnly, setDownloadVipOnly] = useState(false);
  const [downloadUrlError, setDownloadUrlError] = useState('');
  const [downloadPlatforms, setDownloadPlatforms] = useState<string[]>([]);
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);

  const [purchaseName, setPurchaseName] = useState('');
  const [purchaseUrl, setPurchaseUrl] = useState('');
  const [purchaseSubmitNote, setPurchaseSubmitNote] = useState('');
  const [purchaseUrlError, setPurchaseUrlError] = useState('');
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getDomainName = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      const parts = hostname.split('.');
      let domain = parts.length > 2 ? parts[parts.length - 2] : parts[0];

      // Common domains simplification
      if (domain.includes('mega')) return 'Mega';
      if (domain.includes('google') && hostname.includes('drive')) return 'Google Drive';
      if (domain.includes('mediafire')) return 'Mediafire';
      if (domain.includes('dropbox')) return 'Dropbox';
      if (domain.includes('onedrive')) return 'OneDrive';
      if (domain.includes('pixeldrain')) return 'Pixeldrain';
      if (domain.includes('gofile')) return 'Gofile';
      if (domain.includes('qiwi')) return 'Qiwi';

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
    if (!canAddDownload) {
      if (!isDownloadUrlValid) setDownloadUrlError('URL must be a valid HTTP or HTTPS URL');
      return;
    }

    setFormData((prev: Record<string, any>) => ({
      ...prev,
      downloads: [
        ...(prev.downloads || []),
        {
          name: `[${downloadPlatforms.join('/')}] ${getDomainName(downloadUrl)}`,
          url: downloadUrl.trim(),
          submitNote: downloadSubmitNote.trim() || undefined,
          isActive: downloadIsActive,
          vipOnly: downloadVipOnly,
        },
      ],
    }));

    setDownloadUrl('');
    setDownloadSubmitNote('');
    setDownloadIsActive(true);
    setDownloadVipOnly(false);
    setDownloadUrlError('');
    setDownloadPlatforms([]);
    setIsDownloadDialogOpen(false);
  };

  const handleAddPurchaseSource = () => {
    if (!canAddPurchase) {
      if (!isPurchaseUrlValid) setPurchaseUrlError('URL must be a valid HTTP or HTTPS URL');
      return;
    }

    setFormData((prev: Record<string, any>) => ({
      ...prev,
      authorizedPurchaseSources: [
        ...(prev.authorizedPurchaseSources || []),
        {
          name: purchaseName.trim(),
          url: purchaseUrl.trim(),
          submitNote: purchaseSubmitNote.trim() || undefined,
        },
      ],
    }));

    setPurchaseName('');
    setPurchaseUrl('');
    setPurchaseSubmitNote('');
    setPurchaseUrlError('');
    setIsPurchaseDialogOpen(false);
  };

  const handleRemoveDownload = (indexToRemove: number) => {
    setFormData((prev: Record<string, any>) => ({ ...prev, downloads: prev.downloads.filter((_: any, index: number) => index !== indexToRemove) }));
  };

  const handleRemovePurchaseSource = (indexToRemove: number) => {
    setFormData((prev: Record<string, any>) => ({
      ...prev,
      authorizedPurchaseSources: (prev.authorizedPurchaseSources || []).filter((_: any, index: number) => index !== indexToRemove),
    }));
  };

  const getPlatformIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('win') || lowerName.includes('pc') || lowerName.includes('linux') || lowerName.includes('mac')) return <Monitor className="h-4 w-4" />;
    if (lowerName.includes('android') || lowerName.includes('ios') || lowerName.includes('mobile')) return <Smartphone className="h-4 w-4" />;
    if (lowerName.includes('web')) return <Globe className="h-4 w-4" />;
    return <Download className="h-4 w-4" />;
  };

  return (
    <div className="space-y-8">
      {/* Download Links Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Download Links</h3>
            <p className="text-sm text-muted-foreground">Provide downloadable builds or assets.</p>
          </div>
          <Dialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Link
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] text-foreground">
              <DialogHeader>
                <DialogTitle>Add Download Link</DialogTitle>
                <DialogDescription>
                  Add a new download link for your game. Select platforms and provide a valid URL.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <div className="grid grid-cols-2 gap-2 p-3 border rounded-md bg-muted/20">
                    {selectedPlatforms.map((platform: string) => (
                      <div key={platform} className="flex items-center space-x-2">
                        <Checkbox
                          id={`download-platform-${platform}`}
                          checked={downloadPlatforms.includes(platform)}
                          onCheckedChange={(checked) => {
                            setDownloadPlatforms((prev) =>
                              checked ? [...prev, platform] : prev.filter((p) => p !== platform)
                            );
                          }}
                        />
                        <Label htmlFor={`download-platform-${platform}`} className="cursor-pointer">{platform}</Label>
                      </div>
                    ))}
                  </div>
                  {downloadPlatforms.length === 0 && <p className="text-xs text-muted-foreground">Select at least one platform.</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="downloadUrl">URL</Label>
                  <Input
                    id="downloadUrl"
                    placeholder="https://example.com/file.zip"
                    value={downloadUrl}
                    onChange={(e) => {
                      setDownloadUrl(e.target.value);
                      setDownloadUrlError('');
                    }}
                  />
                  {downloadUrlError && <p className="text-sm text-destructive">{downloadUrlError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="downloadSubmitNote">Reviewer note (optional)</Label>
                  <Input
                    id="downloadSubmitNote"
                    placeholder="Provide context for moderators"
                    value={downloadSubmitNote}
                    onChange={(e) => setDownloadSubmitNote(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <Switch id="downloadActive" checked={downloadIsActive} onCheckedChange={(checked) => setDownloadIsActive(!!checked)} />
                    <Label htmlFor="downloadActive">Active</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="downloadVipOnly" checked={downloadVipOnly} onCheckedChange={(checked) => setDownloadVipOnly(!!checked)} />
                    <Label htmlFor="downloadVipOnly">VIP Only</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDownloadDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddDownload} disabled={!canAddDownload}>Add Link</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {downloads.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {downloads.map((download, index) => (
              <Card key={`${download.url}-${index}`} className="relative overflow-hidden group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10 text-primary">
                        {getPlatformIcon(download.name)}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium leading-none truncate max-w-[150px] sm:max-w-[200px]" title={download.name}>
                          {download.name}
                        </p>
                        <a
                          href={download.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 truncate max-w-[150px]"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {new URL(download.url).hostname}
                        </a>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
                      onClick={() => handleRemoveDownload(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {download.vipOnly && <Badge variant="secondary" className="text-xs">VIP Only</Badge>}
                    {!download.isActive && <Badge variant="destructive" className="text-xs">Inactive</Badge>}
                    {download.submitNote && (
                      <div className="w-full mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded flex items-start gap-2">
                        <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                        <span>{download.submitNote}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/10">
            <Download className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No download links added yet.</p>
            <Button variant="link" onClick={() => setIsDownloadDialogOpen(true)}>Add your first link</Button>
          </div>
        )}
      </div>

      {/* Authorized Sources Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Authorized Sources</h3>
            <p className="text-sm text-muted-foreground">Official purchase channels (Steam, Itch.io, etc).</p>
          </div>
          <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Add Source
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] text-foreground">
              <DialogHeader>
                <DialogTitle>Add Authorized Source</DialogTitle>
                <DialogDescription>
                  Link to official storefronts where players can support the game.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="purchaseSourceName">Name</Label>
                  <Input
                    id="purchaseSourceName"
                    placeholder="e.g. Steam, Itch.io"
                    value={purchaseName}
                    onChange={(e) => setPurchaseName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseSourceUrl">URL</Label>
                  <Input
                    id="purchaseSourceUrl"
                    placeholder="https://store.steampowered.com/app/..."
                    value={purchaseUrl}
                    onChange={(e) => {
                      setPurchaseUrl(e.target.value);
                      setPurchaseUrlError('');
                    }}
                  />
                  {purchaseUrlError && <p className="text-sm text-destructive">{purchaseUrlError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseSourceSubmitNote">Reviewer note (optional)</Label>
                  <Input
                    id="purchaseSourceSubmitNote"
                    placeholder="Provide context for moderators"
                    value={purchaseSubmitNote}
                    onChange={(e) => setPurchaseSubmitNote(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPurchaseDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddPurchaseSource} disabled={!canAddPurchase}>Add Source</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {authorizedPurchaseSources.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {authorizedPurchaseSources.map((source, index) => (
              <Card key={`${source.url}-${index}`} className="relative overflow-hidden group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-secondary text-secondary-foreground">
                        <ShoppingCart className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium leading-none truncate max-w-[150px] sm:max-w-[200px]" title={source.name}>
                          {source.name}
                        </p>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 truncate max-w-[150px]"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {new URL(source.url).hostname}
                        </a>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
                      onClick={() => handleRemovePurchaseSource(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {source.submitNote && (
                    <div className="mt-3 w-full text-xs text-muted-foreground bg-muted/50 p-2 rounded flex items-start gap-2">
                      <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>{source.submitNote}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/10">
            <ShoppingCart className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No authorized sources added yet.</p>
            <Button variant="link" onClick={() => setIsPurchaseDialogOpen(true)}>Add a source</Button>
          </div>
        )}
      </div>
    </div>
  );
};


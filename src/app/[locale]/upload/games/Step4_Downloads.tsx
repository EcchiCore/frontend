'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
    [key: string]: unknown;
  };
  setFormData: (data: Record<string, any>) => void;
}

export const Step4_Downloads = ({ formData, setFormData }: Step4_DownloadsProps) => {
  const [downloadName, setDownloadName] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadSubmitNote, setDownloadSubmitNote] = useState('');
  const [downloadIsActive, setDownloadIsActive] = useState(true);
  const [downloadVipOnly, setDownloadVipOnly] = useState(false);
  const [downloadUrlError, setDownloadUrlError] = useState('');

  const [purchaseName, setPurchaseName] = useState('');
  const [purchaseUrl, setPurchaseUrl] = useState('');
  const [purchaseSubmitNote, setPurchaseSubmitNote] = useState('');
  const [purchaseUrlError, setPurchaseUrlError] = useState('');

  const [showDownloadForm, setShowDownloadForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const downloads: DownloadEntry[] = Array.isArray(formData.downloads) ? (formData.downloads as DownloadEntry[]) : [];
  const authorizedPurchaseSources: AuthorizedSourceEntry[] = Array.isArray(formData.authorizedPurchaseSources)
    ? (formData.authorizedPurchaseSources as AuthorizedSourceEntry[])
    : [];

  const isDownloadUrlValid = downloadUrl ? isValidUrl(downloadUrl) : false;
  const isPurchaseUrlValid = purchaseUrl ? isValidUrl(purchaseUrl) : false;
  const canAddDownload = downloadName.trim().length > 0 && isDownloadUrlValid;
  const canAddPurchase = purchaseName.trim().length > 0 && isPurchaseUrlValid;

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
          name: downloadName.trim(),
          url: downloadUrl.trim(),
          submitNote: downloadSubmitNote.trim() || undefined,
          isActive: downloadIsActive,
          vipOnly: downloadVipOnly,
        },
      ],
    }));

    setDownloadName('');
    setDownloadUrl('');
    setDownloadSubmitNote('');
    setDownloadIsActive(true);
    setDownloadVipOnly(false);
    setDownloadUrlError('');
    setShowDownloadForm(false);
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
    setShowPurchaseForm(false);
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

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Download Links</CardTitle>
          <CardDescription>Provide downloadable builds or assets for players.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {downloads.length > 0 ? (
            <div className="space-y-3">
              {downloads.map((download, index) => (
                <div key={`${download.url}-${index}`} className="space-y-3 rounded-md border bg-muted/30 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1 min-w-0">
                      <p className="font-medium text-foreground truncate" title={download.name}>
                        {download.name}
                      </p>
                      <a
                        href={download.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary break-all"
                      >
                        {download.url}
                      </a>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>
                        Active:{' '}
                        <span className="font-medium text-foreground">{download.isActive === false ? 'No' : 'Yes'}</span>
                      </span>
                      <span>
                        VIP only:{' '}
                        <span className="font-medium text-foreground">{download.vipOnly ? 'Yes' : 'No'}</span>
                      </span>
                    </div>
                  </div>
                  {download.submitNote && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Reviewer note:</span> {download.submitNote}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveDownload(index)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No download links added yet.</p>
          )}

          {showDownloadForm ? (
            <div className="space-y-4 rounded-md border border-dashed p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="downloadName">Name</Label>
                  <Input
                    id="downloadName"
                    placeholder="Windows build"
                    value={downloadName}
                    onChange={(e) => setDownloadName(e.target.value)}
                  />
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
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Switch id="downloadActive" checked={downloadIsActive} onCheckedChange={(checked) => setDownloadIsActive(!!checked)} />
                  <Label htmlFor="downloadActive">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="downloadVipOnly" checked={downloadVipOnly} onCheckedChange={(checked) => setDownloadVipOnly(!!checked)} />
                  <Label htmlFor="downloadVipOnly">VIP Only</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDownloadForm(false);
                    setDownloadName('');
                    setDownloadUrl('');
                    setDownloadSubmitNote('');
                    setDownloadIsActive(true);
                    setDownloadVipOnly(false);
                    setDownloadUrlError('');
                  }}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={handleAddDownload} disabled={!canAddDownload}>
                  Add link
                </Button>
              </div>
            </div>
          ) : (
            <Button type="button" variant="outline" onClick={() => setShowDownloadForm(true)}>
              Add download link
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Authorized Purchase Sources</CardTitle>
          <CardDescription>Add official purchase channels for your game.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {authorizedPurchaseSources.length > 0 ? (
            <div className="space-y-3">
              {authorizedPurchaseSources.map((purchaseSource, index) => (
                <div key={`${purchaseSource.url}-${index}`} className="space-y-3 rounded-md border bg-muted/30 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1 min-w-0">
                      <p className="font-medium text-foreground truncate" title={purchaseSource.name}>
                        {purchaseSource.name}
                      </p>
                      <a
                        href={purchaseSource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary break-all"
                      >
                        {purchaseSource.url}
                      </a>
                    </div>
                  </div>
                  {purchaseSource.submitNote && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Reviewer note:</span> {purchaseSource.submitNote}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <Button variant="destructive" size="sm" onClick={() => handleRemovePurchaseSource(index)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No authorized purchase sources added yet.</p>
          )}

          {showPurchaseForm ? (
            <div className="space-y-4 rounded-md border border-dashed p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="purchaseSourceName">Name</Label>
                  <Input
                    id="purchaseSourceName"
                    placeholder="Official Storefront"
                    value={purchaseName}
                    onChange={(e) => setPurchaseName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseSourceUrl">URL</Label>
                  <Input
                    id="purchaseSourceUrl"
                    placeholder="https://example.com/purchase"
                    value={purchaseUrl}
                    onChange={(e) => {
                      setPurchaseUrl(e.target.value);
                      setPurchaseUrlError('');
                    }}
                  />
                  {purchaseUrlError && <p className="text-sm text-destructive">{purchaseUrlError}</p>}
                </div>
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
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPurchaseForm(false);
                    setPurchaseName('');
                    setPurchaseUrl('');
                    setPurchaseSubmitNote('');
                    setPurchaseUrlError('');
                  }}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={handleAddPurchaseSource} disabled={!canAddPurchase}>
                  Add authorized source
                </Button>
              </div>
            </div>
          ) : (
            <Button type="button" variant="outline" onClick={() => setShowPurchaseForm(true)}>
              Add authorized source
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

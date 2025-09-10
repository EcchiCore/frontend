'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Step4_DownloadsProps {
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
}

export const Step4_Downloads = ({ formData, setFormData }: Step4_DownloadsProps) => {
  const [downloadName, setDownloadName] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [downloadUrlError, setDownloadUrlError] = useState('');
  const [sourceUrlError, setSourceUrlError] = useState('');

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddDownload = () => {
    if (!downloadName) {
      // Optionally, add error for missing name
      return;
    }
    if (!isValidUrl(downloadUrl)) {
      setDownloadUrlError('URL must be a valid HTTP or HTTPS URL');
      return;
    }
    setDownloadUrlError(''); // Clear error if valid

    const newDownloads = [...(formData.downloads || []), { name: downloadName, url: downloadUrl }];
    setFormData({ ...formData, downloads: newDownloads });
    setDownloadName('');
    setDownloadUrl('');
  };

  const handleAddSource = () => {
    if (!sourceName) {
      // Optionally, add error for missing name
      return;
    }
    if (!isValidUrl(sourceUrl)) {
      setSourceUrlError('URL must be a valid HTTP or HTTPS URL');
      return;
    }
    setSourceUrlError(''); // Clear error if valid

    const newSources = [...(formData.sources || []), { name: sourceName, url: sourceUrl }];
    setFormData({ ...formData, sources: newSources });
    setSourceName('');
    setSourceUrl('');
  };

  const handleRemoveDownload = (indexToRemove: number) => {
    const updatedDownloads = formData.downloads.filter((_: any, index: number) => index !== indexToRemove);
    setFormData({ ...formData, downloads: updatedDownloads });
  };

  const handleRemoveSource = (indexToRemove: number) => {
    const updatedSources = formData.sources.filter((_: any, index: number) => index !== indexToRemove);
    setFormData({ ...formData, sources: updatedSources });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium">Download Links</h3>
        <div className="space-y-4 mt-4">
          {formData.downloads?.map((download: { name: string, url: string }, index: number) => (
            <div key={index} className="flex items-center gap-4">
              <Input value={download.name} disabled />
              <Input value={download.url} disabled />
              <Button variant="destructive" onClick={() => handleRemoveDownload(index)}>Remove</Button>
            </div>
          ))}
        </div>
        <div className="flex items-end gap-4 mt-4">
          <div className="w-full">
            <Label htmlFor="downloadName">Name</Label>
            <Input id="downloadName" value={downloadName} onChange={(e: { target: { value: string } }) => setDownloadName(e.target.value)} />
          </div>
          <div className="w-full">
            <Label htmlFor="downloadUrl">URL</Label>
            <Input id="downloadUrl" value={downloadUrl} onChange={(e: { target: { value: string } }) => setDownloadUrl(e.target.value)} />
            {downloadUrlError && <p className="text-red-500 text-sm mt-1">{downloadUrlError}</p>}
          </div>
          <Button onClick={handleAddDownload}>Add</Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Official Download Sources</h3>
        <div className="space-y-4 mt-4">
          {formData.sources?.map((source: { name: string, url: string }, index: number) => (
            <div key={index} className="flex items-center gap-4">
              <Input value={source.name} disabled />
              <Input value={source.url} disabled />
              <Button variant="destructive" onClick={() => handleRemoveSource(index)}>Remove</Button>
            </div>
          ))}
        </div>
        <div className="flex items-end gap-4 mt-4">
          <div className="w-full">
            <Label htmlFor="sourceName">Name</Label>
            <Input id="sourceName" value={sourceName} onChange={(e: { target: { value: string } }) => setSourceName(e.target.value)} />
          </div>
          <div className="w-full">
            <Label htmlFor="sourceUrl">URL</Label>
            <Input id="sourceUrl" value={sourceUrl} onChange={(e: { target: { value: string } }) => setSourceUrl(e.target.value)} />
            {sourceUrlError && <p className="text-red-500 text-sm mt-1">{sourceUrlError}</p>}
          </div>
          <Button onClick={handleAddSource}>Add</Button>
        </div>
      </div>
    </div>
  );
};

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface Step3_MediaProps {
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
  setOngoingUploads: (updater: (prev: number) => number) => void;
}

export const Step3_Media = ({ formData, setFormData, setOngoingUploads }: Step3_MediaProps) => {
  const [uploadDestination, setUploadDestination] = useState('auto');

  const getUploadUrl = () => {
    if (uploadDestination === 'rustgram') {
      return 'https://rustgram.onrender.com/upload';
    }
    if (uploadDestination === 'oi.chanomhub.online') {
      return 'https://oi.chanomhub.online/upload';
    }
    // 'auto' logic can be implemented here. For now, it defaults to rustgram.
    return 'https://rustgram.onrender.com/upload';
  };

  const handleFileChange = async (e: { target: { id: string; files: FileList | null } }) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      setOngoingUploads(prev => prev + 1);
      try {
        const response = await fetch(getUploadUrl(), {
          method: 'POST',
          body: uploadFormData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const result = await response.json();
        const domain = getUploadUrl().replace('/upload', '');
        const url = result.url.startsWith('http') ? result.url : `${domain}${result.url}`;
        setFormData((prevFormData: Record<string, any>) => ({ ...prevFormData, [e.target.id]: url }));
      } catch (error) {
        console.error('Error uploading file:', error);
        // Handle error, maybe show a message to the user
      } finally {
        setOngoingUploads(prev => prev - 1);
      }
    }
  };

  const handleMultipleFileChange = async (e: { target: { id: string; files: FileList | null } }) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setOngoingUploads(prev => prev + files.length);
      try {
        const urls = await Promise.all(files.map(async (file) => {
          const uploadFormData = new FormData();
          uploadFormData.append('file', file);
          const response = await fetch(getUploadUrl(), {
            method: 'POST',
            body: uploadFormData,
          });
          if (!response.ok) {
            throw new Error(`Upload failed for ${file.name}`);
          }
          const result = await response.json();
          const domain = getUploadUrl().replace('/upload', '');
          const url = result.url.startsWith('http') ? result.url : `${domain}${result.url}`;
          setOngoingUploads(prev => prev - 1);
          return url;
        }));
        setFormData((prevFormData: Record<string, any>) => ({ ...prevFormData, [e.target.id]: urls }));
      } catch (error) {
        console.error('Error uploading multiple files:', error);
        // Handle error, maybe show a message to the user
      } finally {
        // In case of an error that stops Promise.all, we might have lingering counts.
        // A more robust solution would be needed if that becomes an issue.
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="uploadDestination">Upload Destination</Label>
        <Select onValueChange={setUploadDestination} defaultValue={uploadDestination}>
          <SelectTrigger>
            <SelectValue placeholder="Select an upload destination" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto</SelectItem>
            <SelectItem value="rustgram">rustgram.onrender.com</SelectItem>
            <SelectItem value="oi.chanomhub.online">oi.chanomhub.online</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="coverImage">Cover Image</Label>
          <Input id="coverImage" type="file" accept="image/*" onChange={handleFileChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mainImage">Main Image</Label>
          <Input id="mainImage" type="file" accept="image/*" onChange={handleFileChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="backgroundImage">Background Image</Label>
          <Input id="backgroundImage" type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="otherImages">Other Images</Label>
          <Input id="otherImages" type="file" accept="image/*" multiple onChange={handleMultipleFileChange} />
        </div>
      </div>
    </div>
  );
};

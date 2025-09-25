import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Turnstile } from '@marsidev/react-turnstile';
import { useState } from 'react';

interface Step3_MediaProps {
  setFormData: (data: Record<string, any>) => void;
  setOngoingUploads: (updater: (prev: number) => number) => void;
}

export const Step3_Media = ({ setFormData, setOngoingUploads }: Step3_MediaProps) => {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const getUploadUrl = () => {
    return 'https://oi.chanomhub.online/upload';
  };

  const uploadFileWithRetry = async (file: File, uploadUrl: string, maxRetries = 3) => {
    if (!turnstileToken) {
      throw new Error('Please complete the CAPTCHA before uploading.');
    }

    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('cf-turnstile-response', turnstileToken);

        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: uploadFormData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed with status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        attempt++;
        console.error(`Attempt ${attempt} failed for ${file.name}:`, error);
        if (attempt >= maxRetries) {
          throw error; // Re-throw the last error
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
    }
  };

  const pollForUrl = async (statusUrl: string, maxRetries = 10): Promise<string> => {
    let attempt = 0;
    const domain = getUploadUrl().replace('/upload', '');
    const fullStatusUrl = statusUrl.startsWith('http') ? statusUrl : `${domain}${statusUrl}`;

    while (attempt < maxRetries) {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        const response = await fetch(fullStatusUrl);
        const data = await response.json();

        if (response.ok && data.status === 'Completed' && data.response && data.response.url) {
          const finalUrl = data.response.url;
          return finalUrl.startsWith('http') ? finalUrl : `${domain}${finalUrl}`;
        }

      } catch (error) {
        console.error(`Polling attempt ${attempt + 1} failed:`, error);
      }
      attempt++;
    }
    throw new Error('Failed to retrieve file URL after multiple attempts.');
  };

  const handleFileChange = async (e: { target: { id: string; files: FileList | null } }) => {
    if (!turnstileToken) {
      alert('Please complete the CAPTCHA before uploading.');
      return;
    }
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOngoingUploads(prev => prev + 1);
      try {
        const initialResult = await uploadFileWithRetry(file, getUploadUrl());
        if (!initialResult || !initialResult.status_url) {
          throw new Error('Upload initiation failed or did not return a status URL.');
        }

        const finalUrl = await pollForUrl(initialResult.status_url);
        setFormData((prevFormData: Record<string, any>) => ({ ...prevFormData, [e.target.id]: finalUrl }));

      } catch (error) {
        console.error('Error during file upload process:', error);
        alert('An error occurred during upload. Please try again.');
      } finally {
        setOngoingUploads(prev => prev - 1);
      }
    }
  };

  const handleMultipleFileChange = async (e: { target: { id: string; files: FileList | null } }) => {
    if (!turnstileToken) {
      alert('Please complete the CAPTCHA before uploading.');
      return;
    }
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setOngoingUploads(prev => prev + files.length);

      const uploadAndPoll = async (file: File): Promise<string> => {
        try {
          const initialResult = await uploadFileWithRetry(file, getUploadUrl());
          if (!initialResult || !initialResult.status_url) {
            throw new Error(`Upload initiation failed for ${file.name}`);
          }
          return await pollForUrl(initialResult.status_url);
        } finally {
          setOngoingUploads(prev => prev - 1);
        }
      };

      try {
        const urls = await Promise.all(files.map(uploadAndPoll));
        setFormData((prevFormData: Record<string, any>) => ({ ...prevFormData, [e.target.id]: urls }));
      } catch (error) {
        console.error('Error uploading multiple files:', error);
        alert('An error occurred during upload. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center my-4">
        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY!}
          onSuccess={setTurnstileToken}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="coverImage">Cover Image</Label>
          <Input id="coverImage" type="file" accept="image/*" onChange={handleFileChange} required disabled={!turnstileToken} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mainImage">Main Image</Label>
          <Input id="mainImage" type="file" accept="image/*" onChange={handleFileChange} disabled={!turnstileToken} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="backgroundImage">Background Image</Label>
          <Input id="backgroundImage" type="file" accept="image/*" onChange={handleFileChange} disabled={!turnstileToken} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="otherImages">Other Images</Label>
          <Input id="otherImages" type="file" accept="image/*" multiple onChange={handleMultipleFileChange} disabled={!turnstileToken} />
        </div>
      </div>
    </div>
  );
};

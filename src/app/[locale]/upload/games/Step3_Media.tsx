
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppDispatch } from '@/store/hooks';
import { updateFormData, incrementOngoingUploads, decrementOngoingUploads } from '@/store/features/upload/uploadSlice';

export const Step3_Media = () => {
  const dispatch = useAppDispatch();

  const getUploadUrl = () => {
    return 'https://oi.chanomhub.online/upload';
  };

  const uploadFileWithRetry = async (file: File, uploadUrl: string, maxRetries = 3) => {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);

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
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      dispatch(incrementOngoingUploads());
      try {
        const initialResult = await uploadFileWithRetry(file, getUploadUrl());

        let finalUrl: string;
        if (initialResult && initialResult.url) {
          finalUrl = initialResult.url;
        } else if (initialResult && initialResult.status_url) {
          finalUrl = await pollForUrl(initialResult.status_url);
        } else {
          throw new Error('Upload initiation failed or did not return a status or final URL.');
        }

        dispatch(updateFormData({ [e.target.id]: finalUrl }));

      } catch (error) {
        console.error('Error during file upload process:', error);
        alert(`An error occurred during upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        dispatch(decrementOngoingUploads());
      }
    }
  };

  const handleMultipleFileChange = async (e: { target: { id: string; files: FileList | null } }) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      for (let i = 0; i < files.length; i++) dispatch(incrementOngoingUploads());

      const uploadAndPoll = async (file: File): Promise<string> => {
        try {
          const initialResult = await uploadFileWithRetry(file, getUploadUrl());
          if (initialResult && initialResult.url) {
            return initialResult.url;
          } else if (initialResult && initialResult.status_url) {
            return await pollForUrl(initialResult.status_url);
          } else {
            throw new Error(`Upload initiation failed for ${file.name}`);
          }
        } finally {
          dispatch(decrementOngoingUploads());
        }
      };

      try {
        const urls = await Promise.all(files.map(uploadAndPoll));
        dispatch(updateFormData({ [e.target.id]: urls }));
      } catch (error) {
        console.error('Error uploading multiple files:', error);
        alert(`An error occurred during upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="coverImage">Cover Image (Required)</Label>
          <Input id="coverImage" type="file" accept="image/*" onChange={handleFileChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mainImage">Main Image (Optional)</Label>
          <Input id="mainImage" type="file" accept="image/*" onChange={handleFileChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="backgroundImage">Background Image (Optional)</Label>
          <Input id="backgroundImage" type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="otherImages">Other Images (Optional)</Label>
          <Input id="otherImages" type="file" accept="image/*" multiple onChange={handleMultipleFileChange} />
        </div>
      </div>
    </div>
  );
};
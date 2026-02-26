
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateFormData, incrementOngoingUploads, decrementOngoingUploads, setOngoingUploads } from '@/store/features/upload/uploadSlice';
import { Loader2, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

const UPLOAD_TIMEOUT_MS = 30_000; // 30 seconds
const POLL_TIMEOUT_MS = 30_000;   // 30 seconds total for polling

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface FileUploadState {
  status: UploadStatus;
  fileName?: string;
  error?: string;
}

export const Step3_Media = () => {
  const dispatch = useAppDispatch();
  const { ongoingUploads, formData } = useAppSelector((state) => state.upload);

  const [fileStates, setFileStates] = useState<Record<string, FileUploadState>>({
    coverImage: { status: 'idle' },
    mainImage: { status: 'idle' },
    backgroundImage: { status: 'idle' },
    otherImages: { status: 'idle' },
  });

  const getUploadUrl = () => {
    return 'https://oi.chanomhub.com/upload';
  };

  const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const uploadFileWithRetry = async (file: File, uploadUrl: string, maxRetries = 3) => {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);

        const response = await fetchWithTimeout(uploadUrl, {
          method: 'POST',
          body: uploadFormData,
        }, UPLOAD_TIMEOUT_MS);

        if (!response.ok) {
          throw new Error(`Upload failed with status: ${response.status}`);
        }

        return await response.json();
      } catch (error: any) {
        attempt++;
        if (error.name === 'AbortError') {
          throw new Error(`Upload timed out for ${file.name} (attempt ${attempt})`);
        }
        console.error(`Attempt ${attempt} failed for ${file.name}:`, error);
        if (attempt >= maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const pollForUrl = async (statusUrl: string, maxRetries = 10): Promise<string> => {
    let attempt = 0;
    const domain = getUploadUrl().replace('/upload', '');
    const fullStatusUrl = statusUrl.startsWith('http') ? statusUrl : `${domain}${statusUrl}`;
    const startTime = Date.now();

    while (attempt < maxRetries) {
      // Check total polling timeout
      if (Date.now() - startTime > POLL_TIMEOUT_MS) {
        throw new Error('Polling timed out waiting for file URL.');
      }

      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const response = await fetchWithTimeout(fullStatusUrl, {}, 10_000);
        const data = await response.json();

        if (response.ok && data.status === 'Completed' && data.response && data.response.url) {
          const finalUrl = data.response.url;
          return finalUrl.startsWith('http') ? finalUrl : `${domain}${finalUrl}`;
        }

      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.error(`Polling attempt ${attempt + 1} timed out`);
        } else {
          console.error(`Polling attempt ${attempt + 1} failed:`, error);
        }
      }
      attempt++;
    }
    throw new Error('Failed to retrieve file URL after multiple attempts.');
  };

  const updateFileState = (id: string, state: Partial<FileUploadState>) => {
    setFileStates(prev => ({ ...prev, [id]: { ...prev[id], ...state } }));
  };

  const handleFileChange = async (e: { target: { id: string; files: FileList | null } }) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fieldId = e.target.id;

      updateFileState(fieldId, { status: 'uploading', fileName: file.name, error: undefined });
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

        dispatch(updateFormData({ [fieldId]: finalUrl }));
        updateFileState(fieldId, { status: 'success' });

      } catch (error) {
        console.error('Error during file upload process:', error);
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        updateFileState(fieldId, { status: 'error', error: errorMsg });
      } finally {
        dispatch(decrementOngoingUploads());
      }
    }
  };

  const handleMultipleFileChange = async (e: { target: { id: string; files: FileList | null } }) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const fieldId = e.target.id;

      updateFileState(fieldId, {
        status: 'uploading',
        fileName: `${files.length} files`,
        error: undefined,
      });

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
        dispatch(updateFormData({ [fieldId]: urls }));
        updateFileState(fieldId, { status: 'success' });
      } catch (error) {
        console.error('Error uploading multiple files:', error);
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        updateFileState(fieldId, { status: 'error', error: errorMsg });
      }
    }
  };

  const handleResetUploads = () => {
    dispatch(setOngoingUploads(0));
    setFileStates({
      coverImage: { status: 'idle' },
      mainImage: { status: 'idle' },
      backgroundImage: { status: 'idle' },
      otherImages: { status: 'idle' },
    });
  };

  const StatusIndicator = ({ fieldId }: { fieldId: string }) => {
    const state = fileStates[fieldId];
    if (!state || state.status === 'idle') return null;

    const uploadedUrl = formData[fieldId];

    return (
      <div className="mt-1 flex items-center gap-2 text-sm">
        {state.status === 'uploading' && (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
            <span className="text-blue-400">Uploading {state.fileName}...</span>
          </>
        )}
        {state.status === 'success' && (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span className="text-green-400 truncate max-w-xs" title={typeof uploadedUrl === 'string' ? uploadedUrl : undefined}>
              Uploaded ✓
            </span>
          </>
        )}
        {state.status === 'error' && (
          <>
            <XCircle className="h-4 w-4 text-red-400" />
            <span className="text-red-400 truncate max-w-xs" title={state.error}>
              Failed: {state.error}
            </span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {ongoingUploads > 0 && (
        <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-blue-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading {ongoingUploads} file{ongoingUploads > 1 ? 's' : ''}...</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetUploads}
            className="text-yellow-400 hover:text-yellow-300 text-xs gap-1"
            title="Force reset if uploads are stuck"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="coverImage">Cover Image (Required)</Label>
          <Input
            id="coverImage"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={fileStates.coverImage?.status === 'uploading'}
            required
          />
          <StatusIndicator fieldId="coverImage" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mainImage">Main Image (Optional)</Label>
          <Input
            id="mainImage"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={fileStates.mainImage?.status === 'uploading'}
          />
          <StatusIndicator fieldId="mainImage" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="backgroundImage">Background Image (Optional)</Label>
          <Input
            id="backgroundImage"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={fileStates.backgroundImage?.status === 'uploading'}
          />
          <StatusIndicator fieldId="backgroundImage" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="otherImages">Other Images (Optional)</Label>
          <Input
            id="otherImages"
            type="file"
            accept="image/*"
            multiple
            onChange={handleMultipleFileChange}
            disabled={fileStates.otherImages?.status === 'uploading'}
          />
          <StatusIndicator fieldId="otherImages" />
        </div>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateFormData, incrementOngoingUploads, decrementOngoingUploads, setOngoingUploads } from '@/store/features/upload/uploadSlice';
import { Loader2, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { getSdk } from '@/lib/sdk';

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
        const sdk = await getSdk();
        const result = await sdk.storage.upload(file, { bucket: 'images' });

        if (!result || !result.url) {
          throw new Error('Upload failed: No URL returned');
        }

        dispatch(updateFormData({ [fieldId]: result.url }));
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

      const uploadOne = async (file: File): Promise<string> => {
        try {
          const sdk = await getSdk();
          const result = await sdk.storage.upload(file, { bucket: 'images' });
          if (!result || !result.url) {
            throw new Error(`Upload failed for ${file.name}`);
          }
          return result.url;
        } finally {
          dispatch(decrementOngoingUploads());
        }
      };

      try {
        const urls = await Promise.all(files.map(uploadOne));
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
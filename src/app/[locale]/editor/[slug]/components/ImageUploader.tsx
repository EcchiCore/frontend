import React, { useRef, useState, DragEvent, ClipboardEvent } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinkIcon from '@mui/icons-material/Link';
import Image from 'next/image';
import myImageLoader from "../../../lib/imageLoader";

interface ImageUploadProps {
  onFileUpload: (urls: string[]) => void;
  multiple?: boolean;
  label?: string;
  chunkSize?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
                                                          onFileUpload,
                                                          multiple = false,
                                                          label = 'Upload Image',
                                                          chunkSize = 1024 * 1024, // Default chunk size: 1MB
                                                        }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Function to split a file into chunks
  const createFileChunks = (file: File, chunkSizeBytes: number): Blob[] => {
    const chunks: Blob[] = [];
    let start = 0;

    while (start < file.size) {
      const end = Math.min(start + chunkSizeBytes, file.size);
      chunks.push(file.slice(start, end));
      start = end;
    }

    return chunks;
  };

  // Upload file chunks one by one
  const uploadFileChunks = async (file: File): Promise<string> => {
    const fileName = encodeURIComponent(file.name);
    const fileType = file.type;
    const totalSize = file.size;
    const chunks = createFileChunks(file, chunkSize);
    const uploadId = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 15);

    // First, initialize the chunked upload
    const initResponse = await fetch('/api/files/init-chunked-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        fileType,
        totalSize,
        totalChunks: chunks.length,
        uploadId,
      }),
    });

    if (!initResponse.ok) {
      const error = await initResponse.json();
      throw new Error(error.message || 'Failed to initialize upload');
    }

    // Upload each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunkFormData = new FormData();
      chunkFormData.append('chunk', chunks[i]);
      chunkFormData.append('uploadId', uploadId);
      chunkFormData.append('chunkIndex', i.toString());
      chunkFormData.append('totalChunks', chunks.length.toString());

      const chunkResponse = await fetch('/api/files/upload-chunk', {
        method: 'POST',
        body: chunkFormData,
      });

      if (!chunkResponse.ok) {
        const error = await chunkResponse.json();
        throw new Error(error.message || `Failed to upload chunk ${i + 1}`);
      }

      // Update progress based on completed chunks
      const chunkProgress = ((i + 1) / chunks.length) * 100;
      setUploadProgress(chunkProgress);
    }

    // Finally, complete the upload
    const completeResponse = await fetch('/api/files/complete-chunked-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uploadId,
        fileName,
        fileType,
      }),
    });

    if (!completeResponse.ok) {
      const error = await completeResponse.json();
      throw new Error(error.message || 'Failed to complete upload');
    }

    const result = await completeResponse.json();
    return result.url;
  };

  const uploadFile = async (file: File): Promise<string> => {
    // If file is larger than chunk size, use chunked upload
    if (file.size > chunkSize) {
      return uploadFileChunks(file);
    }

    // Otherwise use regular upload
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    const response = await fetch('/api/files/upload', {
      method: 'POST',
      body: uploadFormData,
    });
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    const result = await response.json();
    return result.url;
  };

  const uploadUrl = async (url: string): Promise<string> => {
    const response = await fetch('/api/files/upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    if (!response.ok) {
      throw new Error('URL upload failed');
    }
    const result = await response.json();
    return result.url;
  };

  const handleFileUpload = async (files: File[] | string[]) => {
    setUploading(true);
    setUploadProgress(0);
    setErrorMessage(null);

    try {
      let urls: string[];
      if (files[0] instanceof File) {
        // Handle files sequentially to show accurate progress
        const fileArray = files as File[];
        urls = [];

        for (let i = 0; i < fileArray.length; i++) {
          const url = await uploadFile(fileArray[i]);
          urls.push(url);
          // Update progress for multiple files
          setUploadProgress(((i + 1) / fileArray.length) * 100);
        }
      } else {
        // Handle URLs
        const urlArray = files as string[];
        urls = [];

        for (let i = 0; i < urlArray.length; i++) {
          const url = await uploadUrl(urlArray[i]);
          urls.push(url);
          setUploadProgress(((i + 1) / urlArray.length) * 100);
        }
      }

      onFileUpload(urls);
      setOpenPopup(false);
      setUrlInput('');
    } catch (error) {
      console.error('Upload failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      await handleFileUpload(files);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      const files = Array.from(e.dataTransfer.files);
      await handleFileUpload(files);
    }
  };

  const handleUrlUpload = async () => {
    if (urlInput.trim()) {
      await handleFileUpload([urlInput.trim()]);
    }
  };

  const handlePaste = async (e: ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          await handleFileUpload([file]);
          break;
        }
      }
    }
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={() => setOpenPopup(true)}
        startIcon={<CloudUploadIcon />}
      >
        {label}
      </Button>

      <Dialog
        open={openPopup}
        onClose={() => !uploading && setOpenPopup(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Image</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              border: `2px dashed ${dragOver ? 'primary.main' : 'grey.300'}`,
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              bgcolor: dragOver ? 'primary.light' : 'background.default',
              transition: 'all 0.3s ease',
              mb: 2
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onPaste={handlePaste}
            tabIndex={0}
          >
            <CloudUploadIcon
              sx={{
                fontSize: 60,
                color: dragOver ? 'primary.main' : 'grey.500',
                mb: 2
              }}
            />
            <Typography variant="h6">
              Drag and Drop Images Here
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or click to select files
            </Typography>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              multiple={multiple}
              onChange={handleFileChange}
              accept="image/*"
            />
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              Browse Files
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              label="Or paste image URL"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={uploading}
              InputProps={{
                startAdornment: <LinkIcon color="disabled" sx={{ mr: 1 }} />
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleUrlUpload}
              disabled={!urlInput.trim() || uploading}
            >
              Upload URL
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenPopup(false)}
            color="secondary"
            disabled={uploading}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {uploading && (
        <Box sx={{ mt: 2 }}>
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            Uploading... {Math.round(uploadProgress)}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={uploadProgress}
            sx={{ height: 8, borderRadius: 2 }}
          />
        </Box>
      )}

      {errorMessage && (
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          Error: {errorMessage}
        </Typography>
      )}
    </>
  );
};

const ImageItem: React.FC<{
  url: string;
  index: number;
  size: number;
  onRemove?: (url: string) => void;
  myImageLoader: any; // Assuming myImageLoader is passed down
  PLACEHOLDER_IMAGE: string; // Pass placeholder image as prop
}> = ({ url, index, size, onRemove, myImageLoader, PLACEHOLDER_IMAGE }) => {
  const transformedUrl = url.includes('cloudinary.com')
    ? url.replace(/upload\//, `upload/q_auto,f_auto/`)
    : url;

  const [imgSrc, setImgSrc] = useState(transformedUrl);

  return (
    <Box key={index} sx={{ position: 'relative' }}>
      <Image
        loader={myImageLoader}
        src={imgSrc}
        alt={`Image ${index + 1}`}
        width={size}
        height={size}
        style={{
          objectFit: 'cover',
          borderRadius: 8,
        }}
        onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
      />
      {onRemove && (
        <IconButton
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            backgroundColor: 'rgba(255,255,255,0.7)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.9)',
            },
          }}
          onClick={() => onRemove(url)}
          color="error"
          size="small"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

export const ImagePreview: React.FC<{
  urls: string[];
  onRemove?: (url: string) => void;
  size?: number;
}> = ({ urls, onRemove, size = 100 }) => {
  const PLACEHOLDER_IMAGE = '/placeholder-image.png';

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
      {urls.map((url, index) => (
        <ImageItem
          key={index}
          url={url}
          index={index}
          size={size}
          onRemove={onRemove}
          myImageLoader={myImageLoader}
          PLACEHOLDER_IMAGE={PLACEHOLDER_IMAGE}
        />
      ))}
    </Box>
  );
};
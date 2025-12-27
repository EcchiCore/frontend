
'use client';

import { useEffect } from 'react';
import { SideMenu } from './SideMenu';
import { Step1_BasicInfo } from './Step1_BasicInfo';
import { Step2_Categorization } from './Step2_Categorization';
import { Step3_Media } from './Step3_Media';
import { Step4_Downloads } from './Step4_Downloads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { submitGameUpload, resetUploadState } from '@/store/features/upload/uploadSlice';
import { toast } from 'sonner';

import { JsonImportDialog } from './JsonImportDialog';

export default function GameUploadForm({ availableTags, availableCategories }: { availableTags: string[]; availableCategories: string[]; }) {
  const dispatch = useAppDispatch();
  const { activeSection, status, ongoingUploads, error } = useAppSelector((state) => state.upload);
  const isUploading = status === 'loading';

  useEffect(() => {
    // Optional: Reset form on unmount
    return () => {
      dispatch(resetUploadState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (status === 'succeeded') {
      toast.success("Game uploaded successfully!");
      // Optional: Redirect or reset
      dispatch(resetUploadState());
    } else if (status === 'failed' && error) {
      toast.error(`Upload failed: ${error}`);
    }
  }, [status, error, dispatch]);

  const handleSubmit = async () => {
    dispatch(submitGameUpload());
  };

  const renderSection = () => {
    return (
      <>
        <div style={{ display: activeSection === 'basic' ? 'block' : 'none' }}>
          <Step1_BasicInfo />
        </div>
        <div style={{ display: activeSection === 'categorization' ? 'block' : 'none' }}>
          <Step2_Categorization availableTags={availableTags} availableCategories={availableCategories} />
        </div>
        <div style={{ display: activeSection === 'media' ? 'block' : 'none' }}>
          <Step3_Media />
        </div>
        <div style={{ display: activeSection === 'downloads' ? 'block' : 'none' }}>
          <Step4_Downloads />
        </div>
      </>
    );
  };

  return (
    <Card className="max-w-6xl mx-auto my-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Upload a New Game</CardTitle>
        <JsonImportDialog />
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1">
          <SideMenu />
        </div>
        <div className="col-span-3">
          {renderSection()}
          <div className="flex justify-end mt-8">
            <Button onClick={handleSubmit} disabled={isUploading || ongoingUploads > 0}>
              {isUploading ? 'Uploading...' : 'Upload Game'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
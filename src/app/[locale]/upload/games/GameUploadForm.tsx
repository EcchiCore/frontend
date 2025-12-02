'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { SideMenu } from './SideMenu';
import { Step1_BasicInfo } from './Step1_BasicInfo';
import { Step2_Categorization } from './Step2_Categorization';
import { Step3_Media } from './Step3_Media';
import { Step4_Downloads } from './Step4_Downloads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function GameUploadForm({ availableTags, availableCategories }: { availableTags: string[]; availableCategories: string[]; }) {
  const [activeSection, setActiveSection] = useState('basic');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [ongoingUploads, setOngoingUploads] = useState(0);
  const params = useParams();

  useEffect(() => {
    console.log("formData updated:", JSON.stringify(formData, null, 2));
  }, [formData]);

  const handleSubmit = async () => {
    setIsUploading(true);
    const token = Cookies.get('token');

    if (!token) {
      alert('You must be logged in to upload a game.');
      setIsUploading(false);
      return;
    }

    const data = { ...formData };

    try {
      const gameResponse = await fetch(`https://api.chanomhub.online/api/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!gameResponse.ok) {
        throw new Error('Failed to create game article');
      }

      const gameData = await gameResponse.json();
      const articleId = gameData.article.id;

      if (formData.downloads) {
        for (const download of formData.downloads) {
          const downloadResponse = await fetch(`https://api.chanomhub.online/api/downloads`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ ...download, articleId }),
          });
          const downloadResult = await downloadResponse.json();
          if (!downloadResponse.ok) {
            console.error('Failed to upload download:', downloadResult);
            // Optionally, throw an error or alert the user
          }
        }
      }

      if (formData.authorizedPurchaseSources) {
        for (const purchaseSource of formData.authorizedPurchaseSources) {
          await fetch(`https://api.chanomhub.online/api/official-download-sources`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ ...purchaseSource, articleId }),
          });
        }
      }

      alert('Game uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const renderSection = () => {
    return (
      <>
        <div style={{ display: activeSection === 'basic' ? 'block' : 'none' }}>
          <Step1_BasicInfo formData={formData} setFormData={setFormData} />
        </div>
        <div style={{ display: activeSection === 'categorization' ? 'block' : 'none' }}>
          <Step2_Categorization formData={formData} setFormData={setFormData} availableTags={availableTags} availableCategories={availableCategories} />
        </div>
        <div style={{ display: activeSection === 'media' ? 'block' : 'none' }}>
          <Step3_Media setFormData={setFormData} setOngoingUploads={setOngoingUploads} />
        </div>
        <div style={{ display: activeSection === 'downloads' ? 'block' : 'none' }}>
          <Step4_Downloads formData={formData} setFormData={setFormData} />
        </div>
      </>
    );
  };

  return (
    <Card className="max-w-6xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Upload a New Game</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1">
          <SideMenu activeSection={activeSection} setActiveSection={setActiveSection} />
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
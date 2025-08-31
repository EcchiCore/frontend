
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GameUploadForm() {
  const [gameTitle, setGameTitle] = useState('');
  const [description, setDescription] = useState('');
  const [gameFile, setGameFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameFile || !coverImage || !gameTitle) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('title', gameTitle);
    formData.append('description', description);
    formData.append('gameFile', gameFile);
    formData.append('coverImage', coverImage);

    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/games', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Game uploaded successfully!');
        // Reset form
        setGameTitle('');
        setDescription('');
        setGameFile(null);
        setCoverImage(null);
      } else {
        const errorData = await response.json();
        alert(`Upload failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Upload a New Game</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="gameTitle">Game Title</Label>
            <Input
              id="gameTitle"
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              placeholder="Enter your game's title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about your game"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gameFile">Game File (e.g., .zip, .exe)</Label>
            <Input
              id="gameFile"
              type="file"
              onChange={(e) => setGameFile(e.target.files ? e.target.files[0] : null)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image (e.g., .png, .jpg)</Label>
            <Input
              id="coverImage"
              type="file"
              accept="image/*"
              onChange={(e) => setCoverImage(e.target.files ? e.target.files[0] : null)}
              required
            />
          </div>
          <Button type="submit" disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload Game'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

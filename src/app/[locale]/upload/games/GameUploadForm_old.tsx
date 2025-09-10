
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const engines = ["RENPY", "RPGM", "UNITY", "UNREAL", "Godot", "TyranoBuilder", "WOLFRPG", "KIRIKIRI", "FLASH", "BAKINPLAYER"];
const platforms = ["Windows", "macOS", "Linux", "Android", "iOS", "Web"];

export default function GameUploadForm() {
  const params = useParams();
  const locale = params.locale;
  const [gameTitle, setGameTitle] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [version, setVersion] = useState('');
  const [engine, setEngine] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [otherImages, setOtherImages] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newlyCreatedArticleId, setNewlyCreatedArticleId] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isSubmittingSource, setIsSubmittingSource] = useState(false);
  const [addedSources, setAddedSources] = useState<any[]>([]);
  const [downloadName, setDownloadName] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isSubmittingDownload, setIsSubmittingDownload] = useState(false);
  const [addedDownloads, setAddedDownloads] = useState<any[]>([]);

  useEffect(() => {
    const fetchTaxonomies = async () => {
      try {
        const [tagsRes, catsRes] = await Promise.all([
          fetch('/api/proxy/tags'),
          fetch('/api/proxy/categories'),
        ]);
        const tagsData = await tagsRes.json();
        const catsData = await catsRes.json();
        setAvailableTags(tagsData.tags || []);
        setAvailableCategories(catsData.categories || []);
      } catch (error) {
        console.error('Failed to fetch tags or categories', error);
      }
    };
    fetchTaxonomies();
  }, []);

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const handleTagChange = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverImage || !gameTitle || !engine || selectedCategories.length === 0) {
      alert('Please fill in all required fields and select at least one category.');
      return;
    }

    const token = Cookies.get('token');
    if (!token) {
      alert('You must be logged in to upload a game.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('title', gameTitle);
    formData.append('description', description);
    formData.append('body', body);
    formData.append('ver', version);
    formData.append('engine', engine);
    formData.append('tagList', JSON.stringify(selectedTags));
    formData.append('categoryList', JSON.stringify(selectedCategories));
    formData.append('platformList', JSON.stringify(selectedPlatforms));
    formData.append('coverImage', coverImage);
    if (mainImage) {
      formData.append('mainImage', mainImage);
    }
    if (backgroundImage) {
      formData.append('backgroundImage', backgroundImage);
    }
    if (otherImages) {
      for (let i = 0; i < otherImages.length; i++) {
        formData.append('otherImages', otherImages[i]);
      }
    }

    try {
      const response = await fetch(`/${locale}/api/games`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const newGame = await response.json();
        setNewlyCreatedArticleId(newGame.data.article.id);
        alert('Game uploaded successfully! Now you can add official download sources.');
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

  const handleSourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceName || !sourceUrl || !newlyCreatedArticleId) {
      alert('Please fill in all source fields.');
      return;
    }

    const token = Cookies.get('token');
    if (!token) {
      alert('You must be logged in to add a source.');
      return;
    }

    setIsSubmittingSource(true);

    try {
      const response = await fetch(`/${locale}/api/official-download-sources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          articleId: newlyCreatedArticleId,
          name: sourceName,
          url: sourceUrl,
        }),
      });

      if (response.ok) {
        const newSource = await response.json();
        setAddedSources([...addedSources, newSource]);
        setSourceName('');
        setSourceUrl('');
        alert('Official download source added successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to add source: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Source submission error:', error);
      alert('An error occurred while adding the source.');
    } finally {
      setIsSubmittingSource(false);
    }
  };

  const handleDownloadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadName || !downloadUrl || !newlyCreatedArticleId) {
      alert('Please fill in all download fields.');
      return;
    }

    const token = Cookies.get('token');
    if (!token) {
      alert('You must be logged in to add a download link.');
      return;
    }

    setIsSubmittingDownload(true);

    try {
      const response = await fetch(`/${locale}/api/downloads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          articleId: newlyCreatedArticleId,
          name: downloadName,
          url: downloadUrl,
        }),
      });

      if (response.ok) {
        const newDownload = await response.json();
        setAddedDownloads([...addedDownloads, newDownload]);
        setDownloadName('');
        setDownloadUrl('');
        alert('Download link added successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to add download link: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Download submission error:', error);
      alert('An error occurred while adding the download link.');
    } finally {
      setIsSubmittingDownload(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Upload a New Game</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="e.g., 1.0.0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Short Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief summary of your game"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Full Description</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tell us all about your game. This will be the main content of the article."
              rows={10}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="engine">Game Engine</Label>
              <Select onValueChange={setEngine} value={engine} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select an engine" />
                </SelectTrigger>
                <SelectContent>
                  {engines.map(engine => (
                    <SelectItem key={engine} value={engine}>{engine}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Platforms</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 border rounded-md">
                {platforms.map(platform => (
                  <div key={platform} className="flex items-center space-x-2">
                    <Checkbox 
                      id={platform}
                      checked={selectedPlatforms.includes(platform)}
                      onCheckedChange={() => handlePlatformChange(platform)}
                    />
                    <Label htmlFor={platform}>{platform}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Categories</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 border rounded-md">
              {availableCategories.map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox 
                    id={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <Label htmlFor={category}>{category}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 border rounded-md">
              {availableTags.map(tag => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox 
                    id={tag}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={() => handleTagChange(tag)}
                  />
                  <Label htmlFor={tag}>{tag}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="mainImage">Main Image</Label>
              <Input
                id="mainImage"
                type="file"
                accept="image/*"
                onChange={(e) => setMainImage(e.target.files ? e.target.files[0] : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backgroundImage">Background Image</Label>
              <Input
                id="backgroundImage"
                type="file"
                accept="image/*"
                onChange={(e) => setBackgroundImage(e.target.files ? e.target.files[0] : null)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="otherImages">Other Images</Label>
            <Input
              id="otherImages"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setOtherImages(e.target.files)}
            />
          </div>

          <Button type="submit" disabled={isUploading} className="w-full md:w-auto">
            {isUploading ? 'Uploading...' : 'Upload Game'}
          </Button>
        </form>

        {newlyCreatedArticleId && (
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-2xl font-semibold mb-4">Add Download Links</h3>
            <form onSubmit={handleDownloadSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="downloadName">Download Name (e.g., Windows, Linux)</Label>
                  <Input
                    id="downloadName"
                    value={downloadName}
                    onChange={(e) => setDownloadName(e.target.value)}
                    placeholder="Enter the download name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="downloadUrl">Download URL</Label>
                  <Input
                    id="downloadUrl"
                    type="url"
                    value={downloadUrl}
                    onChange={(e) => setDownloadUrl(e.target.value)}
                    placeholder="https://..."
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={isSubmittingDownload}>
                {isSubmittingDownload ? 'Adding...' : 'Add Download'}
              </Button>
            </form>

            {addedDownloads.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-medium">Added Downloads:</h4>
                <ul className="list-disc list-inside mt-2">
                  {addedDownloads.map((download, index) => (
                    <li key={index}>
                      <a href={download.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {download.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {newlyCreatedArticleId && (
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-2xl font-semibold mb-4">Add Official Download Sources</h3>
            <form onSubmit={handleSourceSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sourceName">Source Name (e.g., Steam, Itch.io)</Label>
                  <Input
                    id="sourceName"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    placeholder="Enter the source name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sourceUrl">Source URL</Label>
                  <Input
                    id="sourceUrl"
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://..."
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={isSubmittingSource}>
                {isSubmittingSource ? 'Adding...' : 'Add Source'}
              </Button>
            </form>

            {addedSources.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-medium">Added Sources:</h4>
                <ul className="list-disc list-inside mt-2">
                  {addedSources.map((source, index) => (
                    <li key={index}>
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {source.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

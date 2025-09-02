import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Step3_MediaProps {
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
}

export const Step3_Media = ({ formData, setFormData }: Step3_MediaProps) => {
  const handleFileChange = async (e: { target: { id: string; files: FileList | null } }) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      try {
        const response = await fetch('https://rustgram.onrender.com/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const result = await response.json();
        setFormData({ ...formData, [e.target.id]: result.url });
      } catch (error) {
        console.error('Error uploading file:', error);
        // Handle error, maybe show a message to the user
      }
    }
  };

  const handleMultipleFileChange = async (e: { target: { id: string; files: FileList | null } }) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      try {
        const urls = await Promise.all(files.map(async (file) => {
          const uploadFormData = new FormData();
          uploadFormData.append('file', file);
          const response = await fetch('https://rustgram.onrender.com/upload', {
            method: 'POST',
            body: uploadFormData,
          });
          if (!response.ok) {
            throw new Error(`Upload failed for ${file.name}`);
          }
          const result = await response.json();
          return result.url;
        }));
        setFormData({ ...formData, [e.target.id]: urls });
      } catch (error) {
        console.error('Error uploading multiple files:', error);
        // Handle error, maybe show a message to the user
      }
    }
  };

  return (
    <div className="space-y-6">
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
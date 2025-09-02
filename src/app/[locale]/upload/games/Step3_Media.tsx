
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Step3_Media = ({ formData, setFormData }) => {
  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.files[0] });
  };

  const handleMultipleFileChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.files });
  }

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

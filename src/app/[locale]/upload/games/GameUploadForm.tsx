
'use client';

import { useEffect } from 'react';
import { Step1_BasicInfo } from './Step1_BasicInfo';
import { CategorySection } from './CategorySection';
import { TagSection } from './TagSection';
import { Step4_Downloads } from './Step4_Downloads';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { submitGameUpload, resetUploadState, setStep } from '@/store/features/upload/uploadSlice';
import { toast } from 'sonner';
import { SidebarSection } from './SidebarSection';
import { MediaUpload } from './MediaUpload';
import { MediaGallery } from './MediaGallery';
import { JsonImportDialog } from './JsonImportDialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { engines, platforms } from '@/lib/gameData';
import { updateFormData } from '@/store/features/upload/uploadSlice';
import { 
  Save, 
  Send, 
  Settings, 
  Image as ImageIcon, 
  Tag as TagIcon, 
  List as ListIcon, 
  Download as DownloadIcon,
  Eye,
  Info
} from 'lucide-react';

export default function GameUploadForm({ availableTags, availableCategories }: { availableTags: string[]; availableCategories: string[]; }) {
  const dispatch = useAppDispatch();
  const { status, ongoingUploads, error, formData } = useAppSelector((state) => state.upload);
  const isUploading = status === 'loading';

  useEffect(() => {
    return () => {
      dispatch(resetUploadState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (status === 'succeeded') {
      toast.success("Game uploaded successfully!");
      dispatch(resetUploadState());
    } else if (status === 'failed' && error) {
      toast.error(`Upload failed: ${error}`);
    }
  }, [status, error, dispatch]);

  const handleSubmit = async () => {
    dispatch(submitGameUpload());
  };

  const handlePlatformChange = (platform: string) => {
    const currentPlatforms = formData.platforms || [];
    const newPlatforms = currentPlatforms.includes(platform)
      ? currentPlatforms.filter((p: string) => p !== platform)
      : [...currentPlatforms, platform];
    dispatch(updateFormData({ platforms: newPlatforms }));
  };

  return (
    <div className="bg-[#0f0f0f] text-[#d0d0d0] min-h-screen font-sans selection:bg-red-500/30">
      {/* TOPBAR */}
      <div className="h-[48px] bg-[#171717] border-b border-[#252525] flex items-center px-6 gap-3 sticky top-0 z-[100]">
        <span className="text-[13px] text-[#555]">My Projects</span>
        <span className="text-[#333]">/</span>
        <span className="text-[13px] text-[#999] truncate">
          {formData.title || 'New project'}
        </span>
        
        <div className="ml-auto flex items-center gap-2">
          <JsonImportDialog />
          <button 
            className="bg-transparent border border-[#2d2d2d] rounded-[4px] px-[14px] py-[6px] text-[12px] text-[#777] hover:border-[#444] hover:text-[#aaa] transition-all"
            onClick={() => toast.info("Draft saved!")}
          >
            Save draft
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isUploading || ongoingUploads > 0}
            className="bg-[#cc2f35] hover:bg-[#e8343a] text-white text-[12px] font-medium rounded-[4px] px-[18px] py-[6px] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isUploading ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-48px)]">
        {/* MAIN CONTENT */}
        <div className="flex-1 p-6 md:p-10 lg:p-[36px_40px] border-r border-[#1e1e1e] space-y-0">
          
          {/* BASICS */}
          <section className="py-[28px] border-b border-[#1e1e1e] first:pt-0">
            <div className="mb-[18px]">
              <h2 className="text-[14px] font-medium text-[#ccc]">Basic info</h2>
            </div>
            <Step1_BasicInfo />
          </section>

          {/* PRICING */}
          <section className="py-[28px] border-b border-[#1e1e1e]">
            <div className="mb-[18px]">
              <h2 className="text-[14px] font-medium text-[#ccc]">Pricing</h2>
            </div>
            <div className="max-w-xl space-y-6">
              <div className="flex border border-[#252525] rounded-[4px] overflow-hidden w-fit">
                <button 
                  className={`px-5 py-[7px] text-[12px] transition-all ${!formData.isPaid ? 'bg-[#cc2f35] text-white' : 'bg-[#191919] text-[#555] hover:text-[#777]'}`}
                  onClick={() => dispatch(updateFormData({ isPaid: false }))}
                >
                  Free / Donate
                </button>
                <button 
                  className={`px-5 py-[7px] text-[12px] transition-all ${formData.isPaid ? 'bg-[#cc2f35] text-white' : 'bg-[#191919] text-[#555] hover:text-[#777]'}`}
                  onClick={() => dispatch(updateFormData({ isPaid: true }))}
                >
                  Paid
                </button>
              </div>

              {formData.isPaid && (
                <div className="flex items-end gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="w-40 space-y-1.5">
                    <label className="text-[11px] text-[#555] uppercase tracking-wider">Price (THB)</label>
                    <input 
                      type="number" 
                      value={formData.price === undefined ? '' : formData.price}
                      onChange={(e) => {
                        const val = e.target.value;
                        dispatch(updateFormData({ price: val === '' ? undefined : Number(val) }));
                      }}
                      className="w-full bg-[#191919] border border-[#252525] rounded-[4px] text-[#ccc] text-[13px] px-3 py-2 outline-none focus:border-[#333]"
                      placeholder="0"
                    />
                  </div>
                  <div className="pb-2 text-[11px] text-[#3d3d3d] leading-relaxed">
                    Platform fee 15%<br />
                    You receive ~{formData.price ? (formData.price * 0.85).toFixed(0) : '0'} THB
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* PLATFORMS */}
          <section className="py-[28px] border-b border-[#1e1e1e]">
            <div className="mb-[18px]">
              <h2 className="text-[14px] font-medium text-[#ccc]">Platforms</h2>
              <p className="text-[11px] text-[#4a4a4a]">Which platforms can run your game?</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {platforms.map(platform => (
                <div 
                  key={platform}
                  onClick={() => handlePlatformChange(platform)}
                  className={`flex items-center gap-2 p-2 rounded-[4px] border cursor-pointer transition-all ${formData.platforms?.includes(platform) ? 'border-[#cc2f3555] bg-[#cc2f3510]' : 'border-[#232323] bg-[#171717] hover:border-[#333]'}`}
                >
                  <div className={`w-[13px] height-[13px] border rounded-[2px] relative ${formData.platforms?.includes(platform) ? 'bg-[#cc2f35] border-[#cc2f35]' : 'border-[#333]'}`}>
                    {formData.platforms?.includes(platform) && (
                      <div className="absolute top-[1px] left-[3px] w-[4px] h-[7px] border-r-[1.5px] border-b-[1.5px] border-white rotate-45" />
                    )}
                  </div>
                  <span className={`text-[11px] ${formData.platforms?.includes(platform) ? 'text-[#ccc]' : 'text-[#666]'}`}>{platform}</span>
                </div>
              ))}
            </div>
          </section>

          {/* DOWNLOADS */}
          <section className="py-[28px] border-b border-[#1e1e1e]">
            <div className="mb-[18px]">
              <h2 className="text-[14px] font-medium text-[#ccc]">Download links</h2>
              <p className="text-[11px] text-[#4a4a4a]">Add external links or upload files directly</p>
            </div>
            <Step4_Downloads />
          </section>

          {/* SCREENSHOTS */}
          <section className="py-[28px] border-b border-[#1e1e1e]">
            <div className="mb-[18px]">
              <h2 className="text-[14px] font-medium text-[#ccc]">Screenshots</h2>
              <p className="text-[11px] text-[#4a4a4a]">3–5 recommended · 16:9 ratio works best</p>
            </div>
            <MediaGallery />
          </section>

          {/* GENRE & TAGS */}
          <section className="py-[28px]">
            <div className="mb-[18px]">
              <h2 className="text-[14px] font-medium text-[#ccc]">Genre & Tags</h2>
              <p className="text-[11px] text-[#4a4a4a]">Click to select — helps players find your game</p>
            </div>
            <div className="space-y-8">
              <div className="space-y-1.5">
                <label className="text-[11px] text-[#555] uppercase tracking-wider">Genre <em className="not-italic text-[#444] lowercase">— pick any that apply</em></label>
                <CategorySection availableCategories={availableCategories} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] text-[#555] uppercase tracking-wider">Tags <em className="not-italic text-[#444] lowercase">— more specific, pick up to 10</em></label>
                <TagSection availableTags={availableTags} />
              </div>
            </div>
          </section>

        </div>

        {/* SIDEBAR */}
        <div className="w-full lg:w-[260px] p-6 lg:p-[28px_20px] bg-[#0c0c0c] space-y-10">
          <div className="space-y-3">
            <h3 className="text-[10px] text-[#3a3a3a] uppercase tracking-[0.1em] font-bold">Cover image</h3>
            <MediaUpload 
              id="coverImage" 
              label="" 
              description="Click or drag to upload\n630 × 500 px recommended\nUsed in search results & profiles" 
              className="aspect-[315/250]"
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] text-[#3a3a3a] uppercase tracking-[0.1em] font-bold">Engine</h3>
            <input 
              type="text" 
              value={formData.engine || ''} 
              onChange={(e) => dispatch(updateFormData({ engine: e.target.value }))}
              placeholder="e.g. RPG Maker MV"
              className="w-full bg-[#141414] border border-[#1e1e1e] rounded-[4px] text-[#888] text-[12px] px-3 py-2 outline-none focus:border-[#2d2d2d]"
              list="engine-list"
            />
            <datalist id="engine-list">
              {engines.map(engine => <option key={engine} value={engine} />)}
            </datalist>
          </div>

          <div className="pt-6 border-t border-[#1a1a1a]">
            <h3 className="text-[10px] text-[#3a3a3a] uppercase tracking-[0.1em] font-bold mb-4">Need help with tags?</h3>
            <button 
              className="w-full py-2 px-3 border border-[#1e1e1e] rounded-[4px] bg-transparent text-[#3a3a3a] text-[11px] hover:text-[#666] hover:border-[#2d2d2d] transition-all flex items-center justify-center gap-2"
              onClick={() => toast.info("AI Analysis started...")}
            >
              <span className="text-[12px]">✦</span> Suggest tags with AI
            </button>
          </div>
          
          {ongoingUploads > 0 && (
            <div className="p-3 rounded-[4px] bg-red-500/5 border border-red-500/20 text-red-500/80 text-[10px] text-center animate-pulse">
              Waiting for {ongoingUploads} upload(s) to complete...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

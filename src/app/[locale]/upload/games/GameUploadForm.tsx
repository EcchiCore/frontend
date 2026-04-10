
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
  Info,
  Monitor,
  Smartphone,
  Globe,
  FileCode
} from 'lucide-react';

export default function GameUploadForm({ availableTags, availableCategories }: { availableTags: string[]; availableCategories: string[]; }) {
  const dispatch = useAppDispatch();
  const { status, ongoingUploads, error, formData } = useAppSelector((state) => state.upload);
  const isUploading = status === 'loading';

  const getPlatformIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('win') || lowerName.includes('pc')) return <Monitor className="h-5 w-5" />;
    if (lowerName.includes('android') || lowerName.includes('ios')) return <Smartphone className="h-5 w-5" />;
    if (lowerName.includes('web')) return <Globe className="h-5 w-5" />;
    return <FileCode className="h-5 w-5" />;
  };

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
      <div className="h-[56px] bg-[#1a1a1a] border-b border-[#333] flex items-center px-6 gap-3 sticky top-0 z-[100] shadow-xl">
        <span className="text-[13px] text-[#666] font-medium">My Projects</span>
        <span className="text-[#333]">/</span>
        <span className="text-[13px] text-white font-bold truncate">
          {formData.title || 'New project'}
        </span>
        
        <div className="ml-auto flex items-center gap-3">
          <JsonImportDialog />
          <button 
            className="bg-transparent border border-[#333] rounded-[4px] px-[16px] py-[8px] text-[13px] text-[#aaa] font-medium hover:border-[#444] hover:text-white transition-all"
            onClick={() => toast.info("Draft saved!")}
          >
            Save draft
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isUploading || ongoingUploads > 0}
            className="bg-red-600 hover:bg-red-500 text-white text-[13px] font-bold rounded-[4px] px-[24px] py-[8px] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-900/20 active:scale-95"
          >
            {isUploading ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-56px)]">
        {/* MAIN CONTENT */}
        <div className="flex-1 p-6 md:p-10 lg:p-[36px_40px] border-r border-[#1e1e1e] space-y-0">
          
          {/* BASICS */}
          <section className="py-[32px] border-b border-[#1e1e1e] first:pt-0">
            <div className="mb-[24px]">
              <h2 className="text-[16px] font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Basic info
              </h2>
            </div>
            <Step1_BasicInfo />
          </section>

          {/* PRICING */}
          <section className="py-[32px] border-b border-[#1e1e1e]">
            <div className="mb-[24px]">
              <h2 className="text-[16px] font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Pricing
              </h2>
            </div>
            <div className="max-w-xl space-y-6">
              <div className="flex bg-[#141414] border border-[#333] rounded-[6px] p-1 w-fit">
                <button 
                  className={`px-6 py-[8px] text-[13px] font-medium rounded-[4px] transition-all ${!formData.isPaid ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-[#666] hover:text-[#999]'}`}
                  onClick={() => dispatch(updateFormData({ isPaid: false }))}
                >
                  Free / Donate
                </button>
                <button 
                  className={`px-6 py-[8px] text-[13px] font-medium rounded-[4px] transition-all ${formData.isPaid ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-[#666] hover:text-[#999]'}`}
                  onClick={() => dispatch(updateFormData({ isPaid: true }))}
                >
                  Paid
                </button>
              </div>

              {formData.isPaid && (
                <div className="flex items-end gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="w-48 space-y-2">
                    <label className="text-[12px] text-[#aaa] font-bold uppercase tracking-wider">Price (THB)</label>
                    <input 
                      type="number" 
                      value={formData.price === undefined ? '' : formData.price}
                      onChange={(e) => {
                        const val = e.target.value;
                        dispatch(updateFormData({ price: val === '' ? undefined : Number(val) }));
                      }}
                      className="w-full bg-[#141414] border border-[#333] rounded-[4px] text-white text-[14px] px-4 py-2.5 outline-none focus:border-red-500/50"
                      placeholder="0"
                    />
                  </div>
                  <div className="pb-2.5 text-[12px] text-[#555] leading-relaxed">
                    Platform fee 15%<br />
                    You receive <span className="text-red-400 font-bold">~{formData.price ? (formData.price * 0.85).toFixed(0) : '0'} THB</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* PLATFORMS */}
          <section className="py-[32px] border-b border-[#1e1e1e]">
            <div className="mb-[24px]">
              <h2 className="text-[16px] font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Platforms <span className="text-red-500 text-[14px] ml-1">*</span>
              </h2>
              <p className="text-[12px] text-[#555] mt-1 font-medium">Which platforms can run your game?</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {platforms.map(platform => {
                const isSelected = formData.platforms?.includes(platform);
                return (
                  <div 
                    key={platform}
                    onClick={() => handlePlatformChange(platform)}
                    className={`
                      relative group flex flex-col items-center justify-center gap-3 p-5 rounded-[12px] border-2 cursor-pointer transition-all duration-300
                      ${isSelected 
                        ? 'border-red-600 bg-red-600/10 shadow-[0_0_20px_rgba(220,38,38,0.1)]' 
                        : 'border-[#1a1a1a] bg-[#111] hover:border-[#333] hover:bg-[#161616]'}
                    `}
                  >
                    <div className={`
                      p-3 rounded-full transition-all duration-300
                      ${isSelected ? 'bg-red-600 text-white scale-110 shadow-lg' : 'bg-[#1a1a1a] text-[#444] group-hover:text-[#666]'}
                    `}>
                      {getPlatformIcon(platform)}
                    </div>
                    <span className={`text-[13px] font-bold transition-colors ${isSelected ? 'text-white' : 'text-[#444] group-hover:text-[#888]'}`}>
                      {platform}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                        <div className="w-[3px] h-[6px] border-r-2 border-b-2 border-white rotate-45 mb-[1px]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* DOWNLOADS */}
          <section className="py-[32px] border-b border-[#1e1e1e]">
            <div className="mb-[24px]">
              <h2 className="text-[16px] font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Download links
              </h2>
              <p className="text-[12px] text-[#555] mt-1">Add external links or upload files directly</p>
            </div>
            <Step4_Downloads />
          </section>

          {/* SCREENSHOTS */}
          <section className="py-[32px] border-b border-[#1e1e1e]">
            <div className="mb-[24px]">
              <h2 className="text-[16px] font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Screenshots
              </h2>
              <p className="text-[12px] text-[#555] mt-1">3–5 recommended · 16:9 ratio works best</p>
            </div>
            <MediaGallery />
          </section>

          {/* GENRE & TAGS */}
          <section className="py-[32px]">
            <div className="mb-[24px]">
              <h2 className="text-[16px] font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Genre & Tags
              </h2>
              <p className="text-[12px] text-[#555] mt-1">Click to select — helps players find your game</p>
            </div>
            <div className="space-y-10">
              <div className="space-y-3">
                <label className="text-[12px] text-[#aaa] font-bold uppercase tracking-wider flex items-center gap-2">
                  Genre <span className="text-red-500">*</span>
                  <em className="not-italic text-[#555] lowercase font-normal ml-2">— pick any that apply</em>
                </label>
                <CategorySection availableCategories={availableCategories} />
              </div>
              <div className="space-y-3">
                <label className="text-[12px] text-[#aaa] font-bold uppercase tracking-wider flex items-center gap-2">
                  Tags <span className="text-red-500">*</span>
                  <em className="not-italic text-[#555] lowercase font-normal ml-2">— more specific, pick up to 10</em>
                </label>
                <TagSection availableTags={availableTags} />
              </div>
            </div>
          </section>

        </div>

        {/* SIDEBAR */}
        <div className="w-full lg:w-[300px] p-6 lg:p-[32px_24px] bg-[#0c0c0c] space-y-10 border-l border-[#1e1e1e]">
          <div className="space-y-4">
            <h3 className="text-[11px] text-[#aaa] uppercase tracking-[0.15em] font-bold flex items-center gap-2">
              Cover image <span className="text-red-500">*</span>
            </h3>
            <MediaUpload 
              id="coverImage" 
              label="" 
              description="Click or drag to upload\n630 × 500 px recommended\nUsed in search results & profiles" 
              className="aspect-[315/250]"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] text-[#aaa] uppercase tracking-[0.15em] font-bold flex items-center gap-2">
              Engine <span className="text-red-500">*</span>
            </h3>
            <input 
              type="text" 
              value={formData.engine || ''} 
              onChange={(e) => dispatch(updateFormData({ engine: e.target.value }))}
              placeholder="e.g. RPG Maker MV"
              className="w-full bg-[#141414] border border-[#333] rounded-[4px] text-white text-[13px] px-4 py-2.5 outline-none focus:border-red-500/50"
              list="engine-list"
            />
            <datalist id="engine-list">
              {engines.map(engine => <option key={engine} value={engine} />)}
            </datalist>
          </div>

          <div className="pt-8 border-t border-[#1e1e1e]">
            <h3 className="text-[11px] text-[#666] uppercase tracking-[0.15em] font-bold mb-5">Need help with tags?</h3>
            <button 
              className="w-full py-3 px-4 border border-[#333] rounded-[4px] bg-[#141414] text-[#aaa] text-[12px] font-bold hover:text-white hover:border-red-500/50 transition-all flex items-center justify-center gap-2 group"
              onClick={() => toast.info("AI Analysis started...")}
            >
              <span className="text-[14px] text-red-500 group-hover:scale-125 transition-transform">✦</span> 
              Suggest tags with AI
            </button>
          </div>
          
          {ongoingUploads > 0 && (
            <div className="p-4 rounded-[6px] bg-red-900/10 border border-red-500/20 text-red-400 text-[11px] font-bold text-center animate-pulse shadow-inner">
              Waiting for {ongoingUploads} upload(s) to complete...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

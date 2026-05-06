
'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { submitGameUpload, resetUploadState, updateFormData } from '@/store/features/upload/uploadSlice';
import { toast } from 'sonner';
import { 
  Layout, 
  Settings, 
  Image as ImageIcon, 
  Type, 
  Download as DownloadIcon, 
  Rocket, 
  Save, 
  Eye, 
  ChevronRight,
  Sparkles,
  Layers,
  Globe,
  Monitor,
  Smartphone
} from 'lucide-react';
import { Step1_BasicInfoV2 } from './Step1_BasicInfoV2';
import { MediaGallery } from '../MediaGallery';
import { MediaUpload } from '../MediaUpload';
import { TagSection } from '../TagSection';
import { CategorySection } from '../CategorySection';
import { Step4_Downloads } from '../Step4_Downloads';
import { JsonImportDialog } from '../JsonImportDialog';
import { engines } from '@/lib/gameData';

type NavSection = 'general' | 'visuals' | 'content' | 'distribution' | 'publishing';

export default function GameUploadFormV2({ availableTags, availableCategories }: { availableTags: string[]; availableCategories: string[]; }) {
  const dispatch = useAppDispatch();
  const { status, ongoingUploads, error, formData } = useAppSelector((state) => state.upload);
  const [activeSection, setActiveSection] = useState<NavSection>('general');
  const isUploading = status === 'loading';

  useEffect(() => {
    dispatch(updateFormData({ editorMode: 'block' }));
    return () => {
      dispatch(resetUploadState());
    };
  }, [dispatch]);

  const navItems = [
    { id: 'general', label: 'Identity', icon: Settings, desc: 'Name, Slug, Engine' },
    { id: 'visuals', label: 'Visuals', icon: ImageIcon, desc: 'Cover, Screenshots' },
    { id: 'content', label: 'Editor', icon: Type, desc: 'Block-based Description' },
    { id: 'distribution', label: 'Files', icon: DownloadIcon, desc: 'Downloads, Pricing' },
    { id: 'publishing', label: 'Review', icon: Rocket, desc: 'Tags, Categories, Finish' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] bg-[#050505] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
      {/* HEADER */}
      <header className="h-16 px-8 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-lg shadow-red-900/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">Project V2</h1>
            <p className="text-[10px] text-white/40 font-medium uppercase tracking-[0.1em]">
              {formData.title || 'Untitled Workspace'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <JsonImportDialog />
          <div className="h-8 w-[1px] bg-white/5 mx-2" />
          <button 
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all"
            onClick={() => toast.success("Draft synchronized")}
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <button 
            onClick={() => dispatch(submitGameUpload())}
            disabled={isUploading || ongoingUploads > 0}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-900/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Rocket className="w-4 h-4" />
            {isUploading ? 'Publishing...' : 'Publish Project'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* NAV SIDEBAR */}
        <aside className="w-64 bg-[#080808] border-r border-white/5 flex flex-col p-4 gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as NavSection)}
              className={`
                group flex flex-col items-start p-3 rounded-xl transition-all duration-300
                ${activeSection === item.id 
                  ? 'bg-red-600/10 border border-red-600/20' 
                  : 'hover:bg-white/5 border border-transparent'}
              `}
            >
              <div className="flex items-center gap-3 mb-1">
                <item.icon className={`w-4 h-4 transition-colors ${activeSection === item.id ? 'text-red-500' : 'text-white/40 group-hover:text-white/60'}`} />
                <span className={`text-[13px] font-bold ${activeSection === item.id ? 'text-white' : 'text-white/40 group-hover:text-white/60'}`}>
                  {item.label}
                </span>
              </div>
              <p className="text-[10px] text-white/20 ml-7 leading-tight">{item.desc}</p>
            </button>
          ))}
          
          <div className="mt-auto p-4 bg-white/5 rounded-xl border border-white/5">
            <h4 className="text-[11px] font-bold text-white/40 mb-2 uppercase tracking-wider">Health Check</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-white/60">Info complete</span>
                <div className={`w-2 h-2 rounded-full ${formData.title ? 'bg-green-500' : 'bg-red-500/50'}`} />
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-white/60">Cover image</span>
                <div className={`w-2 h-2 rounded-full ${formData.coverImage ? 'bg-green-500' : 'bg-red-500/50'}`} />
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-white/60">Files added</span>
                <div className={`w-2 h-2 rounded-full ${(formData.downloads?.length || 0) > 0 ? 'bg-green-500' : 'bg-red-500/50'}`} />
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN WORKSPACE */}
        <main className="flex-1 overflow-y-auto bg-black p-10 scrollbar-hide">
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeSection === 'general' && (
              <div className="space-y-12">
                <header className="space-y-2">
                  <h2 className="text-3xl font-black text-white flex items-center gap-3">
                    Project Identity
                    <div className="px-2 py-0.5 rounded bg-red-600/10 border border-red-600/20 text-[10px] text-red-500 uppercase tracking-widest font-bold">Required</div>
                  </h2>
                  <p className="text-white/40 text-sm">Define how your game will be identified across the platform.</p>
                </header>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <Step1_BasicInfoV2 mode="minimal" />
                  </div>
                  <div className="space-y-8 bg-[#0a0a0a] border border-white/5 p-8 rounded-2xl">
                    <div className="space-y-4">
                      <h3 className="text-[12px] font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        Development Engine
                      </h3>
                      <input 
                        type="text" 
                        value={formData.engine || ''} 
                        onChange={(e) => dispatch(updateFormData({ engine: e.target.value }))}
                        placeholder="e.g. Unity 2024 LTS"
                        className="w-full bg-white/5 border border-white/10 rounded-xl text-white text-sm px-4 py-3 outline-none focus:border-red-500/50 focus:bg-white/[0.08] transition-all"
                        list="engine-list"
                      />
                      <datalist id="engine-list">
                        {engines.map(engine => <option key={engine} value={engine} />)}
                      </datalist>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <h3 className="text-[12px] font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Target Platforms
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {['Windows', 'Android', 'Web', 'macOS'].map(p => {
                          const isSel = formData.platforms?.includes(p);
                          return (
                            <button
                              key={p}
                              onClick={() => {
                                const current = formData.platforms || [];
                                dispatch(updateFormData({ platforms: isSel ? current.filter(x => x !== p) : [...current, p] }));
                              }}
                              className={`
                                px-4 py-2 rounded-lg text-xs font-bold transition-all border
                                ${isSel 
                                  ? 'bg-red-600 border-red-600 text-white' 
                                  : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'}
                              `}
                            >
                              {p}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'visuals' && (
              <div className="space-y-12">
                <header className="space-y-2">
                  <h2 className="text-3xl font-black text-white">Visual Presence</h2>
                  <p className="text-white/40 text-sm">Upload high-quality assets to make your game stand out.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-[12px] font-bold text-white/60 uppercase tracking-widest">Cover Image</h3>
                    <MediaUpload 
                      id="coverImage" 
                      label="" 
                      description="Drag to upload\n630 × 500 px\nFormat: WebP/PNG" 
                      className="aspect-[315/250] border-2 border-dashed border-white/10 hover:border-red-500/30 rounded-2xl bg-[#0a0a0a]"
                    />
                  </div>
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-[12px] font-bold text-white/60 uppercase tracking-widest">Gallery Screenshots</h3>
                    <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl min-h-[300px]">
                      <MediaGallery />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'content' && (
              <div className="space-y-12 h-full flex flex-col">
                <header className="space-y-2">
                  <h2 className="text-3xl font-black text-white">Story & Features</h2>
                  <p className="text-white/40 text-sm">Use blocks to build a compelling presentation for your game.</p>
                </header>
                <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden min-h-[600px]">
                   <Step1_BasicInfoV2 mode="editor-only" />
                </div>
              </div>
            )}

            {activeSection === 'distribution' && (
              <div className="space-y-12">
                <header className="space-y-2">
                  <h2 className="text-3xl font-black text-white">Project Value</h2>
                  <p className="text-white/40 text-sm">Configure how players can access and support your work.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h3 className="text-[12px] font-bold text-white/60 uppercase tracking-widest">Pricing Model</h3>
                    <div className="flex bg-white/5 p-1 rounded-xl w-fit">
                      {['Free', 'Paid'].map(m => (
                        <button
                          key={m}
                          className={`px-8 py-2.5 rounded-lg text-xs font-bold transition-all ${((m === 'Paid') === !!formData.isPaid) ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-white/40 hover:text-white/60'}`}
                          onClick={() => dispatch(updateFormData({ isPaid: m === 'Paid' }))}
                        >
                          {m}
                        </button>
                      ))}
                    </div>

                    {formData.isPaid && (
                      <div className="p-6 bg-[#0a0a0a] border border-white/5 rounded-2xl space-y-4 animate-in fade-in zoom-in duration-300">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Price (THB)</label>
                        <input 
                          type="number" 
                          value={formData.price || ''}
                          onChange={(e) => dispatch(updateFormData({ price: Number(e.target.value) }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl text-2xl font-black text-white px-4 py-4 outline-none focus:border-red-500/50"
                        />
                        <p className="text-[11px] text-white/20 italic">Platform fee: 15% · You receive: <span className="text-red-500 font-bold">~{((formData.price || 0) * 0.85).toFixed(0)} THB</span></p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-[12px] font-bold text-white/60 uppercase tracking-widest">Build Distribution</h3>
                    <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl">
                      <Step4_Downloads />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'publishing' && (
              <div className="space-y-12">
                <header className="space-y-2">
                  <h2 className="text-3xl font-black text-white">Global Reach</h2>
                  <p className="text-white/40 text-sm">Tag and categorize your game to help players discover it.</p>
                </header>

                <div className="space-y-10">
                  <div className="space-y-4">
                    <h3 className="text-[12px] font-bold text-white/60 uppercase tracking-widest">Primary Genre</h3>
                    <CategorySection availableCategories={availableCategories} />
                  </div>
                  <div className="space-y-4 pt-8 border-t border-white/5">
                    <h3 className="text-[12px] font-bold text-white/60 uppercase tracking-widest">Discovery Tags</h3>
                    <TagSection availableTags={availableTags} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* FOOTER STATUS */}
      <footer className="h-10 px-8 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${ongoingUploads > 0 ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
            <span className={ongoingUploads > 0 ? 'text-amber-500' : 'text-white/40'}>
              {ongoingUploads > 0 ? `Uploading ${ongoingUploads} asset(s)` : 'Network Synchronized'}
            </span>
          </div>
        </div>
        <div className="text-white/20">
          ChanomHub Creator Suite <span className="text-red-600/50 ml-2">V2.0.42</span>
        </div>
      </footer>
    </div>
  );
}

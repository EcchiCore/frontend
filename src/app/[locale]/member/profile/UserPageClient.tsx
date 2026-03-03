"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Eye, EyeOff, Shield, Sparkles, Settings, User, Globe, Palette } from "lucide-react";

interface SocialMediaLink {
  platform: string;
  url: string;
}

interface UserData {
  username: string;
  email: string;
  bio: string;
  image: string;
  token: string;
  ranks: string[];
  backgroundImage?: string;
  points: number;
  socialMediaLinks: SocialMediaLink[];
}

interface UserPageClientProps {
  userData: UserData;
}

export default function UserPageClient({ userData }: UserPageClientProps) {
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleShowToken = () => {
    setShowToken(!showToken);
  };

  const copyToken = () => {
    if (userData?.token) {
      navigator.clipboard.writeText(userData.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Widget */}
      <div className="card bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden rounded-3xl">
        <div className="card-body p-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            Statistics
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
              <div className="text-2xl font-black text-white">{userData.points || 0}</div>
              <div className="text-xs font-bold text-slate-500 uppercase mt-1">Points</div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
              <div className="text-2xl font-black text-white">{userData.ranks?.length || 0}</div>
              <div className="text-xs font-bold text-slate-500 uppercase mt-1">Roles</div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-green-400">Account Status</span>
            </div>
            <span className="text-xs font-black text-green-500 uppercase">Active</span>
          </div>
        </div>
      </div>

      {/* Token Widget */}
      <div className="card bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden rounded-3xl">
        <div className="card-body p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-500" />
              API Token
            </h3>
            <button
              onClick={toggleShowToken}
              className="btn btn-ghost btn-xs text-slate-400 hover:text-white"
            >
              {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
              {showToken ? "Hide" : "Show"}
            </button>
          </div>

          <div className="relative group">
            <div className={`p-4 rounded-2xl font-mono text-xs break-all transition-all duration-300 ${
              showToken 
                ? "bg-slate-950 text-purple-300 border border-purple-500/30" 
                : "bg-slate-950/50 text-slate-600 blur-sm select-none border border-white/5"
            }`}>
              {showToken ? userData.token : "••••••••••••••••••••••••••••••••••••••••••••••••"}
            </div>
            
            {showToken && (
              <button
                onClick={copyToken}
                className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-circle btn-ghost btn-sm text-purple-400"
              >
                {copied ? <Sparkles size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
            )}
          </div>
          
          <p className="mt-3 text-[10px] text-slate-500 leading-tight">
            Use this token to authenticate with our API. Keep it secret!
          </p>
        </div>
      </div>

      {/* Quick Actions Widget */}
      <div className="card bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden rounded-3xl">
        <div className="card-body p-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-500" />
            Quick Actions
          </h3>

          <div className="grid grid-cols-1 gap-2">
            <Link 
              href="/member/dashboard#settings" 
              className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-transparent hover:border-white/10 group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <User size={16} />
              </div>
              <span className="text-sm font-bold text-slate-300">Edit Profile</span>
            </Link>

            <Link 
              href="/member/dashboard#settings" 
              className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-transparent hover:border-white/10 group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <Palette size={16} />
              </div>
              <span className="text-sm font-bold text-slate-300">Appearance</span>
            </Link>

            <Link 
              href="/member/dashboard#settings" 
              className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-transparent hover:border-white/10 group"
            >
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
                <Globe size={16} />
              </div>
              <span className="text-sm font-bold text-slate-300">Language</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Eye, EyeOff, Shield, Sparkles } from "lucide-react";

interface UserData {
  username: string;
  email: string;
  bio: string;
  image: string;
  token: string;
  ranks: string[];
  backgroundImage?: string;
}

interface UserPageClientProps {
  userData: UserData;
}

export default function UserPageClient({ userData }: UserPageClientProps) {
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  useRouter();
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
      {/* Token Widget */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 p-6 rounded-2xl shadow-2xl hover:bg-white/15 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg">
            <Shield className="h-5 w-5 text-purple-300" />
          </div>
          <h3 className="text-lg font-semibold text-white">API Token</h3>
          {showToken && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-400/30 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-300">Active</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={toggleShowToken}
            className="flex-1 group relative px-4 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 text-purple-300 rounded-xl hover:bg-purple-500/30 hover:text-white transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center justify-center gap-2">
              {showToken ? (
                <EyeOff className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              ) : (
                <Eye className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              )}
              <span className="text-sm font-medium">
                {showToken ? "ซ่อน" : "แสดง"}
              </span>
            </div>
          </button>

          {showToken && (
            <button
              onClick={copyToken}
              disabled={copied}
              className="flex-1 group relative px-4 py-2 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-300 rounded-xl hover:bg-blue-500/30 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              <div className="flex items-center justify-center gap-2">
                {copied ? (
                  <Sparkles className="h-4 w-4 text-green-400 animate-pulse" />
                ) : (
                  <Copy className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                )}
                <span className="text-sm font-medium">
                  {copied ? "คัดลอกแล้ว!" : "คัดลอก"}
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Token Display */}
        <div className="relative overflow-hidden rounded-xl">
          {showToken ? (
            <div className="relative">
              <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 p-4 rounded-xl">
                <code className="text-xs font-mono text-green-300 break-all leading-relaxed selection:bg-green-500/20">
                  {userData.token}
                </code>
              </div>
              {/* Animated border */}
              <div className="absolute inset-0 rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-xl opacity-50 animate-pulse"></div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 p-4 rounded-xl">
              <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                <Shield className="h-5 w-5" />
                <p className="text-xs text-center">คลิกที่ปุ่ม &#34;แสดง&#34; เพื่อดู Token ของคุณ</p>
              </div>
              {/* Animated dots */}
              <div className="flex justify-center gap-1 mt-3">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-200"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-400"></div>
              </div>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-400/20 rounded-lg">
          <p className="text-xs text-amber-300 flex items-start gap-2">
            <Shield className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>อย่าแชร์ Token นี้กับใคร เพื่อความปลอดภัยของบัญชีของคุณ</span>
          </p>
        </div>
      </div>

      {/* User Stats Widget */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 p-6 rounded-2xl shadow-2xl hover:bg-white/15 transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg">
            <Sparkles className="h-5 w-5 text-green-300" />
          </div>
          <h3 className="text-lg font-semibold text-white">สถิติ</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
            <span className="text-sm text-gray-300">จำนวนระดับ</span>
            <span className="text-lg font-bold text-white">{userData.ranks?.length || 0}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
            <span className="text-sm text-gray-300">สถานะบัญชี</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-300">ออนไลน์</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
            <span className="text-sm text-gray-300">มีข้อมูลโปรไฟล์</span>
            <span className="text-sm font-medium text-blue-300">
              {userData.bio ? 'ครบถ้วน' : 'ไม่ครบถ้วน'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions Widget */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 p-6 rounded-2xl shadow-2xl hover:bg-white/15 transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg">
            <svg className="h-5 w-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">การกระทำ</h3>
        </div>

        <div className="space-y-3">
          <button className="w-full p-3 bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-400/30 text-purple-300 rounded-xl hover:bg-purple-500/30 hover:text-white transition-all duration-300 hover:scale-105 text-sm font-medium">
            แก้ไขโปรไฟล์
          </button>

          <button className="w-full p-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-400/30 text-blue-300 rounded-xl hover:bg-blue-500/30 hover:text-white transition-all duration-300 hover:scale-105 text-sm font-medium">
            เปลี่ยนรูปพื้นหลัง
          </button>

          <button className="w-full p-3 bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 border border-indigo-400/30 text-indigo-300 rounded-xl hover:bg-indigo-500/30 hover:text-white transition-all duration-300 hover:scale-105 text-sm font-medium">
            ตั้งค่าความปลอดภัย
          </button>
        </div>
      </div>
    </div>
  );
}
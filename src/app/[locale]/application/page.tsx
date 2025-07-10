"use client"
import React, { useState } from 'react';
import { ChevronRight, Download, Code, Zap, Shield, Search, Star, Menu, X, Github, Twitter, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function ModernEdgyUI() {
  const [currentTheme, setCurrentTheme] = useState('cyber');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const themes = [
    { id: 'cyber', name: 'Cyber', gradient: 'from-cyan-500 to-blue-600' },
    { id: 'neon', name: 'Neon', gradient: 'from-pink-500 to-purple-600' },
    { id: 'matrix', name: 'Matrix', gradient: 'from-green-400 to-emerald-600' },
    { id: 'sunset', name: 'Sunset', gradient: 'from-orange-500 to-red-600' },
    { id: 'arctic', name: 'Arctic', gradient: 'from-blue-400 to-indigo-600' }
  ];

  const techStack = [
    { name: 'Rust', color: 'from-orange-500 to-red-500', icon: '🦀' },
    { name: 'Tauri', color: 'from-yellow-500 to-orange-500', icon: '⚡' },
    { name: 'Vite', color: 'from-purple-500 to-pink-500', icon: '🔥' },
    { name: 'TypeScript', color: 'from-blue-500 to-cyan-500', icon: '💎' },
    { name: 'React', color: 'from-cyan-500 to-blue-500', icon: '⚛️' }
  ];

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Lightning Fast',
      description: 'Built with Rust and Tauri for maximum performance'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with continuous updates'
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: 'Developer Friendly',
      description: 'Clean APIs and comprehensive documentation'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-pink-900/20"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold">C</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                ChanomHub
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">หน้าแรก</a>
              <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">ดาวน์โหลด</a>
              <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">เอกสาร</a>
              <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">API</a>
            </div>

            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/95 backdrop-blur-lg">
          <div className="flex flex-col items-center justify-center h-full space-y-8 text-xl">
            <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">หน้าแรก</a>
            <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">ดาวน์โหลด</a>
            <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">เอกสาร</a>
            <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors">API</a>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block p-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full mb-8">
            <div className="bg-black px-6 py-2 rounded-full">
              <span className="text-sm font-medium bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                ✨ เวอร์ชั่นใหม่ล่าสุด v0.9.2 ✨
              </span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              ยินดีต้อนรับสู่
            </span>
            <br />
            <span className="text-white">อนาคต</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            ค้นพบโปรแกรมที่จะปฏิวัติการทำงานของคุณ<br />
            ด้วยเทคโนโลยีล้ำสมัยและประสิทธิภาพสูงสุด
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105">



              <span className="flex items-center space-x-2">

                <Download className="w-5 h-5" />

                <Link href="/application/downloads">Downloads</Link>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <button className="px-8 py-4 border-2 border-gray-700 rounded-xl font-bold text-lg hover:border-cyan-500 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 hover:bg-cyan-500/5">
              <Link href="/docs">How to use</Link>
            </button>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              เทคโนโลยีที่ใช้
            </span>
          </h2>

          <div className="flex flex-wrap justify-center gap-6">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="group relative p-6 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/10"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tech.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
                <div className="relative z-10 text-center">
                  <div className="text-3xl mb-2">{tech.icon}</div>
                  <div className="text-lg font-bold">{tech.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-2xl hover:border-cyan-500/50 transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-cyan-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Theme Selector */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              เลือกธีมที่ใช่สำหรับคุณ
            </span>
          </h2>
          <p className="text-gray-300 text-lg mb-12">
            ปรับแต่งแอพพลิเคชันให้เข้ากับสไตล์ของคุณ
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className="group cursor-pointer"
                onClick={() => setCurrentTheme(theme.id)}
              >
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${theme.gradient} mb-3 group-hover:scale-110 transition-all duration-300 ${currentTheme === theme.id ? 'ring-4 ring-cyan-400 ring-offset-4 ring-offset-black' : ''}`}>
                  <div className="w-full h-full rounded-2xl bg-black/20 flex items-center justify-center">
                    <Star className={`w-6 h-6 ${currentTheme === theme.id ? 'text-white' : 'text-white/50'}`} />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                  {theme.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                ค้นหาทุกอย่างได้อย่างรวดเร็ว
              </span>
            </h2>

            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl blur opacity-25"></div>
              <div className="relative bg-gray-900 border border-gray-700 rounded-xl p-2 flex">
                <input
                  type="text"
                  placeholder="ค้นหาคอนเทนท์ที่ต้องการ..."
                  className="flex-1 bg-transparent px-4 py-3 text-white placeholder-gray-400 focus:outline-none"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            <p className="text-center text-gray-400 mt-6">
              เชื่อมต่อกับระบบ search engine ประสิทธิภาพสูง
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-cyan-900/50 to-purple-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 md:p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                เริ่มต้นใช้งานวันนี้
              </h2>
              <p className="text-xl text-gray-300 mb-10">
                ดาวน์โหลดและติดตั้งแอพพลิเคชันฟรี
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-colors hover:scale-105 transform duration-300">
                  Windows
                </button>
                <button className="px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-colors hover:scale-105 transform duration-300">
                  macOS
                </button>
                <button className="px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-colors hover:scale-105 transform duration-300">
                  Linux
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold">C</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                ChanomHub
              </span>
            </div>

            <div className="flex space-x-6">
              <Github className="w-6 h-6 text-gray-400 hover:text-cyan-400 cursor-pointer transition-colors" />
              <Twitter className="w-6 h-6 text-gray-400 hover:text-cyan-400 cursor-pointer transition-colors" />
              <MessageCircle className="w-6 h-6 text-gray-400 hover:text-cyan-400 cursor-pointer transition-colors" />
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2025 ChanomHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

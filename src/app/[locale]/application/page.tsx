"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChevronRight, Download, Code, Zap, Shield, Search, Github, Twitter, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function BunStyleChanomHub() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const techStack = [
    { name: 'Rust', icon: '🦀' },
    { name: 'Tauri', icon: '⚡' },
    { name: 'Vite', icon: '🔥' },
    { name: 'TypeScript', icon: '💎' },
    { name: 'React', icon: '⚛️' }
  ];

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Lightning Fast',
      description: 'Built with Rust and Tauri for maximum performance'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with continuous updates'
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'Developer Friendly',
      description: 'Clean APIs and comprehensive documentation'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-muted rounded-full mb-8">
            <span className="text-sm font-medium text-muted-foreground">
              ✨ เวอร์ชั่นใหม่ล่าสุด v0.9.2
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            ยินดีต้อนรับสู่
            <br />
            <span className="text-foreground">อนาคต</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            ค้นพบโปรแกรมที่จะปฏิวัติการทำงานของคุณ
            <br />
            ด้วยเทคโนโลยีล้ำสมัยและประสิทธิภาพสูงสุด
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-12 px-8 text-base font-medium group">
              <Download className="w-5 h-5 mr-2" />
              Downloads
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button variant="outline" size="lg" className="h-12 px-8 text-base font-medium">
              How to use
            </Button>

            <Button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base font-medium"
            >
              {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
            </Button>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            เทคโนโลยีที่ใช้
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {techStack.map((tech) => (
              <Card key={tech.name} className="hover:shadow-sm transition-all duration-200">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="text-3xl mb-3">{tech.icon}</div>
                  <div className="font-semibold">{tech.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-sm transition-all duration-200">
                <CardHeader className="pb-4">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                ค้นหาทุกอย่างได้อย่างรวดเร็ว
              </h2>
              <p className="text-lg text-muted-foreground">
                เชื่อมต่อกับระบบ search engine ประสิทธิภาพสูง
              </p>
            </div>

            <div className="flex max-w-2xl mx-auto">
              <Input
                type="text"
                placeholder="ค้นหาคอนเทนท์ที่ต้องการ..."
                className="rounded-r-none h-12 text-base"
              />
              <Button className="rounded-l-none h-12 px-6">
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-primary text-primary-foreground p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              เริ่มต้นใช้งานวันนี้
            </h2>
            <p className="text-xl opacity-90 mb-10">
              ดาวน์โหลดและติดตั้งแอพพลิเคชันฟรี
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary h-12 px-8 text-base font-medium">
                Windows
              </Button>
              <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary h-12 px-8 text-base font-medium">
                macOS
              </Button>
              <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary h-12 px-8 text-base font-medium">
                Linux
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-16 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">C</span>
              </div>
              <span className="text-xl font-bold">ChanomHub</span>
            </div>

            <div className="flex space-x-6">
              <Github className="w-6 h-6 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
              <Twitter className="w-6 h-6 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
              <MessageCircle className="w-6 h-6 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
            </div>
          </div>

          <div className="pt-8 border-t text-center text-muted-foreground">
            <p>&copy; 2025 ChanomHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
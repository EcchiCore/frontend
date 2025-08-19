"use client";
// pages/index.tsx หรือ app/page.tsx (สำหรับ App Router)
import Head from 'next/head'
import { Inter } from 'next/font/google'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { 
  Search, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  Star,
  Clock,
  Eye,
  Heart,
  Share
} from 'lucide-react'
import Navbar from '../components/Navbar';

const inter = Inter({ subsets: ['latin'] })

// Mock data
const featuredPosts = [
  {
    id: 1,
    title: "เทคนิคการลงทุนหุ้นไทยสำหรับมือใหม่ ปี 2025",
    description: "แนวทางการเริ่มต้นลงทุนในตลาดหุ้นไทยอย่างปลอดภัย",
    author: "นักลงทุนมือโปร",
    category: "การเงิน",
    views: 15420,
    comments: 89,
    likes: 234,
    timeAgo: "2 ชั่วโมงที่แล้ว",
    image: "/api/placeholder/400/200"
  },
  {
    id: 2,
    title: "รีวิว iPhone 16 Pro Max หลังใช้งาน 3 เดือน",
    description: "ประสบการณ์การใช้งาน iPhone รุ่นล่าสุดในมุมมองผู้ใช้จริง",
    author: "TechReviewer",
    category: "เทคโนโลยี",
    views: 8930,
    comments: 156,
    likes: 445,
    timeAgo: "5 ชั่วโมงที่แล้ว",
    image: "/api/placeholder/400/200"
  },
  {
    id: 3,
    title: "สูตรอาหารไทยโบราณที่กำลังจะสูญหาย",
    description: "รวมสูตรอาหารไทยดั้งเดิมที่ควรอนุรักษ์ไว้ให้ลูกหลาน",
    author: "เชฟบ้านๆ",
    category: "อาหาร",
    views: 12340,
    comments: 78,
    likes: 189,
    timeAgo: "1 วันที่แล้ว",
    image: "/api/placeholder/400/200"
  }
]

const trendingTopics = [
  { name: "การลงทุน", count: 1250 },
  { name: "เทคโนโลยี", count: 980 },
  { name: "ท่องเที่ยว", count: 856 },
  { name: "สุขภาพ", count: 742 },
  { name: "อาหาร", count: 698 }
]

const categories = [
  { name: "ข่าวสาร", icon: "📰", count: 5420 },
  { name: "บันเทิง", icon: "🎬", count: 3890 },
  { name: "กีฬา", icon: "⚽", count: 2340 },
  { name: "เทคโนโลยี", icon: "💻", count: 4560 },
  { name: "การเงิน", icon: "💰", count: 2890 },
  { name: "ท่องเที่ยว", icon: "✈️", count: 1890 }
]

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Pantip - เว็บบอร์ดชั้นนำของไทย | ถาม-ตอบ แลกเปลี่ยนความรู้</title>
        <meta 
          name="description" 
          content="Pantip เว็บบอร์ดชั้นนำของไทย ที่รวมคนไทยเข้ามาถาม-ตอบ แลกเปลี่ยนความรู้ ความคิดเห็น ในหัวข้อที่หลากหลาย ทั้งข่าวสาร บันเทิง เทคโนโลยี การเงิน ท่องเที่ยว"
        />
        <meta name="keywords" content="pantip, เว็บบอร์ด, ถาม-ตอบ, ชุมชนออนไลน์, ข่าวสาร, บันเทิง, เทคโนโลยี" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Pantip - เว็บบอร์ดชั้นนำของไทย" />
        <meta property="og:description" content="ถาม-ตอบ แลกเปลี่ยนความรู้ ในชุมชนออนไลน์ที่ใหญ่ที่สุดของไทย" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://pantip.com" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 ${inter.className}`}>
        <Navbar/>

        <main className="bg-background">
          {/* Image Carousel Section - Pure CSS */}
          <section className="container mx-auto px-4 py-8 mb-12">
            <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative h-96 md:h-[500px]">
                <style jsx>{`
                  .carousel-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                  }
                  
                  .carousel-wrapper {
                    display: flex;
                    width: 300%;
                    height: 100%;
                    animation: carousel-slide 15s infinite;
                  }
                  
                  .carousel-slide {
                    width: 33.333%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  }
                  
                  .carousel-wrapper:hover {
                    animation-play-state: paused;
                  }
                  
                  @keyframes carousel-slide {
                    0%, 30% { transform: translateX(0); }
                    33.333%, 63.333% { transform: translateX(-33.333%); }
                    66.666%, 96.666% { transform: translateX(-66.666%); }
                    100% { transform: translateX(0); }
                  }
                  
                  .slide-1 { background: linear-gradient(to right, #8b5cf6, #2563eb); }
                  .slide-2 { background: linear-gradient(to right, #10b981, #0d9488); }
                  .slide-3 { background: linear-gradient(to right, #f97316, #dc2626); }
                  
                  .nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.8);
                    border: none;
                    border-radius: 50%;
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    transition: all 0.2s;
                    z-index: 10;
                  }
                  
                  .nav-btn:hover {
                    background: white;
                    transform: translateY(-50%) scale(1.1);
                  }
                  
                  .nav-btn-left { left: 16px; }
                  .nav-btn-right { right: 16px; }
                  
                  .dots-container {
                    position: absolute;
                    bottom: 24px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 8px;
                    z-index: 10;
                  }
                  
                  .dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    transition: all 0.3s;
                  }
                  
                  .dot:hover {
                    background: rgba(255, 255, 255, 0.8);
                    transform: scale(1.1);
                  }
                  
                  .slide-counter {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: rgba(0, 0, 0, 0.3);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 20px;
                    font-size: 14px;
                    z-index: 10;
                  }
                `}</style>

                <div className="carousel-container">
                  <div className="carousel-wrapper">
                    <div className="carousel-slide slide-1">
                      <div className="text-center text-white px-8">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                          ข่าวสารและกิจกรรมล่าสุด
                        </h2>
                        <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
                          อัปเดตข้อมูลสำคัญและกิจกรรมน่าสนใจประจำสัปดาห์
                        </p>
                      </div>
                    </div>
                    
                    <div className="carousel-slide slide-2">
                      <div className="text-center text-white px-8">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                          ชุมชนผู้ใช้งานที่แข็งแกร่ง
                        </h2>
                        <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
                          เข้าร่วมกับชุมชนออนไลน์ที่มีสมาชิกกว่า 2.5 ล้านคน
                        </p>
                      </div>
                    </div>
                    
                    <div className="carousel-slide slide-3">
                      <div className="text-center text-white px-8">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                          แลกเปลี่ยนความรู้ไร้ขีดจำกัด
                        </h2>
                        <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
                          พูดคุยและแบ่งปันประสบการณ์ในทุกหัวข้อที่คุณสนใจ
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Static Navigation (สำหรับ SEO) */}
                <button className="nav-btn nav-btn-left" aria-label="ภาพก่อนหน้า">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button className="nav-btn nav-btn-right" aria-label="ภาพถัดไป">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div className="dots-container">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>

                <div className="slide-counter">1 / 3</div>
              </div>
            </div>
          </section>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
  {/* Tabs Navigation */}
  <Tabs defaultValue="featured" className="mb-8">
    <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger value="featured">แนะนำ</TabsTrigger>
      <TabsTrigger value="latest">ล่าสุด</TabsTrigger>
      <TabsTrigger value="trending">ยอดนิยม</TabsTrigger>
      <TabsTrigger value="myFeed">ฟีดของฉัน</TabsTrigger>
    </TabsList>

    <TabsContent value="featured" className="space-y-6">
      <h3 className="text-sm leading-none font-medium text-foreground">กระทู้แนะนำ</h3>
      {featuredPosts.map((post) => (
        <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex space-x-4">
              <div className="w-32 h-20 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500"></div>
              </div>
              <div className="flex-grow">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary">{post.category}</Badge>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{post.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.comments}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{post.likes}</span>
                    </div>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                  {post.title}
                </h4>
                <p className="text-muted-foreground mb-3">{post.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{post.author[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground">{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{post.timeAgo}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </TabsContent>

    <TabsContent value="latest" className="space-y-6">
      <h3 className="text-2xl font-semibold text-foreground mb-6">กระทู้ล่าสุด</h3>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>U{i}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <h4 className="font-medium text-foreground">หัวข้อกระทู้ตัวอย่างที่ {i}</h4>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                    <span>โดย: ผู้ใช้{i}</span>
                    <span>5 นาทีที่แล้ว</span>
                    <span>12 ตอบ</span>
                  </div>
                </div>
                <Badge variant="outline">ทั่วไป</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TabsContent>

    <TabsContent value="trending" className="space-y-6">
      <h3 className="text-2xl font-semibold text-foreground mb-6">กระทู้ยอดนิยม</h3>
      <p className="text-muted-foreground">กระทู้ที่ได้รับความสนใจมากที่สุดในวันนี้</p>
    </TabsContent>

    <TabsContent value="myFeed" className="space-y-6">
      <h3 className="text-2xl font-semibold text-foreground mb-6">ฟีดของฉัน</h3>
      <p className="text-muted-foreground">เข้าสู่ระบบเพื่อดูกระทู้ที่คุณติดตาม</p>
    </TabsContent>
  </Tabs>
</div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">หมวดหมู่ยอดนิยม</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{category.icon}</span>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <Badge variant="secondary">{category.count.toLocaleString()}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Trending Topics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>หัวข้อฮิต</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {trendingTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                      <span className="text-sm font-medium">#{topic.name}</span>
                      <span className="text-xs text-gray-500">{topic.count} กระทู้</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Online Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ผู้ใช้ออนไลน์</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">15,432 คนออนไลน์</span>
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">U{i}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-700">ผู้ใช้{i}</span>
                        <div className="w-2 h-2 bg-green-400 rounded-full ml-auto"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">เริ่มต้นใช้งาน</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    สร้างกระทู้ใหม่
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    ค้นหากระทู้
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Star className="h-4 w-4 mr-2" />
                    กระทู้ที่บันทึก
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Pantip</h3>
                <p className="text-gray-300 text-sm">
                  เว็บบอร์ดชั้นนำของไทย ที่รวมคนไทยเข้ามาแลกเปลี่ยนความรู้และความคิดเห็น
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">บริการ</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li><a href="#" className="hover:text-white transition-colors">กระทู้</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">แท็ก</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">กิจกรรม</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">ชุมชน</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">ช่วยเหลือ</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li><a href="#" className="hover:text-white transition-colors">คำถามที่พบบ่อย</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">กฎของเว็บไซต์</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">ติดต่อเรา</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">ร้องเรียน</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">ติดตาม</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">LINE</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">YouTube</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>&copy; 2025 Pantip. สงวนลิขสิทธิ์ทุกประการ</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
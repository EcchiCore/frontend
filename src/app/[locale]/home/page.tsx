import Navbar from '../components/Navbar';
import HeroSection from './components/HeroSection';
import CategoriesSection from './components/CategoriesSection';
import TrendingPosts from './components/TrendingPosts';
import Sidebar from './components/Sidebar';

export default async function Home() {
  // Fetch initial active users
  let initialActiveUsers = 0;
  try {
    // Mock data for active users
    initialActiveUsers = Math.floor(Math.random() * 100) + 50; // Random number between 50-150
  } catch (error) {
    console.error('Error fetching active users:', error);
    initialActiveUsers = 0; // Fallback value
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900">
      <Navbar />

      <HeroSection initialActiveUsers={initialActiveUsers} />

      <div className="container mx-auto px-4 py-12 xl:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-10">
            <CategoriesSection />
            <TrendingPosts />
          </div>

          {/* Sidebar */}
          <Sidebar />
        </div>
      </div>
    </main>
  );
}
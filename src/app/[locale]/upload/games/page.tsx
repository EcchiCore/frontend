import GameUploadForm from './GameUploadForm';

async function fetchTags() {
  const response = await fetch('https://api.chanomhub.online/api/tags', { next: { revalidate: 3600 } }); // Revalidate every hour
  if (!response.ok) {
    console.error('Failed to fetch tags from backend');
    return [];
  }
  const data = await response.json();
  return data.tags || [];
}

async function fetchCategories() {
  const response = await fetch('https://api.chanomhub.online/api/categories', { next: { revalidate: 3600 } }); // Revalidate every hour
  if (!response.ok) {
    console.error('Failed to fetch categories from backend');
    return [];
  }
  const data = await response.json();
  return data.categories || [];
}

export default async function UploadGamePage() {
  const availableTags = await fetchTags();
  const availableCategories = await fetchCategories();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black overflow-hidden p-6">
      {/* วงกลมเบลอ (ตกแต่งพื้นหลัง) */}
      <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-500" />

      {/* เนื้อหาหลัก */}
      <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 w-full">
        <GameUploadForm availableTags={availableTags} availableCategories={availableCategories} />
      </div>
    </div>
  );
}

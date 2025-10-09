import GameUploadForm from './GameUploadForm';

export default function UploadGamePage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black overflow-hidden p-6">
      {/* วงกลมเบลอ (ตกแต่งพื้นหลัง) */}
      <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-500" />

      {/* เนื้อหาหลัก */}
      <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 w-full">
        <GameUploadForm />
      </div>
    </div>
  );
}

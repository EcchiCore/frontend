// ===============================
// app/games/error.tsx (error boundary for dynamic part)
// ===============================
'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container mx-auto px-4 py-10">
      <h2 className="text-xl font-semibold mb-2">โหลดข้อมูลไม่สำเร็จ</h2>
      <p className="text-sm opacity-80 mb-4">{error.message}</p>
      <button onClick={reset} className="px-4 py-2 rounded-2xl border">ลองใหม่</button>
    </div>
  );
}

/**
 * SingleFlight / Deduplication utility
 * 
 * ป้องกัน thundering herd: เมื่อ cache หมดอายุ
 * ถ้ามีหลาย request พร้อมกัน จะให้แค่ request แรก
 * ทำงานจริง ส่วน request อื่นๆ จะรอผลลัพธ์จาก request แรก
 * 
 * ลดการใช้ CPU/memory spike ได้อย่างมาก
 */

const inFlightMap = new Map<string, { promise: Promise<any>; timestamp: number }>();

// ลบ entries เก่าทุก 5 นาที เพื่อป้องกัน memory leak
const CLEANUP_INTERVAL = 5 * 60 * 1000;
const MAX_ENTRY_AGE = 10 * 60 * 1000; // 10 minutes

let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of inFlightMap.entries()) {
    if (now - entry.timestamp > MAX_ENTRY_AGE) {
      inFlightMap.delete(key);
    }
  }
}

/**
 * singleFlight - ป้องกันการเรียก fn ซ้ำพร้อมกันสำหรับ key เดียวกัน
 * 
 * @param key - unique key สำหรับ dedup (เช่น 'home-page-data', 'article-slug-xxx')
 * @param fn - async function ที่จะถูกเรียก
 * @returns ผลลัพธ์จาก fn (shared ระหว่าง concurrent callers)
 * 
 * @example
 * const data = await singleFlight('home-data', () => fetchHomeData());
 */
export async function singleFlight<T>(key: string, fn: () => Promise<T>): Promise<T> {
  cleanup();

  // ถ้ามี request กำลังทำงานอยู่แล้วสำหรับ key นี้ → รอผลลัพธ์เดิม
  const existing = inFlightMap.get(key);
  if (existing) {
    return existing.promise as Promise<T>;
  }

  // เป็น request แรก → ทำงานจริง
  const promise = fn()
    .then((result) => {
      // ลบออกเมื่อเสร็จ เพื่อให้ request ถัดไปสามารถ trigger ใหม่ได้
      inFlightMap.delete(key);
      return result;
    })
    .catch((error) => {
      // ลบออกเมื่อ error เพื่อให้ request ถัดไป retry ได้
      inFlightMap.delete(key);
      throw error;
    });

  inFlightMap.set(key, { promise, timestamp: Date.now() });
  return promise;
}

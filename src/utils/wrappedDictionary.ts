import { getTranslations } from 'next-intl/server';
import { MetaDict } from "./localeUtils";

type Dictionary = {
  metadata?: Partial<MetaDict>;
  // ...เพิ่มเติมตามต้องการ
};

// ปิด generic inference ลึกๆ และ type safety ขั้นพื้นฐานพอ
export async function fetchDictionary(locale: string): Promise<Dictionary> {
  const t = await getTranslations({ locale });
  // This is a simplified example. You might need to adjust this based on your dictionary structure.
  return { metadata: t('metadata') as any };
}

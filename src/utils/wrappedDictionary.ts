// utils/wrappedDictionary.ts

import { MetaDict } from "./localeUtils";
import { getDictionary } from "intlayer";

type Dictionary = {
  metadata?: Partial<MetaDict>;
  // ...เพิ่มเติมตามต้องการ
};

// ปิด generic inference ลึกๆ และ type safety ขั้นพื้นฐานพอ
export async function fetchDictionary(locale: string): Promise<Dictionary> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const dict = await (getDictionary as (l: string) => Promise<any>)(locale);
  return dict as Dictionary;
}

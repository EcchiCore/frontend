import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    // 立即处理无效locale情况，确保类型安全
    notFound();
  }
  
  try {
    const messages = (await import(`../../messages/${locale}.json`)).default;
    // 明确返回类型，确保locale不为undefined
    return { messages, locale } satisfies { messages: any; locale: string };
  } catch {
    notFound();
  }
});
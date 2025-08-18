// app/page.tsx
import { redirect } from 'next/navigation';
import { defaultLocale } from "@/utils/localeUtils";


// Root page ที่จะ redirect ไปยัง default locale
export default function RootPage() {
  // Redirect ไป default locale
  redirect(`/${defaultLocale}`);
}
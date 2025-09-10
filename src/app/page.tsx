// app/page.tsx
import { redirect } from 'next/navigation';
import { defaultLocale } from "@/utils/localeUtils";


export default function RootPage() {
  redirect(`/${defaultLocale}`);
}

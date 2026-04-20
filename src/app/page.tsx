// app/page.tsx
import { redirect } from "@/i18n/navigation";
import { defaultLocale } from "@/utils/localeUtils";


export default function RootPage() {
  redirect(`/${defaultLocale}`);
}

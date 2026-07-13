import { cookies } from 'next/headers';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';
import FontUploadForm from './FontUploadForm';

export default async function UploadFontPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const locale = await getLocale();

  if (!token) {
    redirect({ href: '/login?redirect=/upload/fonts', locale });
  }

  return (
    <div className="min-h-screen bg-[#121212] text-slate-200 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <FontUploadForm />
      </div>
    </div>
  );
}

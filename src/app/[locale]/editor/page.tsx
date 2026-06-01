import { cookies } from 'next/headers';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';
import { ArticleEditorForm } from '@/components/features/ArticleEditorForm';

export default async function CreateArticlePage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const locale = await getLocale();

    if (!token) {
        redirect({ href: '/login?redirect=/editor', locale });
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <ArticleEditorForm mode="create" />
        </div>
    );
}

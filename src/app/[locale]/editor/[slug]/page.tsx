import { cookies } from 'next/headers';
import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';
import { ArticleEditorForm } from '@/components/features/ArticleEditorForm';

interface EditArticlePageProps {
    params: Promise<{ slug: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
    const { slug } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const locale = await getLocale();

    if (!token) {
        redirect({ href: `/login?redirect=/editor/${slug}`, locale });
    }

    if (!slug) {
        redirect({ href: '/', locale });
    }

    return (
        <div className="min-h-screen bg-background">
            <ArticleEditorForm mode="edit" slug={slug} locale={locale} />
        </div>
    );
}

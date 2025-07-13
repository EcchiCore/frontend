import { Suspense } from 'react';
import Navbar from './../components/Navbar';
import ClientGamesWrapper from './components/ClientGamesWrapper';

interface GamesPageProps {
  params: Promise<{ locale: string }>;
}

const GamesPage = async ({ params }: GamesPageProps) => {
  const { locale } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <Navbar />
      <ClientGamesWrapper locale={locale} />
    </Suspense>
  );
};

export default GamesPage;
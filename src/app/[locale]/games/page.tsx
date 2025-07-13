import { Suspense } from 'react';
import ClientGamesWrapper from './components/ClientGamesWrapper';
import Navbar from './../components/Navbar'; // Corrected typo from 'Navber'

export default function GamesPage({
                                    params,
                                  }: {
  params: { locale: string };
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    }>
      <Navbar />
      <ClientGamesWrapper locale={params.locale} />
    </Suspense>
  );
}
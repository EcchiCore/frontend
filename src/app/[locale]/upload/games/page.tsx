import GameUploadForm from './GameUploadForm';
import { getSdk } from '@/lib/sdk';

export default async function UploadGamePage() {
  const sdk = await getSdk();
  const availableTags = await sdk.articles.getTags() as string[];
  const availableCategories = await sdk.articles.getCategories() as string[];

  return (
    <div className="min-h-screen bg-[#121212] text-slate-200 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <GameUploadForm availableTags={availableTags} availableCategories={availableCategories} />
      </div>
    </div>
  );
}

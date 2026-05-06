import GameUploadFormV2 from './GameUploadFormV2';
import { getSdk } from '@/lib/sdk';

export default async function UploadGamePageV2() {
  const sdk = await getSdk();
  const availableTags = await sdk.articles.getTags() as string[];
  const availableCategories = await sdk.articles.getCategories() as string[];

  return (
    <div className="min-h-screen bg-[#121212] text-slate-200 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <GameUploadFormV2 availableTags={availableTags} availableCategories={availableCategories} />
      </div>
    </div>
  );
}

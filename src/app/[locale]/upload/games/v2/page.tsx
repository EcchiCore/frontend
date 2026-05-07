import GameUploadFormV2 from './GameUploadFormV2';
import { getSdk } from '@/lib/sdk';

export default async function UploadGamePageV2() {
  const sdk = await getSdk();
  const availableTags = await sdk.articles.getTags() as string[];
  const availableCategories = await sdk.articles.getCategories() as string[];

  return (
    <div className="h-screen w-screen overflow-hidden">
      <GameUploadFormV2 availableTags={availableTags} availableCategories={availableCategories} />
    </div>
  );
}

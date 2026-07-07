import { createChanomhubClient } from "@chanomhub/sdk"
import { unstable_cache } from "next/cache"
import SidebarFiltersClient from "./SidebarFiltersClient"

type SidebarFiltersProps = {
  context?: 'articles' | 'games';
};

// Cache all sidebar metadata for 5 minutes — shared across users
const getCachedMetadata = unstable_cache(
  async () => {
    const sdk = createChanomhubClient()
    
    const [tags, categories, platforms, engines] = await Promise.all([
      sdk.articles.getTags(),
      sdk.articles.getCategories(),
      sdk.articles.getPlatforms(),
      sdk.articles.getEngines(),
    ])
    return { tags, categories, platforms, engines }
  },
  ["sidebar-metadata-v2"], // Changed cache key to v2 to avoid conflicts with old cache
  { revalidate: 300 }
)

export default async function SidebarFilters({ context }: SidebarFiltersProps) {
  const { tags, categories, platforms, engines } = await getCachedMetadata()

  return (
    <SidebarFiltersClient
      tags={tags}
      categories={categories}
      platforms={platforms}
      engines={engines.map((e) => e.name)}
    />
  )
}

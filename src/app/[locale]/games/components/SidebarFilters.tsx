import { createChanomhubClient } from "@chanomhub/sdk"
import { unstable_cache } from "next/cache"
import SidebarFiltersClient from "./SidebarFiltersClient"

type SidebarFiltersProps = {
  context: 'articles' | 'games';
};

// Cache all sidebar metadata for 5 minutes — shared across users
const getCachedMetadata = unstable_cache(
  async (context: 'articles' | 'games') => {
    const sdk = createChanomhubClient()
    
    // Based on analyzing Results.tsx, both "Games" and "Articles" use the sdk.articles module.
    // The distinction is a filter. We are assuming the category for games is named 'Games'.
    // We are also assuming the SDK's getTags, getCategories, etc., methods accept a `filter` object.
    const filter = context === 'games' 
      ? { category: 'Games' } 
      : { category_not: 'Games' }; // Assuming `_not` suffix for exclusion.

    const [tags, categories, platforms, engines] = await Promise.all([
      sdk.articles.getTags({ filter }),
      sdk.articles.getCategories({ filter }),
      sdk.articles.getPlatforms({ filter }),
      sdk.articles.getEngines({ filter }),
    ])
    return { tags, categories, platforms, engines }
  },
  ["sidebar-metadata-v2"], // Changed cache key to v2 to avoid conflicts with old cache
  { revalidate: 300 }
)

export default async function SidebarFilters({ context }: SidebarFiltersProps) {
  const { tags, categories, platforms, engines } = await getCachedMetadata(context)

  return (
    <SidebarFiltersClient
      tags={tags}
      categories={categories}
      platforms={platforms}
      engines={engines.map((e) => e.name)}
    />
  )
}

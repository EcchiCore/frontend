import { createChanomhubClient } from "@chanomhub/sdk"
import { unstable_cache } from "next/cache"
import SearchControls from "./SearchControls"

// Reuses the same cache key as SidebarFilters — Next.js deduplicates the fetch
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
  ["sidebar-metadata"],
  { revalidate: 300 }
)

export default async function SearchControlsWrapper() {
  const { tags, categories, platforms, engines } = await getCachedMetadata()
  return (
    <SearchControls
      tags={tags}
      categories={categories}
      platforms={platforms}
      engines={engines.map((e) => e.name)}
    />
  )
}


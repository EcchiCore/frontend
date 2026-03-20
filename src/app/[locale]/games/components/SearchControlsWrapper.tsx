import { createChanomhubClient } from "@chanomhub/sdk"
import { unstable_cache } from "next/cache"
import SearchControls from "./SearchControls"

// Reuses the same cache key as SidebarFilters — Next.js deduplicates the fetch
const getCachedTags = unstable_cache(
  async () => {
    const sdk = createChanomhubClient()
    return sdk.articles.getTags() as Promise<string[]>
  },
  ["sidebar-metadata"],
  { revalidate: 300 }
)

export default async function SearchControlsWrapper() {
  const tags = await getCachedTags()
  return <SearchControls tags={tags} />
}

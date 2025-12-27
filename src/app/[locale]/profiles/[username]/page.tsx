// src/app/profiles/[username]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProfileImage from './components/ProfileImage';
import SocialLinkItem from './components/SocialLinkItem';
import ProfileStats from './components/ProfileStats';
import ProfileActions from './components/ProfileActions';
import ActivityFeed from './components/ActivityFeed';
import { resolveArticleImageUrl } from '@/lib/articleImageUrl';

interface SocialMediaLink {
  platform: string;
  url: string;
}

interface Profile {
  id: number;
  name: string;
  bio: string | null;
  image: string | null;
  backgroundImage: string | null;
  following: boolean;
  socialMediaLinks?: SocialMediaLink[];
}

interface Article {
  slug: string;
  title: string;
  mainImage: string | null;
  coverImage: string | null;
  createdAt: string;
  favoritesCount: number;
}

async function getProfile(username: string): Promise<Profile | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    if (!apiUrl) return null;

    const res = await fetch(`${apiUrl}/api/profiles/${username}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const profile = data.data?.profile || data.profile;

    // Resolve image URLs
    if (profile) {
      profile.image = resolveArticleImageUrl(profile.image);
      profile.backgroundImage = resolveArticleImageUrl(profile.backgroundImage);
    }

    return profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

async function getUserArticles(username: string): Promise<Article[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    if (!apiUrl) return [];

    const res = await fetch(
      `${apiUrl}/api/articles?author=${encodeURIComponent(username)}&limit=6`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];

    const data = await res.json();
    const articles = data.data?.articles || data.articles || [];

    // Resolve image URLs for each article
    return articles.map((article: Article) => ({
      ...article,
      mainImage: resolveArticleImageUrl(article.mainImage),
      coverImage: resolveArticleImageUrl(article.coverImage),
    }));
  } catch (error) {
    console.error('Error fetching user articles:', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfile(username);

  const frontendUrl = process.env.FRONTEND_URL ?? '';
  const title = profile?.name ? `${profile.name}'s Profile` : 'User Profile';
  const desc = profile?.bio ?? `Profile page of ${username}. Follow to stay updated!`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: profile?.image
        ? [{ url: profile.image, width: 128, height: 128, alt: `${username}'s profile image` }]
        : [],
      url: frontendUrl ? `${frontendUrl}/profiles/${username}` : undefined,
      type: 'profile',
    },
    icons: profile?.image
      ? { icon: [{ url: profile.image }], shortcut: [{ url: profile.image }] }
      : undefined,
  };
}

export default async function ProfilePage({
  params,
}: Readonly<{ params: Promise<{ username: string }> }>) {
  const { username } = await params;

  const [profile, articles] = await Promise.all([
    getProfile(username),
    getUserArticles(username),
  ]);

  if (!profile) notFound();

  const publicBaseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: profile.name,
            description: profile.bio ?? `Profile of ${profile.name}`,
            image: profile.image ?? undefined,
            url: publicBaseUrl ? `${publicBaseUrl}/profiles/${profile.name}` : undefined,
            sameAs: profile.socialMediaLinks?.map((link) => link.url) || [],
          }),
        }}
      />

      <main
        className="min-h-screen relative"
        style={{
          backgroundImage: profile.backgroundImage
            ? `url(${profile.backgroundImage})`
            : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Dark overlay with gradient */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80 z-10"
          aria-hidden="true"
        />

        <div className="relative z-20 container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
            {/* Main Profile Card */}
            <section className="w-full max-w-lg">
              <div className="card bg-white/5 backdrop-blur-xl shadow-2xl border border-white/10 overflow-hidden">
                {/* Gradient header */}
                <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />

                <div className="card-body items-center text-center py-8 px-6">
                  {/* Avatar with gradient ring */}
                  <div className="relative mb-4">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full blur opacity-75 animate-pulse" />
                    {profile.image ? (
                      <div className="avatar relative">
                        <div className="w-32 rounded-full ring-4 ring-white/20">
                          <ProfileImage
                            src={profile.image}
                            alt={`${profile.name}'s profile image`}
                            width={128}
                            height={128}
                            username={profile.name}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="avatar placeholder relative">
                        <div className="bg-gradient-to-br from-purple-500 to-cyan-500 text-white rounded-full w-32 ring-4 ring-white/20">
                          <span className="text-4xl font-bold">
                            {profile.name[0].toUpperCase()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Username */}
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    {profile.name}
                  </h1>

                  {/* Bio */}
                  <p className="text-white/60 mt-2 max-w-sm leading-relaxed">
                    {profile.bio || 'No bio available'}
                  </p>

                  {/* Stats */}
                  <div className="divider divider-neutral my-4 opacity-30" />
                  <ProfileStats
                    postsCount={articles.length}
                    followersCount={0}
                    followingCount={0}
                  />

                  {/* Action Buttons */}
                  <ProfileActions
                    username={profile.name}
                    isFollowing={profile.following}
                  />
                </div>
              </div>
            </section>

            {/* Social Links Widget */}
            {profile.socialMediaLinks && profile.socialMediaLinks.length > 0 && (
              <aside className="w-full lg:w-80">
                <div className="card bg-white/5 backdrop-blur-xl shadow-2xl border border-white/10 overflow-hidden sticky top-4">
                  {/* Gradient header */}
                  <div className="h-1 bg-gradient-to-r from-cyan-500 to-purple-500" />

                  <div className="card-body">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-cyan-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                      Connect with {profile.name}
                    </h3>
                    <div className="flex flex-col gap-3 mt-4">
                      {profile.socialMediaLinks.map((link) => {
                        let displayUrl = link.url;
                        let initialIconUrl: string | null = null;

                        try {
                          if (!displayUrl.startsWith('http')) {
                            displayUrl = `https://${displayUrl}`;
                          }
                          const urlObj = new URL(displayUrl);
                          initialIconUrl = `https://icons.duckduckgo.com/ip3/${urlObj.hostname}.ico`;
                        } catch {
                          console.warn(`Invalid URL for ${link.platform}: ${link.url}`);
                        }

                        return (
                          <SocialLinkItem
                            key={`${link.platform}-${link.url}`}
                            href={displayUrl}
                            platform={link.platform}
                            initialIconUrl={initialIconUrl}
                            username={profile.name}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </aside>
            )}
          </div>

          {/* Activity Feed */}
          <ActivityFeed articles={articles} username={profile.name} />
        </div>
      </main>
    </>
  );
}
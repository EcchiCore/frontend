// src/app/profiles/[username]/page.tsx
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProfileClient from './ProfileClient';
import myImageLoader from '../../lib/imageLoader';
import SocialLinkItem from './components/SocialLinkItem';

interface SocialMediaLink {
  platform: string;
  url: string;
}

interface Profile {
  username: string;
  bio: string | null;
  image: string | null;
  backgroundImage: string | null;
  following: boolean;
  socialMediaLinks?: SocialMediaLink[];
}

export async function generateMetadata({
                                         params,
                                       }: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  let profile: Profile | null = null;

  try {
    const apiUrl = process.env.API_URL ?? '';
    if (!apiUrl) return { title: 'User Profile', description: `Profile page of ${username}.` };

    const res = await fetch(`${apiUrl}/api/profiles/${username}`);
    if (!res.ok) return { title: 'Profile Not Found', description: 'The requested user profile could not be found.' };

    const data = await res.json();
    profile = data.profile;
  } catch (error) {
    console.error('Error fetching profile for metadata:', error);
  }

  const frontendUrl = process.env.FRONTEND_URL ?? '';
  const title = profile?.username ? `${profile.username}'s Profile` : 'User Profile';
  const desc = profile?.bio ?? `Profile page of ${username}. Follow to stay updated!`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: profile?.image ? [{ url: profile.image, width: 128, height: 128, alt: `${username}'s profile image` }] : [],
      url: frontendUrl ? `${frontendUrl}/profiles/${username}` : undefined,
      type: 'profile',
    },
    icons: profile?.image
      ? { icon: [{ url: profile.image }], shortcut: [{ url: profile.image }] }
      : undefined,
  };
}

export default async function ProfilePage({ params }: Readonly<{ params: Promise<{ username: string }> }>) {
  const { username } = await params;
  let profile: Profile | null = null;

  try {
    const publicApiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    if (!publicApiUrl) {
      console.error('NEXT_PUBLIC_API_URL is not defined.');
      notFound();
    }
    const res = await fetch(`${publicApiUrl}/api/profiles/${username}`);
    if (!res.ok) notFound();
    const data = await res.json();
    profile = data.profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    notFound();
  }

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
            name: profile.username,
            description: profile.bio ?? `Profile of ${profile.username}`,
            image: profile.image ?? undefined,
            url: publicBaseUrl ? `${publicBaseUrl}/profiles/${profile.username}` : undefined,
            sameAs: profile.socialMediaLinks?.map(link => link.url) || [],
          }),
        }}
      />

      <main
        className="min-h-screen relative flex items-center justify-center"
        style={{
          backgroundImage: profile.backgroundImage ? `url(${profile.backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10" aria-hidden="true" />

        <div className="container mx-auto p-4 relative z-20 flex flex-col lg:flex-row gap-6 items-center justify-center">
          {/* Main Profile Card */}
          <section className="card bg-base-100/10 backdrop-blur-md shadow-xl w-full max-w-2xl border border-primary/30">
            <div className="card-body">
              <header className="flex justify-center">
                {profile.image ? (
                  <div className="avatar">
                    <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                      <Image
                        loader={myImageLoader}
                        src={profile.image}
                        alt={`${profile.username}'s profile image`}
                        width={128}
                        height={128}
                        sizes="(max-width: 768px) 100vw, 128px"
                        className="rounded-full"
                        priority
                      />
                    </div>
                  </div>
                ) : (
                  <div className="avatar placeholder">
                    <div className="bg-neutral text-neutral-content rounded-full w-32">
                      <span className="text-4xl">{profile.username[0].toUpperCase()}</span>
                    </div>
                  </div>
                )}
              </header>

              <h1 className="card-title text-4xl justify-center mt-4 text-white">{profile.username}</h1>
              <p className="text-center text-base-content/70 mt-2">{profile.bio || 'No bio available'}</p>
              <div className="text-center mt-4">
                <span className={`badge ${profile.following ? 'badge-success' : 'badge-warning'}`}>
                  Following: {profile.following ? 'Yes' : 'No'}
                </span>
              </div>

              <ProfileClient profile={profile} />
            </div>
          </section>

          {/* Social Media Widget */}
          {profile.socialMediaLinks && profile.socialMediaLinks.length > 0 && (
            <aside className="lg:w-80 mt-8 lg:mt-0 self-start">
              <div className="card bg-base-100/10 backdrop-blur-md shadow-xl border border-primary/30 lg:sticky lg:top-4">
                <div className="card-body">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Connect with {profile.username}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {profile.socialMediaLinks.map((link) => {
                      let displayUrl = link.url;
                      let hostname = '';
                      let initialIconUrl: string | null = null;

                      try {
                        if (!displayUrl.startsWith('http')) {
                          displayUrl = `https://${displayUrl}`;
                        }
                        const urlObj = new URL(displayUrl);
                        hostname = urlObj.hostname;
                        initialIconUrl = `https://icons.duckduckgo.com/ip3/${hostname}.ico`;
                      } catch {
                        console.warn(`Invalid URL for ${link.platform}: ${link.url}`);
                      }

                      return (
                        <SocialLinkItem
                          key={`${link.platform}-${link.url}`}
                          href={displayUrl}
                          platform={link.platform}
                          initialIconUrl={initialIconUrl}
                          username={profile.username}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>
    </>
  );
}

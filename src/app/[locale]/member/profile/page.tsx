import Image from "next/image";
import { redirect } from "@/i18n/navigation";
import { cookies } from "next/headers";
import { ReactNode, Suspense } from 'react';
import { User, Shield, Star, Link as LinkIcon } from "lucide-react";
import myImageLoader from "@/lib/imageLoader";
import UserPageClient from "./UserPageClient";
import BackgroundImage from "./BackgroundImage";
import LogoutButton from "./LogoutButton";
import { getSdk } from "@/lib/sdk";
import { getTranslations } from "next-intl/server";

interface SocialMediaLink {
  platform: string;
  url: string;
}

interface UserData {
  username: string;
  email: string;
  bio: string;
  image: string;
  token: string;
  ranks: string[];
  backgroundImage?: string;
  points: number;
  socialMediaLinks: SocialMediaLink[];
}

async function getUserData(): Promise<{ userData: UserData | null; error: string | null }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { userData: null, error: "Not authenticated" };

  try {
    const sdk = await getSdk();

    const user = await sdk.users.getCurrentUser();

    if (!user) {
      throw new Error("cannotFetch");
    }

    // Map SDK User to our internal UserData interface
    // Note: We cast because the SDK type might be missing some fields we know are there
    const userData = user as unknown as UserData;
    
    return {
      userData: {
        ...userData,
        token, // Ensure token is passed from cookies if not in SDK response
      },
      error: null,
    };
  } catch (err) {
    console.error("Error fetching user data:", err);
    return {
      userData: null,
      error: err instanceof Error ? err.message : "errorFetching",
    };
  }
}

export default async function UserPage() {
  const { userData, error } = await getUserData();
  const t = await getTranslations('ProfilePage');

  if (error === "Not authenticated") {
    redirect("/login");
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="w-full fixed top-0 z-40">
        </div>

        <div className="relative z-10 backdrop-blur-xl bg-white/5 border border-white/10 p-8 shadow-2xl rounded-3xl w-full max-w-md mt-20">
          <div className="text-center">
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <div className="text-red-400">
                <span className="font-bold">{t('error')}: </span>
                <span>{error ? t(error as any) || error : t('userNotFound')}</span>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-12 relative overflow-hidden flex flex-col">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div className="w-full sticky top-0 z-40">
        <Suspense fallback={<div className="h-16 w-full bg-background/80 backdrop-blur-md border-b border-border/50" />}>
        </Suspense>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Card */}
          <div className="lg:col-span-2 space-y-8">
            <div className="card bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden rounded-3xl">
              {/* Background Header */}
              <div className="relative h-48 md:h-72">
                {userData.backgroundImage ? (
                  <BackgroundImage src={userData.backgroundImage} alt="Background" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
                  </div>
                )}
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>

                {/* Logout Button */}
                <div className="absolute top-6 right-6">
                  <LogoutButton />
                </div>
              </div>

              {/* Profile info overlap */}
              <div className="px-6 pb-8 md:px-10 relative">
                <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 md:-mt-20">
                  {/* Avatar */}
                  <div className="relative group self-start">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-500 p-1 shadow-2xl transform transition-transform group-hover:scale-105 duration-500">
                      <div className="w-full h-full rounded-[22px] overflow-hidden bg-slate-800 relative">
                        {userData.image ? (
                          <Image
                            loader={myImageLoader}
                            src={userData.image}
                            alt={userData.username}
                            fill
                            className="object-cover"
                            priority
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-4xl font-bold bg-slate-700 text-white">
                            {userData.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-900 shadow-lg"></div>
                  </div>

                  {/* Name and Basic Info */}
                  <div className="flex-1 pb-2">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                        {userData.username}
                      </h1>
                      <div className="badge badge-primary badge-outline gap-1 py-3 px-4 rounded-full">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-bold">{userData.points || 0} Points</span>
                      </div>
                    </div>
                    <p className="text-slate-400 flex items-center gap-2 font-medium">
                      {userData.email}
                    </p>
                  </div>
                </div>

                {/* Bio Section */}
                <div className="mt-10">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">{t('aboutMe')}</h3>
                  <div className="p-6 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-sm">
                    <p className="text-slate-200 leading-relaxed italic text-lg">
                      {userData.bio || t('noBio')}
                    </p>
                  </div>
                </div>

                {/* Ranks/Roles */}
                {userData.ranks && userData.ranks.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">{t('roles')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {userData.ranks.map((rank) => (
                        <div 
                          key={rank} 
                          className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-xl text-xs font-bold flex items-center gap-2"
                        >
                          <Shield className="w-3 h-3" />
                          {rank}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Social Links */}
                {userData.socialMediaLinks && userData.socialMediaLinks.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">{t('connections')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {userData.socialMediaLinks.map((link, idx) => (
                        <a 
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/10 transition-all group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                            <LinkIcon className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-500 uppercase">{link.platform}</span>
                            <span className="text-sm text-slate-300 truncate max-w-[150px]">{link.url.replace(/^https?:\/\//, '')}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Widgets */}
          <div className="lg:col-span-1">
            <UserPageClient userData={userData} />
          </div>
        </div>
      </div>
    </div>
  );
}
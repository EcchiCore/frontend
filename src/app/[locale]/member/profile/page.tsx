import Image from "next/image";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Link, User } from "lucide-react";
import myImageLoader from "../../lib/imageLoader";
import UserPageClient from "./UserPageClient";
import NavbarWrapper from "./NavbarWrapper";
import BackgroundImage from "./BackgroundImage";
import LogoutButton from "./LogoutButton"; // Import the new component

interface UserData {
  username: string;
  email: string;
  bio: string;
  image: string;
  token: string;
  ranks: string[];
  backgroundImage?: string;
}

async function fetchUserData(token: string): Promise<{ userData: UserData | null; error: string | null }> {
  try {
    const response = await fetch(`${process.env.API_URL || "https://api.chanomhub.online"}/api/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`ไม่สามารถรับข้อมูลผู้ใช้ได้ (${response.status})`);
    }

    const data = await response.json();
    return {
      userData: {
        ...data.user,
        token,
      },
      error: null,
    };
  } catch (err) {
    return {
      userData: null,
      error: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการรับข้อมูลผู้ใช้",
    };
  }
}

export default async function UserPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const { userData, error } = await fetchUserData(token);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="mt-16 relative z-10">
          <NavbarWrapper />
        </div>

        <div className="relative z-10 backdrop-blur-lg bg-white/10 border border-white/20 p-8 shadow-2xl rounded-3xl w-full max-w-md hover:scale-105 transition-all duration-500">
          <div className="text-center">
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl backdrop-blur-sm">
              <div className="text-red-300">
                <span className="font-bold text-red-200">เกิดข้อผิดพลาด: </span>
                <span className="text-red-100">{error}</span>
              </div>
            </div>
            <div className="mt-8">
              <Link
                href="/login"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:scale-105 w-full"
              >
                <span className="relative z-10">ไปหน้าเข้าสู่ระบบ</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="mt-16 relative z-10">
          <NavbarWrapper />
        </div>

        <div className="relative z-10 backdrop-blur-lg bg-white/10 border border-white/20 p-8 shadow-2xl rounded-3xl w-full max-w-md hover:scale-105 transition-all duration-500">
          <div className="text-center">
            <div className="mb-6 w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-6 text-white">ไม่พบข้อมูลผู้ใช้</h2>
            <Link
              href="/login"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:scale-105 w-full"
            >
              <span className="relative z-10">ไปหน้าเข้าสู่ระบบ</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="mt-4 relative z-10">
        <NavbarWrapper />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <div className="group backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-purple-500/20 hover:scale-[1.02] hover:bg-white/15">
              {/* Background Header */}
              <div className="relative w-full h-48 md:h-64 overflow-hidden">
                {userData.backgroundImage ? (
                  <>
                    <BackgroundImage src={userData.backgroundImage} alt="Background" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10"></div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600/40 via-blue-600/40 to-indigo-600/40 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/30"></div>
                    {/* Geometric patterns */}
                    <div className="absolute top-4 right-4 w-20 h-20 border border-white/20 rounded-full"></div>
                    <div className="absolute bottom-4 left-4 w-16 h-16 border border-white/20 rounded-lg rotate-45"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/10 rounded-full"></div>
                  </div>
                )}

                {/* Logout Button - moved to header */}
                <div className="absolute top-6 right-6 z-20">
                  <LogoutButton /> {/* Use the new Client Component */}
                </div>
              </div>

              {/* Profile Content */}
              <div className="relative px-6 pt-20 pb-8 md:px-8">
                {/* Profile Avatar */}
                <div className="absolute -top-16 left-8">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-1 shadow-2xl hover:scale-110 transition-all duration-300">
                      <div className="w-full h-full rounded-full overflow-hidden bg-slate-800 relative">
                        {userData.image ? (
                          <Image
                            loader={myImageLoader}
                            src={userData.image || "/placeholder.svg"}
                            alt={userData.username}
                            width={128}
                            height={128}
                            className="object-cover hover:scale-110 transition-transform duration-300"
                            priority
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-4xl">
                            <User className="h-16 w-16 text-purple-300" />
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Online indicator */}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-800 shadow-lg animate-pulse"></div>
                  </div>
                </div>

                {/* User Info */}
                <div className="mt-8 md:mt-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h1 className="text-4xl font-bold mb-2 text-white bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                        {userData.username}
                      </h1>
                      <p className="text-lg text-gray-100 flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                        {userData.email}
                      </p>
                    </div>
                  </div>

                  {/* Bio Section */}
                  {userData.bio && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300">
                      <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider mb-2">เกี่ยวกับฉัน</h3>
                      <p className="text-gray-100 leading-relaxed italic">{userData.bio}</p>
                    </div>
                  )}

                  {/* Ranks Section */}
                  {userData.ranks && userData.ranks.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                        ระดับผู้ใช้
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {userData.ranks.map((rank, index) => (
                          <span
                            key={index}
                            className="group relative px-6 py-3 bg-gradient-to-r from-purple-600/80 to-blue-600/80 backdrop-blur-sm border border-white/20 rounded-full text-white font-medium text-sm hover:from-purple-500 hover:to-blue-500 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/25 cursor-default"
                          >
                            <span className="relative z-10">{rank}</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Side Widgets */}
          <div className="lg:col-span-1 space-y-6">
            <UserPageClient userData={userData} />
          </div>
        </div>
      </div>
    </div>
  );
}
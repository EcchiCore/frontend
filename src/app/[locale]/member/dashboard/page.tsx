'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { Link } from '@/i18n/navigation';
import { hasRole, getUserRoles } from '@/lib/permissions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  FileText,
  Wallet,
  Shield,
  Settings,
  Activity,
  Plus,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Award,
  BookOpen
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { user } = useAppSelector((state) => state.auth);

  const isStaff = hasRole(user, ['ADMIN', 'MODERATOR']);
  const isAdmin = hasRole(user, ['ADMIN', 'SUPERADMIN']);

  return (
    <div className="space-y-8">
      {/* Hero / Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white/30 shadow-md">
              <AvatarImage src={user?.image || ''} alt={user?.username || 'User'} />
              <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                {(user?.username || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome back, {user?.username || 'Member'}!
                </h1>
                <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
              </div>
              <p className="text-white/80 text-sm mt-1">
                Here is what is happening with your account today.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {getUserRoles(user).map((role) => (
                  <Badge key={role} className="bg-white/20 text-white border-0 backdrop-blur-sm font-semibold">
                    Role: {role}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-white text-indigo-700 hover:bg-white/90 font-semibold shadow-md">
              <Link href="/upload/games">
                <Plus className="h-4 w-4 mr-2" /> New Article
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
              <Link href="/member/dashboard/profile">
                <User className="h-4 w-4 mr-2" /> View Profile
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wallet Balance Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Points Balance</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{user?.points ?? 0}</h3>
              <p className="text-xs text-muted-foreground mt-1">Available for unlock</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400">
              <Wallet className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Profile Status */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account Status</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">Active</h3>
              <p className="text-xs text-muted-foreground mt-1">{user?.email || 'Verified user'}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <Award className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Studio / Content Hub */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Creator Studio</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">Content</h3>
              <p className="text-xs text-muted-foreground mt-1">Manage sales & posts</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400">
              <Activity className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Moderation / Staff Status */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Access Level</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{isStaff ? 'Staff' : 'Member'}</h3>
              <p className="text-xs text-muted-foreground mt-1">{isAdmin ? 'Full System Admin' : isStaff ? 'Content Moderator' : 'Community Member'}</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-400">
              <Shield className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-500" /> Dashboard Navigation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* My Profile */}
          <Link href="/member/dashboard/profile" className="group">
            <Card className="h-full group-hover:border-primary/50 group-hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-500" /> Profile & Identity
                </CardTitle>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs text-muted-foreground">
                  Update profile information, avatar, cover image, bio, and public social links.
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          {/* Articles Management */}
          <Link href="/member/dashboard/articles" className="group">
            <Card className="h-full group-hover:border-primary/50 group-hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" /> Articles & Posts
                </CardTitle>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs text-muted-foreground">
                  Manage your created articles, review drafts, status, and community feed mode.
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          {/* Wallet */}
          <Link href="/member/dashboard/wallet" className="group">
            <Card className="h-full group-hover:border-primary/50 group-hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-emerald-500" /> Wallet & Voucher
                </CardTitle>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs text-muted-foreground">
                  Redeem TrueMoney vouchers into points balance and check transaction history.
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          {/* Creator Studio */}
          <Link href="/member/dashboard/studio" className="group">
            <Card className="h-full group-hover:border-primary/50 group-hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors flex items-center gap-2">
                  <Activity className="h-5 w-5 text-amber-500" /> Creator Studio
                </CardTitle>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs text-muted-foreground">
                  Track earnings, sales analytics, current balance, and payouts for your published games.
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          {/* Staff: Moderation */}
          {isStaff && (
            <Link href="/member/dashboard/moderation" className="group">
              <Card className="h-full group-hover:border-primary/50 group-hover:shadow-md transition-all border-amber-500/30 bg-amber-500/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-semibold group-hover:text-amber-600 transition-colors flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <Shield className="h-5 w-5 text-amber-500" /> Moderation Console
                  </CardTitle>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-amber-500 transition-all" />
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs text-muted-foreground">
                    Review pending content submissions, download links, comments, and font requests.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* Admin Console */}
          {isAdmin && (
            <Link href="/member/dashboard/admin" className="group">
              <Card className="h-full group-hover:border-primary/50 group-hover:shadow-md transition-all border-purple-500/30 bg-purple-500/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-semibold group-hover:text-purple-600 transition-colors flex items-center gap-2 text-purple-700 dark:text-purple-400">
                    <Settings className="h-5 w-5 text-purple-500" /> Admin Console
                  </CardTitle>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-purple-500 transition-all" />
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs text-muted-foreground">
                    System configuration, user roles & rank management, and platform control settings.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* Settings */}
          <Link href="/member/dashboard/settings" className="group">
            <Card className="h-full group-hover:border-primary/50 group-hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-500" /> Account Settings
                </CardTitle>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs text-muted-foreground">
                  Configure password, developer API keys, notifications, and security options.
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
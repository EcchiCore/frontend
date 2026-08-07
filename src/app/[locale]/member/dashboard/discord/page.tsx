'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  AlertCircle,
  Check,
  X,
  Loader2,
  Server,
  UserCheck,
  Users,
  Shield,
  Trash2,
  FileText,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { parseCookies } from 'nookies';
import { useTranslations } from 'next-intl';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// API base URL
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.com';

interface Guild {
  id: string;
  name: string;
}

interface Member {
  id: string;
  username: string;
  nickname: string;
  roles: string[];
  color: string;
  role_name: string;
}

interface SpamLog {
  userId: string;
  username: string;
  deletedCount: number;
  logPath: string;
  timestamp: string;
}

export default function DashboardDiscordPage() {
  const t = useTranslations('Discord');
  // Auth state
  const [token, setToken] = useState<string | null>(null);

  // Bot & Guild States
  const [botStatus, setBotStatus] = useState<{ status: string; bot_tag: string } | null>(null);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<string>('');
  
  // Data States
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [spamLoading, setSpamLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Spam logs history (locally saved in state for dashboard preview)
  const [recentSpamLogs, setRecentSpamLogs] = useState<SpamLog[]>([]);
  const [activeLogContent, setActiveLogContent] = useState<string | null>(null);
  const [viewingLogPath, setViewingLogPath] = useState<string | null>(null);
  const [logLoading, setLogLoading] = useState(false);

  // Extract cookies token on mount
  useEffect(() => {
    const cookies = parseCookies();
    if (cookies.token) {
      setToken(cookies.token);
    } else {
      setError('Authentication required: Please log in');
      window.location.href = '/login';
    }
  }, []);

  // Secure API fetch helper
  const apiFetch = useCallback(async (path: string, options: RequestInit = {}) => {
    const cookies = parseCookies();
    const activeToken = cookies.token || token;
    
    if (!activeToken) {
      throw new Error('Authentication required');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${activeToken}`,
      ...(options.headers || {}),
    };

    const response = await fetch(`${BACKEND_URL}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return response.json();
  }, [token]);

  // Load Bot Status
  const loadBotStatus = useCallback(async () => {
    try {
      setStatusLoading(true);
      const data = await apiFetch('/api/discord/status');
      setBotStatus(data);
    } catch (err: any) {
      setBotStatus(null);
      setError(t('botConnectionError', { error: err.message }));
    } finally {
      setStatusLoading(false);
    }
  }, [apiFetch]);

  // Load Guilds
  const loadGuilds = useCallback(async () => {
    try {
      const data = await apiFetch('/api/discord/guilds');
      setGuilds(data || []);
      if (data && data.length > 0 && !selectedGuild) {
        setSelectedGuild(data[0].id);
      }
    } catch (err: any) {
      setError(t('fetchGuildsError', { error: err.message }));
    }
  }, [apiFetch, selectedGuild]);

  // Load Members
  const loadMembers = useCallback(async (guildId: string, searchVal: string = '') => {
    if (!guildId) return;
    try {
      setLoading(true);
      const path = searchVal 
        ? `/api/discord/members?guildId=${guildId}&query=${encodeURIComponent(searchVal)}` 
        : `/api/discord/members?guildId=${guildId}`;
      const data = await apiFetch(path);
      setMembers(data || []);
    } catch (err: any) {
      setError(t('fetchMembersError', { error: err.message }));
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  // Auto Dismiss Alerts
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Initialize Page Data
  useEffect(() => {
    if (token) {
      loadBotStatus();
      loadGuilds();
    }
  }, [token, loadBotStatus, loadGuilds]);

  // Watch Guild Selection changes to refresh members list
  useEffect(() => {
    if (selectedGuild) {
      loadMembers(selectedGuild, searchTerm);
      setSelectedMember(null);
    }
  }, [selectedGuild, loadMembers]);

  // Trigger search on input change
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadMembers(selectedGuild, searchTerm);
  };

  // Refresh current view
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadBotStatus(),
      loadGuilds(),
      loadMembers(selectedGuild, searchTerm)
    ]);
    setRefreshing(false);
  };

  // Execute Anti-Spam (Purge and Mute)
  const handleCleanSpam = async () => {
    if (!selectedMember || !selectedGuild) return;
    
    const confirmMsg = t('spamCleanConfirm', { nickname: selectedMember.nickname, username: selectedMember.username });
    if (!window.confirm(confirmMsg)) return;

    try {
      setSpamLoading(true);
      setError(null);
      
      const result = await apiFetch('/api/discord/spam', {
        method: 'POST',
        body: JSON.stringify({
          guildId: selectedGuild,
          userId: selectedMember.id,
        })
      });

      if (result) {
        setSuccess(t('spamCleanSuccess', { count: result.deleted_count, nickname: selectedMember.nickname }));
        
        // Add operation to recent logs
        const newLog: SpamLog = {
          userId: selectedMember.id,
          username: selectedMember.nickname,
          deletedCount: result.deleted_count,
          logPath: result.log_path,
          timestamp: new Date().toLocaleTimeString(),
        };
        setRecentSpamLogs(prev => [newLog, ...prev]);

        // Refresh list
        loadMembers(selectedGuild, searchTerm);
        setSelectedMember(null);
      }
    } catch (err: any) {
      setError(t('spamCleanError', { error: err.message }));
    } finally {
      setSpamLoading(false);
    }
  };

  // Fetch log contents
  const handleViewLog = async (logPath: string) => {
    try {
      setLogLoading(true);
      setViewingLogPath(logPath);
      const data = await apiFetch(`/api/discord/logs?path=${encodeURIComponent(logPath)}`);
      setActiveLogContent(data || 'Log file is empty.');
    } catch (err: any) {
      setError(t('readLogError', { error: err.message }));
    } finally {
      setLogLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/10 via-indigo-900/15 to-blue-900/10 dark:from-purple-950/20 dark:to-blue-950/20 p-6 border border-indigo-500/20">
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
              <Server className="w-8 h-8 text-indigo-500" />
              Discord Command Center
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('subtitle')}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Status indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 border border-border">
              {statusLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : botStatus && botStatus.status === 'online' ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-sm font-semibold text-green-500">ONLINE</span>
                  <span className="text-xs text-muted-foreground border-l pl-2">{botStatus.bot_tag}</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span className="text-sm font-semibold text-red-500">OFFLINE</span>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing || statusLoading}
              title={t('refreshTooltip')}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Alert Notices */}
      {error && (
        <Alert variant="destructive" className="border-red-500/20 bg-red-500/5">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <AlertTitle className="text-red-500">{t('errorTitle')}</AlertTitle>
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-emerald-500/20 bg-emerald-500/5">
          <Check className="w-4 h-4 text-emerald-500" />
          <AlertTitle className="text-emerald-500">{t('successTitle')}</AlertTitle>
          <AlertDescription className="text-emerald-400">{success}</AlertDescription>
        </Alert>
      )}

      {/* Main Panel grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Servers & Members Selector */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                {t('serversAndMembers')}
              </CardTitle>
              <CardDescription>
                {t('selectServerDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Guild Selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Discord Guild</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={selectedGuild}
                  onChange={(e) => setSelectedGuild(e.target.value)}
                >
                  {guilds.map((g) => (
                    <option key={g.id} value={g.id}>
                      🌐 {g.name}
                    </option>
                  ))}
                  {guilds.length === 0 && (
                    <option value="">{t('noGuildFound')}</option>
                  )}
                </select>
              </div>

              {/* Members search */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t('searchPlaceholder')}
                    className="pl-9 bg-background/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  {t('search')}
                </Button>
              </form>

              {/* Members List */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="max-h-[360px] overflow-y-auto divide-y divide-border bg-card">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                      <p className="text-xs text-muted-foreground">{t('loadingMembers')}</p>
                    </div>
                  ) : members.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground text-sm">
                      {t('noMembersFound')}
                    </div>
                  ) : (
                    members.map((member) => (
                      <div
                        key={member.id}
                        onClick={() => setSelectedMember(member)}
                        className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                          selectedMember?.id === member.id
                            ? 'bg-indigo-500/10 border-l-4 border-indigo-500'
                            : 'hover:bg-accent/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-sm">
                            {member.nickname.substring(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-sm" style={{ color: member.color || 'inherit' }}>
                              {member.nickname}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                              @{member.username} ({member.id})
                            </div>
                          </div>
                        </div>

                        <div className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                          {member.role_name}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Member Details & Logs viewer */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border border-border h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-500" />
                {t('memberManagement')}
              </CardTitle>
              <CardDescription>
                {t('selectMemberDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              {selectedMember ? (
                <div className="space-y-6">
                  {/* Member Overview Panel */}
                  <div className="p-4 rounded-xl bg-accent/30 border border-border flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-2xl border border-indigo-500/20">
                      {selectedMember.nickname.substring(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: selectedMember.color || 'inherit' }}>
                        {selectedMember.nickname}
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono">ID: {selectedMember.id}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Username: @{selectedMember.username}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-semibold border border-indigo-500/10">
                          {selectedMember.role_name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Red Zone: Anti-Spam Cleanup */}
                  <div className="p-5 rounded-xl border border-red-500/20 bg-red-500/5 space-y-3">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="w-8 h-8 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-red-500 text-sm">{t('highSecurityZoneTitle')}</h4>
                        <p className="text-xs text-red-400/80 mt-1 leading-relaxed">
                          {t('highSecurityZoneDesc')}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        onClick={handleCleanSpam}
                        disabled={spamLoading}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold gap-2"
                      >
                        {spamLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('clearingChat')}
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            {t('purgeSpamAndMute')}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Anti-Spam log history displays */}
                  {recentSpamLogs.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4" /> {t('recentSpamLogs')}
                      </h4>
                      <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
                        {recentSpamLogs.map((logItem, idx) => (
                          <div key={idx} className="p-3 bg-card hover:bg-accent/30 flex items-center justify-between">
                            <div>
                              <div className="text-sm font-semibold">
                                {t('purgedUserMsg', { username: logItem.username, count: logItem.deletedCount })}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {t('time', { time: logItem.timestamp })}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-indigo-500 hover:text-indigo-400 gap-1"
                              onClick={() => handleViewLog(logItem.logPath)}
                            >
                              {t('openLog')} <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center text-muted-foreground gap-3">
                  <Shield className="w-12 h-12 text-muted-foreground/50" />
                  <div>
                    <p className="font-semibold text-sm">{t('noMemberSelectedTitle')}</p>
                    <p className="text-xs max-w-sm mt-1">{t('noMemberSelectedDesc')}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Logs Viewer Modal */}
      {activeLogContent && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  {t('logModalTitle')}
                </h3>
                <p className="text-xs text-muted-foreground truncate max-w-lg mt-0.5">
                  {t('logFilePath', { path: viewingLogPath || '' })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setActiveLogContent(null);
                  setViewingLogPath(null);
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-black text-emerald-400 font-mono text-xs rounded-b-xl max-h-[500px]">
              {logLoading ? (
                <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {t('fetchingLog')}
                </div>
              ) : (
                <pre className="whitespace-pre-wrap leading-relaxed">
                  {activeLogContent}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

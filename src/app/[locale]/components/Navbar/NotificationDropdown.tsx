"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Cookies from "js-cookie";
import { Bell, Trash2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSocket } from "@/contexts/SocketContext";

interface Notification {
  id: number;
  userId: number;
  type: string;
  message: string;
  isRead: boolean;
  entityId?: number | null;
  entityType?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface NotificationResponse {
  notifications: Notification[];
  notificationsCount: number;
  unreadCount: number;
}

interface NotificationDropdownProps {
  isMobile?: boolean;
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;
const NOTIFICATIONS_LIMIT = 10;
const INITIAL_POLLING_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_POLLING_INTERVAL = 60 * 60 * 1000; // 1 hour
const POLLING_BACKOFF_FACTOR = 1.5;
const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

export default function NotificationDropdown({ isMobile = false }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState<number | null>(null);
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);

  // Refs for polling (no re-renders)
  const pollingIntervalRef = useRef(INITIAL_POLLING_INTERVAL);
  const lastActivityRef = useRef(Date.now());
  const isFetchingRef = useRef(false);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();

  const getAuthHeaders = useCallback(() => {
    const token = Cookies.get("token");
    if (!token) throw new Error("No token");
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, []);

  // Track user activity
  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
    };
  }, []);

  // Click outside → close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications (stable callback, uses refs)
  const fetchNotificationsInternal = useCallback(
    async (showLoading: boolean) => {
      if (isFetchingRef.current) return;
      try {
        isFetchingRef.current = true;
        if (showLoading) setLoading(true);
        setError(null);

        const headers = getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/notifications?take=${NOTIFICATIONS_LIMIT}`, { headers });

        if (!res.ok) {
          if (res.status === 401) {
            Cookies.remove("token");
            if (showLoading) window.location.href = "/login";
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }

        const data: NotificationResponse = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch (err) {
        console.error("Fetch notifications failed:", err);
        if (showLoading) setError("โหลดแจ้งเตือนล้มเหลว");
      } finally {
        isFetchingRef.current = false;
        if (showLoading) setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  // Polling loop (runs once on mount, uses refs to avoid re-init)
  useEffect(() => {
    let isMounted = true;

    const scheduleNextPoll = () => {
      if (!isMounted) return;

      const delay = pollingIntervalRef.current;

      timeoutIdRef.current = setTimeout(async () => {
        if (!isMounted) return;

        // Check idle
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        const isIdle = timeSinceLastActivity > IDLE_TIMEOUT;

        if (isIdle) {
          pollingIntervalRef.current = MAX_POLLING_INTERVAL;
        }

        // Fetch (background, no loading spinner)
        await fetchNotificationsInternal(false);

        // Backoff (only if not idle, as idle already maxed out)
        if (!isIdle) {
          pollingIntervalRef.current = Math.min(
            pollingIntervalRef.current * POLLING_BACKOFF_FACTOR,
            MAX_POLLING_INTERVAL
          );
        }

        // Schedule next
        scheduleNextPoll();
      }, delay);
    };

    scheduleNextPoll();

    return () => {
      isMounted = false;
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    };
  }, [fetchNotificationsInternal]);

  // Reset polling on dropdown open
  useEffect(() => {
    if (isOpen) {
      fetchNotificationsInternal(true);
      pollingIntervalRef.current = INITIAL_POLLING_INTERVAL;
      lastActivityRef.current = Date.now();
    }
  }, [isOpen, fetchNotificationsInternal]);

  // Initial fetch
  useEffect(() => {
    fetchNotificationsInternal(true);
  }, [fetchNotificationsInternal]);

  // WebSocket realtime
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data: any) => {
      const newNotif: Notification = {
        id: data.id ?? Date.now(),
        userId: data.userId ?? 0,
        type: data.type ?? "INFO",
        message: data.message ?? "มีแจ้งเตือนใหม่",
        isRead: false,
        entityId: data.entityId ?? null,
        entityType: data.entityType ?? null,
        createdAt: data.createdAt ?? new Date().toISOString(),
        updatedAt: data.updatedAt ?? new Date().toISOString(),
      };

      setNotifications((prev) => [newNotif, ...prev.slice(0, NOTIFICATIONS_LIMIT - 1)]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("notification", handleNewNotification);
    return () => {
      socket.off("notification", handleNewNotification);
    };
  }, [socket]);

  // Actions
  const markAsRead = async (id: number) => {
    if (isMarkingAsRead === id) return;
    try {
      setIsMarkingAsRead(id);
      const prevNotifs = [...notifications];
      const prevCount = unreadCount;

      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));

      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: "PATCH", headers });

      if (!res.ok) {
        setNotifications(prevNotifs);
        setUnreadCount(prevCount);
      }
    } catch (err) {
      console.error("Mark as read failed:", err);
      setError("ไม่สามารถอ่านได้");
    } finally {
      setIsMarkingAsRead(null);
    }
  };

  const markAllAsRead = async () => {
    if (isMarkingAllAsRead || unreadCount === 0) return;
    try {
      setIsMarkingAllAsRead(true);
      const prevNotifs = [...notifications];

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);

      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/notifications/read-all`, { method: "PATCH", headers });

      if (!res.ok) {
        setNotifications(prevNotifs);
        setUnreadCount(prevNotifs.filter((n) => !n.isRead).length);
      }
    } catch (err) {
      console.error("Mark all as read failed:", err);
      setError("อ่านทั้งหมดล้มเหลว");
    } finally {
      setIsMarkingAllAsRead(false);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/notifications/${id}`, { method: "DELETE", headers });

      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setUnreadCount((prev) => {
          const notif = notifications.find((n) => n.id === id);
          return notif && !notif.isRead ? Math.max(0, prev - 1) : prev;
        });
      }
    } catch {
      setError("ลบไม่สำเร็จ");
    }
  };

  const formatDate = (dateStr: string) => {
    const now = Date.now();
    const date = new Date(dateStr).getTime();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "เมื่อสักครู่";
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    if (hours < 24) return `${hours} ชม.ที่แล้ว`;
    if (days < 7) return `${days} วันที่แล้ว`;
    return new Date(dateStr).toLocaleDateString("th-TH", { month: "short", day: "numeric" });
  };

  const getTypeInfo = (type: string) => {
    switch (type) {
      case "MODERATION_UPDATE":
        return { variant: "secondary" as const, label: "อัปเดตการตรวจสอบ" };
      case "WARNING":
        return { variant: "outline" as const, label: "คำเตือน" };
      case "ERROR":
        return { variant: "destructive" as const, label: "ข้อผิดพลาด" };
      case "SUCCESS":
        return { variant: "secondary" as const, label: "สำเร็จ" };
      default:
        return { variant: "default" as const, label: "ข้อมูล" };
    }
  };

  return (
    <div className={`relative ${isMobile ? "mr-2" : "ml-2"}`} ref={dropdownRef}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative hover:scale-110 transition-transform">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-[10px] animate-pulse"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80 p-0">
          {/* Header */}
          <div className="p-4 border-b bg-gradient-to-r from-primary/5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">แจ้งเตือน</h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={isMarkingAllAsRead}>
                    {isMarkingAllAsRead ? <RefreshCw className="h-3 w-3 animate-spin" /> : "อ่านทั้งหมด"}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fetchNotificationsInternal(true)}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">มีแจ้งเตือนใหม่ {unreadCount} รายการ</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-destructive/10 border-b">
              <div className="flex items-center gap-2 text-xs text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            </div>
          )}

          {/* List */}
          <ScrollArea className="max-h-96">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center">
                <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>ไม่มีการแจ้งเตือน</p>
              </div>
            ) : (
              notifications.map((n) => {
                const { variant, label } = getTypeInfo(n.type);
                return (
                  <div
                    key={n.id}
                    className={`p-3 border-b last:border-b-0 cursor-pointer transition-colors ${!n.isRead ? "bg-accent/50" : "hover:bg-accent/30"
                      }`}
                    onClick={() => !n.isRead && markAsRead(n.id)}
                  >
                    <div className="flex items-start gap-3">
                      {!n.isRead && <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={variant} className="text-xs">
                              {label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{formatDate(n.createdAt)}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(n.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm mt-1 line-clamp-2">{n.message}</p>
                        {n.entityType && n.entityId && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {n.entityType} #{n.entityId}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </ScrollArea>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t text-center">
              <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/notifications")}>
                ดูทั้งหมด →
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
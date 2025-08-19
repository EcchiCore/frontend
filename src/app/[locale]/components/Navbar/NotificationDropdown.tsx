// NotificationDropdown.tsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Cookies from "js-cookie";
import { Bell, Trash2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: number;
  userId: number;
  type: string;
  message: string;
  isRead: boolean;
  entityId: number;
  entityType: string;
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

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.online'}/api`;
const NOTIFICATION_TYPES = {
  MODERATION_UPDATE: "อัปเดตการตรวจสอบ",
  WARNING: "คำเตือน",
  ERROR: "ข้อผิดพลาด",
  INFO: "ข้อมูล",
  SUCCESS: "สำเร็จ",
} as const;

const POLLING_INTERVAL = 30000;
const NOTIFICATIONS_LIMIT = 10;

export default function NotificationDropdown({ isMobile = false }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState<number | null>(null);
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Fix hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = Cookies.get("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    return {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  }, []);

  const fetchNotifications = useCallback(async (showLoader = false) => {
    if (!isClient) return;
    
    try {
      if (showLoader) setLoading(true);
      setError(null);

      const headers = getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/notifications?skip=0&take=${NOTIFICATIONS_LIMIT}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        switch (response.status) {
          case 401:
            throw new Error("กรุณาเข้าสู่ระบบใหม่");
          case 403:
            throw new Error("ไม่มีสิทธิ์เข้าถึงการแจ้งเตือน");
          case 404:
            throw new Error("ไม่พบข้อมูลการแจ้งเตือน");
          case 500:
            throw new Error("เกิดข้อผิดพลาดจากเซิร์ฟเวอร์");
          default:
            throw new Error(`เกิดข้อผิดพลาด: ${response.status}`);
        }
      }

      const data: NotificationResponse = await response.json();
      if (!data || !Array.isArray(data.notifications)) {
        throw new Error("รูปแบบข้อมูลไม่ถูกต้อง");
      }

      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      const errorMessage = err instanceof Error ? err.message : "ไม่สามารถโหลดการแจ้งเตือนได้";
      setError(errorMessage);

      // Stop polling on auth errors
      if (err instanceof Error && err.message.includes("เข้าสู่ระบบ")) {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [getAuthHeaders, isClient]);

  const markAsRead = useCallback(async (notificationId: number) => {
    if (isMarkingAsRead === notificationId) return;

    try {
      setIsMarkingAsRead(notificationId);
      const originalNotifications = [...notifications];
      const originalUnreadCount = unreadCount;

      // Optimistic update
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      const headers = getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers,
        }
      );

      if (!response.ok) {
        // Revert optimistic update
        setNotifications(originalNotifications);
        setUnreadCount(originalUnreadCount);
        throw new Error(`ไม่สามารถอัปเดตสถานะการอ่านได้: ${response.status}`);
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      setError("ไม่สามารถอัปเดตสถานะการอ่านได้");
    } finally {
      setIsMarkingAsRead(null);
    }
  }, [isMarkingAsRead, notifications, unreadCount, getAuthHeaders]);

  const markAllAsRead = useCallback(async () => {
    if (isMarkingAllAsRead || unreadCount === 0) return;

    try {
      setIsMarkingAllAsRead(true);
      const originalNotifications = [...notifications];
      const originalUnreadCount = unreadCount;

      // Optimistic update
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);

      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: "PATCH",
        headers,
      });

      if (!response.ok) {
        // Revert optimistic update
        setNotifications(originalNotifications);
        setUnreadCount(originalUnreadCount);
        throw new Error(`ไม่สามารถอัปเดตสถานะการอ่านทั้งหมดได้: ${response.status}`);
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      setError("ไม่สามารถอัปเดตสถานะการอ่านทั้งหมดได้");
    } finally {
      setIsMarkingAllAsRead(false);
    }
  }, [isMarkingAllAsRead, unreadCount, notifications, getAuthHeaders]);

  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (response.ok) {
        const deletedNotification = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } else {
        throw new Error(`ไม่สามารถลบการแจ้งเตือนได้: ${response.status}`);
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
      setError("ไม่สามารถลบการแจ้งเตือนได้");
    }
  }, [getAuthHeaders, notifications]);

  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "ไม่ทราบวันที่";
      }

      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (minutes < 1) return "เมื่อสักครู่";
      if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
      if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
      if (days < 7) return `${days} วันที่แล้ว`;

      return date.toLocaleDateString("th-TH", {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "ไม่ทราบวันที่";
    }
  }, []);

  const getTypeInfo = useCallback((type: string) => {
    switch (type) {
      case "MODERATION_UPDATE":
        return { variant: "default" as const, label: NOTIFICATION_TYPES.MODERATION_UPDATE };
      case "WARNING":
        return { variant: "secondary" as const, label: NOTIFICATION_TYPES.WARNING };
      case "ERROR":
        return { variant: "destructive" as const, label: NOTIFICATION_TYPES.ERROR };
      case "SUCCESS":
        return { variant: "default" as const, label: NOTIFICATION_TYPES.SUCCESS };
      case "INFO":
      default:
        return { variant: "outline" as const, label: NOTIFICATION_TYPES.INFO };
    }
  }, []);

  // Setup polling effect
  useEffect(() => {
    if (!isClient) return;

    fetchNotifications(false);
    
    pollingRef.current = setInterval(() => {
      fetchNotifications(false);
    }, POLLING_INTERVAL);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [fetchNotifications, isClient]);

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!isClient) {
    return (
      <div className={`relative ${isMobile ? 'mr-2' : 'ml-2'}`}>
        <Button variant="ghost" size="icon" disabled className="relative">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`relative ${isMobile ? 'mr-2' : 'ml-2'}`}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (!isOpen) {
                fetchNotifications(true);
              }
              setIsOpen(!isOpen);
            }}
            disabled={loading}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 max-h-96" align="end">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">แจ้งเตือน</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={isMarkingAllAsRead}
                  className="text-xs"
                >
                  {isMarkingAllAsRead && (
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                  )}
                  อ่านทั้งหมด
                </Button>
              )}
            </div>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                คุณมีการแจ้งเตือนใหม่ {unreadCount} รายการ
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 border-b bg-destructive/10">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                <span className="text-xs text-destructive flex-1">{error}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setError(null)}
                  className="h-6 w-6 text-destructive hover:text-destructive-foreground"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          <ScrollArea className="max-h-64">
            {loading ? (
              <div className="p-4 text-center">
                <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">กำลังโหลด...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center">
                <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">ไม่มีการแจ้งเตือน</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchNotifications(true)}
                  className="mt-2"
                >
                  รีเฟรช
                </Button>
              </div>
            ) : (
              notifications.map((notification) => {
                const typeInfo = getTypeInfo(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`group p-3 border-b last:border-b-0 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-accent/50 hover:bg-accent' : 'hover:bg-accent'
                    }`}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        !notification.isRead ? 'bg-primary' : 'bg-muted'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={typeInfo.variant} className="text-xs">
                              {typeInfo.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 hover:text-destructive h-6 w-6 flex-shrink-0"
                            title="ลบการแจ้งเตือน"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-sm line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                        {notification.entityType && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.entityType} #{notification.entityId}
                          </p>
                        )}
                      </div>
                      {isMarkingAsRead === notification.id && (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </ScrollArea>

          {notifications.length > 0 && (
            <div className="p-3 border-t text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  window.location.href = '/notifications';
                  setIsOpen(false);
                }}
                className="text-xs"
              >
                ดูทั้งหมด
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
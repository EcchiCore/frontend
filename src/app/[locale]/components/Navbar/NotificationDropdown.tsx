"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Cookies from "js-cookie";
import { Bell, Trash2, AlertCircle } from "lucide-react";
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

const API_BASE_URL = `http://localhost:3001/api`;
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const hasFetchedOnceRef = useRef(false);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const fetchNotifications = useCallback(async (showLoader = false) => {
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

      if (err instanceof Error && err.message.includes("เข้าสู่ระบบ")) {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [getAuthHeaders]);

  const markAsRead = async (notificationId: number) => {
    if (isMarkingAsRead === notificationId) return;

    try {
      setIsMarkingAsRead(notificationId);
      const originalNotifications = [...notifications];
      const originalUnreadCount = unreadCount;

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
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
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
  };

  const markAllAsRead = async () => {
    if (isMarkingAllAsRead || unreadCount === 0) return;

    try {
      setIsMarkingAllAsRead(true);
      const originalNotifications = [...notifications];
      const originalUnreadCount = unreadCount;

      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);

      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({}),
      });

      if (!response.ok) {
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
  };

  const deleteNotification = async (notificationId: number) => {
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
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        setUnreadCount(prev => {
          const notification = notifications.find(n => n.id === notificationId);
          return notification && !notification.isRead ? Math.max(0, prev - 1) : prev;
        });
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
      setError("ไม่สามารถลบการแจ้งเตือนได้");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
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
  };

  const getTypeInfo = (type: string) => {
    switch (type) {
      case "MODERATION_UPDATE":
        return { variant: "secondary" as const, label: NOTIFICATION_TYPES.MODERATION_UPDATE };
      case "WARNING":
        return { variant: "outline" as const, label: NOTIFICATION_TYPES.WARNING };
      case "ERROR":
        return { variant: "destructive" as const, label: NOTIFICATION_TYPES.ERROR };
      case "SUCCESS":
        return { variant: "secondary" as const, label: NOTIFICATION_TYPES.SUCCESS };
      case "INFO":
      default:
        return { variant: "default" as const, label: NOTIFICATION_TYPES.INFO };
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications(true);
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!hasFetchedOnceRef.current) {
      hasFetchedOnceRef.current = true;
      fetchNotifications(false);
    }
  }, [fetchNotifications]);

  useEffect(() => {
    pollingRef.current = setInterval(() => {
      fetchNotifications(false);
    }, POLLING_INTERVAL);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [fetchNotifications]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className={`relative ${isMobile ? 'mr-2' : 'ml-2'}`} ref={dropdownRef}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDropdown}
            disabled={loading}
            className="relative hover:bg-accent/50 transition-all duration-200 hover:scale-105"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] animate-pulse"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 max-h-96 border-border/50 shadow-xl">
          <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                แจ้งเตือน
              </h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={isMarkingAllAsRead}
                  className="text-xs hover:bg-primary/10 hover:text-primary transition-all duration-200"
                >
                  {isMarkingAllAsRead && (
                    <span className="loading loading-spinner loading-xs mr-1"></span>
                  )}
                  อ่านทั้งหมด
                </Button>
              )}
            </div>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                คุณมีการแจ้งเตือนใหม่ {unreadCount} รายการ
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 border-b bg-destructive/10">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-xs text-destructive">{error}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setError(null)}
                  className="ml-auto text-destructive hover:text-destructive-foreground"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            </div>
          )}

          <ScrollArea className="max-h-64">
            {loading ? (
              <div className="p-4 text-center">
                <span className="loading loading-spinner loading-md"></span>
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
                    className={`p-3 border-b last:border-b-0 cursor-pointer transition-all duration-200 group ${
                      !notification.isRead ? 'bg-accent/50 hover:bg-accent' : 'hover:bg-accent/50'
                    }`}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        !notification.isRead ? 'bg-primary' : 'bg-muted'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
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
                            className="opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
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
                        <span className="loading loading-spinner loading-xs"></span>
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
                onClick={() => window.location.href = '/notifications'}
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
};

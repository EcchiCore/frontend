// NotificationDropdown.tsx - ปรับปรุงแล้ว
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Cookies from "js-cookie";

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

// Constants
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.chanomhub.online'}/api`;
const NOTIFICATION_TYPES = {
  MODERATION_UPDATE: "อัปเดตการตรวจสอบ",
  WARNING: "คำเตือน",
  ERROR: "ข้อผิดพลาด",
  INFO: "ข้อมูล",
  SUCCESS: "สำเร็จ",
} as const;

const POLLING_INTERVAL = 30000; // 30 seconds
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

  // Helper function to get auth headers
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

  // Close dropdown when clicking outside
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

  // Fetch notifications with improved error handling
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
        // Handle different error status codes
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

      // Validate response data
      if (!data || !Array.isArray(data.notifications)) {
        throw new Error("รูปแบบข้อมูลไม่ถูกต้อง");
      }

      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      const errorMessage = err instanceof Error ? err.message : "ไม่สามารถโหลดการแจ้งเตือนได้";
      setError(errorMessage);

      // If auth error, don't continue polling
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

  // Mark notification as read with optimistic updates
  const markAsRead = async (notificationId: number) => {
    if (isMarkingAsRead === notificationId) return;

    try {
      setIsMarkingAsRead(notificationId);

      // Optimistic update
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
        }
      );

      if (!response.ok) {
        // Revert optimistic update on failure
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

  // Mark all as read with optimistic updates
  const markAllAsRead = async () => {
    if (isMarkingAllAsRead || unreadCount === 0) return;

    try {
      setIsMarkingAllAsRead(true);

      // Optimistic update
      const originalNotifications = [...notifications];
      const originalUnreadCount = unreadCount;

      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);

      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: "PATCH",
        headers,
      });

      if (!response.ok) {
        // Revert optimistic update on failure
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

  // Delete notification (if API supports it)
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

  // Format date with improved Thai localization
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

  // Get notification type color and label
  const getTypeInfo = (type: string) => {
    switch (type) {
      case "MODERATION_UPDATE":
        return { color: "text-success", label: NOTIFICATION_TYPES.MODERATION_UPDATE };
      case "WARNING":
        return { color: "text-warning", label: NOTIFICATION_TYPES.WARNING };
      case "ERROR":
        return { color: "text-error", label: NOTIFICATION_TYPES.ERROR };
      case "SUCCESS":
        return { color: "text-success", label: NOTIFICATION_TYPES.SUCCESS };
      case "INFO":
      default:
        return { color: "text-info", label: NOTIFICATION_TYPES.INFO };
    }
  };

  // Toggle dropdown and fetch notifications if opening
  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications(true);
    }
    setIsOpen(!isOpen);
  };

  // Setup polling for notifications
  useEffect(() => {
    // Initial fetch
    fetchNotifications(false);

    // Set up polling
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

  // Clear error after 5 seconds
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
      {/* Notification Bell Button */}
      <button
        onClick={toggleDropdown}
        className="btn btn-circle btn-ghost relative"
        aria-label="Notifications"
        disabled={loading}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-error text-error-content text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute ${isMobile ? 'right-0' : 'right-0'} mt-2 w-80 bg-base-100 border border-base-300 rounded-lg shadow-xl z-[1000] max-h-96 overflow-hidden`}>
          {/* Header */}
          <div className="p-4 border-b border-base-300">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">แจ้งเตือน</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={isMarkingAllAsRead}
                  className="text-xs text-primary hover:text-primary-focus transition-colors disabled:opacity-50"
                >
                  {isMarkingAllAsRead ? (
                    <span className="loading loading-spinner loading-xs mr-1"></span>
                  ) : null}
                  อ่านทั้งหมด
                </button>
              )}
            </div>
            {unreadCount > 0 && (
              <p className="text-xs text-base-content/70 mt-1">
                คุณมีการแจ้งเตือนใหม่ {unreadCount} รายการ
              </p>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-error/10 border-b border-base-300">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-error" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-error">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-error hover:text-error-focus"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <span className="loading loading-spinner loading-md"></span>
                <p className="text-sm text-base-content/70 mt-2">กำลังโหลด...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-12 h-12 mx-auto text-base-content/30 mb-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.143 17.082a24.248 24.248 0 0 0 3.844.148m-3.844-.148a23.856 23.856 0 0 1-5.455-1.31 8.964 8.964 0 0 0 2.3-5.542m3.155 6.852a3 3 0 0 0 5.667 1.97m1.965-2.277L21 21m-4.225-4.225a23.81 23.81 0 0 0 3.536-1.003A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6.53 6.53m10.245 10.245L6.53 6.53M3 3l3.53 3.53"
                  />
                </svg>
                <p className="text-sm text-base-content/70">ไม่มีการแจ้งเตือน</p>
                <button
                  onClick={() => fetchNotifications(true)}
                  className="btn btn-sm btn-ghost mt-2"
                >
                  รีเฟรช
                </button>
              </div>
            ) : (
              notifications.map((notification) => {
                const typeInfo = getTypeInfo(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-base-300 last:border-b-0 cursor-pointer transition-colors relative group ${
                      !notification.isRead ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-base-200'
                    }`}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Status Indicator */}
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${
                        !notification.isRead ? 'bg-primary' : 'bg-base-300'
                      }`} />

                      <div className="flex-1 min-w-0">
                        {/* Type Badge and Actions */}
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${typeInfo.color}`}>
                              {typeInfo.label}
                            </span>
                            <span className="text-xs text-base-content/50">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-base-content/50 hover:text-error transition-all p-1"
                            title="ลบการแจ้งเตือน"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>

                        {/* Message */}
                        <p className="text-sm text-base-content line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>

                        {/* Entity Info */}
                        {notification.entityType && (
                          <p className="text-xs text-base-content/60 mt-1">
                            {notification.entityType} #{notification.entityId}
                          </p>
                        )}
                      </div>

                      {/* Loading Indicator for Mark as Read */}
                      {isMarkingAsRead === notification.id && (
                        <span className="loading loading-spinner loading-xs"></span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-base-300 text-center">
              <button
                className="text-xs text-primary hover:text-primary-focus transition-colors"
                onClick={() => {
                  // Navigate to full notifications page
                  window.location.href = '/notifications';
                }}
              >
                ดูทั้งหมด
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
import { useEffect, useRef, useState } from "react";
import { notificationsApi } from "../../api/notifications.api";
import type { Notification } from "../../types";

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = () => {
    notificationsApi
      .listMine({ limit: 8 })
      .then(({ items, unreadCount }) => {
        setNotifications(items);
        setUnreadCount(unreadCount);
      })
      .catch(() => undefined);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) load();
  };

  const handleMarkRead = async (id: string) => {
    await notificationsApi.markRead(id);
    load();
  };

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    load();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                  className={`block w-full border-b border-slate-100 px-3 py-2 text-left text-sm last:border-0 dark:border-slate-800 ${
                    n.isRead
                      ? "text-slate-500 dark:text-slate-400"
                      : "bg-indigo-50 font-medium text-slate-800 dark:bg-indigo-950/40 dark:text-slate-100"
                  }`}
                >
                  <p>{n.title}</p>
                  <p className="mt-0.5 text-xs font-normal text-slate-500 dark:text-slate-400">{n.message}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

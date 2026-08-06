import React, { useEffect, useState, useRef } from "react";
import {
  getNotifications,
  markAsRead,
  deleteNotification,
} from "../services/notificationService";
import { useAuth } from "../context/AuthContext";

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const loadNotifications = async () => {
    try {
      const res = await getNotifications();
      const rawData = res.data || [];
      const role = user?.role?.toUpperCase();

      const filtered = rawData.filter((n) => {
        if (!role || role === "ADMIN") {
          return ["LOW_STOCK", "EXPIRY_ALERT", "PURCHASE_ALERT", "STOCK_UPDATE", "SYSTEM_ALERT"].includes(n.type);
        }
        if (role === "PHARMACIST") {
          return ["LOW_STOCK", "EXPIRY_ALERT"].includes(n.type);
        }
        if (role === "STAFF") {
          return ["STOCK_UPDATE", "INVENTORY_UPDATE"].includes(n.type) || (n.user && n.user.id === user?.id);
        }
        return true;
      });

      setNotifications(filtered);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-300 hover:text-cyan-400 focus:outline-none rounded-xl hover:bg-slate-800/60 transition-colors"
        title="Notifications"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-white transform translate-x-1/3 -translate-y-1/3 bg-rose-500 rounded-full shadow-glow-indigo">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-800 z-50 overflow-hidden">
          <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-sm">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={loadNotifications}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              Refresh
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                No active notifications right now
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-3 ${
                    !n.read ? "bg-cyan-500/5" : ""
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-100">
                        {n.title}
                      </span>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block shadow-glow-cyan"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{n.message}</p>
                    {n.createdAt && (
                      <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {!n.read && (
                      <button
                        onClick={(e) => handleMarkAsRead(n.id, e)}
                        className="text-xs text-cyan-400 hover:bg-cyan-500/10 px-2 py-1 rounded-lg transition-colors font-semibold"
                        title="Mark as read"
                      >
                        Read
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(n.id, e)}
                      className="text-xs text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors"
                      title="Delete notification"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
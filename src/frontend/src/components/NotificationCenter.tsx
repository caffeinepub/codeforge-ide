import {
  AlertCircle,
  AlertTriangle,
  Bell,
  BellOff,
  CheckCheck,
  CheckCircle,
  Info,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useRef } from "react";
import { useNotificationCenterStore } from "../stores/notificationCenterStore";

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const TYPE_ICONS = {
  info: <Info size={12} style={{ color: "var(--info)" }} />,
  success: <CheckCircle size={12} style={{ color: "#4ec9b0" }} />,
  warning: <AlertTriangle size={12} style={{ color: "var(--warning)" }} />,
  error: <AlertCircle size={12} style={{ color: "var(--error)" }} />,
};

export const NotificationCenter: React.FC = () => {
  const { notifications, isOpen, setOpen, markRead, markAllRead, clearAll } =
    useNotificationCenterStore();
  const unreadCount = useNotificationCenterStore((s) => s.unreadCount());
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, setOpen]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen(!isOpen)}
        className="flex items-center gap-1 hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors relative"
        title="Notifications"
        data-ocid="notification.open_modal_button"
      >
        {unreadCount > 0 ? <Bell size={11} /> : <BellOff size={11} />}
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold"
            style={{ background: "var(--error)", color: "white" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-8 right-0 w-72 rounded-sm shadow-2xl border border-[var(--border)] overflow-hidden z-[9999]"
            style={{ background: "var(--bg-sidebar)" }}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            data-ocid="notification.popover"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Notifications
                {unreadCount > 0 && (
                  <span
                    className="ml-2 px-1.5 py-0.5 rounded-full text-[9px]"
                    style={{ background: "var(--error)", color: "white" }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={markAllRead}
                  title="Mark all read"
                  className="p-1 rounded hover:bg-[var(--hover-item)] text-[var(--icon-inactive)] hover:text-[var(--text-primary)]"
                  data-ocid="notification.secondary_button"
                >
                  <CheckCheck size={11} />
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  title="Clear all"
                  className="p-1 rounded hover:bg-[var(--hover-item)] text-[var(--icon-inactive)] hover:text-[var(--text-primary)]"
                  data-ocid="notification.delete_button"
                >
                  <Trash2 size={11} />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 rounded hover:bg-[var(--hover-item)] text-[var(--icon-inactive)] hover:text-[var(--text-primary)]"
                  data-ocid="notification.close_button"
                >
                  <X size={11} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto" style={{ maxHeight: 280 }}>
              {notifications.length === 0 ? (
                <div
                  className="p-6 text-center"
                  data-ocid="notification.empty_state"
                >
                  <Bell
                    size={24}
                    className="mx-auto mb-2"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    No notifications
                  </p>
                </div>
              ) : (
                notifications.slice(0, 5).map((notif) => (
                  <button
                    type="button"
                    key={notif.id}
                    onClick={() => markRead(notif.id)}
                    className="flex items-start gap-2 px-3 py-2.5 border-b border-[var(--border)] w-full text-left hover:bg-[var(--hover-item)] transition-colors"
                    style={{
                      background: notif.read
                        ? "transparent"
                        : "var(--bg-activity)",
                    }}
                  >
                    <span className="flex-shrink-0 mt-0.5">
                      {TYPE_ICONS[notif.type]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-xs font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {notif.title}
                      </div>
                      <div
                        className="text-[10px] mt-0.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {notif.message}
                      </div>
                      <div
                        className="text-[9px] mt-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {formatTimeAgo(notif.timestamp)}
                      </div>
                    </div>
                    {!notif.read && (
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                        style={{ background: "var(--accent)" }}
                      />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

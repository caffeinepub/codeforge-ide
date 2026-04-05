import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { useNotificationStore } from "../stores/notificationStore";
import type { AppNotification } from "../stores/notificationStore";

const ICONS = {
  success: <CheckCircle size={15} />,
  error: <AlertCircle size={15} />,
  warning: <AlertTriangle size={15} />,
  info: <Info size={15} />,
};

const COLORS = {
  success: { bg: "#1e3a2f", border: "#2d5a3d", icon: "#4caf7d" },
  error: { bg: "#3a1e1e", border: "#5a2d2d", icon: "#f44747" },
  warning: { bg: "#3a2e1e", border: "#5a452d", icon: "#cca700" },
  info: { bg: "#1e2d3a", border: "#2d455a", icon: "#75beff" },
};

function ToastItem({ notification }: { notification: AppNotification }) {
  const { removeNotification } = useNotificationStore();
  const colors = COLORS[notification.type];
  const duration = notification.duration ?? 3000;

  useEffect(() => {
    const timer = setTimeout(() => {
      removeNotification(notification.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [notification.id, duration, removeNotification]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[260px] max-w-[360px] cursor-pointer"
      style={{ background: colors.bg, borderColor: colors.border }}
      onClick={() => removeNotification(notification.id)}
      data-ocid="notification.toast"
    >
      <span style={{ color: colors.icon, flexShrink: 0, marginTop: 1 }}>
        {ICONS[notification.type]}
      </span>
      <span className="flex-1 text-xs text-white leading-relaxed">
        {notification.message}
      </span>
      <button
        type="button"
        className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          removeNotification(notification.id);
        }}
        data-ocid="notification.close_button"
      >
        <X size={12} />
      </button>
    </motion.div>
  );
}

export const NotificationToast: React.FC = () => {
  const { notifications } = useNotificationStore();

  return (
    <div
      className="fixed bottom-8 right-4 flex flex-col gap-2 z-[9998]"
      style={{ pointerEvents: notifications.length === 0 ? "none" : "auto" }}
    >
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <ToastItem key={n.id} notification={n} />
        ))}
      </AnimatePresence>
    </div>
  );
};

import type React from "react";

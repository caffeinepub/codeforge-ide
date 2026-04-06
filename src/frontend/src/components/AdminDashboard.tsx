import {
  BarChart3,
  Crown,
  LogOut,
  RefreshCw,
  Settings,
  Shield,
  ToggleLeft,
  ToggleRight,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { useNotificationStore } from "../stores/notificationStore";

const MOCK_USERS = [
  {
    id: "u1",
    principal: "aaaaa-aa...xyz1",
    role: "admin" as const,
    lastActive: "2 min ago",
    files: 12,
  },
  {
    id: "u2",
    principal: "bbbbb-bb...xyz2",
    role: "user" as const,
    lastActive: "1 hr ago",
    files: 34,
  },
  {
    id: "u3",
    principal: "ccccc-cc...xyz3",
    role: "user" as const,
    lastActive: "3 hrs ago",
    files: 7,
  },
  {
    id: "u4",
    principal: "ddddd-dd...xyz4",
    role: "guest" as const,
    lastActive: "1 day ago",
    files: 0,
  },
  {
    id: "u5",
    principal: "eeeee-ee...xyz5",
    role: "user" as const,
    lastActive: "5 days ago",
    files: 21,
  },
];

const STATS = [
  { label: "Total Users", value: "24", icon: Users, color: "var(--accent)" },
  { label: "Files Stored", value: "187", icon: BarChart3, color: "#4ec9b0" },
  {
    label: "Snippets Created",
    value: "53",
    icon: Shield,
    color: "var(--warning)",
  },
  { label: "Active Sessions", value: "6", icon: RefreshCw, color: "#c678dd" },
];

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const { isAdmin, principal, logout } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [activeTab, setActiveTab] = useState<"users" | "stats" | "settings">(
    "stats",
  );
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [themeOverride, setThemeOverride] = useState("none");

  if (!isAdmin) {
    return (
      <div
        className="fixed inset-0 z-[9998] flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.7)" }}
      >
        <div
          className="rounded border border-[var(--border)] p-8 text-center max-w-sm"
          style={{ background: "var(--bg-sidebar)" }}
        >
          <Shield
            size={32}
            className="mx-auto mb-3"
            style={{ color: "var(--error)" }}
          />
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Admin Only
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            You need admin privileges.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 px-4 py-1.5 text-xs rounded"
            style={{ background: "var(--accent)", color: "white" }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9998] flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        data-ocid="admin.modal"
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 cursor-pointer"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)" }}
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          role="button"
          tabIndex={0}
          aria-label="Close admin dashboard"
        />

        {/* Panel */}
        <motion.div
          className="relative ml-auto flex flex-col border-l border-[var(--border)] overflow-hidden"
          style={{
            width: "min(100vw, 720px)",
            height: "100vh",
            background: "var(--bg-editor)",
          }}
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 80, opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border)] flex-shrink-0"
            style={{ background: "var(--bg-activity)" }}
          >
            <Crown size={18} style={{ color: "var(--accent)" }} />
            <div className="flex-1">
              <h2
                className="text-sm font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Admin Dashboard
              </h2>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {principal ?? "Administrator"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
                addNotification({ message: "Logged out", type: "info" });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs hover:bg-[var(--hover-item)] transition-colors"
              style={{ color: "var(--error)" }}
              data-ocid="admin.delete_button"
            >
              <LogOut size={12} /> Logout
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded hover:bg-[var(--hover-item)] text-[var(--icon-inactive)] hover:text-[var(--text-primary)]"
              data-ocid="admin.close_button"
            >
              <X size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div
            className="flex border-b border-[var(--border)] flex-shrink-0"
            style={{ background: "var(--bg-tab-bar)" }}
          >
            {(["stats", "users", "settings"] as const).map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-xs font-medium capitalize transition-colors border-b-2 ${
                  activeTab === tab
                    ? "text-[var(--text-primary)] border-[var(--accent)]"
                    : "text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]"
                }`}
                data-ocid={`admin.${tab}.tab`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "stats" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {STATS.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded border border-[var(--border)] p-4"
                      style={{ background: "var(--bg-sidebar)" }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <stat.icon size={14} style={{ color: stat.color }} />
                        <span
                          className="text-[10px] uppercase tracking-wider"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {stat.label}
                        </span>
                      </div>
                      <span
                        className="text-2xl font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  className="rounded border border-[var(--border)] p-4"
                  style={{ background: "var(--bg-sidebar)" }}
                >
                  <h3
                    className="text-xs font-semibold mb-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    SYSTEM HEALTH
                  </h3>
                  {[
                    { label: "Canister Memory", pct: 34 },
                    { label: "Cycles Balance", pct: 78 },
                    { label: "Request Throughput", pct: 55 },
                  ].map((item) => (
                    <div key={item.label} className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: "var(--text-secondary)" }}>
                          {item.label}
                        </span>
                        <span style={{ color: "var(--text-muted)" }}>
                          {item.pct}%
                        </span>
                      </div>
                      <div
                        className="h-1.5 rounded-full"
                        style={{ background: "var(--border)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${item.pct}%`,
                            background: "var(--accent)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div>
                <div className="overflow-x-auto rounded border border-[var(--border)]">
                  <table
                    className="w-full text-xs"
                    style={{ background: "var(--bg-sidebar)" }}
                  >
                    <thead>
                      <tr style={{ background: "var(--bg-activity)" }}>
                        {[
                          "Principal",
                          "Role",
                          "Last Active",
                          "Files",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left px-4 py-2.5 font-semibold"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_USERS.map((user, i) => (
                        <tr
                          key={user.id}
                          className="border-t border-[var(--border)] hover:bg-[var(--hover-item)] transition-colors"
                          data-ocid={`admin.item.${i + 1}`}
                        >
                          <td
                            className="px-4 py-2.5 font-mono"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {user.principal}
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className="px-1.5 py-0.5 rounded text-[9px] capitalize"
                              style={{
                                background:
                                  user.role === "admin"
                                    ? "var(--accent)22"
                                    : "var(--bg-activity)",
                                color:
                                  user.role === "admin"
                                    ? "var(--accent)"
                                    : "var(--text-secondary)",
                                border: `1px solid ${user.role === "admin" ? "var(--accent)44" : "var(--border)"}`,
                              }}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td
                            className="px-4 py-2.5"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {user.lastActive}
                          </td>
                          <td
                            className="px-4 py-2.5"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {user.files}
                          </td>
                          <td className="px-4 py-2.5">
                            <button
                              type="button"
                              onClick={() =>
                                addNotification({
                                  message: `Role updated for ${user.principal}`,
                                  type: "success",
                                })
                              }
                              className="text-[10px] px-2 py-0.5 rounded border hover:bg-[var(--hover-item)] transition-colors"
                              style={{
                                borderColor: "var(--border)",
                                color: "var(--text-secondary)",
                              }}
                              data-ocid={`admin.edit_button.${i + 1}`}
                            >
                              Edit Role
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div
                  className="rounded border border-[var(--border)] p-4"
                  style={{ background: "var(--bg-sidebar)" }}
                >
                  <h3
                    className="text-xs font-semibold mb-4"
                    style={{ color: "var(--text-muted)" }}
                  >
                    SYSTEM SETTINGS
                  </h3>

                  <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
                    <div>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Maintenance Mode
                      </p>
                      <p
                        className="text-[10px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Disable access for non-admin users
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMaintenanceMode(!maintenanceMode);
                        addNotification({
                          message: `Maintenance mode ${!maintenanceMode ? "enabled" : "disabled"}`,
                          type: "warning",
                        });
                      }}
                      data-ocid="admin.toggle"
                    >
                      {maintenanceMode ? (
                        <ToggleRight
                          size={22}
                          style={{ color: "var(--accent)" }}
                        />
                      ) : (
                        <ToggleLeft
                          size={22}
                          style={{ color: "var(--text-muted)" }}
                        />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
                    <div>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Default Theme Override
                      </p>
                      <p
                        className="text-[10px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Force a theme for all users
                      </p>
                    </div>
                    <select
                      className="bg-[var(--bg-input)] border border-[var(--border)] text-xs text-[var(--text-primary)] rounded px-2 py-1 outline-none"
                      value={themeOverride}
                      onChange={(e) => {
                        setThemeOverride(e.target.value);
                        addNotification({
                          message: `Theme override: ${e.target.value}`,
                          type: "info",
                        });
                      }}
                      data-ocid="admin.select"
                    >
                      <option value="none">None (user choice)</option>
                      <option value="dark">Dark+</option>
                      <option value="light">Light+</option>
                      <option value="monokai">Monokai</option>
                      <option value="solarized-dark">Solarized Dark</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-primary)" }}
                      >
                        System Version
                      </p>
                      <p
                        className="text-[10px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        CodeVeda Phase 2.0.0
                      </p>
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded"
                      style={{
                        background: "var(--accent)22",
                        color: "var(--accent)",
                      }}
                    >
                      v2.0.0
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    addNotification({
                      message: "Settings saved",
                      type: "success",
                    })
                  }
                  className="w-full py-2 text-xs rounded font-medium"
                  style={{ background: "var(--accent)", color: "white" }}
                  data-ocid="admin.save_button"
                >
                  <Settings size={12} className="inline mr-1.5" />
                  Save System Settings
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

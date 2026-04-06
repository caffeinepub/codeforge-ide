import {
  Activity,
  Check,
  Clock,
  Cloud,
  Code2,
  FileCode,
  Loader2,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { fetchUserProfile, saveUserProfile } from "../services/backendService";
import { useAuthStore } from "../stores/authStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useThemeStore } from "../stores/themeStore";
import { useUserProfileStore } from "../stores/userProfileStore";

const AVATAR_COLORS = [
  "#007acc",
  "#4ec9b0",
  "#c678dd",
  "#e06c75",
  "#e5c07b",
  "#98c379",
];

const LANGUAGES = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "motoko", label: "Motoko" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
];

const THEMES = [
  { value: "dark", label: "Dark+" },
  { value: "light", label: "Light+" },
  { value: "high-contrast", label: "HC Dark" },
  { value: "monokai", label: "Monokai" },
  { value: "solarized-dark", label: "Solarized Dark" },
] as const;

const SHORTCUTS = [
  { key: "Ctrl+P", action: "Quick Open" },
  { key: "Ctrl+Shift+P", action: "Command Palette" },
  { key: "Ctrl+B", action: "Toggle Sidebar" },
  { key: "Ctrl+`", action: "Toggle Terminal" },
  { key: "Ctrl+W", action: "Close Tab" },
  { key: "Ctrl+S", action: "Save File" },
  { key: "Ctrl+Shift+S", action: "Save to Cloud" },
  { key: "Ctrl+\\", action: "Split Editor" },
  { key: "Ctrl+Z", action: "Undo" },
  { key: "Ctrl+H", action: "Find & Replace" },
  { key: "Ctrl+G", action: "Go to Line" },
];

interface UserProfilePanelProps {
  onClose: () => void;
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export const UserProfilePanel: React.FC<UserProfilePanelProps> = ({
  onClose,
}) => {
  const { isLoggedIn, principal, role } = useAuthStore();
  const {
    displayName,
    avatarColor,
    bio,
    preferredLanguage,
    activityLog,
    updateProfile,
    setPreferredLanguage,
  } = useUserProfileStore();
  const { settings, updateSettings } = useSettingsStore();
  const { theme, setTheme } = useThemeStore();
  const { actor } = useActor();

  const [activeTab, setActiveTab] = useState<
    "overview" | "preferences" | "activity"
  >("overview");
  const [editName, setEditName] = useState(displayName);
  const [editBio, setEditBio] = useState(bio);
  const [editColor, setEditColor] = useState(avatarColor);
  const [saved, setSaved] = useState(false);
  const [isSavingToCloud, setIsSavingToCloud] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);

  // Load from backend on open
  // biome-ignore lint/correctness/useExhaustiveDependencies: store setters are stable
  useEffect(() => {
    if (!actor || !isLoggedIn) return;
    fetchUserProfile(actor).then((profile) => {
      if (profile) {
        updateProfile(profile.displayName, profile.bio, profile.avatarColor);
        setPreferredLanguage(profile.preferredLanguage);
        setEditName(profile.displayName);
        setEditBio(profile.bio);
        setEditColor(profile.avatarColor);
      }
    });
  }, [actor, isLoggedIn]);

  const handleSave = async () => {
    updateProfile(editName, editBio, editColor);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    // Save to backend if logged in
    if (actor && isLoggedIn) {
      setIsSavingToCloud(true);
      const ok = await saveUserProfile(actor, {
        displayName: editName,
        bio: editBio,
        avatarColor: editColor,
        preferredLanguage,
      });
      setIsSavingToCloud(false);
      if (ok) {
        setCloudSynced(true);
        setTimeout(() => setCloudSynced(false), 3000);
        toast.success("Profile synced to cloud");
      }
    }
  };

  const principalShort = principal
    ? `${principal.slice(0, 8)}...${principal.slice(-6)}`
    : null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9997] flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        data-ocid="profile.modal"
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 cursor-pointer"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)" }}
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          role="button"
          tabIndex={0}
          aria-label="Close profile panel"
        />

        {/* Panel */}
        <motion.div
          className="relative ml-auto flex flex-col border-l border-[var(--border)] overflow-hidden"
          style={{
            width: "min(100vw, 480px)",
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
            className="flex items-center gap-4 px-6 py-5 border-b border-[var(--border)] flex-shrink-0"
            style={{ background: "var(--bg-activity)" }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{ background: editColor }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2
                className="text-sm font-bold truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {displayName}
              </h2>
              {principalShort && (
                <p
                  className="text-[10px] font-mono truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  {principalShort}
                </p>
              )}
              <span
                className="inline-block mt-0.5 text-[9px] px-1.5 py-0.5 rounded capitalize"
                style={{
                  background:
                    role === "admin" ? "var(--accent)22" : "var(--bg-sidebar)",
                  color:
                    role === "admin" ? "var(--accent)" : "var(--text-muted)",
                  border: `1px solid ${
                    role === "admin" ? "var(--accent)44" : "var(--border)"
                  }`,
                }}
              >
                {isLoggedIn ? role : "guest"}
              </span>
            </div>
            {/* Cloud synced badge */}
            {cloudSynced && (
              <span
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded"
                style={{
                  background: "rgba(34,197,94,0.1)",
                  color: "#22c55e",
                  border: "1px solid rgba(34,197,94,0.2)",
                }}
                data-ocid="profile.success_state"
              >
                <Cloud size={10} />
                Synced
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded hover:bg-[var(--hover-item)] text-[var(--icon-inactive)] hover:text-[var(--text-primary)]"
              data-ocid="profile.close_button"
            >
              <X size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div
            className="flex border-b border-[var(--border)] flex-shrink-0"
            style={{ background: "var(--bg-tab-bar)" }}
          >
            {(["overview", "preferences", "activity"] as const).map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-xs font-medium capitalize transition-colors border-b-2 ${
                  activeTab === tab
                    ? "text-[var(--text-primary)] border-[var(--accent)]"
                    : "text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]"
                }`}
                data-ocid={`profile.${tab}.tab`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-4">
                <div>
                  <p
                    className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Display Name
                  </p>
                  <input
                    id="profile-name"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-xs text-[var(--text-primary)] rounded px-3 py-2 outline-none focus:border-[var(--accent)] transition-colors"
                    placeholder="Your display name"
                    data-ocid="profile.input"
                  />
                </div>

                <div>
                  <p
                    className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Bio
                  </p>
                  <textarea
                    id="profile-bio"
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-xs text-[var(--text-primary)] rounded px-3 py-2 outline-none resize-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-muted)]"
                    placeholder="A short bio about yourself..."
                    data-ocid="profile.textarea"
                  />
                </div>

                <div>
                  <p
                    className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Avatar Color
                  </p>
                  <div className="flex items-center gap-2">
                    {AVATAR_COLORS.map((color) => (
                      <button
                        type="button"
                        key={color}
                        onClick={() => setEditColor(color)}
                        className="w-7 h-7 rounded-full transition-transform hover:scale-110 relative"
                        style={{ background: color }}
                        aria-label={`Avatar color ${color}`}
                      >
                        {editColor === color && (
                          <Check
                            size={12}
                            className="absolute inset-0 m-auto text-white"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSavingToCloud}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs rounded font-medium transition-colors disabled:opacity-70"
                  style={{ background: "var(--accent)", color: "white" }}
                  data-ocid="profile.save_button"
                >
                  {isSavingToCloud ? (
                    <>
                      <Loader2 size={12} className="animate-spin" /> Syncing to
                      cloud...
                    </>
                  ) : saved ? (
                    <>
                      <Check size={12} /> Saved!
                    </>
                  ) : (
                    <>
                      <User size={12} /> Save Profile
                    </>
                  )}
                </button>

                {isLoggedIn && (
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded text-[10px]"
                    style={{
                      background: "rgba(0,122,204,0.06)",
                      border: "1px solid rgba(0,122,204,0.15)",
                      color: "var(--text-muted)",
                    }}
                  >
                    <Cloud size={11} style={{ color: "var(--accent)" }} />
                    Profile auto-syncs to the Internet Computer
                  </div>
                )}

                <div
                  className="rounded border border-[var(--border)] p-4"
                  style={{ background: "var(--bg-sidebar)" }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider mb-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Quick Stats
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        icon: <Activity size={12} />,
                        label: "Actions Logged",
                        value: activityLog.length,
                      },
                      {
                        icon: <FileCode size={12} />,
                        label: "Preferred Language",
                        value: preferredLanguage,
                      },
                      {
                        icon: <Code2 size={12} />,
                        label: "Role",
                        value: isLoggedIn ? role : "guest",
                      },
                      {
                        icon: <Clock size={12} />,
                        label: "Last Active",
                        value: activityLog[0]
                          ? formatRelativeTime(activityLog[0].timestamp)
                          : "now",
                      },
                    ].map((stat) => (
                      <div key={stat.label} className="space-y-0.5">
                        <div
                          className="flex items-center gap-1"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {stat.icon}
                          <span className="text-[9px] uppercase tracking-wider">
                            {stat.label}
                          </span>
                        </div>
                        <p
                          className="text-xs font-medium capitalize"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PREFERENCES */}
            {activeTab === "preferences" && (
              <div className="space-y-5">
                <div>
                  <p
                    className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Preferred Language
                  </p>
                  <select
                    id="profile-lang"
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-xs text-[var(--text-primary)] rounded px-3 py-2 outline-none focus:border-[var(--accent)]"
                    data-ocid="profile.select"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p
                    className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Font Size: {settings.fontSize}px
                  </p>
                  <input
                    id="profile-fontsize"
                    type="range"
                    min={10}
                    max={24}
                    value={settings.fontSize}
                    onChange={(e) =>
                      updateSettings({ fontSize: Number(e.target.value) })
                    }
                    className="w-full accent-[var(--accent)]"
                    data-ocid="profile.toggle"
                  />
                  <div
                    className="flex justify-between text-[9px] mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <span>10px</span>
                    <span>24px</span>
                  </div>
                </div>

                <div>
                  <p
                    className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Theme
                  </p>
                  <div className="space-y-1">
                    {THEMES.map((t) => (
                      <button
                        type="button"
                        key={t.value}
                        onClick={() => setTheme(t.value)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs transition-colors ${
                          theme === t.value
                            ? "bg-[var(--accent)] text-white"
                            : "hover:bg-[var(--hover-item)] text-[var(--text-primary)]"
                        }`}
                        data-ocid="profile.theme.toggle"
                      >
                        <span>{t.label}</span>
                        {theme === t.value && <Check size={12} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Keyboard Shortcuts
                  </p>
                  <div
                    className="rounded border border-[var(--border)] overflow-hidden"
                    style={{ background: "var(--bg-sidebar)" }}
                  >
                    {SHORTCUTS.map(({ key, action }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border)] last:border-0"
                      >
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {action}
                        </span>
                        <kbd
                          className="text-[9px] rounded px-1.5 py-0.5 border"
                          style={{
                            background: "var(--bg-activity)",
                            borderColor: "var(--border)",
                            color: "var(--text-primary)",
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ACTIVITY */}
            {activeTab === "activity" && (
              <div>
                {activityLog.length === 0 ? (
                  <div
                    className="py-12 text-center"
                    data-ocid="profile.empty_state"
                  >
                    <Activity
                      size={24}
                      className="mx-auto mb-2"
                      style={{ color: "var(--text-muted)" }}
                    />
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No activity yet
                    </p>
                    <p
                      className="text-[10px] mt-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Start coding to see your activity log here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {activityLog.slice(0, 20).map((entry, i) => (
                      <div
                        key={`${entry.timestamp}-${i}`}
                        className="flex items-start gap-3 px-3 py-2 rounded hover:bg-[var(--hover-item)] transition-colors"
                        data-ocid={`profile.item.${i + 1}`}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                          style={{ background: "var(--accent)" }}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-xs"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {entry.action}
                          </p>
                          {entry.file && (
                            <p
                              className="text-[10px] truncate"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {entry.file}
                            </p>
                          )}
                        </div>
                        <span
                          className="text-[9px] flex-shrink-0"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {formatRelativeTime(entry.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex-shrink-0 px-5 py-3 border-t border-[var(--border)] text-center"
            style={{ background: "var(--bg-activity)" }}
          >
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              CodeVeda v6.0.0 — Profile &amp; Preferences
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

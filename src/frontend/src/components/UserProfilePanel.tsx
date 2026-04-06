import {
  Activity,
  Camera,
  Check,
  Clock,
  Cloud,
  Code2,
  FileCode,
  GitFork,
  Github,
  Globe,
  Linkedin,
  Loader2,
  Lock,
  MapPin,
  Star,
  Twitter,
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
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

const MOCK_DEVELOPERS = [
  {
    id: "dev1",
    name: "Priya Sharma",
    bio: "Full-stack dev · Rust & Motoko",
    lang: "Rust",
    color: "#e06c75",
    initial: "P",
  },
  {
    id: "dev2",
    name: "Alex Chen",
    bio: "Web3 engineer · ICP enthusiast",
    lang: "Motoko",
    color: "#61dafb",
    initial: "A",
  },
  {
    id: "dev3",
    name: "Jordan Kim",
    bio: "TypeScript wizard · Open source",
    lang: "TypeScript",
    color: "#4ec9b0",
    initial: "J",
  },
  {
    id: "dev4",
    name: "Maya Patel",
    bio: "AI/ML · Python & Go backends",
    lang: "Python",
    color: "#c678dd",
    initial: "M",
  },
  {
    id: "dev5",
    name: "Carlos Rivera",
    bio: "DevOps · Cloud-native & Kubernetes",
    lang: "Go",
    color: "#98c379",
    initial: "C",
  },
  {
    id: "dev6",
    name: "Yuki Tanaka",
    bio: "Game dev · WebGL & Rust",
    lang: "Rust",
    color: "#e5c07b",
    initial: "Y",
  },
];

interface GithubRepo {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  private: boolean;
  html_url: string;
}

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

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00add8",
  Motoko: "#f7c948",
  Java: "#b07219",
  "C++": "#f34b7d",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Ruby: "#701516",
  Swift: "#fa7343",
  Kotlin: "#A97BFF",
  Dart: "#00b4ab",
};

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
    "overview" | "github" | "social" | "preferences" | "activity"
  >("overview");

  // Overview state
  const [editName, setEditName] = useState(displayName);
  const [editBio, setEditBio] = useState(bio);
  const [editColor, setEditColor] = useState(avatarColor);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [socialGithub, setSocialGithub] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialLinkedin, setSocialLinkedin] = useState("");
  const [saved, setSaved] = useState(false);
  const [isSavingToCloud, setIsSavingToCloud] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GitHub tab state
  const [ghUsername, setGhUsername] = useState("");
  const [ghRepos, setGhRepos] = useState<GithubRepo[]>([]);
  const [ghLoading, setGhLoading] = useState(false);
  const [ghError, setGhError] = useState("");
  const [ghFetched, setGhFetched] = useState(false);

  // Social tab state
  const [socialSubTab, setSocialSubTab] = useState<"followers" | "following">(
    "followers",
  );
  const [following, setFollowing] = useState<Set<string>>(
    new Set(["dev2", "dev4"]),
  );

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

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (profilePicUrl) URL.revokeObjectURL(profilePicUrl);
    };
  }, [profilePicUrl]);

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (profilePicUrl) URL.revokeObjectURL(profilePicUrl);
    setProfilePicUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    updateProfile(editName, editBio, editColor);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

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

  const handleFetchRepos = async () => {
    if (!ghUsername.trim()) return;
    setGhLoading(true);
    setGhError("");
    setGhFetched(false);
    try {
      const res = await fetch(
        `https://api.github.com/users/${ghUsername.trim()}/repos?per_page=30&sort=updated`,
      );
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setGhRepos(data);
      setGhFetched(true);
    } catch {
      setGhError("Could not fetch repos. Check username.");
      setGhRepos([]);
    } finally {
      setGhLoading(false);
    }
  };

  const toggleFollow = (id: string) => {
    setFollowing((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const followersList = MOCK_DEVELOPERS.filter((d) => !following.has(d.id));
  const followingList = MOCK_DEVELOPERS.filter((d) => following.has(d.id));

  const principalShort = principal
    ? `${principal.slice(0, 8)}...${principal.slice(-6)}`
    : null;

  const TABS = [
    { id: "overview" as const, label: "Overview" },
    { id: "github" as const, label: "GitHub" },
    { id: "social" as const, label: "Social" },
    { id: "preferences" as const, label: "Prefs" },
    { id: "activity" as const, label: "Activity" },
  ];

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
        <button
          type="button"
          className="absolute inset-0 cursor-pointer"
          style={{
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(3px)",
            border: "none",
          }}
          onClick={onClose}
          aria-label="Close profile panel"
        />

        {/* Panel */}
        <motion.div
          className="relative ml-auto flex flex-col border-l border-[var(--border)] overflow-hidden"
          style={{
            width: "min(100vw, 540px)",
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
            {/* Avatar with pic upload */}
            <div className="relative flex-shrink-0 group">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden"
                style={{ background: editColor }}
              >
                {profilePicUrl ? (
                  <img
                    src={profilePicUrl}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
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
            className="flex border-b border-[var(--border)] flex-shrink-0 overflow-x-auto"
            style={{ background: "var(--bg-tab-bar)" }}
          >
            {TABS.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 flex-shrink-0 ${
                  activeTab === tab.id
                    ? "text-[var(--text-primary)] border-[var(--accent)]"
                    : "text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]"
                }`}
                data-ocid={`profile.${tab.id}.tab`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-4">
                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center gap-2 mb-2">
                  <button
                    type="button"
                    className="relative w-16 h-16 rounded-full overflow-hidden cursor-pointer group p-0"
                    style={{ background: editColor, border: "none" }}
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Upload profile picture"
                    data-ocid="profile.upload_button"
                  >
                    {profilePicUrl ? (
                      <img
                        src={profilePicUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
                        {editName.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    {/* Camera overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={18} className="text-white" />
                    </div>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePicChange}
                  />
                  <p
                    className="text-[10px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Click to upload photo
                  </p>
                </div>

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

                {/* Username / Handle */}
                <div>
                  <p
                    className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Username
                  </p>
                  <div className="flex items-center gap-0">
                    <span
                      className="px-3 py-2 text-xs rounded-l border border-r-0 border-[var(--border)] select-none"
                      style={{
                        background: "var(--bg-sidebar)",
                        color: "var(--text-muted)",
                      }}
                    >
                      @
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="flex-1 bg-[var(--bg-input)] border border-[var(--border)] text-xs text-[var(--text-primary)] rounded-r px-3 py-2 outline-none focus:border-[var(--accent)] transition-colors"
                      placeholder="aryan_dev"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <p
                    className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Location
                  </p>
                  <div className="relative">
                    <MapPin
                      size={12}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-muted)" }}
                    />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-xs text-[var(--text-primary)] rounded pl-8 pr-3 py-2 outline-none focus:border-[var(--accent)] transition-colors"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <p
                    className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Website
                  </p>
                  <div className="relative">
                    <Globe
                      size={12}
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-muted)" }}
                    />
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-xs text-[var(--text-primary)] rounded pl-8 pr-3 py-2 outline-none focus:border-[var(--accent)] transition-colors"
                      placeholder="https://yoursite.com"
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <p
                    className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Social Links
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Github
                        size={14}
                        style={{ color: "var(--text-muted)", flexShrink: 0 }}
                      />
                      <input
                        type="url"
                        value={socialGithub}
                        onChange={(e) => setSocialGithub(e.target.value)}
                        className="flex-1 bg-[var(--bg-input)] border border-[var(--border)] text-xs text-[var(--text-primary)] rounded px-3 py-2 outline-none focus:border-[var(--accent)] transition-colors"
                        placeholder="https://github.com/username"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Twitter
                        size={14}
                        style={{ color: "var(--text-muted)", flexShrink: 0 }}
                      />
                      <input
                        type="url"
                        value={socialTwitter}
                        onChange={(e) => setSocialTwitter(e.target.value)}
                        className="flex-1 bg-[var(--bg-input)] border border-[var(--border)] text-xs text-[var(--text-primary)] rounded px-3 py-2 outline-none focus:border-[var(--accent)] transition-colors"
                        placeholder="https://twitter.com/username"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Linkedin
                        size={14}
                        style={{ color: "var(--text-muted)", flexShrink: 0 }}
                      />
                      <input
                        type="url"
                        value={socialLinkedin}
                        onChange={(e) => setSocialLinkedin(e.target.value)}
                        className="flex-1 bg-[var(--bg-input)] border border-[var(--border)] text-xs text-[var(--text-primary)] rounded px-3 py-2 outline-none focus:border-[var(--accent)] transition-colors"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>
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

            {/* GITHUB TAB */}
            {activeTab === "github" && (
              <div className="space-y-4">
                <div>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider mb-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    GitHub Repositories
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ghUsername}
                      onChange={(e) => setGhUsername(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleFetchRepos()}
                      className="flex-1 bg-[var(--bg-input)] border border-[var(--border)] text-xs text-[var(--text-primary)] rounded px-3 py-2 outline-none focus:border-[var(--accent)] transition-colors"
                      placeholder="Enter GitHub username..."
                      data-ocid="profile.github.input"
                    />
                    <button
                      type="button"
                      onClick={handleFetchRepos}
                      disabled={ghLoading || !ghUsername.trim()}
                      className="px-3 py-2 rounded text-xs font-medium flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                      style={{ background: "var(--accent)", color: "white" }}
                      data-ocid="profile.github.primary_button"
                    >
                      {ghLoading ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Github size={12} />
                      )}
                      {ghLoading ? "Fetching..." : "Fetch Repos"}
                    </button>
                  </div>
                </div>

                {/* Loading */}
                {ghLoading && (
                  <div
                    className="py-10 flex flex-col items-center gap-2"
                    data-ocid="profile.github.loading_state"
                  >
                    <Loader2
                      size={20}
                      className="animate-spin"
                      style={{ color: "var(--accent)" }}
                    />
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Fetching repositories...
                    </p>
                  </div>
                )}

                {/* Error */}
                {ghError && !ghLoading && (
                  <div
                    className="px-3 py-2.5 rounded text-xs"
                    style={{
                      background: "rgba(224,108,117,0.1)",
                      border: "1px solid rgba(224,108,117,0.3)",
                      color: "#e06c75",
                    }}
                    data-ocid="profile.github.error_state"
                  >
                    {ghError}
                  </div>
                )}

                {/* Empty prompt */}
                {!ghFetched && !ghLoading && !ghError && (
                  <div
                    className="py-10 text-center"
                    data-ocid="profile.github.empty_state"
                  >
                    <Github
                      size={28}
                      className="mx-auto mb-2"
                      style={{ color: "var(--text-muted)" }}
                    />
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Enter a GitHub username to explore repositories
                    </p>
                  </div>
                )}

                {/* Repo List */}
                {ghFetched && !ghLoading && (
                  <div className="space-y-2">
                    <p
                      className="text-[10px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {ghRepos.length} repositories found for{" "}
                      <span style={{ color: "var(--accent)" }}>
                        @{ghUsername}
                      </span>
                    </p>
                    {ghRepos.length === 0 ? (
                      <div
                        className="py-6 text-center"
                        data-ocid="profile.github.empty_state"
                      >
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          No public repositories found.
                        </p>
                      </div>
                    ) : (
                      ghRepos.map((repo, i) => (
                        <div
                          key={repo.id}
                          className="rounded border border-[var(--border)] p-3 hover:border-[var(--accent)] transition-colors"
                          style={{ background: "var(--bg-sidebar)" }}
                          data-ocid={`profile.github.item.${i + 1}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <a
                              href={repo.html_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold hover:underline truncate"
                              style={{ color: "var(--accent)" }}
                            >
                              {repo.name}
                            </a>
                            {/* Visibility badge */}
                            <span
                              className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded flex-shrink-0"
                              style={{
                                background: repo.private
                                  ? "rgba(229,192,123,0.12)"
                                  : "rgba(152,195,121,0.12)",
                                color: repo.private ? "#e5c07b" : "#98c379",
                                border: `1px solid ${
                                  repo.private
                                    ? "rgba(229,192,123,0.3)"
                                    : "rgba(152,195,121,0.3)"
                                }`,
                              }}
                            >
                              {repo.private ? (
                                <Lock size={8} />
                              ) : (
                                <Globe size={8} />
                              )}
                              {repo.private ? "Private" : "Public"}
                            </span>
                          </div>
                          {repo.description && (
                            <p
                              className="text-[10px] mb-2 line-clamp-2"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {repo.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3">
                            {repo.language && (
                              <span className="flex items-center gap-1 text-[10px]">
                                <span
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{
                                    background:
                                      LANG_COLORS[repo.language] ?? "#888",
                                  }}
                                />
                                <span
                                  style={{ color: "var(--text-secondary)" }}
                                >
                                  {repo.language}
                                </span>
                              </span>
                            )}
                            <span
                              className="flex items-center gap-1 text-[10px]"
                              style={{ color: "var(--text-muted)" }}
                            >
                              <Star size={10} />
                              {repo.stargazers_count}
                            </span>
                            <span
                              className="flex items-center gap-1 text-[10px]"
                              style={{ color: "var(--text-muted)" }}
                            >
                              <GitFork size={10} />
                              {repo.forks_count}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SOCIAL TAB */}
            {activeTab === "social" && (
              <div className="space-y-4">
                {/* Summary */}
                <div
                  className="flex items-center gap-4 px-4 py-3 rounded border border-[var(--border)]"
                  style={{ background: "var(--bg-sidebar)" }}
                >
                  <div className="flex items-center gap-1.5">
                    <Users size={14} style={{ color: "var(--accent)" }} />
                    <span
                      className="text-sm font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {followersList.length}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Followers
                    </span>
                  </div>
                  <div
                    className="w-px h-4"
                    style={{ background: "var(--border)" }}
                  />
                  <div className="flex items-center gap-1.5">
                    <UserCheck size={14} style={{ color: "#4ec9b0" }} />
                    <span
                      className="text-sm font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {followingList.length}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Following
                    </span>
                  </div>
                </div>

                {/* Sub-tabs */}
                <div
                  className="flex rounded border border-[var(--border)] overflow-hidden"
                  style={{ background: "var(--bg-sidebar)" }}
                >
                  {(["followers", "following"] as const).map((sub) => (
                    <button
                      type="button"
                      key={sub}
                      onClick={() => setSocialSubTab(sub)}
                      className="flex-1 py-2 text-xs font-medium capitalize transition-colors"
                      style={{
                        background:
                          socialSubTab === sub
                            ? "var(--accent)"
                            : "transparent",
                        color:
                          socialSubTab === sub
                            ? "white"
                            : "var(--text-secondary)",
                      }}
                      data-ocid={`profile.social.${sub}.tab`}
                    >
                      {sub === "followers"
                        ? `Followers (${followersList.length})`
                        : `Following (${followingList.length})`}
                    </button>
                  ))}
                </div>

                {/* Developer cards */}
                {socialSubTab === "followers" && (
                  <div className="space-y-2">
                    {followersList.length === 0 ? (
                      <div
                        className="py-10 text-center"
                        data-ocid="profile.social.followers.empty_state"
                      >
                        <Users
                          size={24}
                          className="mx-auto mb-2"
                          style={{ color: "var(--text-muted)" }}
                        />
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          No followers yet
                        </p>
                      </div>
                    ) : (
                      followersList.map((dev, i) => (
                        <DevCard
                          key={dev.id}
                          dev={dev}
                          isFollowing={following.has(dev.id)}
                          onToggle={() => toggleFollow(dev.id)}
                          index={i + 1}
                        />
                      ))
                    )}
                  </div>
                )}

                {socialSubTab === "following" && (
                  <div className="space-y-2">
                    {followingList.length === 0 ? (
                      <div
                        className="py-10 text-center"
                        data-ocid="profile.social.following.empty_state"
                      >
                        <UserPlus
                          size={24}
                          className="mx-auto mb-2"
                          style={{ color: "var(--text-muted)" }}
                        />
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          You&apos;re not following anyone yet
                        </p>
                        <p
                          className="text-[10px] mt-1"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Switch to Followers to find developers
                        </p>
                      </div>
                    ) : (
                      followingList.map((dev, i) => (
                        <DevCard
                          key={dev.id}
                          dev={dev}
                          isFollowing={true}
                          onToggle={() => toggleFollow(dev.id)}
                          index={i + 1}
                        />
                      ))
                    )}
                  </div>
                )}
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

// ---- DevCard sub-component ----
interface DevCardProps {
  dev: {
    id: string;
    name: string;
    bio: string;
    lang: string;
    color: string;
    initial: string;
  };
  isFollowing: boolean;
  onToggle: () => void;
  index: number;
}

const DevCard: React.FC<DevCardProps> = ({
  dev,
  isFollowing,
  onToggle,
  index,
}) => (
  <div
    className="flex items-center gap-3 px-3 py-2.5 rounded border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
    style={{ background: "var(--bg-sidebar)" }}
    data-ocid={`profile.social.item.${index}`}
  >
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
      style={{ background: dev.color }}
    >
      {dev.initial}
    </div>
    <div className="flex-1 min-w-0">
      <p
        className="text-xs font-semibold truncate"
        style={{ color: "var(--text-primary)" }}
      >
        {dev.name}
      </p>
      <p
        className="text-[10px] truncate"
        style={{ color: "var(--text-muted)" }}
      >
        {dev.bio}
      </p>
      <span
        className="inline-block mt-0.5 text-[9px] px-1.5 py-0.5 rounded"
        style={{
          background: `${LANG_COLORS[dev.lang] ?? "#888"}22`,
          color: LANG_COLORS[dev.lang] ?? "#888",
          border: `1px solid ${LANG_COLORS[dev.lang] ?? "#888"}44`,
        }}
      >
        {dev.lang}
      </span>
    </div>
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-medium flex-shrink-0 transition-colors"
      style={{
        background: isFollowing ? "transparent" : "var(--accent)",
        color: isFollowing ? "var(--text-muted)" : "white",
        border: `1px solid ${isFollowing ? "var(--border)" : "var(--accent)"}`,
      }}
      data-ocid={`profile.social.toggle.${index}`}
    >
      {isFollowing ? (
        <>
          <UserMinus size={10} /> Unfollow
        </>
      ) : (
        <>
          <UserPlus size={10} /> Follow
        </>
      )}
    </button>
  </div>
);

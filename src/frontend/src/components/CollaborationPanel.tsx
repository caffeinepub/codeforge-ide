import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Check,
  ClipboardCopy,
  Disc,
  Globe,
  LogOut,
  Mail,
  MessageSquare,
  Mic,
  Play,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

type UserStatus = {
  name: string;
  color: string;
  initial: string;
  file: string;
  cursorLine: number;
};

const MOCK_USERS: UserStatus[] = [
  {
    name: "Aryan Dev",
    color: "#61afef",
    initial: "A",
    file: "App.tsx",
    cursorLine: 42,
  },
  {
    name: "Priya Codes",
    color: "#c678dd",
    initial: "P",
    file: "Sidebar.tsx",
    cursorLine: 87,
  },
  {
    name: "Max Builder",
    color: "#e5c07b",
    initial: "M",
    file: "index.css",
    cursorLine: 13,
  },
  {
    name: "Sara Tech",
    color: "#98c379",
    initial: "S",
    file: "App.tsx",
    cursorLine: 201,
  },
];

type FeedEvent = {
  id: string;
  user: string;
  action: string;
  time: string;
  color: string;
};

function generateSessionId() {
  return `cvd-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 6)}`;
}

function now() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

export const CollaborationPanel: React.FC = () => {
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [pairMode, setPairMode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<UserStatus[]>([]);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [cursorPositions, setCursorPositions] = useState<
    Record<string, number>
  >({});
  const feedRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pushFeed = useCallback(
    (user: string, action: string, color: string) => {
      setFeed((prev) => [
        {
          id: `ev_${Date.now()}_${Math.random()}`,
          user,
          action,
          time: now(),
          color,
        },
        ...prev.slice(0, 9),
      ]);
    },
    [],
  );

  const startSession = () => {
    const id = generateSessionId();
    setSessionId(id);
    setSessionActive(true);
    // Simulate users joining with stagger
    MOCK_USERS.forEach((u, i) => {
      setTimeout(() => {
        setOnlineUsers((prev) => [...prev, u]);
        pushFeed(u.name, "joined the session", u.color);
      }, i * 900);
    });
  };

  const endSession = () => {
    setSessionActive(false);
    setSessionId("");
    setPairMode(false);
    setOnlineUsers([]);
    setFeed([]);
    setCursorPositions({});
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // Cursor simulation
  useEffect(() => {
    if (!sessionActive) return;
    intervalRef.current = setInterval(() => {
      const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
      const newLine = Math.floor(Math.random() * 300) + 1;
      setCursorPositions((prev) => ({ ...prev, [user.name]: newLine }));
      if (Math.random() > 0.6) {
        pushFeed(
          user.name,
          `editing line ${newLine} in ${user.file}`,
          user.color,
        );
      }
    }, 3500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sessionActive, pushFeed]);

  const inviteLink = sessionActive
    ? `https://codeveda.app/collab/${sessionId}`
    : "Start a session to get an invite link";

  const handleCopyLink = () => {
    if (!sessionActive) return;
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <TooltipProvider>
      <div
        className="flex flex-col h-full"
        style={{ background: "var(--bg-sidebar)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] flex-shrink-0"
          style={{ background: "var(--bg-activity)" }}
        >
          <div className="flex items-center gap-2">
            <Users size={14} style={{ color: "var(--accent)" }} />
            <span
              className="text-xs font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Live Collaboration
            </span>
            {sessionActive && (
              <span
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold live-badge"
                style={{
                  background: "rgba(34,197,94,0.15)",
                  color: "#22c55e",
                  border: "1px solid rgba(34,197,94,0.3)",
                }}
              >
                <Disc size={7} /> LIVE
              </span>
            )}
          </div>
          {!sessionActive ? (
            <Button
              size="sm"
              onClick={startSession}
              className="h-6 text-[10px] px-2 gap-1"
              style={{ background: "var(--accent)", color: "#fff" }}
              data-ocid="collab.primary_button"
            >
              <Play size={10} /> New Session
            </Button>
          ) : (
            <Button
              size="sm"
              variant="destructive"
              onClick={endSession}
              className="h-6 text-[10px] px-2 gap-1"
              data-ocid="collab.delete_button"
            >
              <LogOut size={10} /> End
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-3">
            {/* Session Card */}
            {sessionActive ? (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg p-3 space-y-2"
                style={{
                  background: "rgba(0,122,204,0.08)",
                  border: "1px solid rgba(0,122,204,0.25)",
                }}
                data-ocid="collab.card"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Session ID
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-mono"
                    style={{ color: "var(--accent)" }}
                  >
                    {sessionId}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors hover:bg-[var(--hover-item)]"
                        style={{
                          background: "var(--bg-input)",
                          border: "1px solid var(--border)",
                          color: "var(--text-secondary)",
                        }}
                        data-ocid="collab.secondary_button"
                      >
                        {copiedLink ? (
                          <Check size={10} style={{ color: "#22c55e" }} />
                        ) : (
                          <ClipboardCopy size={10} />
                        )}
                        <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Copy invite link</TooltipContent>
                  </Tooltip>
                </div>
              </motion.div>
            ) : (
              <div
                className="rounded-lg p-4 text-center"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border)",
                }}
              >
                <Users
                  size={28}
                  style={{ color: "var(--text-muted)", margin: "0 auto 8px" }}
                />
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Start a session to invite collaborators
                </p>
              </div>
            )}

            {/* Pair Programming Toggle */}
            {sessionActive && (
              <div
                className="rounded-lg p-3"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: pairMode
                    ? "1px solid rgba(197,78,255,0.35)"
                    : "1px solid var(--border)",
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Zap
                      size={12}
                      style={{
                        color: pairMode ? "#c678dd" : "var(--icon-inactive)",
                      }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Pair Mode
                    </span>
                    {pairMode && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                        style={{
                          background: "rgba(197,78,255,0.2)",
                          color: "#c678dd",
                          border: "1px solid rgba(197,78,255,0.4)",
                        }}
                      >
                        ACTIVE
                      </motion.span>
                    )}
                  </div>
                  <Switch
                    checked={pairMode}
                    onCheckedChange={(v) => {
                      setPairMode(v);
                      if (v && onlineUsers.length > 0)
                        pushFeed(
                          "You",
                          `enabled Pair Mode with ${onlineUsers[0].name}`,
                          "#c678dd",
                        );
                    }}
                    data-ocid="collab.switch"
                  />
                </div>
                {pairMode && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] mt-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Partner cursor visible — co-editing active
                  </motion.p>
                )}
              </div>
            )}

            {/* Online Users */}
            {sessionActive && onlineUsers.length > 0 && (
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Online ({onlineUsers.length})
                </p>
                <div className="space-y-1.5">
                  <AnimatePresence>
                    {onlineUsers.map((u, i) => (
                      <motion.div
                        key={u.name}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid var(--border)",
                        }}
                        data-ocid={`collab.item.${i + 1}`}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                          style={{
                            background: `${u.color}33`,
                            border: `1.5px solid ${u.color}`,
                            color: u.color,
                          }}
                        >
                          {u.initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-[11px] font-medium truncate"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {u.name}
                          </p>
                          <p
                            className="text-[9px] truncate"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Editing {u.file} · L
                            {cursorPositions[u.name] ?? u.cursorLine}
                          </p>
                        </div>
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{
                            background: u.color,
                            boxShadow: `0 0 4px ${u.color}`,
                          }}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Invite Section */}
            {sessionActive && (
              <div
                className="rounded-lg p-3 space-y-2"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border)",
                }}
              >
                <p
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Invite Via
                </p>
                <div className="flex gap-1.5">
                  {[
                    { icon: <Mail size={11} />, label: "Email" },
                    { icon: <MessageSquare size={11} />, label: "Slack" },
                    { icon: <Globe size={11} />, label: "Discord" },
                    { icon: <Mic size={11} />, label: "Voice" },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors hover:bg-[var(--hover-item)]"
                      style={{
                        background: "var(--bg-input)",
                        border: "1px solid var(--border)",
                        color: "var(--text-secondary)",
                      }}
                      data-ocid={"collab.secondary_button"}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Session Feed */}
            {feed.length > 0 && (
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Activity Feed
                </p>
                <div className="space-y-1" ref={feedRef}>
                  <AnimatePresence>
                    {feed.slice(0, 5).map((ev) => (
                      <motion.div
                        key={ev.id}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start gap-2 px-2 py-1.5 rounded"
                        style={{ background: "rgba(255,255,255,0.02)" }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                          style={{ background: ev.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <span
                            className="text-[10px] font-medium"
                            style={{ color: ev.color }}
                          >
                            {ev.user}
                          </span>
                          <span
                            className="text-[10px]"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {" "}
                            {ev.action}
                          </span>
                        </div>
                        <span
                          className="text-[9px] flex-shrink-0"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {ev.time}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
};

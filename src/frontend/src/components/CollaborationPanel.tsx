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
  AlertCircle,
  Check,
  ClipboardCopy,
  Disc,
  Globe,
  Loader2,
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
import type { CollabEvent, UserPresence } from "../backend.d.ts";
import { CollabEventKind } from "../backend.js";
import { useActor } from "../hooks/useActor";
import {
  fetchOnlineUsers,
  fetchSessionEvents,
  joinCollabSession,
  leaveCollabSession,
  sendPresenceHeartbeat,
} from "../services/backendService";
import { useCollaborationStore } from "../stores/collaborationStore";

function generateSessionId() {
  return `cvd-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 6)}`;
}

function formatTimestamp(ts: bigint): string {
  const d = new Date(Number(ts / BigInt(1_000_000)));
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

function shortPrincipal(p: { toString(): string }): string {
  const s = p.toString();
  return s.length > 12 ? `${s.slice(0, 5)}…${s.slice(-4)}` : s;
}

function eventLabel(ev: CollabEvent): string {
  return ev.kind === CollabEventKind.join
    ? "joined the session"
    : "left the session";
}

export const CollaborationPanel: React.FC = () => {
  const { actor } = useActor();
  const {
    sessionId,
    isActive,
    onlineUsers,
    feed,
    isLoading,
    error,
    startSession,
    endSession: storeEndSession,
    setOnlineUsers,
    addFeedEvent,
    setLoading,
    setError,
  } = useCollaborationStore();

  const [pairMode, setPairMode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seenEvents = useRef<Set<string>>(new Set());
  const actorRef = useRef(actor);
  const sessionIdRef = useRef(sessionId);
  actorRef.current = actor;
  sessionIdRef.current = sessionId;

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  const pollSession = useCallback(
    async (sid: string) => {
      if (!actor) return;
      const [users, events] = await Promise.all([
        fetchOnlineUsers(actor, sid),
        fetchSessionEvents(actor, sid, BigInt(20)),
      ]);
      if (users.length > 0) setOnlineUsers(users);

      for (const ev of events) {
        const key = `${ev.sessionId}_${ev.kind}_${ev.principal.toString()}_${ev.timestamp.toString()}`;
        if (!seenEvents.current.has(key)) {
          seenEvents.current.add(key);
          addFeedEvent(ev);
        }
      }
    },
    [actor, setOnlineUsers, addFeedEvent],
  );

  const handleStartSession = async () => {
    if (!actor) {
      setError("Not connected to backend. Please log in.");
      return;
    }
    setLoading(true);
    setError(null);
    const id = generateSessionId();
    const result = await joinCollabSession(actor, id);
    setLoading(false);
    if (!result) {
      setError("Failed to start session. Please try again.");
      return;
    }
    if (result.__kind__ === "err") {
      setError(result.err);
      return;
    }
    seenEvents.current.clear();
    startSession(id);

    // Seed online users from session result
    if (result.ok.participants.length === 0) {
      // No participants yet — show empty list, poll will fill it
    }

    pollRef.current = setInterval(() => pollSession(id), 3000);
    heartbeatRef.current = setInterval(
      () => sendPresenceHeartbeat(actor, id),
      15000,
    );
  };

  const handleEndSession = async () => {
    stopPolling();
    if (actor && sessionId) {
      await leaveCollabSession(actor, sessionId);
    }
    storeEndSession();
    setPairMode(false);
    seenEvents.current.clear();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      const sid = sessionIdRef.current;
      const act = actorRef.current;
      if (act && sid) leaveCollabSession(act, sid);
    };
  }, [stopPolling]);

  const inviteLink = isActive
    ? `https://codeveda.app/collab/${sessionId}`
    : "Start a session to get an invite link";

  const handleCopyLink = () => {
    if (!isActive) return;
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const displayUsers = onlineUsers as UserPresence[];

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
            {isActive && (
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
          {!isActive ? (
            <Button
              size="sm"
              onClick={handleStartSession}
              disabled={isLoading}
              className="h-6 text-[10px] px-2 gap-1"
              style={{ background: "var(--accent)", color: "#fff" }}
              data-ocid="collab.primary_button"
            >
              {isLoading ? (
                <Loader2 size={10} className="animate-spin" />
              ) : (
                <Play size={10} />
              )}
              {isLoading ? "Joining…" : "New Session"}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleEndSession}
              className="h-6 text-[10px] px-2 gap-1"
              data-ocid="collab.delete_button"
            >
              <LogOut size={10} /> End
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-3">
            {/* Error state */}
            {error && (
              <div
                className="flex items-center gap-2 px-2 py-2 rounded-md text-[10px]"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#ef4444",
                }}
              >
                <AlertCircle size={11} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Session Card */}
            {isActive ? (
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
            {isActive && (
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
                    onCheckedChange={setPairMode}
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
            {isActive && (
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Online ({displayUsers.length})
                </p>
                {displayUsers.length === 0 ? (
                  <p
                    className="text-[10px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Waiting for collaborators to join…
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    <AnimatePresence>
                      {displayUsers.map((u, i) => (
                        <motion.div
                          key={u.principal.toString()}
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
                              background: `${u.avatarColor}33`,
                              border: `1.5px solid ${u.avatarColor}`,
                              color: u.avatarColor,
                            }}
                          >
                            {(u.displayName || shortPrincipal(u.principal))
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-[11px] font-medium truncate"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {u.displayName || shortPrincipal(u.principal)}
                            </p>
                            <p
                              className="text-[9px] truncate font-mono"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {shortPrincipal(u.principal)}
                            </p>
                          </div>
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{
                              background: u.avatarColor,
                              boxShadow: `0 0 4px ${u.avatarColor}`,
                            }}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}

            {/* Invite Section */}
            {isActive && (
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
                      data-ocid="collab.secondary_button"
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
                <div className="space-y-1">
                  <AnimatePresence>
                    {feed.slice(0, 5).map((ev, idx) => (
                      <motion.div
                        key={`${ev.sessionId}_${ev.kind}_${ev.principal.toString()}_${idx}`}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start gap-2 px-2 py-1.5 rounded"
                        style={{ background: "rgba(255,255,255,0.02)" }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                          style={{
                            background:
                              ev.kind === CollabEventKind.join
                                ? "#22c55e"
                                : "#ef4444",
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <span
                            className="text-[10px] font-medium font-mono"
                            style={{
                              color:
                                ev.kind === CollabEventKind.join
                                  ? "#22c55e"
                                  : "#ef4444",
                            }}
                          >
                            {shortPrincipal(ev.principal)}
                          </span>
                          <span
                            className="text-[10px]"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {" "}
                            {eventLabel(ev)}
                          </span>
                        </div>
                        <span
                          className="text-[9px] flex-shrink-0"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {formatTimestamp(ev.timestamp)}
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

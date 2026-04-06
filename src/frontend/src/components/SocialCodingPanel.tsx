import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ExternalLink,
  GitFork,
  Plus,
  Search,
  Share2,
  Star,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useState } from "react";

interface Developer {
  name: string;
  bio: string;
  lang: string;
  langColor: string;
  followers: number;
  initial: string;
  color: string;
}

interface Project {
  name: string;
  desc: string;
  lang: string;
  langColor: string;
  stars: number;
  forks: number;
  owner: string;
}

const DEVELOPERS: Developer[] = [
  {
    name: "Aryan Dev",
    bio: "Full-stack dev building ICP dApps",
    lang: "Motoko",
    langColor: "#c678dd",
    followers: 1240,
    initial: "A",
    color: "#61afef",
  },
  {
    name: "Priya Codes",
    bio: "React + AI enthusiast @ Web3",
    lang: "TypeScript",
    langColor: "#3178c6",
    followers: 876,
    initial: "P",
    color: "#c678dd",
  },
  {
    name: "Max Builder",
    bio: "Open-source infra & tooling",
    lang: "Rust",
    langColor: "#e07b53",
    followers: 2103,
    initial: "M",
    color: "#e5c07b",
  },
  {
    name: "Sara Tech",
    bio: "ML + blockchain integration",
    lang: "Python",
    langColor: "#3572A5",
    followers: 550,
    initial: "S",
    color: "#98c379",
  },
  {
    name: "Leo Frontend",
    bio: "UI/UX + design systems nerd",
    lang: "React",
    langColor: "#61dafb",
    followers: 318,
    initial: "L",
    color: "#e06c75",
  },
  {
    name: "Nova Web3",
    bio: "DeFi protocol engineer",
    lang: "Solidity",
    langColor: "#AA6746",
    followers: 741,
    initial: "N",
    color: "#56b6c2",
  },
];

const PROJECTS: Project[] = [
  {
    name: "react-dashboard",
    desc: "A beautiful analytics dashboard built with React + Recharts",
    lang: "TypeScript",
    langColor: "#3178c6",
    stars: 1872,
    forks: 243,
    owner: "Aryan Dev",
  },
  {
    name: "motoko-utils",
    desc: "Helper functions & patterns for ICP Motoko canisters",
    lang: "Motoko",
    langColor: "#c678dd",
    stars: 634,
    forks: 88,
    owner: "Priya Codes",
  },
  {
    name: "ai-chat-app",
    desc: "Streaming AI chat interface with session management",
    lang: "TypeScript",
    langColor: "#3178c6",
    stars: 3201,
    forks: 517,
    owner: "Max Builder",
  },
  {
    name: "blockchain-explorer",
    desc: "Real-time ICP blockchain explorer with WebSocket feeds",
    lang: "JavaScript",
    langColor: "#f7df1e",
    stars: 983,
    forks: 112,
    owner: "Sara Tech",
  },
  {
    name: "codeveda-mobile",
    desc: "Mobile-first code editor with touch gestures",
    lang: "React",
    langColor: "#61dafb",
    stars: 2455,
    forks: 301,
    owner: "Leo Frontend",
  },
  {
    name: "defi-swap-protocol",
    desc: "Decentralized token swap with AMM curve",
    lang: "Solidity",
    langColor: "#AA6746",
    stars: 1129,
    forks: 198,
    owner: "Nova Web3",
  },
];

type FeedItem = {
  id: string;
  user: string;
  action: string;
  color: string;
  time: string;
};

const FEED_ITEMS: FeedItem[] = [
  {
    id: "1",
    user: "Aryan Dev",
    action: "pushed 3 commits to react-dashboard",
    color: "#61afef",
    time: "2m ago",
  },
  {
    id: "2",
    user: "Max Builder",
    action: "starred motoko-utils",
    color: "#e5c07b",
    time: "15m ago",
  },
  {
    id: "3",
    user: "Priya Codes",
    action: "opened PR: Add dark mode support",
    color: "#c678dd",
    time: "1h ago",
  },
  {
    id: "4",
    user: "Sara Tech",
    action: "forked blockchain-explorer",
    color: "#98c379",
    time: "3h ago",
  },
];

interface ShareForm {
  name: string;
  desc: string;
  lang: string;
  visibility: "public" | "private";
}

export const SocialCodingPanel: React.FC = () => {
  const [query, setQuery] = useState("");
  const [following, setFollowing] = useState<Set<string>>(
    new Set(["Aryan Dev"]),
  );
  const [showShareForm, setShowShareForm] = useState(false);
  const [shareForm, setShareForm] = useState<ShareForm>({
    name: "",
    desc: "",
    lang: "TypeScript",
    visibility: "public",
  });
  const [myProjects, setMyProjects] = useState<Project[]>([
    {
      name: "my-ide-plugin",
      desc: "Custom CodeVeda plugin for Motoko",
      lang: "Motoko",
      langColor: "#c678dd",
      stars: 12,
      forks: 2,
      owner: "You",
    },
  ]);

  const filteredDevs = DEVELOPERS.filter(
    (d) =>
      !query ||
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.lang.toLowerCase().includes(query.toLowerCase()),
  );

  const filteredProjects = PROJECTS.filter(
    (p) =>
      !query ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.desc.toLowerCase().includes(query.toLowerCase()),
  );

  const followedFeed = FEED_ITEMS.filter((f) => following.has(f.user));

  const handleShare = () => {
    if (!shareForm.name.trim()) return;
    setMyProjects((prev) => [
      ...prev,
      {
        name: shareForm.name,
        desc: shareForm.desc,
        lang: shareForm.lang,
        langColor: "#61afef",
        stars: 0,
        forks: 0,
        owner: "You",
      },
    ]);
    setShareForm({
      name: "",
      desc: "",
      lang: "TypeScript",
      visibility: "public",
    });
    setShowShareForm(false);
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--bg-sidebar)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] flex-shrink-0"
        style={{ background: "var(--bg-activity)" }}
      >
        <Share2 size={14} style={{ color: "var(--accent)" }} />
        <span
          className="text-xs font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Social Coding
        </span>
      </div>

      {/* Search */}
      <div className="px-3 pt-2 pb-1 flex-shrink-0">
        <div className="relative">
          <Search
            size={11}
            className="absolute left-2 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder="Search projects, devs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-6 pr-2 py-1.5 rounded text-[11px] outline-none"
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
            data-ocid="social.search_input"
          />
        </div>
      </div>

      <Tabs
        defaultValue="discover"
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList
          className="mx-3 mb-0 flex-shrink-0 h-7 rounded"
          style={{
            background: "var(--bg-activity)",
            border: "1px solid var(--border)",
          }}
        >
          <TabsTrigger
            value="discover"
            className="text-[10px] h-5 flex-1"
            data-ocid="social.tab"
          >
            Discover
          </TabsTrigger>
          <TabsTrigger
            value="following"
            className="text-[10px] h-5 flex-1"
            data-ocid="social.tab"
          >
            Following
          </TabsTrigger>
          <TabsTrigger
            value="mine"
            className="text-[10px] h-5 flex-1"
            data-ocid="social.tab"
          >
            My Projects
          </TabsTrigger>
        </TabsList>

        {/* Discover */}
        <TabsContent
          value="discover"
          className="flex-1 overflow-hidden mt-0"
          style={{ marginTop: 8 }}
        >
          <ScrollArea className="h-full">
            <div className="px-3 pb-3 space-y-4">
              {/* Trending Projects */}
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  🔥 Trending Projects
                </p>
                <div className="space-y-2">
                  {filteredProjects.map((p, i) => (
                    <motion.div
                      key={p.name}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-lg p-2.5"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border)",
                      }}
                      data-ocid={`social.item.${i + 1}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-[11px] font-semibold truncate"
                            style={{ color: "var(--accent)" }}
                          >
                            {p.name}
                          </p>
                          <p
                            className="text-[10px] mt-0.5"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {p.desc}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: p.langColor }}
                            />
                            <span
                              className="text-[9px]"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {p.lang}
                            </span>
                            <span
                              className="text-[9px] flex items-center gap-0.5"
                              style={{ color: "var(--text-muted)" }}
                            >
                              <Star size={8} /> {p.stars.toLocaleString()}
                            </span>
                            <span
                              className="text-[9px] flex items-center gap-0.5"
                              style={{ color: "var(--text-muted)" }}
                            >
                              <GitFork size={8} /> {p.forks}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded text-[9px] transition-colors hover:bg-[var(--hover-item)]"
                          style={{
                            background: "var(--bg-input)",
                            border: "1px solid var(--border)",
                            color: "var(--accent)",
                          }}
                          data-ocid="social.secondary_button"
                        >
                          <ExternalLink size={8} /> Open
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Trending Developers */}
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  👥 Trending Devs
                </p>
                <div className="space-y-2">
                  {filteredDevs.map((d, i) => (
                    <motion.div
                      key={d.name}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-lg p-2.5 flex items-center gap-2"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                        style={{
                          background: `${d.color}33`,
                          border: `1.5px solid ${d.color}`,
                          color: d.color,
                        }}
                      >
                        {d.initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[11px] font-semibold truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {d.name}
                        </p>
                        <p
                          className="text-[9px] truncate"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {d.bio}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="text-[9px]"
                            style={{ color: d.langColor }}
                          >
                            {d.lang}
                          </span>
                          <span
                            className="text-[9px]"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {d.followers.toLocaleString()} followers
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFollowing((prev) => {
                            const next = new Set(prev);
                            if (next.has(d.name)) next.delete(d.name);
                            else next.add(d.name);
                            return next;
                          })
                        }
                        className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded text-[9px] transition-colors"
                        style={{
                          background: following.has(d.name)
                            ? "rgba(0,122,204,0.15)"
                            : "var(--bg-input)",
                          border: following.has(d.name)
                            ? "1px solid rgba(0,122,204,0.4)"
                            : "1px solid var(--border)",
                          color: following.has(d.name)
                            ? "var(--accent)"
                            : "var(--text-secondary)",
                        }}
                        data-ocid="social.toggle"
                      >
                        {following.has(d.name) ? (
                          <UserCheck size={9} />
                        ) : (
                          <UserPlus size={9} />
                        )}
                        {following.has(d.name) ? "Following" : "Follow"}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Following Feed */}
        <TabsContent
          value="following"
          className="flex-1 overflow-hidden mt-0"
          style={{ marginTop: 8 }}
        >
          <ScrollArea className="h-full">
            <div className="px-3 pb-3">
              {followedFeed.length === 0 ? (
                <div
                  className="text-center py-8"
                  data-ocid="social.empty_state"
                >
                  <UserPlus
                    size={28}
                    style={{ color: "var(--text-muted)", margin: "0 auto 8px" }}
                  />
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Follow developers to see their activity
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {followedFeed.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2 px-2 py-2 rounded"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                        style={{ background: item.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <span
                          className="text-[11px] font-medium"
                          style={{ color: item.color }}
                        >
                          {item.user}
                        </span>
                        <span
                          className="text-[10px]"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {" "}
                          {item.action}
                        </span>
                      </div>
                      <span
                        className="text-[9px] flex-shrink-0"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {item.time}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* My Projects */}
        <TabsContent
          value="mine"
          className="flex-1 overflow-hidden mt-0"
          style={{ marginTop: 8 }}
        >
          <ScrollArea className="h-full">
            <div className="px-3 pb-3 space-y-3">
              <Button
                size="sm"
                className="w-full h-7 text-[10px] gap-1"
                style={{ background: "var(--accent)", color: "#fff" }}
                onClick={() => setShowShareForm((v) => !v)}
                data-ocid="social.primary_button"
              >
                <Plus size={10} /> Share a Project
              </Button>

              <AnimatePresence>
                {showShareForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="rounded-lg p-3 space-y-2"
                      style={{
                        background: "rgba(0,122,204,0.06)",
                        border: "1px solid rgba(0,122,204,0.25)",
                      }}
                      data-ocid="social.dialog"
                    >
                      <input
                        type="text"
                        placeholder="Project name"
                        value={shareForm.name}
                        onChange={(e) =>
                          setShareForm((p) => ({ ...p, name: e.target.value }))
                        }
                        className="w-full px-2 py-1.5 rounded text-[11px] outline-none"
                        style={{
                          background: "var(--bg-input)",
                          border: "1px solid var(--border)",
                          color: "var(--text-primary)",
                        }}
                        data-ocid="social.input"
                      />
                      <textarea
                        placeholder="Short description"
                        value={shareForm.desc}
                        onChange={(e) =>
                          setShareForm((p) => ({ ...p, desc: e.target.value }))
                        }
                        rows={2}
                        className="w-full px-2 py-1.5 rounded text-[11px] outline-none resize-none"
                        style={{
                          background: "var(--bg-input)",
                          border: "1px solid var(--border)",
                          color: "var(--text-primary)",
                        }}
                        data-ocid="social.textarea"
                      />
                      <div className="flex gap-2">
                        <select
                          value={shareForm.lang}
                          onChange={(e) =>
                            setShareForm((p) => ({
                              ...p,
                              lang: e.target.value,
                            }))
                          }
                          className="flex-1 px-2 py-1 rounded text-[10px] outline-none"
                          style={{
                            background: "var(--bg-input)",
                            border: "1px solid var(--border)",
                            color: "var(--text-secondary)",
                          }}
                          data-ocid="social.select"
                        >
                          {[
                            "TypeScript",
                            "JavaScript",
                            "Motoko",
                            "Rust",
                            "Python",
                            "Solidity",
                            "React",
                          ].map((l) => (
                            <option key={l} value={l}>
                              {l}
                            </option>
                          ))}
                        </select>
                        <select
                          value={shareForm.visibility}
                          onChange={(e) =>
                            setShareForm((p) => ({
                              ...p,
                              visibility: e.target.value as
                                | "public"
                                | "private",
                            }))
                          }
                          className="flex-1 px-2 py-1 rounded text-[10px] outline-none"
                          style={{
                            background: "var(--bg-input)",
                            border: "1px solid var(--border)",
                            color: "var(--text-secondary)",
                          }}
                          data-ocid="social.select"
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 h-6 text-[10px]"
                          style={{ background: "var(--accent)", color: "#fff" }}
                          onClick={handleShare}
                          data-ocid="social.submit_button"
                        >
                          Share
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-6 text-[10px]"
                          onClick={() => setShowShareForm(false)}
                          data-ocid="social.cancel_button"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {myProjects.length === 0 ? (
                <div
                  className="text-center py-6"
                  data-ocid="social.empty_state"
                >
                  <Share2
                    size={24}
                    style={{ color: "var(--text-muted)", margin: "0 auto 8px" }}
                  />
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    No projects shared yet
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myProjects.map((p, i) => (
                    <div
                      key={p.name}
                      className="rounded-lg p-2.5"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border)",
                      }}
                      data-ocid={`social.item.${i + 1}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-[11px] font-semibold truncate"
                            style={{ color: "var(--accent)" }}
                          >
                            {p.name}
                          </p>
                          <p
                            className="text-[10px]"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {p.desc}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className="px-1.5 py-0.5 rounded text-[9px] hover:bg-[var(--hover-item)] transition-colors"
                            style={{
                              color: "var(--text-secondary)",
                              border: "1px solid var(--border)",
                            }}
                            data-ocid="social.edit_button"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="px-1.5 py-0.5 rounded text-[9px] hover:bg-red-900/30 transition-colors"
                            style={{
                              color: "var(--error)",
                              border: "1px solid rgba(244,71,71,0.3)",
                            }}
                            data-ocid="social.delete_button"
                          >
                            Unshare
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Cherry,
  ChevronDown,
  GitBranch,
  GitGraph,
  GitMerge,
  Layers,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useState } from "react";

interface Commit {
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  authorInitial: string;
  authorColor: string;
  timeAgo: string;
  branch: "main" | "feature" | "fix";
  files: string[];
}

interface Branch {
  name: string;
  lastMsg: string;
  isCurrent: boolean;
  branch: "main" | "feature" | "fix";
}

interface Stash {
  id: string;
  label: string;
  desc: string;
}

const BRANCH_COLORS = {
  main: "#61afef",
  feature: "#c678dd",
  fix: "#e5c07b",
};

const COMMITS: Commit[] = [
  {
    sha: "a1b2c3d4",
    shortSha: "a1b2c3d",
    message: "feat: add AI pair programmer toggle",
    author: "Aryan Dev",
    authorInitial: "A",
    authorColor: "#61afef",
    timeAgo: "2m",
    branch: "feature",
    files: ["AIAssistantPanel.tsx", "stores/aiStore.ts"],
  },
  {
    sha: "e5f6a7b8",
    shortSha: "e5f6a7b",
    message: "fix: mobile layout overflow on small screens",
    author: "Priya Codes",
    authorInitial: "P",
    authorColor: "#c678dd",
    timeAgo: "18m",
    branch: "fix",
    files: ["App.tsx", "MobileBottomNav.tsx", "index.css"],
  },
  {
    sha: "c9d0e1f2",
    shortSha: "c9d0e1f",
    message: "chore: update deps and lockfile",
    author: "Max Builder",
    authorInitial: "M",
    authorColor: "#e5c07b",
    timeAgo: "1h",
    branch: "main",
    files: ["package.json", "package-lock.json"],
  },
  {
    sha: "a3b4c5d6",
    shortSha: "a3b4c5d",
    message: "feat: version control panel with SVG graph",
    author: "Aryan Dev",
    authorInitial: "A",
    authorColor: "#61afef",
    timeAgo: "2h",
    branch: "feature",
    files: ["VersionControlPanel.tsx", "ActivityBar.tsx", "Sidebar.tsx"],
  },
  {
    sha: "e7f8a9b0",
    shortSha: "e7f8a9b",
    message: "feat: CI/CD pipeline UI with stage animations",
    author: "Sara Tech",
    authorInitial: "S",
    authorColor: "#98c379",
    timeAgo: "3h",
    branch: "feature",
    files: ["CICDPanel.tsx"],
  },
  {
    sha: "c1d2e3f4",
    shortSha: "c1d2e3f",
    message: "fix: cursor blink rate in terminal",
    author: "Leo Frontend",
    authorInitial: "L",
    authorColor: "#e06c75",
    timeAgo: "5h",
    branch: "fix",
    files: ["InteractiveTerminal.tsx"],
  },
  {
    sha: "a5b6c7d8",
    shortSha: "a5b6c7d",
    message: "feat: social coding panel follow/unfollow",
    author: "Aryan Dev",
    authorInitial: "A",
    authorColor: "#61afef",
    timeAgo: "7h",
    branch: "feature",
    files: ["SocialCodingPanel.tsx"],
  },
  {
    sha: "e9f0a1b2",
    shortSha: "e9f0a1b",
    message: "perf: lazy-load Monaco from CDN",
    author: "Max Builder",
    authorInitial: "M",
    authorColor: "#e5c07b",
    timeAgo: "1d",
    branch: "main",
    files: ["MonacoEditorCDN.tsx"],
  },
  {
    sha: "c3d4e5f6",
    shortSha: "c3d4e5f",
    message: "fix: file click doesn't open content",
    author: "Priya Codes",
    authorInitial: "P",
    authorColor: "#c678dd",
    timeAgo: "1d",
    branch: "fix",
    files: ["FileTree.tsx", "editorStore.ts"],
  },
  {
    sha: "a7b8c9d0",
    shortSha: "a7b8c9d",
    message: "feat: phase 8 — live collab + social + vcs",
    author: "Aryan Dev",
    authorInitial: "A",
    authorColor: "#61afef",
    timeAgo: "2d",
    branch: "main",
    files: ["App.tsx", "ActivityBar.tsx", "Sidebar.tsx", "..."],
  },
  {
    sha: "e1f2a3b4",
    shortSha: "e1f2a3b",
    message: "docs: update README with phase 7 features",
    author: "Sara Tech",
    authorInitial: "S",
    authorColor: "#98c379",
    timeAgo: "3d",
    branch: "main",
    files: ["README.md"],
  },
];

const BRANCHES: Branch[] = [
  {
    name: "main",
    lastMsg: "feat: phase 8 — live collab + social + vcs",
    isCurrent: true,
    branch: "main",
  },
  {
    name: "feature/ai-panel",
    lastMsg: "feat: add AI pair programmer toggle",
    isCurrent: false,
    branch: "feature",
  },
  {
    name: "feature/vcs-panel",
    lastMsg: "feat: version control panel with SVG graph",
    isCurrent: false,
    branch: "feature",
  },
  {
    name: "fix/mobile-layout",
    lastMsg: "fix: mobile layout overflow on small screens",
    isCurrent: false,
    branch: "fix",
  },
  {
    name: "fix/terminal-cursor",
    lastMsg: "fix: cursor blink rate in terminal",
    isCurrent: false,
    branch: "fix",
  },
];

const INITIAL_STASHES: Stash[] = [
  {
    id: "stash@{0}",
    label: "stash@{0}",
    desc: "WIP: collaboration panel styling",
  },
  {
    id: "stash@{1}",
    label: "stash@{1}",
    desc: "WIP: mobile keyboard improvements",
  },
];

export const VersionControlPanel: React.FC = () => {
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);
  const [branches, setBranches] = useState(BRANCHES);
  const [stashes, setStashes] = useState(INITIAL_STASHES);
  const [newBranchName, setNewBranchName] = useState("");
  const [showNewBranch, setShowNewBranch] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const selectedCommitData = COMMITS.find((c) => c.sha === selectedCommit);

  const handleCreateBranch = () => {
    if (!newBranchName.trim()) return;
    setBranches((prev) => [
      ...prev,
      {
        name: newBranchName,
        lastMsg: "Branch created",
        isCurrent: false,
        branch: "feature",
      },
    ]);
    setNewBranchName("");
    setShowNewBranch(false);
  };

  const handleDeleteBranch = (name: string) => {
    setBranches((prev) => prev.filter((b) => b.name !== name));
    setDeleteConfirm(null);
  };

  const handleSwitchBranch = (name: string) => {
    setBranches((prev) =>
      prev.map((b) => ({ ...b, isCurrent: b.name === name })),
    );
  };

  const handlePopStash = (id: string) => {
    setStashes((prev) => prev.filter((s) => s.id !== id));
  };

  const handleStashChanges = () => {
    const nextIdx = stashes.length;
    setStashes((prev) => [
      {
        id: `stash@{${nextIdx}}`,
        label: `stash@{${nextIdx}}`,
        desc: "WIP: latest changes",
      },
      ...prev,
    ]);
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
        <GitGraph size={14} style={{ color: "var(--accent)" }} />
        <span
          className="text-xs font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Version Control
        </span>
        <Badge
          variant="outline"
          className="text-[9px] ml-auto"
          style={{
            color: "var(--accent)",
            border: "1px solid rgba(0,122,204,0.4)",
          }}
        >
          main
        </Badge>
      </div>

      <Tabs
        defaultValue="history"
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList
          className="mx-3 mt-2 mb-0 flex-shrink-0 h-7 rounded"
          style={{
            background: "var(--bg-activity)",
            border: "1px solid var(--border)",
          }}
        >
          <TabsTrigger
            value="history"
            className="text-[10px] h-5 flex-1"
            data-ocid="vcs.tab"
          >
            History
          </TabsTrigger>
          <TabsTrigger
            value="branches"
            className="text-[10px] h-5 flex-1"
            data-ocid="vcs.tab"
          >
            Branches
          </TabsTrigger>
          <TabsTrigger
            value="stash"
            className="text-[10px] h-5 flex-1"
            data-ocid="vcs.tab"
          >
            Stash
          </TabsTrigger>
        </TabsList>

        {/* History */}
        <TabsContent
          value="history"
          className="flex-1 overflow-hidden mt-0"
          style={{ marginTop: 8 }}
        >
          <ScrollArea className="h-full">
            <div className="px-3 pb-3">
              <div className="space-y-0.5">
                {COMMITS.map((commit, i) => (
                  <div key={commit.sha}>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedCommit(
                          selectedCommit === commit.sha ? null : commit.sha,
                        )
                      }
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all text-left"
                      style={{
                        background:
                          selectedCommit === commit.sha
                            ? "rgba(0,122,204,0.1)"
                            : "transparent",
                        border:
                          selectedCommit === commit.sha
                            ? "1px solid rgba(0,122,204,0.25)"
                            : "1px solid transparent",
                      }}
                      data-ocid={`vcs.item.${i + 1}`}
                    >
                      {/* Graph dot */}
                      <div
                        className="flex flex-col items-center flex-shrink-0"
                        style={{ width: 16 }}
                      >
                        {i > 0 && (
                          <div
                            className="w-0.5 h-1.5"
                            style={{ background: BRANCH_COLORS[commit.branch] }}
                          />
                        )}
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{
                            background: BRANCH_COLORS[commit.branch],
                            boxShadow: `0 0 4px ${BRANCH_COLORS[commit.branch]}66`,
                            border: `1.5px solid ${BRANCH_COLORS[commit.branch]}`,
                          }}
                        />
                        {i < COMMITS.length - 1 && (
                          <div
                            className="w-0.5 h-1.5"
                            style={{ background: BRANCH_COLORS[commit.branch] }}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[10px] truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {commit.message}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="text-[9px] font-mono"
                            style={{ color: BRANCH_COLORS[commit.branch] }}
                          >
                            {commit.shortSha}
                          </span>
                          <span
                            className="text-[9px]"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {commit.author}
                          </span>
                          <span
                            className="text-[9px]"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {commit.timeAgo}
                          </span>
                        </div>
                      </div>

                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                        style={{
                          background: `${commit.authorColor}33`,
                          color: commit.authorColor,
                        }}
                      >
                        {commit.authorInitial}
                      </div>
                    </button>

                    {/* Commit detail */}
                    <AnimatePresence>
                      {selectedCommit === commit.sha && selectedCommitData && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div
                            className="mx-2 mb-1 rounded-lg p-3 space-y-2"
                            style={{
                              background: "rgba(0,122,204,0.06)",
                              border: "1px solid rgba(0,122,204,0.2)",
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p
                                  className="text-[10px] font-medium"
                                  style={{ color: "var(--text-primary)" }}
                                >
                                  {selectedCommitData.message}
                                </p>
                                <p
                                  className="text-[9px] mt-0.5 font-mono"
                                  style={{ color: "var(--text-muted)" }}
                                >
                                  {selectedCommitData.sha}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                className="h-5 text-[9px] px-1.5 gap-0.5 flex-shrink-0"
                                style={{
                                  background: "rgba(0,122,204,0.2)",
                                  color: "var(--accent)",
                                  border: "1px solid rgba(0,122,204,0.4)",
                                }}
                                data-ocid="vcs.secondary_button"
                              >
                                <Cherry size={8} /> Cherry-pick
                              </Button>
                            </div>
                            <div>
                              <p
                                className="text-[9px] font-semibold uppercase tracking-wider mb-1"
                                style={{ color: "var(--text-muted)" }}
                              >
                                Changed Files
                              </p>
                              {selectedCommitData.files.map((f) => (
                                <p
                                  key={f}
                                  className="text-[10px] font-mono"
                                  style={{ color: "var(--info)" }}
                                >
                                  M {f}
                                </p>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Branches */}
        <TabsContent
          value="branches"
          className="flex-1 overflow-hidden mt-0"
          style={{ marginTop: 8 }}
        >
          <ScrollArea className="h-full">
            <div className="px-3 pb-3 space-y-2">
              <Button
                size="sm"
                className="w-full h-7 text-[10px] gap-1"
                style={{ background: "var(--accent)", color: "#fff" }}
                onClick={() => setShowNewBranch((v) => !v)}
                data-ocid="vcs.primary_button"
              >
                <Plus size={10} /> New Branch
              </Button>

              <AnimatePresence>
                {showNewBranch && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="rounded-lg p-2.5 flex gap-2"
                      style={{
                        background: "rgba(0,122,204,0.06)",
                        border: "1px solid rgba(0,122,204,0.25)",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="feature/my-branch"
                        value={newBranchName}
                        onChange={(e) => setNewBranchName(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleCreateBranch()
                        }
                        className="flex-1 px-2 py-1 rounded text-[10px] outline-none"
                        style={{
                          background: "var(--bg-input)",
                          border: "1px solid var(--border)",
                          color: "var(--text-primary)",
                        }}
                        data-ocid="vcs.input"
                      />
                      <button
                        type="button"
                        onClick={handleCreateBranch}
                        className="px-2 py-1 rounded text-[10px] transition-colors hover:opacity-90"
                        style={{ background: "var(--accent)", color: "#fff" }}
                        data-ocid="vcs.submit_button"
                      >
                        Create
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewBranch(false);
                          setNewBranchName("");
                        }}
                        className="p-1 rounded transition-colors hover:bg-[var(--hover-item)]"
                        style={{ color: "var(--text-muted)" }}
                        data-ocid="vcs.cancel_button"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                {branches.map((b, i) => (
                  <div
                    key={b.name}
                    className="rounded-lg px-2.5 py-2"
                    style={{
                      background: b.isCurrent
                        ? "rgba(0,122,204,0.08)"
                        : "rgba(255,255,255,0.02)",
                      border: b.isCurrent
                        ? "1px solid rgba(0,122,204,0.3)"
                        : "1px solid var(--border)",
                    }}
                    data-ocid={`vcs.item.${i + 1}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <GitBranch
                          size={11}
                          style={{
                            color: BRANCH_COLORS[b.branch],
                            flexShrink: 0,
                          }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="text-[11px] font-medium truncate"
                              style={{
                                color: b.isCurrent
                                  ? "var(--accent)"
                                  : "var(--text-primary)",
                              }}
                            >
                              {b.name}
                            </span>
                            {b.isCurrent && (
                              <Badge
                                className="text-[8px] h-3.5 px-1"
                                style={{
                                  background: "rgba(0,122,204,0.2)",
                                  color: "var(--accent)",
                                  border: "none",
                                }}
                              >
                                Current
                              </Badge>
                            )}
                          </div>
                          <p
                            className="text-[9px] truncate mt-0.5"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {b.lastMsg}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!b.isCurrent && (
                          <button
                            type="button"
                            onClick={() => handleSwitchBranch(b.name)}
                            className="px-1.5 py-0.5 rounded text-[9px] transition-colors hover:bg-[var(--hover-item)]"
                            style={{
                              color: "var(--text-secondary)",
                              border: "1px solid var(--border)",
                            }}
                            data-ocid="vcs.secondary_button"
                          >
                            Switch
                          </button>
                        )}
                        {!b.isCurrent &&
                          (deleteConfirm === b.name ? (
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleDeleteBranch(b.name)}
                                className="px-1.5 py-0.5 rounded text-[9px] transition-colors"
                                style={{
                                  background: "rgba(244,71,71,0.2)",
                                  color: "var(--error)",
                                  border: "1px solid rgba(244,71,71,0.4)",
                                }}
                                data-ocid="vcs.confirm_button"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirm(null)}
                                className="p-0.5 rounded"
                                style={{ color: "var(--text-muted)" }}
                                data-ocid="vcs.cancel_button"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(b.name)}
                              className="p-1 rounded transition-colors hover:bg-red-900/20"
                              style={{ color: "var(--text-muted)" }}
                              data-ocid="vcs.delete_button"
                            >
                              <Trash2 size={10} />
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Stash */}
        <TabsContent
          value="stash"
          className="flex-1 overflow-hidden mt-0"
          style={{ marginTop: 8 }}
        >
          <ScrollArea className="h-full">
            <div className="px-3 pb-3 space-y-2">
              <Button
                size="sm"
                className="w-full h-7 text-[10px] gap-1"
                style={{ background: "var(--accent)", color: "#fff" }}
                onClick={handleStashChanges}
                data-ocid="vcs.primary_button"
              >
                <Save size={10} /> Stash Changes
              </Button>

              {stashes.length === 0 ? (
                <div className="text-center py-8" data-ocid="vcs.empty_state">
                  <Layers
                    size={28}
                    style={{ color: "var(--text-muted)", margin: "0 auto 8px" }}
                  />
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    No stashed changes
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {stashes.map((s, i) => (
                    <motion.div
                      key={s.id}
                      layout
                      className="rounded-lg p-2.5"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border)",
                      }}
                      data-ocid={`vcs.item.${i + 1}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p
                            className="text-[10px] font-mono font-medium"
                            style={{ color: "var(--accent)" }}
                          >
                            {s.label}
                          </p>
                          <p
                            className="text-[9px] mt-0.5"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {s.desc}
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handlePopStash(s.id)}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] transition-colors hover:bg-[var(--hover-item)]"
                            style={{
                              color: "var(--text-secondary)",
                              border: "1px solid var(--border)",
                            }}
                            data-ocid="vcs.secondary_button"
                          >
                            <GitMerge size={9} /> Pop
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePopStash(s.id)}
                            className="p-1 rounded transition-colors hover:bg-red-900/20"
                            style={{ color: "var(--text-muted)" }}
                            data-ocid="vcs.delete_button"
                          >
                            <AlertCircle size={9} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
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

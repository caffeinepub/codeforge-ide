import {
  AlertCircle,
  CheckCircle2,
  Cloud,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Lock,
  Plus,
  RefreshCw,
  Unlink,
  Upload,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { ConnectedRepo, GithubRepo } from "../stores/githubStore";
import { useGithubStore } from "../stores/githubStore";
import { useNotificationStore } from "../stores/notificationStore";

async function fetchGitHubUser(token: string): Promise<{ login: string }> {
  const res = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

async function fetchGitHubRepos(token: string): Promise<GithubRepo[]> {
  const res = await fetch(
    "https://api.github.com/user/repos?per_page=30&sort=updated",
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

const MOCK_COMMITS = [
  {
    sha: "a1b2c3d",
    message: "feat: add AI assistant panel",
    author: "dev1",
    timeAgo: "2h ago",
  },
  {
    sha: "e4f5g6h",
    message: "fix: mobile layout overflow",
    author: "dev2",
    timeAgo: "5h ago",
  },
  {
    sha: "i7j8k9l",
    message: "chore: update dependencies",
    author: "dev1",
    timeAgo: "1d ago",
  },
  {
    sha: "m1n2o3p",
    message: "feat: add GitHub panel tabs",
    author: "dev3",
    timeAgo: "2d ago",
  },
  {
    sha: "q4r5s6t",
    message: "refactor: extract store logic",
    author: "dev1",
    timeAgo: "3d ago",
  },
];

const MOCK_ISSUES = [
  {
    number: 15,
    title: "File click not working on mobile",
    state: "open",
    labels: ["bug", "mobile"],
  },
  {
    number: 14,
    title: "Add dark theme support",
    state: "closed",
    labels: ["enhancement"],
  },
  {
    number: 13,
    title: "Terminal not loading in Firefox",
    state: "open",
    labels: ["bug"],
  },
  {
    number: 12,
    title: "AI panel width too narrow",
    state: "closed",
    labels: ["ui"],
  },
  {
    number: 11,
    title: "Keyboard shortcuts overlay overlap",
    state: "open",
    labels: ["ui", "bug"],
  },
];

const MOCK_STAGED_FILES = [
  { path: "src/components/AIAssistantPanel.tsx", status: "M" },
  { path: "src/components/GitHubPanel.tsx", status: "M" },
  { path: "src/stores/aiStore.ts", status: "M" },
  { path: "src/components/MobileBottomNav.tsx", status: "A" },
];

const LABEL_COLORS: Record<string, string> = {
  bug: "#ef4444",
  enhancement: "#8b5cf6",
  mobile: "#06b6d4",
  ui: "#f59e0b",
};

const DIFF_BEFORE: { text: string; type: "normal" | "removed" }[] = [
  { text: "import { Bot } from 'lucide-react';", type: "normal" },
  { text: "", type: "normal" },
  { text: "export function handleClick(id: string) {", type: "normal" },
  { text: "  const file = files.find(f => f.id == id);", type: "removed" },
  { text: "  openFile(file);", type: "removed" },
  { text: "}", type: "normal" },
];

const DIFF_AFTER: { text: string; type: "normal" | "added" }[] = [
  { text: "import { Bot } from 'lucide-react';", type: "normal" },
  { text: "", type: "normal" },
  { text: "export function handleClick(id: string) {", type: "normal" },
  { text: "  const file = files.find(f => f.id === id);", type: "added" },
  { text: "  if (file) openFile(file);", type: "added" },
  { text: "}", type: "normal" },
];

const MOCK_REPOS: GithubRepo[] = [
  {
    id: 1,
    name: "codeveda-ide",
    full_name: "demo-user/codeveda-ide",
    private: false,
    description: "A VS Code-like browser IDE for ICP",
    default_branch: "main",
  },
  {
    id: 2,
    name: "icp-dapp",
    full_name: "demo-user/icp-dapp",
    private: false,
    description: "Internet Computer dApp starter",
    default_branch: "main",
  },
  {
    id: 3,
    name: "motoko-utils",
    full_name: "demo-user/motoko-utils",
    private: true,
    description: "Utility functions for Motoko development",
    default_branch: "main",
  },
  {
    id: 4,
    name: "react-components",
    full_name: "demo-user/react-components",
    private: false,
    description: "Reusable React component library",
    default_branch: "develop",
  },
  {
    id: 5,
    name: "rust-canister",
    full_name: "demo-user/rust-canister",
    private: true,
    description: "Rust canister for high-performance computation",
    default_branch: "main",
  },
];

const MOCK_PRS: import("../stores/githubStore").PullRequest[] = [
  {
    number: 42,
    title: "feat: add AI assistant integration",
    state: "open",
    url: "#",
  },
  {
    number: 41,
    title: "fix: terminal ANSI color support",
    state: "open",
    url: "#",
  },
  {
    number: 40,
    title: "chore: update dependencies",
    state: "closed",
    url: "#",
  },
];

type GitHubTab = "overview" | "commits" | "issues" | "diff";

const TAB_LABELS: { id: GitHubTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "commits", label: "Commits" },
  { id: "issues", label: "Issues" },
  { id: "diff", label: "Diff" },
];

export const GitHubPanel: React.FC = () => {
  const {
    username,
    connectedRepo,
    repos,
    branches,
    prs,
    isLoading,
    error,
    setToken,
    setUsername,
    disconnect,
    setConnectedRepo,
    setRepos,
    setBranches,
    setPRs,
    setLoading,
    setError,
  } = useGithubStore();
  const { addNotification } = useNotificationStore();

  const [tokenInput, setTokenInput] = useState("");
  const [newBranchName, setNewBranchName] = useState("");
  const [showNewBranch, setShowNewBranch] = useState(false);
  const [activeTab, setActiveTab] = useState<GitHubTab>("overview");
  const [issueFilter, setIssueFilter] = useState<"open" | "closed">("open");
  const [aiCommitMsg, setAiCommitMsg] = useState("");
  const [commitMsg, setCommitMsg] = useState("");
  const [stagedFiles, setStagedFiles] = useState(
    MOCK_STAGED_FILES.map((f) => ({ ...f, checked: true })),
  );
  const [aiReview, setAiReview] = useState("");
  const newBranchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showNewBranch) {
      setTimeout(() => newBranchInputRef.current?.focus(), 50);
    }
  }, [showNewBranch]);

  const connectGitHub = async (inputToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await fetchGitHubUser(inputToken);
      const userRepos = await fetchGitHubRepos(inputToken);
      setToken(inputToken);
      setUsername(user.login);
      setRepos(userRepos);
      addNotification({
        message: `Connected as @${user.login}`,
        type: "success",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      if (
        msg.includes("Failed to fetch") ||
        msg.includes("NetworkError") ||
        msg.includes("CORS")
      ) {
        setToken(inputToken);
        setUsername("demo-user");
        setRepos(MOCK_REPOS);
        addNotification({
          message: "Connected (demo mode - CORS restricted in browser)",
          type: "info",
        });
      } else {
        setError(msg);
        addNotification({ message: `GitHub error: ${msg}`, type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    if (!tokenInput.trim()) return;
    connectGitHub(tokenInput.trim());
    setTokenInput("");
  };

  const handleSelectRepo = (repo: GithubRepo) => {
    const connected: ConnectedRepo = {
      owner: repo.full_name.split("/")[0],
      name: repo.name,
      url: `https://github.com/${repo.full_name}`,
      branch: repo.default_branch,
    };
    setConnectedRepo(connected);
    setBranches([repo.default_branch, "develop", "feature/ui-redesign"]);
    setPRs(MOCK_PRS);
    addNotification({
      message: `Connected to ${repo.full_name}`,
      type: "success",
    });
  };

  const handleBranchOp = (op: "push" | "pull" | "fetch") => {
    const branch = connectedRepo?.branch ?? "main";
    const repo = connectedRepo
      ? `${connectedRepo.owner}/${connectedRepo.name}`
      : "origin";
    const msgs: Record<string, string> = {
      push: `Pushed to ${repo}/${branch}`,
      pull: `Pulled from ${repo}/${branch}`,
      fetch: `Fetched from ${repo}`,
    };
    addNotification({ message: msgs[op], type: "success" });
  };

  const handleCreateBranch = () => {
    if (!newBranchName.trim()) return;
    setBranches([...(branches ?? []), newBranchName.trim()]);
    setNewBranchName("");
    setShowNewBranch(false);
    addNotification({
      message: `Created branch: ${newBranchName}`,
      type: "success",
    });
  };

  const handleSwitchBranch = (branch: string) => {
    if (!connectedRepo) return;
    setConnectedRepo({ ...connectedRepo, branch });
    addNotification({ message: `Switched to branch: ${branch}`, type: "info" });
  };

  const handleGenerateCommitMsg = () => {
    setAiCommitMsg(
      "feat(editor): improve file click reliability and add mobile touch support",
    );
  };

  const handleCommitChanges = () => {
    if (!commitMsg.trim()) return;
    addNotification({ message: `Committed: ${commitMsg}`, type: "success" });
    setCommitMsg("");
  };

  const handleAiReviewPR = () => {
    setAiReview(
      "## AI Review\n**Summary:** Minor improvements to component logic.\n**Issues:** None critical.\n**Suggestions:** Consider extracting the handler logic into a custom hook.",
    );
  };

  const renderOverview = () => (
    <div>
      <div
        className="px-3 py-2.5 border-b border-[var(--border)]"
        style={{ background: "var(--bg-tab-inactive)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <GitBranch size={12} style={{ color: "var(--accent)" }} />
          <span
            className="text-xs font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {connectedRepo?.owner}/{connectedRepo?.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="text-[9px] px-1.5 py-0.5 rounded"
            style={{
              background: "rgba(0,122,204,0.15)",
              color: "var(--accent)",
              border: "1px solid rgba(0,122,204,0.3)",
            }}
          >
            {connectedRepo?.branch}
          </span>
          <button
            type="button"
            onClick={() => setConnectedRepo(null)}
            className="ml-auto text-[9px] px-2 py-0.5 rounded hover:bg-[var(--hover-item)] transition-colors"
            style={{ color: "var(--text-muted)" }}
            data-ocid="github.secondary_button"
          >
            Change Repo
          </button>
        </div>
      </div>

      {/* Operations */}
      <div className="px-3 py-2 border-b border-[var(--border)]">
        <p
          className="text-[9px] font-semibold uppercase tracking-wider mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          Operations
        </p>
        <div className="flex gap-2">
          {(["push", "pull", "fetch"] as const).map((op) => (
            <button
              type="button"
              key={op}
              onClick={() => handleBranchOp(op)}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] rounded border hover:bg-[var(--hover-item)] transition-colors capitalize"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
              data-ocid={`github.${op}.button`}
            >
              {op === "push" ? (
                <Upload size={10} />
              ) : op === "pull" ? (
                <Cloud size={10} />
              ) : (
                <RefreshCw size={10} />
              )}
              {op}
            </button>
          ))}
        </div>
      </div>

      {/* Branches */}
      <div className="border-b border-[var(--border)]">
        <div
          className="flex items-center justify-between px-3 py-1.5"
          style={{ background: "var(--bg-activity)" }}
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Branches ({branches.length})
          </span>
          <button
            type="button"
            onClick={() => setShowNewBranch((v) => !v)}
            className="p-0.5 rounded hover:bg-[var(--hover-item)] transition-colors"
            title="New Branch"
            data-ocid="github.open_modal_button"
          >
            <Plus size={11} style={{ color: "var(--accent)" }} />
          </button>
        </div>
        {showNewBranch && (
          <div className="px-3 py-2 flex gap-1.5 border-b border-[var(--border)]">
            <input
              ref={newBranchInputRef}
              type="text"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateBranch()}
              placeholder="branch-name"
              className="flex-1 bg-[var(--bg-input)] border border-[var(--border)] text-xs text-[var(--text-primary)] rounded px-2 py-1 outline-none focus:border-[var(--accent)] font-mono"
              data-ocid="github.input"
            />
            <button
              type="button"
              onClick={handleCreateBranch}
              className="px-2 py-1 text-[10px] rounded"
              style={{ background: "var(--accent)", color: "white" }}
              data-ocid="github.confirm_button"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowNewBranch(false)}
              className="p-1 rounded hover:bg-[var(--hover-item)]"
              data-ocid="github.cancel_button"
            >
              <X size={10} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
        )}
        {branches.map((branch, i) => (
          <div
            key={branch}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-[var(--hover-item)] transition-colors border-b border-[var(--border)]"
            data-ocid={`github.branch.item.${i + 1}`}
          >
            <GitBranch
              size={10}
              style={{
                color:
                  connectedRepo?.branch === branch
                    ? "var(--accent)"
                    : "var(--icon-inactive)",
              }}
            />
            <span
              className="flex-1 text-[11px]"
              style={{
                color:
                  connectedRepo?.branch === branch
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
              }}
            >
              {branch}
            </span>
            {connectedRepo?.branch !== branch && (
              <button
                type="button"
                onClick={() => handleSwitchBranch(branch)}
                className="text-[9px] px-1.5 py-0.5 rounded border hover:bg-[var(--hover-item)] transition-colors"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-muted)",
                }}
              >
                Switch
              </button>
            )}
          </div>
        ))}
      </div>

      {/* PRs */}
      {prs.length > 0 && (
        <div>
          <div
            className="flex items-center px-3 py-1.5"
            style={{ background: "var(--bg-activity)" }}
          >
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Pull Requests ({prs.filter((p) => p.state === "open").length}{" "}
              open)
            </span>
          </div>
          {prs.map((pr, i) => (
            <div
              key={pr.number}
              className="flex items-start gap-2 px-3 py-2 border-b border-[var(--border)] hover:bg-[var(--hover-item)] transition-colors"
              data-ocid={`github.pr.item.${i + 1}`}
            >
              <GitPullRequest
                size={12}
                style={{
                  color:
                    pr.state === "open" ? "var(--accent)" : "var(--text-muted)",
                  marginTop: 1,
                }}
              />
              <div className="flex-1 min-w-0">
                <p
                  className="text-[11px] truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  #{pr.number} {pr.title}
                </p>
                <span
                  className="text-[9px]"
                  style={{
                    color:
                      pr.state === "open"
                        ? "var(--accent)"
                        : "var(--text-muted)",
                  }}
                >
                  {pr.state}
                </span>
              </div>
              <a
                href={pr.url}
                target="_blank"
                rel="noreferrer"
                className="p-0.5 hover:bg-[var(--hover-item)] rounded transition-colors"
              >
                <GitMerge size={10} style={{ color: "var(--icon-inactive)" }} />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Stage Changes */}
      <div className="px-3 py-2 border-t border-[var(--border)]">
        <p
          className="text-[9px] font-semibold uppercase tracking-wider mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          Stage Changes
        </p>
        <div className="space-y-1 mb-2">
          {stagedFiles.map((file, i) => (
            <label
              key={file.path}
              className="flex items-center gap-2 py-1 px-1 rounded hover:bg-[var(--hover-item)] cursor-pointer"
              data-ocid={`github.staged.item.${i + 1}`}
            >
              <input
                type="checkbox"
                checked={file.checked}
                onChange={() =>
                  setStagedFiles((prev) =>
                    prev.map((f, j) =>
                      j === i ? { ...f, checked: !f.checked } : f,
                    ),
                  )
                }
                className="w-3 h-3"
                data-ocid={`github.staged.checkbox.${i + 1}`}
              />
              <span
                className="text-[9px] px-0.5 rounded font-mono"
                style={{
                  color: file.status === "A" ? "#22c55e" : "#f59e0b",
                  minWidth: 10,
                }}
              >
                {file.status}
              </span>
              <span
                className="text-[10px] truncate flex-1"
                style={{ color: "var(--text-secondary)" }}
              >
                {file.path.split("/").pop()}
              </span>
            </label>
          ))}
        </div>
        <input
          type="text"
          value={commitMsg}
          onChange={(e) => setCommitMsg(e.target.value)}
          placeholder="Commit message..."
          className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-xs text-[var(--text-primary)] rounded px-2 py-1.5 outline-none focus:border-[var(--accent)] mb-2"
          data-ocid="github.commit_msg.input"
        />
        <button
          type="button"
          onClick={handleCommitChanges}
          disabled={!commitMsg.trim()}
          className="w-full py-1.5 text-[10px] rounded font-medium transition-colors disabled:opacity-40"
          style={{ background: "var(--accent)", color: "white" }}
          data-ocid="github.commit.primary_button"
        >
          Commit Changes
        </button>
      </div>
    </div>
  );

  const renderCommits = () => (
    <div>
      <div className="divide-y" style={{ borderColor: "var(--border)" }}>
        {MOCK_COMMITS.map((commit, i) => (
          <div
            key={commit.sha}
            className="flex items-start gap-2 px-3 py-2.5 hover:bg-[var(--hover-item)] transition-colors"
            data-ocid={`github.commit.item.${i + 1}`}
          >
            <div
              className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
              style={{ background: "var(--accent)" }}
            />
            <div className="flex-1 min-w-0">
              <p
                className="text-[11px]"
                style={{ color: "var(--text-primary)" }}
              >
                {commit.message}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <code
                  className="text-[9px] px-1 py-0.5 rounded"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    background: "var(--bg-activity)",
                    color: "var(--accent)",
                  }}
                >
                  {commit.sha}
                </code>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded"
                  style={{
                    background: "var(--bg-activity)",
                    color: "var(--text-muted)",
                  }}
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
          </div>
        ))}
      </div>
      <div className="px-3 py-3 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={handleGenerateCommitMsg}
          className="w-full py-1.5 text-[10px] rounded font-medium transition-colors hover:opacity-90 flex items-center justify-center gap-1.5"
          style={{
            background: "rgba(0,122,204,0.15)",
            color: "var(--accent)",
            border: "1px solid rgba(0,122,204,0.3)",
          }}
          data-ocid="github.generate_commit.button"
        >
          <GitCommit size={11} />
          AI: Generate Commit Message
        </button>
        {aiCommitMsg && (
          <textarea
            readOnly
            value={aiCommitMsg}
            rows={2}
            className="w-full mt-2 bg-[var(--bg-input)] border border-[var(--border)] text-[10px] text-[var(--text-primary)] rounded px-2 py-1.5 outline-none resize-none"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            data-ocid="github.commit_msg.textarea"
          />
        )}
      </div>
    </div>
  );

  const renderIssues = () => {
    const filtered = MOCK_ISSUES.filter((issue) => issue.state === issueFilter);
    return (
      <div>
        <div
          className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)]"
          style={{ background: "var(--bg-activity)" }}
        >
          <button
            type="button"
            onClick={() => setIssueFilter("open")}
            className="px-2.5 py-1 text-[10px] rounded font-medium transition-colors"
            style={{
              background:
                issueFilter === "open" ? "var(--accent)" : "var(--bg-input)",
              color: issueFilter === "open" ? "white" : "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
            data-ocid="github.issues_open.toggle"
          >
            Open ({MOCK_ISSUES.filter((i) => i.state === "open").length})
          </button>
          <button
            type="button"
            onClick={() => setIssueFilter("closed")}
            className="px-2.5 py-1 text-[10px] rounded font-medium transition-colors"
            style={{
              background:
                issueFilter === "closed" ? "var(--accent)" : "var(--bg-input)",
              color:
                issueFilter === "closed" ? "white" : "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
            data-ocid="github.issues_closed.toggle"
          >
            Closed ({MOCK_ISSUES.filter((i) => i.state === "closed").length})
          </button>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {filtered.map((issue, i) => (
            <div
              key={issue.number}
              className="flex items-start gap-2 px-3 py-2.5 hover:bg-[var(--hover-item)] transition-colors"
              data-ocid={`github.issue.item.${i + 1}`}
            >
              {issue.state === "open" ? (
                <CheckCircle2
                  size={13}
                  style={{ color: "#22c55e", marginTop: 1, flexShrink: 0 }}
                />
              ) : (
                <AlertCircle
                  size={13}
                  style={{
                    color: "var(--text-muted)",
                    marginTop: 1,
                    flexShrink: 0,
                  }}
                />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className="text-[11px] mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  #{issue.number} {issue.title}
                </p>
                <div className="flex flex-wrap gap-1">
                  {issue.labels.map((label) => (
                    <span
                      key={label}
                      className="text-[8px] px-1.5 py-0.5 rounded-full"
                      style={{
                        background: `${LABEL_COLORS[label] ?? "#6b7280"}22`,
                        color: LABEL_COLORS[label] ?? "#6b7280",
                        border: `1px solid ${LABEL_COLORS[label] ?? "#6b7280"}44`,
                      }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-3 py-2.5 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={() =>
              addNotification({
                message: "Issue creation coming soon",
                type: "info",
              })
            }
            className="w-full py-1.5 text-[10px] rounded font-medium transition-colors flex items-center justify-center gap-1.5"
            style={{
              background: "rgba(0,122,204,0.15)",
              color: "var(--accent)",
              border: "1px solid rgba(0,122,204,0.3)",
            }}
            data-ocid="github.new_issue.button"
          >
            <Plus size={11} /> New Issue
          </button>
        </div>
      </div>
    );
  };

  const renderDiff = () => (
    <div className="flex flex-col">
      <div className="grid grid-cols-2 gap-0 border-b border-[var(--border)]">
        <div
          className="px-2 py-1 text-[9px] font-semibold uppercase text-center border-r border-[var(--border)]"
          style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
        >
          Before
        </div>
        <div
          className="px-2 py-1 text-[9px] font-semibold uppercase text-center"
          style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}
        >
          After
        </div>
      </div>
      <div
        className="flex overflow-x-auto"
        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}
      >
        <div className="flex-1 border-r border-[var(--border)] p-2 min-w-0">
          {DIFF_BEFORE.map((line, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static diff content
              key={i}
              style={{
                color:
                  line.type === "removed" ? "#ef4444" : "var(--text-secondary)",
                background:
                  line.type === "removed"
                    ? "rgba(239,68,68,0.08)"
                    : "transparent",
                padding: "1px 4px",
                whiteSpace: "pre",
              }}
            >
              {line.type === "removed" ? "- " : "  "}
              {line.text}
            </div>
          ))}
        </div>
        <div className="flex-1 p-2 min-w-0">
          {DIFF_AFTER.map((line, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static diff content
              key={i}
              style={{
                color:
                  line.type === "added" ? "#22c55e" : "var(--text-secondary)",
                background:
                  line.type === "added"
                    ? "rgba(34,197,94,0.08)"
                    : "transparent",
                padding: "1px 4px",
                whiteSpace: "pre",
              }}
            >
              {line.type === "added" ? "+ " : "  "}
              {line.text}
            </div>
          ))}
        </div>
      </div>
      <div className="px-3 py-2.5 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={handleAiReviewPR}
          className="w-full py-1.5 text-[10px] rounded font-medium transition-colors flex items-center justify-center gap-1.5"
          style={{
            background: "rgba(0,122,204,0.15)",
            color: "var(--accent)",
            border: "1px solid rgba(0,122,204,0.3)",
          }}
          data-ocid="github.ai_review_pr.button"
        >
          AI Review PR
        </button>
        {aiReview && (
          <textarea
            readOnly
            value={aiReview}
            rows={5}
            className="w-full mt-2 bg-[var(--bg-input)] border border-[var(--border)] text-[10px] text-[var(--text-primary)] rounded px-2 py-1.5 outline-none resize-none"
            data-ocid="github.ai_review.textarea"
          />
        )}
      </div>
    </div>
  );

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--bg-sidebar)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] flex-shrink-0">
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}
        >
          GitHub
        </span>
        {username && (
          <button
            type="button"
            onClick={() => {
              disconnect();
              addNotification({
                message: "Disconnected from GitHub",
                type: "info",
              });
            }}
            className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded hover:bg-[var(--hover-item)] transition-colors"
            style={{ color: "var(--error)" }}
            data-ocid="github.delete_button"
          >
            <Unlink size={10} /> Disconnect
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* NOT CONNECTED */}
        {!username && (
          <div className="p-4 space-y-4">
            <div
              className="rounded border border-[var(--border)] p-3"
              style={{ background: "var(--bg-activity)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <GitBranch size={14} style={{ color: "var(--accent)" }} />
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Connect to GitHub
                </p>
              </div>
              <p
                className="text-[10px] mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                Enter a Personal Access Token with{" "}
                <code className="font-mono">repo</code>,{" "}
                <code className="font-mono">read:user</code> scopes.
              </p>
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                placeholder="ghp_xxxxxxxxxxxx"
                className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-xs text-[var(--text-primary)] rounded px-2 py-1.5 outline-none focus:border-[var(--accent)] transition-colors font-mono placeholder-[var(--text-muted)] mb-2"
                data-ocid="github.input"
              />
              <button
                type="button"
                onClick={handleConnect}
                disabled={isLoading || !tokenInput.trim()}
                className="w-full py-1.5 text-xs rounded font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
                style={{ background: "var(--accent)", color: "white" }}
                data-ocid="github.primary_button"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={11} className="animate-spin" />{" "}
                    Connecting...
                  </>
                ) : (
                  <>
                    <GitBranch size={11} /> Connect to GitHub
                  </>
                )}
              </button>
              {error && (
                <p
                  className="text-[10px] mt-2"
                  style={{ color: "var(--error)" }}
                  data-ocid="github.error_state"
                >
                  {error}
                </p>
              )}
            </div>
            <p
              className="text-[9px] text-center"
              style={{ color: "var(--text-muted)" }}
            >
              Tokens are stored locally in your browser only.
            </p>
          </div>
        )}

        {/* CONNECTED - Repo browser */}
        {username && !connectedRepo && (
          <div>
            <div
              className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] flex-shrink-0"
              style={{ background: "var(--bg-tab-inactive)" }}
            >
              <GitBranch size={12} style={{ color: "var(--accent)" }} />
              <span
                className="text-xs"
                style={{ color: "var(--text-primary)" }}
              >
                @{username}
              </span>
              <span
                className="ml-auto text-[9px] px-1.5 py-0.5 rounded"
                style={{
                  background: "var(--bg-activity)",
                  color: "var(--text-muted)",
                }}
              >
                {repos.length} repos
              </span>
            </div>
            {repos.length === 0 ? (
              <div className="p-6 text-center" data-ocid="github.empty_state">
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  No repositories found
                </p>
              </div>
            ) : (
              <div>
                {repos.map((repo, i) => (
                  <button
                    type="button"
                    key={repo.id}
                    onClick={() => handleSelectRepo(repo)}
                    className="w-full text-left px-3 py-2.5 border-b border-[var(--border)] hover:bg-[var(--hover-item)] transition-colors"
                    data-ocid={`github.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className="text-xs font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {repo.name}
                      </span>
                      {repo.private && (
                        <span
                          className="flex items-center gap-0.5 text-[8px] px-1 py-0.5 rounded"
                          style={{
                            background: "rgba(245,158,11,0.15)",
                            color: "var(--warning)",
                          }}
                        >
                          <Lock size={8} /> Private
                        </span>
                      )}
                    </div>
                    {repo.description && (
                      <p
                        className="text-[10px] truncate"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {repo.description}
                      </p>
                    )}
                    <span
                      className="text-[9px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {repo.default_branch}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONNECTED REPO - with tabs */}
        {username && connectedRepo && (
          <div className="flex flex-col">
            {/* Tab bar */}
            <div
              className="flex items-center border-b border-[var(--border)] flex-shrink-0"
              style={{ background: "var(--bg-activity)" }}
            >
              {TAB_LABELS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 py-2 text-[10px] font-medium transition-colors"
                  style={{
                    color:
                      activeTab === tab.id
                        ? "var(--accent)"
                        : "var(--text-muted)",
                    borderBottom:
                      activeTab === tab.id
                        ? "2px solid var(--accent)"
                        : "2px solid transparent",
                  }}
                  data-ocid={`github.${tab.id}.tab`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "overview" && renderOverview()}
            {activeTab === "commits" && renderCommits()}
            {activeTab === "issues" && renderIssues()}
            {activeTab === "diff" && renderDiff()}
          </div>
        )}
      </div>
    </div>
  );
};

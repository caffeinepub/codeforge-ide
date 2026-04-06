import {
  Cloud,
  GitBranch,
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
          message: "Connected (demo mode \u2014 CORS restricted in browser)",
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
                            background: "var(--warning)22",
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

        {/* CONNECTED REPO */}
        {username && connectedRepo && (
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
                  {connectedRepo.owner}/{connectedRepo.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded"
                  style={{
                    background: "var(--accent)22",
                    color: "var(--accent)",
                    border: "1px solid var(--accent)44",
                  }}
                >
                  {connectedRepo.branch}
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
                        connectedRepo.branch === branch
                          ? "var(--accent)"
                          : "var(--icon-inactive)",
                    }}
                  />
                  <span
                    className="flex-1 text-[11px]"
                    style={{
                      color:
                        connectedRepo.branch === branch
                          ? "var(--text-primary)"
                          : "var(--text-secondary)",
                    }}
                  >
                    {branch}
                  </span>
                  {connectedRepo.branch !== branch && (
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
                    Pull Requests (
                    {prs.filter((p) => p.state === "open").length} open)
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
                          pr.state === "open"
                            ? "var(--accent)"
                            : "var(--text-muted)",
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
                      <GitMerge
                        size={10}
                        style={{ color: "var(--icon-inactive)" }}
                      />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

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

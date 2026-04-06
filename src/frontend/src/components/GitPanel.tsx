import {
  Check,
  Cloud,
  GitBranch,
  GitCommit,
  Minus,
  Plus,
  RefreshCw,
} from "lucide-react";
import type React from "react";
import { useGitStore } from "../stores/gitStore";
import { useGithubStore } from "../stores/githubStore";
import { useNotificationStore } from "../stores/notificationStore";

const STATUS_COLORS: Record<string, string> = {
  M: "var(--warning)",
  U: "var(--accent)",
  D: "var(--error)",
};

const STATUS_LABELS: Record<string, string> = {
  M: "Modified",
  U: "Untracked",
  D: "Deleted",
};

interface GitPanelProps {
  onOpenGitHub?: () => void;
}

export const GitPanel: React.FC<GitPanelProps> = ({ onOpenGitHub }) => {
  const {
    branch,
    files,
    commitMessage,
    stageFile,
    unstageFile,
    stageAll,
    unstageAll,
    setCommitMessage,
    commit,
  } = useGitStore();
  const { addNotification } = useNotificationStore();
  const { connectedRepo } = useGithubStore();

  const staged = files.filter((f) => f.staged);
  const unstaged = files.filter((f) => !f.staged);

  const handleCommit = () => {
    if (!commitMessage.trim()) {
      addNotification({
        message: "Commit message is required",
        type: "warning",
      });
      return;
    }
    if (staged.length === 0) {
      addNotification({
        message: "No staged changes to commit",
        type: "warning",
      });
      return;
    }
    commit();
    addNotification({
      message: `Committed: "${commitMessage}"`,
      type: "success",
    });
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
          Source Control
        </span>
        <button
          type="button"
          className="p-1 rounded hover:bg-[var(--hover-item)] text-[var(--icon-inactive)] hover:text-[var(--text-primary)]"
          title="Refresh"
          data-ocid="git.secondary_button"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      {/* GitHub indicator */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] flex-shrink-0"
        style={{
          background: connectedRepo
            ? "var(--accent)11"
            : "var(--bg-tab-inactive)",
        }}
      >
        {connectedRepo ? (
          <>
            <Cloud size={11} style={{ color: "var(--accent)" }} />
            <span
              className="text-[10px] font-medium"
              style={{ color: "var(--accent)" }}
            >
              {connectedRepo.owner}/{connectedRepo.name}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  addNotification({
                    message: `Pushed to ${connectedRepo.owner}/${connectedRepo.name}`,
                    type: "success",
                  })
                }
                className="text-[9px] px-1.5 py-0.5 rounded hover:bg-[var(--hover-item)] transition-colors"
                style={{ color: "var(--text-muted)" }}
                title="Push"
                data-ocid="git.push.button"
              >
                Push ↑
              </button>
              <button
                type="button"
                onClick={() =>
                  addNotification({
                    message: `Pulled from ${connectedRepo.owner}/${connectedRepo.name}`,
                    type: "success",
                  })
                }
                className="text-[9px] px-1.5 py-0.5 rounded hover:bg-[var(--hover-item)] transition-colors"
                style={{ color: "var(--text-muted)" }}
                title="Pull"
                data-ocid="git.pull.button"
              >
                Pull ↓
              </button>
            </div>
          </>
        ) : (
          <>
            <span
              className="text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              Not connected to GitHub
            </span>
            {onOpenGitHub && (
              <button
                type="button"
                onClick={onOpenGitHub}
                className="ml-auto text-[9px] underline hover:no-underline transition-colors"
                style={{ color: "var(--accent)" }}
                data-ocid="git.open_modal_button"
              >
                Connect GitHub
              </button>
            )}
          </>
        )}
      </div>

      {/* Branch */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] flex-shrink-0"
        style={{ background: "var(--bg-tab-inactive)" }}
      >
        <GitBranch size={12} style={{ color: "var(--accent)" }} />
        <span className="text-xs" style={{ color: "var(--text-primary)" }}>
          {branch}
        </span>
        <span
          className="ml-auto text-[9px] px-1.5 py-0.5 rounded"
          style={{
            background: "var(--bg-activity)",
            color: "var(--text-muted)",
          }}
        >
          {staged.length} staged · {unstaged.length} unstaged
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Staged Changes */}
        {staged.length > 0 && (
          <div>
            <div
              className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border)]"
              style={{ background: "var(--bg-activity)" }}
            >
              <span
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Staged Changes ({staged.length})
              </span>
              <button
                type="button"
                onClick={unstageAll}
                className="text-[9px] px-1.5 py-0.5 rounded hover:bg-[var(--hover-item)] transition-colors"
                style={{ color: "var(--text-muted)" }}
                data-ocid="git.secondary_button"
              >
                Unstage All
              </button>
            </div>
            {staged.map((file, i) => (
              <div
                key={file.id}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-[var(--hover-item)] cursor-pointer transition-colors border-b border-[var(--border)]"
                data-ocid={`git.item.${i + 1}`}
              >
                <span
                  className="w-4 text-[10px] font-bold flex-shrink-0"
                  style={{ color: STATUS_COLORS[file.status] }}
                  title={STATUS_LABELS[file.status]}
                >
                  {file.status}
                </span>
                <span
                  className="flex-1 text-xs truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {file.name}
                </span>
                <span
                  className="text-[9px] truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  {file.path}
                </span>
                <button
                  type="button"
                  onClick={() => unstageFile(file.id)}
                  className="p-0.5 rounded hover:bg-[var(--hover-item)] transition-colors flex-shrink-0"
                  title="Unstage"
                  data-ocid={`git.toggle.${i + 1}`}
                >
                  <Minus size={10} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Unstaged Changes */}
        {unstaged.length > 0 && (
          <div>
            <div
              className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border)]"
              style={{ background: "var(--bg-activity)" }}
            >
              <span
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Changes ({unstaged.length})
              </span>
              <button
                type="button"
                onClick={stageAll}
                className="text-[9px] px-1.5 py-0.5 rounded hover:bg-[var(--hover-item)] transition-colors"
                style={{ color: "var(--text-muted)" }}
                data-ocid="git.primary_button"
              >
                Stage All
              </button>
            </div>
            {unstaged.map((file, i) => (
              <div
                key={file.id}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-[var(--hover-item)] cursor-pointer transition-colors border-b border-[var(--border)]"
                data-ocid={`git.item.${staged.length + i + 1}`}
              >
                <span
                  className="w-4 text-[10px] font-bold flex-shrink-0"
                  style={{ color: STATUS_COLORS[file.status] }}
                  title={STATUS_LABELS[file.status]}
                >
                  {file.status}
                </span>
                <span
                  className="flex-1 text-xs truncate"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {file.name}
                </span>
                <span
                  className="text-[9px] truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  {file.path}
                </span>
                <button
                  type="button"
                  onClick={() => stageFile(file.id)}
                  className="p-0.5 rounded hover:bg-[var(--hover-item)] transition-colors flex-shrink-0"
                  title="Stage"
                  data-ocid={`git.toggle.${staged.length + i + 1}`}
                >
                  <Plus size={10} style={{ color: "var(--accent)" }} />
                </button>
              </div>
            ))}
          </div>
        )}

        {files.length === 0 && (
          <div className="p-6 text-center" data-ocid="git.empty_state">
            <GitCommit
              size={24}
              className="mx-auto mb-2"
              style={{ color: "var(--text-muted)" }}
            />
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              No changes
            </p>
          </div>
        )}
      </div>

      {/* Commit area */}
      <div
        className="flex-shrink-0 p-3 border-t border-[var(--border)]"
        style={{ background: "var(--bg-activity)" }}
      >
        <textarea
          rows={2}
          className="w-full bg-[var(--bg-input)] border border-[var(--border)] text-xs text-[var(--text-primary)] rounded px-2 py-1.5 outline-none resize-none placeholder-[var(--text-muted)] focus:border-[var(--accent)] transition-colors"
          placeholder="Message (Ctrl+Enter to commit)"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          data-ocid="git.textarea"
        />
        <button
          type="button"
          onClick={handleCommit}
          disabled={staged.length === 0 || !commitMessage.trim()}
          className="mt-2 w-full flex items-center justify-center gap-2 py-1.5 text-xs rounded font-medium transition-colors disabled:opacity-40"
          style={{ background: "var(--accent)", color: "white" }}
          data-ocid="git.submit_button"
        >
          <Check size={12} />
          Commit ({staged.length} files)
        </button>
      </div>
    </div>
  );
};

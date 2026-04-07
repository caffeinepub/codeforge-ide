import { PipelineRunStatus } from "../backend";
/**
 * Backend service wrapper — thin, safe helpers around the actor.
 * All calls are try/catch guarded and return null/empty on failure.
 */
import type {
  Bookmark,
  CodeFile,
  CodeSnippet,
  DeploymentRecord,
  PipelineRun,
  UserProfile,
  backendInterface,
} from "../backend.d";

type Actor = backendInterface | null;

// PipelineStageStatus shares the same string values as PipelineRunStatus
export type PipelineStageStatus = "pending" | "failed" | "running" | "passed";

// ─── User Profile ──────────────────────────────────────────────────────────

export async function fetchUserProfile(
  actor: Actor,
): Promise<UserProfile | null> {
  if (!actor) return null;
  try {
    return await actor.getCallerUserProfile();
  } catch {
    return null;
  }
}

export async function saveUserProfile(
  actor: Actor,
  profile: UserProfile,
): Promise<boolean> {
  if (!actor) return false;
  try {
    await actor.saveCallerUserProfile(profile);
    return true;
  } catch {
    return false;
  }
}

// ─── Editor Settings ───────────────────────────────────────────────────────

export async function fetchEditorSettings(
  actor: Actor,
): Promise<string | null> {
  if (!actor) return null;
  try {
    return await actor.getEditorSettings();
  } catch {
    return null;
  }
}

export async function saveEditorSettings(
  actor: Actor,
  settings: string,
): Promise<boolean> {
  if (!actor) return false;
  try {
    await actor.saveEditorSettings(settings);
    return true;
  } catch {
    return false;
  }
}

// ─── Scratch Pad ───────────────────────────────────────────────────────────

export async function fetchScratchPad(actor: Actor): Promise<string | null> {
  if (!actor) return null;
  try {
    return await actor.getScratchPad();
  } catch {
    return null;
  }
}

export async function saveScratchPad(
  actor: Actor,
  text: string,
): Promise<boolean> {
  if (!actor) return false;
  try {
    await actor.saveScratchPad(text);
    return true;
  } catch {
    return false;
  }
}

// ─── Snippets ──────────────────────────────────────────────────────────────

export async function fetchAllSnippets(actor: Actor): Promise<CodeSnippet[]> {
  if (!actor) return [];
  try {
    return await actor.getAllSnippets();
  } catch {
    return [];
  }
}

export async function addCodeSnippet(
  actor: Actor,
  snippet: CodeSnippet,
): Promise<boolean> {
  if (!actor) return false;
  try {
    await actor.addCodeSnippet(snippet);
    return true;
  } catch {
    return false;
  }
}

export async function deleteSnippet(
  actor: Actor,
  name: string,
): Promise<boolean> {
  if (!actor) return false;
  try {
    await actor.deleteSnippet(name);
    return true;
  } catch {
    return false;
  }
}

// ─── Cloud Files ───────────────────────────────────────────────────────────

export async function fetchAllFiles(actor: Actor): Promise<CodeFile[]> {
  if (!actor) return [];
  try {
    return await actor.getAllFiles();
  } catch {
    return [];
  }
}

export async function saveCloudFile(
  actor: Actor,
  file: CodeFile,
): Promise<boolean> {
  if (!actor) return false;
  try {
    await actor.saveFile(file);
    return true;
  } catch {
    return false;
  }
}

export async function fetchCloudFile(
  actor: Actor,
  path: string,
): Promise<CodeFile | null> {
  if (!actor) return null;
  try {
    return await actor.getFile(path);
  } catch {
    return null;
  }
}

export async function deleteCloudFile(
  actor: Actor,
  path: string,
): Promise<boolean> {
  if (!actor) return false;
  try {
    await actor.deleteFile(path);
    return true;
  } catch {
    return false;
  }
}

// ─── Bookmarks ─────────────────────────────────────────────────────────────

export async function fetchAllBookmarks(actor: Actor): Promise<Bookmark[]> {
  if (!actor) return [];
  try {
    return await actor.getAllBookmarks();
  } catch {
    return [];
  }
}

export async function addBookmark(
  actor: Actor,
  bookmark: Bookmark,
): Promise<boolean> {
  if (!actor) return false;
  try {
    await actor.addBookmark(bookmark);
    return true;
  } catch {
    return false;
  }
}

export async function deleteBookmark(
  actor: Actor,
  timestamp: bigint,
): Promise<boolean> {
  if (!actor) return false;
  try {
    await actor.deleteBookmark(timestamp);
    return true;
  } catch {
    return false;
  }
}

// ─── Collaboration ─────────────────────────────────────────────────────────

export async function joinCollabSession(
  actor: Actor,
  sessionId: string,
): Promise<import("../backend.d").SessionResult | null> {
  if (!actor) return null;
  try {
    return await actor.joinSession(sessionId);
  } catch {
    return null;
  }
}

export async function leaveCollabSession(
  actor: Actor,
  sessionId: string,
): Promise<boolean> {
  if (!actor) return false;
  try {
    return await actor.leaveSession(sessionId);
  } catch {
    return false;
  }
}

export async function fetchOnlineUsers(
  actor: Actor,
  sessionId: string,
): Promise<import("../backend.d").UserPresence[]> {
  if (!actor) return [];
  try {
    return await actor.getOnlineUsers(sessionId);
  } catch {
    return [];
  }
}

export async function sendPresenceHeartbeat(
  actor: Actor,
  sessionId: string,
): Promise<boolean> {
  if (!actor) return false;
  try {
    return await actor.updatePresenceHeartbeat(sessionId);
  } catch {
    return false;
  }
}

export async function fetchSessionEvents(
  actor: Actor,
  sessionId: string,
  limit: bigint,
): Promise<import("../backend.d").CollabEvent[]> {
  if (!actor) return [];
  try {
    return await actor.getSessionEvents(sessionId, limit);
  } catch {
    return [];
  }
}

// ─── Session History ────────────────────────────────────────────────────────

export async function fetchSessionHistory(actor: Actor): Promise<string[]> {
  if (!actor) return [];
  try {
    return await actor.getSessionHistory();
  } catch {
    return [];
  }
}

export async function addToSessionHistory(
  actor: Actor,
  filePath: string,
): Promise<void> {
  if (!actor) return;
  try {
    await actor.addToSessionHistory(filePath);
  } catch {
    // best-effort
  }
}

export async function clearSessionHistory(actor: Actor): Promise<boolean> {
  if (!actor) return false;
  try {
    await actor.clearSessionHistory();
    return true;
  } catch {
    return false;
  }
}

// ─── CI/CD Pipeline ────────────────────────────────────────────────────────

export async function createPipelineRun(
  actor: Actor,
  projectId: string,
  commitHash: string,
  branch: string,
  triggeredBy: string,
): Promise<PipelineRun | null> {
  if (!actor) return null;
  try {
    return await actor.createPipelineRun(
      projectId,
      commitHash,
      branch,
      triggeredBy,
    );
  } catch {
    return null;
  }
}

export async function updatePipelineStage(
  actor: Actor,
  runId: string,
  stageName: string,
  status: PipelineStageStatus,
  duration: bigint | null,
  logs: string,
): Promise<void> {
  if (!actor) return;
  try {
    // PipelineStageStatus shares the same runtime string values as PipelineRunStatus
    type StageStatusParam = Parameters<
      backendInterface["updatePipelineStage"]
    >[2];
    await actor.updatePipelineStage(
      runId,
      stageName,
      status as unknown as StageStatusParam,
      duration,
      logs,
    );
  } catch {
    // best-effort
  }
}

export async function completePipelineRun(
  actor: Actor,
  runId: string,
  overallStatus: "passed" | "failed",
): Promise<void> {
  if (!actor) return;
  try {
    const status =
      overallStatus === "passed"
        ? PipelineRunStatus.passed
        : PipelineRunStatus.failed;
    await actor.completePipelineRun(runId, status);
  } catch {
    // best-effort
  }
}

export async function recordDeployment(
  actor: Actor,
  projectId: string,
  environment: string,
  pipelineRunId: string,
  version: string,
): Promise<DeploymentRecord | null> {
  if (!actor) return null;
  try {
    return await actor.recordDeployment(
      projectId,
      environment,
      pipelineRunId,
      version,
    );
  } catch {
    return null;
  }
}

export async function fetchPipelineRuns(
  actor: Actor,
  projectId: string,
  limit: number,
): Promise<PipelineRun[]> {
  if (!actor) return [];
  try {
    return await actor.getPipelineRuns(projectId, BigInt(limit));
  } catch {
    return [];
  }
}

export async function fetchDeploymentHistory(
  actor: Actor,
  projectId: string,
  limit: number,
): Promise<DeploymentRecord[]> {
  if (!actor) return [];
  try {
    return await actor.getDeploymentHistory(projectId, BigInt(limit));
  } catch {
    return [];
  }
}

export async function fetchPipelineRunDetail(
  actor: Actor,
  runId: string,
): Promise<PipelineRun | null> {
  if (!actor) return null;
  try {
    return await actor.getPipelineRunDetail(runId);
  } catch {
    return null;
  }
}

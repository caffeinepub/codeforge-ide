/**
 * Backend service wrapper — thin, safe helpers around the actor.
 * All calls are try/catch guarded and return null/empty on failure.
 */
import type {
  Bookmark,
  CodeFile,
  CodeSnippet,
  UserProfile,
  backendInterface,
} from "../backend.d.ts";

type Actor = backendInterface | null;

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

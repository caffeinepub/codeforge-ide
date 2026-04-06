# CodeVeda Phase 6 - Backend Persistence + Next Level Features

## Current State
CodeVeda is a VS Code-like browser IDE with:
- Monaco Editor, multi-tab editing, split editor, 8 themes
- AI Assistant panel (chat-based, local only)
- File Explorer with local file system access (File System Access API)
- Git panel, GitHub integration (PAT-based)
- Extensions Marketplace, Snippets Library (local state only)
- Terminal (xterm.js + WebContainers fallback)
- User Profile Panel (persisted in localStorage only)
- Admin Dashboard (role-based, local state)
- Auth store (localStorage persist, no real backend auth)
- Backend: only has authorization mixin + blob-storage mixin, no custom data
- All data (files, snippets, settings, profile) stored in-memory or localStorage

## Requested Changes (Diff)

### Add
- **Backend-persisted file storage**: Save/load user files (content + metadata) to/from the ICP backend canister using blob-storage
- **Backend-persisted user profile**: displayName, bio, avatarColor, preferredLanguage stored in backend
- **Backend-persisted snippets**: Code snippets saved to backend per user
- **Backend-persisted settings**: Theme, font size, tab size, editor preferences persisted in backend
- **Backend-persisted notes/scratch pad**: A quick scratch pad panel that saves notes to backend
- **Bookmarks panel**: Bookmark files/lines with annotations, stored in backend
- **Session history**: Track recently opened files per user, stored in backend
- **Collaboration status**: Simple presence/activity broadcast (who's online, what file)
- **New activity: Bookmarks icon** in activity bar
- **New panel: Notes/Scratch Pad** in activity bar
- **Code Formatter integration**: Format on save option using backend-stored preferences
- **Project metadata persistence**: Project name, description, last opened stored in backend

### Modify
- Backend: Extend main.mo with custom data storage APIs (user profile, files, snippets, settings, notes, bookmarks, session history)
- Frontend authStore: Wire to real backend `getCallerUserRole()` and `assignCallerUserRole()`
- Frontend userProfileStore: Add backend sync (load on login, save on update)
- Frontend snippetsStore: Add backend sync (load on open, save on add/edit/delete)
- Frontend settingsStore: Add backend sync (save on change, load on login)
- Activity bar: Add Bookmarks and Notes icons
- Sidebar: Add Bookmarks panel and Notes/Scratch Pad panel
- Status bar: Show "Cloud Saved" indicator when data is synced to backend

### Remove
- Nothing removed; all existing functionality preserved

## Implementation Plan
1. Generate Motoko backend with:
   - User profile CRUD (by principal)
   - File metadata + content storage (create, read, update, delete, list)
   - Snippet CRUD (by principal)
   - Settings storage (by principal, JSON blob)
   - Notes/scratch pad storage (by principal)
   - Bookmark storage (by principal): file path + line + annotation
   - Session history (by principal): list of recently opened paths
2. Frontend: Create `backendSyncService.ts` that wraps all backend calls
3. Wire userProfileStore to backend (save/load)
4. Wire snippetsStore to backend (save/load)
5. Wire settingsStore to backend (save/load)
6. Add `NotesPanel` component (scratch pad with backend persistence)
7. Add `BookmarksPanel` component with backend persistence
8. Add Bookmarks + Notes icons to ActivityBar
9. Add Sidebar routing for bookmarks and notes panels
10. Add "Cloud Saved" badge to StatusBar
11. Add file save-to-backend action in editor (saves current file content to canister)
12. Add session history tracking (recent files synced to backend)

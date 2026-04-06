# CodeVeda — Phase 8: Advanced GitHub + AI Chat + Mobile-First Overhaul

## Current State
- Monaco Editor IDE with multi-tab editing, split panes, file explorer, themes
- ActivityBar with 16 panels including GitHub (GitFork), AI Assistant (Bot), Terminal, Source Control
- GitHubPanel: PAT-based auth, repo browser, branch switcher, PR list with status badges, push/pull/fetch ops
- AIAssistantPanel: Chat sidebar with quick-action chips (Explain/Fix/Refactor/Generate/ICP), code blocks with copy buttons, persist via zustand
- MobileBottomNav: Only 4 tabs (Explorer, Search, AI, Settings)
- MobileHeader: Shows "CodeForge" (old name), basic hamburger + new file + command palette
- StatusBar, Breadcrumbs, EditorToolbar all working
- Backend: ICP canister with authorization, blob-storage for file/profile/settings persistence

## Requested Changes (Diff)

### Add
- **AI Chat Redesign**: Full ChatGPT-style conversational sidebar with:
  - Conversation threads/history (multiple named sessions, switchable)
  - File context badge — active file name auto-attached to every message
  - "Insert into editor" button on AI code responses
  - Conversation export (copy all as markdown)
  - AI model selector display (GPT-4o / Claude / CodeLlama labels, cosmetic)
  - Smarter canned responses for: test generation, docs generation, architecture, code review
  - Typing animation with streamed character effect
  - Keyboard shortcut: Ctrl+Shift+A to toggle AI panel

- **GitHub Panel Upgrades**:
  - Commit history timeline (visual list with SHA, message, author, time-ago)
  - File diff viewer embedded inside panel (side-by-side or inline toggle)
  - AI-powered PR review button (generates AI review comment)
  - Commit message AI generator (button in commit area)
  - Issues tab (list with open/closed filter, label badges)
  - Commit staging area (checkboxes per file, commit message input, commit button)

- **Mobile-First Overhaul**:
  - MobileBottomNav expanded to 5 tabs: Explorer, GitHub, AI, Terminal, Settings
  - MobileHeader renamed to CodeVeda (not CodeForge)
  - Floating AI FAB button (bottom-right corner) on all mobile screens
  - Slide-in drawer for GitHub panel on mobile (full-height)
  - Mobile-optimized AI chat (full-screen overlay on small screens)
  - Swipe gestures hint overlays
  - Mobile toolbar row below editor for: Undo, Redo, Tab, {}, [], () buttons (touch keyboard helpers)

- **Editor Enhancements**:
  - Go to line (Ctrl+G) input in command palette
  - Code action quick-fix tooltip (simulated lightbulb on errors)
  - Multi-file find & replace (already has single-file, extend to multi)

### Modify
- AIAssistantPanel: Full redesign to ChatGPT-style with conversation history, file context, insert-to-editor
- GitHubPanel: Add tabs (Overview, Commits, Issues, Diff) with proper section navigation
- MobileBottomNav: Add GitHub and Terminal tabs, 5 total tabs
- MobileHeader: Fix branding from "CodeForge" to "CodeVeda"
- ActivityBar: No structural changes needed
- App.tsx: Wire new mobile tabs (github, terminal) to existing panels

### Remove
- Nothing removed — all existing features preserved

## Implementation Plan
1. **Redesign AIAssistantPanel** — conversation threads, file context, insert-to-editor, streaming animation, smarter responses for test/docs/arch/review
2. **Upgrade GitHubPanel** — add Commits tab with history timeline, Issues tab, Diff viewer, AI commit message generator, AI PR review, staging area
3. **Overhaul MobileBottomNav** — 5 tabs: Explorer, GitHub, AI, Terminal, Settings
4. **Fix MobileHeader** — update CodeForge → CodeVeda branding
5. **Add mobile floating AI FAB** — bottom-right overlay button for quick AI access on mobile
6. **Add mobile editor touch toolbar** — row of touch-friendly code insertion buttons below Monaco on mobile
7. **Wire App.tsx** — connect new mobile tabs to existing GitHubPanel and InteractiveTerminal
8. **Add aiStore conversation threads** — extend aiStore to support named sessions/history

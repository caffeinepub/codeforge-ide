# CodeVeda

## Current State
CodeVeda is a full-stack cloud IDE (v13+) built with React + TypeScript frontend and Motoko ICP backend. It features:
- Monaco Editor with multi-tab, split editor, breadcrumbs, themes (8 total)
- File explorer with real File System Access API
- AI Assistant panel: ChatGPT-style multi-session threads, voice input, streaming responses, insert-to-editor, modes (unit test, JSDoc, code review, architecture)
- GitHub Panel: overview, commits timeline, issues, diff viewer, AI PR review
- Git Panel: staging, commit, push
- Collaboration Panel: live sessions (simulated), invite links, colored avatars, activity feed
- Social Coding Panel: discover, follow/unfollow, project sharing
- CI/CD Panel: visual pipeline, deployment history, config editor
- Version Control UI: visual commit graph, branching, stashing, cherry-pick
- Extensions Marketplace, Snippets Library, Live Preview
- Terminal: xterm.js + WebContainers shell emulator with 20+ commands
- Backend persistence: ICP canisters for profile, snippets, settings, bookmarks, notes, files
- Settings Panel: editor, appearance, privacy, notifications, keys
- User Profile Panel: overview, GitHub repos, social follow/unfollow, prefs, activity
- Admin Dashboard with Shield icon
- Status bar: Pomodoro timer, font controls, file stats, multi-cursor hint
- Editor toolbar: word wrap, minimap, sticky scroll, bracket colorization
- Tab context menu: pin/unpin, color tags, close options
- Diff Viewer, Zen Mode, File Templates, Find in Files with Replace
- Mobile-first: bottom nav, slide-in drawers, touch toolbar, compact header

## Requested Changes (Diff)

### Add
15 IntelliJ IDEA-inspired features on top of existing functionality:

1. **Project-wide Search & Replace** -- Advanced find/replace dialog with regex, case-sensitive, whole word, scope (file/project/directory), match count, replace with preview
2. **Code Structure Panel** -- Outline view showing functions, classes, methods, variables for current file (like Structure tool window). Click to navigate to symbol.
3. **Database Tool Window** -- Mock database panel with tables, query editor, results grid (simulated), schema view
4. **Run Configurations** -- Run/Debug configuration dialog: define run configs (npm run dev, npm build, custom scripts), save/load configs, run with green play button
5. **Scratch Files** -- Create temporary scratch files (.js, .ts, .txt, .md) that live outside the project but persist in session, with a dedicated scratch pad in the file explorer
6. **Live Templates (Code Snippets++)**  -- Abbreviation-based live templates: type `sfc` + Tab → expands to React SFC, `useEffect` + Tab → full hook, etc. Customizable, with a management dialog
7. **Local History** -- Per-file local history: shows a timeline of all edits (every save/edit creates a snapshot), allows diff + restore of any version
8. **Code Inspections Panel** -- Static analysis panel showing warnings, errors, and info hints for the current file (simulated with pattern matching), with severity levels and quick-fix suggestions
9. **Bookmarks with Mnemonics** -- Enhanced bookmark system: assign letter/number mnemonics to bookmarks (e.g., bookmark 1, 2, A, B), jump to bookmark via shortcut, manage in a Bookmarks tool window
10. **Split Terminal** -- Multiple terminal tabs + ability to split terminal horizontally/vertically, each with its own shell session
11. **Presentation Mode** -- Toggle presentation mode: increases font size to 24pt, hides UI chrome, shows large readable code for presentations/demos
12. **Code Coverage Visualization** -- Inline code coverage gutter: green/red/gray line markers showing covered/uncovered/not-applicable lines (simulated data)
13. **TODO Tool Window** -- Enhanced TODO/FIXME tracker that scans all open files for TODO/FIXME/HACK comments, groups by file, clickable to navigate
14. **Smart Clipboard / Clipboard History** -- Clipboard history manager: stores last 10 copied items, paste from history via Ctrl+Shift+V panel, clear individual items
15. **Variable/Method Rename Refactoring** -- Rename refactoring: double-click a symbol → inline rename input that highlights all occurrences in the file, confirms with Enter

### Modify
- Activity bar: add new icons for Structure panel, Database, Run Configs, Local History, Code Inspections
- Status bar: add coverage indicator, presentation mode indicator
- Command palette: include new panel commands
- Settings: add Inspections tab and Live Templates management

### Remove
- Nothing removed

## Implementation Plan
1. Add 5 new activity bar panels: Code Structure, Database, Run Configurations, Local History, Code Inspections
2. Implement Code Structure Panel with symbol outline from Monaco's document symbols API
3. Implement Database Tool Window with mock tables/query UI
4. Implement Run Configurations dialog with save/run functionality
5. Implement Local History panel with per-file snapshot timeline and diff view
6. Implement Code Inspections panel with pattern-based warnings/errors
7. Implement Live Templates system with abbreviation expansion in editor
8. Implement Scratch Files feature with dedicated section in file explorer
9. Implement Clipboard History manager (Ctrl+Shift+V)
10. Implement TODO Tool Window scanning open files
11. Implement Enhanced Bookmarks with mnemonics
12. Implement Split Terminal with multiple tabs
13. Implement Presentation Mode toggle
14. Implement Code Coverage gutter visualization
15. Implement Variable Rename Refactoring overlay
16. Wire all new panels to command palette
17. Update activity bar with new icons
18. Validate and build

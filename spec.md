# CodeForge IDE

## Current State
New project. No application files exist yet. Scaffolded empty Motoko actor and frontend bindings are present but contain no logic.

## Requested Changes (Diff)

### Add
- Full VS Code-like IDE frontend in React + TypeScript + Tailwind CSS
- Monaco Editor (@monaco-editor/react) as the core editing engine
- Zustand stores: editorStore, themeStore, filesystemStore, settingsStore, notificationStore
- Framer Motion for panel animations and toast notifications
- Activity Bar (far left, ~48px) with Files/Search/Extensions/Settings icons
- File Explorer sidebar with tree view, context menu (rename/delete), new file/folder buttons
- Search sidebar panel (search across open files)
- Multi-tab editor with drag reorder, close button, unsaved dot indicator, Ctrl+W
- Breadcrumb navigation above editor
- Split editor (horizontal/vertical, 2 panes)
- Command Palette (Ctrl+Shift+P) with fuzzy search and keyboard navigation
- Quick Open (Ctrl+P) for fuzzy file open
- Theme system: dark (VS Code Dark+), light (VS Code Light+), high-contrast dark
- Settings panel (font size, font family, tab size, word wrap, minimap)
- Status bar: language, line/col, encoding, indentation, git branch (mock), errors/warnings
- Bottom panel: Problems/Output/Terminal tabs (mock data)
- Welcome tab (shown on startup)
- Toast notification system with Framer Motion slide-in
- Mock file system pre-populated with realistic project structure (15+ files with real code)
- Extension/plugin hook points (useExtensions, ExtensionRegistry - empty but wired)
- AI Assistant placeholder in right panel (collapsed by default)
- Resizable panels (drag handle between sidebar and editor)
- Custom scrollbars, monospace editor font, clean sans-serif UI font
- All keyboard shortcuts (Ctrl+S, Ctrl+B, Ctrl+`, Ctrl+\, Ctrl+P, Ctrl+Shift+P, Ctrl+W)
- Persistent settings and theme in localStorage

### Modify
- Motoko backend: minimal pass-through actor (IDE is frontend-only, no persistent backend needed for Phase 1)

### Remove
- Nothing to remove

## Implementation Plan
1. Set up Zustand stores (editor, filesystem, theme, settings, notifications)
2. Create mock file system data with realistic code content for all files
3. Build layout shell: ActivityBar + Sidebar + Editor + BottomPanel + StatusBar
4. Implement file explorer tree with context menu
5. Implement search sidebar
6. Implement multi-tab editor with Monaco
7. Implement split editor (2 panes)
8. Implement command palette and quick open
9. Implement theme system with CSS variables
10. Implement settings panel
11. Implement bottom panel (Problems/Output/Terminal)
12. Implement status bar
13. Implement breadcrumbs
14. Implement welcome tab
15. Implement toast notifications
16. Wire all keyboard shortcuts
17. Add resizable panel drag handles
18. Extension/AI panel placeholders

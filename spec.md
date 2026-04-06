# CodeVeda Phase 7 - 15+ New Features

## Current State
CodeVeda is a full-featured web-based IDE with:
- Monaco Editor with multi-tab editing, split view
- Activity bar with: Explorer, Search, Git, GitHub, Extensions, Snippets, Preview, AI Assistant, Admin Dashboard, Profile, Code Intelligence, Scratch Pad, Bookmarks, Recent Files, Cloud Files
- Bottom panel with Terminal (xterm.js + WebContainers), Output, Problems, Performance tabs
- Themes: VS Dark, VS Light, Monokai, Solarized Dark, Dracula, Nord, One Dark Pro, High Contrast (8 total)
- Menu bar with full menus wired to actions
- Command palette with glassmorphism
- Status bar with git branch, language, vim mode toggle, LIVE badge, cloud sync status
- ICP backend with user profiles, files, snippets, bookmarks, scratch pad, session history, projects
- Mobile responsive layout
- Keyboard shortcut overlay (Shift+?), Focus Mode (Ctrl+Shift+F11)
- Real file system API support (open folder/file, save, save as)
- GitHub integration panel

## Requested Changes (Diff)

### Add
1. **Minimap panel** - Code minimap toggle in editor toolbar (Monaco already supports this - just add a toggle button)
2. **Breadcrumb navigation** - File path breadcrumbs above the editor tabs showing current folder > file > symbol path
3. **Multi-cursor editing hints** - Show multi-cursor tips in the status bar (Click + Alt+Click for multi-cursor)
4. **Code Diff Viewer** - New panel in bottom: "Diff" tab to compare two files side by side (Monaco DiffEditor)
5. **Pomodoro Timer** - Focus/productivity timer widget in the status bar with start/pause/reset
6. **Color Picker** - Inline color picker that appears when clicking a hex/rgb color value in code
7. **Word Wrap Toggle** - Toggle word wrap button in editor toolbar / View menu
8. **Indent Guides toggle** - Toggle indentation guides in View menu
9. **Zen Mode** - Similar to Focus Mode but hides everything except the editor (even tabs + menu bar)
10. **Find in Files** - Improved search panel in the sidebar with replace functionality
11. **File Templates** - New File menu option to create files from templates (HTML, CSS, JS, TS, React, etc.)
12. **Editor Font Size Control** - +/- buttons in the status bar or settings to adjust editor font size live
13. **Live Statistics** - Word count, char count, line count displayed in the status bar for the active file
14. **Pinned Tabs** - Right-click tab to pin it (stays at the left, can't be accidentally closed)
15. **Tab Groups / Colors** - Right-click tab to assign a color tag for visual grouping
16. **Bracket Pair Colorization** - Toggle in settings to enable/disable bracket pair colorization
17. **Sticky Scroll** - Toggle sticky scroll (scroll and class/function headers stick at top of editor)

### Modify
- StatusBar: add live file stats (word count, lines, chars), Pomodoro timer widget, font size controls
- BottomPanel: add Diff tab with Monaco DiffEditor
- MenuBar View menu: add Word Wrap, Indent Guides, Zen Mode, Sticky Scroll toggles
- EditorStore: add fontSize state, wordWrap state, pinnedTabs state, tabColors state, zenMode state
- SplitEditor / editor toolbar: add minimap toggle, word wrap toggle, font size buttons
- Sidebar Search panel: add Replace field for Find in Files with replace action
- Tab bar: support pinned tabs (visual pin indicator), tab color tags, right-click context menu

### Remove
- Nothing removed

## Implementation Plan
1. Update `editorStore.ts` - add fontSize, wordWrap, minimapEnabled, pinnedTabs, tabColors, zenMode, bracketPairColorization, stickyScroll state
2. Update `SplitEditor.tsx` / editor area - breadcrumbs bar, toolbar with minimap/wordwrap/fontzize toggles, Zen mode overlay
3. Update `StatusBar.tsx` - add file stats section, pomodoro timer widget, font size +/- buttons
4. Update `BottomPanel.tsx` - add Diff tab with Monaco DiffEditor
5. Update `MenuBar.tsx` View menu - add new toggles
6. Update `Sidebar.tsx` Search panel - add replace functionality
7. Update tab bar in `SplitEditor.tsx` - pinned tabs, color tags, right-click context menu
8. Add `FileTemplatesDialog.tsx` - new file from template dialog
9. Add `PomodoroTimer.tsx` - standalone pomodoro timer component used in status bar
10. Wire everything together in App.tsx where needed

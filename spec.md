# CodeForge IDE — Mobile-Friendly Rebuild

## Current State
CodeForge IDE is a full VS Code-like web IDE built with React + Monaco Editor. It has:
- Fixed full-viewport layout (100vw/100vh), desktop-only
- Activity bar (48px wide, left side) with icons for Explorer, Search, Extensions, AI, Settings
- Resizable sidebar (280px default) for file explorer and search
- Menu bar (30px tall) with dropdown menus (File, Edit, View, etc.)
- Multi-tab Monaco Editor (split pane support)
- Bottom panel with Problems/Output/Terminal/Debug tabs (resizable)
- Status bar (24px) at the bottom
- Three themes: dark, light, high-contrast
- All layout dimensions are hardcoded pixels, not responsive
- No mobile navigation pattern (hamburger menu, bottom nav, drawer, etc.)

## Requested Changes (Diff)

### Add
- Mobile bottom navigation bar (replacing activity bar on small screens) with icon tabs for: Explorer, Search, AI, Settings
- Mobile drawer/sheet for sidebar (file explorer and search) on small screens — slides up from bottom or from left
- Mobile-aware MenuBar: collapse all menu items into a hamburger icon on small screens, show a full-screen dropdown sheet
- Responsive layout breakpoints: < 768px is mobile mode, >= 768px is desktop mode
- Touch-friendly tap targets (minimum 44px)
- Mobile header bar: shows only app name + hamburger + action buttons (hide full menu bar on mobile)
- Mobile-friendly bottom panel: collapsible with a drag handle, smaller font, tabs scroll horizontally
- useIsMobile hook to drive layout switching
- Viewport meta tag already present (verify)
- Monaco Editor on mobile: disable split pane mode, set fontSize to 14, disable minimap, enable wordWrap

### Modify
- App.tsx: add responsive layout switching — desktop layout remains unchanged, mobile layout uses bottom nav + drawer sidebar
- ActivityBar.tsx: hide on mobile (replaced by bottom nav)
- Sidebar.tsx: on mobile, render inside a Sheet/Drawer that opens on demand
- MenuBar.tsx: on mobile collapse to a compact header with hamburger + app name
- StatusBar.tsx: on mobile show only essential info (language + branch), hide verbose items
- EditorPane.tsx: pass mobile-aware options to Monaco (disable minimap, enable wordWrap, larger fontSize on mobile)
- index.html: ensure viewport meta tag has `width=device-width, initial-scale=1`
- BottomPanel.tsx: add horizontal scroll on tabs, ensure touch-friendly resize handle
- WelcomeTab.tsx: stack grid to single column on mobile

### Remove
- Nothing removed — desktop layout is fully preserved

## Implementation Plan
1. Add `useIsMobile` hook (or use the existing `use-mobile.tsx` hook at src/frontend/src/hooks/use-mobile.tsx)
2. Update `index.html` viewport meta tag
3. Create `MobileBottomNav` component for mobile navigation
4. Update `App.tsx` to render different layouts for mobile vs desktop
5. Update `MenuBar.tsx` for mobile hamburger collapse
6. Update `ActivityBar.tsx` to hide on mobile
7. Update `Sidebar.tsx` to use Sheet/Drawer on mobile
8. Update `StatusBar.tsx` for mobile-compact view
9. Update `EditorPane.tsx` for mobile Monaco options
10. Update `WelcomeTab.tsx` for single-column mobile grid
11. Update `BottomPanel.tsx` for touch-friendly mobile layout

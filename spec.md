# CodeVeda — Phase 10: Profile & Settings Overhaul + Social/GitHub Integration

## Current State

- `WelcomeTab.tsx` has a footer with the line: `© {year}. Built with ❤ using caffeine.ai` (lines 405–414)
- `UserProfilePanel.tsx` has 3 tabs (overview, preferences, activity). Overview: name, bio, avatar color, save. Preferences: language, font size, theme, shortcuts. Activity: log list.
- `SettingsPanel.tsx` has 2 tabs (editor, keybindings). Editor: themes, font size/family, tab size, toggles (wordWrap, minimap, lineNumbers, fontLigatures). Keybindings: searchable shortcut list.
- `SocialCodingPanel.tsx` has Discover / Following / My Projects tabs with follow/unfollow logic and a share-project form with public/private visibility.
- No profile picture / avatar image upload support.
- No GitHub projects section in user profile.
- No dedicated social links section in profile.
- Settings panel has only 2 tabs and lacks many advanced options.

## Requested Changes (Diff)

### Add

**WelcomeTab:**
- Remove the entire `Built with ❤ using caffeine.ai` paragraph (keep the CodeVeda version line)

**UserProfilePanel — expanded to 5 tabs:**
1. **Overview** (existing + enhancements):
   - Profile picture upload: circular avatar that shows uploaded image OR initials fallback. Click to open file picker (accept image/*). Preview immediately, store as data-URL in state.
   - Cover/banner color picker (6 color options) — decorative gradient header band above the avatar
   - Username / handle field (e.g. @aryan_dev) — separate from display name
   - Location field (text input)
   - Website URL field
   - Social links section: GitHub URL, Twitter/X URL, LinkedIn URL — each with icon + input
   - Save Profile button persists all these fields

2. **GitHub Projects tab** (new):
   - GitHub username input (pre-filled if set in overview)
   - "Connect GitHub" button that fetches repos via GitHub public API (`https://api.github.com/users/{username}/repos`)
   - List of repos: name, description, language dot, stars, forks, visibility badge (Public/Private via lock icon)
   - Toggle visibility: user can mark any repo as "featured" (pinned to profile)
   - Empty state if no GitHub username set

3. **Followers/Following tab** (new):
   - Two sub-tabs: Followers | Following
   - List of mock follower/following developer cards (same style as SocialCodingPanel)
   - Follow/Unfollow button on each card
   - Follower count + Following count summary at top

4. **Preferences** (existing, keep as-is)

5. **Activity** (existing, keep as-is)

**SettingsPanel — expanded from 2 tabs to 5 tabs:**
1. **Editor** (existing — keep all current options)
2. **Appearance** (new tab):
   - UI Density: Compact / Default / Comfortable (3-way toggle)
   - Sidebar position: Left / Right toggle
   - Activity bar labels: Show/Hide toggle
   - Editor cursor style: Block / Line / Underline selector
   - Smooth scrolling: toggle
   - Animations: toggle (reduce motion)
   - Custom accent color: 6 preset color swatches + hex input
3. **Privacy & Security** (new tab):
   - Profile visibility: Public / Private toggle
   - Show online status: toggle
   - Show activity log to followers: toggle
   - Two-factor auth notice (UI only, informational badge)
   - Data export button (downloads JSON of profile as a blob)
   - Danger zone: Delete account button (shows confirmation modal)
4. **Notifications** (new tab):
   - Email notifications toggle (disabled — email not available, shows tooltip)
   - Push notifications toggle
   - Notify on: follow (toggle), mention (toggle), PR review (toggle), CI/CD status (toggle)
   - Notification sound: toggle
5. **Keybindings** (existing — keep as-is)

### Modify

- `UserProfilePanel`: replace 3-tab layout with 5-tab layout (Overview, GitHub Projects, Followers/Following, Preferences, Activity). The panel width can expand slightly to `min(100vw, 540px)` to accommodate more content.
- `SettingsPanel`: replace 2-tab layout with 5-tab layout. Keep existing editor and keybindings tabs. Add Appearance, Privacy & Security, Notifications tabs.
- `SocialCodingPanel`: no changes needed here (profile follow flow already exists); the new Followers/Following tab in UserProfilePanel mirrors this.

### Remove

- The `Built with ❤ using caffeine.ai` paragraph block from `WelcomeTab.tsx` (lines ~405–414). Keep the CodeVeda version line above it.

## Implementation Plan

1. **WelcomeTab.tsx** — remove the caffeine.ai attribution paragraph (3 lines of JSX). Keep `CodeVeda IDE v4.0 — Built with React 19 + Monaco Editor + ICP`.
2. **UserProfilePanel.tsx** — full rewrite of the tab list and tab content:
   - Change `activeTab` type to include `'github' | 'social'`
   - Add state: `profilePicUrl`, `username`, `location`, `websiteUrl`, `githubUrl`, `twitterUrl`, `linkedinUrl`, `githubUsername`, `githubRepos`, `isFetchingRepos`
   - Overview tab: add picture upload (file input, preview), handle/username field, location, website, social links
   - GitHub Projects tab: input + fetch button + repo list with Public/Private badges
   - Followers/Following tab: mock data (reuse DEVELOPERS from SocialCodingPanel style), sub-tab switcher, follow/unfollow
   - Preserve Preferences and Activity tabs unchanged
3. **SettingsPanel.tsx** — extend tab system:
   - Change `activeTab` type to `'editor' | 'appearance' | 'privacy' | 'notifications' | 'keybindings'`
   - Add state for all new settings fields
   - Add Appearance, Privacy & Security, Notifications tab content panels
   - Preserve editor and keybindings tabs unchanged
4. No backend changes needed — all new fields are UI state only (can be wired to backend in a future phase).

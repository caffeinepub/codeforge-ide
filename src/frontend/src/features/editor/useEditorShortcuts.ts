import { useEffect } from "react";
import { useEditorStore } from "../../stores/editorStore";
import { useNotificationStore } from "../../stores/notificationStore";

export function useEditorShortcuts() {
  const {
    activeFileId,
    closeFile,
    markFileDirty,
    setShowCommandPalette,
    setShowQuickOpen,
    setShowSettings,
    splitMode,
    setSplitMode,
  } = useEditorStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      // Ctrl+Shift+P -> Command Palette
      if (ctrl && shift && e.key === "P") {
        e.preventDefault();
        setShowCommandPalette(true);
        return;
      }

      // Ctrl+P -> Quick Open
      if (ctrl && !shift && e.key === "p") {
        e.preventDefault();
        setShowQuickOpen(true);
        return;
      }

      // Ctrl+W -> Close tab
      if (ctrl && e.key === "w") {
        e.preventDefault();
        if (activeFileId) closeFile(activeFileId);
        return;
      }

      // Ctrl+S -> Save
      if (ctrl && e.key === "s") {
        e.preventDefault();
        if (activeFileId) {
          markFileDirty(activeFileId, false);
          addNotification({ message: "File saved", type: "success" });
        }
        return;
      }

      // Ctrl+\ -> Split editor
      if (ctrl && e.key === "\\") {
        e.preventDefault();
        setSplitMode(!splitMode);
        return;
      }

      // Ctrl+, -> Settings
      if (ctrl && e.key === ",") {
        e.preventDefault();
        setShowSettings(true);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeFileId,
    closeFile,
    markFileDirty,
    setShowCommandPalette,
    setShowQuickOpen,
    setShowSettings,
    splitMode,
    setSplitMode,
    addNotification,
  ]);
}

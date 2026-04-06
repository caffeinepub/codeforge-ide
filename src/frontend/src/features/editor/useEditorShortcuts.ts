import { useEffect } from "react";
import { toast } from "sonner";
import { useActor } from "../../hooks/useActor";
import { saveCloudFile } from "../../services/backendService";
import { useAuthStore } from "../../stores/authStore";
import { useEditorStore } from "../../stores/editorStore";
import { useNotificationStore } from "../../stores/notificationStore";

export function useEditorShortcuts() {
  const {
    activeFileId,
    openFiles,
    closeFile,
    markFileDirty,
    setShowCommandPalette,
    setShowQuickOpen,
    setShowSettings,
    splitMode,
    setSplitMode,
  } = useEditorStore();
  const { addNotification } = useNotificationStore();
  const { actor } = useActor();
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      // Ctrl+Shift+P -> Command Palette
      if (ctrl && shift && e.key === "P") {
        e.preventDefault();
        setShowCommandPalette(true);
        return;
      }

      // Ctrl+Shift+S -> Save to Cloud
      if (ctrl && shift && e.key === "S") {
        e.preventDefault();
        if (!actor || !isLoggedIn) {
          toast.error("Login to save files to cloud");
          return;
        }
        const activeFile = openFiles.find((f) => f.id === activeFileId);
        if (!activeFile) {
          toast.error("No active file to save");
          return;
        }
        const ok = await saveCloudFile(actor, {
          name: activeFile.name,
          path: activeFile.path,
          content: activeFile.content,
          language: activeFile.language,
          lastModified: BigInt(Date.now()),
        });
        if (ok) {
          toast.success(`"${activeFile.name}" saved to cloud ☁`);
        } else {
          toast.error("Failed to save to cloud");
        }
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
      if (ctrl && !shift && e.key === "s") {
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
    openFiles,
    closeFile,
    markFileDirty,
    setShowCommandPalette,
    setShowQuickOpen,
    setShowSettings,
    splitMode,
    setSplitMode,
    addNotification,
    actor,
    isLoggedIn,
  ]);
}

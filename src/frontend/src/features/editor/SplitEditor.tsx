import type React from "react";
import { useEditorStore } from "../../stores/editorStore";
import { EditorPane } from "./EditorPane";

export const SplitEditor: React.FC = () => {
  const { splitMode, splitDirection } = useEditorStore();

  if (!splitMode) {
    return (
      <div className="flex-1 overflow-hidden">
        <EditorPane isPrimary={true} />
      </div>
    );
  }

  return (
    <div
      className={`flex-1 overflow-hidden flex ${
        splitDirection === "vertical" ? "flex-row" : "flex-col"
      }`}
    >
      <div
        className={`flex overflow-hidden ${
          splitDirection === "vertical"
            ? "flex-1 border-r border-[var(--border)]"
            : "flex-1 border-b border-[var(--border)]"
        }`}
      >
        <EditorPane isPrimary={true} />
      </div>
      <div
        className={`flex overflow-hidden ${splitDirection === "vertical" ? "flex-1" : "flex-1"}`}
      >
        <EditorPane isPrimary={false} />
      </div>
    </div>
  );
};

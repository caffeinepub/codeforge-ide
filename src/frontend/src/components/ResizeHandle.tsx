import type React from "react";

interface ResizeHandleProps {
  direction: "horizontal" | "vertical";
  onResize: (delta: number) => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  direction,
  onResize,
}) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startPos = direction === "horizontal" ? e.clientX : e.clientY;

    const onMove = (ev: MouseEvent) => {
      const currentPos = direction === "horizontal" ? ev.clientX : ev.clientY;
      onResize(currentPos - startPos);
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor =
      direction === "horizontal" ? "ew-resize" : "ns-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      className={`flex-shrink-0 group hover:bg-[var(--accent)] transition-colors
        ${direction === "horizontal" ? "w-1 cursor-ew-resize" : "h-1 cursor-ns-resize"}
      `}
      style={{ background: "var(--border)" }}
      onMouseDown={handleMouseDown}
    />
  );
};

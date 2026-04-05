import type React from "react";
import { getLanguageFromPath } from "../filesystem/mockFileSystem";

const FILE_ICONS: Record<string, { icon: string; color: string }> = {
  ts: { icon: "TS", color: "#3178c6" },
  tsx: { icon: "TSX", color: "#3178c6" },
  js: { icon: "JS", color: "#f7df1e" },
  jsx: { icon: "JSX", color: "#61dafb" },
  html: { icon: "HTM", color: "#e34c26" },
  css: { icon: "CSS", color: "#563d7c" },
  json: { icon: "{ }", color: "#cbcb41" },
  md: { icon: "MD", color: "#519aba" },
  py: { icon: "PY", color: "#3572A5" },
  mo: { icon: "MO", color: "#ff8c00" },
  sh: { icon: "SH", color: "#4EAA25" },
  yaml: { icon: "YML", color: "#cc1018" },
  yml: { icon: "YML", color: "#cc1018" },
  rs: { icon: "RS", color: "#dea584" },
  go: { icon: "GO", color: "#00add8" },
  toml: { icon: "TOM", color: "#9c4221" },
};

const FOLDER_ICON = { icon: "📁", color: "#dcb67a" };
const FOLDER_OPEN_ICON = { icon: "📂", color: "#dcb67a" };

interface FileIconProps {
  name: string;
  isFolder?: boolean;
  isOpen?: boolean;
  size?: number;
}

export const FileIcon: React.FC<FileIconProps> = ({
  name,
  isFolder = false,
  isOpen = false,
  size = 14,
}) => {
  if (isFolder) {
    const ico = isOpen ? FOLDER_OPEN_ICON : FOLDER_ICON;
    return <span style={{ fontSize: size, lineHeight: 1 }}>{ico.icon}</span>;
  }

  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const config = FILE_ICONS[ext];

  if (config) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-sm font-bold"
        style={{
          fontSize: Math.max(7, size - 4),
          color: config.color,
          backgroundColor: `${config.color}22`,
          padding: "1px 2px",
          minWidth: size,
          lineHeight: 1.2,
          letterSpacing: "-0.5px",
        }}
      >
        {config.icon}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center rounded-sm"
      style={{ fontSize: size, color: "#858585" }}
    >
      📄
    </span>
  );
};

export { getLanguageFromPath };

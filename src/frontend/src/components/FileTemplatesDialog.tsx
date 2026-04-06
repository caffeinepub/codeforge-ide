import {
  Braces,
  Code2,
  Cpu,
  FileJson,
  FileText,
  Globe,
  Hash,
  Package,
  Paintbrush,
  X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useEditorStore } from "../stores/editorStore";

interface FileTemplate {
  name: string;
  ext: string;
  icon: React.ReactNode;
  description: string;
  language: string;
  content: string;
}

const TEMPLATES: FileTemplate[] = [
  {
    name: "HTML5 Boilerplate",
    ext: "index.html",
    icon: <Globe size={18} />,
    description: "Standard HTML5 document structure with meta tags",
    language: "html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Document</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main>
    <h1>Hello, World!</h1>
  </main>
  <script src="main.js"></script>
</body>
</html>
`,
  },
  {
    name: "React Component",
    ext: "Component.tsx",
    icon: <Code2 size={18} />,
    description: "Typed React functional component with props interface",
    language: "typescriptreact",
    content: `import type React from "react";

interface ComponentProps {
  title?: string;
}

export const Component: React.FC<ComponentProps> = ({ title = "Component" }) => {
  return (
    <div className="component">
      <h2>{title}</h2>
    </div>
  );
};

export default Component;
`,
  },
  {
    name: "React Hook",
    ext: "useHook.ts",
    icon: <Hash size={18} />,
    description: "Custom React hook with state and effect",
    language: "typescript",
    content: `import { useCallback, useEffect, useState } from "react";

export function useHook(initialValue = "") {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    // side effect here
  }, [value]);

  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  return { value, setValue, reset };
}
`,
  },
  {
    name: "CSS Module",
    ext: "styles.module.css",
    icon: <Paintbrush size={18} />,
    description: "Scoped CSS module with common utility classes",
    language: "css",
    content: `.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
}

.button {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
}
`,
  },
  {
    name: "Tailwind Config",
    ext: "tailwind.config.js",
    icon: <Paintbrush size={18} />,
    description: "Tailwind CSS v3 configuration with custom theme",
    language: "javascript",
    content: `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#007acc", foreground: "#ffffff" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
`,
  },
  {
    name: "TypeScript Module",
    ext: "module.ts",
    icon: <Braces size={18} />,
    description: "TypeScript module with exports and type definitions",
    language: "typescript",
    content: `export interface Config {
  name: string;
  version: string;
  debug?: boolean;
}

const defaultConfig: Config = { name: "my-module", version: "1.0.0", debug: false };

export function init(config: Partial<Config> = {}): Config {
  return { ...defaultConfig, ...config };
}

export function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

export default { init, greet };
`,
  },
  {
    name: "Node.js Script",
    ext: "script.js",
    icon: <Package size={18} />,
    description: "Node.js ES module script with async entry point",
    language: "javascript",
    content: `#!/usr/bin/env node
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log("Starting script...");
  const data = readFileSync(join(__dirname, "input.txt"), "utf-8");
  console.log("Read", data.length, "bytes");
}

main().catch((err) => { console.error(err); process.exit(1); });
`,
  },
  {
    name: "Motoko Actor",
    ext: "main.mo",
    icon: <Cpu size={18} />,
    description: "Internet Computer Motoko actor with query/update methods",
    language: "plaintext",
    content: `import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";

actor Main {
  stable var entries : [(Text, Text)] = [];
  let store = HashMap.HashMap<Text, Text>(10, Text.equal, Text.hash);

  public query func get(key : Text) : async ?Text { store.get(key) };
  public func put(key : Text, value : Text) : async () { store.put(key, value) };
};
`,
  },
  {
    name: "README.md",
    ext: "README.md",
    icon: <FileText size={18} />,
    description: "Project README with standard sections",
    language: "markdown",
    content: `# Project Name

> Short description of your project.

## Features

- Feature 1
- Feature 2

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`bash
npm run dev
\`\`\`

## License

[MIT](LICENSE)
`,
  },
  {
    name: "JSON Config",
    ext: "config.json",
    icon: <FileJson size={18} />,
    description: "JSON configuration file with common settings",
    language: "json",
    content: `{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  },
  "dependencies": {},
  "devDependencies": {}
}
`,
  },
];

interface FileTemplatesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FileTemplatesDialog: React.FC<FileTemplatesDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { createFile } = useEditorStore();
  const [selected, setSelected] = useState<number | null>(null);
  const [customName, setCustomName] = useState("");

  if (!isOpen) return null;

  const handleCreate = (tpl: FileTemplate) => {
    const fileName = customName.trim() || tpl.ext;
    createFile({
      id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: fileName,
      path: fileName,
      content: tpl.content,
      language: tpl.language,
      isDirty: true,
    });
    onClose();
    setSelected(null);
    setCustomName("");
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      data-ocid="file_templates.modal"
    >
      <div
        className="rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          background: "var(--bg-sidebar)",
          border: "1px solid rgba(255,255,255,0.1)",
          width: 680,
          maxWidth: "95vw",
          maxHeight: "80vh",
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <h2
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              New File from Template
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Choose a template to get started
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[var(--hover-item)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            data-ocid="file_templates.close_button"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-2">
          {TEMPLATES.map((tpl, idx) => (
            <button
              type="button"
              key={tpl.name}
              className="text-left p-3 rounded-lg border transition-all flex items-start gap-3"
              style={{
                background:
                  selected === idx ? "rgba(0,122,204,0.15)" : "var(--bg-input)",
                borderColor:
                  selected === idx ? "var(--accent)" : "var(--border)",
                cursor: "pointer",
              }}
              onClick={() => {
                setSelected(idx);
                setCustomName(tpl.ext);
              }}
              onDoubleClick={() => handleCreate(tpl)}
              data-ocid={`file_templates.item.${idx + 1}`}
            >
              <span
                style={{
                  color:
                    selected === idx ? "var(--accent)" : "var(--text-muted)",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {tpl.icon}
              </span>
              <div className="min-w-0">
                <p
                  className="text-xs font-medium truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {tpl.name}
                </p>
                <p
                  className="text-[10px] mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {tpl.description}
                </p>
                <p
                  className="text-[9px] mt-1 font-mono"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {tpl.ext}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div
          className="px-5 py-3 border-t flex items-center gap-3"
          style={{ borderColor: "var(--border)" }}
        >
          <input
            type="text"
            className="flex-1 text-xs bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] rounded px-3 py-1.5 outline-none focus:border-[var(--accent)] placeholder-[var(--text-muted)]"
            placeholder="File name (optional)"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && selected !== null)
                handleCreate(TEMPLATES[selected]);
            }}
            data-ocid="file_templates.input"
          />
          <button
            type="button"
            className="px-4 py-1.5 text-xs font-medium rounded transition-colors"
            style={{
              background:
                selected !== null ? "var(--accent)" : "var(--bg-input)",
              color: selected !== null ? "#fff" : "var(--text-muted)",
              cursor: selected !== null ? "pointer" : "not-allowed",
            }}
            onClick={() =>
              selected !== null && handleCreate(TEMPLATES[selected])
            }
            disabled={selected === null}
            data-ocid="file_templates.submit_button"
          >
            Create File
          </button>
          <button
            type="button"
            className="px-4 py-1.5 text-xs font-medium rounded hover:bg-[var(--hover-item)] transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onClick={onClose}
            data-ocid="file_templates.cancel_button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

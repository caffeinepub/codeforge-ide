import { useCallback, useEffect, useRef, useState } from "react";
import type React from "react";
import { useFilesystemStore } from "../stores/filesystemStore";

// ──────────────────────────────────────────────
// Pure TypeScript terminal emulator (no external deps)
// Compatible with build environment where @xterm is unavailable
// ──────────────────────────────────────────────

const MOCK_FS: Record<string, string[]> = {
  "/workspace": [
    "src",
    "public",
    "package.json",
    "tsconfig.json",
    "vite.config.ts",
    "README.md",
    "node_modules",
    ".gitignore",
  ],
  "/workspace/src": [
    "App.tsx",
    "main.tsx",
    "index.css",
    "components",
    "stores",
    "hooks",
    "features",
  ],
  "/workspace/src/components": [
    "ActivityBar.tsx",
    "MenuBar.tsx",
    "Sidebar.tsx",
    "StatusBar.tsx",
    "BottomPanel.tsx",
    "CodeStructurePanel.tsx",
    "DatabasePanel.tsx",
  ],
  "/workspace/src/stores": [
    "editorStore.ts",
    "authStore.ts",
    "gitStore.ts",
    "themeStore.ts",
    "settingsStore.ts",
    "filesystemStore.ts",
  ],
  "/workspace/public": ["index.html", "favicon.ico"],
  "/workspace/node_modules": [
    "react",
    "react-dom",
    "vite",
    "typescript",
    "tailwindcss",
    "zustand",
  ],
};

const MOCK_FILE_CONTENTS: Record<string, string> = {
  "package.json": JSON.stringify(
    {
      name: "codeveda",
      version: "13.0.0",
      scripts: {
        dev: "vite",
        build: "tsc && vite build",
        lint: "biome check src",
        typecheck: "tsc --noEmit",
      },
    },
    null,
    2,
  ),
  "README.md":
    "# CodeVeda\n\nAI-powered collaborative cloud IDE.\nBuilt on ICP with Motoko backend.",
  ".gitignore": "node_modules/\ndist/\n.env\n*.log",
};

function stripAnsi(str: string): string {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI escape codes
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

class SimpleTerminal {
  private lines: string[] = [];
  private onOutputChange: (lines: string[]) => void;
  private cwd = "/workspace";
  private cmdHistory: string[] = [];

  constructor(onOutputChange: (lines: string[]) => void) {
    this.onOutputChange = onOutputChange;
  }

  private write(text: string) {
    const newLines = text.split(/\r?\n/);
    if (this.lines.length === 0) {
      this.lines = newLines;
    } else {
      this.lines[this.lines.length - 1] += newLines[0];
      this.lines.push(...newLines.slice(1));
    }
    if (this.lines.length > 500) this.lines = this.lines.slice(-500);
    this.onOutputChange([...this.lines]);
  }

  private writeln(text: string) {
    this.write(`${text}\n`);
  }

  prompt() {
    const dirName =
      this.cwd === "/workspace" ? "workspace" : this.cwd.split("/").pop();
    this.write(`\nuser:${dirName}$ `);
  }

  clear() {
    this.lines = [];
    this.onOutputChange([]);
    this.prompt();
  }

  processCommand(cmd: string) {
    const trimmed = cmd.trim();
    if (!trimmed) {
      this.prompt();
      return;
    }

    if (trimmed !== this.cmdHistory[0]) {
      this.cmdHistory.unshift(trimmed);
      if (this.cmdHistory.length > 50) this.cmdHistory.pop();
    }

    const parts = trimmed.split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);

    switch (command) {
      case "help": {
        this.writeln("");
        this.writeln("CodeVeda Terminal v13.0 — Available commands:");
        this.writeln("");
        const cmds = [
          ["help", "Show this help"],
          ["clear", "Clear screen"],
          ["ls [-la]", "List files"],
          ["pwd", "Print directory"],
          ["cd [path]", "Change directory"],
          ["cat [file]", "Show file contents"],
          ["echo [text]", "Print text"],
          ["mkdir [dir]", "Create directory"],
          ["touch [file]", "Create file"],
          ["whoami", "Current user"],
          ["date", "Current date"],
          ["node [-v]", "Node.js version"],
          ["npm [run|install|ls]", "Package manager"],
          ["git [status|log|diff|branch]", "Git commands"],
          ["ping [host]", "Ping host"],
          ["history", "Command history"],
        ];
        for (const [c, d] of cmds) {
          this.writeln(`  ${c.padEnd(32)} ${d}`);
        }
        break;
      }
      case "clear":
      case "cls":
        this.clear();
        return;
      case "pwd":
        this.writeln(this.cwd);
        break;
      case "ls": {
        const showLong = args.includes("-la") || args.includes("-l");
        const pathArg = args.find((a) => !a.startsWith("-"));
        const target = pathArg
          ? pathArg.startsWith("/")
            ? pathArg
            : `${this.cwd}/${pathArg}`
          : this.cwd;
        const normalized = target.replace(/\/+/g, "/").replace(/\/$/, "");
        const contents = MOCK_FS[normalized];
        if (contents) {
          this.writeln("");
          if (showLong) {
            for (const item of contents) {
              const isDir =
                !item.includes(".") ||
                MOCK_FS[`${normalized}/${item}`] !== undefined;
              this.writeln(
                `  ${isDir ? "drwxr-xr-x" : "-rw-r--r--"}  1 user user    1024 Apr  6 12:00 ${item}${isDir ? "/" : ""}`,
              );
            }
          } else {
            this.writeln(`  ${contents.join("  ")}`);
          }
        } else {
          this.writeln(
            `ls: cannot access '${pathArg || this.cwd}': No such file or directory`,
          );
        }
        break;
      }
      case "cd": {
        if (!args[0] || args[0] === "~") {
          this.cwd = "/workspace";
        } else if (args[0] === "..") {
          const parts2 = this.cwd.split("/").filter(Boolean);
          parts2.pop();
          this.cwd = parts2.length === 0 ? "/" : `/${parts2.join("/")}`;
        } else {
          const next = args[0].startsWith("/")
            ? args[0]
            : `${this.cwd}/${args[0]}`;
          const norm2 = next.replace(/\/+/g, "/").replace(/\/$/, "");
          if (MOCK_FS[norm2] !== undefined) {
            this.cwd = norm2;
          } else {
            this.writeln(`cd: ${args[0]}: No such file or directory`);
          }
        }
        break;
      }
      case "echo":
        this.writeln(args.join(" "));
        break;
      case "cat": {
        const fname = args[0];
        if (!fname) {
          this.writeln("cat: missing file operand");
          break;
        }
        const fc =
          MOCK_FILE_CONTENTS[fname] ??
          MOCK_FILE_CONTENTS[fname.split("/").pop() ?? ""];
        if (fc) {
          this.writeln(fc);
        } else {
          this.writeln(`cat: ${fname}: No such file or directory`);
        }
        break;
      }
      case "mkdir":
        if (!args[0]) {
          this.writeln("mkdir: missing operand");
        } else {
          const newPath = args[0].startsWith("/")
            ? args[0]
            : `${this.cwd}/${args[0]}`;
          MOCK_FS[newPath] = [];
          if (MOCK_FS[this.cwd]) MOCK_FS[this.cwd].push(args[0]);
          this.writeln(`Created directory: ${args[0]}`);
        }
        break;
      case "touch":
        if (!args[0]) {
          this.writeln("touch: missing operand");
        } else {
          if (MOCK_FS[this.cwd] && !MOCK_FS[this.cwd].includes(args[0])) {
            MOCK_FS[this.cwd].push(args[0]);
          }
          this.writeln(`Created: ${args[0]}`);
        }
        break;
      case "whoami":
        this.writeln("user");
        break;
      case "date":
        this.writeln(new Date().toString());
        break;
      case "uname":
        this.writeln(
          args[0] === "-a"
            ? "Linux codeveda 5.15.0 #1 SMP x86_64 GNU/Linux"
            : "Linux",
        );
        break;
      case "env":
        this.writeln(
          `USER=user\nHOME=/workspace\nNODE_ENV=development\nPWD=${this.cwd}`,
        );
        break;
      case "history":
        this.writeln("");
        this.cmdHistory
          .slice()
          .reverse()
          .forEach((h, i) => {
            this.writeln(`  ${String(i + 1).padStart(4)}  ${h}`);
          });
        break;
      case "node":
        if (args[0] === "--version" || args[0] === "-v") {
          this.writeln("v20.11.0");
        } else {
          this.writeln("Welcome to Node.js v20.11.0.");
          this.writeln('Type ".exit" to exit the REPL');
        }
        break;
      case "npm":
        if (!args[0]) {
          this.writeln(
            "npm <command>\nUsage: npm install | npm run <script> | npm ls",
          );
        } else if (args[0] === "--version" || args[0] === "-v") {
          this.writeln("10.2.4");
        } else if (args[0] === "ls") {
          this.writeln(
            "codeveda@13.0.0\n├── react@19.0.0\n├── zustand@5.0.0\n└── tailwindcss@3.4.0",
          );
        } else if (args[0] === "install" || args[0] === "i") {
          this.writeln(
            "\nnpm warn: Running in browser simulation mode\n⠋ Resolving packages...",
          );
          setTimeout(() => {
            this.writeln(`✓ Added ${args[1] || "1247 packages"} in 3.2s`);
            this.prompt();
          }, 1500);
          return;
        } else if (args[0] === "run") {
          const script = args[1] || "";
          const outputs: Record<string, string> = {
            dev: "VITE v5.4.1  ready in 842 ms\n\n  ➜  Local:   http://localhost:5173/\n  ➜  Network: http://192.168.1.100:5173/",
            build:
              "vite v5.4.1 building for production...\n✓ 1847 modules transformed.\n✓ built in 4.28s",
            lint: "✓ 0 lint errors found.",
            typecheck: "✓ No TypeScript errors found.",
          };
          if (outputs[script]) {
            setTimeout(() => {
              this.writeln(`\n> codeveda@13.0.0 ${script}\n`);
              this.writeln(outputs[script]);
              this.prompt();
            }, 600);
            return;
          }
          this.writeln(`npm error Missing script: "${script}"`);
        } else {
          this.writeln(`Unknown npm command: ${args[0]}`);
        }
        break;
      case "npx": {
        const pkg2 = args[0];
        if (!pkg2) {
          this.writeln("npx: missing package name");
        } else {
          this.writeln(`npx: Running ${pkg2}...`);
          setTimeout(() => {
            this.writeln("✓ Done.");
            this.prompt();
          }, 800);
          return;
        }
        break;
      }
      case "git": {
        const sub = args[0];
        if (!sub) {
          this.writeln(
            "usage: git <command> [<args>]\n\nCommon commands: status, log, diff, branch, checkout, add, commit, push, pull, clone, stash",
          );
        } else if (sub === "status") {
          this.writeln(
            "On branch main\nYour branch is up to date with 'origin/main'.\n\nChanges not staged for commit:\n  modified:   src/components/ActivityBar.tsx\n  modified:   src/App.tsx",
          );
        } else if (sub === "log") {
          const commits = [
            {
              sha: "a1b2c3d",
              msg: "feat: add 15 IntelliJ IDEA features",
              time: "1 hour ago",
            },
            {
              sha: "e4f5g6h",
              msg: "feat: collaboration panel with live presence",
              time: "1 day ago",
            },
            {
              sha: "i7j8k9l",
              msg: "fix: file explorer click loads content",
              time: "2 days ago",
            },
          ];
          this.writeln("");
          for (const c of commits) {
            this.writeln(`commit ${c.sha}`);
            this.writeln("Author: user");
            this.writeln(`Date:   ${c.time}\n`);
            this.writeln(`    ${c.msg}\n`);
          }
        } else if (sub === "branch") {
          this.writeln(
            "* main\n  feature/intellij-features\n  feature/collaboration",
          );
        } else if (sub === "diff") {
          this.writeln(
            "diff --git a/src/App.tsx b/src/App.tsx\n--- a/src/App.tsx\n+++ b/src/App.tsx\n@@ -1,5 +1,8 @@\n+ // IntelliJ features added",
          );
        } else if (sub === "add") {
          this.writeln(`Staged: ${args[1] || "."}`);
        } else if (sub === "commit") {
          const msgIdx = args.indexOf("-m");
          const msg =
            msgIdx >= 0
              ? args
                  .slice(msgIdx + 1)
                  .join(" ")
                  .replace(/"/g, "")
              : "";
          if (!msg) {
            this.writeln("Aborting commit due to empty commit message.");
          } else {
            this.writeln(
              `[main ${Math.random().toString(36).slice(2, 9)}] ${msg}`,
            );
            this.writeln(
              ` 1 file changed, ${Math.floor(Math.random() * 20) + 1} insertions(+)`,
            );
          }
        } else if (sub === "push") {
          setTimeout(() => {
            this.writeln(
              "Enumerating objects: 5, done.\nCounting objects: 100% (5/5), done.",
            );
            this.writeln(
              "To github.com:user/codeveda.git\n   a1b2c3d..e4f5g6h  main -> main",
            );
            this.prompt();
          }, 600);
          return;
        } else if (sub === "pull") {
          setTimeout(() => {
            this.writeln("Already up to date.");
            this.prompt();
          }, 400);
          return;
        } else if (sub === "clone") {
          const url = args[1] || "<repo>";
          setTimeout(() => {
            this.writeln(
              `Cloning into '${url.split("/").pop()?.replace(".git", "")}'...`,
            );
            this.writeln(
              "Receiving objects: 100%, done.\n✓ Cloned successfully.",
            );
            this.prompt();
          }, 900);
          return;
        } else if (sub === "stash") {
          this.writeln("Saved working directory and index state WIP on main.");
        } else if (sub === "checkout") {
          if (args[1]) this.writeln(`Switched to branch '${args[1]}'`);
          else this.writeln("error: no branch specified");
        } else {
          this.writeln(`git: '${sub}' is not a git command. See 'git --help'.`);
        }
        break;
      }
      case "ping":
        if (args[0]) {
          this.writeln(`PING ${args[0]} (127.0.0.1): 56 data bytes`);
          let count = 0;
          const iv = setInterval(() => {
            const ms = (Math.random() * 10 + 1).toFixed(3);
            this.write(`64 bytes: icmp_seq=${count} time=${ms} ms\n`);
            count++;
            if (count >= 4) {
              clearInterval(iv);
              this.writeln(`\n--- ${args[0]} ping statistics ---`);
              this.writeln("4 packets transmitted, 4 received, 0% packet loss");
              this.prompt();
            }
          }, 400);
          return;
        }
        break;
      default:
        this.writeln(`bash: ${command}: command not found`);
        this.writeln("Type 'help' for available commands");
    }

    this.prompt();
  }

  banner() {
    this.writeln("CodeVeda Terminal v13.0 — Shell Emulator");
    this.writeln("Type 'help' for available commands.\n");
    this.prompt();
  }
}

export const InteractiveTerminal: React.FC = () => {
  const [outputLines, setOutputLines] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const termRef = useRef<SimpleTerminal | null>(null);

  const scrollToBottom = useCallback(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, []);

  const handleClear = useCallback(() => {
    if (termRef.current) termRef.current.clear();
  }, []);

  useEffect(() => {
    const term = new SimpleTerminal((lines) => setOutputLines(lines));
    termRef.current = term;
    term.banner();
    setTimeout(scrollToBottom, 100);
  }, [scrollToBottom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termRef.current) return;
    const cmd = inputValue;
    // Echo the command into output
    setOutputLines((prev) => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1] += cmd;
      }
      return updated;
    });
    if (cmd.trim()) {
      setCmdHistory((prev) => [cmd, ...prev]);
    }
    setHistoryIndex(-1);
    setInputValue("");
    termRef.current.processCommand(cmd);
    setTimeout(scrollToBottom, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const newIdx = Math.min(historyIndex + 1, cmdHistory.length - 1);
      setHistoryIndex(newIdx);
      setInputValue(cmdHistory[newIdx] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const newIdx = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIdx);
      setInputValue(newIdx >= 0 ? cmdHistory[newIdx] : "");
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      handleClear();
    }
  };

  const getCwd = () => {
    // Extract cwd from last prompt line
    const lastPrompt = [...outputLines].reverse().find((l) => l.includes("$ "));
    if (lastPrompt) {
      const m = lastPrompt.match(/user:(\S+)\$/);
      if (m) return m[1];
    }
    return "workspace";
  };

  const renderLine = (line: string) => {
    // Simple ANSI stripping for display
    return stripAnsi(line);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#1e1e1e" }}>
      {/* Terminal header */}
      <div
        className="flex items-center px-3 py-1.5 border-b flex-shrink-0 gap-2"
        style={{ background: "#252526", borderColor: "#333" }}
      >
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: "#ccc" }}
        >
          Terminal
        </span>
        <span className="text-[10px]" style={{ color: "#858585" }}>
          ○ Shell Emulator
        </span>
        <div className="ml-auto flex gap-1 items-center">
          <button
            type="button"
            onClick={handleClear}
            className="px-2 py-0.5 text-[11px] rounded hover:bg-[#3a3a3a] transition-colors font-mono"
            style={{ color: "#858585" }}
          >
            clear
          </button>
        </div>
      </div>

      {/* Output area */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto p-2 font-mono text-[12px] leading-[1.5]"
        style={{
          color: "#d4d4d4",
          fontFamily: '"JetBrains Mono", Consolas, "Courier New", monospace',
        }}
        onClick={() => inputRef.current?.focus()}
        onKeyDown={() => {}}
      >
        {outputLines.map((line, i) => {
          const text = renderLine(line);
          const isPrompt = text.includes("$ ") && !text.includes("# ");
          return (
            <span
              key={`line-${i}-${line.slice(0, 8)}`}
              style={{
                color: isPrompt ? "#0dbc79" : "#d4d4d4",
                display: "inline",
                whiteSpace: "pre-wrap",
              }}
            >
              {text}
            </span>
          );
        })}
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center px-2 py-1 border-t flex-shrink-0"
        style={{ background: "#1e1e1e", borderColor: "#333" }}
      >
        <span
          className="text-[11px] font-mono mr-1 flex-shrink-0"
          style={{ color: "#0dbc79" }}
        >
          user:{getCwd()}$
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-[12px] font-mono"
          style={{
            color: "#d4d4d4",
            fontFamily: '"JetBrains Mono", Consolas, "Courier New", monospace',
          }}
          autoComplete="off"
          spellCheck={false}
          data-ocid="terminal.input"
        />
      </form>
    </div>
  );
};

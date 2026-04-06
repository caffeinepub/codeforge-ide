import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import type {
  DirectoryNode,
  FileNode,
  FileSystemTree,
} from "@webcontainer/api";
import { useCallback, useEffect, useRef, useState } from "react";
import type React from "react";
import type { FSNode } from "../features/filesystem/mockFileSystem";
import { useFilesystemStore } from "../stores/filesystemStore";

// Build WebContainer FileSystemTree from FSNode tree
function buildWebContainerFS(nodes: FSNode[]): FileSystemTree {
  const result: FileSystemTree = {};
  for (const node of nodes) {
    if (node.type === "file") {
      const fileNode: FileNode = { file: { contents: node.content ?? "" } };
      result[node.name] = fileNode;
    } else if (node.type === "folder" && node.children) {
      const dirNode: DirectoryNode = {
        directory: buildWebContainerFS(node.children),
      };
      result[node.name] = dirNode;
    }
  }
  return result;
}

// ──────────────────────────────────────────────
// Enhanced mock shell — runs when WebContainers
// are unavailable (no COOP/COEP on production).
// ──────────────────────────────────────────────
function startMockShell(term: Terminal) {
  let cwd = "/workspace";
  let buffer = "";
  let historyIndex = -1;
  const cmdHistory: string[] = [];

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
      "declarations",
    ],
    "/workspace/src/components": [
      "ActivityBar.tsx",
      "MenuBar.tsx",
      "Sidebar.tsx",
      "StatusBar.tsx",
      "BottomPanel.tsx",
      "InteractiveTerminal.tsx",
      "AIChatPanel.tsx",
      "GitHubPanel.tsx",
      "CollaborationPanel.tsx",
    ],
    "/workspace/src/stores": [
      "editorStore.ts",
      "authStore.ts",
      "gitStore.ts",
      "themeStore.ts",
      "settingsStore.ts",
      "filesystemStore.ts",
    ],
    "/workspace/src/hooks": [
      "useEditor.ts",
      "useTheme.ts",
      "useAuth.ts",
      "useFileSystem.ts",
    ],
    "/workspace/public": ["index.html", "favicon.ico"],
    "/workspace/node_modules": [
      "react",
      "react-dom",
      "vite",
      "typescript",
      "tailwindcss",
      "monaco-editor",
      "@xterm",
      "zustand",
    ],
  };

  const MOCK_FILE_CONTENTS: Record<string, string> = {
    "package.json": JSON.stringify(
      {
        name: "codeveda",
        version: "12.0.0",
        private: true,
        scripts: {
          dev: "vite",
          build: "tsc && vite build",
          preview: "vite preview",
          lint: "biome check src",
          typecheck: "tsc --noEmit",
        },
        dependencies: {
          react: "^19.0.0",
          "react-dom": "^19.0.0",
          zustand: "^5.0.0",
          "monaco-editor": "^0.52.0",
          "@xterm/xterm": "^5.5.0",
          "@webcontainer/api": "^1.3.0",
        },
      },
      null,
      2,
    ),
    "README.md":
      "# CodeVeda\n\nA next-generation AI-powered collaborative cloud IDE.\nBuilt on ICP with Motoko backend.\n\n## Features\n- Monaco Editor (VS Code engine)\n- AI Chat (ChatGPT-style)\n- GitHub Integration\n- Real-time Collaboration\n- CI/CD Pipeline\n- Cloud Storage\n",
    "tsconfig.json": JSON.stringify(
      {
        compilerOptions: {
          target: "ES2020",
          lib: ["ES2020", "DOM"],
          jsx: "react-jsx",
          strict: true,
          moduleResolution: "bundler",
        },
      },
      null,
      2,
    ),
    ".gitignore": "node_modules/\ndist/\n.env\n.env.local\n*.log\n.DS_Store\n",
    "vite.config.ts":
      'import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\n\nexport default defineConfig({\n  plugins: [react()],\n  server: {\n    headers: {\n      "Cross-Origin-Embedder-Policy": "require-corp",\n      "Cross-Origin-Opener-Policy": "same-origin",\n    },\n  },\n});\n',
  };

  const ANSI = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    gray: "\x1b[90m",
  };

  const writePrompt = () => {
    const dirName = cwd === "/workspace" ? "workspace" : cwd.split("/").pop();
    term.write(
      `\r\n${ANSI.green}user${ANSI.reset}:${ANSI.blue}${dirName}${ANSI.reset}${ANSI.bold}$${ANSI.reset} `,
    );
  };

  const processCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) {
      writePrompt();
      return;
    }

    if (trimmed !== cmdHistory[0]) {
      cmdHistory.unshift(trimmed);
      if (cmdHistory.length > 50) cmdHistory.pop();
    }
    historyIndex = -1;

    const parts = trimmed.split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);

    switch (command) {
      case "help": {
        term.writeln(
          `\r\n${ANSI.cyan}${ANSI.bold}CodeVeda Terminal${ANSI.reset} — Available commands:\n`,
        );
        const cmds = [
          ["help", "Show this help message"],
          ["clear / cls", "Clear terminal screen"],
          ["ls [-la] [path]", "List directory contents"],
          ["pwd", "Print working directory"],
          ["cd [path]", "Change directory"],
          ["cat [file]", "Print file contents"],
          ["echo [text]", "Print text to terminal"],
          ["mkdir [dir]", "Create a directory"],
          ["touch [file]", "Create an empty file"],
          ["whoami", "Current user"],
          ["date", "Current date and time"],
          ["uname", "System information"],
          ["node [-v]", "Node.js version"],
          ["npm [i|run|ls]", "Package manager commands"],
          ["npx [package]", "Run a package"],
          ["git [status|log|diff|branch|add|commit]", "Git commands"],
          ["env", "Show environment variables"],
          ["history", "Command history"],
          ["which [cmd]", "Locate a command"],
          ["ping [host]", "Ping a host"],
        ];
        for (const [c, d] of cmds) {
          term.writeln(
            `  ${ANSI.yellow}${c.padEnd(38)}${ANSI.reset}${ANSI.gray}${d}${ANSI.reset}`,
          );
        }
        break;
      }

      case "clear":
      case "cls":
        term.clear();
        break;

      case "pwd":
        term.writeln(`\r\n${cwd}`);
        break;

      case "ls": {
        const showLong =
          args.includes("-la") || args.includes("-l") || args.includes("-a");
        const pathArg = args.find((a) => !a.startsWith("-"));
        const target = pathArg
          ? pathArg.startsWith("/")
            ? pathArg
            : `${cwd}/${pathArg}`
          : cwd;
        const normalized =
          target.replace(/\/+/g, "/").replace(/\/$/, "") || "/workspace";
        const contents = MOCK_FS[normalized];
        if (contents) {
          term.writeln("");
          if (showLong) {
            term.writeln(
              `${ANSI.gray}total ${contents.length * 4}${ANSI.reset}`,
            );
            for (const item of contents) {
              const isDir =
                MOCK_FS[`${normalized}/${item}`] !== undefined ||
                !item.includes(".");
              const perm = isDir
                ? `${ANSI.blue}drwxr-xr-x${ANSI.reset}`
                : "-rw-r--r--";
              const size = isDir ? "4096" : "1024";
              const date = "Apr  6 12:00";
              const name = isDir
                ? `${ANSI.blue}${item}/${ANSI.reset}`
                : `${ANSI.white}${item}${ANSI.reset}`;
              term.writeln(
                `  ${perm}  1 user user ${size.padStart(6)} ${date} ${name}`,
              );
            }
          } else {
            const row: string[] = [];
            for (const item of contents) {
              const isDir =
                MOCK_FS[`${normalized}/${item}`] !== undefined ||
                !item.includes(".");
              row.push(
                isDir
                  ? `${ANSI.blue}${item}/${ANSI.reset}`
                  : `${ANSI.white}${item}${ANSI.reset}`,
              );
            }
            term.writeln(`  ${row.join("  ")}`);
          }
        } else {
          term.writeln(
            `\r\n${ANSI.red}ls: cannot access '${pathArg || cwd}': No such file or directory${ANSI.reset}`,
          );
        }
        break;
      }

      case "cd": {
        if (!args[0] || args[0] === "~" || args[0] === "/workspace") {
          cwd = "/workspace";
        } else if (args[0] === "-") {
          term.writeln(`\r\n${cwd}`);
        } else if (args[0] === "..") {
          const parts2 = cwd.split("/").filter(Boolean);
          parts2.pop();
          cwd = parts2.length === 0 ? "/" : `/${parts2.join("/")}`;
        } else {
          const next = args[0].startsWith("/") ? args[0] : `${cwd}/${args[0]}`;
          const normalized2 = next.replace(/\/+/g, "/").replace(/\/$/, "");
          if (MOCK_FS[normalized2] !== undefined) {
            cwd = normalized2;
          } else {
            term.writeln(
              `\r\n${ANSI.red}cd: ${args[0]}: No such file or directory${ANSI.reset}`,
            );
          }
        }
        break;
      }

      case "echo":
        term.writeln(`\r\n${args.join(" ").replace(/\$HOME/g, "/workspace")}`);
        break;

      case "cat": {
        const fileName = args[0];
        if (!fileName) {
          term.writeln(`\r\n${ANSI.red}cat: missing file operand${ANSI.reset}`);
          break;
        }
        const content =
          MOCK_FILE_CONTENTS[fileName] ??
          MOCK_FILE_CONTENTS[fileName.split("/").pop() ?? ""];
        if (content) {
          term.writeln("");
          for (const line of content.split("\n")) {
            term.writeln(line);
          }
        } else {
          term.writeln(
            `\r\n${ANSI.red}cat: ${fileName}: No such file or directory${ANSI.reset}`,
          );
        }
        break;
      }

      case "mkdir": {
        if (!args[0]) {
          term.writeln(`\r\n${ANSI.red}mkdir: missing operand${ANSI.reset}`);
        } else {
          const newPath = args[0].startsWith("/")
            ? args[0]
            : `${cwd}/${args[0]}`;
          MOCK_FS[newPath] = [];
          if (MOCK_FS[cwd]) MOCK_FS[cwd].push(args[0]);
          term.writeln(
            `\r\n${ANSI.green}Created directory: ${args[0]}${ANSI.reset}`,
          );
        }
        break;
      }

      case "touch": {
        if (!args[0]) {
          term.writeln(`\r\n${ANSI.red}touch: missing operand${ANSI.reset}`);
        } else {
          if (MOCK_FS[cwd] && !MOCK_FS[cwd].includes(args[0])) {
            MOCK_FS[cwd].push(args[0]);
          }
          term.writeln(`\r\n${ANSI.green}Created: ${args[0]}${ANSI.reset}`);
        }
        break;
      }

      case "whoami":
        term.writeln("\r\nuser");
        break;

      case "date":
        term.writeln(`\r\n${new Date().toString()}`);
        break;

      case "uname":
        if (args[0] === "-a") {
          term.writeln(
            "\r\nLinux codeveda 5.15.0-webcontainer #1 SMP x86_64 GNU/Linux",
          );
        } else {
          term.writeln("\r\nLinux");
        }
        break;

      case "env":
        term.writeln(`\r\n${ANSI.gray}USER=user${ANSI.reset}`);
        term.writeln(`${ANSI.gray}HOME=/workspace${ANSI.reset}`);
        term.writeln(
          `${ANSI.gray}PATH=/usr/local/bin:/usr/bin:/bin${ANSI.reset}`,
        );
        term.writeln(`${ANSI.gray}NODE_ENV=development${ANSI.reset}`);
        term.writeln(`${ANSI.gray}PWD=${cwd}${ANSI.reset}`);
        term.writeln(`${ANSI.gray}SHELL=/bin/bash${ANSI.reset}`);
        break;

      case "history":
        term.writeln("");
        cmdHistory
          .slice()
          .reverse()
          .forEach((h, i) => {
            term.writeln(`  ${String(i + 1).padStart(4)}  ${h}`);
          });
        break;

      case "which":
        if (args[0]) {
          const builtins = [
            "node",
            "npm",
            "npx",
            "git",
            "ls",
            "cd",
            "echo",
            "cat",
          ];
          if (builtins.includes(args[0])) {
            term.writeln(`\r\n/usr/local/bin/${args[0]}`);
          } else {
            term.writeln(
              `\r\n${ANSI.red}which: ${args[0]}: not found${ANSI.reset}`,
            );
          }
        }
        break;

      case "ping":
        if (args[0]) {
          term.writeln(
            `\r\n${ANSI.cyan}PING ${args[0]} (127.0.0.1): 56 data bytes${ANSI.reset}`,
          );
          let count = 0;
          const iv = setInterval(() => {
            const ms = (Math.random() * 10 + 1).toFixed(3);
            term.writeln(
              `64 bytes from ${args[0]}: icmp_seq=${count} ttl=64 time=${ms} ms`,
            );
            count++;
            if (count >= 4) {
              clearInterval(iv);
              term.writeln(`\r\n--- ${args[0]} ping statistics ---`);
              term.writeln("4 packets transmitted, 4 received, 0% packet loss");
              writePrompt();
            }
          }, 500);
          return;
        }
        break;

      case "node":
        if (args[0] === "--version" || args[0] === "-v") {
          term.writeln("\r\nv20.11.0");
        } else if (!args[0]) {
          term.writeln(
            `\r\n${ANSI.cyan}Welcome to Node.js v20.11.0.${ANSI.reset}`,
          );
          term.writeln(
            `${ANSI.gray}Type ".exit" to exit the REPL${ANSI.reset}`,
          );
          term.writeln("> ");
        } else {
          term.writeln(
            `\r\n${ANSI.yellow}[Node.js v20.11.0 — browser simulation]${ANSI.reset}`,
          );
        }
        break;

      case "npm":
        if (!args[0] || args[0] === "--help") {
          term.writeln(`\r\n${ANSI.cyan}npm${ANSI.reset} <command>\n`);
          term.writeln("Usage:");
          term.writeln("  npm install / i      Install all packages");
          term.writeln("  npm install <pkg>    Install a package");
          term.writeln("  npm run <script>     Run a script");
          term.writeln("  npm ls               List installed packages");
          term.writeln("  npm --version        Show npm version");
        } else if (args[0] === "--version" || args[0] === "-v") {
          term.writeln("\r\n10.2.4");
        } else if (args[0] === "ls" || args[0] === "list") {
          term.writeln(`\r\n${ANSI.cyan}codeveda@12.0.0${ANSI.reset} ${cwd}`);
          term.writeln("├── react@19.0.0");
          term.writeln("├── react-dom@19.0.0");
          term.writeln("├── zustand@5.0.0");
          term.writeln("├── monaco-editor@0.52.0");
          term.writeln("├── @xterm/xterm@5.5.0");
          term.writeln("└── @webcontainer/api@1.3.0");
        } else if (args[0] === "install" || args[0] === "i") {
          const pkg = args[1] ? ` ${ANSI.cyan}${args[1]}${ANSI.reset}` : "";
          term.writeln(
            `\r\n${ANSI.gray}npm warn${ANSI.reset} Running in browser simulation mode`,
          );
          term.writeln(`${ANSI.cyan}⠋ Resolving packages...${ANSI.reset}`);
          let step = 0;
          const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
          const iv2 = setInterval(() => {
            term.write(
              `\r${ANSI.cyan}${frames[step % frames.length]} ${step < 5 ? "Fetching" : step < 10 ? "Linking" : "Building"} packages...${ANSI.reset}`,
            );
            step++;
            if (step >= 15) {
              clearInterval(iv2);
              term.writeln(
                `\r${ANSI.green}\u2713 Added${pkg || " 1247 packages"} in 3.2s${ANSI.reset}`,
              );
              writePrompt();
            }
          }, 120);
          return;
        } else if (args[0] === "run") {
          const script = args[1] || "";
          if (script === "dev") {
            term.writeln(`\r\n${ANSI.gray}> codeveda@12.0.0 dev${ANSI.reset}`);
            term.writeln(`${ANSI.gray}> vite${ANSI.reset}\r\n`);
            setTimeout(() => {
              term.writeln(
                `  ${ANSI.green}VITE v5.4.1  ready in 842 ms${ANSI.reset}\r\n`,
              );
              term.writeln(
                `  ${ANSI.green}➜${ANSI.reset}  ${ANSI.bold}Local:${ANSI.reset}   ${ANSI.cyan}http://localhost:5173/${ANSI.reset}`,
              );
              term.writeln(
                `  ${ANSI.green}➜${ANSI.reset}  ${ANSI.bold}Network:${ANSI.reset} ${ANSI.cyan}http://192.168.1.100:5173/${ANSI.reset}`,
              );
              term.writeln(
                `  ${ANSI.green}➜${ANSI.reset}  ${ANSI.bold}press h + enter to show help${ANSI.reset}`,
              );
              writePrompt();
            }, 900);
            return;
          }
          if (script === "build") {
            term.writeln(
              `\r\n${ANSI.gray}> codeveda@12.0.0 build${ANSI.reset}`,
            );
            term.writeln(`${ANSI.gray}> tsc && vite build${ANSI.reset}\r\n`);
            setTimeout(() => {
              term.writeln(
                `${ANSI.cyan}vite v5.4.1 building for production...${ANSI.reset}`,
              );
              setTimeout(() => {
                term.writeln("✓ 1847 modules transformed.");
                term.writeln(
                  `${ANSI.gray}dist/index.html          2.31 kB│gzip: 0.90 kB${ANSI.reset}`,
                );
                term.writeln(
                  `${ANSI.gray}dist/assets/index.css   89.42 kB│gzip: 14.2 kB${ANSI.reset}`,
                );
                term.writeln(
                  `${ANSI.gray}dist/assets/index.js  2847.18 kB│gzip: 748.3 kB${ANSI.reset}`,
                );
                term.writeln(`\r\n${ANSI.green}✓ built in 4.28s${ANSI.reset}`);
                writePrompt();
              }, 1200);
            }, 300);
            return;
          }
          if (script === "lint") {
            term.writeln(`\r\n${ANSI.gray}> codeveda@12.0.0 lint${ANSI.reset}`);
            setTimeout(() => {
              term.writeln(`${ANSI.green}✓ 0 lint errors found.${ANSI.reset}`);
              writePrompt();
            }, 600);
            return;
          }
          if (script === "typecheck") {
            term.writeln(`\r\n${ANSI.gray}> tsc --noEmit${ANSI.reset}`);
            setTimeout(() => {
              term.writeln(
                `${ANSI.green}✓ No TypeScript errors found.${ANSI.reset}`,
              );
              writePrompt();
            }, 800);
            return;
          }
          term.writeln(
            `\r\n${ANSI.red}npm error Missing script: "${script}"${ANSI.reset}`,
          );
          term.writeln(
            `${ANSI.gray}Available scripts: dev, build, preview, lint, typecheck${ANSI.reset}`,
          );
        } else {
          term.writeln(
            `\r\n${ANSI.red}Unknown npm command: ${args[0]}${ANSI.reset}`,
          );
        }
        break;

      case "npx": {
        const pkg2 = args[0];
        if (!pkg2) {
          term.writeln(`\r\n${ANSI.red}npx: missing package name${ANSI.reset}`);
        } else {
          term.writeln(`\r\n${ANSI.cyan}npx: Running ${pkg2}...${ANSI.reset}`);
          setTimeout(() => {
            term.writeln(`${ANSI.green}✓ Done.${ANSI.reset}`);
            writePrompt();
          }, 800);
          return;
        }
        break;
      }

      case "git": {
        const sub = args[0];
        if (!sub || sub === "--help") {
          term.writeln(
            `\r\n${ANSI.cyan}usage: git${ANSI.reset} <command> [<args>]\n`,
          );
          term.writeln("Common commands:");
          term.writeln("  status     Show working tree status");
          term.writeln("  log        Show commit history");
          term.writeln("  diff       Show changes");
          term.writeln("  branch     List/create/delete branches");
          term.writeln("  checkout   Switch branches");
          term.writeln("  add        Stage changes");
          term.writeln("  commit     Record changes");
          term.writeln("  push       Upload local commits");
          term.writeln("  pull       Fetch and merge");
          term.writeln("  clone      Clone a repository");
          term.writeln("  stash      Stash changes");
        } else if (sub === "status") {
          term.writeln(`\r\nOn branch ${ANSI.green}main${ANSI.reset}`);
          term.writeln(
            `Your branch is up to date with '${ANSI.cyan}origin/main${ANSI.reset}'.\r\n`,
          );
          term.writeln("Changes not staged for commit:");
          term.writeln(
            `  ${ANSI.red}modified:   src/components/InteractiveTerminal.tsx${ANSI.reset}`,
          );
          term.writeln(
            `  ${ANSI.red}modified:   src/stores/editorStore.ts${ANSI.reset}`,
          );
          term.writeln(`\r\n${ANSI.yellow}Untracked files:${ANSI.reset}`);
          term.writeln(
            `  ${ANSI.red}src/features/ai/scaffoldStore.ts${ANSI.reset}`,
          );
        } else if (sub === "log") {
          const commits = [
            {
              sha: "a1b2c3d",
              msg: "feat: add AI debug mode and inline completions",
              author: "user",
              time: "2 hours ago",
            },
            {
              sha: "e4f5g6h",
              msg: "feat: collaboration panel with live presence",
              author: "user",
              time: "1 day ago",
            },
            {
              sha: "i7j8k9l",
              msg: "fix: file explorer click loads content",
              author: "user",
              time: "2 days ago",
            },
            {
              sha: "m1n2o3p",
              msg: "feat: CI/CD pipeline with visual stages",
              author: "user",
              time: "3 days ago",
            },
            {
              sha: "q4r5s6t",
              msg: "feat: social coding follow/unfollow",
              author: "user",
              time: "4 days ago",
            },
          ];
          term.writeln("");
          for (const c of commits) {
            term.writeln(`${ANSI.yellow}commit ${c.sha}${ANSI.reset}`);
            term.writeln(`Author: ${c.author}`);
            term.writeln(`Date:   ${c.time}\r\n`);
            term.writeln(`    ${c.msg}\r\n`);
          }
        } else if (sub === "diff") {
          term.writeln(
            `\r\n${ANSI.yellow}diff --git a/src/components/InteractiveTerminal.tsx b/src/components/InteractiveTerminal.tsx${ANSI.reset}`,
          );
          term.writeln(
            `${ANSI.gray}index a1b2c3d..e4f5g6h 100644${ANSI.reset}`,
          );
          term.writeln(
            `${ANSI.red}--- a/src/components/InteractiveTerminal.tsx${ANSI.reset}`,
          );
          term.writeln(
            `${ANSI.green}+++ b/src/components/InteractiveTerminal.tsx${ANSI.reset}`,
          );
          term.writeln(`${ANSI.cyan}@@ -1,5 +1,8 @@${ANSI.reset}`);
          term.writeln(
            `${ANSI.green}+ // Enhanced terminal with proper xterm.js integration${ANSI.reset}`,
          );
          term.writeln(
            `${ANSI.green}+ import { Terminal } from "@xterm/xterm";${ANSI.reset}`,
          );
          term.writeln(`  import React from "react";`);
        } else if (sub === "branch") {
          term.writeln(`\r\n${ANSI.green}* main${ANSI.reset}`);
          term.writeln("  feature/ai-debug-mode");
          term.writeln("  feature/collaboration");
          term.writeln("  fix/terminal-init");
        } else if (sub === "checkout") {
          const branch = args[1];
          if (branch) {
            term.writeln(
              `\r\n${ANSI.green}Switched to branch '${branch}'${ANSI.reset}`,
            );
          } else {
            term.writeln(
              `\r\n${ANSI.red}error: no branch specified${ANSI.reset}`,
            );
          }
        } else if (sub === "add") {
          const target = args[1] || ".";
          term.writeln(`\r\n${ANSI.green}Staged: ${target}${ANSI.reset}`);
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
            term.writeln(
              `\r\n${ANSI.red}Aborting commit due to empty commit message.${ANSI.reset}`,
            );
          } else {
            term.writeln(
              `\r\n[main ${Math.random().toString(36).slice(2, 9)}] ${msg}`,
            );
            term.writeln(
              ` 1 file changed, ${Math.floor(Math.random() * 20) + 1} insertions(+)`,
            );
          }
        } else if (sub === "push") {
          term.writeln(
            `\r\n${ANSI.gray}Enumerating objects: 5, done.${ANSI.reset}`,
          );
          term.writeln(
            `${ANSI.gray}Counting objects: 100% (5/5), done.${ANSI.reset}`,
          );
          setTimeout(() => {
            term.writeln(
              `${ANSI.gray}Writing objects: 100% (3/3), 1.23 KiB | 1.23 MiB/s, done.${ANSI.reset}`,
            );
            term.writeln(
              `${ANSI.green}To github.com:user/codeveda.git${ANSI.reset}`,
            );
            term.writeln("   a1b2c3d..e4f5g6h  main -> main");
            writePrompt();
          }, 600);
          return;
        } else if (sub === "pull") {
          term.writeln(
            `\r\n${ANSI.gray}remote: Enumerating objects: 3, done.${ANSI.reset}`,
          );
          setTimeout(() => {
            term.writeln(`${ANSI.green}Already up to date.${ANSI.reset}`);
            writePrompt();
          }, 500);
          return;
        } else if (sub === "stash") {
          term.writeln(
            `\r\n${ANSI.yellow}Saved working directory and index state WIP on main: a1b2c3d${ANSI.reset}`,
          );
        } else if (sub === "clone") {
          const repoUrl = args[1] || "<repository>";
          term.writeln(
            `\r\n${ANSI.cyan}Cloning into '${repoUrl.split("/").pop()?.replace(".git", "")}'...${ANSI.reset}`,
          );
          setTimeout(() => {
            term.writeln("remote: Enumerating objects: 100, done.");
            term.writeln("remote: Total 100 (delta 0), reused 0 (delta 0)");
            term.writeln(
              "Receiving objects: 100% (100/100), 512.00 KiB | 2.00 MiB/s, done.",
            );
            term.writeln(`${ANSI.green}✓ Cloned successfully.${ANSI.reset}`);
            writePrompt();
          }, 1000);
          return;
        } else {
          term.writeln(
            `\r\n${ANSI.red}git: '${sub}' is not a git command. See 'git --help'.${ANSI.reset}`,
          );
        }
        break;
      }

      default:
        term.writeln(
          `\r\n${ANSI.red}bash: ${command}: command not found${ANSI.reset}`,
        );
        term.writeln(
          `${ANSI.gray}Type 'help' for available commands${ANSI.reset}`,
        );
    }

    writePrompt();
  };

  // Welcome banner
  term.writeln(
    `${ANSI.cyan}${ANSI.bold}CodeVeda Terminal${ANSI.reset} ${ANSI.gray}v12.0 — Shell Emulator${ANSI.reset}`,
  );
  term.writeln(
    `${ANSI.gray}WebContainers unavailable (requires Cross-Origin-Isolation headers).${ANSI.reset}`,
  );
  term.writeln(
    `${ANSI.gray}Type ${ANSI.reset}${ANSI.yellow}help${ANSI.reset}${ANSI.gray} for available commands.${ANSI.reset}`,
  );
  writePrompt();

  // Input handler with arrow key history support
  term.onData((data) => {
    if (data === "\r") {
      term.write("\r\n");
      processCommand(buffer);
      buffer = "";
    } else if (data === "\x7f" || data === "\b") {
      if (buffer.length > 0) {
        buffer = buffer.slice(0, -1);
        term.write("\b \b");
      }
    } else if (data === "\x0c") {
      term.clear();
      buffer = "";
    } else if (data === "\x1b[A") {
      // Arrow up — history
      if (cmdHistory.length > 0) {
        historyIndex = Math.min(historyIndex + 1, cmdHistory.length - 1);
        const prev = cmdHistory[historyIndex] ?? "";
        term.write("\r\x1b[K");
        const dirName =
          cwd === "/workspace" ? "workspace" : cwd.split("/").pop();
        term.write(
          `${ANSI.green}user${ANSI.reset}:${ANSI.blue}${dirName}${ANSI.reset}${ANSI.bold}$${ANSI.reset} ${prev}`,
        );
        buffer = prev;
      }
    } else if (data === "\x1b[B") {
      // Arrow down — history
      historyIndex = Math.max(historyIndex - 1, -1);
      const next = historyIndex >= 0 ? cmdHistory[historyIndex] : "";
      term.write("\r\x1b[K");
      const dirName2 =
        cwd === "/workspace" ? "workspace" : cwd.split("/").pop();
      term.write(
        `${ANSI.green}user${ANSI.reset}:${ANSI.blue}${dirName2}${ANSI.reset}${ANSI.bold}$${ANSI.reset} ${next ?? ""}`,
      );
      buffer = next ?? "";
    } else if (data >= " ") {
      buffer += data;
      term.write(data);
    }
  });
}

// ──────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────
export const InteractiveTerminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [_wcReady, setWcReady] = useState(false);
  const [status, setStatus] = useState<"booting" | "webcontainer" | "shell">(
    "booting",
  );

  const handleClear = useCallback(() => {
    termRef.current?.clear();
  }, []);

  useEffect(() => {
    if (!terminalRef.current) return;
    let disposed = false;

    const term = new Terminal({
      theme: {
        background: "#1e1e1e",
        foreground: "#d4d4d4",
        cursor: "#d4d4d4",
        selectionBackground: "#264f78",
        black: "#000000",
        red: "#cd3131",
        green: "#0dbc79",
        yellow: "#e5e510",
        blue: "#2472c8",
        magenta: "#bc3fbc",
        cyan: "#11a8cd",
        white: "#e5e5e5",
        brightBlack: "#666666",
        brightRed: "#f14c4c",
        brightGreen: "#23d18b",
        brightYellow: "#f5f543",
        brightBlue: "#3b8eea",
        brightMagenta: "#d670d6",
        brightCyan: "#29b8db",
        brightWhite: "#e5e5e5",
      },
      fontFamily:
        '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, monospace',
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      allowTransparency: true,
      convertEol: true,
      scrollback: 5000,
    });

    termRef.current = term;

    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());
    term.open(terminalRef.current);

    // Fit after a short delay to ensure DOM is ready
    const fitTimer = setTimeout(() => {
      try {
        fitAddon.fit();
      } catch (_) {
        /* ignore */
      }
    }, 50);

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        try {
          fitAddon.fit();
        } catch (_) {
          /* ignore */
        }
      });
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    async function tryWebContainer() {
      try {
        term.writeln("\r\n\x1b[36mBooting WebContainer environment...\x1b[0m");

        // Dynamic import to avoid build errors if COOP/COEP headers aren't available
        const { WebContainer } = await import("@webcontainer/api");
        const wc = await WebContainer.boot();
        if (disposed) return;

        const { fileTree } = useFilesystemStore.getState();
        const fsMount = buildWebContainerFS(fileTree);
        await wc.mount(fsMount);

        term.writeln(
          "\x1b[32m✓ WebContainer ready! Real Node.js terminal active.\x1b[0m",
        );
        term.writeln(
          "\x1b[90mYour project files have been mounted.\x1b[0m\r\n",
        );

        setWcReady(true);
        setStatus("webcontainer");

        const shell = await wc.spawn("jsh", {
          terminal: { cols: term.cols, rows: term.rows },
        });

        shell.output.pipeTo(
          new WritableStream({
            write(data) {
              term.write(data);
            },
          }),
        );

        const input = shell.input.getWriter();
        term.onData((data) => input.write(data));
        term.onResize(({ cols, rows }) => {
          try {
            shell.resize({ cols, rows });
          } catch (_) {
            /* ignore */
          }
        });
      } catch (err) {
        if (disposed) return;
        const errMsg = (err as Error).message?.slice(0, 100) ?? "Unknown error";
        term.writeln(
          `\r\n\x1b[33m⚠ WebContainer unavailable:\x1b[0m \x1b[90m${errMsg}\x1b[0m`,
        );
        term.writeln(
          "\x1b[36mFalling back to enhanced shell emulator...\x1b[0m\r\n",
        );
        setStatus("shell");
        startMockShell(term);
      }
    }

    tryWebContainer();

    return () => {
      disposed = true;
      clearTimeout(fitTimer);
      resizeObserver.disconnect();
      term.dispose();
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Terminal header */}
      <div className="flex items-center px-3 py-1.5 border-b border-[#333] bg-[#252526] flex-shrink-0 gap-2">
        <span className="text-[11px] font-semibold text-[#cccccc] uppercase tracking-wider">
          Terminal
        </span>
        <span className="text-[10px] ml-1">
          {status === "booting" && (
            <span className="text-[#e5e510] animate-pulse">● Booting...</span>
          )}
          {status === "webcontainer" && (
            <span className="text-[#0dbc79]">
              ● WebContainer (Real Node.js)
            </span>
          )}
          {status === "shell" && (
            <span className="text-[#858585]">○ Shell Emulator</span>
          )}
        </span>
        <div className="ml-auto flex gap-1 items-center">
          <button
            type="button"
            onClick={handleClear}
            title="Clear Terminal (Ctrl+L)"
            className="px-2 py-0.5 text-[11px] text-[#858585] hover:text-white rounded hover:bg-[#3a3a3a] transition-colors font-mono"
          >
            clear
          </button>
          <button
            type="button"
            onClick={() => termRef.current?.dispose()}
            title="Close Terminal"
            className="p-1 text-[#858585] hover:text-white rounded hover:bg-[#3a3a3a] transition-colors text-sm leading-none"
            data-ocid="terminal.button"
          >
            ×
          </button>
        </div>
      </div>
      {/* Terminal body */}
      <div ref={containerRef} className="flex-1 overflow-hidden p-1">
        <div ref={terminalRef} className="h-full w-full" />
      </div>
    </div>
  );
};

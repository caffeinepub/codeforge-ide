// Terminal packages loaded dynamically to avoid build failures when not installed
import type {
  DirectoryNode,
  FileNode,
  FileSystemTree,
  WebContainerProcess,
} from "@webcontainer/api";
import type { FitAddon as FitAddonType } from "@xterm/addon-fit";
import type { WebLinksAddon as WebLinksAddonType } from "@xterm/addon-web-links";
import type { Terminal } from "@xterm/xterm";
import { useCallback, useEffect, useRef, useState } from "react";
import type React from "react";

// Use a helper that bypasses rollup static analysis
const _dynamicImport = (pkg: string): Promise<any> => {
  // biome-ignore lint: dynamic import bypass
  return new Function("m", "return import(m)")(pkg) as Promise<any>;
};

async function loadTerminalModules() {
  try {
    const [xtermMod, fitMod, webLinksMod] = await Promise.all([
      _dynamicImport("@xterm/xterm"),
      _dynamicImport("@xterm/addon-fit"),
      _dynamicImport("@xterm/addon-web-links"),
    ]);
    return {
      Terminal: xtermMod.Terminal as typeof Terminal,
      FitAddon: fitMod.FitAddon as typeof FitAddonType,
      WebLinksAddon: webLinksMod.WebLinksAddon as typeof WebLinksAddonType,
      available: true,
    };
  } catch {
    return {
      Terminal: null,
      FitAddon: null,
      WebLinksAddon: null,
      available: false,
    };
  }
}
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

// Enhanced mock shell for fallback when WebContainers aren't available
function startMockShell(term: Terminal) {
  let cwd = "/workspace";
  let buffer = "";

  const MOCK_FS: Record<string, string[]> = {
    "/workspace": [
      "src",
      "public",
      "package.json",
      "tsconfig.json",
      "vite.config.js",
      "README.md",
      "node_modules",
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
    ],
    "/workspace/src/stores": [
      "editorStore.ts",
      "authStore.ts",
      "gitStore.ts",
      "themeStore.ts",
      "settingsStore.ts",
    ],
  };

  const MOCK_FILE_CONTENTS: Record<string, string> = {
    "package.json": JSON.stringify(
      {
        name: "codeveda",
        version: "4.0.0",
        private: true,
        scripts: {
          dev: "vite",
          build: "tsc && vite build",
          preview: "vite preview",
        },
        dependencies: { react: "^19.0.0", "react-dom": "^19.0.0" },
      },
      null,
      2,
    ),
    "README.md":
      "# CodeVeda\n\nA VS Code-like browser IDE for the Internet Computer.\n",
    "tsconfig.json": JSON.stringify(
      {
        compilerOptions: {
          target: "ES2020",
          lib: ["ES2020", "DOM"],
          jsx: "react-jsx",
          strict: true,
        },
      },
      null,
      2,
    ),
  };

  const writePrompt = () => {
    term.write("\r\n\x1b[32m$ \x1b[0m");
  };

  const processCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) {
      writePrompt();
      return;
    }

    const parts = trimmed.split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);

    switch (command) {
      case "help":
        term.writeln("\r\n\x1b[36mAvailable commands:\x1b[0m");
        term.writeln("  \x1b[33mhelp\x1b[0m           Show this help");
        term.writeln("  \x1b[33mclear\x1b[0m          Clear terminal");
        term.writeln("  \x1b[33mls [path]\x1b[0m      List directory contents");
        term.writeln("  \x1b[33mpwd\x1b[0m            Print working directory");
        term.writeln("  \x1b[33mcd [path]\x1b[0m      Change directory");
        term.writeln("  \x1b[33mecho [text]\x1b[0m    Echo text");
        term.writeln("  \x1b[33mcat [file]\x1b[0m     Print file contents");
        term.writeln("  \x1b[33mnode --version\x1b[0m Node.js version");
        term.writeln("  \x1b[33mnpm --version\x1b[0m  npm version");
        term.writeln(
          "  \x1b[33mnpm install\x1b[0m    Install packages (simulated)",
        );
        term.writeln(
          "  \x1b[33mnpm run dev\x1b[0m    Start dev server (simulated)",
        );
        term.writeln("  \x1b[33mgit status\x1b[0m     Show git status");
        term.writeln("  \x1b[33mgit log\x1b[0m        Show commit history");
        term.writeln("  \x1b[33mdate\x1b[0m           Current date/time");
        term.writeln("  \x1b[33mwhoami\x1b[0m         Current user");
        break;

      case "clear":
        term.clear();
        break;

      case "pwd":
        term.writeln(`\r\n${cwd}`);
        break;

      case "ls": {
        const target = args[0]
          ? args[0].startsWith("/")
            ? args[0]
            : `${cwd}/${args[0]}`
          : cwd;
        const normalized =
          target.replace(/\/+/g, "/").replace(/\/$/, "") || "/workspace";
        const contents = MOCK_FS[normalized];
        if (contents) {
          term.writeln("");
          for (const item of contents) {
            if (item.includes(".")) {
              term.writeln(`  \x1b[37m${item}\x1b[0m`);
            } else {
              term.writeln(`  \x1b[34m${item}/\x1b[0m`);
            }
          }
        } else {
          term.writeln(
            `\r\n\x1b[31mls: ${args[0] || cwd}: No such file or directory\x1b[0m`,
          );
        }
        break;
      }

      case "cd": {
        if (!args[0] || args[0] === "~") {
          cwd = "/workspace";
        } else if (args[0] === "..") {
          const parts2 = cwd.split("/").filter(Boolean);
          parts2.pop();
          cwd = parts2.length === 0 ? "/" : `/${parts2.join("/")}`;
        } else {
          const next = args[0].startsWith("/") ? args[0] : `${cwd}/${args[0]}`;
          const normalized2 = next.replace(/\/+/g, "/");
          if (MOCK_FS[normalized2] !== undefined) {
            cwd = normalized2;
          } else {
            term.writeln(
              `\r\n\x1b[31mcd: ${args[0]}: No such file or directory\x1b[0m`,
            );
          }
        }
        break;
      }

      case "echo":
        term.writeln(`\r\n${args.join(" ")}`);
        break;

      case "cat": {
        const fileName = args[0];
        if (!fileName) {
          term.writeln("\r\n\x1b[31mcat: missing file operand\x1b[0m");
          break;
        }
        const content = MOCK_FILE_CONTENTS[fileName];
        if (content) {
          term.writeln("");
          for (const line of content.split("\n")) {
            term.writeln(line);
          }
        } else {
          term.writeln(
            `\r\n\x1b[31mcat: ${fileName}: No such file or directory\x1b[0m`,
          );
        }
        break;
      }

      case "whoami":
        term.writeln("\r\nuser");
        break;

      case "date":
        term.writeln(`\r\n${new Date().toString()}`);
        break;

      case "node":
        if (args[0] === "--version" || args[0] === "-v") {
          term.writeln("\r\nv20.11.0");
        } else {
          term.writeln(
            "\r\n\x1b[33mNode.js v20.11.0 (browser simulation)\x1b[0m",
          );
        }
        break;

      case "npm":
        if (args[0] === "--version" || args[0] === "-v") {
          term.writeln("\r\n10.2.4");
        } else if (args[0] === "install" || args[0] === "i") {
          term.writeln("\r\n\x1b[36m⠋ Resolving packages...\x1b[0m");
          setTimeout(() => {
            term.writeln("\x1b[36m⠙ Fetching packages...\x1b[0m");
            setTimeout(() => {
              term.writeln("\x1b[36m⠹ Linking packages...\x1b[0m");
              setTimeout(() => {
                term.writeln("\x1b[32m\r\nadded 1247 packages in 23s\x1b[0m");
                term.writeln(
                  "\x1b[90m47 packages are looking for funding\x1b[0m",
                );
                term.writeln("\x1b[90m  run npm fund for details\x1b[0m");
                writePrompt();
              }, 600);
            }, 500);
          }, 400);
          return;
        } else if (args[0] === "run" && args[1] === "dev") {
          term.writeln("\r\n\x1b[90m> codeveda@4.0.0 dev\x1b[0m");
          term.writeln("\x1b[90m> vite\x1b[0m");
          term.writeln("");
          setTimeout(() => {
            term.writeln("\x1b[32m  VITE v5.4.1  ready in 1204 ms\x1b[0m");
            term.writeln("");
            term.writeln(
              "  \x1b[32m➜\x1b[0m  \x1b[1mLocal:\x1b[0m   \x1b[36mhttp://localhost:5173/\x1b[0m",
            );
            term.writeln(
              "  \x1b[32m➜\x1b[0m  \x1b[1mNetwork:\x1b[0m \x1b[36mhttp://192.168.1.100:5173/\x1b[0m",
            );
            term.writeln(
              "  \x1b[32m➜\x1b[0m  \x1b[1mpress h + enter\x1b[0m to show help",
            );
            writePrompt();
          }, 800);
          return;
        } else if (args[0] === "run" && args[1] === "build") {
          term.writeln("\r\n\x1b[90m> codeveda@4.0.0 build\x1b[0m");
          term.writeln("\x1b[90m> tsc && vite build\x1b[0m");
          term.writeln("");
          setTimeout(() => {
            term.writeln(
              "\x1b[32mvite v5.4.1 building for production...\x1b[0m",
            );
            term.writeln("\x1b[32m✓ 1247 modules transformed.\x1b[0m");
            term.writeln("\x1b[90mdist/index.html             1.23 kB\x1b[0m");
            term.writeln(
              "\x1b[90mdist/assets/index-Dz7kXp.js  847.32 kB\x1b[0m",
            );
            term.writeln("\x1b[32m✓ built in 4.23s\x1b[0m");
            writePrompt();
          }, 1200);
          return;
        } else {
          term.writeln(
            `\r\n\x1b[31mnpm: unknown command '${args.join(" ")}' \x1b[0m`,
          );
        }
        break;

      case "git": {
        const sub = args[0];
        if (sub === "status") {
          term.writeln("\r\nOn branch main");
          term.writeln("Your branch is up to date with 'origin/main'.");
          term.writeln("");
          term.writeln("\x1b[32mnothing to commit, working tree clean\x1b[0m");
        } else if (sub === "log") {
          const commits = [
            {
              hash: "a1b2c3d",
              msg: "feat: real terminal + file system access",
              date: "2 hours ago",
            },
            {
              hash: "e4f5g6h",
              msg: "feat: GitHub integration panel",
              date: "5 hours ago",
            },
            {
              hash: "i7j8k9l",
              msg: "feat: user profile panel",
              date: "1 day ago",
            },
            {
              hash: "m1n2o3p",
              msg: "fix: mobile layout improvements",
              date: "2 days ago",
            },
          ];
          term.writeln("");
          for (const c of commits) {
            term.writeln(`\x1b[33mcommit ${c.hash}\x1b[0m`);
            term.writeln(`Date:    ${c.date}`);
            term.writeln(`    ${c.msg}`);
            term.writeln("");
          }
        } else if (sub === "add") {
          term.writeln(
            `\r\n\x1b[32mStaged changes${args[1] === "." ? " (all files)" : `: ${args[1]}`}\x1b[0m`,
          );
        } else if (sub === "branch") {
          term.writeln("\r\n\x1b[32m* main\x1b[0m");
          term.writeln("  develop");
          term.writeln("  feature/phase-5");
        } else if (sub === "push") {
          term.writeln("\r\nEnumerating objects: 15, done.");
          term.writeln("Counting objects: 100% (15/15), done.");
          term.writeln(
            "\x1b[32mTo https://github.com/user/codeveda.git\x1b[0m",
          );
          term.writeln("   a1b2c3d..e4f5g6h  main -> main");
        } else if (sub === "pull") {
          term.writeln("\r\nAlready up to date.");
        } else if (sub === "commit") {
          const mFlag = args.indexOf("-m");
          const msg =
            mFlag >= 0
              ? args
                  .slice(mFlag + 1)
                  .join(" ")
                  .replace(/^"|"$/g, "")
              : "";
          if (!msg) {
            term.writeln(
              "\r\n\x1b[31mAborting commit due to empty commit message.\x1b[0m",
            );
          } else {
            term.writeln(`\r\n[main a1b2c3d] ${msg}`);
            term.writeln(" 1 file changed, 1 insertion(+)");
          }
        } else {
          term.writeln(
            `\r\n\x1b[31mgit: '${sub}' is not a git command. See 'git --help'.\x1b[0m`,
          );
        }
        break;
      }

      default:
        term.writeln(`\r\n\x1b[31mcommand not found: ${command}\x1b[0m`);
        term.writeln("\x1b[90mType 'help' to see available commands\x1b[0m");
    }

    writePrompt();
  };

  // Initial prompt
  writePrompt();

  // Handle character-by-character input
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
      writePrompt();
    } else if (data >= " ") {
      buffer += data;
      term.write(data);
    }
  });
}

export const InteractiveTerminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddonType | null>(null);
  const [wcReady, setWcReady] = useState(false);

  const handleClear = useCallback(() => {
    termRef.current?.clear();
  }, []);

  useEffect(() => {
    if (!terminalRef.current) return;
    let disposed = false;

    async function initTerminal() {
      const mods = await loadTerminalModules();
      if (
        !mods.available ||
        !mods.Terminal ||
        !mods.FitAddon ||
        !mods.WebLinksAddon
      ) {
        // Packages not available — fall back to mock shell only
        return;
      }
      if (!terminalRef.current || disposed) return;

      const term = new mods.Terminal({
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
        },
        fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", monospace',
        fontSize: 13,
        lineHeight: 1.4,
        cursorBlink: true,
        allowTransparency: true,
        convertEol: true,
      });

      termRef.current = term;

      const fitAddon = new mods.FitAddon();
      fitAddonRef.current = fitAddon;
      term.loadAddon(fitAddon);
      term.loadAddon(new mods.WebLinksAddon());
      term.open(terminalRef.current);

      requestAnimationFrame(() => {
        try {
          fitAddon.fit();
        } catch (_) {
          // ignore fit errors
        }
      });

      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          try {
            fitAddon.fit();
          } catch (_) {
            // ignore
          }
        });
      });

      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      async function boot() {
        try {
          term.writeln(
            "\r\n\x1b[36mBooting WebContainer environment...\x1b[0m",
          );
          const { WebContainer } = await _dynamicImport("@webcontainer/api");
          const wc = await WebContainer.boot();
          if (disposed) return;

          const { fileTree } = useFilesystemStore.getState();
          const fsMount = buildWebContainerFS(fileTree);
          await wc.mount(fsMount);

          term.writeln(
            "\x1b[32m\u2713 WebContainer ready! Real terminal active.\x1b[0m",
          );
          term.writeln(
            "\x1b[90mYour project files have been mounted.\x1b[0m\r\n",
          );

          setWcReady(true);

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
              // ignore resize errors
            }
          });
        } catch (err) {
          if (disposed) return;
          const errMsg =
            (err as Error).message?.slice(0, 120) ?? "Unknown error";
          term.writeln(
            `\r\n\x1b[33m\u26a0 WebContainer unavailable:\x1b[0m \x1b[90m${errMsg}\x1b[0m`,
          );
          term.writeln(
            "\x1b[36mFalling back to enhanced shell emulator...\x1b[0m",
          );
          term.writeln(
            "\x1b[90mNote: Real WebContainers need Cross-Origin-Isolation headers.\x1b[0m",
          );
          startMockShell(term);
        }
      }

      boot();
    }

    initTerminal();

    return () => {
      disposed = true;
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      <div className="flex items-center px-3 py-1 border-b border-[#333] bg-[#252526] flex-shrink-0 gap-2">
        <span className="text-[11px] font-semibold text-[#cccccc] uppercase tracking-wider">
          Terminal
        </span>
        <span className="text-[10px] ml-1">
          {wcReady ? (
            <span className="text-[#0dbc79]">● WebContainer (Real)</span>
          ) : (
            <span className="text-[#858585]">○ Shell Emulator</span>
          )}
        </span>
        <div className="ml-auto flex gap-1">
          <button
            type="button"
            onClick={handleClear}
            title="Clear Terminal"
            className="p-1 text-[#858585] hover:text-white rounded hover:bg-[#3a3a3a] transition-colors text-sm leading-none"
            data-ocid="terminal.button"
          >
            \u00d7
          </button>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 overflow-hidden p-1">
        <div ref={terminalRef} className="h-full w-full" />
      </div>
    </div>
  );
};

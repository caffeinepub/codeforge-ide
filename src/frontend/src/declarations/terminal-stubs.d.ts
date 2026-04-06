// Type stubs for optional terminal packages that may not be installed.
// These are used in InteractiveTerminal.tsx for the real terminal feature.
// When the packages are available, these stubs are overridden by the actual types.

declare module "@xterm/xterm" {
  export interface ITerminalOptions {
    theme?: Record<string, string>;
    fontFamily?: string;
    fontSize?: number;
    cursorBlink?: boolean;
    convertEol?: boolean;
    rows?: number;
    cols?: number;
    [key: string]: unknown;
  }
  export interface IDisposable {
    dispose(): void;
  }
  export interface IResizeEvent {
    cols: number;
    rows: number;
  }
  export class Terminal {
    constructor(options?: ITerminalOptions);
    open(element: HTMLElement): void;
    write(data: string): void;
    writeln(data: string): void;
    onData(listener: (data: string) => void): IDisposable;
    onResize(listener: (event: IResizeEvent) => void): IDisposable;
    dispose(): void;
    loadAddon(addon: unknown): void;
    rows: number;
    cols: number;
    clear(): void;
    reset(): void;
    focus(): void;
    scrollToBottom(): void;
    attachCustomKeyEventHandler(handler: (e: KeyboardEvent) => boolean): void;
  }
}

declare module "@xterm/xterm/css/xterm.css" {
  const content: string;
  export default content;
}

declare module "@xterm/addon-fit" {
  export class FitAddon {
    activate(terminal: unknown): void;
    fit(): void;
    dispose(): void;
    proposeDimensions(): { cols: number; rows: number } | undefined;
  }
}

declare module "@xterm/addon-web-links" {
  export class WebLinksAddon {
    constructor(handler?: (event: MouseEvent, uri: string) => void);
    activate(terminal: unknown): void;
    dispose(): void;
  }
}

declare module "@webcontainer/api" {
  export interface FileSystemTree {
    [key: string]: FileNode | DirectoryNode;
  }
  export interface FileNode {
    file: {
      contents: string | Uint8Array;
    };
  }
  export interface DirectoryNode {
    directory: FileSystemTree;
  }
  export interface WebContainerProcess {
    output: ReadableStream<string>;
    input: WritableStream<string>;
    exit: Promise<number>;
    kill(): void;
    resize(dimensions: { cols: number; rows: number }): void;
  }
  export interface SpawnOptions {
    cwd?: string;
    env?: Record<string, string>;
    terminal?: { cols: number; rows: number };
    output?: boolean;
  }
  export interface WebContainerInstance {
    spawn(command: string, args?: string[] | SpawnOptions, options?: SpawnOptions): Promise<WebContainerProcess>;
    fs: {
      writeFile(path: string, data: string | Uint8Array): Promise<void>;
      readFile(path: string, encoding?: string): Promise<string | Uint8Array>;
      mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
    };
    mount(files: FileSystemTree): Promise<void>;
    on(event: string, listener: (...args: unknown[]) => void): void;
    teardown(): void;
  }
  export const WebContainer: {
    boot(): Promise<WebContainerInstance>;
  };
}

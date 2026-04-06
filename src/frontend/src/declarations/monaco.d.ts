// Ambient type declarations for @monaco-editor/react
// These allow TypeScript to compile without the actual package installed
declare module "@monaco-editor/react" {
  import type * as Monaco from "monaco-editor";
  import type React from "react";

  export interface EditorProps {
    height?: string | number;
    width?: string | number;
    language?: string;
    theme?: string;
    value?: string;
    defaultValue?: string;
    options?: Record<string, unknown>;
    onChange?: (value: string | undefined) => void;
    onMount?: (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => void;
    loading?: React.ReactNode;
    className?: string;
  }

  const Editor: React.FC<EditorProps>;
  export default Editor;
  export { Editor };
}

declare module "monaco-editor" {
  export namespace editor {
    interface IStandaloneCodeEditor {
      getValue(): string;
      setValue(value: string): void;
      getModel(): ITextModel | null;
      onDidChangeCursorPosition(listener: (e: ICursorPositionChangedEvent) => void): IDisposable;
      focus(): void;
      dispose(): void;
      updateOptions(options: Record<string, unknown>): void;
      layout(dimension?: IDimension): void;
      addAction(descriptor: IActionDescriptor): IDisposable;
    }

    interface ITextModel {
      getValue(): string;
      setValue(value: string): void;
    }

    interface ICursorPositionChangedEvent {
      position: IPosition;
    }

    interface IPosition {
      lineNumber: number;
      column: number;
    }

    interface IDimension {
      width: number;
      height: number;
    }

    interface IDisposable {
      dispose(): void;
    }

    interface IActionDescriptor {
      id: string;
      label: string;
      keybindings?: number[];
      run: (editor: IStandaloneCodeEditor) => void | Promise<void>;
    }
  }

  export namespace KeyCode {
    const KEY_S: number;
    const KEY_N: number;
    const BackSlash: number;
  }

  export namespace KeyMod {
    const CtrlCmd: number;
    const Shift: number;
    const Alt: number;
    function chord(firstPart: number, secondPart: number): number;
  }
}

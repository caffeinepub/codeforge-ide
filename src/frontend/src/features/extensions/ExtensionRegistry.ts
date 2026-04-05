// TODO Phase 2: Plugin system
// This registry will allow third-party extensions to register themselves
// and provide capabilities like language support, themes, commands, etc.

export interface Extension {
  id: string;
  name: string;
  version: string;
  description?: string;
  activate?: () => void;
  deactivate?: () => void;
}

export class ExtensionRegistry {
  private extensions: Map<string, Extension> = new Map();

  register(extension: Extension): void {
    // TODO Phase 2: Validate extension, handle conflicts, call activate()
    this.extensions.set(extension.id, extension);
  }

  getAll(): Extension[] {
    return Array.from(this.extensions.values());
  }

  getById(id: string): Extension | undefined {
    return this.extensions.get(id);
  }

  unregister(id: string): void {
    // TODO Phase 2: Call deactivate() before removing
    this.extensions.delete(id);
  }

  has(id: string): boolean {
    return this.extensions.has(id);
  }
}

export const extensionRegistry = new ExtensionRegistry();

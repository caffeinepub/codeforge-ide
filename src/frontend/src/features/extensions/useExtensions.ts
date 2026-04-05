// TODO Phase 2: Load active extensions
// This hook will provide access to all loaded extensions
// and their contributed commands, themes, and language features.

import { extensionRegistry } from "./ExtensionRegistry";
import type { Extension } from "./ExtensionRegistry";

export function useExtensions(): Extension[] {
  // TODO Phase 2: Subscribe to extension registry changes
  // TODO Phase 2: Load extensions from localStorage or canister
  return extensionRegistry.getAll();
}

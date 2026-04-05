import { create } from "zustand";
import type { FSNode } from "../features/filesystem/mockFileSystem";
import { MOCK_FILE_TREE } from "../features/filesystem/mockFileSystem";

interface FilesystemStore {
  fileTree: FSNode[];
  selectedFileId: string | null;
  expandedFolders: Set<string>;
  contextMenuNodeId: string | null;
  renamingNodeId: string | null;
  // Actions
  setSelectedFile: (id: string | null) => void;
  toggleFolder: (id: string) => void;
  setFolderExpanded: (id: string, expanded: boolean) => void;
  renameNode: (id: string, newName: string) => void;
  deleteNode: (id: string) => void;
  addFile: (parentId: string | null, name: string, content?: string) => FSNode;
  addFolder: (parentId: string | null, name: string) => FSNode;
  setContextMenuNode: (id: string | null) => void;
  setRenamingNode: (id: string | null) => void;
}

function collectExpanded(
  nodes: FSNode[],
  result: Set<string> = new Set(),
): Set<string> {
  for (const node of nodes) {
    if (node.type === "folder" && node.isExpanded) {
      result.add(node.id);
    }
    if (node.children) collectExpanded(node.children, result);
  }
  return result;
}

function generateId(): string {
  return `node_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function deleteNodeFromTree(nodes: FSNode[], id: string): FSNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => ({
      ...n,
      children: n.children ? deleteNodeFromTree(n.children, id) : undefined,
    }));
}

function renameNodeInTree(
  nodes: FSNode[],
  id: string,
  newName: string,
): FSNode[] {
  return nodes.map((n) => {
    if (n.id === id) {
      const pathParts = n.path.split("/");
      pathParts[pathParts.length - 1] = newName;
      return { ...n, name: newName, path: pathParts.join("/") };
    }
    return {
      ...n,
      children: n.children
        ? renameNodeInTree(n.children, id, newName)
        : undefined,
    };
  });
}

function addNodeToParent(
  nodes: FSNode[],
  parentId: string | null,
  newNode: FSNode,
): FSNode[] {
  if (parentId === null) {
    return [...nodes, newNode];
  }
  return nodes.map((n) => {
    if (n.id === parentId) {
      return {
        ...n,
        children: [...(n.children ?? []), newNode],
        isExpanded: true,
      };
    }
    return {
      ...n,
      children: n.children
        ? addNodeToParent(n.children, parentId, newNode)
        : undefined,
    };
  });
}

function findNodeById(nodes: FSNode[], id: string): FSNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findNodeById(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

export const useFilesystemStore = create<FilesystemStore>((set, get) => ({
  fileTree: MOCK_FILE_TREE,
  selectedFileId: null,
  expandedFolders: collectExpanded(MOCK_FILE_TREE),
  contextMenuNodeId: null,
  renamingNodeId: null,

  setSelectedFile: (id) => set({ selectedFileId: id }),

  toggleFolder: (id) =>
    set((state) => {
      const expanded = new Set(state.expandedFolders);
      if (expanded.has(id)) {
        expanded.delete(id);
      } else {
        expanded.add(id);
      }
      return {
        expandedFolders: expanded,
        fileTree: state.fileTree.map((n) =>
          updateExpanded(n, id, expanded.has(id)),
        ),
      };
    }),

  setFolderExpanded: (id, expanded) =>
    set((state) => {
      const set_ = new Set(state.expandedFolders);
      if (expanded) set_.add(id);
      else set_.delete(id);
      return {
        expandedFolders: set_,
        fileTree: state.fileTree.map((n) => updateExpanded(n, id, expanded)),
      };
    }),

  renameNode: (id, newName) =>
    set((state) => ({
      fileTree: renameNodeInTree(state.fileTree, id, newName),
      renamingNodeId: null,
    })),

  deleteNode: (id) =>
    set((state) => ({
      fileTree: deleteNodeFromTree(state.fileTree, id),
      selectedFileId: state.selectedFileId === id ? null : state.selectedFileId,
    })),

  addFile: (parentId, name, content = "") => {
    const tree = get().fileTree;
    let parentPath = "";
    if (parentId) {
      const parent = findNodeById(tree, parentId);
      parentPath = parent?.path ?? "";
    }
    const newNode: FSNode = {
      id: generateId(),
      name,
      path: parentPath ? `${parentPath}/${name}` : name,
      type: "file",
      language: "plaintext",
      content,
    };
    set((state) => ({
      fileTree: addNodeToParent(state.fileTree, parentId, newNode),
    }));
    return newNode;
  },

  addFolder: (parentId, name) => {
    const tree = get().fileTree;
    let parentPath = "";
    if (parentId) {
      const parent = findNodeById(tree, parentId);
      parentPath = parent?.path ?? "";
    }
    const newNode: FSNode = {
      id: generateId(),
      name,
      path: parentPath ? `${parentPath}/${name}` : name,
      type: "folder",
      children: [],
      isExpanded: true,
    };
    set((state) => ({
      fileTree: addNodeToParent(state.fileTree, parentId, newNode),
    }));
    return newNode;
  },

  setContextMenuNode: (id) => set({ contextMenuNodeId: id }),
  setRenamingNode: (id) => set({ renamingNodeId: id }),
}));

function updateExpanded(node: FSNode, id: string, expanded: boolean): FSNode {
  if (node.id === id) return { ...node, isExpanded: expanded };
  return {
    ...node,
    children: node.children
      ? node.children.map((c) => updateExpanded(c, id, expanded))
      : undefined,
  };
}

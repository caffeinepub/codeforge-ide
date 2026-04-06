import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CodeFile {
    content: string;
    name: string;
    path: string;
    lastModified: bigint;
    language: string;
}
export interface Bookmark {
    filePath: string;
    lineNumber: bigint;
    annotation: string;
    timestamp: bigint;
}
export interface ProjectMetadata {
    projectName: string;
    projectDescription: string;
    lastOpened: bigint;
}
export interface UserProfile {
    bio: string;
    preferredLanguage: string;
    displayName: string;
    avatarColor: string;
}
export interface CodeSnippet {
    code: string;
    name: string;
    tags: Array<string>;
    description: string;
    language: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBookmark(bookmark: Bookmark): Promise<void>;
    addCodeSnippet(snippet: CodeSnippet): Promise<void>;
    addToSessionHistory(filePath: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearSessionHistory(): Promise<void>;
    deleteBookmark(timestamp: bigint): Promise<void>;
    deleteFile(path: string): Promise<void>;
    deleteProject(name: string): Promise<void>;
    deleteSnippet(name: string): Promise<void>;
    getAllBookmarks(): Promise<Array<Bookmark>>;
    getAllFiles(): Promise<Array<CodeFile>>;
    getAllProjects(): Promise<Array<ProjectMetadata>>;
    getAllSnippets(): Promise<Array<CodeSnippet>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCodeSnippet(name: string): Promise<CodeSnippet | null>;
    getEditorSettings(): Promise<string | null>;
    getFile(path: string): Promise<CodeFile | null>;
    getProject(name: string): Promise<ProjectMetadata | null>;
    getScratchPad(): Promise<string | null>;
    getSessionHistory(): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveEditorSettings(settings: string): Promise<void>;
    saveFile(file: CodeFile): Promise<void>;
    saveProject(project: ProjectMetadata): Promise<void>;
    saveScratchPad(text: string): Promise<void>;
    saveUserProfile(profile: UserProfile): Promise<void>;
}

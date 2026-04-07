import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CodeSnippet {
    code: string;
    name: string;
    tags: Array<string>;
    description: string;
    language: string;
}
export interface UserPresence {
    principal: Principal;
    displayName: string;
    avatarColor: string;
    lastHeartbeat: bigint;
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
export interface CollabEvent {
    principal: Principal;
    kind: CollabEventKind;
    timestamp: bigint;
    sessionId: string;
}
export interface CodeFile {
    content: string;
    name: string;
    path: string;
    lastModified: bigint;
    language: string;
}
export interface Session {
    id: string;
    participants: Array<Principal>;
    createdAt: bigint;
}
export interface PipelineStage {
    status: PipelineStageStatus;
    startedAt?: bigint;
    duration?: bigint;
    logs: string;
    name: string;
}
export interface PipelineRun {
    id: string;
    stages: Array<PipelineStage>;
    status: PipelineRunStatus;
    branch: string;
    createdAt: bigint;
    triggeredBy: string;
    projectId: string;
    commitHash: string;
}
export interface DeploymentRecord {
    id: string;
    status: DeploymentStatus;
    deployedAt: bigint;
    version: string;
    projectId: string;
    environment: string;
    pipelineRunId: string;
}
export interface UserProfile {
    bio: string;
    preferredLanguage: string;
    displayName: string;
    avatarColor: string;
}
export type SessionResult = {
    __kind__: "ok";
    ok: Session;
} | {
    __kind__: "err";
    err: string;
};
export enum CollabEventKind {
    join = "join",
    leave = "leave"
}
export enum DeploymentStatus {
    success = "success",
    failed = "failed"
}
export enum PipelineRunStatus {
    pending = "pending",
    failed = "failed",
    running = "running",
    passed = "passed"
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
    completePipelineRun(runId: string, overallStatus: PipelineRunStatus): Promise<void>;
    createPipelineRun(projectId: string, commitHash: string, branch: string, triggeredBy: string): Promise<PipelineRun>;
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
    getDeploymentHistory(projectId: string, limit: bigint): Promise<Array<DeploymentRecord>>;
    getEditorSettings(): Promise<string | null>;
    getFile(path: string): Promise<CodeFile | null>;
    getOnlineUsers(sessionId: string): Promise<Array<UserPresence>>;
    getPipelineRunDetail(runId: string): Promise<PipelineRun | null>;
    getPipelineRuns(projectId: string, limit: bigint): Promise<Array<PipelineRun>>;
    getProject(name: string): Promise<ProjectMetadata | null>;
    getScratchPad(): Promise<string | null>;
    getSessionEvents(sessionId: string, limit: bigint): Promise<Array<CollabEvent>>;
    getSessionHistory(): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    joinSession(sessionId: string): Promise<SessionResult>;
    leaveSession(sessionId: string): Promise<boolean>;
    recordDeployment(projectId: string, environment: string, pipelineRunId: string, version: string): Promise<DeploymentRecord>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveEditorSettings(settings: string): Promise<void>;
    saveFile(file: CodeFile): Promise<void>;
    saveProject(project: ProjectMetadata): Promise<void>;
    saveScratchPad(text: string): Promise<void>;
    saveUserProfile(profile: UserProfile): Promise<void>;
    updatePipelineStage(runId: string, stageName: string, status: PipelineStageStatus, duration: bigint | null, logs: string): Promise<void>;
    updatePresenceHeartbeat(sessionId: string): Promise<boolean>;
}

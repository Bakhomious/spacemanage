export enum FolderType {
  FRONTEND = "fe",
  BACKEND = "be"
}

export type FolderConfig = {
  dirPath: string;
  command: string;
  type: FolderType;
}

export type WorkspaceConfig = {
  workspace: string,
  folders: Record<string, FolderConfig>;
}
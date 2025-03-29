export enum FolderType {
  FRONTEND = "fe",
  BACKEND = "be"
}

export const DirectoryTypeChoices = [
  {
    name: "Frontend",
    value: FolderType.FRONTEND
  },
  {
    name: "Backend",
    value: FolderType.BACKEND
  }
];

export type DirectoryConfig = {
  command: string;
  cleanCommand: string;
  type: FolderType;
}

export type WorkspaceConfig = {
  dirPath: string,
  directories: Record<string, DirectoryConfig>;
}
import { RUN, CLEAN } from "./constants"

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

const VALID_RUN_MODES = [RUN, CLEAN] as const;

export type RunMode = (typeof VALID_RUN_MODES)[number];
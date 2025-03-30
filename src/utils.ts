import fs from "fs";
import crypto from "crypto";
import {
  CONFIG_FILE,
  CONFIG_FOLDER,
  CONFIG_HASH_PLACEHOLDER,
  DIRECTORY_FLAG,
  SKIP,
  USAGE,
} from "./constants";
import path from "path";
import chalk from "chalk";
import { modePriority } from "./types";

export const handleExit = () => {
  console.info("Exiting gracefully.");
  process.exit(0);
};

export function checkConfigDir(): void {
  if (!fs.existsSync(CONFIG_FOLDER)) {
    console.warn(
      `Did not find a config folder. Initializing: ${CONFIG_FOLDER}`
    );
    fs.mkdirSync(CONFIG_FOLDER, { recursive: true });
  }
}

function generateWorkspaceHash(dirPath: string): string {
  return crypto.createHash("sha256").update(dirPath).digest("hex").slice(0, 12);
}

export function getWorkspaceConfigPath(dirPath: string): string {
  const hash = generateWorkspaceHash(dirPath);
  const configFilePath = CONFIG_FILE.replace(CONFIG_HASH_PLACEHOLDER, hash);
  return configFilePath;
}

export function findWorkspaceRootConfigFile(startDir: string): string {
  const workspaceDir = path.dirname(startDir);
  const workspaceConfig = getWorkspaceConfigPath(workspaceDir);
  if (fs.existsSync(workspaceConfig)) {
    return workspaceConfig;
  } else {
    throw new Error(
      chalk.red(
        `Could not find config file for the workspace ${workspaceDir}. Define a workspace by using "spacemanage init"`
      )
    );
  }
}

export function normalizePath(dirPath: string): string {
  const normalized = path.resolve(dirPath.replace(/\/$/, ""));
  return normalized;
}

export function getDirectoryPathFromFlag(args: string[]): string {
  const dirIndex = args.indexOf(DIRECTORY_FLAG);
  if (dirIndex !== -1 && dirIndex + 1 < args.length) {
    return args[dirIndex + 1];
  } else {
    return process.cwd();
  }
}

export function getSkippedDirectories(args: string[]): Set<string> {
  const skipIndex = args.indexOf(SKIP);
  const skippedDirs = skipIndex !== -1 
    ? new Set(args.slice(skipIndex + 1))
    : new Set<string>();
  if (skippedDirs.size === 0) {
    console.error(chalk.red(`Skip flag passed with no directories. \n \t ${USAGE}`))
    process.exit(0);
  }
  return skippedDirs;
}

export function determineModes(args: string[]): Array<string> {
  const modeIndexes = args
    .map((arg, index) => (modePriority.includes(arg) ? index : -1))
    .filter((index) => index !== -1);

  const modes: Set<string> = new Set(modeIndexes.map((index) => args[index]));
  const modesToRun: Array<string> = Array.from(modes).sort(
    (a, b) => modePriority.indexOf(a) - modePriority.indexOf(b)
  );

  return modesToRun;
}

import fs from "fs";
import crypto from "crypto";
import { CONFIG_FILE, CONFIG_FOLDER, CONFIG_HASH_PLACEHOLDER } from "./constants";
import path from "path";
import chalk from "chalk";

export const handleExit = () => {
  console.info("Exiting gracefully.");
  process.exit(0);
};

export function checkConfigDir(): void {
  if (!fs.existsSync(CONFIG_FOLDER)) {
    console.warn(`Did not find a config folder. Initializing: ${CONFIG_FOLDER}`);
    fs.mkdirSync(CONFIG_FOLDER, { recursive: true });
  }
}

function generateWorkspaceHash(dirPath: string): string {
  return crypto.createHash("sha256")
    .update(dirPath)
    .digest("hex")
    .slice(0, 12);
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
    throw new Error(chalk.red(`Could not find config file for the workspace ${workspaceDir}. Define a workspace by using "spacemanage init"`));
  }
}

export function normalizePath(dirPath: string): string {
  const normalized = path.resolve(dirPath.replace(/\/$/, ''));
  return normalized;
}
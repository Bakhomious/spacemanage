#!/usr/bin/env node
import process from "process";
import chalk from "chalk";

import { USAGE, INIT, SKIP } from "./constants.js";
import { initWorkspace, runWorkspaceSequentially, runWorkspaceWithSkip } from "./commands.js";
import {
  checkConfigDir,
  determineModes,
  getDirectoryPathFromFlag,
  getSkippedDirectories,
  handleExit,
} from "./utils.js";
import { RunMode } from "./types.js";

async function main(): Promise<void> {
  checkConfigDir();

  const args: string[] = process.argv.slice(2);
  const command: string = args[0] as string;

  const dirPath: string = getDirectoryPathFromFlag(args);
  const modes: Array<string> = determineModes(args);
  const skippedDirectories: Set<string> = modes.includes(SKIP)
    ? getSkippedDirectories(args)
    : new Set<string>();

  if (command === INIT) {
    if (modes.length > 0) {
      console.warn(chalk.yellow(`Skipping modes: ${modes}`));
    }
    initWorkspace(dirPath).catch((error) => {
      if (error.name === "ExitPromptError") {
        handleExit();
      } else {
        console.error(chalk.red(`${error}`));
      }
    });
  } else {
    if (modes.length === 0) {
      console.log(USAGE);
      process.exit(1);
    }

    await runWorkspaceSequentially(dirPath, skippedDirectories, modes);
  }
}

main().catch((err) => {
  console.error(chalk.red(`Unexpected error: ${err}`));
  process.exit(1);
});
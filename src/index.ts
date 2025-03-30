#!/usr/bin/env node
import process from "process";
import chalk from "chalk";

import { USAGE, INIT, SKIP } from "./constants";
import { initWorkspace, runWorkspaceWithSkip } from "./commands";
import {
  checkConfigDir,
  determineModes,
  getDirectoryPathFromFlag,
  getSkippedDirectories,
  handleExit,
} from "./utils";
import { RunMode } from "./types";

checkConfigDir();

const args: string[] = process.argv.slice(2);
const command: string = args[0];

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
  process.exit(0);
}

if (modes.length === 0) {
  console.log(USAGE);
  process.exit(1);
}

modes.forEach((mode) => {
  runWorkspaceWithSkip(dirPath, skippedDirectories, mode as RunMode);
});

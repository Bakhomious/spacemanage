#!/usr/bin/env node
import path from 'path';
import process from 'process';
import { USAGE, INIT, RUN } from './constants'
import { initWorkspace, runWorkspace } from './commands';
import { checkConfigDir, handleExit, normalizePath } from './utils';
import chalk from 'chalk';

checkConfigDir();

const args: string[] = process.argv.slice(2);
const command: string = args[0];
const dirPath = args[1] ? normalizePath(args[1]) : null;

switch(command) {
  case INIT:
    initWorkspace(dirPath).catch((error) => {
      if(error.name === 'ExitPromptError') {
        handleExit();
      } else {
        console.error(chalk.red(`${error}`));
      }
    });
    break;
  case RUN:
    runWorkspace(dirPath, RUN);
    break;
  default:
    console.log(USAGE);
}
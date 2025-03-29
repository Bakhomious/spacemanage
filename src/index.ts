#!/usr/bin/env node
import path from 'path';
import process from 'process';
import { USAGE, INIT, RUN, CLEAN } from './constants'
import { initWorkspace, runWorkspace } from './commands';
import { checkConfigDir, handleExit, normalizePath } from './utils';
import chalk from 'chalk';

checkConfigDir();

const args: string[] = process.argv.slice(2);
const command: string = args[0];

let dirPath:string = process.cwd();

const dirIndex = args.indexOf("-d");
if(dirIndex !== -1 && dirIndex + 1 < args.length) {
  dirPath = args[dirIndex + 1];
}

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
  case CLEAN:
    runWorkspace(dirPath, CLEAN);
    break;
  default:
    console.log(USAGE);
    process.exit(1);
}
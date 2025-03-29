#!/usr/bin/env node
import path from 'path';
import { USAGE, INIT } from './constants'
import { FolderType, WorkspaceConfig } from './types'
import { initWorkspace } from './commands';

const args: string[] = process.argv.slice(2);
const command: string = args[0];

switch(command) {
  case INIT:
    const dirPath = args[1];
    initWorkspace(dirPath);
    console.log(dirPath);
    break;
  default:
    console.log(USAGE);
}